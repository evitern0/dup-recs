import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App.jsx';
import { GroupManagementPage } from '../../src/pages/GroupManagementPage.jsx';

let navigateMock = vi.fn();
let authState = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('../../src/hooks/useAuth.jsx', () => ({
  useAuth: () => authState
}));

describe('Group management flow', () => {
  beforeEach(() => {
    navigateMock = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}

      disconnect() {}

      unobserve() {}
    });
    authState = {
      session: {
        user: { username: 'sam' },
        activeGroupId: null,
        groups: []
      },
      apiRequest: vi.fn(async () => ({ posts: [], members: [], groups: [] })),
      refreshMemberships: vi.fn(async () => ({ groups: [] })),
      setActiveGroupId: vi.fn(),
      logout: vi.fn()
    };
  });

  it('renders memberships and create/join actions on the management page', () => {
    authState.session.groups = [
      { id: 'group-1', name: 'Alpha Club' },
      { id: 'group-2', name: 'Beta Club' }
    ];

    render(
      <MemoryRouter initialEntries={['/groups']}>
        <GroupManagementPage onSelectGroup={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alpha Club')).toBeTruthy();
    expect(screen.getByText('Beta Club')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create group' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Join with invite' })).toBeTruthy();
  });

  it('opens a selected group timeline from the management page', () => {
    authState.session.groups = [{ id: 'group-1', name: 'Alpha Club' }];
    const onSelectGroup = vi.fn();

    render(
      <MemoryRouter initialEntries={['/groups']}>
        <GroupManagementPage onSelectGroup={onSelectGroup} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Alpha Club' }));

    expect(authState.setActiveGroupId).toHaveBeenCalledWith('group-1');
    expect(onSelectGroup).toHaveBeenCalledWith('group-1');
    expect(navigateMock).toHaveBeenCalledWith('/app');
  });

  it('routes a user with exactly one group to the timeline after login', async () => {
    authState.session.groups = [{ id: 'group-1', name: 'Alpha Club' }];
    authState.session.activeGroupId = 'group-1';

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Viewing Alpha Club')).toBeTruthy();
    expect(screen.queryByText('My profile')).toBeNull();
    expect(screen.getByRole('button', { name: 'sam' })).toBeTruthy();
  });

  it('routes a user with multiple groups to management after login', () => {
    authState.session.groups = [
      { id: 'group-1', name: 'Alpha Club' },
      { id: 'group-2', name: 'Beta Club' }
    ];

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Your groups')).toBeTruthy();
  });

  it('routes a user with no groups to management after login', () => {
    authState.session.groups = [];

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Your groups')).toBeTruthy();
  });
});

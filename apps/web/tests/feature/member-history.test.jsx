import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MemberProfilePage } from '../../src/pages/MemberProfilePage.jsx';

vi.mock('../../src/hooks/useAuth.js', () => ({
  useAuth: () => ({
    apiRequest: async () => ({ user: { username: 'demo' }, posts: [] })
  })
}));

describe('MemberProfilePage', () => {
  it('renders without crashing inside a router', () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={['/users/demo']}>
          <MemberProfilePage />
        </MemoryRouter>
      )
    ).not.toThrow();
  });
});

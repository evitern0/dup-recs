import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GroupMemberList } from '../../src/components/groups/GroupMemberList.jsx';

describe('GroupMemberList', () => {
  it('renders member links', () => {
    render(
      <MemoryRouter>
        <GroupMemberList members={[{ id: '1', username: 'sam' }]} />
      </MemoryRouter>
    );

    expect(screen.getByText('sam')).toBeTruthy();
  });
});

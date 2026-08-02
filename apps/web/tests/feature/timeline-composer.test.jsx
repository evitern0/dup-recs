import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewRecComposer } from '../../src/components/timeline/NewRecComposer.jsx';

describe('NewRecComposer', () => {
  it('renders the search and description controls', () => {
    render(<NewRecComposer onSearch={async () => []} onSubmit={async () => {}} searchResults={[]} />);

    expect(screen.getByText('New Rec')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search by album title or artist name')).toBeTruthy();
  });
});

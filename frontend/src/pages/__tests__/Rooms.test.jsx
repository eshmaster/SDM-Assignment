import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Rooms from '../Rooms';
import api from '../../api/client';

describe('Rooms page', () => {
  it('renders rooms from API', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { rooms: [{ id: 1, name: 'Room', status: 'available' }] } });
    render(
      <MemoryRouter>
        <Rooms />
      </MemoryRouter>
    );
    expect(await screen.findByText('Room')).toBeInTheDocument();
  });
});

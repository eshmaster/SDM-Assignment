import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import BookingForm from '../BookingForm';
import api from '../../api/client';

describe('BookingForm', () => {
  beforeEach(() => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { rooms: [{ id: 1, name: 'Test', price: 100 }] } });
    vi.spyOn(api, 'post').mockResolvedValue({ data: { booking: {} } });
  });

  it('validates date ordering', async () => {
    render(
      <MemoryRouter initialEntries={['/bookings/new']}>
        <BookingForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: '2024-01-10' } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: '2024-01-12' } });
    fireEvent.click(screen.getByText('Refresh availability'));
    await screen.findByText('Test');
    fireEvent.change(screen.getByLabelText('Select room'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: '2024-01-09' } });
    fireEvent.click(screen.getByText('Submit reservation request'));
    await waitFor(() => screen.getByText(/after check-in/i));
  });
});

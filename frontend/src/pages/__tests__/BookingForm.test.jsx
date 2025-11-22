import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BookingForm from '../BookingForm';
import api from '../../api/client';

describe('BookingForm', () => {
  beforeEach(() => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { rooms: [{ id: 1, name: 'Test', price: 100 }] } });
    vi.spyOn(api, 'post').mockResolvedValue({ data: { booking: {} } });
  });

  it('validates date ordering', async () => {
    render(<BookingForm />);
    await screen.findByText('Test');
    fireEvent.change(screen.getByLabelText('Room'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: '2024-01-10' } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: '2024-01-09' } });
    fireEvent.click(screen.getByText('Create Booking'));
    await waitFor(() => screen.getByText(/after check-in/i));
  });
});

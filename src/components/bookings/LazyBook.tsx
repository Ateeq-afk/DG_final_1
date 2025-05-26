import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewBookingForm from './NewBookingForm';
import BookingFormSkeleton from './BookingFormSkeleton';
import { useBookings } from '@/hooks/useBookings';

const LazyBook = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { createBooking } = useBookings();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <BookingFormSkeleton />;

  return (
    <NewBookingForm
      onClose={() => navigate('/dashboard/bookings')}
      onSubmit={async (data) => {
        try {
          const booking = await createBooking(data);
          return booking;
        } catch (error) {
          console.error('Error creating booking:', error);
          throw error;
        }
      }}
    />
  );
};

export default LazyBook;
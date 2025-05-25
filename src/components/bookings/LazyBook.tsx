import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewBookingForm from './NewBookingForm';
import BookingFormSkeleton from './BookingFormSkeleton';

const LazyBook = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          const booking = {
            id: Math.random().toString(36).substring(2, 15),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'booked',
          };
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

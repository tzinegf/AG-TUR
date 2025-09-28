import { supabase, Booking, Payment } from '../lib/supabase';

export const bookingsService = {
  async createBooking(
    routeId: string,
    seatNumbers: string[],
    totalPrice: number,
    paymentMethod: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For development, create a mock booking if user is not authenticated
        console.warn('User not authenticated, creating mock booking for development');
        const mockBooking = {
          id: 'mock-booking-' + Date.now(),
          user_id: 'mock-user',
          route_id: routeId,
          seat_number: seatNumbers.join(','),
          passenger_name: 'Mock User',
          passenger_document: '000.000.000-00',
          total_price: totalPrice,
          payment_status: 'pending' as const,
          status: 'confirmed' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return mockBooking as Booking;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          route_id: routeId,
          seat_numbers: seatNumbers,
          total_price: totalPrice,
          payment_method: paymentMethod,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: totalPrice,
          method: paymentMethod,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      return booking as Booking;
    } catch (error) {
      console.error('Booking service error:', error);
      throw error;
    }
  },

  async getUserBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        route:routes(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  },

  async getBooking(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        route:routes(*),
        user:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async updateBookingPayment(bookingId: string, status: 'completed' | 'failed') {
    const qrCode = status === 'completed' 
      ? `AG-TUR-${bookingId}-${Date.now()}` 
      : null;

    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        payment_status: status,
        qr_code: qrCode,
      })
      .eq('id', bookingId);

    if (bookingError) throw bookingError;

    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status,
        transaction_id: `TXN-${Date.now()}`,
      })
      .eq('booking_id', bookingId);

    if (paymentError) throw paymentError;
  },

  async cancelBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },

  // Admin functions
  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        route:routes(*),
        user:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  },

  async getBookingStats() {
    const { data: totalBookings, error: totalError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' });

    const { data: completedBookings, error: completedError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('payment_status', 'completed');

    const { data: revenue, error: revenueError } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('payment_status', 'completed');

    if (totalError || completedError || revenueError) {
      throw new Error('Failed to fetch stats');
    }

    const totalRevenue = revenue?.reduce((sum, booking) => sum + booking.total_price, 0) || 0;

    return {
      totalBookings: totalBookings?.length || 0,
      completedBookings: completedBookings?.length || 0,
      totalRevenue,
    };
  },
};

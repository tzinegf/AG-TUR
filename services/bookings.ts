import { supabase, Booking, Payment } from '../lib/supabase';

export const bookingsService = {
  async createBooking(
    routeId: string,
    seatNumbers: string[],
    totalPrice: number,
    paymentMethod: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

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

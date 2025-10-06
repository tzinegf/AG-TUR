import { supabase, BusRoute } from '../lib/supabase';

const isDev = process.env.NODE_ENV !== 'production';

function fallbackRoutes(): BusRoute[] {
  const now = Date.now();
  const mk = (
    id: string,
    origin: string,
    destination: string,
    hours: number,
    price: number,
    bus_type: string,
    company = 'AG TUR'
  ): BusRoute => ({
    id,
    origin,
    destination,
    departure: new Date(now + 60 * 60 * 1000).toISOString(),
    arrival: new Date(now + (60 * 60 * 1000) + hours * 60 * 60 * 1000).toISOString(),
    price,
    bus_company: company,
    bus_type,
    amenities: ['ar_condicionado', 'wifi', 'tomadas'],
    duration: `${hours}h`,
    status: 'active',
    created_at: new Date(now).toISOString(),
  });
  return [
    mk('00000000-0000-0000-0000-000000000001', 'São Paulo', 'Rio de Janeiro', 6, 120.0, 'leito'),
    mk('00000000-0000-0000-0000-000000000002', 'Rio de Janeiro', 'Belo Horizonte', 7, 110.0, 'semi-leito'),
    mk('00000000-0000-0000-0000-000000000003', 'Curitiba', 'São Paulo', 6, 100.0, 'executivo'),
  ];
}

export const busRoutesService = {
  async searchRoutes(origin: string, destination: string, date: Date) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('origin', origin)
        .eq('destination', destination)
        .order('departure', { ascending: true });

      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        departure: r.departure ?? r.departure_time,
        arrival: r.arrival ?? r.arrival_time,
      })) as BusRoute[];
    } catch (error: any) {
      console.error('Error searching routes (dev fallback may apply):', error);
      if (isDev) {
        const all = fallbackRoutes();
        const dateISO = date.toISOString().slice(0, 10);
        return all.filter(
          (r) => r.origin === origin && r.destination === destination && r.departure.slice(0, 10) >= dateISO
        );
      }
      throw error;
    }
  },

  async getRoute(id: string) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BusRoute;
    } catch (error) {
      console.error('Error fetching route by id (dev fallback may apply):', error);
      if (isDev) {
        const fallback = fallbackRoutes().find((r) => r.id === id);
        if (fallback) return fallback;
      }
      throw error;
    }
  },

  async getPopularRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('departure', { ascending: true })
        .limit(10);

      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        departure: r.departure ?? r.departure_time,
        arrival: r.arrival ?? r.arrival_time,
      })) as BusRoute[];
    } catch (error: any) {
      console.error('Error fetching popular routes (dev fallback may apply):', error);
      if (isDev) {
        return fallbackRoutes();
      }
      throw error;
    }
  },

  // Admin functions
  async createRoute(route: Omit<BusRoute, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('routes')
      .insert(route)
      .select()
      .single();

    if (error) {
      console.error('Error creating route:', error);
      throw error;
    }
    return data as BusRoute;
  },

  async updateRoute(id: string, updates: Partial<BusRoute>) {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating route:', error);
      throw error;
    }
    return data as BusRoute;
  },

  async deleteRoute(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
    return data as BusRoute;
  },

  // Get all routes for admin
  async getAllRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('departure', { ascending: true });

      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        departure: r.departure ?? r.departure_time,
        arrival: r.arrival ?? r.arrival_time,
      })) as BusRoute[];
    } catch (error: any) {
      console.error('Erro ao carregar rotas (aplicando fallback em dev):', error);
      if (isDev) {
        return fallbackRoutes();
      }
      throw error;
    }
  },
};

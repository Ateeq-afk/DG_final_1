import { ReportType, ReportPeriod, ReportFormat } from '@/components/reports/ReportGenerator';
import type { Booking } from '@/types';

interface ReportOptions {
  type: ReportType;
  period: ReportPeriod;
  format: ReportFormat;
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string[];
    branch?: string[];
    paymentType?: string[];
  };
  bookings: Booking[];
  organizationId: string;
}

export async function generateReport(options: ReportOptions) {
  const { type, period, bookings } = options;

  // Filter bookings based on date range
  const filteredBookings = filterBookingsByPeriod(bookings, period, options.filters);

  // Generate report data based on type
  switch (type) {
    case 'bookings':
      return generateBookingReport(filteredBookings);
    case 'deliveries':
      return generateDeliveryReport(filteredBookings);
    case 'revenue':
      return generateRevenueReport(filteredBookings);
    case 'performance':
      return generatePerformanceReport(filteredBookings);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

function filterBookingsByPeriod(
  bookings: Booking[],
  period: ReportPeriod,
  filters?: ReportOptions['filters']
) {
  const now = new Date();
  let startDate: Date;
  let endDate = now;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'this_week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'last_week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'custom':
      if (!filters?.startDate) throw new Error('Start date is required for custom period');
      startDate = new Date(filters.startDate);
      endDate = filters?.endDate ? new Date(filters.endDate) : now;
      break;
    default:
      startDate = new Date(0); // All time
  }

  return bookings.filter(booking => {
    const bookingDate = new Date(booking.created_at);
    return bookingDate >= startDate && bookingDate <= endDate;
  });
}

function generateBookingReport(bookings: Booking[]) {
  // Calculate summary statistics
  const totalBookings = bookings.length;
  const delivered = bookings.filter(b => b.status === 'delivered').length;
  const inTransit = bookings.filter(b => b.status === 'in_transit').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Generate daily trends
  const trends = generateDailyTrends(bookings);

  return {
    totalBookings,
    delivered,
    inTransit,
    totalRevenue,
    trends,
    bookings: bookings.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  };
}

function generateDeliveryReport(bookings: Booking[]) {
  const deliveredBookings = bookings.filter(b => b.status === 'delivered');
  const totalDeliveries = deliveredBookings.length;
  
  // Calculate on-time vs delayed deliveries (mock data for now)
  const onTimeDeliveries = Math.floor(totalDeliveries * 0.85);
  const delayedDeliveries = totalDeliveries - onTimeDeliveries;
  const averageDeliveryTime = 24; // Mock value
  const successRate = totalDeliveries ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

  // Generate trends data
  const trends = generateDeliveryTrends(deliveredBookings);

  // Generate delivery details
  const deliveries = deliveredBookings.map(booking => ({
    id: booking.id,
    lr_number: booking.lr_number,
    delivery_date: new Date(booking.created_at).toLocaleDateString(),
    time_taken: Math.floor(Math.random() * 48), // Mock value
    on_time: Math.random() > 0.15, // Mock value
    receiver_name: booking.receiver?.name || 'N/A'
  }));

  return {
    onTimeDeliveries,
    delayedDeliveries,
    averageDeliveryTime,
    successRate,
    trends,
    deliveries
  };
}

function generateRevenueReport(bookings: Booking[]) {
  // Calculate revenue metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const averageOrderValue = totalRevenue / (bookings.length || 1);
  
  // Calculate growth (mock data)
  const growth = 15.3;
  
  // Calculate outstanding amount (mock data)
  const outstandingAmount = totalRevenue * 0.2;

  // Generate payment distribution data
  const paymentDistribution = [
    { name: 'Paid', value: bookings.filter(b => b.payment_type === 'Paid').length },
    { name: 'To Pay', value: bookings.filter(b => b.payment_type === 'To Pay').length },
    { name: 'Quotation', value: bookings.filter(b => b.payment_type === 'Quotation').length }
  ];

  // Generate revenue trends
  const trends = generateRevenueTrends(bookings);

  // Generate top revenue sources
  const topSources = generateTopRevenueSources(bookings);

  return {
    totalRevenue,
    growth,
    averageOrderValue,
    outstandingAmount,
    paymentDistribution,
    trends,
    topSources
  };
}

function generatePerformanceReport(bookings: Booking[]) {
  // Calculate performance metrics
  const totalBookings = bookings.length;
  const deliveredBookings = bookings.filter(b => b.status === 'delivered').length;
  const successRate = totalBookings ? (deliveredBookings / totalBookings) * 100 : 0;
  
  // Mock data for other metrics
  const onTimeRate = 92.5;
  const customerSatisfaction = 95.0;
  const efficiencyScore = 88;

  // Generate performance trends
  const trends = generatePerformanceTrends(bookings);

  // Generate radar chart metrics
  const metrics = [
    { name: 'Delivery Speed', value: 85 },
    { name: 'Accuracy', value: 90 },
    { name: 'Customer Service', value: 95 },
    { name: 'Cost Efficiency', value: 82 },
    { name: 'Vehicle Utilization', value: 78 }
  ];

  // Generate improvement areas
  const improvements = [
    { area: 'Vehicle Utilization', description: 'Optimize route planning', score: 78 },
    { area: 'Cost Efficiency', description: 'Reduce operational costs', score: 82 },
    { area: 'Delivery Speed', description: 'Improve transit times', score: 85 }
  ];

  return {
    successRate,
    onTimeRate,
    customerSatisfaction,
    efficiencyScore,
    trends,
    metrics,
    improvements
  };
}

function generateDailyTrends(bookings: Booking[]) {
  const trends: Record<string, { date: string; bookings: number; delivered: number }> = {};

  bookings.forEach(booking => {
    const date = new Date(booking.created_at).toLocaleDateString();
    if (!trends[date]) {
      trends[date] = { date, bookings: 0, delivered: 0 };
    }
    trends[date].bookings++;
    if (booking.status === 'delivered') {
      trends[date].delivered++;
    }
  });

  return Object.values(trends).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function generateDeliveryTrends(bookings: Booking[]) {
  const trends: Record<string, { date: string; avgTime: number }> = {};

  bookings.forEach(booking => {
    const date = new Date(booking.created_at).toLocaleDateString();
    if (!trends[date]) {
      trends[date] = { date, avgTime: Math.floor(Math.random() * 48) }; // Mock value
    }
  });

  return Object.values(trends).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function generateRevenueTrends(bookings: Booking[]) {
  const trends: Record<string, { date: string; revenue: number }> = {};

  bookings.forEach(booking => {
    const date = new Date(booking.created_at).toLocaleDateString();
    if (!trends[date]) {
      trends[date] = { date, revenue: 0 };
    }
    trends[date].revenue += booking.total_amount || 0;
  });

  return Object.values(trends).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function generatePerformanceTrends(bookings: Booking[]) {
  const trends: Record<string, { date: string; successRate: number; onTimeRate: number }> = {};

  bookings.forEach(booking => {
    const date = new Date(booking.created_at).toLocaleDateString();
    if (!trends[date]) {
      // Mock values for demonstration
      trends[date] = {
        date,
        successRate: 85 + Math.random() * 10,
        onTimeRate: 90 + Math.random() * 8
      };
    }
  });

  return Object.values(trends).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function generateTopRevenueSources(bookings: Booking[]) {
  const sources: Record<string, { name: string; bookings: number; revenue: number }> = {};

  bookings.forEach(booking => {
    const sourceName = booking.from_branch?.name || 'Unknown';
    if (!sources[sourceName]) {
      sources[sourceName] = { name: sourceName, bookings: 0, revenue: 0 };
    }
    sources[sourceName].bookings++;
    sources[sourceName].revenue += booking.total_amount || 0;
  });

  return Object.values(sources)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
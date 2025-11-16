import { AdminSnapshot } from "@/lib/admin-data";

export type AdminAnalytics = {
  revenue30d: number;
  averageOrderValue: number;
  repeatCustomerRate: number; // 0-1
  marketingConsentRate: number; // 0-1
  upcomingAppointments: number;
  lowStockItems: number;
  rebookingCustomers: number;
};

export function computeAdminAnalytics(snapshot: AdminSnapshot): AdminAnalytics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const paidOrders = snapshot.orders.filter(
    (order) => ["paid", "fulfilled"].includes(order.status) && new Date(order.createdAt) >= thirtyDaysAgo
  );
  const revenue30d = paidOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const averageOrderValue = paidOrders.length > 0 ? Math.round(revenue30d / paidOrders.length) : 0;

  const appointmentCounts = snapshot.appointments.reduce<Record<string, number>>((acc, appointment) => {
    if (!appointment.customerId) return acc;
    acc[appointment.customerId] = (acc[appointment.customerId] ?? 0) + 1;
    return acc;
  }, {});
  const customersWithVisits = Object.keys(appointmentCounts).length;
  const repeatCustomers = Object.values(appointmentCounts).filter((visits) => visits > 1).length;
  const repeatCustomerRate = customersWithVisits === 0 ? 0 : repeatCustomers / customersWithVisits;

  const marketingConsentRate = snapshot.customers.length
    ? snapshot.customers.filter((c) => c.marketingConsent).length / snapshot.customers.length
    : 0;

  const upcomingAppointments = snapshot.appointments.filter((appt) => new Date(appt.startsAt) > now).length;
  const lowStockItems = snapshot.products.filter((product) => product.stock <= 3 && product.active).length;

  const rebookingCustomers = snapshot.customers.filter((customer) => {
    const visits = appointmentCounts[customer.id] ?? 0;
    return visits > 1;
  }).length;

  return {
    revenue30d,
    averageOrderValue,
    repeatCustomerRate,
    marketingConsentRate,
    upcomingAppointments,
    lowStockItems,
    rebookingCustomers,
  };
}

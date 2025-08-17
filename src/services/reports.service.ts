import { Schema } from "mongoose";
import Models from '../models';
import Types from "../types";
import Utils from '../utils';

type ObjectId = Schema.Types.ObjectId;

export class ReportsService {
    
  /** Generates sales reports for vendors within a given date range */
  static async generateSalesReport(vendorId: string, startDate: Date, endDate: Date) {
    const salesReport = await Models.Order.aggregate([
      { $match: { vendor: vendorId, createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
      { $group: { _id: '$vendor', totalRevenue: { $sum: '$totalPrice' }, totalOrders: { $sum: 1 } } }
    ]);

    return salesReport[0] || { vendorId, totalRevenue: 0, totalOrders: 0 };
  }

  /** Retrieves order trends for vendors to analyze peak ordering times */
  static async getOrderTrends(vendorId: string) {
    return await Models.Order.aggregate([
      { $match: { vendor: vendorId, status: 'completed' } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, orderCount: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
  }

  /** Provides insights into vendor customer behavior & preferences */
  static async getCustomerInsights(vendorId: string) {
    return await Models.Customer.aggregate([
      { $lookup: { from: 'orders', localField: '_id', foreignField: 'customer', as: 'orders' } },
      { $unwind: '$orders' },
      { $match: { 'orders.vendor': vendorId } },
      { $group: { _id: '$orders.customer', totalSpent: { $sum: '$orders.totalPrice' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } }
    ]);
  }

  /** Generates earnings reports for couriers over a date range */
  static async getEarningsReport(courierId: string, startDate: Date, endDate: Date) {
    const earnings = await Models.Order.aggregate([
      { $match: { courier: courierId, completedAt: { $gte: startDate, $lte: endDate }, status: 'delivered' } },
      { $group: { _id: '$courier', totalEarnings: { $sum: '$deliveryFee' }, totalDeliveries: { $sum: 1 } } }
    ]);

    return earnings[0] || { courierId, totalEarnings: 0, totalDeliveries: 0 };
  }

  /** Analyzes courier delivery statistics */
  static async getOrderDeliveryStats(courierId: string) {
    return await Models.Order.aggregate([
      { $match: { courier: courierId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
  }

  /** Fetches customer ratings for a specific courier */
  static async getCustomerRatings(courierId: string) {
    return await Models.Courier.findById(courierId).select('ratings').lean();
  }
}

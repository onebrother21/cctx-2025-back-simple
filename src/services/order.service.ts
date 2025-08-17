import Models from '../models';
import Types from "../types";
import Utils from '../utils';

export class OrderService {

  // 2.1 Create an Order
  static async createOrder(orderData: any) {
    const newOrder = new Models.Order(orderData);
    await newOrder.save();
    await newOrder.populate(`creator customer`);
    return newOrder;
  }

  // 2.2 Get Order by ID
  static async getOrderById(orderId: string) {
    return Models.Order.findById(orderId).populate('customer').populate('products');
  }

  // 2.3 Update Order Status
  static async updateOrderStatus(orderId: string,name:Types.IOrderStatuses,info?:any){
    const status = {name,time:new Date(),...(info?{info}:{})};
    return Models.Order.findByIdAndUpdate(orderId,{$push:{statusUpdates:[status]}},{ new: true });
  }

  // 2.4 Assign Fulfillment
  static async assignFulfillment(orderId: string, courierId: string) {
    const courier = await Models.Courier.findById(courierId);
    if (!courier) throw new Error('Courier not found');
    return Models.Order.findByIdAndUpdate(orderId, { assignedCourier: courierId }, { new: true });
  }

  // 2.5 Track Fulfillment
  static async trackOrderFulfillment(orderId: string) {
    return Models.Order.findById(orderId).populate('assignedCourier');
  }

  // 2.6 Complete Order
  static async completeOrder(orderId: string):Promise<Types.IOrder> {
    const status = {name:Types.IOrderStatuses.DELIVERED,time:new Date()};
    return Models.Order.findByIdAndUpdate(orderId,{$push:{statusUpdates:[status]}},{ new: true });
  }
}
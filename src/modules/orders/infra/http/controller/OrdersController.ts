import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';
import AppError from '@shared/errors/AppError';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    console.log(request.params);
    const findOrderService = container.resolve(FindOrderService);
    const order = await findOrderService.execute({ id });
    console.log(order);
    if (order)
      return response.json({
        customer: order.customer,
        order_products: order.order_products,
      });
    throw new AppError('pedido nao encontrado', 404);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const createOrderService = container.resolve(CreateOrderService);
    const order = await createOrderService.execute({ customer_id, products });
    return response.json(order);
  }
}

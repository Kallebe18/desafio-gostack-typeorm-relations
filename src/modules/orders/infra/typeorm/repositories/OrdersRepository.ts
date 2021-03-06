import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const productsList = products.map(p => ({
      price: p.price,
      product_id: p.id,
      quantity: p.quantity,
    }));

    const order = this.ormRepository.create({
      customer,
      order_products: productsList,
    });

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    console.log(id);
    const order = await this.ormRepository.findOne(id, {
      relations: ['customer', 'order_products'],
    });
    return order;
  }
}

export default OrdersRepository;

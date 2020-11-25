import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerFound = await this.customersRepository.findById(customer_id);
    if (!customerFound)
      throw new AppError('Customer not found for this order', 400);

    const productsFound = await this.productsRepository.findAllById(products);
    if (!productsFound.length) {
      throw new AppError('No products found', 400);
    }

    const productsWithSuficientQuantities = productsFound.filter(
      (product, i) => {
        if (products[i].quantity <= product.quantity) return true;
        products.splice(i, 1);
        return false;
      },
    );

    if (!productsWithSuficientQuantities.length)
      throw new AppError('Theres no products with suficient quantities', 400);

    const productsWithPrice = productsWithSuficientQuantities.map(
      (product, i) => ({
        id: product.id,
        price: product.price,
        quantity: products[i].quantity,
      }),
    );

    await this.productsRepository.updateQuantity(productsWithPrice);

    const order = await this.ordersRepository.create({
      customer: customerFound,
      products: productsWithPrice,
    });

    return order;
  }
}

export default CreateOrderService;

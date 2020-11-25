import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.find({
      where: { name },
    });
    if (product.length > 0) return product[0];
    return undefined;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsFound = await this.ormRepository.findByIds(products);
    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const idList = products.map(p => p.id);
    const productsToUpdate = await this.ormRepository.findByIds(idList);
    const quantitiesProductsToUpdate = productsToUpdate.map(p => p.quantity);
    products.forEach(async (p, i) => {
      await this.ormRepository.save({
        id: p.id,
        quantity: quantitiesProductsToUpdate[i] - p.quantity,
      });
    });
    const newProducts = await this.ormRepository.findByIds(idList);
    return newProducts;
  }
}

export default ProductsRepository;

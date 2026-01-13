import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Price } from './entities/price.entity';
import { Repository } from 'typeorm';
import { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';
import { Product } from 'src/products/entities/product.entity';
import { Period } from 'src/periods/entities/period.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {}

  async create(createPriceDto: CreatePriceDto, user: IAuthPayload) {
    // Verify if user is owner of the product
    const product = await this.productRepository.findOneBy({
      id: createPriceDto.product,
      user: { id: user.sub } as User,
    });

    if (!product) throw new ForbiddenException();

    // Verify if user is owner of the period
    const period = await this.periodRepository.findOneBy({
      id: createPriceDto.period,
      user: { id: user.sub } as User,
    });

    if (!period) throw new ForbiddenException();

    // Verify if user has created a price for the same period and product
    const exists = await this.priceRepository.findOneBy({
      product: { id: createPriceDto.product } as Product,
      period: { id: createPriceDto.period } as Period,
    });

    if (exists)
      throw new ConflictException(
        'Product price already exists for this period',
      );

    // Create the price
    const price = this.priceRepository.create({
      currency: createPriceDto.currency,
      period: period,
      product: product,
    });

    // Return the saved price
    return await this.priceRepository.save(price);
  }

  async findAll(user: IAuthPayload) {
    // Find all the prices for the signed user
    return await this.priceRepository
      .createQueryBuilder('price')
      .innerJoin('price.product', 'product')
      .innerJoin('price.period', 'period')
      .where('product.user = :user', { user: user.sub })
      .select([
        'price.currency',
        'product.name',
        'period.validFrom',
        'period.validTo',
      ])
      .getMany();
  }

  async findOne(id: number, user: IAuthPayload) {
    // Verify if user is owner of the price
    const price = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoin('price.product', 'product')
      .innerJoin('price.period', 'period')
      .where('product.user = :user', { user: user.sub })
      .andWhere('price.id = :id', { id: id })
      .select([
        'price.currency',
        'product.name',
        'period.validFrom',
        'period.validTo',
      ])
      .getOne();

    if (!price) throw new NotFoundException();

    // Returns the price
    return price;
  }

  async update(id: number, updatePriceDto: UpdatePriceDto, user: IAuthPayload) {
    // Verify if price exists
    const price = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoin('price.product', 'product')
      .innerJoin('price.period', 'period')
      .where('product.user = :user', { user: user.sub })
      .select([
        'price.id',
        'price.currency',
        'product.name',
        'period.validFrom',
        'period.validTo',
      ])
      .andWhere('price.id = :id', { id: id })
      .getOne();

    if (!price) throw new UnauthorizedException();

    // Update the price, but does not change product and period
    const updateData = {
      currency: updatePriceDto.currency || undefined,
    };

    if (!updateData.currency) delete updateData.currency;

    this.priceRepository.merge(price, updateData);

    // Return the updated price
    return await this.priceRepository.save(price);
  }

  async remove(id: number) {
    // Verify if price exists
    const price = await this.priceRepository.findOneBy({ id: id });

    if (!price) throw new NotFoundException();

    // Remove the price
    await this.priceRepository.remove(price);

    // Returns success message
    return {
      message: 'Price was deleted successfully',
    };
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto, user: IAuthPayload) {
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.category,
      user: { id: user.sub },
    });

    if (!category) throw new ForbiddenException('Forbidden action');

    const exists = await this.productRepository.findOneBy({
      name: createProductDto.name,
      category: { id: createProductDto.category },
      user: { id: user.sub },
    });

    if (exists) throw new ConflictException('Product already exists');

    const newProduct = this.productRepository.create({
      ...createProductDto,
      category: { id: createProductDto.category } as Category,
      user: { id: user.sub } as User,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll(user: IAuthPayload) {
    return await this.productRepository.find({
      where: {
        user: { id: user.sub },
      },
      order: { category: { title: 'ASC' }, name: 'ASC' },
    });
  }

  async findOne(id: number, user: IAuthPayload) {
    const found = await this.productRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!found) throw new NotFoundException('Not found');

    return found;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: IAuthPayload,
  ) {
    const product = await this.productRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (updateProductDto.category) {
      const categoryExists = await this.categoryRepository.findOneBy({
        id: updateProductDto.category,
        user: { id: user.sub },
      });

      if (!categoryExists) throw new ForbiddenException('Forbidden action');
    }

    const updateData = {
      ...updateProductDto,
      category: updateProductDto.category
        ? ({ id: updateProductDto.category } as Category)
        : undefined,
    };

    if (!updateData.category) delete updateData.category;

    this.productRepository.merge(product, updateData);

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id: id });

    if (!product) throw new NotFoundException('Not found');

    await this.productRepository.remove(product);

    return {
      message: 'Product was deleted successfully',
    };
  }
}

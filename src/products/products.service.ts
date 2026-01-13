import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
    // Verify if category exists and is owned by signed user
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.category,
      user: { id: user.sub },
    });

    if (!category) throw new ForbiddenException('Forbidden action');

    // Verify if product with the same name and category exists
    const exists = await this.productRepository.findOneBy({
      name: createProductDto.name,
      package: createProductDto.package,
      category: { id: createProductDto.category },
      user: { id: user.sub },
    });

    if (exists) throw new ConflictException('Product already exists');

    // Create new product
    const newProduct = this.productRepository.create({
      ...createProductDto,
      category: { id: createProductDto.category } as Category,
      user: { id: user.sub } as User,
    });

    // Return the created product
    return await this.productRepository.save(newProduct);
  }

  async findAll(user: IAuthPayload) {
    // Return all product for signed user
    return await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.category', 'category')
      .where('product.user = :user', { user: user.sub })
      .select([
        'product.id',
        'product.name',
        'product.package',
        'category.title',
      ])
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async findOne(id: number, user: IAuthPayload) {
    // Verify if product exists and is owned by signed user
    const found = await this.productRepository
      .createQueryBuilder('product')
      .where('product.user = :user', { user: user.sub })
      .andWhere('product.id = :id', { id })
      .getOne();

    if (!found) throw new NotFoundException('Not found');

    // Return found product
    return found;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: IAuthPayload,
  ) {
    // Verify if product exists and is owned by signed user
    const product = await this.productRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Verify if category exists and is owned by signed user
    if (updateProductDto.category) {
      const categoryExists = await this.categoryRepository.findOneBy({
        id: updateProductDto.category,
        user: { id: user.sub },
      });

      if (!categoryExists) throw new ForbiddenException('Forbidden action');
    }

    // Creates an update object considering the presence of the category or not
    const updateData = {
      ...updateProductDto,
      category: updateProductDto.category
        ? ({ id: updateProductDto.category } as Category)
        : undefined,
    };

    // Removes the category of the update object if undefined
    if (!updateData.category) delete updateData.category;

    // Updates product
    this.productRepository.merge(product, updateData);

    // Returns the updated product
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    // Verify if product exists
    const product = await this.productRepository.findOneBy({ id: id });

    if (!product) throw new NotFoundException('Not found');

    // Remove produc
    await this.productRepository.remove(product);

    // Send success message
    return {
      message: 'Product was deleted successfully',
    };
  }
}

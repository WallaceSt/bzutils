import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: IAuthPayload) {
    // Test if category already exists
    const exists = await this.categoryRepository.findOneBy({
      title: createCategoryDto.title,
      user: { id: user.sub },
    });

    if (exists) throw new ConflictException('Category already exists');

    // Creates a new category
    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: user.sub } as User,
    });

    // Returns new category
    return await this.categoryRepository.save(newCategory);
  }

  async findAll(user: IAuthPayload) {
    // Returns signed user categories
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.user = :user', { user: user.sub })
      .orderBy('category.title', 'ASC')
      .getMany();
  }

  async findOne(id: number, user: IAuthPayload) {
    // Test the category and its owner
    const foundCategoryByOwner = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.user = :user', { user: user.sub })
      .andWhere('category.id = :id', { id })
      .orderBy('category.title', 'ASC')
      .getOne();

    if (!foundCategoryByOwner) throw new NotFoundException('Not found');

    // Return selected category
    return foundCategoryByOwner;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: IAuthPayload,
  ) {
    // Test if user has a category with the title sent
    const found = await this.categoryRepository.findOneBy({
      title: updateCategoryDto.title,
      user: { id: user.sub },
    });

    if (found) throw new ConflictException('Category already exists');

    // Select the category to change
    const category = await this.categoryRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!category) throw new NotFoundException('Not Found');

    // Change the category with new data
    this.categoryRepository.merge(category, updateCategoryDto);

    // Return the altered category
    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    // Select the category to delete
    const category = await this.categoryRepository.findOneBy({
      id: id,
    });

    if (!category) throw new NotFoundException('Not Found');

    // Remove the selected category
    await this.categoryRepository.remove(category);

    // Send message to user
    return { message: 'Category deleted successfully' };
  }
}

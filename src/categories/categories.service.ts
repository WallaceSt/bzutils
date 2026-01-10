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
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: IAuthPayload) {
    const exists = await this.categoryRepository.findOneBy({
      title: createCategoryDto.title,
      user: { id: user.sub },
    });

    if (exists) throw new ConflictException('Category already exists');

    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: user.sub } as User,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async findAll(user: IAuthPayload) {
    return await this.categoryRepository.find({
      where: {
        user: { id: user.sub },
      },
      order: { title: 'ASC' },
    });
  }

  async findOne(id: number, user: IAuthPayload) {
    const found = await this.categoryRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!found) throw new NotFoundException('Not found');

    return found;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: IAuthPayload,
  ) {
    const found = await this.categoryRepository.findOneBy({
      title: updateCategoryDto.title,
      user: { id: user.sub },
    });

    if (found) throw new ConflictException('Category already exists');

    const category = await this.categoryRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!category) throw new NotFoundException('Not Found');

    this.categoryRepository.merge(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOneBy({
      id: id,
    });

    if (!category) throw new NotFoundException('Not Found');

    await this.categoryRepository.remove(category);

    return { message: 'Category deleted successfully' };
  }
}

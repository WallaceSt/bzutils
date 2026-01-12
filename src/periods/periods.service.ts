import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Period } from './entities/period.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
  ) {}

  async create(createPeriodDto: CreatePeriodDto, user: IAuthPayload) {
    // Verify if start date is not afted end date
    const { validFrom, validTo } = createPeriodDto;

    if (new Date(validFrom) > new Date(validTo)) {
      throw new ConflictException('Dates are misconfigured');
    }

    // Verify if the start or end date are not overlapping others
    const overlappingPeriod = await this.periodRepository.findOne({
      where: [
        {
          user: { id: user.sub },
          validFrom: LessThanOrEqual(validTo),
          validTo: MoreThanOrEqual(validFrom),
        },
      ],
    });

    if (overlappingPeriod)
      throw new ConflictException(
        'The period date is overlapping another period.',
      );

    // Create a new period
    const newPeriod = this.periodRepository.create({
      ...createPeriodDto,
      user: { id: user.sub } as User,
    });

    // Return the new period
    return await this.periodRepository.save(newPeriod);
  }

  async findAll(user: IAuthPayload) {
    // Send list of period for signed user
    return await this.periodRepository.find({
      where: {
        user: { id: user.sub },
      },
      order: { validFrom: 'ASC' },
    });
  }

  async findOne(id: number, user: IAuthPayload) {
    // Verify if period exists for the signed user
    const found = await this.periodRepository
      .createQueryBuilder('period')
      .leftJoinAndSelect('period.prices', 'price')
      .leftJoinAndSelect('price.product', 'product')
      .where('period.id = :id', { id })
      .andWhere('period.user = :user', { user: user.sub })
      .select([
        'period.validFrom',
        'period.validTo',
        'price.currency',
        'product.name',
        'product.package',
      ])
      .orderBy('product.name', 'ASC')
      .getOne();

    if (!found) throw new NotFoundException('Not found');

    // Return the period
    return {
      validFrom: found.validFrom,
      validTo: found.validTo,
      products: found.prices.map((p) => ({
        ...p.product,
        currency: p.currency,
      })),
    };
  }

  async update(
    id: number,
    updatePeriodDto: UpdatePeriodDto,
    user: IAuthPayload,
  ) {
    // Verify if signed user is the owner of the selected period
    const period = await this.periodRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });
    console.log(period);

    if (!period) throw new NotFoundException('Not found');

    // Verify if start date is not after end date
    const newValidFrom = updatePeriodDto.validFrom ?? period.validFrom;
    const newValidTo = updatePeriodDto.validTo ?? period.validTo;

    if (new Date(newValidFrom) > new Date(newValidTo)) {
      throw new ConflictException('Dates are misconfigured');
    }

    // Verify if start and end date are not overlapping others
    const overlappingPeriod = await this.periodRepository.manager
      .createQueryBuilder(Period, 'period')
      .where('period.userId = :userId', { userId: user.sub })
      .andWhere('period.id != :id', { id })
      .andWhere(
        ':newValidFrom <= period.validTo AND :newValidTo >= period.validFrom',
        { newValidFrom, newValidTo },
      )
      .getOne();

    if (overlappingPeriod)
      throw new ConflictException(
        'The period date is overlapping another period.',
      );

    // Alters the selected period
    this.periodRepository.merge(period, updatePeriodDto);
    console.log(period);

    // Return the altered period
    return await this.periodRepository.save(period);
  }

  async remove(id: number) {
    // Select the period to remove
    const period = await this.periodRepository.findOneBy({
      id: id,
    });

    if (!period) throw new NotFoundException('Not Found');

    // Removes the period
    await this.periodRepository.remove(period);

    // Return a success message
    return { message: 'Pediod deleted successfully' };
  }
}

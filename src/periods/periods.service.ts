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
    const { validFrom, validTo } = createPeriodDto;

    if (new Date(validFrom) > new Date(validTo)) {
      throw new ConflictException('Dates are misconfigured');
    }

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

    const newPeriod = this.periodRepository.create({
      ...createPeriodDto,
      user: { id: user.sub } as User,
    });

    return await this.periodRepository.save(newPeriod);
  }

  async findAll(user: IAuthPayload) {
    return await this.periodRepository.find({
      where: {
        user: { id: user.sub },
      },
      order: { validFrom: 'ASC' },
    });
  }

  async findOne(id: number, user: IAuthPayload) {
    const found = await this.periodRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });

    if (!found) throw new NotFoundException('Not found');

    return found;
  }

  async update(
    id: number,
    updatePeriodDto: UpdatePeriodDto,
    user: IAuthPayload,
  ) {
    const period = await this.periodRepository.findOneBy({
      id: id,
      user: { id: user.sub },
    });
    console.log(period);

    if (!period) throw new NotFoundException('Not found');

    const newValidFrom = updatePeriodDto.validFrom ?? period.validFrom;
    const newValidTo = updatePeriodDto.validTo ?? period.validTo;

    if (new Date(newValidFrom) > new Date(newValidTo)) {
      throw new ConflictException('Dates are misconfigured');
    }

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

    this.periodRepository.merge(period, updatePeriodDto);
    console.log(period);

    return await this.periodRepository.save(period);
  }

  async remove(id: number) {
    const period = await this.periodRepository.findOneBy({
      id: id,
    });

    if (!period) throw new NotFoundException('Not Found');

    await this.periodRepository.remove(period);

    return { message: 'Pediod deleted successfully' };
  }
}

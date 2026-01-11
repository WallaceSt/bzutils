import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { GetUser } from 'src/auth/decorators/get-user/get-user.decorator';
import type { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';

@Controller('periods')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  create(
    @Body() createPeriodDto: CreatePeriodDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.periodsService.create(createPeriodDto, user);
  }

  @Get()
  findAll(@GetUser() user: IAuthPayload) {
    return this.periodsService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: IAuthPayload,
  ) {
    return this.periodsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodDto: UpdatePeriodDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.periodsService.update(id, updatePeriodDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.periodsService.remove(+id);
  }
}

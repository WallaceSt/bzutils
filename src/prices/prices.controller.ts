import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PricesService } from './prices.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user/get-user.decorator';
import type { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';

@Controller('prices')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  create(
    @Body() createPriceDto: CreatePriceDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.pricesService.create(createPriceDto, user);
  }

  @Get()
  findAll(@GetUser() user: IAuthPayload) {
    return this.pricesService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: IAuthPayload,
  ) {
    return this.pricesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePriceDto: UpdatePriceDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.pricesService.update(id, updatePriceDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pricesService.remove(+id);
  }
}

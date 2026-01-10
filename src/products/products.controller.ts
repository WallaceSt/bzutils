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
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from 'src/auth/decorators/get-user/get-user.decorator';
import type { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: IAuthPayload) {
    return this.productsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: IAuthPayload,
  ) {
    return this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: IAuthPayload,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}

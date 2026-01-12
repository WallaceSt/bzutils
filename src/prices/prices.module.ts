import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './entities/price.entity';
import { Product } from 'src/products/entities/product.entity';
import { Period } from 'src/periods/entities/period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Product, Period])],
  controllers: [PricesController],
  providers: [PricesService],
  exports: [TypeOrmModule],
})
export class PricesModule {}

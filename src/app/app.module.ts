import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/users.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';
import { Period } from 'src/periods/entities/period.entity';
import { PeriodsModule } from 'src/periods/periods.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'user',
      database: 'bzutils',
      entities: [User, Category, Product, Period],
      synchronize: true, // shoud not be used in production
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    PeriodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

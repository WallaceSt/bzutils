import { Period } from 'src/periods/entities/period.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['product', 'period'])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currency: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.prices, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => Period, (period) => period.prices, { onDelete: 'CASCADE' })
  period: Period;
}

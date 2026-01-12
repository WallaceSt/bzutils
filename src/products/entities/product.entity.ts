import { Category } from 'src/categories/entities/category.entity';
import { Price } from 'src/prices/entities/price.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['name', 'package', 'user'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    enum: ['kilo', 'saco', 'caixa', 'pacote', 'cartela', 'unidade', 'dúzia'],
  })
  package: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.products)
  user: User;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => Price, (price) => price.product)
  prices: Price[];
}

import { Exclude } from 'class-transformer';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    enum: ['admin', 'manager', 'frontdesk', 'provider'],
    default: 'frontdesk',
  })
  role: string;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}

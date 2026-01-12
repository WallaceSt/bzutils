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
@Unique(['validFrom', 'validTo', 'user'])
export class Period {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  validFrom: string;

  @Column({ type: 'date' })
  validTo: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.periods)
  user: User;

  @OneToMany(() => Price, (price) => price.period)
  prices: Price[];
}

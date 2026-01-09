import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}

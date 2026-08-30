import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '@/users/entities/user.entity';
import { PropertyType } from '@/property-types/entities/property-types.entity';
import { PropertyStatus } from '../enums/property.enum';

@Entity('properties')
@Index(['sellerId'])
@Index(['propertyTypeId'])
@Index(['status'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  address: string;

  @Column({ type: 'integer', comment: 'CHECK (price > 0)' })
  price: number;

  @Column({ type: 'integer', nullable: true })
  bedrooms: number;

  @Column({ type: 'float', nullable: true, name: 'square_meters' })
  squareMeters: number;

  @Column({ type: 'uuid', name: 'property_type_id' })
  propertyTypeId: string;

  @Column({ type: 'uuid', name: 'seller_id' })
  sellerId: string;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @ManyToOne(() => PropertyType)
  @JoinColumn({ name: 'property_type_id' })
  propertyType: PropertyType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}

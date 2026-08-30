import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('property_types')
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
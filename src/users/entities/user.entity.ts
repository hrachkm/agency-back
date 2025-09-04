
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string

  @Column({ type: 'varchar', length: 25 })
  role: string

  @CreateDateColumn({ type: 'timestamptz',  default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz',  default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date

}

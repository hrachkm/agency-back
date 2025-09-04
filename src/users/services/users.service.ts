import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, RegisteredUserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @Inject('PG') private clientPg: Client,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async findAll() {

    const users = await this.userRepo.find({});

    if(!users || (users.length === 0)) throw new BadRequestException('No hay usuarios registrados');

    return users;
  }

  async findOne(email: string) {
    const user = await this.userRepo.findOne({ where: {email}});

    if(!user) throw new BadRequestException('No hay usuarios registrados');

    return user;
  }

  async create(newUser: CreateUserDto) {
    const { email } = newUser;
    const isRegistered = await this.userRepo.findOne({ where: { email }});
    if(!!isRegistered) throw new BadRequestException('Este usuario ya está registrado');

    const hashPassword = await bcrypt.hash(newUser.password, 17);
    newUser.password = hashPassword;

    const created = await this.userRepo.create(newUser);
    const userAdded = await this.userRepo.save(created);

    if(!userAdded) throw new BadRequestException('No se pudo registrar el usuario', {
      cause: new Error(),
      description: 'Add user error'
    })

    return {
      created: true,
      user: userAdded
    };
  }

  update(id: number, updateUserDto: RegisteredUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async removeAll() {
    try {
      await this.userRepo.clear();

      await this.userRepo.query('ALTER SEQUENCE user_id_seq RESTART WITH 1');

      return true;
    } catch (error) {
      return false;
    }
    
  }
}

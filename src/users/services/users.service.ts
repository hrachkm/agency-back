import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import ShortUniqueId from 'short-unique-id';

import { CreateUserDto, RegisteredUserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class UsersService {
  private suid = new ShortUniqueId({ length: 10 });

  constructor(
    @Inject('PG') private clientPg: Client,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(limit: number, offset: number) {
    const [users, total] = await this.userRepo.findAndCount({
      take: limit,
      skip: offset,
    });

    if (!users || users.length === 0)
      throw new BadRequestException('No hay usuarios registrados');

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) throw new BadRequestException('Usuario no registrado');

    return user;
  }

  async findOneByUserEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new BadRequestException('Usuario no registrado');

    return user;
  }

  async create(newUser: CreateUserDto) {
    const { email } = newUser;
    const isRegistered = await this.userRepo.findOne({ where: { email } });
    if (!!isRegistered)
      throw new BadRequestException(
        'Este usuario ya esta registrado',
      );

    const hashPassword = await bcrypt.hash(newUser.password, 17);
    newUser.password = hashPassword;

    let created = await this.userRepo.create(newUser);
    const userAdded = await this.userRepo.save(created);

    if (!userAdded)
      throw new BadRequestException('No se pudo registrar el usuario', {
        cause: new Error(),
        description: 'Add user error',
      });

    return {
      created: true,
      user: userAdded,
    };
  }

  async update(id: string, updateUserDto: RegisteredUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    Object.assign(user, updateUserDto);
    return await this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException(`No se encontro el usuario con id ${id}`);
    }

    const deletedUser = await this.userRepo.softRemove(user);

    return {
      removed: true,
      user: deletedUser,
    };
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


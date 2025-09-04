import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/services/users.service';
import { CreateUserDto } from '@/users/dto/user.dto';


@Injectable()
export class SeedService {

	constructor(private usersService: UsersService){}

	async generateData(){
		console.info('---------LIMPIANDO BASE DE DATOS----------');
			await this.usersService.removeAll();
		console.info('---------BASE DE DATOS LIMPIADA----------');
		
		console.info('---------CREANDO USUARIOS----------');
			await this.createUsers();
		console.info('---------USUARIOS CREADOS----------');

		return 'DATOS DE MUESTRA CREADOS';

	}

	async createUsers(){
		const users: CreateUserDto[] = [
			{
				email: 'admin@example.com',
				password: 'admin123',
				role: 'admin'
			},
			{
				email: 'user@example.com',
				password: 'user123',
				role: 'user'
			},
			{
				email: 'doctor@example.com',
				password: 'doctor123',
				role: 'doctor'
			},
			{
				email: 'patient@example.com',
				password: 'patient123',
				role: 'patient'
			},
			{
				email: 'employee@example.com',
				password: 'employee123',
				role: 'employee'
			},
			{
				email: 'client@example.com',
				password: 'client123',
				role: 'client'
			}
		];

		const totalUsers = users.length;

		for(let i = 0; i < totalUsers; i++){
			await this.usersService.create(users[i]);
		}

	}

}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UsersService } from '@/users/services/users.service';
import { CreateUserDto } from '@/users/dto/user.dto';

import { PropertiesService } from '@/properties/services/properties.service';
import { CreatePropertyDto } from '@/properties/dto/properties.dto';

import { PropertyTypesService } from '@/property-types/services/property-types.service';
import { CreatePropertyTypeDto } from '@/property-types/dto/property-types.dto';

@Injectable()
export class SeedService {
  constructor(
    private usersService: UsersService,
    private propertiesService: PropertiesService,
    private propertyTypesService: PropertyTypesService,
    private dataSource: DataSource,
  ) {}

  async generateData() {
    console.info('---------LIMPIANDO BASE DE DATOS----------');
    // Eliminar los datos de todas las tablas en el orden correcto para evitar problemas de FK
    // usando truncado en cascada
    await this.dataSource.query(
      'TRUNCATE TABLE users, property_types, properties CASCADE',
    );
    console.info('---------BASE DE DATOS LIMPIADA----------');

    console.info('---------CREANDO USUARIOS----------');
    const createdUsers = await this.createUsers();
    console.info('---------USUARIOS CREADOS----------');

    console.info('---------CREANDO TIPOS DE INMUEBLE----------');
    const createdTypes = await this.createPropertyTypes();
    console.info('---------TIPOS DE INMUEBLE CREADOS----------');

    console.info('---------CREANDO PROPIEDADES----------');
    await this.createProperties(createdUsers, createdTypes);
    console.info('---------PROPIEDADES CREADAS----------');

    return 'DATOS DE MUESTRA CREADOS';
  }

  async createUsers() {
    const users: CreateUserDto[] = [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'User 1',
        email: 'user1@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'User 3',
        email: 'user3@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'Doctor',
        email: 'doctor@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'Patient',
        email: 'patient@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'Employee',
        email: 'employee@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'Client',
        email: 'client@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'User 4',
        email: 'user4@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
      {
        name: 'User 5',
        email: 'user5@example.com',
        password: 'Pwd@1234',
        confirmPassword: 'Pwd@1234',
      },
    ];

    const createdUsers = [];
    for (let i = 0; i < users.length; i++) {
      const result = await this.usersService.create(users[i]);
      createdUsers.push(result.user);
    }
    return createdUsers;
  }

  async createPropertyTypes() {
    const types: CreatePropertyTypeDto[] = [
      { name: 'casa' },
      { name: 'apartamento' },
      { name: 'terreno' },
      { name: 'local comercial' },
    ];

    const createdTypes = [];
    for (let i = 0; i < types.length; i++) {
      const result = await this.propertyTypesService.create(types[i]);
      createdTypes.push(result.propertyType);
    }
    return createdTypes;
  }

  async createProperties(users: any[], types: any[]) {
    // Tomar los 3 primeros usuarios
    const firstThreeUsers = users.slice(0, 3).map((u) => u.id);
    // Extraer los ids de los tipos
    const typeIds = types.map((t) => t.id);

    const propertiesToCreate = 15;

    for (let i = 0; i < propertiesToCreate; i++) {
      // Distribuir entre los 3 usuarios y los 4 tipos
      const sellerId = firstThreeUsers[i % 3];
      const typeId = typeIds[i % 4];

      const propertyDto: CreatePropertyDto = {
        address: `Propiedad de prueba ${i + 1}`,
        price: 150000 + i * 5000,
        bedrooms: (i % 4) + 1, // Entre 1 y 4 habitaciones
        squareMeters: 60 + i * 10, // A partir de 60 m2
        propertyTypeId: typeId,
      };

      await this.propertiesService.create(propertyDto, sellerId);
    }
  }
}

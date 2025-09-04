import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class AppService {

  constructor(@Inject('PG') private clientPg: Client) {}


  onlineMessage(): string {
    return 'Server online!!';
  }

  async databaseConnection() {
    try {
      // Realiza una consulta simple para verificar la conexión
      const res = await this.clientPg.query('SELECT NOW()');
      if (res.rows.length > 0) {
        return 'Conexión a la base de datos exitosa. ✅';
      }
    } catch (error) {
      return `Error en la conexión a la base de datos: ${error.message} ❌`;
    }
  }
}

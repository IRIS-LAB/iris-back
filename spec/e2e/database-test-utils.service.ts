/**
 * This class is used to support database
 * tests with unit tests in NestJS.
 *
 * This class is inspired by https://github.com/jgordor
 * https://github.com/nestjs/nest/issues/409#issuecomment-364639051
 */
import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection } from 'typeorm'

interface Entity {
  name: string;
  tableName: string
}

@Injectable()
export class DatabaseTestUtils {
  public connection: Connection

  /**
   * Creates an instance of TestUtils
   */
  constructor(@InjectConnection() connection: Connection) {
    this.connection = connection
  }

  /**
   * Shutdown the http server
   * and close database connections
   */
  // async shutdownServer(server) {
  //   await server.httpServer.close()
  //   await this.closeDbConnection()
  // }

  /**
   * Closes the database connections
   */
  public async closeDbConnection() {
    if (this.connection.isConnected) {
      await this.connection.close()
    }
  }

  /**
   * Open the database connections
   */
  public async openDbConnection() {
    if (!this.connection.isConnected) {
      await this.connection.connect()
    }
  }

  /**
   * Returns the entites of the database
   */
  public getEntities() {
    const entities: Entity[] = []
    this.connection.entityMetadatas.forEach(x => {
        entities.push({ name: x.name, tableName: x.tableName })
      },
    )
    return entities
  }

  /**
   * Cleans the database and reloads the entries
   */
  // async reloadFixtures() {
  //   const entities = await this.getEntities()
  //   await this.cleanAll(entities)
  //   await this.loadAll(entities)
  // }

  /**
   * Cleans all the entities
   */
  public async cleanAll(entities: Entity[]) {
    try {
      await this.connection.transaction(async entityManager => {
        //   for (const entity of entities) {
        //     await this.connection.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`)
        //   }
        // })
        // await this.connection.transaction(async entityManager => {
        for (const entity of entities) {
          // if (entity.created) {
          // await entityManager.createQueryBuilder()
          //   .from(entity.name, entity.name)
          //   .delete()
          //   .execute()
          await this.connection.query(`TRUNCATE "${entity.tableName}" CASCADE;`)
          // }
        }
      })
    } catch (e) {
      //none
    }
  }

  public async cleanDatabase() {
    await this.cleanAll(this.getEntities())
  }
}
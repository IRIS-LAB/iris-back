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
   * Returns the entites of the database
   */
  public getEntities() {
    const entities: Entity[] = []
    this.connection.entityMetadatas.forEach(
      x => entities.push({ name: x.name, tableName: x.tableName }),
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
    let previousEntitiesInError = await this.tryToClean(entities)
    let currentEntitiesInError = await this.tryToClean(previousEntitiesInError)
    while (currentEntitiesInError.length && currentEntitiesInError.length < previousEntitiesInError.length) {
      previousEntitiesInError = currentEntitiesInError
      currentEntitiesInError = await this.tryToClean(previousEntitiesInError)
    }
    if (currentEntitiesInError.length) {
      throw new Error(`ERROR: Cannot clean entities ${currentEntitiesInError.map(e => e.name).join(', ')}`)
    }
  }

  public async tryToClean(entities: Entity[]): Promise<Entity[]> {
    const entitiesInError: Entity[] = []
    for (const entity of entities) {
      try {
        await this.connection.createQueryBuilder()
          .delete()
          .from(entity.name, entity.name)
          .execute()
      } catch (error) {
        entitiesInError.push(entity)
      }
    }
    return entitiesInError
  }

  public async cleanDatabase() {
    await this.cleanAll(this.getEntities())
  }


  /**
   * Insert the data from the src/test/fixtures folder
   */
  // async loadAll(entities: Entity[]) {
  //   try {
  //     for (const entity of entities) {
  //       const fixtureFile = Path.join(__dirname, `../test/fixtures/${entity.name}.json`)
  //       if (fs.existsSync(fixtureFile)) {
  //         const items = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'))
  //         await this.connection
  //           .createQueryBuilder(entity.name)
  //           .insert()
  //           .values(items)
  //           .execute()
  //       }
  //     }
  //   } catch (error) {
  //     throw new Error(`ERROR [TestUtils.loadAll()]: Loading fixtures on test db: ${error}`)
  //   }
  // }
}

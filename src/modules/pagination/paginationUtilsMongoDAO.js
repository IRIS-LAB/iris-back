import { searchUtilsMongo } from '../search/searchUtilsMongo'
import { ErreurDO, TechnicalException } from '@u-iris/iris-common'
import { paginationUtilsMongoDAOError } from '../../error'

/**
 * Generates object to sort
 * @param {String[] | String} sorts
 *                              sort
 * @returns Object to sort in mongodb
 */
async function createObjectForSort(sorts) {
  let responseSort = {}
  if (typeof sorts === 'string') {
    responseSort = await createObjectForSortString(sorts)
  } else if (typeof sorts === 'object') {
    for (let sort in sorts) {
      responseSort = { ...responseSort, ...(await createObjectForSortString(sorts[sort])) }
    }
  }
  return responseSort
}

async function createObjectForSortString(sortString) {
  try {
    await searchUtilsMongo.checkNoInjection(sortString)
    const tab = sortString.split(',')
    let objectSort = {}
    objectSort[tab[0]] = tab[1] === 'asc' ? 1 : -1
    return objectSort
  } catch (error) {
    throw error
  }
}

/**
 * generates a paged response
 * @param {String} collection
 *                      name of collection
 * @param {Object} connectionDb
 *                      object to connect to the database
 * @param {Object} find
 *                      object that is being researched
 * @param {Object} query
 *                      query paramater
 * @returns Object that contains response of find and a count
 */
async function findWithPagination(collection, connectionDb, find, query) {
  try {
    const sortMongo = query.sort ? await createObjectForSort(query.sort) : null
    let response = {}

    response.response = await connectionDb
      .collection(collection)
      .find(find)
      .sort(sortMongo)
      .skip(query.size * query.page)
      .limit(query.size)
      .toArray()

    response.count = await connectionDb.collection(collection).countDocuments(find)
    return response
  } catch (error) {
    throw new TechnicalException(
      new ErreurDO(
        '',
        paginationUtilsMongoDAOError.findWithPagination.code,
        paginationUtilsMongoDAOError.findWithPagination.label,
      ),
    )
  }
}

export const PaginationUtilsMongoDAO = {
  createObjectForSort,
  findWithPagination,
}

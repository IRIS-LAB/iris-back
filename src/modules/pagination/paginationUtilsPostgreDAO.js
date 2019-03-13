import { BusinessException, ErrorDO, TechnicalException } from '@u-iris/iris-common'
import { paginationUtilsPostgreDAOError } from '../../error'

/**
 * Find all with pagination
 * @param {object} models - it's a sequelize model
 * @param {object} query - query paramater
 * @param {Object} where - object that is being researched
 * @returns {Object} who composed by response and count (ex {response: , count: })
 */
async function findWithPagination(models, size, page, where, sorts) {
  try {
    let offset = 0
    if (page !== 0) {
      offset = (page - 1) * size
    }
    let objectFindAll = {}
    if (where && where !== null) {
      objectFindAll.where = where
    }
    if (sorts && sorts !== null) {
      objectFindAll.order = createObjectSort(sorts)
    }
    objectFindAll.offset = offset
    objectFindAll.limit = size
    const result = await models.findAndCountAll(objectFindAll)
    return { response: result.rows, count: result.count }
  } catch (error) {
    if (error.parent && error.parent.routine === 'errorMissingColumn') {
      throw new BusinessException(
        new ErrorDO(
          error.message,
          paginationUtilsPostgreDAOError.findWithPagination.business.code,
          paginationUtilsPostgreDAOError.findWithPagination.business.label
        )
      )
    } else {
      throw new TechnicalException(
        new ErrorDO(
          '',
          paginationUtilsPostgreDAOError.findWithPagination.technical.code,
          paginationUtilsPostgreDAOError.findWithPagination.technical.label
        )
      )
    }
  }
}
/**
 * Create object sort for postgre
 * @param {String} sorts
 * @param {String[]} responseSort
 */
function createObjectSortString(sorts, responseSort) {
  const tab = sorts.split(',')
  responseSort.push([tab[0], tab[1]])
}
/**
 * Create sort for postgre
 * @param {String | String[]} sorts
 */
function createObjectSort(sorts) {
  let responseSort = []
  if (typeof sorts === 'string') {
    createObjectSortString(sorts, responseSort)
  } else if (typeof sorts === 'object') {
    for (const sort of sorts) {
      createObjectSortString(sort, responseSort)
    }
  }
  return responseSort
}

export default {
  findWithPagination,
}

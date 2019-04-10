import { BusinessException, ErreurDO, TechnicalException } from '@u-iris/iris-common'
import { paginationUtilsPostgreDAOError } from '../../error'
import { isUndefined } from 'lodash'

/**
 * Find all with pagination
 * @param {object} models - it's a sequelize model
 * @param {number} size - query.size
 * @param {number} page - query.page
 * @param {Object} where - object that is being researched
 * @param {Object | String} sorts - sort
 * @returns {Object} who composed by response and count (ex {response: , count: })
 */
async function findWithPagination(models, size, page, where, sorts) {
  try {
    let offset = 0
    if (!isUndefined(page)) {
      offset = page * size
    }
    let objectFindAll = {}
    if (!lodash.isEmpty(where)) {
      objectFindAll.where = where
    }
    if (!isUndefined(sorts)) {
      objectFindAll.order = createObjectSort(sorts)
    }
    objectFindAll.offset = offset
    objectFindAll.limit = size
    const result = await models.findAndCountAll(objectFindAll)
    return { response: result.rows, count: result.count }
  } catch (error) {
    if (error.parent && error.parent.routine === 'errorMissingColumn') {
      throw new BusinessException(
        new ErreurDO(
          error.message,
          paginationUtilsPostgreDAOError.findWithPagination.business.code,
          paginationUtilsPostgreDAOError.findWithPagination.business.label,
        ),
      )
    } else {
      throw new TechnicalException(
        new ErreurDO(
          '',
          paginationUtilsPostgreDAOError.findWithPagination.technical.code,
          paginationUtilsPostgreDAOError.findWithPagination.technical.label,
        ),
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

export const paginationUtilsPostgreDAO = {
  findWithPagination,
}

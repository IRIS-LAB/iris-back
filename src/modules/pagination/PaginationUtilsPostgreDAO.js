import { BusinessException, ErrorDO } from '@ugieiris/iris-common'

/**
 * Find all with pagination
 * @param {object} models
 *                  it's a sequelize model
 * @param {object} query
 *                      query paramater
 * @param {Object} where
 *                  object that is being researched
 * @returns {Object} who composed by response and count (ex {response: , count: })
 */
async function findWithPagination(models, query, where) {
  try {
    let offset = 0
    if (query.page !== 0) {
      offset = (query.page - 1) * query.size
    }
    let objectFindAll = {}
    if (where && where !== null) {
      objectFindAll.where = where
    }
    if (query.sort && query.sort !== null) {
      objectFindAll.order = createObjectSort(query.sort)
    }
    objectFindAll.offset = offset
    objectFindAll.limit = query.size
    const result = await models.findAndCountAll(objectFindAll)
    return { response: result.rows, count: result.count }
  } catch (error) {
    if (error.parent.routine === 'errorMissingColumn') {
      throw new BusinessException(new ErrorDO(error.message, 'bad.params', 'bad query params'))
    } else {
      throw error
    }
  }
}

function createObjectSortString(sorts, responseSort) {
  const tab = sorts.split(',')
  responseSort.push([tab[0], tab[1]])
}
function createObjectSort(sorts) {
  let responseSort = []
  if (typeof sorts === 'string') {
    createObjectSortString(sorts, responseSort)
  } else if (typeof sorts === 'object') {
    for (const sort in sorts) {
      createObjectSortString(sorts[sort], responseSort)
    }
  }
  return responseSort
}

export const PaginationUtilsPostgreDAO = {
  findWithPagination
}

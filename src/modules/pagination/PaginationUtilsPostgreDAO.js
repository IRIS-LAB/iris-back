import { BusinessException, ErrorDO } from '@ugieiris/iris-common'

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

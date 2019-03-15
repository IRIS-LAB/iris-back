export const typeUtilsError = {
  defineType: {
    code: 'typeUtils.defineType.type.wrong',
    label: 'The past type is not recognized',
  },
  stringToIntBase10: {
    code: 'typeUtils.stringToIntBase10.number.wrong',
    label: 'The past param is not a number',
  },
  stringToDate: {
    code: 'typeUtils.stringToDate.date.wrong',
    label: 'The past param is not a date',
  },
}

export const searchUtilsMongodbError = {
  checkNoInjection: {
    code: 'SearchUtilsmongodb.checkNoInjection.injection',
    label: 'Attempted injection',
  },
}

export const paginationUtilsEBSError = {
  checkDefaultSizeAndPage: {
    field: 'size',
    code: 'paginationUtilsEBS.checkDefaultSizeAndPage.pagination.size.bad',
    label: 'The size query params must be greater than 0',
  },
  checkAcceptRange: {
    field: 'Accept-Range',
    code: 'paginationUtilsEBS.checkAcceptRange.wrong',
    label: 'The size query params must be lesser than accept range',
  },
  createUrl: {
    field: 'url',
    code: 'paginationUtilsEBS.createUrl.string',
    label: 'Url is not string',
  },
}

export const paginationUtilsPostgreDAOError = {
  findWithPagination: {
    business: {
      code: 'paginationUtilsPostgreDAO.findWithPagination.params.wrong',
      label: 'One or more given fields are false',
    },
    technical: {
      code: 'paginationUtilsPostgreDAO.findWithPagination.internal.error',
      label: 'Problem with database. Please contact your helpdesk if error persists',
    },
  },
}

export const paginationUtilsMongoDAOError = {
  findWithPagination: {
    code: 'paginationUtilsMongoDAOError.findWithPagination.internal.error',
    label: 'Problem with database. Please contact your helpdesk if error persists',
  },
}

/*export default {
  typeUtilsError,
  searchUtilsMongodbError,
  paginationUtilsEBSError,
  paginationUtilsPostgreDAOError,
  paginationUtilsMongoDAOError,
}*/

const typeUtilsError = {
    defineType = { 
     code: 'typeUtils.defineType.type.wrong',
     label: 'The past type is not recognized',
    },
    stringToIntBase10 = {
        code: 'typeUtils.stringToIntBase10.number.wrong',
        label: 'The past param is not a number',
    },
    stringToDate = {
        code: 'typeUtils.stringToDate.date.wrong',
        label: 'The past param is not a date',
    }
}

const SearchUtilsmongodbError = {
    checkNoInjection = {
        code: 'SearchUtilsmongodb.checkNoInjection.injection',
        label: 'attempted injection',
    }
}

const paginationUtilsEBSError = {
    checkDefaultSizeAndPage = {
        field: 'size',
        code: 'paginationUtilsEBS.checkDefaultSizeAndPage.pagination.size.bad', 
        label: 'size of query params must greater than 0'
    },
    checkAcceptRange = {
        field: 'Accept-Range',
        code: 'paginationUtilsEBS.checkAcceptRange.wrong',
        label: 'size of query params must lesser than accept range'
    },
    createUrl = {
        field: 'url',
        code: 'paginationUtilsEBS.createUrl.string',
        label: 'url is not string'
    }
}

const paginationUtilsPostgreDAOError = {
    findWithPagination = {
        business = {
            code: 'paginationUtilsPostgreDAO.findWithPagination.params.wrong',
            label: 'One or more given fields are false'
        },
        technical = {
            code: 'paginationUtilsPostgreDAO.findWithPagination.internal.error',
            label: 'Problem with database. Please contact your helpdesk if error persists'
        }
    }
}

const paginationUtilsMongoDAOError = {
    findWithPagination = {
        code: 'paginationUtilsMongoDAOError.findWithPagination.internal.error',
        label: 'Problem with database. Please contact your helpdesk if error persists'
    }
}

export default {
    typeUtilsError,
    SearchUtilsmongodbError,
    paginationUtilsEBSError,
    paginationUtilsPostgreDAOError,
    paginationUtilsMongoDAOError,
}

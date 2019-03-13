const typeUtilsError = {
    defineType = { 
     code: 'typeUtils.defineType.type.bad',
     label: 'The past type is not recognized',
    },
    stringToIntBase10 = {
        code: 'typeUtils.stringToIntBase10.number.bad',
        label: 'it is not a number',
    },
    stringToDate = {
        code: 'typeUtils.stringToDate.date.bad',
        label: 'it is not a number',
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
        label: 'size must greater than 0'
    },
    checkAcceptRange = {
        field: 'Accept-Range',
        code: 'paginationUtilsEBS.checkAcceptRange.bad',
        label: 'accept range exceeded'
    },
    createUrl = {
        field: 'url',
        code: 'paginationUtilsEBS.createUrl.string',
        label: 'url is not strint'
    }
}

const paginationUtilsPostgreDAOError = {
    findWithPagination = {
        business = {
            code: 'paginationUtilsPostgreDAO.findWithPagination.params.bad',
            label: 'bad params'
        },
        technical = {
            code: 'paginationUtilsPostgreDAO.findWithPagination.internal.error',
            label: 'internal error'
        }
    }
}

const paginationUtilsMongoDAOError = {
    findWithPagination = {
        code: 'paginationUtilsMongoDAOError.findWithPagination.internal.error',
        label: 'internal error'
    }
}

export default {
    typeUtilsError,
    SearchUtilsmongodbError,
    paginationUtilsEBSError,
    paginationUtilsPostgreDAOError,
    paginationUtilsMongoDAOError,
}

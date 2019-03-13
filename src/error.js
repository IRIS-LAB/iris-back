import { BusinessException } from "@ugieiris/iris-common";

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

export default {
    typeUtilsError,
    SearchUtilsmongodbError,
}

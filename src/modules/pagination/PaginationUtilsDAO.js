import { SearchUtils } from '../search/searchUtils';
import {
    BusinessException,
    ErreurDO
} from '@ugieiris/iris-common'



/**
 * Generates object to sort
 * @param {String[] | String} sorts 
 *                              sort
 * @returns Object to sort in mongodb
 */
async function createObjectForSort (sorts) {
    let responseSort = {}
    if(typeof sorts === 'string'){
        responseSort = await createObjectForSortString(sorts)
    }else if (typeof sorts === 'object'){
        for (let sort in sorts) {
            responseSort = {...responseSort, ...await createObjectForSortString(sorts[sort])}
        }
    }else{
        throw new BusinessException(new ErreurDO('sort','pagination.sort.type'))
    }
    return responseSort
}

async function createObjectForSortString (sortString) {
    try {
        await SearchUtils.checkNoInjection(sortString)
        const tab = sortString.split(",")
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
async function searchInDb (collection ,connectionDb, find, query) {
    const sortMongo = query.sort ? await createObjectForSort(query.sort) : null
    let response = {}

    response.response = await connectionDb.collection(collection).find(find).sort(sortMongo).skip(query.size * query.page).limit(query.size).toArray()

    response.count = await connectionDb.collection(collection).countDocuments(find)
    return response
}

export const PaginationUtilsDAO = {
    createObjectForSort,
    searchInDb
}
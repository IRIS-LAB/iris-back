import { SearchUtils } from '../search/searchUtils';
import {BusinessException, ErrorDO} from 'iris-common'

export const PaginationUtilsDAO = checkNoInjection = {

    /**
     * Generates object to sort
     * @param {String[] | String} sorts 
     *                              sort 
     */
    async createObjectForSort (sorts) {
        let responseSort = {}
        if(typeof sorts === 'string'){
            responseSort = await createObjectForSortString(sorts)
        }else if (typeof sorts === 'object'){
            for (let sort in sorts) {
                responseSort = {...responseSort, ...await createObjectForSortString(sorts[sort])}
            }
        }else{
            throw new BusinessException(new ErrorDO('sort','pagination.sort.type'))
        }
        return responseSort
    },

    async createObjectForSortString (sortString) {
        try {
            await checkNoInjection(sortString)
            const tab = sortString.split(",")
            let objectSort = {}
            objectSort[tab[0]] = tab[1] === 'asc' ? 1 : -1
            return objectSort   
        } catch (error) {
            throw error
        }
        
    },
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
     */
    async searchInDb (collection ,connectionDb, find, query) {
        const sortMongo = query.sort ? await paginationUtils.createObjectForSort(query.sort) : null
        let response = {}
        //Recupere tous les éléments par rapport au find
        response.response = await connectionDb.collection(collection).find(find).sort(sortMongo).skip(query.size * query.page).limit(query.size).toArray()
        //Récupére le nombre maximum qui est retourné par le find
        response.count = await connectionDb.collection(collection).countDocuments(find)
        return response
    }
}

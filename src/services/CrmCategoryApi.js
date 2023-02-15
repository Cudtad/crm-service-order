// http://api.ngs.vn/nspace/ticket/category/search?search=&sort=name

import axiosClient from 'services/axiosClient'

const HOST = "crm-service";
const PROJECT_URL = `${HOST}/category`;

const CrmCategoryApi = {

    /**
     * get
     * @param {*} id 
     * @returns 
     */
    get: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    /**
     * update
     * @param {*} category 
     * @returns 
     */
     update: (category) => {
        return axiosClient.put(`${PROJECT_URL}/${category.id}`, category);
    },

    /**
     * delete
     * @param {*} category 
     * @returns 
     */
    delete: (category) => {
        return axiosClient.delete(`${PROJECT_URL}/${category.id}`);
    },

    /**
     * create
     * @param {*} category 
     * @returns 
     */
    create: (category) => {
        return axiosClient.post(`${PROJECT_URL}`, category);
    },

    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        if(!payload.productId){
            var url = `${PROJECT_URL}/search?status=1&search=${payload.search || ""}&page=${payload.page}&size=${payload.size}&sort=name,asc`
        }else{
            var url = `${PROJECT_URL}/search?status=1&search=${payload.search || ""}&page=${payload.page}&productId=${payload.productId}&size=${payload.size}&sort=name,asc`
        }
        return axiosClient.get(url);
    },

    // /**
    //  * change task state
    //  * @param {*} id 
    //  * @param {*} state 
    //  */
    // changeState: (id, state) => {
    //     return axiosClient.put(`${ROOT_API}/state/${id}/${state}?include=next-states`, {});
    // },


}

export default CrmCategoryApi;

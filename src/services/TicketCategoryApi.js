// http://api.ngs.vn/nspace/ticket/category/search?search=&sort=name

import axiosClient from 'services/axiosClient'

const ROOT_API = 'ticket/category';

const TicketCategoryApi = {
    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        if(payload.group ===undefined){
            var url = `${ROOT_API}/search?status=1&search=${payload.search || ""}&page=${payload.page}&size=${payload.size}&sort=name,asc`
        }else{
            var url = `${ROOT_API}/search?status=1&search=${payload.search || ""}&page=${payload.page}&groupId=${payload.group}&size=${payload.size}&sort=name,asc`
        }
        return axiosClient.get(url);
    },

    /**
     * change task state
     * @param {*} id 
     * @param {*} state 
     */
    changeState: (id, state) => {
        return axiosClient.put(`${ROOT_API}/state/${id}/${state}?include=next-states`, {});
    },

    /**
     * get
     * @param {*} id 
     * @returns 
     */
    get: (id) => {
        return axiosClient.get(`${ROOT_API}/${id}`);
    },

    /**
     * create
     * @param {*} category 
     * @returns 
     */
    create: (category) => {
        return axiosClient.post(`${ROOT_API}`, category);
    },

    /**
     * update
     * @param {*} category 
     * @returns 
     */
    update: (category) => {
        return axiosClient.put(`${ROOT_API}/${category.id}`, category);
    },

    /**
     * delete
     * @param {*} category 
     * @returns 
     */
    delete: (category) => {
        return axiosClient.delete(`${ROOT_API}/${category.id}`);
    },


}

export default TicketCategoryApi;

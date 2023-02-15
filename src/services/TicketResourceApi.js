// http://api.ngs.vn/nspace/ticket/resource/search?search=&sort=name

import axiosClient from 'services/axiosClient'

const ROOT_API = 'ticket/resource';

const TicketResourceApi = {
    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        var url = `${ROOT_API}/search?status=1&search=${payload.search || ""}&page=${payload.page}&size=${payload.size}&sort=name,asc`
        return axiosClient.get(url);
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
     * @param {*} resource 
     * @returns 
     */
    create: (resource) => {
        return axiosClient.post(`${ROOT_API}`, resource);
    },

    /**
     * update
     * @param {*} resource 
     * @returns 
     */
    update: (resource) => {
        return axiosClient.put(`${ROOT_API}/${resource.id}`, resource);
    },

    /**
     * delete
     * @param {*} resource 
     * @returns 
     */
    delete: (resource) => {
        return axiosClient.delete(`${ROOT_API}/${resource.id}`);
    },
    
 

}

export default TicketResourceApi;

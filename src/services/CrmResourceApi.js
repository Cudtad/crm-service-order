// http://api.ngs.vn/nspace/ticket/resource/search?search=&sort=name

import axiosClient from 'services/axiosClient'

const HOST = "crm-service";
const PROJECT_URL = `${HOST}/resource`;

const CrmResourceApi = {

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
     * @param {*} resource 
     * @returns 
     */
    update: (resource) => {
        return axiosClient.put(`${PROJECT_URL}/${resource.id}`, resource);
    },

    /**
     * delete
     * @param {*} resource 
     * @returns 
     */
    delete: (resource) => {
        return axiosClient.delete(`${PROJECT_URL}/${resource.id}`);
    },

    /**
     * create
     * @param {*} resource 
     * @returns 
     */
    create: (resource) => {
        return axiosClient.post(`${PROJECT_URL}`, resource);
    },
    
    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        var url = `${PROJECT_URL}/search?${payload.status != null ? `status=${payload.status}&` : ``}search=${payload.search || ""}&page=${payload.page}&size=${payload.size}&sort=name,asc`
        return axiosClient.get(url);
    },
 

}

export default CrmResourceApi;

// http://api.ngs.vn/nspace/ticket/sla/search?search=&sort=name

import axiosClient from 'services/axiosClient'

const ROOT_API = 'crm-service/sla';

const CrmSlaApi = {
    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        var url = `${ROOT_API}/search?status=1&search=${payload.search || ""}&page=${payload.page}&size=${payload.size}&sort=name,asc`
        return axiosClient.get(url);
    },

    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    listschema: () => {
        var url = `config/time/all-active/`
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
     * @param {*} sla 
     * @returns 
     */
    create: (sla) => {
        return axiosClient.post(`${ROOT_API}`, sla);
    },

    /**
     * update
     * @param {*} sla 
     * @returns 
     */
    update: (sla) => {
        return axiosClient.put(`${ROOT_API}/${sla.id}`, sla);
    },

    /**
     * delete
     * @param {*} sla 
     * @returns 
     */
    delete: (sla) => {
        return axiosClient.delete(`${ROOT_API}/${sla.id}`);
    },
    
    getById: (id) => {
        return axiosClient.get(`config/time/schema/${id}`);
    },
    getByDefault: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.get(`config/time/default-schema`, {
            params: {
                status: payload.status
            }
        });
    },

}

export default CrmSlaApi;

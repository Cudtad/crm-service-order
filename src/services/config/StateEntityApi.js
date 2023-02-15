import axios from 'axios';
import axiosClient from 'services/axiosClient'

const HOST = 'config/entity-config';

const StateEntityApi = {

    /**
     * get
     * @param {*} id
     * @returns
     */
    get: (id) => {
        return axiosClient.get(`${HOST}/${id}`);
    },
    /**
     * get
     * @param {*} id
     * @returns
     */
    getByCodeType: (application, type, code, header) => {
        return axiosClient.get(`${HOST}/byCodeType?application=${application}&type=${type}&code=${code}`, {
            headers: {...header}
        });
    },

    /**
     * create
     * @param {*} entity
     * @returns
     */
    create: (payload) => {
        return axiosClient.post(`${HOST}`, payload);
    },

    /**
     * update
     * @param {*} entity
     * @returns
     */
    update: (payload) => {
        return axiosClient.put(`${HOST}/${payload.id}`, payload);
    },

}

export default StateEntityApi;

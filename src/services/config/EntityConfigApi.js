import axiosClient from 'services/axiosClient'

const ENTITY_CONFIG_API = 'config/entity-config';

const EntityConfigApi = {
    /**
     * get
     * @param {*} id
     * @returns
     */
    search: (payload) => {
        return axiosClient.get(`${ENTITY_CONFIG_API}/search`, {
            params: {
                ...payload
            }
        });
    },

    /**
     * get
     * @param {*} id
     * @returns
     */
    get: (id) => {
        return axiosClient.get(`${ENTITY_CONFIG_API}/${id}`);
    },

    /**
     * create
     * @param {*} entity
     * @returns
     */
    create: (config) => {
        return axiosClient.post(ENTITY_CONFIG_API, config);
    },

    /**
     * update
     * @param {*} entity
     * @returns
     */
    update: (config) => {
        return axiosClient.put(`${ENTITY_CONFIG_API}/${config.id}`, config);
    },

    /**
     * delete
     * @param {*} id
     * @returns
     */
    delete: (id) => {
        return axiosClient.delete(`${ENTITY_CONFIG_API}/${id}`);
    }

}

export default EntityConfigApi;

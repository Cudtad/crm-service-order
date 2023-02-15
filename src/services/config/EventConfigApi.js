import axiosClient from 'services/axiosClient'

const EVENT_CONFIG_API = 'event/event-configs';

const EventConfigApi = {
    /**
     * get
     * @param {*} id
     * @returns
     */
    search: (payload) => {
        return axiosClient.get(`${EVENT_CONFIG_API}/search`,
            {
                params: {
                    ...payload
                }
            }
        );
    },
    /**
    * get all
    * @returns
    */
    getAll: () => {
        return axiosClient.get(`${EVENT_CONFIG_API}`);
    },
    /**
     * get
     * @param {*} id
     * @returns
     */
    get: (id) => {
        return axiosClient.get(`${EVENT_CONFIG_API}/${id}`);
    },

    /**
     * create
     * @param {*} entity
     * @returns
     */
    create: (config) => {
        return axiosClient.post(EVENT_CONFIG_API, config);
    },

    /**
     * update
     * @param {*} entity
     * @returns
     */
    update: (config) => {
        return axiosClient.put(`${EVENT_CONFIG_API}/${config.id}`, config);
    },

    /**
     * delete
     * @param {*} id
     * @returns
     */
    delete: (id) => {
        return axiosClient.delete(`${EVENT_CONFIG_API}/${id}`);
    }

}

export default EventConfigApi;

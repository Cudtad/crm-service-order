import axiosClient from 'services/axiosClient'

const NOTICE_API = 'config/notice-config';

const NoticeConfigApi = {
    search: (payload) => {
        return axiosClient.get(`${NOTICE_API}/search`, {
            params: {
                ...payload
            }
        });
    },

    /**
     * get by entity type
     * @param {*} application
     * @param {*} type
     * @returns
     */
    getByEntityType: (application, code) => {
        return axiosClient.get(`${NOTICE_API}/byCode?code=${code}&application=${application}`);
    },

    /**
     * get
     * @param {*} id
     * @returns
     */
    get: (id) => {
        return axiosClient.get(`${NOTICE_API}/${id}`);
    },

    /**
     * create rule action
     * @param {*} body
     */
    create: (body) => {
        return axiosClient.post(NOTICE_API, body);
    },

    /**
     * update rule action
     * @param {*} body
     */
    update: (body) => {
        return axiosClient.put(`${NOTICE_API}/${body.id}`, body);
    },

    /**
     * delete rule action
     * @param {*} body
     */
    delete: (id) => {
        return axiosClient.delete(`${NOTICE_API}/${id}`);
    }

}

export default NoticeConfigApi;

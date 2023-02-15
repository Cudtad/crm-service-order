import axiosClient from './axiosClient'

const ACTION_URL = 'account/action';


const ActionApi = {
    get: (payload) => {
        return axiosClient.get(`${ACTION_URL + (payload.filter ? '/search' : '/search')}`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                status: payload.status ? payload.status.code : '-1'
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${ACTION_URL}/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ACTION_URL}/create`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ACTION_URL}/update`, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${ACTION_URL}/${payload.id}`);
    }
}

export default ActionApi;

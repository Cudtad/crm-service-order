import axiosClient from './axiosClient'

const ROOT_URL = 'account/resource';
// const ROOT_URL = 'http://localhost:8082/resource';

const ResourceApi = {
    get: (payload) => {
        return axiosClient.get(`${ROOT_URL + (payload.filter ? '/search' : '/all')}`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                application: payload.application,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${ROOT_URL}/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROOT_URL}/create`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_URL}/update`, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${ROOT_URL}/${payload.id}`);
    }
}

export default ResourceApi;

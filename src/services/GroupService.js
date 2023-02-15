import axiosClient from './axiosClient'

// const GROUP_API = "http://localhost:8082/group";
const GROUP_API = "account/group";
const ACCOUNT_API = "account/api";

const GroupApi = {
    get: (payload) => {
        return axiosClient.get(`${GROUP_API + (payload.filter || payload.type ? '/search' : '/search')}`, {
            params: {
                type: payload.type,
                search: payload.filter,
                rootGroupId: payload.rootGroupId,
                page: payload.page,
                size: payload.rows,
                status: payload.status ? payload.status : -1,
                parentId: payload.parentId ? payload.parentId : -1,
                sort: (payload.sortField ? payload.sortField : "name") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${GROUP_API}/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ACCOUNT_API}/group/create`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ACCOUNT_API}/group/${payload.id}`, payload);
    },

    grantUsers: (id, payload) => {
        return axiosClient.put(`${GROUP_API}/grant-group-users/${id}`, payload);
    },

    getByIds: (payload, params) => {
        return axiosClient.post(`${GROUP_API}/byIds`, payload, {
            params: params
        });
    },

    getTotalUserByGroup: () => {
        return axiosClient.get(`${GROUP_API}/total-users-by-group`)
    },
}

export default GroupApi;

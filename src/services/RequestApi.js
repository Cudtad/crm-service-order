import axiosClient from './axiosClient'

// const HOST = 'http://localhost:8086/';
const HOST = 'task/';

const BASE_URL = `${HOST}/request`;
const WORKFLOW_URL = `${HOST}/workflow`;
const ASSIGN_CONFIG_GROUP_URL = `wf/request/assign-config/assign-group`;
const ASSIGN_CONFIG_TEMPLATE_URL = `wf/request/assign-config/assign-template`;
const ASSIGN_DELEGATE_URL = `wf/request/assign-config/assign-delegate`;

const RequestApi = {
    initRequest: (workflowId, userGroupIds) => {
        // return axiosClient.get(`${BASE_URL}/init/${workflowId}?groupIds=${userGroupIds}`);
        return axiosClient.post(`${BASE_URL}/init/${workflowId}`, { groupIds: userGroupIds || null });
    },

    getUserRequets: (lazy, condition) => {
        let url = `${BASE_URL}/user-requests?page=${lazy.page}&size=${lazy.pageSize}`;
        return axiosClient.post(url, condition);
    },

    get: (id) => {
        let url = `${BASE_URL}/${id}`;
        return axiosClient.get(url);
    },

    getHistory: (id, payload) => {
        let url = `${BASE_URL}/history/search/${id}?page=${payload.page}&size=${payload.size}`;
        return axiosClient.get(url);
    },

    create: (groupIds, payload) => {
        // let url = `${BASE_URL}?groupIds=${groupIds}`;
        // return axiosClient.post(url, payload);
        payload = payload || {};
        payload.userGroupIds  = groupIds || null;
        let url = `${BASE_URL}?groupIds=`;
        return axiosClient.post(url, payload);

    },

    getWorkflowsByUser: (groupIds) => {
        // return axiosClient.get(`${WORKFLOW_URL}/byUser?groupIds=${groupIds}`);
        return axiosClient.post(`${WORKFLOW_URL}/byUser`, { groupIds: groupIds || null });
    },

    assignConfig: {
        group: {
            list: (page, size) => {
                const url = `${ASSIGN_CONFIG_GROUP_URL}/all?&page=${page || "0"}&size=${size || "999"}`;
                return axiosClient.get(url);
            },
            create: (payload) => {
                const url = `${ASSIGN_CONFIG_GROUP_URL}`;
                return axiosClient.post(url, payload);
            },
            update: (id, payload) => {
                const url = `${ASSIGN_CONFIG_GROUP_URL}/${id}`;
                return axiosClient.put(url, payload);
            },
            get: (id) => {
                let url = `${ASSIGN_CONFIG_GROUP_URL}/${id}`;
                return axiosClient.get(url);
            },
            getActive: () => {
                const url = `${ASSIGN_CONFIG_GROUP_URL}/active`;
                return axiosClient.get(url);
            }
        },
        template: {
            list: (page, size) => {
                let url = `${ASSIGN_CONFIG_TEMPLATE_URL}/all?&page=${page || "0"}&size=${size || "999"}`;
                return axiosClient.get(url);
            },
            create: (payload) => {
                const url = `${ASSIGN_CONFIG_TEMPLATE_URL}`;
                return axiosClient.post(url, payload);
            },
            update: (id, payload) => {
                const url = `${ASSIGN_CONFIG_TEMPLATE_URL}/${id}`;
                return axiosClient.put(url, payload);
            },
            get: (id) => {
                let url = `${ASSIGN_CONFIG_TEMPLATE_URL}/${id}`;
                return axiosClient.get(url);
            },
            updateConfig: (id, payload) => {
                const url = `${ASSIGN_CONFIG_TEMPLATE_URL}/config/${id}`;
                return axiosClient.put(url, payload);
            },
            getConfig: (id) => {
                let url = `${ASSIGN_CONFIG_TEMPLATE_URL}/config/${id}`;
                return axiosClient.get(url);
            }
        },
        delegate: {
            list: (page, size) => {
                let url = `${ASSIGN_DELEGATE_URL}/user?&page=${page || "0"}&size=${size || "999"}`;
                return axiosClient.get(url);
            },
            create: (payload) => {
                const url = `${ASSIGN_DELEGATE_URL}`;
                return axiosClient.post(url, payload);
            },
            update: (id, payload) => {
                const url = `${ASSIGN_DELEGATE_URL}/${id}`;
                return axiosClient.put(url, payload);
            },
            get: (id) => {
                let url = `${ASSIGN_DELEGATE_URL}/${id}`;
                return axiosClient.get(url);
            },
        }
    }
}

export default RequestApi;

import axiosClient from "./axiosClient";

const ROOT_URL = "project/category";
const PROJECT_URL = "project/category/project";
// const ROOT_URL = "http://localhost:8092/category";

const ProjectEntryApi = {
    get: (payload) => {
        return axiosClient.get(`${ROOT_URL + '/search'}`, {
            params: {
                search: payload.filter,
                page: 0,
                size: payload.rows || 9999,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                type: payload.type ? payload.type.code : null,
                status: payload.status ? payload.status.code : '-1',
                projectId: payload.projectId
            }
        });
    },

    getByType: (type) => {
        return axiosClient.get(`${PROJECT_URL}/${type}`);
    },

    getById: (id) => {
        return axiosClient.get(`${ROOT_URL}/by-id/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROOT_URL}/create`, payload)
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_URL}/update`, payload)
    },

    disable: (payload) => {
        return axiosClient.put(`${ROOT_URL}/disable`, {
            id: payload.id,
            type: payload.type,
            code: payload.code,
            name: payload.name,
            status: payload.status
        })
    },

    enable: (payload) => {
        return axiosClient.put(`${ROOT_URL}/enable`, {
            id: payload.id,
            type: payload.type,
            code: payload.code,
            name: payload.name,
            status: payload.status
        })
    }
}

export default ProjectEntryApi;

import axiosClient from "./axiosClient";

// const ROOT_URL = "http://localhost:8092/phase";
const ROOT_URL = "project/phase";

const PhaseApi = {
    get: (payload) => {
        return axiosClient.get(`${ROOT_URL}/search`, {
            params: {
                projectId: payload.projectId,
                versionId: payload.versionId,
                phaseCategory: payload.phaseCategoryId,
                step: payload.step,
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                status: payload.status,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${ROOT_URL}/by-id/${id}`)
    },

    getDisplayById: (id) => {
        return axiosClient.get(`${ROOT_URL}/display-by-id/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${ROOT_URL}/create`, payload);
    },

    update: (payload) => {
        return axiosClient.put(`${ROOT_URL}/update`, payload);
    },

    delete: (id) => {
        return axiosClient.delete(`${ROOT_URL}/delete/${id}`)
    }

    // disable: (payload) => {
    //     return axiosClient.put(`${ROOT_URL}/disable`, payload);
    // },
    //
    // enable: (payload) => {
    //     return axiosClient.put(`${ROOT_URL}/enable`, payload);
    // }
}

export default PhaseApi;

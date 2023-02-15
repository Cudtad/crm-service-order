import axiosClient from "./axiosClient";

// const ROOT_URL = "http://localhost:8093/work-package"
const ROOT_URL = "project/work-package"

const WorkPackageApi = {
    get: (payload) => {
        return axiosClient.get(`${ROOT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                projectId: payload.projectId,
                phaseId: payload.phaseId ? payload.phaseId : '-1',
                versionId: payload.versionId ? payload.versionId : '-1',
                status: payload.status,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        })
    },
    getById: (id) => {
        return axiosClient.get(`${ROOT_URL}/by-id/${id}`);
    },
    getDisplayById: (id) => {
        return axiosClient.get(`${ROOT_URL}/display-by-id/${id}`);
    },
    getWorkPackage: (phase_id) => {
        return axiosClient.get(`${ROOT_URL}/get-all/${phase_id}`);
    },
    create: (payload) => {
        return axiosClient.post(`${ROOT_URL}/create`, payload)
    },

    update: (payload) => {
        return axiosClient.put(`${ROOT_URL}/update`, payload)
    },

    delete: (id) => {
        return axiosClient.delete(`${ROOT_URL}/delete/${id}`)
    },

    getChildren: (payload) => {

    }

}

export default WorkPackageApi;

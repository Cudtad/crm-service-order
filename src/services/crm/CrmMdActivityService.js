import axiosClient from "../axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/activity`;


export const CrmMdActivityApi = {

    getById: (payload, id) => {
        const subUrl = payload.include ? `?include=${payload.include.join(`,`)}` : ``
        return axiosClient.get(`${PROJECT_URL}/${id}${subUrl}`);
    },

    update: (payload, id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}?include=next-states`, {
            task: payload.task,
            involves: payload.involves,
            checklists: payload.checklists,
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },
    stop: (id) => {
        return axiosClient.put(`${PROJECT_URL}/stop/${id}?include=next-states`);
    },
    changeState: (id, state) => {
        return axiosClient.put(`${PROJECT_URL}/state/${id}/${state}?include=next-states`, {});
    },
    start: (id) => {
        return axiosClient.put(`${PROJECT_URL}/start/${id}?include=next-states`);
    },
    reprocess: (id) => {
        return axiosClient.put(`${PROJECT_URL}/reprocess/${id}?include=next-states`);
    },
    finish: (id) => {
        return axiosClient.put(`${PROJECT_URL}/finish/${id}?include=next-states`);
    },
    cancel: (id) => {
        return axiosClient.put(`${PROJECT_URL}/cancel/${id}?include=next-states`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}?include=next-states`, {
            task: payload.task,
            involves: payload.involves,
            checklists: payload.checklists,
        })
    },

    summary: (payload) => {
        return axiosClient.post(`${PROJECT_URL}/summary`, payload.body)
    },

    list: (payload) => {
        var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
        var url = `${PROJECT_URL}/filter?page=${payload.page}&size=${payload.size}&sort=${sort}`
        return axiosClient.post(`${url}`, payload.body)
    },

    getState: (id) => {
        return axiosClient.get(`${PROJECT_URL}/state/${id}`)
    },

    getInvolveRole: (application, entityName, entityId) => {
        return axiosClient.get(`${PROJECT_URL}/involve-role/${application}/${entityName}/${entityId}`)
    },

    getHistories: (id) => {
        return axiosClient.get(`${PROJECT_URL}/histories/${id}`)
    },

    getData: (id) => {
        return axiosClient.get(`${PROJECT_URL}/data/${id}`)
    },
}

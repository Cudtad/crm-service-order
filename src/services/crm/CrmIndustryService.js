import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/industry`;


export const CrmIndustryApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },

    getAll: (data) => {
        return axiosClient.get(`${PROJECT_URL}/search` ,{
            params: {
                page: data.page,
                size: data.size,
                search : data.search,
                sort: (data.sortField ? data.sortField : "id") + (data.sortOrder < 0 ? ",desc" : "")
            }
        })
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            industryName: payload.industryName,
            status: payload.status
        });
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            industryName: payload.industryName,
            status: payload.status
        })
    },
}

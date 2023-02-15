import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/authorization-group`;


export const CrmAuthorizationGroupAPI = {

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            authorizationGroupName: payload.authorizationGroupName,
            authorizationGroupCode: payload.authorizationGroupCode,
            status : payload.status
        });
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            authorizationGroupName: payload.authorizationGroupName,
            authorizationGroupCode: payload.authorizationGroupCode,
            status : payload.status
        })
    },

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                status : payload.status
            }
        })
    },

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`,{
            params : { status: payload.status }
        })
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    }
}

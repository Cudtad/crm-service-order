import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/price`;


export const CrmPriceApi = {
    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            description: payload.description,
            priceCode: payload.priceCode,
            priceName: payload.priceName,
            isStandard: payload.isStandard,
            isActive: payload.isActive
        })
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            description: payload.description,
            priceCode: payload.priceCode,
            priceName: payload.priceName,
            isStandard: payload.isStandard,
            isActive: payload.isActive
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`, {
            params: {
                status: payload.status
            }
        })
    },

    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },
}

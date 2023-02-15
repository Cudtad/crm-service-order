import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/product-family`;


export const CrmProductFamilyApi = {
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
            productFamilyCode: payload.productFamilyCode,
            productFamilyName: payload.productFamilyName
        })
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            description: payload.description,
            productFamilyCode: payload.productFamilyCode,
            productFamilyName: payload.productFamilyName
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
}

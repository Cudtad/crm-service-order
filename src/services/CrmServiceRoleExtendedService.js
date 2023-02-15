import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-role-extended`;


export const CrmServiceRoleExtendedApi = {

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    createUpdate: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            id: payload.id,
            productId: payload.productId,
            categoryId: payload.categoryId
        })
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

import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-order-material`;


export const CrmServiceServiceOrderMaterialApi = {

    get: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`)
    },
    getItems: (id) => {
        return axiosClient.get(`${PROJECT_URL}/item/${id}`)
    },

    // getById: (id) => {
    //     return axiosClient.get(`${PROJECT_URL}/${id}`)
    // },

    // delete: (id) => {
    //     return axiosClient.delete(`${PROJECT_URL}/${id}`)
    // },

    update: (payload, id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, payload);
    },

    create: (payload, id) => {
        return axiosClient.post(`${PROJECT_URL}/${id}`, payload)
    },

}

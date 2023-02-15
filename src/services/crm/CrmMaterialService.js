import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/material`;


export const CrmMaterialApi = {

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/getAll`, {
            params: {
                status: payload.status
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },
}

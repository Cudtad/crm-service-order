import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/user-admin`;


export const CrmUserAdminApi = {

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            uid: payload.uid,
            username: payload.username,
        })
    },

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/getAll`, {
            params: {
                status: payload.status
            }
        })
    },
    
    
    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

}

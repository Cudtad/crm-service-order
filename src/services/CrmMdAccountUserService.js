import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/account-user`;


export const CrmMdAccountUserApi = {

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            accountId: payload.accountId,
            userId: payload.userId,
            description: payload.description,
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            accountId: payload.accountId,
            userId: payload.userId,
            description: payload.description,
        })
    },

    get: (id) => {
        return axiosClient.get(`${PROJECT_URL}/account/${id}`)
    },

}

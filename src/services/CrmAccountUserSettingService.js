import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/account-user-setting`;


export const CrmAccountUserSettingApi = {

    get: (accountId) => {
        return axiosClient.get(`${PROJECT_URL}/config/${accountId}`)
    },

    update: (payload, accountId) => {
        return axiosClient.put(`${PROJECT_URL}/config/${accountId}`, {
            ...payload
        })
    },
}

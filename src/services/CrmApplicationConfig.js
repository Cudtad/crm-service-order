import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/application-config`;


export const CrmApplicationConfigApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}/config`)
    },

    update: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/config`, {
            ...payload
        })
    },

    getMainConfig: () => {
        return axiosClient.get(`${PROJECT_URL}/mainConfig`)
    },
}

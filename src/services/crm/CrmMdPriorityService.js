import axiosClient from "../axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/priority`;


export const CrmMdPriorityApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },
}

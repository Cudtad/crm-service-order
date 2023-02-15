import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/document-type`;


export const CrmDocumentTypeApi = {

    get: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`)
    },
}

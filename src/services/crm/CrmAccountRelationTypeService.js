import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/account-relation-type`;


export const CrmAccountRelationTypeApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },
}

import axiosClient from "services/axiosClient";

const HOST = "crm-sale";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/lead-stage`;


export const CrmSaleLeadStageApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },

    getReason: (id) => {
        return axiosClient.get(`${PROJECT_URL}-reason/${id}`)
    },

}

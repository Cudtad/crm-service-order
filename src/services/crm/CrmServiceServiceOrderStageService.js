import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-order-stage`;


export const CrmServiceServiceOrderStageApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },
}

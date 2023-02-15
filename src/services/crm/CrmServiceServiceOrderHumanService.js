import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-party-involved/serviceOrder`;


export const CrmServiceServiceOrderHumanApi = {

    get: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`)
    },


    create: (payload, id) => {
        return axiosClient.post(`${PROJECT_URL}/${id}`, payload)
    },

}

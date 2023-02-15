import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/district`;


export const CrmDistrictApi = {

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}`, {
            params: {
                provinceId: payload.provinceId
            }
        })
    },
}

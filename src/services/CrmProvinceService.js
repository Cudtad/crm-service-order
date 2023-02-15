import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/province`;


export const CrmProvinceApi = {

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}`, {
            params: {
                countryId: payload.countryId
            }
        })
    },
}

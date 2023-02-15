import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/country-time-zone`;


export const CrmCountryTimeZoneApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },
}

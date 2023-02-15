import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/employee-contract`;


export const CrmEmployeeContractApi = {


    get: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },
}

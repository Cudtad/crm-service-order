import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/material-unit`;


export const CrmMdMaterialUnitApi = {

    get: () => {
        return axiosClient.get(`${PROJECT_URL}`);
    },

}

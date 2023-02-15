import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-order-material-item`;


export const CrmServiceServiceOrderMaterialItemApi = {

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`)
    }

}

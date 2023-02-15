import axiosClient from "services/axiosClient";

// const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `account/user`;


export const CrmAccountUserApi = {

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.search,
                size: payload.size
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    getUserMenuPermission: (menuTypes, application, refType, refId) => {
        // return axiosClient.get(`${USER_URL}/menu-permission?menuTypes=${menuTypes}&application=${application}&refType=${refType}&refId=${refId}`)
        return axiosClient.post(`${PROJECT_URL}/menu-permission`, {
            application: application,
            refType: refType,
            refId: refId,
            menuTypes: Array.isArray(menuTypes) ? menuTypes : [menuTypes]
        })
    },
}

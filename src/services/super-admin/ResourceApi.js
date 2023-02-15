import axiosClient from 'services/axiosClient'

const BASE_URL = 'account/resource';

const ResourceApi = {

    getMenu: (application, types) => {
        return axiosClient.get(`${BASE_URL}/get-menu?application=${application}&types=${types || ""}`);
    },

    getApi: () => {
        return axiosClient.get(`${BASE_URL}/get-api`);
    },

    getApiAction: (apiId) => {
        return axiosClient.get(`${BASE_URL}/get-api-actions/${apiId}`);
    },

    getMenuApiActions: (resourceId) => {
        return axiosClient.get(`${BASE_URL}/get-menu-api-actions/${resourceId}`);
    },

    grantMenuApiActions: (resourceId, payload) => {
        return axiosClient.put(`${BASE_URL}/grant-menu-api-actions/${resourceId}`, payload);
    }

}

export default ResourceApi;

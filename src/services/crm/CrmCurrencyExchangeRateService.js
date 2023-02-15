import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/currency-exchange-rate`;


export const CrmMdCurrencyExchangeRateApi = {
    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            currencyId: payload.currencyId,
            conversionRate: payload.conversionRate,
            decimalPlace: payload.decimalPlace
        })
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            currencyId: payload.currencyId,
            conversionRate: payload.conversionRate,
            decimalPlace: payload.decimalPlace
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },
    
    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },
    
    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`, {
            params: {
                status: payload.status
            }
        })
    },
}

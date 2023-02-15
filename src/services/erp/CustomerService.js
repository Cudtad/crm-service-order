import axiosClient from "services/axiosClient";

const CUSTOMER_URL = '/customer/customer';
// const CUSTOMER_URL = 'http://localhost:8096/customer';

const CustomerApi = {
    search: (payload) => {
        return axiosClient.get(`${CUSTOMER_URL}/search`, {
            params: {
                code: payload.code || "",
                search: payload.search,
                status: payload.status,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${CUSTOMER_URL}/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${CUSTOMER_URL}`, payload);
    },

    update: (payload) => {
        return axiosClient.put(`${CUSTOMER_URL}/${payload.id}`, payload);
    }
}

export default CustomerApi;

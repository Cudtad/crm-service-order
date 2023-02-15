import axiosClient from "./axiosClient";
const TERRITORY_URL = "config/territory";

const TerritoryApi = {
    get: (payload) => {
        return axiosClient.get(`${TERRITORY_URL + (payload.filter ? "/search" : "/search")}`, {
            params: {
                search: payload.filter,
                page: payload.page || 0,
                size: payload.rows || 20,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                type: payload.type,
                parent: payload.parent,
                status: payload.status,
            },
        });
    },

    getById: (id) => {
        return axiosClient.get(`${TERRITORY_URL}/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(TERRITORY_URL, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(TERRITORY_URL, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${TERRITORY_URL}/${payload.id}`);
    },
};

export default TerritoryApi;

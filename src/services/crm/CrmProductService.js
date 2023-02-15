import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/product`;


export const CrmProductApi = {
    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),

            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },
    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },
    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            description: payload.description,
            productCode: payload.productCode,
            productName: payload.productName,
            productFamilyId: payload.productFamilyId,
            warrantyDuration: payload.warrantyDuration,
            durationUnitId: payload.durationUnitId
        })
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            description: payload.description,
            productCode: payload.productCode,
            productName: payload.productName,
            productFamilyId: payload.productFamilyId,
            warrantyDuration: payload.warrantyDuration,
            durationUnitId: payload.durationUnitId
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`, {
            params: {
                status: payload.status
            }
        })
    },
    getByIds: (ids) => {
        return axiosClient.get(`${PROJECT_URL}/searchByIds?ids=${ids.join(`,`)}`)
    },
}

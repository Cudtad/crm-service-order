import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/organization`;


export const CrmOrganizationApi = {
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
            organizationCode: payload.organizationCode,
            organizationName: payload.organizationName,
            parentOrganizationId: payload.parentOrganizationId,
            reportToOrganizationId: payload.reportToOrganizationId,
            employeeInChargeId: payload.employeeInChargeId,
            status: payload.status
        })
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            organizationCode: payload.organizationCode,
            organizationName: payload.organizationName,
            parentOrganizationId: payload.parentOrganizationId,
            reportToOrganizationId: payload.reportToOrganizationId,
            employeeInChargeId: payload.employeeInChargeId,
            status: payload.status
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
}

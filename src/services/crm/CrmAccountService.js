import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/account`;


export const CrmAccountApi = {

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            accountName: payload.accountName,
            accountTypeId: payload.accountTypeId,
            accountPhone: payload.accountPhone,
            accountEmail: payload.accountEmail,
            genderId: payload.genderId,
            industryId: payload.industryId,
            accountDescription: payload.accountDescription,
            accountAddresses: payload.accountAddresses,
            parentAccountId: payload.parentAccountId,
            ownerEmployeeId: payload.ownerEmployeeId,
            accountDocuments: payload.accountDocuments
        });
    },

    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            accountName: payload.accountName,
            accountTypeId: payload.accountTypeId,
            accountPhone: payload.accountPhone,
            accountEmail: payload.accountEmail,
            genderId: payload.genderId,
            industryId: payload.industryId,
            accountDescription: payload.accountDescription,
            accountAddresses: payload.accountAddresses,
            parentAccountId: payload.parentAccountId,
            ownerEmployeeId: payload.ownerEmployeeId,
            accountDocuments: payload.accountDocuments
        })
    },

    getByUserId: (id) => {
        return axiosClient.get(`${PROJECT_URL}/user`)
    },

    getByAnyUserId: (id) => {
        return axiosClient.get(`${PROJECT_URL}/user/${id}`)
    },

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

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    getAllNonPermission: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/non-permission/all`, {
            params: {
                status: payload.status
            }
        })
    },
}

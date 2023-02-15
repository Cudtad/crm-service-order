import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/contact`;


export const CrmContactApi = {

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            contactName: payload.contactName,
            contactSalutationId: payload.contactSalutationId,
            contactPhone: payload.contactPhone,
            contactEmail: payload.contactEmail,
            genderId: payload.genderId,
            ownerEmployeeId:payload.ownerEmployeeId,
            contactTitle: payload.contactTitle,
            contactDescription: payload.contactDescription,
            contactBillingStreet: payload.contactBillingStreet,
            contactBillingWardId: payload.contactBillingWardId,
            contactBillingDistrictId: payload.contactBillingDistrictId,
            contactBillingProvinceId: payload.contactBillingProvinceId,
            contactBillingCountryId: payload.contactBillingCountryId,
            contactBillingPostalCode: payload.contactBillingPostalCode,
            contactShippingStreet: payload.contactShippingStreet,
            contactShippingWardId: payload.contactShippingWardId,
            contactShippingDistrictId: payload.contactShippingDistrictId,
            contactShippingProvinceId: payload.contactShippingProvinceId,
            contactShippingCountryId: payload.contactShippingCountryId,
            contactShippingPostalCode: payload.contactShippingPostalCode,
            accountId : payload.accountId,
            accountRelationTypeId : payload.accountRelationTypeId
        });
    },

    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            contactName: payload.contactName,
            contactSalutationId: payload.contactSalutationId,
            contactPhone: payload.contactPhone,
            contactEmail: payload.contactEmail,
            genderId: payload.genderId,
            contactTitle: payload.contactTitle,
            ownerEmployeeId:payload.ownerEmployeeId,
            contactDescription: payload.contactDescription,
            contactBillingStreet: payload.contactBillingStreet,
            contactBillingWardId: payload.contactBillingWardId,
            contactBillingDistrictId: payload.contactBillingDistrictId,
            contactBillingProvinceId: payload.contactBillingProvinceId,
            contactBillingCountryId: payload.contactBillingCountryId,
            contactBillingPostalCode: payload.contactBillingPostalCode,
            contactShippingStreet: payload.contactShippingStreet,
            contactShippingWardId: payload.contactShippingWardId,
            contactShippingDistrictId: payload.contactShippingDistrictId,
            contactShippingProvinceId: payload.contactShippingProvinceId,
            contactShippingCountryId: payload.contactShippingCountryId,
            contactShippingPostalCode: payload.contactShippingPostalCode,
            contactUUID : payload.contactUUID,
            accountRelationTypeId: payload.accountRelationTypeId,
            accountId : payload.accountId,
        })
    },

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                genderId: payload.genderId?.join(',') ,
                contactBillingCountryId: payload.contactBillingCountryId,
                contactBillingProvinceId: payload.contactBillingProvinceId,
                contactBillingDistrictId: payload.contactBillingDistrictId,
                contactBillingWardId: payload.contactBillingWardId,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        })
    },

    getAll: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`, {
            params: {
                status: payload.status,
            }
        })
    },

    getByAccountId: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search/all`, {
            params: {
                status: payload.status,
                accountId : payload.accountId 
            }
        })
    },

    getRelatedAccount: (id) => {
        return axiosClient.get(`${PROJECT_URL}/account/${id}`);
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    }
}

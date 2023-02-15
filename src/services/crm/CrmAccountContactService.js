import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/account-contact`;


export const CrmAccountContactApi = {

    createRelatedAccountAccount: (payload) => {
        return axiosClient.post(`${PROJECT_URL}/account-account`, {
            accountId: payload.accountId,
            currentAccountId: payload.currentAccountId,
            accountRelationTypeId: payload.accountRelationTypeId,
        })
    },

    createRelatedContact: (payload) => {
        return axiosClient.post(`${PROJECT_URL}/account`, {
            contactIds: payload.contactIds,
            accountId: payload.accountId,
            accountRelationTypeId: payload.accountRelationTypeId
        })
    },

    update: (payload, id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            accountRelationTypeId: payload.accountRelationTypeId
        })
    },

    getRelatedContact: (id) => {
        return axiosClient.get(`${PROJECT_URL}/contact/${id}`)
    },

    getRelatedAccount: (id, payload) => {
        return axiosClient.get(`${PROJECT_URL}/account/${id}`, {
            params: {
                objectTypeId: payload?.objectTypeId
            }
        })
    },

    getRelatedAccountContactById: (id, contactId) => {
        return axiosClient.get(`${PROJECT_URL}/account/${id}/contact/${contactId}`)
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

}

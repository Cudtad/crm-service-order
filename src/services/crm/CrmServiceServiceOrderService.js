import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-order`;


export const CrmServiceServiceOrderApi = {

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                searcserviceOrderStageIdh: payload.filter,
                page: payload.page,
                size: payload.rows,
                ownerEmployeeId: payload.ownerEmployeeId?.join(','),
                productId: payload.productId?.join(','),
                accountId: payload.accountId?.join(','),
                serviceOrderStageId: payload.serviceOrderStageId?.join(','),
                startDate: payload.startDate,
                endDate: payload.endDate,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
            }
        })
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`)
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`)
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            serviceOrderCode: payload.serviceOrderCode,
            accountId: payload.accountId,
            serviceOrderCode: payload.serviceOrderCode,
            serviceOrderName: payload.serviceOrderName,
            serviceOrderStageId: payload.serviceOrderStageId,
            currencyExchangeRateId: payload.currencyExchangeRateId,
            startDate: payload.startDate,
            endDate: payload.endDate,
            ownerEmployeeId: payload.ownerEmployeeId,
            appointmentLocation: payload.appointmentLocation,
            appointmentTime: payload.appointmentTime,
            otherProduct: payload.otherProduct,
            serviceOrderNote: payload.serviceOrderNote,
            totalDiscountSo: payload.totalDiscountSo,
            totalVatSo: payload.totalVatSo,
            grandTotalSo: payload.grandTotalSo,
            totalService: payload.totalService,
            totalMaterial: payload.totalMaterial,
            serviceOrderUUID: payload.serviceOrderUUID,
            serviceOrderUUID: payload.serviceOrderUUID,
            listProducts: payload.listProducts,
            documentTypeId: payload.documentTypeId,
            documentNumber: payload.documentNumber,
            accountRelationTypeId: payload.accountRelationTypeId,
            contactName: payload.contactName,
            contactPhone: payload.contactPhone,
            contactTitle: payload.contactTitle,
            accountTypeId: payload.accountTypeId,
            contactId: payload.contactId

        });
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            accountId: payload.accountId,
            serviceOrderCode: payload.serviceOrderCode,
            serviceOrderName: payload.serviceOrderName,
            serviceOrderStageId: payload.serviceOrderStageId,
            currencyExchangeRateId: payload.currencyExchangeRateId,
            startDate: payload.startDate,
            endDate: payload.endDate,
            ownerEmployeeId: payload.ownerEmployeeId,
            appointmentLocation: payload.appointmentLocation,
            appointmentTime: payload.appointmentTime,
            otherProduct: payload.otherProduct,
            totalDiscountSo: payload.totalDiscountSo,
            totalVatSo: payload.totalVatSo,
            grandTotalSo: payload.grandTotalSo,
            totalService: payload.totalService,
            totalMaterial: payload.totalMaterial,
            serviceOrderUUID: payload.serviceOrderUUID,
            listProducts: payload.listProducts,
            accountName: payload.accountName,
            accountPhone: payload.accountPhone,
            accountTypeId: payload.accountTypeId,
            accountEmail: payload.accountEmail,
            documentTypeId: payload.documentTypeId,
            documentNumber: payload.documentNumber,
            accountRelationTypeId: payload.accountRelationTypeId,
            contactName: payload.contactName,
            contactPhone: payload.contactPhone,
            contactTitle: payload.contactTitle,
            accountTypeId: payload.accountTypeId,
            contactId: payload.contactId

        })
    },

}

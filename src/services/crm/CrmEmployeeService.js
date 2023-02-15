import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/employee`;


export const CrmEmployeeApi = {

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/${id}`);
    },

    update: (payload , id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
            id: id,
            employeeCode: payload.employeeCode,
            employeeFirstName: payload.employeeFirstName,
            employeeLastName: payload.employeeLastName,
            employeeMiddleName: payload.employeeMiddleName,
            employeeEmail: payload.employeeEmail,
            employeePhone: payload.employeePhone,
            employeeTitleId: payload.employeeTitleId,
            employeeContractId: payload.employeeContractId,
            organizationId: payload.organizationId,
            userId: payload.userId,
            username: payload.username,
            employeeCountryId: payload.employeeCountryId,
            employeeDistrictId: payload.employeeDistrictId,
            employeeProvinceId: payload.employeeProvinceId,
            employeePostalCode: payload.employeePostalCode,
            employeeStreet: payload.employeeStreet,
            employeeCountryTimeZoneId: payload.employeeCountryTimeZoneId,
            employeeLanguageId: payload.employeeLanguageId,
            isAdmin: payload.isAdmin,
            authorGroupEmployeeDTOS : payload.authorGroupEmployeeDTOS,
            employeeLevelId : payload.employeeLevelId,
            subTitleId : payload.subTitleId
        });
    },

    delete: (id) => {
        return axiosClient.delete(`${PROJECT_URL}/${id}`);
    },

    updateAvatar: (payload, id) => {
        return axiosClient.put(`${PROJECT_URL}/avatar/${id}`, {
            avatarId: payload.avatarId
        });
    },

    updateActive: (id) => {
        return axiosClient.put(`${PROJECT_URL}/active/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}`, {
            employeeCode: payload.employeeCode,
            employeeFirstName: payload.employeeFirstName,
            employeeLastName: payload.employeeLastName,
            employeeMiddleName: payload.employeeMiddleName,
            employeeEmail: payload.employeeEmail,
            employeePhone: payload.employeePhone,
            employeeTitleId: payload.employeeTitleId,
            employeeContractId: payload.employeeContractId,
            organizationId: payload.organizationId,
            userId: payload.userId,
            username: payload.username,
            employeeCountryId: payload.employeeCountryId,
            employeeDistrictId: payload.employeeDistrictId,
            employeeProvinceId: payload.employeeProvinceId,
            employeePostalCode: payload.employeePostalCode,
            employeeStreet: payload.employeeStreet,
            employeeCountryTimeZoneId: payload.employeeCountryTimeZoneId,
            employeeLanguageId: payload.employeeLanguageId,
            isAdmin: payload.isAdmin,
            authorGroupEmployeeDTOS : payload.authorGroupEmployeeDTOS,
            employeeLevelId : payload.employeeLevelId,
            subTitleId : payload.subTitleId
        })
    },

    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                organizationId: payload.organizationId
            }
        })
    },
    getByIds: (ids) => {
        return axiosClient.get(`${PROJECT_URL}/searchByIds?ids=${ids.join(`,`)}`)
    },

    getAll: () => {
        return axiosClient.get(`${PROJECT_URL}/search/all`)
    },

    getByEmployeeId: () => {
        return axiosClient.get(`${PROJECT_URL}`)
    },

    getEmployeeLevel: () => {
        return axiosClient.get(`${HOST}/employee-level`)
    },

    getSubTitle: () => {
        return axiosClient.get(`${HOST}/sub-title`)
    },
}

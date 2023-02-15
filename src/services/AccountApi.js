import axiosClient from './axiosClient'

// const ROOT_CONTEXT = 'http://localhost:8082'
const ROOT_CONTEXT = 'account'

export const AccountApi = {
    get: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "email,desc") + (payload.sortOrder < 0 ? ",desc" : "");
        var url = `${ROOT_CONTEXT}/account?page=${payload.page}&size=${payload.rows}&sort=${sort}`
        url = url + (payload.search ? '&search=' + payload.search : '');
        // return axios.get('http://localhost:8082/' + url).then(res => res.data);
        var x = axiosClient.get(url);
        return x
    },

    getById: (id) => {
        var url = `${ROOT_CONTEXT}/account/${id}`;
        return axiosClient.get(url);
    },

    getByCompanyId: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "email") + (payload.sortOrder < 0 ? " desc" : "");
        var url = `${ROOT_CONTEXT}/user/by-company?companyId=${payload.companyId}`
                    + `&page=${payload.page}&size=${payload.size}`
                    + `&sort=${sort}&status=-1`;
        url = url + (payload.search ? '&search=' + payload.search : '');
        url = url + (payload.showInactiveUser ? '&status=-1': '');
        console.log('userurl', url);
        var body = { name: payload.filter ? payload.filter : null };
        // return axios.get('http://localhost:8082/' + url).then(res => res.data);
        var x = axiosClient.get(url);
        return x
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROOT_CONTEXT}/account/create`, payload);
    },

    createUser: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROOT_CONTEXT}/user`, payload);
    },

    update: (payload) => {
        return axiosClient.put(`${ROOT_CONTEXT}/account/${payload.id}`, payload);
    },

    updateUser: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        var url = `${ROOT_CONTEXT}/user/${payload.id}`
        return axiosClient.put(url, payload);
    },

    createCertUser: (payload) => {
        return axiosClient.post(`${ROOT_CONTEXT}/account/cert/grant/user`, payload);
    },

    createCertCompany: (payload) => {
        return axiosClient.post(`${ROOT_CONTEXT}/account/cert/grant/company`, payload);
    },

    getGroupTreeByProject: (groupId,type) => {
        var url = `${ROOT_CONTEXT}/group/get-groups-tree-with-user/${groupId}`;
        return axiosClient.get(url,{
            params: {
                types: type
            }
        });
    },

    module: {
        getByCompany: (companyId) => {
            return axiosClient.get(`${ROOT_CONTEXT}/service-application/granted-applications/${companyId}`);
        },

        updateByCompany: (companyId, payload) => {
            return axiosClient.post(`${ROOT_CONTEXT}/service-application/grant-applications/${companyId}`, payload);
        }
    }
}

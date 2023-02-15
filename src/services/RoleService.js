import axiosClient from './axiosClient'

const ROLE_URL = 'account/role';
const GROUP_URL = 'account/group';
// const ROLE_URL = 'http://localhost:8082/role';

const RoleApi = {
    get: (payload) => {
        return axiosClient.get(`${ROLE_URL + (payload.filter ? '/search' : '/search')}`, {
            params: {
                groupId: payload.groupId,
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                status: payload.status ? payload.status.code : '-1'
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${ROLE_URL}/${id}`);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROLE_URL}/create`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROLE_URL}/update`, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${ROLE_URL}/${payload.id}`);
    },


    /**
     * get by applications
     * @param {*} applications string
     */
    getByApplicationAndType: (application, type, refType, refId) => {
        return axiosClient.get(`${ROLE_URL}/get-all?application=${application}&type=${type}&refType=${refType || ""}&refId=${refId || ""}`);
    },
    /**
     * get by applications
     * @param {*} applications string
     */
    getByCompany: (companyId) => {
        return axiosClient.get(`${ROLE_URL}/get-all?application=system&type=system&companyId=${companyId}`);
    },

    getRoleMenuActions: (roleId, application, types) => {
        return axiosClient.get(`${ROLE_URL}/get-role-menu-actions/${roleId}?application=${application}&types=${types || ""}`);
    },

    grantRoleMenuActions: (roleId, payload) => {
        return axiosClient.put(`${ROLE_URL}/grant-role-menu-action/${roleId}`, payload);
    },

    getRoleUsers: (roleId) => {
        return axiosClient.get(`${ROLE_URL}/get-role-users/${roleId}`);
    },

    grantRoleUsers: (roleId, payload) => {
        return axiosClient.put(`${ROLE_URL}/grant-role-users/${roleId}`, payload);
    },

    getUserRoles: (userId) => {
        return axiosClient.get(`${ROLE_URL}/get-user-roles/${userId}`);
    },

    grantUserRoles: (userId, payload) => {
        return axiosClient.put(`${ROLE_URL}/grant-user-roles/${userId}`, payload);
    },

    getGroupUsers: (groupId) => {
        return axiosClient.get(`${GROUP_URL}/get-group-users/${groupId}`);
    },

    grantGroupUsers: (groupId, payload) => {
        return axiosClient.put(`${GROUP_URL}/grant-group-users/${groupId}`, payload);
    },

    getUserGroups: (userId) => {
        return axiosClient.get(`${GROUP_URL}/get-user-groups/${userId}`);
    },

    grantUserGroups: (userId, payload) => {
        return axiosClient.put(`${GROUP_URL}/grant-user-groups/${userId}`, payload);
    },

    updateRolePolicy: (roleId, policy) => {
        return axiosClient.put(`${ROLE_URL}/update-policy/${roleId}`, policy);
    },

    getRoleGroups: (roleId) => {
        return axiosClient.get(`${ROLE_URL}/get-role-groups/${roleId}`);
    },

    grantRoleGroups: (roleId, payload) => {
        return axiosClient.put(`${ROLE_URL}/grant-role-groups/${roleId}`, payload);
    },

    grantRoleData: (roleId, payload) => {
        return axiosClient.put(`${ROLE_URL}/grant-role-data/${roleId}`, payload);
    },

    getUserMenuActions: (userId, menuTypes, application, refType, refId) => {
        return axiosClient.get(`${ROLE_URL}/get-user-menu-actions/${userId}?menuTypes=${menuTypes}&application=${application}&refType=${refType}&refId=${refId}`)
    },

    initRolePermission: (payload) => {
        return axiosClient.post(`${ROLE_URL}/init-role-permission`, payload);
    },

    getRolePolicyData: (roleId) => {
        return axiosClient.get(`${ROLE_URL}/get-role-data/${roleId}`);
    }
}

export default RoleApi;

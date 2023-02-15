import axiosClient from './axiosClient'

const PERMISSION_API = "account/api";
// const PERMISSION_API = "http://localhost:8082/api";

const PermissionApi = {
    getAllGroup: (payload) => {
        return axiosClient.get(`${PERMISSION_API}/get-groups/`, {
            params: payload ? {
                type: payload.type
                , userId: payload.userId
                , rootGroupId: payload.rootGroupId
                , status : payload.status
                , excludeTypes : (payload.excludeTypes ? payload.excludeTypes : '#')
            } : {}
        });
    },

    getRoleByGroup: (id) => {
        return axiosClient.get(`${PERMISSION_API}/role/${id}`);
    },

    getResourceAction: (payload) => {
        return axiosClient.get(`${PERMISSION_API}/resource-action`, {
            params: {
                groupId: payload.groupId,
                roleId: payload.roleId
            }
        });
    },

    revokeRoleGroup: (payload) => {
        return axiosClient.delete(`${PERMISSION_API}/role-group/${payload.groupId}/${payload.roleId}`);
    },

    revokeResourceAction: (payload) => {
        return axiosClient.delete(`${PERMISSION_API}/role-group-resource-action/${payload.groupId}/${payload.roleId}/${payload.resourceId}/${payload.actionId}`);
    },

    deletePermission: (payload) => {
        return axiosClient.delete(`${PERMISSION_API}/revoke-permission`, {data: payload});
    },

    grantRoleResourceAction: (payload) => {
        return axiosClient.post(`${PERMISSION_API}/role/grant-resource-action`, {grants: payload});
    },

    grantRoleToResource: (payload) => {
        return axiosClient.post(`${PERMISSION_API}/group/grant`, payload);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${PERMISSION_API}/group/create`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${PERMISSION_API}/group/${payload.groupId}`, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${PERMISSION_API}/group/${payload.id}`);
    },
}

export default PermissionApi;

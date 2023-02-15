import axiosClient from './axiosClient'

const USER_URL = 'account/user';
// const USER_URL = 'http://localhost:8082/user';

const UserApi = {
    getByAccountId: (payload) => {
        return axiosClient.get(`${USER_URL}/by-company`, {
            params: {
                companyId: localStorage.getItem("cid"),
                search: payload.filter,
                exclude: payload.excludeUsers
            }
        });
    },

    getByUsername: (username) => {
        return axiosClient.get(`${USER_URL}/by-username/${username}`);
    },

    search: (payload) => {
        return axiosClient.get(`${USER_URL}/search`, {
            params: {
                companyId: payload.global ? null : localStorage.getItem("cid"),
                search: payload.filter,
                exclude: payload.exclude,
                groupIds: (payload.groupIds ? payload.groupIds : -1),
                include: payload.include,
                page: payload.page || 0,
                size: payload.size || 20,
                sort: (payload.sortField || "first_name,last_name")
            }
        });
    },


    get: (payload) => {
        return axiosClient.get(`${USER_URL + (payload.filter ? '/search' : '')}`, {
            params: {
                cid: payload.accountId,
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "code") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getById: (id, cid) => {
        let _url = `${USER_URL}/${id}`;
        _url = _url + (cid ? '?companyId=' + cid : '?companyId=' + localStorage.getItem("cid"));
        return axiosClient.get(_url);
    },

    getLoggedInUser: () => {
        return axiosClient.get(`${USER_URL}/get-user-permission`);
    },

    changePassword: (payload) => {
        return axiosClient.put(`${USER_URL}/updatePassword`, {
            ...payload,
            id: payload.id ? payload.id : window.app_context.keycloak.tokenParsed.sub
        });
    },

    getByBirthMonth: (id) => {
        return axiosClient.get(`${USER_URL}/by-birth-month`, {
            params: {
                groupId: id
            }
        });
    },

    removeAvatar: (payload) => {
        return axiosClient.put(`${USER_URL}/avatar/delete`);
    },

    removeSignature: (payload) => {
        return axiosClient.put(`${USER_URL}/signature-image/delete`);
    },

    uploadAvatar: (payload) => {
        let formData = new FormData();
        formData.append("files", payload.files);

        return axiosClient.put(`${USER_URL}/avatar`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    },

    uploadSignature: (payload) => {
        let formData = new FormData();
        formData.append("files", payload.files);

        return axiosClient.put(`${USER_URL}/signature-image`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    },

    updateProfile: (payload) => {
        return axiosClient.put(`${USER_URL}/${window.app_context.keycloak.tokenParsed.sub}`, payload);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(USER_URL, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(USER_URL, payload);
    },

    delete: (payload) => {
        return axiosClient.delete(`${USER_URL}/${payload.id}`);
    },

    getGroups: () => {
        return axiosClient.get(`${USER_URL}/permission/groups`);
    },

    getByGroup: (payload) => {
        return axiosClient.get(`${USER_URL}/by-group`, {
            params: {
                companyId: window.app_context.keycloak.tokenParsed.cid,
                groupId: payload.groupId,
            }
        })
    },

    updateConfig: (payload) => {
        return axiosClient.put(`${USER_URL}/apply-config`, payload);
    },

    updateLocale: (locale) => {
        return axiosClient.put(`${USER_URL}/locale/${locale}`);
    },
    resetCacheByRootGroup: (groupId) => {
        return axiosClient.post(`${USER_URL}/reset-cache-by-group/${groupId}`);
    },

    getUserConfig: () => {
        return axiosClient.get(`${USER_URL}/get-user-config`);
    },

    getUserMenuPermission: (menuTypes, application, refType, refId) => {
        // return axiosClient.get(`${USER_URL}/menu-permission?menuTypes=${menuTypes}&application=${application}&refType=${refType}&refId=${refId}`)
        return axiosClient.post(`${USER_URL}/menu-permission`, {
            application: application,
            refType: refType,
            refId: refId,
            menuTypes: Array.isArray(menuTypes) ? menuTypes : [menuTypes]
        })
    },

    getUserInfo: (ids) => {
        return axiosClient.post(`${USER_URL}/byIds`, {
            users: ids,
            props: ["id", "firstName", "middleName", "lastName", "avatar", "fullName"]
        })
    },

    /**
     * get user info
     */
    getUserInfoDetail: (ids) => {
        return axiosClient.post(`${USER_URL}/byIds`, {
            users: ids,
            props: ["id", "firstName", "middleName", "lastName", "avatar", "email"],
            include: ["groups"]
        })
    },
    /**
     * get user permission
     */
    getUserDataPermission: () => {
        return axiosClient.get(`${USER_URL}/data-permission`);
    },
    /**
     * get user permission group
     */
    getUserDataPermissionGroups: () => {
        return axiosClient.get(`${USER_URL}/data-permission-group-object`);
    }
}

export default UserApi;

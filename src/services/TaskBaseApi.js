import axiosClient from './axiosClient'

const TASK_API = 'v2/task/task-base';
// const TASK_API = 'http://localhost:8087/task-base';
const STORAGE_API = 'storage/attachment';
// const STORAGE_API = 'http://localhost:8080/attachment';
// const COMMENT_API = 'http://localhost:8091/comments';
const COMMENT_API = 'comm/comments';
const REACTION_API = `${COMMENT_API}/reaction`;
const USER_API = 'account/user';
const SETTING_API = 'v2/task/setting';
const WORKLOG_API = 'v2/task/work-log';
// const WORKLOG_API = 'http://localhost:8087/work-log';
const REPORT_API = 'v2/task/report';
// const REPORT_API = 'http://localhost:8087/report';
const OT_URL = `v2/task/ot`;
// const   OT_URL = `http://localhost:8087/ot`;

const TaskBaseApi = {

    /**
     * get by id
     * @param {*} task
     */
    get: (id, include) => {
        return axiosClient.get(`${TASK_API}/${id}?include=${include || ""}`);
    },

    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
        var url = `${TASK_API}/filter?page=${payload.page}&size=${payload.size}&sort=${sort}`
        return axiosClient.post(url, payload.body);
    },

    summary: (payload) => {
        var url = `${TASK_API}/summary`;
        return axiosClient.post(url, payload.body);
    },

    /**
     * create
     * @param {*} task
     */
    create: (task) => {
        return axiosClient.post(TASK_API, task);
    },

    /**
     * create
     * @param {*} task
     */
    update: (task) => {
        return axiosClient.put(`${TASK_API}/${task.task.id}`, task);
    },

    /**
     * change task state
     * @param {*} id
     * @param {*} state
     */
    changeState: (id, state) => {
        return axiosClient.put(`${TASK_API}/state/${id}/${state}?include=next-states`, {});
    },

    /**
     * get task histories
     * @param {*} id
     * @returns
     */
    getHistories: (id, payload) => {
        return axiosClient.get(`${TASK_API}/histories/${id}?page=${payload.page || 0}&size=${payload.size || 5}`);
    },

    /**
     * get task's attachments
     * @param {*} id
     */
    getAttachments: (id, application, entity) => {
        return axiosClient.get(`${STORAGE_API}/${application}/${entity}/${id}`);
    },

    /**
     * create comment
     */
    createComment: (message) => {
        return axiosClient.post(`${COMMENT_API}`, message);
    },

    /**
     * edit comment
     */
    editComment: (id, message) => {
        return axiosClient.put(`${COMMENT_API}/${id}`, message);
    },

    /**
     * remove comment
     */
    removeComment: (id) => {
        return axiosClient.delete(`${COMMENT_API}/${id}`);
    },

    /**
     * reaction
     * @param {*} news
     * @returns
     */
    getByType: (id, payload) => {
        return axiosClient.get(`${REACTION_API}/${id}`, {params: {...payload}});
    },

    /**
     * reaction
     * @param {*} news
     * @returns
     */
    reaction: (id, type) => {
        return axiosClient.put(`${REACTION_API}/${id}`, {}, {params: {type}});
    },

    /**
     * reaction
     * @param {*} news
     * @returns
     */
    removeReaction: (id) => {
        return axiosClient.delete(`${REACTION_API}/${id}`);
    },

    /**
     * get comments
     * @param {*} id
     */
    getComments: (id, application = 'task-base', refType = 'task_base', page = 0, size = 2, parentId = '-1') => {
        return axiosClient.get(`${COMMENT_API}/search?application=${application}&refType=${refType}&refId=${id}&parentId=${parentId}&page=${page}&size=${size}`);
    },

    /**
     * create attachments
     * @param {*} files
     * @param {*} attachment
     */
    createAttachments: (folder, files, attachment) => {
        let formData = new FormData();
        formData.append("files", files);
        formData.append("attachment", JSON.stringify(attachment));

        return axiosClient.post(`${STORAGE_API}/upload${folder ? "/" + folder : ""}`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    },

    /**
     * create attachments
     * @param {*} files
     * @param {*} attachment
     */
    updateAttachments: (folder, refId, files, attachment) => {
        let formData = new FormData();
        if (files) {
            formData.append("files", files);
        }
        formData.append("attachment", JSON.stringify(attachment));

        return axiosClient.put(`${STORAGE_API}/upload${folder ? "/" + folder : ""}/${refId}`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    },

    /**
     * create attachments
     * @param {*} files
     * @param {*} attachment
     */
    deleteAttachments: (folder, refId) => {
        return axiosClient.delete(`${STORAGE_API}/upload${folder ? "/" + folder : ""}/${refId}`);
    },

    /**
     * sign attachments
     * @param {*} payload
     * @returns
     */
    signAttachments: (payload) => {
        return axiosClient.post(`${STORAGE_API}/action`, payload);
    },

    /**
     * get attachment histories
     * @param {*} id
     * @returns
     */
    getAttachmentHistories: (id, page) => {
        return axiosClient.get(`${STORAGE_API}/history/${id}?page=${page || 0}`);
    },

    /**
     * get user info
     */
    getUserInfo: (ids) => {
        return axiosClient.post(`${USER_API}/byIds`, {
            users: ids,
            props: ["id", "avatar", "email"],
            include: ["groups"]
        })
    },

    /***
     * filter
     */
    getFilter: (type) => {
        return axiosClient.get(`${SETTING_API}/user-setting-filter/${type}`)
    },

    updateFilter: (payload) => {
        return axiosClient.put(`${SETTING_API}/user/${payload.id || 0}/${payload.name || `Filter ${payload.id || ''}`}`, payload)
    },

    deleteFilter: (payload) => {
        return axiosClient.delete(`${SETTING_API}/user/${payload.id}`)
    },
    /***
     * user setting
     */
    getUserSetting: () => {
        return axiosClient.get(`${SETTING_API}/user-setting`)
    },

    updateUserSetting: (payload) => {
        return axiosClient.put(`${SETTING_API}/user`, payload)
    },

    /**
     *
     * @param {*} payload
     * @returns timesheet
     */

    timeSheetByUserIds: (payload) => {
        var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
        var url = `${WORKLOG_API}/search-range-by-company?page=${payload.page}&size=${payload.size}&sort=${sort}`
        return axiosClient.post(url, payload.body);
    },

    /**
     *
     * @param {*} payload
     * @returns report timesheet
     */
    reportTimeSheet: (payload) => {
        var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
        var url = `${WORKLOG_API}/search-range-report?page=${payload.page}&size=9999&sort=${sort}`
        return axiosClient.post(url, payload.body);
    },

    /***
     * get busy rate by unit/department
     */
    getBusyRateByUnit: (payload) => {
        return axiosClient.post(`${REPORT_API}/busy-rate-unit`, payload, {
            params: {
                page: payload.page,
                size: payload.size
            }
        })
    },

    getBusyRateByProject: (payload) => {
        return axiosClient.post(`${REPORT_API}/busy-rate-projects`, payload)
    },

    searchOt: (payload) => {
        return axiosClient.get(`${OT_URL}/search`, {
            params: {
                projectId: payload.projectId ? payload.projectId : 0,
                groupId: payload.groupId ? payload.groupId : 0,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                state: payload.search.state ? payload.search.state : null,
                createDateFrom: payload.search.createDateFrom ? payload.search.createDateFrom : null,
                createDateTo: payload.search.createDateTo ? payload.search.createDateTo : null,
                otDateFrom: payload.search.otDateFrom ? payload.search.otDateFrom : null,
                otDateTo: payload.search.otDateTo ? payload.search.otDateTo : null,
                reason: payload.search.reason ? payload.search.reason : null,
                userId: payload.search.userId ? payload.search.userId : null,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc")
            }
        });
    },

    filterOT: (payload) => {
        return axiosClient.post(`${OT_URL}/filter?page=${payload.page || "0"}&size=${payload.size || "20"}&sort=create_date,desc`, payload.body);
    },

    getTotalHourOt: (groupId, userId) => {
        let url = `${OT_URL}/total-number/${groupId}`;
        if (userId) {
            url = url + `?userId=${userId}`
        }
        return axiosClient.get(url);
    },

    initOT: (payload) => {
        return axiosClient.post(`${OT_URL}/init`, payload);
    },

    createOrUpdateOt: (payload) => {
        return axiosClient.put(`${OT_URL}/update`, payload)
    },

    getOTById: (id) => {
        return axiosClient.get(`${OT_URL}/${id}`);
    },

    createRequestOt: (payload) => {
        return axiosClient.put(`${OT_URL}/create-request`, payload)
    },

    updateRequestOt: (id, payload) => {
        return axiosClient.put(`${OT_URL}/update-request/${id}`, payload)
    },
}

export default TaskBaseApi;

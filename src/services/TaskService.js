import axiosClient from './axiosClient'

const HOST = 'task'
// const HOST = 'http://localhost:8086'

const ROOT_API = `${HOST}/task`

const TaskService = {
    getUserTasks: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
        var url = `${ROOT_API}/user-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`
        var body = payload.condition;
        return axiosClient.post(url, body);
    },

    getRequestTasks: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
        var url = `${ROOT_API}/workflow-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`
        var body = payload.condition;
        return axiosClient.post(url, body);
    },

    getGroupTasks: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
        var url = `${ROOT_API}/group-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`
        var body = payload.condition;
        return axiosClient.post(url, body);
    },

    getBaseTasks: (payload) => {
        var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
        var url = `${ROOT_API}/base-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`
        var body = payload.condition;
        return axiosClient.post(url, body);
    },

    getTotalTask: (payload) => {

        var sort = (payload.sortField ? payload.sortField : "name") + (payload.sortOrder < 0 ? " desc" : "");
        var url = `${ROOT_API}/total-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`
        url = url + (payload.groupIds ? '&groupIds=' + payload.groupIds : '');

        var body = payload.condition;
        return axiosClient.post(url, body);
    },

    getAll: () => {
        return axiosClient.get(`${ROOT_API}`);
    },

    sign: (taskId, docIds) => {
        return axiosClient.post(`${ROOT_API}/sign/${taskId}`, docIds);
    },

    search: (payload) => {
        return axiosClient.get(`${ROOT_API}/search`, {
            params: {
                type: (payload.type ? payload.type : ''),
                status: (payload.status ? payload.status : -1),
                search: payload.filter
            }
        });
    },

    get: (payload) => {
        return axiosClient.get(`${ROOT_API}`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "name") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getChildren: (id, payload) => {
        return axiosClient.get(`${ROOT_API}/children/${id}`, {
            params: {
                type: (payload && payload.type ? payload.type : '')
            }
        });
    },

    getReferences: (taskId) => {
        return axiosClient.get(`${ROOT_API}/task-reference/${taskId}`);
    },

    addReference: (payload) => {
        return axiosClient.post(`${ROOT_API}/task-reference`, payload);
    },

    getHistory: (taskId, payload) => {
        return axiosClient.get(`${ROOT_API}/history/search/${taskId}`, {
            params: {
                page: payload.page,
                size: payload.size,
                sort: (payload.sortField ? payload.sortField : "actionDate,desc") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getById: (id) => {
        return axiosClient.get(`${ROOT_API}/${id}`);
    },

    getByIdAndType: (id, type) => {
        return axiosClient.get(`${ROOT_API}/with-type/${id}`, {
            params: {
                type: type ? type : 'TASK'
            }
        });
    },

    getFieldsByTask: (taskId, type, id) => {
        var url = `${ROOT_API}/output-fields/${taskId}?entity=${type}&entityId=${id}`;
        return axiosClient.get(url);
    },

    create: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.post(`${ROOT_API}`, payload);
    },

    update: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/${payload.id}`, payload);
    },

    // delete: (payload) => {
    //     return axiosClient.delete(`${ROOT_API}/group/${payload.id}`);
    // },

    assign: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/assign/${payload.id}`, payload);
    },

    markImportant: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        if (payload.important) {
            return axiosClient.put(`${ROOT_API}/important/${payload.id}`, payload);
        } else {
            return axiosClient.put(`${ROOT_API}/unimportant/${payload.id}`, payload);
        }

    },

    escalate: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/escalate/${payload.id}`, payload);

    },

    changeState: (payload, cmd) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/change-state/${payload.id}`, payload, { params: { cmd: cmd } });
    },

    start: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/start/${payload.id}`, payload);

    },

    pause: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/pause/${payload.id}`, payload);

    },

    defer: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/defer/${payload.id}`, payload);

    },

    cancel: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/cancel/${payload.id}`, payload);

    },

    finish: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/finish/${payload.id}`, payload);

    },

    finishReview: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/finish-review/${payload.id}`, payload);

    },

    finishActivity: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/init-next-tasks/${payload.id}?groupId=${payload.groupId ? payload.groupId : 0}`, payload);

    },

    createNextActivity: (taskId, payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/close-workflow-task/${taskId}?groupId=${payload.groupId ? payload.groupId : 0}`, payload);
    },

    resume: (payload) => {
        Object.keys(payload).forEach((key) => {
            if (typeof payload[key] === "boolean") {
                payload[key] = payload[key] ? 1 : 0;
            }
        });
        return axiosClient.put(`${ROOT_API}/resume/${payload.id}`, payload);

    },

    getDocumentsByTask: (taskId) => {
        return axiosClient.get(`${ROOT_API}/documents-by-task/${taskId}`);
    },

    getDocumentsByDocId: (taskDocumentId) => {
        return axiosClient.get(`${ROOT_API}/document-by-id/${taskDocumentId}`);
    },

    uploadDocument: (payload) => {
        let formData = new FormData();
        formData.append("id", payload.id);
        if (payload.fileId) {
            formData.append("fileId", payload.fileId);
        }
        formData.append("name", payload.name);
        formData.append("code", payload.code);
        formData.append("type", payload.type);
        formData.append("taskId", payload.taskId);
        formData.append("versionNo", payload.versionNo);
        formData.append("description", payload.description);
        formData.append("action", payload.action);

        return axiosClient.put(`${ROOT_API}/upload-document`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    },

    getDocumentByHistory: (payload) => {
        return axiosClient.get(`${ROOT_API}/document/history-by-version`, {
            params: {
                taskDocumentId: payload.taskDocumentId,
                versionNo: payload.versionNo,
                page: payload.page,
                size: payload.rows,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    getHistoryByDocumentId: (payload) => {
        return axiosClient.get(`${ROOT_API}/document/history-by-document-id`, {
            params: {
                taskDocumentId: payload.taskDocumentId,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : "")
            }
        });
    },

    preview: (taskId, documentId) => {
        return axiosClient.get(`${ROOT_API}/document-merge-preview/${documentId}?taskId=${taskId}`);
    },

    getDocumentVersionByTask: (payload) => {
        return axiosClient.get(`${ROOT_API}/document/version`, {
            params: {
                taskDocumentId: payload.taskDocumentId,
            }
        });
    },

    getMentions: (id) => {
        return axiosClient.get(`${ROOT_API}/mention/${id}`);
    },

    createMention: (payload) => {
        payload.referenceType = payload.referenceType ? payload.referenceType : 'task';
        payload.referenceId = payload.referenceId ? payload.referenceId : payload.taskId;
        payload.status = 1;
        return axiosClient.post(`${ROOT_API}/mention/add`, payload);
    },

    updateMention: (payload) => {
        payload.referenceType = 'task';
        payload.referenceId = payload.taskId;
        return axiosClient.put(`${ROOT_API}/mention`, payload);
    },

    searchMention: (payload) => {
        return axiosClient.get(`${ROOT_API}/search`, {
            params: {
                referenceType: 'task',
                referenceId: payload.taskId,
                status: 1,
                search: payload.filter
            }
        });
    },

    getTaskStateByDay: (groupIds) => {
        return axiosClient.get(`/task/dashboard/get-state-task-day-by-group?groupId=${groupIds}`);
        // return axiosClient.get(`http://localhost:8086/dashboard/get-state-task-day-by-group?groupId=${groupIds}`);
    },

    getTaskActivityStream: (groupIds) => {
        return axiosClient.get(`${ROOT_API}/history/get-task-activity-stream?groupId=${groupIds}`);
    },

    getDashboardMainIndex: () => {
        return axiosClient.get(`${HOST}/dashboard/main-index`);
    }
}

export default TaskService;

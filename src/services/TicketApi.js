import axiosClient from 'services/axiosClient'

const HOST = "crm-service";

const PROJECT_URL = `${HOST}/ticket`;
// const TICKET_API = 'http://localhost:8087/ticket'
// const TICKETREF_API = 'http://localhost:8087/ticket-reference'
// const TICKET_API = 'ticket/ticket';
// const TICKETREF_API = 'ticket/ticket-reference';
// const STORAGE_API = 'storage/attachment';
// const COMMENT_API = 'comm/comments';
// const USER_API = 'account/user';
// const Dashboard_API = 'ticket/dashboard';

const TicketApi = {

    // /**
    //  * get by viewing mode (week or month)
    //  * @param {*} task
    //  */
    // getDashboardByState: (payload) => {
    //     return axiosClient.post(`${Dashboard_API}/group-by-state`,{
    //         rangeMode: payload.rangeMode,
    //         projectIds: payload.projectIds
    //     });
    // },
    // /**
    //  * get by viewing mode (week or month)
    //  * @param {*} task
    //  */
    // getDashboardByDatelineState: (payload) => {
    //     return axiosClient.post(`${Dashboard_API}/group-by-deadline-state`,{
    //         rangeMode: payload.rangeMode,
    //         rangeCount: payload.rangeCount,
    //         projectIds: payload.projectIds

    //     });
    // },

    /**
     * get by id
     * @param {*}
     */
    get: (id, include) => {
        return axiosClient.get(`${PROJECT_URL}/${id}?include=${include || ""}`);
    },

    /**
     * get list
     * @param {*} payload { page, size, sortField, sortOrder, body }
     */
    list: (payload) => {
        var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
        var url = `${PROJECT_URL}/filter?page=${payload.page}&size=${payload.size}&sort=${sort}`
        return axiosClient.post(url, payload.body);
    },

    summary: (payload) => {
        var url = `${PROJECT_URL}/summary`;
        return axiosClient.post(url, payload.body);
    },

    /**
     * create
     * @param {*} task
     */
    create: (task) => {
        return axiosClient.post(`${PROJECT_URL}?include=next-states`, task);
    },

    /**
     * create
     * @param {*} task
     */
    update: (task) => {
        return axiosClient.put(`${PROJECT_URL}/${task.task.id}?include=next-states`, task);
    },

    /**
     * change task state
     * @param {*} id
     * @param {*} state
     */
    changeState: (id, state) => {
        return axiosClient.put(`${PROJECT_URL}/state/${id}/${state}?include=next-states`, {});
    },

    /**
     * get task histories
     * @param {*} id
     * @returns
     */
    getHistories: (id, payload) => {
        return axiosClient.get(`${PROJECT_URL}/histories/${id}?page=${payload.page || 0}&size=${payload.size || 5}`);
    },

    // /**
    //  * get task's attachments
    //  * @param {*} id
    //  */
    // getAttachments: (id, application, entity) => {
    //     return axiosClient.get(`${STORAGE_API}/${application}/${entity}/${id}`);
    // },

    // /**
    //  * create comment
    //  */
    // createComment: (message) => {
    //     return axiosClient.post(`${COMMENT_API}`, message);
    // },

    // /**
    //  * get comments
    //  * @param {*} id
    //  */
    // getComments: (id, application = 'task-base', refType = 'task_base', page = 0, size = 2) => {
    //     return axiosClient.get(`${COMMENT_API}/search?application=${application}&refType=${refType}&refId=${id}&page=${page}&size=${size}`);
    // },

    // /**
    //  * create attachments
    //  * @param {*} files
    //  * @param {*} attachment
    //  */
    // createAttachments: (folder, files, attachment) => {
    //     let formData = new FormData();
    //     formData.append("files", files);
    //     formData.append("attachment", JSON.stringify(attachment));

    //     return axiosClient.post(`${STORAGE_API}/upload${folder ? "/" + folder : ""}`, formData, {
    //         headers: {
    //             'content-type': 'multipart/form-data'
    //         }
    //     });
    // },

    // /**
    //  * get user info
    //  */
    // getUserInfo: (ids) => {
    //     return axiosClient.post(`${USER_API}/byIds`, {
    //         users: ids,
    //         props: ["id", "avatar", "email"],
    //         include: ["groups"]
    //     })
    // },
    // refticket : {
    //     delete: (id) => {
    //         return axiosClient.delete(`${TICKETREF_API}/${id}`);
    //     },
    //     create: (task) => {
    //         return axiosClient.post(TICKETREF_API, task);
    //     }
    // }

}

export default TicketApi


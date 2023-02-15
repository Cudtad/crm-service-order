import axiosClient from './axiosClient'

// const ROOT_URL = 'project/worklogtask';
// const ROOT_URL = 'http://localhost:8092/worklogtask';
// const ROOT_URL = 'http://localhost:8087/work-log';
const ROOT_URL = 'v2/task/work-log';

const WorkLogTaskService = {
    getById: (id) => {
        return axiosClient.get(`${ROOT_URL}/by-id/${id}`);
    },
    getByPrId: (id) => {
        return axiosClient.get(`${ROOT_URL}/by-prid/${id}`);
    },
    getByWorkLogOfDate: (date,taskId,userId) => {
        let _url = `${ROOT_URL}/date?date-user=${date}&task-id=${taskId}`;
        if(userId){
            _url = _url + `&userId=${userId}`
        }
        return axiosClient.get(_url);
    },
    searchWorkLogByRange: (payload) => {
        return axiosClient.post(`${ROOT_URL}/search-range`, payload);
    },
    create: (payload) => {
        return axiosClient.post(`${ROOT_URL}/create`, payload);
    },
    update: (payload) => {
        return axiosClient.put(`${ROOT_URL}/update`, payload);
    },
    delete: (payload) => {
        return axiosClient.delete(`${ROOT_URL}/delete/${payload}`);
    }
}

export default WorkLogTaskService;

import axiosClient from './axiosClient'

const BASE_URL = 'event/gather';

const SystemEventApi = {
    get: (configId, payload) => {
        return axiosClient.post(`${BASE_URL}/get/${configId}`, payload || {});
    },
}

export default SystemEventApi;

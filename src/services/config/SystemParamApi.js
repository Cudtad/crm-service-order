import axiosClient from 'services/axiosClient'

const HOST = 'config/param';
// const HOST = 'http://localhost:8089/param';

const SystemParamApi = {
    search: (payload) => {
        const param = {
            application: payload.application || '',
            key: payload.key || '',
            value: payload.value || '',
            status: payload.status || '',
            search: payload.search || '',

        }
        return axiosClient.get(`${HOST}/search?application=${param.application}&key=${param.key}&value=${param.value}&status=${param.status}&search=${param.search}&page=${payload.page || 0}&size=${payload.size || 20}`)
    },

    get: (id) => {
        return axiosClient.get(`${HOST}/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(HOST, payload)
    },

    update: (payload) => {
        return axiosClient.put(`${HOST}/${payload.id}`, payload)
    }
}
export default SystemParamApi;

import axiosClient from './axiosClient'

const CERTIFICATE_URL = 'signature/cert';

const CertificateApi = {
    getByUser: (payload) => {
        let cid = payload.companyId;
        if(!payload.companyId){
            cid = localStorage.getItem("cid");
        }
        return axiosClient.get(`${CERTIFICATE_URL}/by-user/${payload.id}/${cid}`);
    },

    getByCompany: (payload) => {
        return axiosClient.get(`${CERTIFICATE_URL}/by-issuer/${payload.id}`);
    },

    state: (payload) => {
        return axiosClient.put(`${CERTIFICATE_URL}/state`, payload);
    },
}

export default CertificateApi;

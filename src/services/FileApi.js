import axiosClient from './axiosClient'

const ROOT_URL = 'storage/file';
// const ROOT_URL = 'http://localhost:8080/file';

const FileApi = {

    uploadFiles: (payload) => {
        let formData = new FormData();
        formData.append("files", payload.files);
        return axiosClient.post(`${ROOT_URL}/upload/${payload.folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
    },

    shareFile: (payload) => {
        return axiosClient.post(`${ROOT_URL}/grant`, payload);
    },

    // display files
    getFiles: (payload) => {
        return axiosClient.get(`${ROOT_URL}/view/${payload.folder}`, {
            params: {
                search: payload.search,
                status: payload.status
            }
        });
    },
    // search files
    searchFiles: (payload) => {
        return axiosClient.get(`${ROOT_URL}/search/${payload.folder}`, {
            params: {
                search: payload.search,
                status: payload.status
            }
        });
    },

    // download file
    downloadFiles: (id) => {
        return axiosClient.get(`${ROOT_URL}/download/${id}`);
    },

    // display file
    getFile: (id) => {
        return axiosClient.get(`${ROOT_URL}/${id}`);
    },

    // preview file
    previewFile: (id) => {
        return axiosClient.get(`${ROOT_URL}/preview/${id}`);
    },

    // delete file
    deleteFile: (id) => {
        return axiosClient.post(`${ROOT_URL}/disable`, [id])
    },

    getSharedFiles: () => {
        return axiosClient.get(`${ROOT_URL}/shared`);
    }
}

export default FileApi;

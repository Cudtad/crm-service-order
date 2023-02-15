import axios from 'axios';
import CommonFunction from "../../lib/common";
import appSettings from 'appSettings';

const axiosClient = axios.create({
    baseURL: appSettings.api.url,
});

CommonFunction.prepareAxiosClient(axiosClient, window.app_context.keycloak || {}, appSettings.env)

axiosClient.interceptors.request.use(async (config) => {
    let checkUrlCrm = config.url.indexOf("crm/")
    let checkUrlCrmSale = config.url.indexOf("crm-sale/")
    let employeeId = localStorage.getItem('employeeId')
    let isAdmin = localStorage.getItem('isAdmin')
    let allowEmployeeIds = localStorage.getItem('allowEmployeeIds')
    
    if(checkUrlCrm == 0 || checkUrlCrmSale == 0){
        if(employeeId) {
            config.headers.common['employeeId'] = employeeId;
        }

        if(isAdmin) {
            config.headers.common['isAdmin'] = isAdmin;
        }

        if(allowEmployeeIds) {
            config.headers.common['allowEmployeeIds'] = allowEmployeeIds;
        }
    }
    return config;
})


export default axiosClient;

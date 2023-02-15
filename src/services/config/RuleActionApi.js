import axiosClient from 'services/axiosClient'

const RULE_ACTION_API = 'config/rule-action';

const RuleActionApi = {

    /**
     * get by entity type
     * @param {*} application 
     * @param {*} type 
     * @returns 
     */
    getByEntityType: (application, entity, type) => {
        return axiosClient.get(`${RULE_ACTION_API}/byEntity?application=${application}&entity=${entity}&entityType=${type}`);
    },

    /**
    * get
    * @param {*} id 
    * @returns 
    */
    get: (id) => {
        return axiosClient.get(`${RULE_ACTION_API}/${id}`);
    },

    /**
     * create rule action
     * @param {*} body 
     */
    create: (body) => {
        return axiosClient.post(RULE_ACTION_API, body);
    },

    /**
     * update rule action
     * @param {*} body 
     */
    update: (body) => {
        return axiosClient.put(`${RULE_ACTION_API}/${body.id}`, body);
    },

    /**
     * delete rule action
     * @param {*} body 
     */
    delete: (id) => {
        return axiosClient.delete(`${RULE_ACTION_API}/${id}`);
    }

}

export default RuleActionApi;
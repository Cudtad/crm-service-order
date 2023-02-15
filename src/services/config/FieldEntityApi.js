import axios from 'axios';
import axiosClient from 'services/axiosClient'

const FIELD_ENTITY_API = 'config/field-entity';
const FIELD_DICTIONARY_API = 'config/entity-dictionary';

const FieldEntityApi = {

    /**
     * get
     * @param {*} id
     * @returns
     */
    get: (id) => {
        return axiosClient.get(`${FIELD_ENTITY_API}/${id}`);
    },

    /**
     * create
     * @param {*} entity
     * @returns
     */
    create: (entity) => {
        return axiosClient.post(FIELD_ENTITY_API, entity);
    },

    /**
     * update
     * @param {*} entity
     * @returns
     */
    update: (entity) => {
        return axiosClient.put(`${FIELD_ENTITY_API}/${entity.id}`, entity);
    },

    /**
     * delete
     * @param {*} id
     * @returns
     */
    delete: (id) => {
        return axiosClient.delete(`${FIELD_ENTITY_API}/${id}`);
    },

    /**
     * get fields by entity name
     * @param {string} application
     * @param {string} entity
     */
    getByEntity: (application, entity, entityId) => {
        return axiosClient.get(`${FIELD_ENTITY_API}/by-entity?application=${application}&entity=${entity || ""}&entityId=${entityId || ""}`);
    },

    /**
     * get field by entity type
     * @param {*} application
     * @param {*} type
     * @returns
     */
    getByEntityType: (application, type, entityId) => {
        return axiosClient.get(`${FIELD_ENTITY_API}/entity-fields?application=${application}&entity=${type || ""}&entityId=${entityId || ""}`);
    },

    /**
     * get config fields, include real fields and custom fields
     * @param {*} application
     * @param {*} type
     */
    getConfigFields: (application, entity, type, customize, locale) => {
        let url = `${FIELD_ENTITY_API}/entity-config-fields?application=${application}&entity=${entity || ""}&entityType=${type || ""}`;
        switch (customize) {
            case true:
                url += "&customize=true";
                break;
            case false:
                url += "&customize=false";
                break;
            default:
                break;
        }
        return axiosClient.get(url, locale ? { headers: { 'Accept-Language': locale } } : {});
    },

    /**
     * get all field data config
     * @returns
     */
    getFieldDataConfig: () => {
        return axiosClient.get("config/data-config/cache-config");
    },

    /**
     * grant fields
     * @param {*} payload
     * @returns
     */
    grant: (payload) => {
        return axiosClient.post(`${FIELD_ENTITY_API}/grant-entity-fields`, payload)
    },

    /**
     * get dictionary
     * @param {*} application
     * @param {*} entity
     * @param {*} locale
     * @param {*} customize
     * @returns
     */
    getFieldDictionaries: (application, entity, entityId, locale, customize) => {
        return axiosClient.get(`${FIELD_ENTITY_API}/dictionaries/?application=${application}&entity=${entity}&entityId=${entityId || ""}&locale=${locale}&customize=${customize ? "true" : "false"}`);
    },

    /**
     * update field dictionaries
     */
    updateFieldDictionaries: (payload) => {
        return axiosClient.post(`${FIELD_DICTIONARY_API}/field-dictionaries`, payload)
    },

}

export default FieldEntityApi;

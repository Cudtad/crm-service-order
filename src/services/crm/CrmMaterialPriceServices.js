import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/material-price`;

export const CrmMaterialPriceApi = {
  updateRelatedProduct: (payload, id) => {
    return axiosClient.put(`${PROJECT_URL}/${id}`, {
      listPrice: payload.listPrice,
      currencyExchangeRateId: payload.currencyExchangeRateId,
      useStandardPrice: payload.useStandardPrice,
      materialId: payload.materialId,
      priceId: payload.priceId,
      status: payload.status,
    });
  },

  updateActive: (id) => {
    return axiosClient.put(`${PROJECT_URL}/active/${id}`);
  },

  createRelatedProduct: (payload) => {
    return axiosClient.post(`${PROJECT_URL}`, {
      listPrice: payload.listPrice,
      currencyExchangeRateId: payload.currencyExchangeRateId,
      useStandardPrice: payload.useStandardPrice,
      materialId: payload.materialId,
      priceId: payload.priceId,
      status: payload.status,
    });
  },

  

  getByIds: (ids) => {
    return axiosClient.get(`${PROJECT_URL}/searchByIds?ids=${ids.join(`,`)}`);
  },

  getRelatedProduct: (payload, id) => {
    return axiosClient.get(`${PROJECT_URL}/product/${id}`, {
      params: {
        search: payload.filter,
      },
    });
  },

  getRelatedMaterial: (payload, id) => {
    return axiosClient.get(`${PROJECT_URL}/material/${id}`, {
      params: {
        search: payload.filter,
      },
    });
  },

  getRelatedPrice: (payload, id) => {
    return axiosClient.get(`${PROJECT_URL}/price/${id}`, {
      params: {
        search: payload.filter,
        currencyExchangeRateId: payload.currencyExchangeRateId,
      },
    });
  },

  delete: (id) => {
    return axiosClient.delete(`${PROJECT_URL}/${id}`);
  },

  getStandardPriceList: () => {
    return axiosClient.get(`${PROJECT_URL}/standard`);
  },
};

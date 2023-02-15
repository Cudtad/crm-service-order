import axiosClient from "services/axiosClient";

const HOST = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/column-config`;

export const CrmColumnConfigApi = {
  get: (payload) => {
    return axiosClient.get(`${PROJECT_URL}`, {
      params: {
        objectTypeId: payload.objectTypeId
      },
    })
  },

  update: (payload, id) => {
    return axiosClient.put(`${PROJECT_URL}/${id}`, {
      objectTypeId: payload.objectTypeId,
      userId: payload.userId,
      columConfigDetailDTOS: payload.columConfigDetailDTOS
    });
  },

  create: (payload) => {
    return axiosClient.post(`${PROJECT_URL}`, {
      objectTypeId: payload.objectTypeId,
      userId: payload.userId,
      columConfigDetailDTOS: payload.columConfigDetailDTOS
    });
  },

};

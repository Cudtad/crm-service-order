import axiosClient from "services/axiosClient";
import { TASK_OBJECT_TYPE } from "../../features/crm/utils/constants";

const HOST = "crm-service";
// const HOST_MD = "crm";
// const HOST = "http://localhost:8093"

const PROJECT_URL = `${HOST}/service-party-involved`;

export const CrmServicePartyInvolvedApi = {

    getByObjectId: (id, objectTypeId) => {
        switch (objectTypeId) {

          case TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT:
            return axiosClient.get(`${PROJECT_URL}/serviceOrder/${id}`);
            break;
        
          default:
        }
      },

    update: (payload, id) => {
        return axiosClient.put(`${PROJECT_URL}/${id}`, {
          ownerEmployeeId: payload.employeeId,
        });
      },
    

  delete: (id) => {
    return axiosClient.delete(`${PROJECT_URL}/${id}`);
  },

  create: (payload) => {
    return axiosClient.post(`${PROJECT_URL}`, {
      serviceOrderId: payload.serviceOrderId,
      employeeId: payload.employeeId,
      authorizationGroupId: payload.authorizationGroupId,
    });
  },
};

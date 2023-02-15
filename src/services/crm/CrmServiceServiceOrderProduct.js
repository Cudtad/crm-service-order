import axiosClient from "services/axiosClient";

const HOST = "crm-service";
// const HOST = "http://localhost:8150"

const PROJECT_URL = `${HOST}/service-order-product`;

export const CrmServiceServiceOrderProductApi = {
  get: (payload) => {
    return axiosClient.get(`${PROJECT_URL}/search`, {
      params: {
        search: payload.filter,
        page: payload.page,
        size: payload.rows,
        sort:
          (payload.sortField ? payload.sortField : "id") +
          (payload.sortOrder < 0 ? ",desc" : ""),
      },
    });
  },

  getByOrderId: (id) => {
    return axiosClient.get(`${PROJECT_URL}/${id}`);
  },

  delete: (id) => {
    return axiosClient.delete(`${PROJECT_URL}/${id}`);
  },

  update: (payload, orderId) => {
    return axiosClient.put(`${PROJECT_URL}/${orderId}`, {
      priceOfProductId: payload.priceOfProductId,
      totalService: payload.totalService,
      totalDiscountService: payload.totalDiscountService,
      totalVatService: payload.totalVatService,
      grandTotalService: payload.grandTotalService,
      serviceNote: payload.serviceNote,
      items: payload.items,
    });
  },

  create: (payload, orderId) => {
    return axiosClient.post(`${PROJECT_URL}/${orderId}`, {
      priceOfProductId: payload.priceOfProductId,
      totalService: payload.totalService,
      totalDiscountService: payload.totalDiscountService,
      totalVatService: payload.totalVatService,
      grandTotalService: payload.grandTotalService,
      serviceNote: payload.serviceNote,
      items: payload.items,
    });
  },

  getItemsByOrderProductId: (id) => {
    return axiosClient.get(`${PROJECT_URL}/item/${id}`);
  },

  createItems: (payload, id) => {
    return axiosClient.post(`${PROJECT_URL}/item/${id}`, {
      items: payload.items,
    });
  },

  updateItem: (payload, id) => {
    return axiosClient.put(`${HOST}/service-order-product-item/${id}`, {
      id: id,
      serviceQuantity: payload.serviceQuantity,
      listPrice: payload.listPrice,
      totalPerService: payload.totalPerService,
      discountPerService: payload.discountPerService,
      vatPerService: payload.vatPerService,
      grandTotalPerService: payload.grandTotalPerService,
      productId: payload.productId,
      productPriceId: payload.productPriceId,
    });
  },

  deleteItem: (id) => {
    return axiosClient.delete(`${HOST}/service-order-product-item/${id}`);
  },
};

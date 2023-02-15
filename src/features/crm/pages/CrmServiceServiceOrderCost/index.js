import CommonFunction from "@lib/common";
import { XLayout, XLayout_Center, XLayout_Top } from "@ui-lib/x-layout/XLayout";
import XToolbar from "@ui-lib/x-toolbar/XToolbar";
import { Button } from "primereact/button";
import React, { useEffect, useRef, useState } from "react";
import { Toolbar } from "primereact/toolbar";

import { getPermistion } from "../../utils";
import _ from "lodash";
import "./styles.scss";
// import CrmNavigation from 'features/crm/components/CrmNavigation';
// import CrmHorizontalMenu from 'features/crm/components/CrmHorizontalMenu';
// import { CrmProductFamilyApi } from 'services/crm/CrmProductFamilyService';
import { useParams } from "react-router-dom";
import CrmServiceServiceOrderTab from "../../components/CrmServiceServiceOrderTab";
import { CrmUserApi } from "../../../../services/crm/CrmUser";

import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import CrmServiceServiceOrderCostDetail from "../../components/CrmServiceServiceOrderCostDetail";
import { CrmPriceApi } from "../../../../services/crm/CrmPriceService";
import { CrmServiceServiceOrderProductApi } from "../../../../services/crm/CrmServiceServiceOrderProduct";
import { CrmServiceServiceOrderApi } from "../../../../services/crm/CrmServiceServiceOrderService";
import { CrmProductFamilyApi } from "../../../../services/crm/CrmProductFamilyService";
import { CrmMdCurrencyExchangeRateApi } from "services/crm/CrmCurrencyExchangeRateService";

const permissionParentCode = "crm-service-order_service-order";
const permissionCode = "crm-service-order_service-order_costs";

export default function CrmServiceServiceOrderCost(props) {
  const t = CommonFunction.t;
  const { p } = useParams();
  const serviceOrderId = p;

  const [permission, setPermission] = useState();

  const [serviceOrder, setServiceOrder] = useState(null);

  const [loading, setLoading] = useState(false);

  const refDetail = useRef();

  const [preview, setPreview] = useState(true);

  const [serviceOrderStages, setServiceOderStages] = useState([]);

  const [prices, setPrices] = useState([]);

  const [productFamilies, setProductFamilies] = useState([]);

  const [serviceOrderProduct, setServiceOrderProduct] = useState(null);

  const [serviceOrderProductItems, setServiceOrderProductItems] =
    useState(null);

  const [currencyExchangeRates, setCurrencyExchangeRates] = useState([]);

  /**
   * manytimes
   */
  useEffect(() => {
    // load request
    loadPrices();
    loadData();
    loadServiceOrder();
    loadServiceOrderStages();
    loadProductFamilies();
    loadCurrencyExchangeRates()
  }, []);

  /**
   * onetime
   */
  useEffect(() => {
    permission;
    setPermission(getPermistion(window.app_context.user, permissionCode));
    // loadProductFamily()
  }, []);


  const loadCurrencyExchangeRates = () => {
    CrmMdCurrencyExchangeRateApi.getAll({
        status: 1,
    }).then((res) => {
        if (res) {
            setCurrencyExchangeRates(res);
        } else {
            setCurrencyExchangeRates([]);
        }
    });
};

  const loadData = async () => {
    try {
      const res = await CrmServiceServiceOrderProductApi.getByOrderId(
        serviceOrderId
      );
      if (res) {
        setServiceOrderProduct(res);
        const resItems =
          await CrmServiceServiceOrderProductApi.getItemsByOrderProductId(
            serviceOrderId
          );
        if (resItems) setServiceOrderProductItems(resItems);
      }
    } catch (error) {}
  };

  /**
   * load requests created by user
   */
  const loadServiceOrder = () => {
    setLoading(true);
    CrmServiceServiceOrderApi.getById(serviceOrderId).then(async (res) => {
      if (res) {
        if (res?.createBy) {
          const user = await CrmUserApi.getById(res?.createBy).catch(() => {});
          res["createUser"] = user;
        }
        if (res?.updateBy) {
          const user = await CrmUserApi.getById(res?.updateBy).catch(() => {});
          res["updateUser"] = user;
        }
        setServiceOrder(res);
      }
      setLoading(false);
    });
  };

  const loadPrices = () => {
    CrmPriceApi.getAll({
      status: 1,
    }).then((res) => {
      if (res) {
        setPrices(res);
      } else {
        setPrices([]);
      }
    });
  };

  const loadProductFamilies = () => {
    CrmProductFamilyApi.getAll({
      status: 1,
    }).then((res) => {
      if (res) {
        setProductFamilies(res);
      } else {
        setProductFamilies([]);
      }
    });
  };

  const loadServiceOrderStages = () => {
    CrmServiceServiceOrderStageApi.get().then((res) => {
      if (res) {
        setServiceOderStages(res);
      } else {
        setServiceOderStages([]);
      }
    });
  };

  const setLoadingSave = (flg) => {
    setLoading(flg);
  };

  const onCancelEditing = () => {
    setPreview(true);
    loadData();
  };

  const onSubmitProject = () => {
    refDetail.current.submitProject();
  };

  const renderDetailRightContents = () => {
    return (
      <>
        <Button
          label={t("common.cancel")}
          icon="bx bx-x"
          className="p-button-text mr-2"
          loading={loading}
          onClick={onCancelEditing}
        />
        <Button
          label={t("common.save")}
          icon="bx bx-save"
          className="p-button-plain"
          loading={loading}
          onClick={onSubmitProject}
          disabled={!permission?.update}
        />
      </>
    );
  };

  return (
    <>
      <CrmServiceServiceOrderTab
        serviceOrderId={serviceOrderId}
        serviceOrder={serviceOrder}
        permissionParentCode={permissionParentCode}
        permissionCode={permissionCode}
        preview={preview}
        setPreview={setPreview}
        disableEdit={false}
        loading={loading}
        status={serviceOrderStages}
        serviceOrderStages={serviceOrderStages}
        activeStatusId={serviceOrder?.stageId}
        reload={loadServiceOrder}
      >
        <>
          <div className="mt-3">
            {permission?.view && (
              <>
                <CrmServiceServiceOrderCostDetail
                  className={"p-0"}
                  serviceOrderId={serviceOrderId}
                  ref={refDetail}
                  prices={prices}
                  preview={preview}
                  data={serviceOrderProduct}
                  serviceOrderProductItems={serviceOrderProductItems}
                  permission={permission}
                  productFamilies={productFamilies}
                  currencyExchangeRates={currencyExchangeRates}
                  setLoading={setLoadingSave}
                  reload={loadData}
                  setPreview={setPreview}
                />
              </>
            )}
          </div>
          {!preview ? <Toolbar right={renderDetailRightContents} /> : null}
        </>
      </CrmServiceServiceOrderTab>
    </>
  );
}

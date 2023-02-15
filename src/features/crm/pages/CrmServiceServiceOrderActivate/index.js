import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import _ from "lodash";
import CommonFunction from "@lib/common";
import "./styles.scss";

// import CrmCreateDialog from "features/crm/components/CrmCreateDialog";
// import CrmSaleLeadDetail from "features/crm/components/CrmSaleLeadDetail";

import { CrmGenderApi } from "services/crm/CrmGenderService";
import { CrmEmployeeApi } from "services/crm/CrmEmployeeService";
import { CrmCountryApi } from "services/crm/CrmCountryService";
import { CrmIndustryApi } from "services/crm/CrmIndustryService";
import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import { CrmProductApi } from "services/crm/CrmProductService";
import { CrmUserApi } from "services/crm/CrmUser";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";

import CrmServiceServiceOderTab from "../../components/CrmServiceServiceOrderTab";
import TaskBaseCrmActivity from "../../components/TaskBaseCrmActivity";

import { TASK_OBJECT_TYPE } from "../../utils/constants";
import { getPermistion } from "../../utils";
import { CrmSalutationApi } from "services/crm/CrmSalutationService";

const permissionParentCode = "crm-service-order_service-order";
const permissionCode = "crm-service-order_service-order_activate";

export default function CrmServiceServiceOrderActivate(props) {
  const t = CommonFunction.t;
  const { p } = useParams();
  const serviceOrderId = p;


  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState(true);

  const [leadSources, setLeadSources] = useState([]);

  const [leadStages, setLeadStages] = useState([]);

  const refTab = useRef();

  const refDetail = useRef();

  const refDialog = useRef();

  const [permissionParent, setPermissionParent] = useState();

  const [permission, setPermission] = useState();


  const [countries, setCountries] = useState([]);

  const [gender, setGender] = useState([]);

  const [products, setProducts] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [industries, setIndustries] = useState([]);

  const [viewOnly, setViewOnly] = useState(false);

  const [salutations, setSalutations] = useState([]);

  const [serviceOrder, setServiceOrder] = useState(null);

  const [serviceOrderStages, setServiceOderStages] = useState([]);


    /**
     * load Account type
     */
     const loadSalutations = () => {
      CrmSalutationApi.get().then((res) => {
          if (res) {
              setSalutations(res);
          } else {
              setSalutations([]);
          }
      });
  };


  /**
   * load Countries
   */
  const loadCountries = () => {
    CrmCountryApi.get().then((res) => {
      if (res) {
        setCountries(res);
      } else {
        setCountries([]);
      }
    });
  };
  /**
   * load gender
   */
  const loadGender = () => {
    CrmGenderApi.get().then((res) => {
      if (res) {
        setGender(res);
      } else {
        setGender([]);
      }
    });
  };

  /**
   * load all Employee
   */
  const loadEmployees = () => {
    CrmEmployeeApi.getAll({
      status: 1,
    }).then((res) => {
      if (res) {
        setEmployees(res);
      } else {
        setEmployees([]);
      }
    });
  };

  /**
   * load all Industry
   */
  const loadIndustries = () => {
    CrmIndustryApi.get().then((res) => {
      if (res) {
        setIndustries(res);
      } else {
        setIndustries([]);
      }
    });
  };

  /**
   * load all lead sources
   */

  /**
   * load all lead status
   */
  const loadServiceOrderStages = () => {
    CrmServiceServiceOrderStageApi.get().then((res) => {
        if (res) {
            setServiceOderStages(res);
        } else {
            setServiceOderStages([]);
        }
    });
};


  /**
   * load all lead status
   */
  const loadProducts = () => {
    CrmProductApi.getAll({
      status: 1,
    }).then((res) => {
      if (res) {
        setProducts(res);
      } else {
        setProducts([]);
      }
    });
  };

  /**
   * load requests created by user
   */
  

  const loadServiceOrder = () => {
    setLoading(true);
    CrmServiceServiceOrderApi.getById(serviceOrderId).then(async (res) => {
        if (res) {
            if (res?.createBy) {
                const user = await CrmUserApi.getById(res?.createBy).catch(
                    () => {}
                );
                res["createUser"] = user;
            }
            if (res?.updateBy) {
                const user = await CrmUserApi.getById(res?.updateBy).catch(
                    () => {}
                );
                res["updateUser"] = user;
            }
            setServiceOrder(res);
        }
        setLoading(false);
    });
};

  const onDialogSave = () => {
    refDetail.current.submitProject();
  };

  const onCloseDialog = () => {
    refDialog.current.close();
  };

  const setLoadingSave = (flg) => {
    refDialog.current.setLoading(flg);
  };

  const openEdit = () => {
    refDialog.current.edit();
  };

  /**
   * manytimes
   */
  useEffect(() => {
    // load request
    loadServiceOrder();
  }, []);

  useEffect(() => {
    // permission
    setPermissionParent(
      getPermistion(window.app_context.user, permissionParentCode)
    );
    setPermission(
      getPermistion(window.app_context.user, permissionCode)
    );
    loadCountries();
    loadGender();
    loadEmployees();
    loadIndustries();
    loadServiceOrderStages();
    loadProducts();
    loadSalutations()
  }, []);

  return (
    <>
      <CrmServiceServiceOderTab
        ref={refTab}
        serviceOrderId={serviceOrderId}
        serviceOrder={serviceOrder}
        status={serviceOrderStages}
        serviceOrderStages={serviceOrderStages}
        permissionParentCode={permissionParentCode}
        permissionCode={permissionCode}
        preview={preview}
        disableEdit={false}
        loading={loading}
        isOpenEdit={true}
        selectedIndex={1}
        activeStatusId={serviceOrder?.stageId}
        setPreview={setPreview}
        openEdit={openEdit}
      >
        <>
          <div className="mt-3">
            {permission?.view_task &&
              <TaskBaseCrmActivity
                permissionCode={permissionCode}
                objectTypeId={TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT}
                screenId={serviceOrderId}
                queryfieldName="serviceOrder_id"
                selectFieldName="serviceOrderId"
                screenNameId="serviceOrderId"
              />
            }
          </div>
        </>
      </CrmServiceServiceOderTab>

      {/* <CrmCreateDialog
        ref={refDialog}
        title={t(`crm-sale.lead.detail.update`)}
        onSubmit={onDialogSave}
        permission={permissionParent}
        viewOnly={false}
      >
        <CrmSaleLeadDetail
          ref={refDetail}
          data={lead}
          countries={countries}
          leadSources={leadSources}
          leadStages={leadStages}
          gender={gender}
          products={products}
          employees={employees}
          industries={industries}
          permission={permissionParent}
          viewOnly={false}
          leadPotentialLevels={leadPotentialLevels}
          salutations={salutations}
          setLoading={setLoadingSave}
          cancel={onCloseDialog}
          reload={loadServiceOrder}
        />
      </CrmCreateDialog> */}
    </>
  );
}

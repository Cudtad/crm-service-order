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
import CrmServiceServiceOderTab from "../../components/CrmServiceServiceOrderTab";
import { CrmUserApi } from "../../../../services/crm/CrmUser";

import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import CrmPanel from "../../components/CrmPanel";

import CrmAttachment from "features/crm/components/CrmAttachment";

const permissionParentCode = "crm-service-order_service-order";
const permissionCode = "crm-service-order_service-order_customer-confirmation";

const applicationService = "crm-service-order";
const entityRefType = "serviceOrder";

const emptyItem = {
    rowIndex: "0",
    id: null,
    materialPriceId: null,
    warehouse: "",
    materialStock: "",
    materialQuantity: "",
};


export default function CrmServiceServiceOrderConfirmation(props) {
    const t = CommonFunction.t;
    const { p } = useParams();
    const serviceOrderId = p;

    const [permission, setPermission] = useState();

    const [serviceOrder, setServiceOrder] = useState(null);

    const [loading, setLoading] = useState(false);


    const [preview, setPreview] = useState(true);

    const [serviceOrderStages, setServiceOderStages] = useState([]);



    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        loadServiceOrder();
        loadServiceOrderStages();
    }, []);

    /**
     * onetime
     */
    useEffect(() => {
        setPermission(getPermistion(window.app_context.user, permissionCode));
    }, []);

 

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

    const loadServiceOrderStages = () => {
        CrmServiceServiceOrderStageApi.get().then((res) => {
            if (res) {
                setServiceOderStages(res);
            } else {
                setServiceOderStages([]);
            }
        });
    };





    
    return (
        <>
        
            <CrmServiceServiceOderTab
                serviceOrderId={serviceOrderId}
                serviceOrder={serviceOrder}
                permissionParentCode={permissionParentCode}
                permissionCode={permissionCode}
                preview={preview}
                setPreview={setPreview}
                disableEdit={true}
                loading={loading}
                status={serviceOrderStages}
                serviceOrderStages={serviceOrderStages}
                activeStatusId={serviceOrder?.stageId}
                reload={loadServiceOrder}
            >
                <>
                    <div className="mt-3">
                        <CrmPanel
                            className="mb-2"
                            title={t("crm-service.service-order.customer-confirmation")}
                            collapsed={false}
                        >
                            <div className={`pt-3 px-2`}>
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-12 px-3 py-1">
                                        <CrmAttachment
                                            className="mb-3"
                                            permissionCode={permissionParentCode}
                                            applicationService={applicationService}
                                            entityRefType={entityRefType}
                                            UUID={serviceOrder?.serviceOrderUUID}
                                            readOnly={!permission?.update}
                                            hide={true}
                                        />
                                        
                                    </div>
                                </div>
                            </div>
                        </CrmPanel>
                    </div>
                </>
            </CrmServiceServiceOderTab>
        </>
    );
}

import CommonFunction from '@lib/common';
import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { Toolbar } from 'primereact/toolbar';

import { getPermistion } from '../../utils';
import _ from "lodash";
import "./styles.scss"
// import CrmNavigation from 'features/crm/components/CrmNavigation';
// import CrmHorizontalMenu from 'features/crm/components/CrmHorizontalMenu';
import CrmServiceServiceOderDetail from "../../components/CrmServiceServiceOrderDetail";
// import { CrmProductFamilyApi } from 'services/crm/CrmProductFamilyService';
import { useParams } from 'react-router-dom';
import CrmServiceServiceOderTab from '../../components/CrmServiceServiceOrderTab';
import { CrmUserApi } from '../../../../services/crm/CrmUser';

import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";

const permissionParentCode = "crm-service-order_service-order"
const permissionCode = "crm-service-order_service-order_infor"

export default function CrmServiceServiceOderInfor(props) {
    const t = CommonFunction.t;
    const { p } = useParams();
    const serviceOrderId = p

    const [permission, setPermission] = useState()

    const [serviceOrder, setServiceOrder] = useState(null)

    const [productsFamily, setProductsFamily] = useState([])

    const [loading, setLoading] = useState(false)

    const refDetail = useRef()

    const [preview, setPreview] = useState(true)

    const [serviceOrderStages, setServiceOderStages] = useState([]);

    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        loadServiceOrder();
        loadServiceOrderStages();
    }, [])

    /**
     * onetime
     */
    useEffect(() => {
        permission
        setPermission(getPermistion(window.app_context.user, permissionCode))
        // loadProductFamily()
    }, [])

    /**
     * load requests created by user
     */
    const loadServiceOrder = () => {
        setLoading(true)
        CrmServiceServiceOrderApi.getById(serviceOrderId).then(async (res) => {
            if (res) {
                if (res?.createBy) {
                    const user = await CrmUserApi.getById(res?.createBy).catch(() => { })
                    res['createUser'] = user
                }
                if (res?.updateBy) {
                    const user = await CrmUserApi.getById(res?.updateBy).catch(() => { })
                    res['updateUser'] = user
                }
                setServiceOrder(res)
            }
            setLoading(false)
        })
    }

    /**
     * load requests created by user
     */
    // const loadProductFamily = () => {
    //     CrmProductFamilyApi.getAll({
    //         status: 1
    //     }).then(res => {
    //         if (res) {
    //             setProductsFamily(res);
    //         }
    //     })
    // }

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
        setLoading(flg)
    }

    const onCancelEditing = () => {
        setPreview(true)
        loadServiceOrder()
    }

    const onSubmitProject = () => {
        setLoading(true)
        refDetail.current.submitProject()
    }

    const renderDetailRightContents = () => {
        return <>
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
    }

    return (<>
        <CrmServiceServiceOderTab
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
                    {permission?.view &&
                        <CrmServiceServiceOderDetail
                            ref={refDetail}
                            className={"p-0"}
                            reload={loadServiceOrder}
                            preview={preview}
                            setPreview={setPreview}
                            data={serviceOrder}
                            // productsFamily={productsFamily}
                            permission={permission}
                            setLoading={setLoadingSave}
                        />
                    }
                </div>
                {!preview
                    ? <Toolbar right={renderDetailRightContents} />
                    : null
                }
            </>
        </CrmServiceServiceOderTab>
    </>)
}

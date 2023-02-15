import React, {
    forwardRef,
    useEffect,
    useState,
    useImperativeHandle,
    useRef,
} from "react";
import moment from "moment";
import { XLayout, XLayout_Center, XLayout_Top } from "@ui-lib/x-layout/XLayout";
import CommonFunction from "@lib/common";
import { Button } from "primereact/button";
// import _ from "lodash";
import "./styles.scss";
import CrmNavigation from "features/crm/components/CrmNavigation";

import { useNavigate } from "react-router-dom";
import { TabPanel, TabView } from "primereact/tabview";

import { getMenu, getPermistion } from "features/crm/utils";
// import CrmSteps from "../CrmSteps";
// import CrmServicePartyInvolvedCard from "../CrmServicePartyInvolvedCard";
import { ICON_MODULE_CRM, TASK_OBJECT_TYPE , TASK_OBJECT_TYPE_NAME } from "../../utils/constants";
import { formatNum, renderIconCRM } from "../../utils";
import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import CrmSteps from "../CrmSteps";
import CrmServicePartyInvolvedCard from "../CrmServicePartyInvolvedCard";
import CrmAttachment from "features/crm/components/CrmAttachment";
import { CrmEmployeeApi } from "services/CrmEmployeeService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import CrmSaleComment from "../CrmSaleComment";

import _ from "lodash";

const permissionPartyInvolvedCode =
    "crm-service-order_service-order-human";
const applicationService = "crm-service-order";
const entityRefType = "serviceOrder";

function CrmServiceServiceOderTab(props, ref) {
    const t = CommonFunction.t;

    const {
        serviceOrderId,
        serviceOrder,
        children,
        permissionCode,
        permissionParentCode,
        preview,
        setPreview,
        disableEdit,
        loading,
        isOpenEdit,
        openEdit,
        status,
        serviceOrderStages,
        accounts,
        reloadInfo,
    } = props;

    const [menu, setMenu] = useState({ menu: [], selected: null });

    const [permission, setPermission] = useState();

    const [info, setInfo] = useState([]);

    const [account, setAccount] = useState(null);

    const [employees, setEmployees] = useState([]);

    const history = useNavigate();

    const refEmployee = useRef();

    const [serviceOrderStage, setServiceOderStage] = useState([]);

    useImperativeHandle(ref, () => ({
        reloadEmployee: () => {
            refEmployee.current.reloadEmployee();
        },
    }));

    useEffect(() => {
        // load request
        if (serviceOrder) {
            let nameSatgeContract = employees.find(
                (e) => e.id === serviceOrder.ownerEmployeeId
            );

            let _State = serviceOrderStage.find(
                (e) => e.id === serviceOrder.serviceOrderStageId
            );

            setInfo([
                {
                    label: t("crm-service.service-order.code"),
                    value: serviceOrder.serviceOrderCode,
                },
                {
                    label: t("crm-service.service-order.employee-quote"),
                    value: nameSatgeContract?.fullName,
                },
                {
                    label: t("crm-service.service-order-cost.item.grand-total-money"),
                    value: `${serviceOrder.grandTotalSo} VNĐ`,
                },
                {
                    label: t("common.status"),
                    value: _State?.serviceOrderStageName,
                },
                {
                    label: t("crm-service.service-order.date-create"),
                    value: moment(serviceOrder?.createDate).format("DD/MM/YYYY"),
                },
            ]);
        } else {
            setInfo([]);
        }
    }, [serviceOrder, account]);

    const loadEmployees = () => {
        CrmEmployeeApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                const _employeeAll = [];
                res.map((o) => {
                    _employeeAll.push({
                        id: o.id,
                        fullName: `${
                            o.employeeLastName ? o.employeeLastName : ""
                        }${
                            o.employeeMiddleName
                                ? ` ${o.employeeMiddleName}`
                                : ``
                        }${
                            o.employeeFirstName ? ` ${o.employeeFirstName}` : ``
                        }`,
                    });
                });
                setEmployees(_employeeAll);
            } else {
                setEmployees([]);
            }
        });
    };

    const loadServiceOrderStage = () => {
        CrmServiceServiceOrderStageApi.get().then((res) => {
            if (res) {
                setServiceOderStage(res);
            }
        });
    };


    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        getMenu(
            t,
            history,
            "crm-service-order",
            "sub-menu",
            serviceOrderId,
            permissionCode,
            permissionParentCode,
            
            (_menu) => {
                if (_menu) {
                    CommonFunction.eventBus.dispatch("sub-menu-active", {
                        menuId: 0,
                        code: permissionParentCode,
                    });

                    setMenu(_menu);
                }
            },

            loadEmployees(),
            loadServiceOrderStage()
        );
    }, []);

    // useEffect(() => {
    //     loadAccount();
    // }, [serviceOrder, account]);

    // const loadAccount = async () => {
    //     if (contract) {
    //         const previewContractAccount = _.find(accounts, {
    //             id: contract.accountId,
    //         });
    //         setAccount(previewContractAccount?.accountName);
    //     }
    // };

    /**
     * onetime
     */
    useEffect(() => {
        // permission
        const _permission = getPermistion(
            window.app_context.user,
            permissionParentCode
        );
        setPermission(_permission);
    }, []);

    const onChangeTab = (e) => {
        if (menu?.menu && menu?.menu[e.index]) {
            history(menu?.menu[e.index].to.replace("#", ""));
        }
    };

    const renderHeaderBtns = () => {
        // const isDisable = contract?.contractStageId === 3
        return (
            <div className="action-wrapper mb-2">
                <Button
                    className="p-button-text p-button-info border-1 border-solid p-2 border-400 border-noround border-round-left-sm"
                    label={t("common.update")}
                    loading={loading}
                    onClick={onStartEditing}
                    disabled={!permission?.update || disableEdit}
                />
                <Button
                    className="p-button-text p-button-info border-noround p-2 border-1 border-solid border-400 border-left-none"
                    label={t("common.delete")}
                    loading={loading}
                    onClick={onDelete}
                    disabled={!permission?.delete}
                />
            </div>
        );
    };

    const onDelete = () => {
        CommonFunction.showConfirm(
            `${t("crm-sale.contract.remove-confirm").replace(
                `{0}`,
                contract.contractNumber
            )}`,
            t("button.confirm"),
            () => {
                CrmServiceServiceOrderApi.delete(serviceOrder.id)
                    .then((res) => {
                        if (res) {
                            history(-1);
                            CommonFunction.toastSuccess(
                                t("common.save-success")
                            );
                        }
                    })
                    .catch((error) => CommonFunction.toastError(error));
            }
        );
    };

    const onStartEditing = () => {
        if (isOpenEdit) openEdit();
        else setPreview(false);
    };

    const renderTabPanel = (tab, index) => {
        return (
            <TabPanel header={t(tab.label)} key={tab.code}>
                {index == menu?.selectedIndex ? children : null}
            </TabPanel>
        );
    };

    return (
        <>
            <XLayout className="p-2">
                <XLayout_Top>
                    <CrmNavigation
                        screenTitle={t("crm-service.service-order.tab.title")}
                        title={`${serviceOrder?.serviceOrderName}`}
                        right={renderHeaderBtns}
                        info={info}
                        icon={() => renderIconCRM(ICON_MODULE_CRM.SERVICE_ORDER)}
                    />
                </XLayout_Top>
                <XLayout_Center>
                    <div className="my-3">
                        <CrmSteps
                            objectId={serviceOrder?.id}
                            status={status.map((s) => ({
                                ...s,
                                label: s.serviceOrderStageName,
                            }))}
                            activeStatusId={serviceOrder?.serviceOrderStageId}
                            // info={stepInfo}
                            confirmLabel={t(
                                "crm-service.steps.status-confirmation-quote"
                            )}
                            // changeStateApi={CrmSaleContractApi.changeState}
                            reload={reloadInfo}
                            permission={permission}
                        />
                        <div className="p-fluid fluid grid pt-3">
                            <div className="col-12 lg:col-8">
                                <div className="p-card p-component">
                                    <div className="p-card-body">
                                        <TabView
                                            activeIndex={
                                                menu?.selectedIndex || 0
                                            }
                                            onTabChange={onChangeTab}
                                            panelContainerClassName="px-0"
                                        >
                                            {menu?.menu.map(renderTabPanel)}
                                        </TabView>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 lg:col-4">
                                <CrmServicePartyInvolvedCard
                                    ref={refEmployee}
                                    className="mb-3"
                                    id={serviceOrderId}
                                    permissionCode={permissionPartyInvolvedCode}
                                    objectTypeId={TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT}
                                    readOnly={!permission?.update}
                                    moduleName={serviceOrder?.serviceOrderCode}
                                    moduleLabel={t("crm-service.service-order.tab.title")}
                                    reloadInfo={reloadInfo}
                                />
                                <CrmAttachment
                                    className="mb-3"
                                    permissionCode={permissionParentCode}
                                    applicationService={applicationService}
                                    entityRefType={entityRefType}
                                    UUID={serviceOrder?.serviceOrderUUID}
                                    readOnly={!permission?.update}
                                />
                                 <CrmSaleComment
                                    id={serviceOrderId}
                                    type={TASK_OBJECT_TYPE_NAME.SERVICE_ORDER_OBJECT}
                                />
                            </div>
                        </div>
                    </div>
                </XLayout_Center>
            </XLayout>
        </>
    );
}

CrmServiceServiceOderTab = forwardRef(CrmServiceServiceOderTab);

export default CrmServiceServiceOderTab;

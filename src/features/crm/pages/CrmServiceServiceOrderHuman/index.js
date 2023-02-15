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
import { CrmServiceServiceOrderHumanApi } from "../../../../services/crm/CrmServiceServiceOrderHumanService";
import { CrmPriceApi } from "../../../../services/crm/CrmPriceService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CrmCreateDialog from "features/crm/components/CrmCreateDialog";
import { CrmEmployeeApi } from "services/crm/CrmEmployeeService";
import CrmServiceServiceOrderHumanDetail from "features/crm/components/CrmServiceServiceOrderHumanDetail";
import { SplitButton } from "primereact/splitbutton";
import CrmConfirmDialog from "../../components/CrmConfirmDialog";
import { CrmServicePartyInvolvedApi } from "services/crm/CrmServicePartyInvolvedService";

const permissionParentCode = "crm-service-order_service-order";
const permissionCode = "crm-service-order_service-order-human";

const emptyItem = {
    rowIndex: "0",
    id: null,
    materialPriceId: null,
    warehouse: "",
    materialStock: "",
    materialQuantity: "",
};

const emptyDetail = {
    priceOfMaterialId: null,
    items: [
        {
            ...emptyItem,
        },
    ],
};

const emptyValidate = {
    priceOfMaterialId: null,
    items: null,
};

export default function CrmServiceServiceOrderHuman(props) {
    const t = CommonFunction.t;
    const { p } = useParams();
    const serviceOrderId = p;

    const [permission, setPermission] = useState();

    const [serviceOrder, setServiceOrder] = useState(null);

    const [loading, setLoading] = useState(false);

    const refDetail = useRef();

    const refDialog = useRef();

    const [preview, setPreview] = useState(true);

    const [serviceOrderStages, setServiceOderStages] = useState([]);

    const [humans, setHumans] = useState([]);

    const [prices, setPrices] = useState([]);

    const [detail, setDetail] = useState(emptyDetail);

    const [validate, setValidate] = useState(emptyValidate);

    const [employees, setEmployees] = useState([]);

    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        loadServiceOrder();
        loadServiceOrderStages();
        loadPrices();
        loadEmployees();
    }, []);

    /**
     * onetime
     */
    useEffect(() => {
        setPermission(getPermistion(window.app_context.user, permissionCode));
        loadProduct();
    }, []);

    const loadEmployees = () => {
        CrmEmployeeApi.getAll({
            status: 1,
        }).then((response) => {
            if (response) {
                setEmployees(response);
            } else {
                setEmployees([]);
            }
        });
    };

    const loadProduct = () => {
        CrmServiceServiceOrderHumanApi.get(serviceOrderId).then(async (res) => {
            if (res) {
                let _requests = [];

                _requests = res;
                let employeeIds = [];
                _requests.map((o) => {
                    if (
                        o.employeeId &&
                        employeeIds.indexOf(o.employeeId) == -1
                    ) {
                        employeeIds.push(o.employeeId);
                    }
                });
                let ems = [];
                if (employeeIds.length) {
                    ems = await CrmEmployeeApi.getByIds(employeeIds).catch(
                        () => {}
                    );
                }

                if (ems.length) {

                    
                    _requests = _requests.map((o) => {
                        const em = o.employeeId
                            ? _.find(ems, { id: o.employeeId })
                            : null;
                        return {
                            ...o,
                            ownerEmployeeName: em
                                ? `${
                                      em.employeeLastName
                                          ? `${em.employeeLastName} `
                                          : ``
                                  }${
                                      em.employeeMiddleName
                                          ? `${em.employeeMiddleName} `
                                          : ``
                                  }${
                                      em.employeeFirstName
                                          ? em.employeeFirstName
                                          : ``
                                  }`
                                : null,
                            employeeTitleName: em?.employeeTitleName,
                            organizationName: em?.organizationName,
                            employeeCode: em?.employeeCode,
                            level: em?.level,
                            employeeEmail: em?.employeeEmail,
                            employeePhone: em?.employeePhone
                        };
                    });
                }

                setHumans(
                    _requests.map((req, i) => ({
                        ...req,
                        index: i + 1,
                    }))
                );
            } else {
                setHumans([]);
            }
        });

        setLoading(false);
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

    // const setLoadingSave = (flg) => {
    //     setLoading(flg)
    // }

    const onCancelEditing = () => {
        // setPreview(true)
        // loadServiceOrder()
    };

    const onSubmitProject = () => {
        // setLoading(true)
        // refDetail.current.submitProject()
    };

    const renderNumerical = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.index}</span>
            </div>
        );
    };

    const renderColumn2 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.ownerEmployeeName}</span>
            </div>
        );
    };

    const renderColumn3 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.employeeCode}</span>
            </div>
        );
    };

    const renderColumn4 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.employeeTitleName}</span>
            </div>
        );
    };

    const renderColumn5 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.level}</span>
            </div>
        );
    };

    const renderColumn6 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.organizationName}</span>
            </div>
        );
    };

    const renderColumn7 = (rowData) => {
        createHuman;
        return (
            <div>
                <span className="mr-2">{rowData.employeePhone}</span>
            </div>
        );
    };

    const renderColumn8 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.employeeEmail}</span>
            </div>
        );
    };

    const deleteAccount = (data) => {
        const content = `${t("crm-service-order.human.remove-confirm").replace(
            `{0}`,
            data.ownerEmployeeName
        )}`.split("?");
        CrmConfirmDialog({
            message: (
                <>
                    <span>{content[0]}?</span>
                    <br />
                    <span>{content[1]}</span>
                </>
            ),
            header: t("crm-service-order.human.delete"),
            accept: () =>
                CrmServicePartyInvolvedApi.delete(data.id)
                    .then((data) => {
                        if (data) {
                            loadProduct();
                            CommonFunction.toastSuccess(t("common.save-success"));
                        }
                    })
                    .catch((error) => CommonFunction.toastError(error)),
        });
    };


    const renderColEnd = (rowData) => {
        const items = [
            {
                label: t("common.delete"),
                disabled: !permission?.delete,
                icon: "bx bx-trash text-red",
                command: (e) => {
                    deleteAccount(rowData);
                },
            },
        ];
        return (
            <SplitButton
                dropdownIcon="bx bxs-down-arrow text-xs"
                className="p-button-info"
                buttonClassName="hidden"
                tooltip={t("action.detail")}
                tooltipOptions={{ position: "top" }}
                menuClassName="crm-splitbutton-menu"
                menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 crm-menu-dropdown-button"
                model={items}
            />
        );
    };

    const createHuman = () => {
        refDialog.current.create();
        // refDetail.current.create()
    };

    const setLoadingSave = (flg) => {
        refDialog.current.setLoading(flg);
    };

    const onDialogSave = () => {
        refDetail.current.submitProject();
    };

    const onCloseDialog = () => {
        refDialog.current.close();
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
                            title={t("crm-service.service-order.product-human")}
                            collapsed={false}
                        >
                            <div className={`pt-3 px-2`}>
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-12 px-3 py-1">
                                        <DataTable
                                            value={humans}
                                            dataKey="rowIndex"
                                            className="p-datatable-gridlines crm-service-service-order-table-human crm-table"
                                            emptyMessage={t(
                                                "common.no-record-found"
                                            )}
                                            resizableColumns
                                            columnResizeMode="expand"
                                            showGridlines
                                            responsiveLayout="scroll"
                                            scrollable
                                            scrollDirection="both"
                                            scrollHeight="flex"
                                            lazy
                                        >
                                            <Column
                                                header={""}
                                                className="col-table-stt flex justify-content-center align-items-center"
                                                body={renderNumerical}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.name"
                                                )}
                                                header={
                                                    <div>
                                                        {t(
                                                            "crm-service-order.service-order-human.name"
                                                        )}
                                                        <span className="text-red-400 ">
                                                            *
                                                        </span>
                                                    </div>
                                                }
                                                className="col-table-0"
                                                body={renderColumn2}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.code"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.code"
                                                )}
                                                className="col-table-2"
                                                body={renderColumn3}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.title"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.title"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn4}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.level"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.level"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn5}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.room"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.room"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn6}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.phone"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.phone"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn7}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order-human.email"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order-human.email"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn8}
                                            />
                                            <Column
                                                columnKey={'action'}
                                                align="right"
                                                className="col-table-end"
                                                bodyClassName="p-0 flex justify-content-center align-items-center border-all -right-first-column"
                                                body={renderColEnd}
                                            ></Column>
                                        </DataTable>
                                        <div className="w-auto">
                                            <Button
                                                className="p-button-text text-sm w-auto pl-1"
                                                icon="bx bx-plus text-green text-lg"
                                                tooltip={t(
                                                    "crm-service-order.human.detail.add"
                                                )}
                                                tooltipOptions={{
                                                    position: "bottom",
                                                }}
                                                onClick={createHuman}
                                                label={t(
                                                    "crm-service-order.human.detail.add"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CrmPanel>
                    </div>

                    <CrmCreateDialog
                        ref={refDialog}
                        title={t(`crm-service-order.human.detail.create`)}
                        permission={permission}
                        onSubmit={onDialogSave}
                    >
                        <CrmServiceServiceOrderHumanDetail
                            ref={refDetail}
                            permission={permission}
                            setLoading={setLoadingSave}
                            cancel={onCloseDialog}
                            reload={loadProduct}
                            employees={employees}
                            serviceOrderId={serviceOrderId}
                        />
                    </CrmCreateDialog>
                </>
            </CrmServiceServiceOderTab>
        </>
    );
}

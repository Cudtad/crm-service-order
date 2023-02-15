import React, { useEffect, useRef, useState, useImperativeHandle } from "react";
import CommonFunction from "@lib/common";
import { SplitButton } from "primereact/splitbutton";
import { Badge } from "primereact/badge";
import _ from "lodash";
import "./styles.scss";

import CrmServicePartyInvolvedDetail from "features/crm/components/CrmServicePartyInvolvedDetail";
import CrmCreateDialog from "features/crm/components/CrmCreateDialog";

import { CrmEmployeeApi } from "services/crm/CrmEmployeeService";
import { CrmServicePartyInvolvedApi } from "services/crm/CrmServicePartyInvolvedService";

import CrmSmallIconBackground from "../CrmSmallIconBackground";
import CrmTitleIcon from "../CrmTitleIcon";
import CrmCardReadMore from "../CrmCardReadMore";

import { getPermistion } from "../../utils";
import { TASK_OBJECT_TYPE } from "../../utils/constants";
import { Button } from "primereact/button";
import CrmConfirmDialog from "../CrmConfirmDialog";

import { forwardRef } from "react";
import { Tooltip } from "primereact/tooltip";
import { CrmAuthorizationGroupAPI } from "services/crm/CrmAuthorizationGroupService";

function CrmServicePartyInvolvedCard(props, ref) {
    const t = CommonFunction.t;
    const {
        id,
        className,
        permissionCode,
        objectTypeId,
        moduleName,
        readOnly,
        reloadInfo,
        moduleLabel,
    } = props;

    const [leadId, setLeadId] = useState();
    const [opportunityId, setOpportunityId] = useState();
    const [contractId, setContractId] = useState();
    const [quoteId, setQuoteId] = useState();
    const [orderId, setOrderId] = useState();
    const [contactId, setContactId] = useState();

    const [serviceOrderId, setServiceOrderId] = useState();

    const [permission, setPermission] = useState();

    const [employees, setEmployees] = useState([]);

    serviceOrderId;
    const [related, setRelated] = useState([]);

    const [edittingData, setEdittingData] = useState();

    const [loading, setLoading] = useState([]);

    const [isShowAll, setIsShowAll] = useState(false);

    const refDetail = useRef();

    const refDialog = useRef();

    const [userGroups, setUserGroups] = useState([]);

    useImperativeHandle(ref, () => ({
        reloadEmployee: () => {
            loadApi();
        },
    }));

    useEffect(() => {
        // load request
        switch (objectTypeId) {
            case TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT:
                setServiceOrderId(id);
                break;

            default:
        }

        loadApi();
        setPermission(getPermistion(window.app_context.user, permissionCode));
        loadEmployees();
        loadUserGroups();
    }, []);

    const loadUserGroups = () => {
        CrmAuthorizationGroupAPI.getAll({
            status: 1,
        })
            .then((res) => {
                if (res) setUserGroups(res);
                else setUserGroups([]);
            })
            .catch();
    };

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

    const processApi = async (res, isReset = false) => {
        if (res) {
            let emIds = [];
            let _res = _.chunk(res, (res || []).length);

            if (_res.length) {
                _res = _res[0];
            } else {
                _res = [];
            }
            _res.forEach((e) => {
                if (emIds.indexOf(e.employeeId) == -1) {
                    emIds.push(e.employeeId);
                }
            });

            let ems = [];
            if (emIds.length) {
                ems = await CrmEmployeeApi.getByIds(emIds).catch(() => {});
            }
            if (ems) {
                if (_res) {
                    _res.forEach((e) => {
                        let matchEmployee = ems.find(
                            (f) => f.id == e.employeeId
                        );
                        e.employeeFirstName = matchEmployee?.employeeFirstName;
                        e.employeeLastName = matchEmployee?.employeeLastName;
                        e.employeeMiddleName =
                            matchEmployee?.employeeMiddleName;
                        e.employeeIsActive = matchEmployee?.isActive;
                        e.employeeTitleName = matchEmployee?.employeeTitleName;
                        e.organizationName = matchEmployee?.organizationName;
                    });
                }
            }

            if (_res) {
                setRelated(_res);
            }
        }

        setLoading(false);
    };

    const loadApi = async () => {
        setLoading(true);
        let res = await CrmServicePartyInvolvedApi.getByObjectId(
            id,
            objectTypeId
        ).catch(() => {});
        processApi(res);

        if (res.length > 0) processApi(res);
    };

    const reloadApi = (type = "add") => {
        setLoading(true);
        CrmServicePartyInvolvedApi.getByObjectId(id, objectTypeId).then(
            (res) => {
                processApi(res);
            }
        );
    };

    const editProduct = (rowData) => () => {
        setEdittingData(rowData);
        refDialog.current.edit();
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

    const seeMore = () => {
        setIsShowAll((show) => !show);
    };

    const renderHeader = () => {
        return (
            <CrmTitleIcon
                icon="bx bx-user-plus"
                iconBgColor="rgba(217, 0, 27, .54)"
                title={t("crm-service-oder.party-involved")}
                items={[]}
            />
        );
    };

    const renderFooter = () => {
        // return <CrmCardReadMore path={`/crm/crm/lead/party-involved/${leadId}`} />;
        return (
            <div
                className={`flex align-items-center justify-content-center px-3 py-1 border-top-1 border-gray-400 ${
                    className ? className : ``
                }`}
            >
                <Button
                    label={
                        !isShowAll ? t("action.see-more") : t("action.collapse")
                    }
                    className="p-button-link p-button-sm"
                    onClick={seeMore}
                />
            </div>
        );
    };

    const renderRelated = (rowData) => {
        const items = [
            {
                label: t("common.update"),
                disabled: !permission?.update || readOnly,
                command: editProduct(rowData),
            },
        ];

        return (
            <div className="px-1 pb-2" key={rowData.id}>
                <div
                    className="flex align-items-center justify-content-between"
                    key={rowData.id}
                >
                    <div className="flex align-items-center">
                        <CrmSmallIconBackground
                            icon="bx bx-user-circle"
                            bgColor="#b8bdf0"
                        />
                        <Tooltip
                            target={`.knob-${rowData.id}`}
                            content={`${rowData.organizationName || ""}`}
                        />
                        <p
                            className={`ml-3 knob-${rowData.id} my-0 text-blue-400`}
                        >{`${
                            rowData.employeeLastName
                                ? `${rowData.employeeLastName} `
                                : ``
                        }${
                            rowData.employeeMiddleName
                                ? `${rowData.employeeMiddleName} `
                                : ``
                        }${
                            rowData.employeeFirstName
                                ? rowData.employeeFirstName
                                : ``
                        }`}</p>
                        {rowData.isMain ? (
                            <>
                                <Badge
                                    severity="info"
                                    value={t("crm-service-order.service-party-involved.owner")}
                                    className="ml-2"
                                />
                            </>
                        ) : null}
                    </div>
                    <div>
                        <SplitButton
                            dropdownIcon="bx bxs-down-arrow text-xs"
                            className="p-button-info"
                            buttonClassName="hidden"
                            menuClassName="crm-splitbutton-menu"
                            menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 menu-dropdown-button"
                            model={items}
                        />
                    </div>
                </div>

                <div className="formgrid grid align-items-center mt-1 pl-6 -ml-1">
                    <div>
                        <p className="my-0 crm-text-13">
                            {t(
                                "crm-service-oder.service-party-involved.position"
                            )}
                            :{" "}
                        </p>
                    </div>
                    <div>
                        <p className="my-0 crm-text-13 ml-1">
                            {rowData.employeeTitleName}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const _relatedShow = isShowAll ? related : related.slice(0, 2);
    if (!permission?.view) {
        return null;
    }
    return (
        <>
            <div
                className={`p-card p-card-component overflow-hidden ${
                    className ? className : ``
                }`}
            >
                <div className="p-card-header">{renderHeader()}</div>
                {related.length ? (
                    <div className="p-card-body">
                        <div className="p-card-content py-0 crm-party-involve">
                            {_relatedShow.map(renderRelated)}
                        </div>
                    </div>
                ) : null}
                {related.length > 2 ? (
                    <div className="p-card-footer">{renderFooter()}</div>
                ) : null}
            </div>

            <CrmCreateDialog
                ref={refDialog}
                title={t(`crm-service-order.service-party-involved.update`)}
                onSubmit={onDialogSave}
                permission={permission}
            >
                <CrmServicePartyInvolvedDetail
                    ref={refDetail}
                    objectTypeId={objectTypeId}
                    serviceOrderId={serviceOrderId}
                    data={edittingData}
                    employees={employees}
                    permission={permission}
                    moduleName={moduleName}
                    moduleLabel={moduleLabel}
                    reloadInfo={reloadInfo}
                    reload={reloadApi}
                    setLoading={setLoadingSave}
                    cancel={onCloseDialog}
                    userGroups={userGroups}
                />
            </CrmCreateDialog>
        </>
    );
}

CrmServicePartyInvolvedCard = forwardRef(CrmServicePartyInvolvedCard);
export default CrmServicePartyInvolvedCard;

import React, { useEffect, useRef, useState, forwardRef } from "react";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { XLayout, XLayout_Bottom, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Right, XLayout_Row, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import _ from "lodash";
import { Button } from "primereact/button";

import CommonFunction from '@lib/common';
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';
import { InputText } from "primereact/inputtext";
import "./styles.scss";
import classNames from "classnames";

import { OverlayPanel } from "primereact/overlaypanel";
import CrmMdEmployeeDetail from "features/crm/components/CrmMdEmployeeDetail";
import { CrmEmployeeApi } from "services/CrmEmployeeService";
import { getPermistion } from "features/crm/utils";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import Enumeration from '@lib/enum';
import CrmExportDialog from "../../components/CrmExportDialog";
/**
 * props
 *      application: "system" // applications for config role, "system" for main menu
 *      groupType: "" // get group by type
 *      groupTypeName: "" // group type name for display header
 *      groupGetFn: async () => { return groups } // function to get group, if null, automatic get group by groupType
 *      roleGetFn: async () => { return roles } // function to get role, if null, auto matic get by application
 * @param {*} props
 * @param {*} ref
 * @returns
 */

const permissionCode = "crm-service_settings_employee"

const permissionAdminCode = "crm-service_settings_employee_author"

function CrmMdEmployee(props, ref) {
    const t = CommonFunction.t;
    const [keywordSearch, setKeywordSearch] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState({ id: 0 });
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const refDetail = useRef(null);
    const { user } = props;
    const opFilter = useRef(null);
    const [permission, setPermission] = useState()
    const [permissionAdmin, setPermissionAdmin] = useState()
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 20,
        page: 0,
    })
    const [localEmployeeId , setLocalEmployeeId] = useState(localStorage.getItem('employeeId'))
    const refExport = useRef();

    useEffect(() => {
        setPermission(getPermistion(window.app_context.user, permissionCode))
        setPermissionAdmin(getPermistion(window.app_context.user, permissionAdminCode))
        loadEmployees(lazyParams)
    }, []);

    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        loadEmployees()
    }, [lazyParams])

    /**
     * load groups
     */
    const loadEmployees = (_lazy) => {
        _lazy = _lazy ? _lazy : _.cloneDeep(lazyParams);
        setLoading(true);
        // filters = filters ? filters : filter;
        // employees.keyword = keywordSearch ? keywordSearch : "";
        // let kSearch = keyword;
        // if (keyword == -1) kSearch = employees.keyword;
        CrmEmployeeApi.get(_lazy).then(res => {
            if (res) {
                setTotalRecords(res.total);
                // prepare data
                let _requests = [];
                if (res.content && res.content.length > 0) {
                    _requests = res.content;
                }
                setEmployees(_requests);
            }
            setLoading(false);
        })
    };

    /**
     * create emp
     */
    const createEmployee = () => {
        // check if creating
        if (employees.length > 0 && employees[0].id === -1) {
            if (refDetail.current.checkChange()) {
                CommonFunction.showConfirm(t("common.data-changed.confirm.message"), t("common.data-changed.confirm.title"), () => {
                    refDetail.current.reset()
                })
            } else {
                refDetail.current.reset()
            }

            return;
        }

        let _employees = _.cloneDeep(employees);
        _employees.unshift({
            id: -1,
        });

        setEmployees(_employees);
        setSelectedEmployee({ id: -1 });
        refDetail.current.create();
    };

    /**
     * update emp
     */
    const updateEmployee = (_employee) => {
        if (_employee.id !== selectedEmployee.id) {
            // check data changed
            if (refDetail.current.checkChange()) {
                CommonFunction.showConfirm(t("common.data-changed.confirm.message"), t("common.data-changed.confirm.title"), () => {
                    performUpdateEmployee(_employee);
                });
            } else {
                performUpdateEmployee(_employee);
            }
        }
    };

    const performUpdateEmployee = (_employee) => {
        if (employees[0]?.id === -1) {
            afterCancelCreate();
        }

        CrmEmployeeApi.getById(_employee.id).then(res => {
            if (res) {
                setSelectedEmployee(res)
                refDetail.current.update(res)
            }
        })

    };

    /**
     * after cancel create
     */
    const afterCancelCreate = () => {
        let _employees = _.cloneDeep(employees);
        _employees.shift();
        setEmployees(_employees);
        setSelectedEmployee({ id: -1 });
    };

    /**
     * apply search keyword
     */
    const applySearchKeyword = (val) => {
        // setKeywordSearch(val);
        // loadEmployees(selectedOrganization, 0, val, filter);
        CommonFunction.debounce(null, onFilter, val)
    };

    /**
     * on datatable filter
     * @param {String} val
     */
    const onFilter = (val) => {
        let _lazyParams = { ...lazyParams, page: 0, filter: val }
        setLazyParams(_lazyParams)
    }

    /**
     * after submit employee
     * @param {*} mode
     * @param {*} _employee
     */
    const afterSubmitEmployee = (mode, _employee, _module) => {
        if (mode == Enumeration.crud.delete) {
            // afterCancelCreate()
            let _employees = _.cloneDeep(employees);
            _employees.shift();
            setEmployees(_employees);
            setSelectedEmployee({ id: -1 });
        }
        if (mode == Enumeration.crud.create) {
            refDetail.current.hide()
            performUpdateEmployee(_employee)

        }
        loadEmployees(lazyParams)
    };

    /**
     * next page
     */
    const nextPage = () => {
        let _lazyParams = { ...lazyParams, page: (lazyParams.page < Math.floor(totalRecords / 20) ? lazyParams.page + 1 : lazyParams.page) };
        setLazyParams(_lazyParams);
    };

    /**
     * next page
     */
    const previousPage = () => {
        // loadEmployees(null, employees.page - 1, null, filter);
        let _lazyParams = { ...lazyParams, page: (lazyParams.page > 0 ? lazyParams.page - 1 : lazyParams.page) };
        setLazyParams(_lazyParams);
    };

    const renderToolbarLeft = () => {
        return <>
            <Button
                label={t('common.create')}
                icon="bx bx-user create"
                onClick={() => createEmployee()}
                disabled={!permission?.create || !localEmployeeId }
            ></Button>
            <Button
                icon="bx bxs-file-export"
                label={t("action.export")}
                disabled={!permission?.create || !localEmployeeId}
                onClick={() => refExport.current.open()}
            />
        </>
    }

    const renderToolbarRight = () => {
        return <>
            {/* <XDropdownTree
                value={selectedOrganization}
                options={organization}
                optionLabel="name"
                optionValue="id"
                filter
                filterBy="name"
                // afterBindData={(data) => afterOrganizationBind(data)}
                // onChange={(e) => onChangeOrganization(e.value)}
                style={{ width: "250px" }}
                className="mr-2"
            ></XDropdownTree> */}

            <span className="p-input-icon-left">
                <i className="bx bx-search-alt" />
                <InputText style={{ width: "250px" }} onChange={(e) => CommonFunction.debounce(null, applySearchKeyword, e.target.value)} placeholder={t("crm.employee.search")} />
            </span>
            {/* <Button icon="bx bx-filter'" className="p-button-rounded p-button-text p-button-plain button-filter" onClick={(e) => opFilter.current.toggle(e)} />
            <OverlayPanel ref={opFilter} className="x-menu">
                <div className="formgrid grid p-fluid fluid " style={{ width: "550px", padding: "10px" }}>
                    <div className="col-12">
                    <span className="p-float-label">
                        <MultiSelect optionLabel="name" optionValue="code" display="chip" value={filter.states} inputId="state-filter" options={dictionary?.profile_status} onChange={(e) => applyFilterChange("states", e.value)} />

                        <label htmlFor="state-filter">{t("task.filter.state")}</label>
                    </span>
                </div>
                <div className="col-12">
                    <span className="p-float-label">
                        <MultiSelect optionLabel="name" optionValue="id" display="chip" value={filter.positionId} inputId="state-filter" options={dictionary?.employee_position} onChange={(e) => applyFilterChange("positionId", e.value)} />

                        <label htmlFor="state-filter">{t("common.position")}</label>
                    </span>
                </div>
                <div className="pb-0 col-4">
                    <span className="p-float-label">
                        <p>
                            {t("user.employee-start-date")}
                        </p>
                    </span>
                </div>
                <div className="pb-0 col-4">
                    <span className="p-float-label">
                        <p>
                            {t("hcm.employee.end-probationary-date")}
                        </p>
                    </span>
                </div>

                <div className="pb-0 col-4">
                    <span className="p-float-label">
                        <p>
                            {t("hcm.employee.end-date")}
                        </p>
                    </span>
                </div>
                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.fromdate")} value={filter.deadlineFrom} onChange={(e) => applyFilterChange("deadlineFrom", e)} />
                    </span>
                </div>

                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.fromdate")} value={filter.probationaryDateFrom} onChange={(e) => applyFilterChange("probationaryDateFrom", e)} />
                    </span>
                </div>
                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.fromdate")} value={filter.endDateFrom} onChange={(e) => applyFilterChange("endDateFrom", e)} />
                    </span>
                </div>
                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.todate")} value={filter.deadlineTo} onChange={(e) => applyFilterChange("deadlineTo", e)} />
                    </span>
                </div>

                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.todate")} value={filter.probationaryDateTo} onChange={(e) => applyFilterChange("probationaryDateTo", e)} />
                    </span>
                </div>
                <div className="col-4">
                    <span className="p-float-label mt-1">
                        <XCalendar labelClassName="hcm-employee-infor-filter-date" showDate label={t("common.todate")} value={filter.endDateTo} onChange={(e) => applyFilterChange("endDateTo", e)} />
                    </span>
                </div>
                </div>
            </OverlayPanel> */}
        </>
    }

    const dataExport = (employees || []).map((rowData) => {
        return {
          [t("crm.employee.code")]: `${rowData.employeeCode || rowData.id}`,
          [t("crm.employee.name")]: `${rowData.employeeLastName ? `${rowData.employeeLastName} ` : ``}${rowData.employeeMiddleName ? `${rowData.employeeMiddleName} ` : ``}${rowData.employeeFirstName ? `${rowData.employeeFirstName}` : ``}`,
          [t("crm.employee.phone")]: rowData.employeePhone,
          [t("crm.employee.email")]: rowData.employeeEmail || rowData.username,
          [t("crm.employee.organization")]: rowData.organizationName,
          [t("crm.employee.employee-title")]: rowData.employeeTitleName,
        };
      });
    

    return (
        <>
            <XLayout className="p-2 employee-list" left="25%">
                <XLayout_Top>
                    <XToolbar
                        className="mb-2"
                        left={renderToolbarLeft}
                        right={renderToolbarRight}
                    ></XToolbar>
                </XLayout_Top>

                <XLayout_Left className="mr-2">
                    <XLayout>
                        <XLayout_Center className="position-relative">
                            <LoadingBar loading={loading}></LoadingBar>
                            <XLayout className="list-wrapper">
                                <XLayout_Center>
                                    {employees.map((p) => {
                                        if (p.id === -1) {
                                            return (
                                                <div key={p.id} className="employee-row new-person selected">
                                                    {t("hcm.employee.employee-new")}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={p.id} className={classNames({ "employee-row": true, selected: p.id === selectedEmployee.id })} onClick={(e) => updateEmployee(p)}>
                                                    <XAvatar
                                                        className="employee-avatar"
                                                        avatar={CommonFunction.getImageUrl(p.employeeAvatarId, `${p.employeeLastName ? `${p.employeeLastName} ` : ``}${p.employeeMiddleName ? `${p.employeeMiddleName} ` : ``}${p.employeeFirstName ? `${p.employeeFirstName}` : ``}`, 36, 36)}
                                                        name={`${p.employeeLastName ? `${p.employeeLastName} ` : ``}${p.employeeMiddleName ? `${p.employeeMiddleName} ` : ``}${p.employeeFirstName ? `${p.employeeFirstName}` : ``}`}
                                                        size="36px"
                                                    />
                                                    <div className="employee-info">
                                                        <div className="employee-name">{`${p.employeeLastName ? `${p.employeeLastName} ` : ``}${p.employeeMiddleName ? `${p.employeeMiddleName} ` : ``}${p.employeeFirstName ? `${p.employeeFirstName}` : ``}`}</div>
                                                        <div className="employee-position">{p.organizationName}</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                    {employees.length === 0 && <div className="no-data-found">{t("common.no-record-found")}</div>}
                                </XLayout_Center>

                                <XLayout_Bottom>
                                    <div className="list-paging">
                                        <div>
                                            <span>{t("hcm.employee.list.total")}</span>
                                            <span className="bold">
                                                {totalRecords}
                                            </span>
                                        </div>
                                        <div className="flex align-items-center">
                                            <span className="bold">{lazyParams.page + 1}</span>
                                            <span className="px-1">-</span>
                                            <span className="bold mr-1">{totalRecords ? Math.floor(totalRecords / 20) + 1 : 0}</span>
                                            <Button icon={classNames({ "bx bx-chevron-left": true, "text-grey-5": lazyParams.page == lazyParams.first || loading })} className="p-button-rounded p-button-text" disabled={lazyParams.page == lazyParams.first || loading} onClick={previousPage}></Button>
                                            <Button icon={classNames({ "bx bx-chevron-right": true, "text-grey-5": lazyParams.page == Math.floor(totalRecords / 20) || loading })} className="p-button-rounded p-button-text" disabled={lazyParams.page == Math.floor(totalRecords / 20) || loading} onClick={nextPage}></Button>
                                        </div>
                                    </div>
                                </XLayout_Bottom>
                            </XLayout>
                        </XLayout_Center>
                    </XLayout>
                </XLayout_Left>

                <XLayout_Center>
                    <CrmMdEmployeeDetail
                        ref={refDetail}
                        selectedOrg={selectedOrganization}
                        afterCancelCreate={afterCancelCreate}
                        afterSubmit={afterSubmitEmployee}
                        permission={permission}
                        permissionAdmin={permissionAdmin}
                    />
                    {selectedEmployee.id === 0 && (
                        <XLayout_Box className="h-full bg-semi-transparent flex flex-column align-items-center justify-content-center">
                            <div>
                                <span className="bx bx-info-circle text-grey-5 fs-30"></span>
                            </div>
                            <div className="bigger text-grey mt-2">{t("crm.employee.not-selected")}</div>
                        </XLayout_Box>
                    )}
                </XLayout_Center>
            </XLayout>

            <CrmExportDialog
                ref={refExport}
                data={dataExport}
                moduleName="account"
                title={t(`common.choose-format-type`)}
                permission={permission}
            ></CrmExportDialog>
        </>
    );
}

CrmMdEmployee = forwardRef(CrmMdEmployee);

export default CrmMdEmployee;

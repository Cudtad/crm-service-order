import EmptyData from "@ui-lib/empty-data/EmptyData";
import {
    XLayout,
    XLayout_Box,
    XLayout_Center,
    XLayout_Top,
} from "@ui-lib/x-layout/XLayout";
import CommonFunction from "@lib/common";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { getPermistion, renderIconCRM } from "../../utils";
import { CrmAccountApi } from "services/crm/CrmAccountService";
import "./styles.scss";
// import { CrmAccountApi } from "services/crm/CrmAccountService";
import CrmCreateDialog from "features/crm/components/CrmCreateDialog";
import { SplitButton } from "primereact/splitbutton";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import CrmServiceServiceOderDetail from "../../components/CrmServiceServiceOrderDetail";
import CrmConfirmDialog from "../../components/CrmConfirmDialog";
import { XAvatar } from "@ui-lib/x-avatar/XAvatar";
import { CrmEmployeeApi } from "services/crm/CrmEmployeeService";
import { XCalendar } from "@ui-lib/x-calendar/XCalendar";
import { CrmProductApi } from "services/crm/CrmProductService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import CrmTableSettingDetail from "../../components/CrmTableSettingDetail";
import { ICON_MODULE_CRM, TASK_OBJECT_TYPE } from "../../utils/constants";
import { CrmColumnConfigApi } from "../../../../services/crm/CrmColumnConfigService";

import moment from "moment";

const permissionCode = "crm-service-order_service-order";

export default function CrmServiceServiceOder(props) {
    const t = CommonFunction.t;

    const [permission, setPermission] = useState();

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 20,
        page: 0,
    });

    const [totalRecords, setTotalRecords] = useState(0);

    const [loading, setLoading] = useState(false);

    const [edittingData, setEdittingData] = useState(false);

    const [selectedCustomers, setSelectedCustomers] = useState(null);

    const [serviceOders, setServiceOders] = useState([]);

    const refDetail = useRef();

    const refDialog = useRef();

    const refTable = useRef();

    const refFilterPanel = useRef(null);

    const refTableSetting = useRef();

    const [accounts, setAccounts] = useState([]);

    const [detail, setDetail] = useState({});

    const [employeeAll, setEmployeeAll] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [products, setProducts] = useState([]);

    const [serviceOrderStage, setServiceOderStage] = useState([]);

    const [tableConfig, setTableConfig] = useState(null);

    const filterColumns = [
        {
            columnName: "crm-service.service-order.code",
        },
        {
            columnName: "crm-service.service-order.name",
        },
        {
            columnName: "crm-service.service-order.account-name",
        },
        {
            columnName: "crm-service.service-order.product",
        },
        {
            columnName: "crm-service.service-order.other-product",
        },
        {
            columnName: "crm-service.service-order.stage",
        },
        {
            columnName: "crm-service.service-order.reception-day",
        },
        {
            columnName: "crm-service.service-order.finish-day",
        },
        {
            columnName: "crm-service.service-order.employee",
        },
    ];

    const [selectedColumns, setSelectedColumns] = useState(
        filterColumns.map((o) => ({
            ...o,
            field: t(o.columnName),
            header: t(o.columnName),
        }))
    );

    /**
     * manytimes
     */
    useEffect(() => {
        // load request
        loadProduct();
    }, [lazyParams]);

    /**
     * onetime
     */
    useEffect(() => {
        permission;
        setPermission(getPermistion(window.app_context.user, permissionCode));
        refTable.current.reset();
        loadAccounts();
        loadEmployees();
        loadProducts();
        loadServiceOrderStage();
        loadColumnConfig();
    }, []);

    const loadServiceOrderStage = () => {
        CrmServiceServiceOrderStageApi.get().then((res) => {
            if (res) {
                setServiceOderStage(res);
            }
        });
    };

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

    useEffect(() => {
        const _employeeAll = [];
        employees.map((o) => {
            if (o.userId) {
                _employeeAll.push({
                    id: o.id,
                    fullName: `${o.employeeLastName ? o.employeeLastName : ""}${
                        o.employeeMiddleName ? ` ${o.employeeMiddleName}` : ``
                    }${o.employeeFirstName ? ` ${o.employeeFirstName}` : ``}`,
                    userId: o.userId,
                });
            }
        });

        setEmployeeAll(_employeeAll);
    }, [employees]);

    const loadAccounts = () => {
        CrmAccountApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                let _accountAll = [];
                res.map((o) => {
                    _accountAll.push({
                        id: o.id,
                        fullName: o.accountName ? o.accountName : "",
                    });
                });
                setAccounts(_accountAll);
            } else {
                setAccounts([]);
            }
        });
    };

    /**
     * load requests created by user
     */
    const loadProduct = (_lazy) => {
        _lazy = _lazy ? _lazy : _.cloneDeep(lazyParams);
        setLoading(true);
        CrmServiceServiceOrderApi.get({ ..._lazy, sortOrder: -1 }).then(
            (res) => {
                if (res) {
                    setTotalRecords(res.total);
                    // prepare data
                    let _requests = [];
                    if (res.content && res.content.length > 0) {
                        _requests = res.content;
                    }

                    setServiceOders(
                        _requests.map((req, i) => ({
                            ...req,
                            index: i + 1 + lazyParams.page * lazyParams.rows,
                        }))
                    );
                }
                setLoading(false);
            }
        );
    };

    /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    };

    /**
     * on datatable click sort on header
     * @param {*} event
     */
    const onSort = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    };

    /**
     * on datatable filter
     * @param {String} val
     */
    const onFilter = (val) => {
        let _lazyParams = { ...lazyParams, page: 0, filter: val };
        setLazyParams(_lazyParams);
    };

    const onSearch = (e) => {
        CommonFunction.debounce(null, onFilter, e.target.value);
    };

    const onDelete = (data) => {
        const content = `${t("crm.material.delete-confirm").replace(
            `{0}`,
            data.serviceOrderName
        )}`.split("?");
        CrmConfirmDialog({
            message: (
                <>
                    <span>{content[0]}?</span>
                    <br />
                    <span>{content[1]}</span>
                </>
            ),
            header: t("crm.material-type.delete"),
            accept: () => {
                CrmServiceServiceOrderApi.delete(data.id)
                    .then((data) => {
                        if (data) {
                            loadProduct();
                            CommonFunction.toastSuccess(
                                t("common.save-success")
                            );
                        }
                    })
                    .catch((error) => CommonFunction.toastError(error));
            },
        });
    };

    // Dialog action start
    const createProduct = () => {
        setEdittingData(null);
        refDialog.current.create();
        // refDetail.current.create()
    };

    const editProduct = (data) => () => {
        CrmServiceServiceOrderApi.getById(data.id).then((res) => {
            setEdittingData(res);
            refDialog.current.edit(permission.update);
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
    // Dialog end

    const renderNumericalOrder = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.index}</span>
            </div>
        );
    };

    const renderToolbarLeft = () => {
        // const dataFilters = [
        //   {
        //     value: "all_open_leads",
        //     label: t("crm-sale.account.all"),
        //   },
        // ];

        return (
            <div className="crm-toolbar-left-wrapper">
                <div className="filter-wrapper flex justify-content-center align-items-center">
                    {renderIconCRM(ICON_MODULE_CRM.SERVICE_ORDER)}
                    <div className="ml-2">
                        {" "}
                        <span className="module-name">
                            {t("crm.service-oder.tab.title")}
                        </span>
                        <div className="w-max flex align-items-center	">
                            <MultiSelect
                                value={null}
                                options={[]}
                                optionLabel="header"
                                style={{ width: "20em" }}
                                placeholder={t("crm.service-oder.all")}
                                fixedPlaceholder={true}
                                disabled
                            />
                            <Button
                                icon="bx bxs-pin"
                                className="p-button-outlined p-button-sm p-button-info ml-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderToolbarRight = () => {
        return (
            <>
                <div className="crm-toolbar-right-wrapper w-full text-right">
                    <div className="action-wrapper mb-2">
                        <Button
                            label={
                                <span className="link-button">
                                    {t("crm.service-oder.create")}
                                </span>
                            }
                            tooltip={t("crm.service-oder.create")}
                            tooltipOptions={{ position: "top" }}
                            disabled={!permission?.create}
                            className="p-button-text  border-1 border-solid p-2 border-400 border-noround border-round-left-sm"
                            onClick={createProduct}
                        />
                    </div>

                    <div className="search-wrapper flex justify-content-end align-items-center">
                        <span className="p-input-icon-left mr-2 w-25rem">
                            <i className="bx bx-search-alt" />
                            <InputText
                                className="crm-search-input border-400 bg-white border-round-sm"
                                onInput={onSearch}
                                placeholder={t("common.search")}
                            />
                        </span>
                        <Button
                            tooltip={t("action.table-setting")}
                            tooltipOptions={{ position: "top" }}
                            icon="bx bx-cog text-xl"
                            onClick={(e) => refTableSetting.current.open()}
                            className="p-button-outlined text-color-secondary ml-1 p-2"
                        />
                        <Button
                            tooltip={t("action.filter")}
                            tooltipOptions={{ position: "top" }}
                            icon="bx bx-filter-alt text-xl"
                            onClick={(e) => refFilterPanel.current.toggle(e)}
                            className="p-button-outlined text-color-secondary ml-1 p-2"
                        />
                    </div>
                </div>
            </>
        );
    };

    const reloadTable = (config) => {
        if (config && config.columConfigDetailDTOS?.length) {
            setSelectedColumns(
                config.columConfigDetailDTOS.map((o) => ({
                    ...o,
                    field: t(o.columnName),
                    header: t(o.columnName),
                }))
            );
        }
        setTableConfig(config);
    };

    const loadColumnConfig = () => {
        CrmColumnConfigApi.get({
            objectTypeId: TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT,
        }).then((res) => {
            setTableConfig(res);
            if (res && res.columConfigDetailDTOS?.length) {
                setSelectedColumns(
                    res.columConfigDetailDTOS.map((o) => ({
                        ...o,
                        field: t(o.columnName),
                        header: t(o.columnName),
                    }))
                );
            }
        });
    };

    const renderHeader = () => {
        return (
            <div className="flex ">
                {renderToolbarLeft()}
                {renderToolbarRight()}
            </div>
        );
    };

    const getDetailUrl = (data) => {
        return `#/crm-service-order/service-order/infor/${data.id}`;
    };

    const getAccountUrl = (data) => {
        return `#/crm-master/account/information/${data.accountId}`;
    };

    const renderCol0 = (rowData) => {
        return (
            <a className="link-button" href={getDetailUrl(rowData)}>
                {rowData.serviceOrderCode}
            </a>
        );
    };

    const renderCol1 = (rowData) => {
        return <p className="">{rowData.serviceOrderName}</p>;
    };

    const renderCol2 = (rowData) => {
        let _account = _.find(accounts, { id: rowData.accountId });
        return (
            <a className="link-button" href={getAccountUrl(rowData)}>
                {_account?.fullName}
            </a>
        );
    };

    const renderCol3 = (rowData) => {
        const invoices = ['Điện thoại Iphone 14 ProMax 512GB - Hàng chính hãng', 'Tai nghe Airpod 2 - Hàng chính hãng', 'Iphone 12 64GB'] 
        const title = {
            label: (
                <span className="crm-text-13 font-semibold p-0 ">
                    {t("crm-service.service-order.product-total").replace(
                        `{0}`,
                        invoices.length
                    )}
                </span>
            ),
        };
        return (
            <p className="relative flex align-items-center w-full crm-table-column-product ">
                {invoices.length > 0 && (
                    <XAvatar
                        className="employee-avatar"
                        avatar={CommonFunction.getImageUrl(
                            null,
                            invoices[0],
                            15,
                            15
                        )}
                        name={invoices[0]}
                        label={() => <span>{invoices[0]}</span>}
                        size="15px"
                    />
                )}
                {invoices.length > 1 && (
                    <SplitButton
                        dropdownIcon="bx bxs-down-arrow text-xs"
                        className="p-button-info absolute right-0"
                        buttonClassName="hidden"
                        menuButtonClassName="border-round-sm p-button p-button-outlined text-color-secondary p-0 menu-dropdown-button dropdown-lead-product"
                        menuClassName="crm-splitbutton-menu crm-splitbutton-product"
                        model={[
                            title,
                            ...invoices.map((i, index) => ({
                                label: (
                                    <div className="">
                                        <XAvatar
                                            className={`employee-avatar `}
                                            avatar={CommonFunction.getImageUrl(
                                                null,
                                                i,
                                                15,
                                                15
                                            )}
                                            name={i}
                                            label={() => <span>{i}</span>}
                                            size="15px"
                                        />
                                    </div>
                                ),
                            })),
                        ]}
                    />
                )}
            </p>
        );
    };

    const renderCol4 = (rowData) => {
        const invoices = ['Điện thoại Samsung S7', 'Máy tính DELL'] 
        const title = {
            label: (
                <span className="crm-text-13 font-semibold p-0 ">
                    {t("crm-service.service-order.product-total-orther").replace(
                        `{0}`,
                        invoices.length
                    )}
                </span>
            ),
        };
        return (
            <p className="relative flex align-items-center w-full crm-table-column-product ">
                {invoices.length > 0 && (
                    <XAvatar
                        className="employee-avatar"
                        avatar={CommonFunction.getImageUrl(
                            null,
                            invoices[0],
                            15,
                            15
                        )}
                        name={invoices[0]}
                        label={() => <span>{invoices[0]}</span>}
                        size="15px"
                    />
                )}
                {invoices.length > 1 && (
                    <SplitButton
                        dropdownIcon="bx bxs-down-arrow text-xs"
                        className="p-button-info absolute right-0"
                        buttonClassName="hidden"
                        menuButtonClassName="border-round-sm p-button p-button-outlined text-color-secondary p-0 menu-dropdown-button dropdown-lead-product"
                        menuClassName="crm-splitbutton-menu crm-splitbutton-product"
                        model={[
                            title,
                            ...invoices.map((i, index) => ({
                                label: (
                                    <div className="">
                                        <XAvatar
                                            className={`employee-avatar `}
                                            avatar={CommonFunction.getImageUrl(
                                                null,
                                                i,
                                                15,
                                                15
                                            )}
                                            name={i}
                                            label={() => <span>{i}</span>}
                                            size="15px"
                                        />
                                    </div>
                                ),
                            })),
                        ]}
                    />
                )}
            </p>
        );
    };

    const renderCol5 = (rowData) => {
        let _status = _.find(serviceOrderStage, {
            id: rowData.serviceOrderStageId,
        });
        return <p className="">{_status?.serviceOrderStageName}</p>;
    };

    const renderCol6 = (rowData) => {
        return <p className="">{rowData.startDate}</p>;
    };

    const renderCol7 = (rowData) => {
        return <p className="">{rowData.endDate}</p>;
    };

    const renderCol8 = (rowData) => {
        let _ownerEmployee = _.find(employeeAll, {
            id: rowData.ownerEmployeeId,
        });
        return <p className="">{_ownerEmployee?.fullName}</p>;
    };

    const renderColEnd = (rowData) => {
        const items = [
            {
                label: t("common.update"),
                icon: "bx bx-pencil",
                disabled: !permission?.update,
                command: editProduct(rowData),
            },
            {
                label: t("common.delete"),
                disabled: !permission?.delete,
                icon: "bx bx-trash text-red",
                command: () => onDelete(rowData),
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
                menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 menu-dropdown-button"
                model={items}
            />
        );
    };

    const columnComponents = selectedColumns.map((col) => {
        let renderCol = () => {};
        switch (col.columnName) {
            case "crm-service.service-order.code":
                renderCol = renderCol0;
                break;
            case "crm-service.service-order.name":
                renderCol = renderCol1;
                break;
            case "crm-service.service-order.account-name":
                renderCol = renderCol2;
                break;
            case "crm-service.service-order.product":
                renderCol = renderCol3;
                break;
            case "crm-service.service-order.other-product":
                renderCol = renderCol4;
                break;
            case "crm-service.service-order.stage":
                renderCol = renderCol5;
                break;
            case "crm-service.service-order.reception-day":
                renderCol = renderCol6;
                break;
            case "crm-service.service-order.finish-day":
                renderCol = renderCol7;
                break;
            case "crm-service.service-order.employee":
                renderCol = renderCol8;
                break;
        }
        return (
            <Column
                key={col.columnName}
                field={col.field}
                header={col.header}
                style={{ width: `${col.columnWidth ?? 200}px` }}
                body={renderCol}
            />
        );
    });

    const filterEmployee = (e) => {
        onFilterData("ownerEmployeeId", e.value);
    };

    const filterAccountId = (e) => {
        onFilterData("accountId", e.value);
    };

    const filterStartDate = (e) => {
        onFilterData("startDate", e ? moment(e).format("YYYY/MM/DD") : null);
    };

    const filterEndDate = (e) => {
        onFilterData("endDate", e ? moment(e).format("YYYY/MM/DD") : null);
    };

    const filterProductAll = (e) => {
        onFilterData("productId", e.value);
    };

    const filterStageId = (e) => {
        onFilterData("serviceOrderStageId", e.value);
    };

    const onFilterData = (prop, val, _error) => {
        //------------------------
        let _lazyParams = { ...lazyParams, page: 0 };

        if (val == "Invalid date") {
            val = null;
        }

        switch (prop) {
            case "startDate":
                _lazyParams[prop] = val;
                break;
            case "endDate":
                _lazyParams[prop] = val;
                break;
            default:
                _lazyParams[prop] = val.map((value) => value);
                break;
        }

        let _detail = _.cloneDeep(detail);
        _detail[prop] = val;

        setDetail(_detail);

        setLazyParams(_lazyParams);
    };

    const renderTemplateEmployee = (item) => {
        if (item) {
            return (
                <span key={item.id}>
                    <XAvatar
                        name={item.fullName}
                        avatar={item.avatar}
                        label={() => item.fullName}
                        size="18px"
                    ></XAvatar>
                </span>
            );
        }
        return <>&nbsp;</>;
    };

    const renderTemplate = (item) => {
        if (item) {
            return (
                <span key={item.id}>
                    <XAvatar
                        name={item.productCode + " - " + item.productName}
                        avatar={item.avatar}
                        label={() =>
                            item.productCode + " - " + item.productName
                        }
                        size="18px"
                    ></XAvatar>
                </span>
            );
        }
        return <>&nbsp;</>;
    };

    const renderSelected = (item) => {
        let val = _.find(products, {
            id: item,
        });

        if (item) {
            return (
                <span key={item.id}>
                    {val.productCode + " - " + val.productName},
                </span>
            );
        }
        return <>&nbsp;</>;
    };

    return (
        <>
            <XLayout className="p-2 c-account">
                <XLayout_Center>
                    <DataTable
                        ref={refTable}
                        header={renderHeader}
                        value={serviceOders}
                        dataKey="id"
                        className="p-datatable-gridlines crm-table-service-service-order crm-table"
                        // resize column
                        resizableColumns
                        columnResizeMode="expand"
                        scrollable
                        scrollDirection="both"
                        scrollHeight="flex"
                        lazy
                        paginator
                        first={lazyParams.first}
                        rows={lazyParams.rows}
                        totalRecords={totalRecords}
                        rowsPerPageOptions={[20, 25, 50, 100, 150]}
                        onPage={onPage}
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink NextPageLink LastPageLink"
                        currentPageReportTemplate="{first} - {last} of {totalRecords}"
                        // sort
                        selection={selectedCustomers}
                        onSelectionChange={(e) => setSelectedCustomers(e.value)}
                        onSort={onSort}
                        sortField={lazyParams.sortField}
                        sortOrder={lazyParams.sortOrder}
                        reorderableColumns
                        reorderableRows
                        onRowReorder={(e) => setServiceOders(e.value)}
                    >
                        <Column
                            columnKey="index"
                            key="index"
                            header={""}
                            className="col-table-stt flex justify-content-center align-items-center"
                            body={renderNumericalOrder}
                        />
                        <Column
                            key="multiple"
                            columnKey="multiple"
                            selectionMode="multiple"
                        />
                        {columnComponents}
                        <Column
                            columnKey="action"
                            alignFrozen="right"
                            className="col-table-end"
                            bodyClassName="p-0 flex justify-content-center align-items-center border-all frozen-right-first-column"
                            body={renderColEnd}
                        />
                    </DataTable>
                </XLayout_Center>
            </XLayout>

            <CrmCreateDialog
                ref={refDialog}
                title={
                    edittingData
                        ? t(`crm-service.service-order.update`)
                        : t(`crm-service.service-order.create`)
                }
                permission={permission}
                onSubmit={onDialogSave}
            >
                <CrmServiceServiceOderDetail
                    ref={refDetail}
                    reload={loadProduct}
                    data={edittingData}
                    permission={permission}
                    setLoading={setLoadingSave}
                    cancel={onCloseDialog}
                />
            </CrmCreateDialog>

            <CrmTableSettingDetail
                ref={refTableSetting}
                objectTypeId={TASK_OBJECT_TYPE.SERVICE_ORDER_OBJECT}
                data={tableConfig}
                filterColumns={filterColumns}
                reload={reloadTable}
            />

            <OverlayPanel
                ref={refFilterPanel}
                className="p-0 overflow-y-scroll"
                style={{ width: "605px", maxHeight: "65vh" }}
            >
                <XLayout className="surface-200">
                    <XLayout_Top className="surface-300 border-none border-bottom-1 border-400 py-2">
                        <span className="link-button ml-2 text-lg font-medium">
                            {t("common.filter")}
                        </span>
                    </XLayout_Top>
                    <XLayout_Center className={"overflow-hidden"}>
                        <div className="p-fluid fluid formgrid grid crm-filter p-2 mt-1">
                            <div className="col-6">
                                <span className="p-float-label">
                                    <MultiSelect
                                        value={detail.accountId}
                                        onChange={filterAccountId}
                                        options={accounts}
                                        optionLabel="fullName"
                                        optionValue="id"
                                        filter
                                        filterBy="fullName"
                                    ></MultiSelect>
                                    <label
                                        htmlFor="product-account"
                                        className="crm-text-13"
                                    >
                                        {t(
                                            "crm-service.service-order.customer"
                                        )}
                                    </label>
                                </span>
                            </div>
                            <div className="col-6">
                                {" "}
                                <span className="p-float-label">
                                    {/* <UserAutoComplete
                                        id="product-to"
                                        users={employeeAll}
                                        multiple={true}
                                        className="w-full"
                                    /> */}
                                    <MultiSelect
                                        value={detail.ownerEmployeeId}
                                        options={employeeAll}
                                        onChange={filterEmployee}
                                        optionLabel="fullName"
                                        optionValue="id"
                                        filter
                                        filterBy="fullName"
                                        itemTemplate={renderTemplateEmployee}
                                    />
                                    <label
                                        htmlFor="responsible-filter"
                                        className="crm-text-13"
                                    >
                                        {t(
                                            "crm-service.service-order.employee-quote"
                                        )}
                                    </label>
                                </span>
                            </div>
                            <div className="col-6">
                                <span className="p-float-label ">
                                    <XCalendar
                                        label={
                                            <span className="crm-text-13">
                                                {t(
                                                    "crm-service.service-order.start-date"
                                                )}{" "}
                                            </span>
                                        }
                                        onChange={filterStartDate}
                                        value={detail.startDate}
                                    />
                                </span>
                            </div>
                            <div className="col-6">
                                <span className="p-float-label ">
                                    <XCalendar
                                        label={
                                            <span className="crm-text-13">
                                                {t(
                                                    "crm-service.service-order.end-date"
                                                )}{" "}
                                            </span>
                                        }
                                        onChange={filterEndDate}
                                        value={detail.endDate}
                                    />
                                </span>
                            </div>
                            <div className="col-6">
                                {" "}
                                <div className="field">
                                    <span className="p-float-label">
                                        <MultiSelect
                                            // id="id"
                                            value={detail.productId || null}
                                            options={products}
                                            onChange={filterProductAll}
                                            optionLabel="productName,productCode"
                                            optionValue="id"
                                            itemTemplate={renderTemplate}
                                            selectedItemTemplate={
                                                renderSelected
                                            }
                                            filter
                                            filterBy="productName,productCode"
                                            // multiple={true}
                                        />

                                        <label className="crm-text-13">
                                            {t(
                                                "crm-service.service-order.product"
                                            )}
                                        </label>
                                    </span>
                                </div>
                            </div>

                            <div className="col-6">
                                {" "}
                                <div className="field">
                                    <span className="p-float-label">
                                        <MultiSelect
                                            // id="id"
                                            value={
                                                detail.serviceOrderStageId ||
                                                null
                                            }
                                            options={serviceOrderStage}
                                            onChange={filterStageId}
                                            optionLabel="serviceOrderStageName"
                                            optionValue="id"
                                            filter
                                            filterBy="serviceOrderStageName"
                                            // multiple={true}
                                        />

                                        <label className="crm-text-13">
                                            {t("common.state")}
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </XLayout_Center>
                </XLayout>
            </OverlayPanel>
        </>
    );
}

import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {InputText} from 'primereact/inputtext';
import CommonFunction from '@lib/common';

import {InputTextarea} from "primereact/inputtextarea";

import ActionApi from "services/ActionService";
import PageHeader from "../../../components/page-header/PageHeader";
import {Toast} from "primereact/toast";
import _ from "lodash";
import Badges from '@ui-lib/badges/Badges';
import {Checkbox} from "primereact/checkbox";
import {Dropdown} from "primereact/dropdown";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';

export default function Action() {
    const t = CommonFunction.t;

    const statuses = [
        {
            code: 1,
            name: t("boolean.status.1")
        },
        {
            code: 0,
            name: t("boolean.status.0")
        }
    ];

    // default service
    let emptyAction = {
        type: "", // custom field type
        code: "", // custom field code
        name: "", // custom field name
        description: "", // custom field description
        status: true
    }

    // default validate object
    let emptyActionValidate = {
        type: null,
        code: null,
        name: null
    };

    const modeEnum = {
        create: 'create',
        update: 'update',
        copy: 'copy'
    };

    // state
    const [showDetail, setShowDetail] = useState(false);
    const [mode, setMode] = useState(null);

    const [selectedServices, setSelectedServices] = useState(null);
    const [actions, setActions] = useState(null);
    const [action, setAction] = useState(emptyAction);
    const [actionValidate, setActionValidate] = useState(emptyActionValidate);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 20,
        page: 0,
        status: {
            code: 1,
            name: t("boolean.status.1")
        }
    });
    const dt = useRef(null);
    const toast = useRef(null);

    /**
     * effect: get data on page load
     */
    useEffect(() => {
        loadLazyData();
    }, [lazyParams]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * get data
     */
    const loadLazyData = () => {
        setLoading(true);
        ActionApi.get(lazyParams).then(data => {
            setTotalRecords(data.total);
            setActions(data.content);
            setLoading(false);
        }).catch(error => CommonFunction.toastError(error));
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

    /**
     * hide window detail
     */
    const hideDetail = () => {
        setShowDetail(false);
    };

    /**
     * create service
     */
    const createAction = () => {
        setMode(modeEnum.create);
        setActionValidate(emptyActionValidate);
        setAction(emptyAction);
        setShowDetail(true);
    };

    /**
     * submit service
     */
    const submit = (close, actionMode = mode) => {
        // validate
        let isValid = performValidate([]);

        // submit
        if (isValid) {
            // call api
            try {
                // clone object
                let _object = _.cloneDeep(action);
                if (actionMode !== modeEnum.copy && _object.id && _object.id > 0) {
                    actionMode = modeEnum.update;
                }
                for (const property in _object) {
                    if (property === 'version') {
                        delete _object[property]
                    }
                }

                // submit
                CommonFunction.showConfirm(t(`confirm.${actionMode}`) + " '" + _object.name + "' ? ", t(`entry.${actionMode}`), () => {
                    switch (actionMode) {
                        case modeEnum.create:
                            // create
                            ActionApi.create(_object).then(data => {
                                if (data) {
                                    setAction({ ..._object, ...data });
                                    setMode(modeEnum.update);
                                    loadLazyData();
                                    if (close) hideDetail();
                                    CommonFunction.toastSuccess(t("common.save-success"));
                                } else {
                                    CommonFunction.toastError(t("common.save-un-success"));
                                }
                            });
                            break;
                        case modeEnum.update:
                            // update
                            ActionApi.update(_object).then(data => {
                                if (data) {
                                    setAction({ ..._object, ...data });
                                    loadLazyData();
                                    if (close) hideDetail();
                                    CommonFunction.toastSuccess(t("common.save-success"));
                                } else {
                                    CommonFunction.toastError(t("common.save-un-success"));
                                }
                            });
                            break;
                        case modeEnum.copy:
                            // copy
                            ActionApi.create({ ..._object, id: 0 }).then(data => {
                                if (data) {
                                    setAction({ ..._object, ...data });
                                    setMode(modeEnum.update);
                                    loadLazyData();
                                    if (close) hideDetail();
                                    CommonFunction.toastSuccess(t("common.save-success"));
                                } else {
                                    CommonFunction.toastError(t("common.save-un-success"));
                                }
                            });
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {
                CommonFunction.toastError(error);
            }
        }
    };

    /**
     * edit service
     * @param {*} service
     */
    const editAction = async (service) => {
        // call api to get service
        setMode(modeEnum.update);
        let data = await ActionApi.getById(service.id);
        setActionValidate(emptyActionValidate);
        setAction(data);
        setShowDetail(true);
    };

    /**
     * copy service
     * @param {*} service
     */
    const copyAction = async (service) => {
        // call api to get service
        setMode(modeEnum.copy);
        let data = await ActionApi.getById(service.id);
        setActionValidate(emptyActionValidate)
        setAction({ ...data, code: '' });
        setShowDetail(true);
    };

    /**
     * delete single or multiple services
     * @param {Array} selected
     * @returns
     */
    const deleteActions = (selected) => {
        if (!selected) return;

        let msg = '';

        if (selected.length === 1) {
            msg = `Xóa ${selected[0].name}?`;
        } else {
            msg = `Xóa các trường đã chọn?`;
        }
        if (msg) {
            CommonFunction.showConfirm(msg, 'Xóa vai trò',
                () => {
                    // accept
                    selected.forEach(_selected => ActionApi.delete({ id: _selected.id }))
                    let _services = [...actions];
                    let ids = selected.map(m => m.id);
                    _services = _services.filter(s => ids.indexOf(s.id) === -1);
                    setActions(_services);
                    setSelectedServices(null);
                    CommonFunction.toastSuccess("Xoá thành công");
                }
            )
        }
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyServiceChange = (prop, val) => {
        // set state value
        setAction({ ...action, [prop]: val });
    }

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props) => {
        let result = { ...actionValidate }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'type':
                    result[prop] = action.type.length > 0 ? null : `${t('action.type')} ${t('message.cant-be-empty')}`;
                    break;
                case 'code':
                    result[prop] = action.code.length > 0 ? null : `${t('action.code')} ${t('message.cant-be-empty')}`;
                    break;
                case 'name':
                    result[prop] = action.name.length > 0 ? null : `${t('action.name')} ${t('message.cant-be-empty')}`;
                    break;
                default:
                    break;
            }
        });

        // set state
        setActionValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    return (
        <div className="page-container">

            <PageHeader title={t('menu.action')} breadcrumb={[t('menu.permission'), t('menu.action')]} />

            <Toast ref={toast} />

            <div className="grid">
                <div className="col-4 p-m-auto">
                    <Button label={t('button.action.create')} icon="bx bx-plus" className="p-button-success" onClick={createAction} />
                </div>
                <div className="col-6 p-offset-2">
                    <div className="grid">
                        <div className="p-col p-text-right">
                            <Dropdown
                                value={lazyParams.status}
                                options={statuses}
                                onChange={(e) => {
                                    setLazyParams({ ...lazyParams, status: e.value })
                                }}
                                itemTemplate={(option) => (
                                    <Badges className={classNames({
                                        "mr-2": true,
                                        "text-green bg-green-1": option.code && option.code === 1,
                                        "text-red-9 bg-red-1": !option.code || option.code === 0
                                    })}>
                                        <div className="flex align-items-center width-fit-content pl-1 pr-1">
                                            {t("boolean.status." + option.code)}
                                        </div>
                                    </Badges>
                                )}
                                placeholder={t('common.choose-status')} optionLabel="name" className="p-column-filter" showClear />
                        </div>
                        <div className="p-col p-text-right pl-0">
                            <span className="p-input-icon-left w-320">
                                <i className="bx bx-search-alt" />
                                <InputText
                                    className="w-320"
                                    onInput={(e) => CommonFunction.debounce(null, onFilter, e.target.value)}
                                    placeholder={t("common.search")} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="position-relative">
                <LoadingBar loading={loading} top={43} />
                <DataTable
                    ref={dt}
                    value={actions}
                    dataKey="id"
                    selection={selectedServices}
                    onSelectionChange={(e) => setSelectedServices(e.value)}
                    // className="p-datatable-gridlines"
                    showGridlines
                    emptyMessage={t('common.no-record-found')}
                    scrollable
                    scrollHeight="calc(100vh - 235px)"
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
                    onSort={onSort}
                    sortField={lazyParams.sortField}
                    sortOrder={lazyParams.sortOrder}
                >
                    {/*<Column selectionMode="multiple" style={{ width: '50px', textAlign: 'center' }}></Column>*/}
                    <Column field="type" header={t('role.type')} sortable headerStyle={{ width: '180px' }} ></Column>
                    <Column field="code" header={t('role.code')} sortable headerStyle={{ width: '180px' }} ></Column>
                    <Column field="name" header={t('role.name')} sortable headerStyle={{ minWidth: '200px' }}></Column>
                    <Column field="description" header={t('role.description')} headerStyle={{ width: 'auto' }} ></Column>
                    <Column
                        field="status"
                        header={t('role.status')}
                        sortable
                        style={{ width: '140px', textAlign: 'center' }}
                        body={(rowData) => {
                            return (
                                <>
                                    <Badges
                                        className={classNames({
                                            "mr-2": true,
                                            "text-green bg-green-1": rowData.status && rowData.status === 1,
                                            "text-red-9 bg-red-1": !rowData.status || rowData.status === 0
                                        })}
                                    >
                                        <div
                                            className="flex align-items-center width-fit-content pl-1 pr-1"
                                        >
                                            {t("boolean.status." + rowData.status)}
                                        </div>
                                    </Badges>
                                </>
                            )
                        }}>
                    </Column>
                    <Column
                        headerStyle={{ width: '80px' }}
                        body={(rowData) => {
                            return (
                                <div className="grid actions">
                                    <Button icon="bx bx-pencil" className="p-button-link p-col button-edit" tooltip={t('common.update')} tooltipOptions={{ position: 'top' }} onClick={() => editAction(rowData)} />
                                </div>
                            );
                        }}>
                    </Column>
                </DataTable>
            </div>

            <Dialog
                header={`[${t('button.' + mode)}] ${t('action.detail')}`}
                visible={showDetail}
                modal
                className="p-fluid fluid  wd-480-360"
                footer={
                    <>
                        <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={hideDetail} />
                        {mode !== modeEnum.create && <Button label={t("button.copy")} icon="bx bx-copy" onClick={() => submit(false, modeEnum.copy)} />}
                        {/*<Button label={t('common.save-close')} icon="bx bxs-save" className="p-button-primary" onClick={() => submit(true)} />*/}
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={() => submit(true)} />
                    </>
                }
                onHide={hideDetail}>

                <div className="p-field">
                    <span className="p-float-label">
                        <InputText id="type" value={action.type}
                            onChange={(e) => applyServiceChange('type', e.target.value)}
                            onBlur={(e) => performValidate(["type"])}
                            className={classNames({ 'p-invalid': actionValidate.type, 'dense': true })} />
                        <label htmlFor="type">{t('action.type')}</label>
                    </span>
                    {actionValidate.type && <small className="p-invalid">{actionValidate.type}</small>}
                </div>

                <div className="formgrid grid">
                    <div className="p-field p-col">
                        <span className="p-float-label">
                            <InputText id="code" value={action.code}
                                onChange={(e) => applyServiceChange('code', e.target.value)}
                                onBlur={(e) => performValidate(["code"])}
                                className={classNames({ 'p-invalid': actionValidate.code, 'dense': true })} />
                            <label htmlFor="code">{t('action.code')}</label>
                        </span>
                        {actionValidate.code && <small className="p-invalid">{actionValidate.code}</small>}
                    </div>
                    <div className="p-field p-col">
                        <span className="p-float-label">
                            <InputText id="name" value={action.name}
                                onChange={(e) => applyServiceChange('name', e.target.value)}
                                onBlur={(e) => performValidate(["name"])}
                                className={classNames({ 'p-invalid': actionValidate.name, 'dense': true })} />
                            <label htmlFor="name">{t('action.name')}</label>
                        </span>
                        {actionValidate.name && <small className="p-invalid">{actionValidate.name}</small>}
                    </div>
                </div>

                <div className="p-field">
                    <span className="p-float-label">
                        <InputTextarea id="description" value={action.description} rows={1} cols={30} autoResize
                            onChange={(e) => applyServiceChange('description', e.target.value)} />
                        <label htmlFor="description">{t('action.description')}</label>
                    </span>
                </div>

                <div className="p-field">
                    <div className="p-field-radiobutton col-12">
                        <Checkbox inputId="status" name="status" onChange={(e) => applyServiceChange('status', e.checked)} checked={action.status} />
                        <label htmlFor="status">{t('status.active')}</label>
                    </div>
                </div>

            </Dialog>
        </div>
    );
}

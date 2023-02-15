import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {InputText} from 'primereact/inputtext';
import CommonFunction from '@lib/common';
import {Checkbox} from 'primereact/checkbox';

import {InputTextarea} from "primereact/inputtextarea";

import ResourceApi from "services/ResourceService";
import PageHeader from "../../../components/page-header/PageHeader";
import {Toast} from "primereact/toast";
import _ from "lodash";
import Badges from '@ui-lib/badges/Badges';
import {Dropdown} from "primereact/dropdown";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';

export default function Resource() {
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
    let emptyResource = {
        type: "", // custom field type
        code: "", // custom field code
        name: "", // custom field name
        description: "", // custom field description
        status: true
    };

    // default validate object
    let emptyResourceValidate = {
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

    const [selectedResources, setSelectedResources] = useState(null);
    const [resources, setResources] = useState(null);
    const [resource, setResource] = useState(emptyResource);
    const [resourceValidate, setResourceValidate] = useState(emptyResourceValidate);
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
    }, [lazyParams]) // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * get data
     */
    const loadLazyData = () => {
        setLoading(true);
        ResourceApi.get(lazyParams).then(data => {
            setTotalRecords(data.total);
            setResources(data.content);
            setLoading(false);
        }).catch(error => CommonFunction.toastError(error));
    }

    /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    }

    /**
     * on datatable click sort on header
     * @param {*} event
     */
    const onSort = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    }

    /**
     * on datatable filter
     * @param {String} val
     */
    const onFilter = (val) => {
        let _lazyParams = { ...lazyParams, page: 0, filter: val };
        setLazyParams(_lazyParams);
    }

    /**
     * hide window detail
     */
    const hideDetail = () => {
        setShowDetail(false);
    }

    /**
     * create service
     */
    const createResource = () => {
        setMode(modeEnum.create);
        setResourceValidate(emptyResourceValidate);
        setResource(emptyResource);
        setShowDetail(true);
    }

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
                let _object = _.cloneDeep(resource);
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
                            ResourceApi.create(_object).then(data => {
                                if (data) {
                                    setResource({ ..._object, ...data });
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
                            ResourceApi.update(_object).then(data => {
                                if (data) {
                                    setResource({ ..._object, ...data });
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
                            ResourceApi.create({ ..._object, id: 0 }).then(data => {
                                if (data) {
                                    setResource({ ..._object, ...data });
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
    const editResource = async (resource) => {
        // call api to get service
        setMode(modeEnum.update);
        let data = await ResourceApi.getById(resource.id);
        setResourceValidate(emptyResourceValidate);
        setResource(data);
        setShowDetail(true);
    }

    /**
     * delete single or multiple services
     * @param {Array} selected
     * @returns
     */
    const deleteResources = (selected) => {
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
                    selected.forEach(_selected => ResourceApi.delete({ id: _selected.id }))
                    let _resources = [...resources];
                    let ids = selected.map(m => m.id);
                    _resources = _resources.filter(s => ids.indexOf(s.id) === -1);
                    setResources(_resources);
                    setSelectedResources(null);
                    CommonFunction.toastSuccess("Xoá thành công");
                }
            )
        }
    }

    /**
     * export datatable
     */
    const exportCSV = () => {
        dt.current.exportCSV();
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyResourceChange = (prop, val) => {
        // set state value
        setResource({ ...resource, [prop]: val });
    }

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props) => {
        let result = { ...resourceValidate }, isValid = true;

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
                    result[prop] = resource.type.length > 0 ? null : "Loại vai trò không được để trống";
                    break;
                case 'code':
                    result[prop] = resource.code.length > 0 ? null : "Mã vai trò không được để trống";
                    break;
                case 'name':
                    result[prop] = resource.name.length > 0 ? null : 'Tên vai trò không được để trống';
                    break;
                default:
                    break;
            }
        });

        // set state
        setResourceValidate(result);

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

            <PageHeader title={t('menu.resource')} breadcrumb={[t('menu.permission'), t('menu.resource')]} />

            <Toast ref={toast} />

            <div className="grid">
                <div className="col-4 p-m-auto">
                    <Button label={t('button.resource.create')} icon="bx bx-plus" className="p-button-success" onClick={createResource} />
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
                    value={resources}
                    dataKey="id"
                    selection={selectedResources}
                    onSelectionChange={(e) => setSelectedResources(e.value)}
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
                    <Column field="type" header={t('resource.type')} sortable headerStyle={{ width: '180px' }} ></Column>
                    <Column field="code" header={t('resource.code')} sortable headerStyle={{ width: '180px' }} ></Column>
                    <Column field="name" header={t('resource.name')} sortable headerStyle={{ minWidth: '200px' }}></Column>
                    <Column field="description" header={t('resource.description')} headerStyle={{ width: 'auto' }} ></Column>
                    <Column
                        field="status"
                        header={t('resource.status')}
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
                                    <Button icon="bx bx-pencil" className="p-button-link p-col button-edit" tooltip={t('common.update')} tooltipOptions={{ position: 'top' }} onClick={() => editResource(rowData)} />
                                </div>
                            );
                        }}>
                    </Column>
                </DataTable>
            </div>

            <Dialog
                header={`[${t('button.' + mode)}] ${t('resource.detail')}`}
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
                        <InputText id="type" value={resource.type}
                            onChange={(e) => applyResourceChange('type', e.target.value)}
                            onBlur={(e) => performValidate(["type"])}
                            className={classNames({ 'p-invalid': resourceValidate.type, 'dense': true })} />
                        <label htmlFor="type">{t('resource.type')}</label>
                    </span>
                    {resourceValidate.type && <small className="p-invalid">{resourceValidate.type}</small>}
                </div>

                <div className="formgrid grid">
                    <div className="p-field p-col">
                        <span className="p-float-label">
                            <InputText id="code" value={resource.code}
                                onChange={(e) => applyResourceChange('code', e.target.value)}
                                onBlur={(e) => performValidate(["code"])}
                                className={classNames({ 'p-invalid': resourceValidate.code, 'dense': true })} />
                            <label htmlFor="code">{t('resource.code')}</label>
                        </span>
                        {resourceValidate.code && <small className="p-invalid">{resourceValidate.code}</small>}
                    </div>
                    <div className="p-field p-col">
                        <span className="p-float-label">
                            <InputText id="name" value={resource.name}
                                onChange={(e) => applyResourceChange('name', e.target.value)}
                                onBlur={(e) => performValidate(["name"])}
                                className={classNames({ 'p-invalid': resourceValidate.name, 'dense': true })} />
                            <label htmlFor="name">{t('resource.name')}</label>
                        </span>
                        {resourceValidate.name && <small className="p-invalid">{resourceValidate.name}</small>}
                    </div>
                </div>

                <div className="p-field">
                    <span className="p-float-label">
                        <InputTextarea id="description" value={resource.description} rows={1} cols={30} autoResize
                            onChange={(e) => applyResourceChange('description', e.target.value)} />
                        <label htmlFor="description">{t('resource.description')}</label>
                    </span>
                </div>

                <div className="p-field">
                    <div className="p-field-radiobutton col-12">
                        <Checkbox inputId="status" name="status" onChange={(e) => applyResourceChange('status', e.checked)} checked={resource.status} />
                        <label htmlFor="status">{t('status.active')}</label>
                    </div>
                </div>

            </Dialog>
        </div>
    );
}

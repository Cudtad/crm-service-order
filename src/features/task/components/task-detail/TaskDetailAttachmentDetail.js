import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

import classNames from 'classnames';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {InputTextarea} from 'primereact/inputtextarea';
import {Divider} from 'primereact/divider';
import {ScrollPanel} from 'primereact/scrollpanel';
import _ from 'lodash';
import CommonFunction from '@lib/common';
import TaskService from "services/TaskService";
import {Dropdown} from "primereact/dropdown";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import FileApi from "services/FileApi";
import appSettings from 'appSettings';

// import "./scss/TaskDocumentDetail.scss"
import {DataView} from "primereact/dataview";
import {TabPanel, TabView} from "primereact/tabview";
import EmptyData from "@xdp/ui-lib/dist/components/empty-data/EmptyData";
import {Chip} from "primereact/chip";
import {Tooltip} from "primereact/tooltip";

function TaskDetailAttachmentDetail(props, ref) {
    // default service
    let emptyObject = {
        type: null,
        code: null,
        name: null,
        totalQuantity: 0,
        categoryId: 0,
        category: null,
        locationId: 0,
        location: null,
        description: null,
        status: false
    }

    // default validate object
    let emptyValidate = {
        type: null,
        code: null,
        name: null
    }

    const modeEnum = {
        create: 'create',
        update: 'update'
    }

    const t = CommonFunction.t;

    const [detailMode, setDetailMode] = useState(modeEnum.create);

    const [showDetail, setShowDetail] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentObject, setCurrentObject] = useState(emptyObject);
    const [objectValidate, setObjectValidate] = useState(emptyValidate);

    const [documents, setDocuments] = useState(null);
    const [histories, setHistories] = useState(null);
    const [selectedHistories, setSelectedHistories] = useState(null);

    const [version, setVersion] = useState(null);
    const [versions, setVersions] = useState(null);

    const [entryApi, setEntryApi] = useState(null);
    const [fields, setFields] = useState(null);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 200,
        page: 0,
    });

    const fileUploadRef = useRef();

    const ds = useRef(null);

    /**
     * load something
     */
    useEffect(() => {
        setEntryApi(props.service);
        setFields(props.fields);
    }, []);

    useEffect(() => {
        loadDocumentHistory(currentObject);
    }, [version, rows]);

    useEffect(() => {
        if (currentObject.id) loadHistoryDocumentById(currentObject);
    }, [lazyParams]);

    useImperativeHandle(ref, () => ({
        /**
         * add
         */
        // add: () => {
        //     setDetailMode(modeEnum.create);
        //     setCurrentObject(emptyObject)
        //     setObjectValidate(emptyValidate);
        //     setShowDetail(true);
        // },

        /**
         * edit
         */
        edit: (_obj) => {
            TaskService.getDocumentsByDocId(_obj.id).then(_document => {




                setDetailMode(modeEnum.update);
                setObjectValidate(emptyValidate);
                loadVersion(_document);
                setCurrentObject(_document);

                loadDocumentHistory(_document);
                loadHistoryDocumentById(_document);
                setShowDetail(true);

                // switch (key) {
                //     case value:

                //         break;

                //     default:
                //         break;
                // }

                // if (_document.file.contentType === "application/pdf") {
                //     let url = `${appSettings.api.url}/storage/file/preview/${_document.file.id}`;
                //     CommonFunction.toDataURL(url, (b64) => {
                //         console.log(b64);
                //     })
                // }

                // setCurrentObject(_document);
            });

        },

        /**
         * close
         */
        close: () => {
            hideDetail();
        }
    }));

    const loadVersion = (obj) => {
        TaskService.getDocumentVersionByTask({ taskDocumentId: obj.id }).then(data => {
            setVersions(data);
        });
    };

    const loadDocumentHistory = (obj) => {
        setLoading(true);
        TaskService.getDocumentByHistory({
            taskDocumentId: obj.id,
            versionNo: version ? version.versionNo : "#",
            page: 0,
            rows: rows,
            sortOrder: -1
        }).then(data => {
            setHistories(data.content);
            setLoading(false);
        }).catch(error => CommonFunction.toastError(error));
    };

    const loadHistoryDocumentById = (obj) => {
        setLoading(true);
        TaskService.getHistoryByDocumentId({
            ...lazyParams,
            taskDocumentId: obj.id
        }).then(data => {
            setTotalRecords(data.total);
            setDocuments(data.content);
            setLoading(false);
        }).catch(error => CommonFunction.toastError(error));
    };

    /**
     * hide window detail
     */
    const hideDetail = () => {
        setShowDetail(false);
    };

    const onSelect = (e) => {
        let _currentObject = _.cloneDeep(currentObject);
        _currentObject.file = e.files[0];
        _currentObject.file.contentType = e.files[0].contentType;
        _currentObject.name = e.files[0].name;
        setCurrentObject(_currentObject);
    };

    const onUpload = (e) => {
        CommonFunction.toastInfo('Chưa có upload');
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
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        let _currentObject = { ...currentObject, [prop]: (val === undefined ? null : val) }
        switch (prop) {
            default:
                break;
        }
        setCurrentObject(_currentObject);
        // performValidate([prop], _currentObject);
    };

    const truncate = (n, len) => {
        let ext = n.substring(n.lastIndexOf(".") + 1, n.length).toLowerCase();
        let filename = n.replace('.' + ext, '');
        if (filename.length <= len) {
            return n;
        }
        filename = filename.substr(0, len) + (n.length > len ? '[...]' : '');
        return filename + '.' + ext;
    };

    const submit = (close) => {
        let _currentObject = _.cloneDeep(currentObject);
        setBtnLoading(true);
        Promise.all((function* () {
            if (_currentObject.file && _currentObject.file instanceof File) {
                FileApi.uploadFiles({ folder: _currentObject.taskId, files: _currentObject.file }).then(res => {
                    if (res && res.length > 0) {
                        _currentObject.file.id = res[0].id;
                        _currentObject.name = res[0].name;
                        _currentObject.file.contentType = res[0].contentType;
                        TaskService.uploadDocument({
                            id: _currentObject.id,
                            fileId: res[0].id,
                            name: res[0].name,
                            type: _currentObject.type,
                            taskId: _currentObject.taskId,
                            versionNo: _currentObject.versionNo,
                            description: _currentObject.description,
                            action: 'UPDATE'
                        }).catch(error => CommonFunction.toastError(error));
                    }
                });
            } else {
                TaskService.uploadDocument({
                    id: _currentObject.id,
                    name: _currentObject.name,
                    type: _currentObject.type,
                    taskId: _currentObject.taskId,
                    versionNo: _currentObject.versionNo,
                    description: _currentObject.description,
                    action: 'UPDATE'
                }).catch(error => CommonFunction.toastError(error));
            }
        })()).then(async () => {
            _.remove([_currentObject], (_obj) => {
                return _obj.action === 'DELETE'
            });
            setCurrentObject(_currentObject);
            let _documents = await TaskService.getDocumentsByTask(props.task.id);
            props.doReload(_currentObject.id, _currentObject);
            CommonFunction.toastSuccess(t("save.successful"));
            hideDetail();
        }).finally(() => {
            setBtnLoading(false);
            hideDetail();
        });
    };

    const itemTemplate = (data) => {
        console.log(data)
        return (
            <div className="col-12 grid nested-grid p-nogutter border-none mb-4">
                <div className="col-2 p-text-right">
                    {data.user.avatar && data.user.avatar != 'null' ?
                        <img style={{ width: '30px', borderRadius: '30px' }} src={`${appSettings.api.url}/storage/file/preview/${data.user.avatar}`} />
                        :
                        <img style={{ width: '30px', borderRadius: '30px' }} className="search-item" src={`https://ui-avatars.com/api/?background=random&name=${data.user.lastName}+${data.user.middleName}+${data.user.firstName}`} />
                    }
                </div>
                <div className="col-9 ml-2">
                    <div className="grid p-nogutter">
                        <div className="col-12 comment-content">
                            <Tooltip className="comment-content-user-detail" target={`.comment-content-user-${data.id}`}>
                                {/*<Chip label={data.user.fullName}*/}
                                {/*      image={`${appSettings.api.url}/storage/file/preview/${data.user.avatar}`}*/}
                                {/*/>*/}
                                <div className="grid p-2">
                                    <div>
                                        {data.user.avatar && data.user.avatar != 'null' ?
                                            <img src={`${appSettings.api.url}/storage/file/preview/${data.user.avatar}`} />
                                            :
                                            <img src={`https://ui-avatars.com/api/?background=random&name=${data.user.lastName}+${data.user.middleName}+${data.user.firstName}`} />
                                        }
                                    </div>
                                    <div className="p-2">
                                        <p>{t('user.full-name')} : {data.user.fullName}</p>
                                        <p>{t('user.user-name')} : {data.user.username}</p>
                                    </div>
                                </div>
                            </Tooltip>
                            <p className={`comment-content-user-${data.id} ` + classNames({ "mb-1": true, "fs-14": true, "comment-content-user": true })} data-pr-position="left">{data.user.fullName}</p>
                            <p className="comment-content-detail">{data.description ? data.description : data.action}</p>
                        </div>
                        <div className="col-12">
                            <Tooltip target={`.comment-time-${data.id}`}>
                                <div>{t('task.attachment.file.version')}: {data.versionNo}</div>
                                <div>{t('task.attachment.file.create-date')}: {CommonFunction.formatDateTime(data.createDate)}</div>
                            </Tooltip>
                            <small className={`comment-time-${data.id} ` + classNames({ "comment-time": true, "p-font-smaller": true, "mt-1": true })} data-pr-position="left" style={{ fontSize: '1rem', cursor: 'pointer' }}>{CommonFunction.getTimeAgo(new Date(data.createDate), t)}</small>
                        </div>
                    </div>
                </div>
            </div>
            // <div className="col-12" style={{border: 'none'}}>
            //     <span className="p-float-label my-2">
            //         {/*<p id="description" className="p-ml-6">*/}
            //         {/*    {data.description}*/}
            //         {/*</p>*/}
            //         <InputTextarea id="description" value={data.description}
            //                        autoResize
            //                        disabled
            //                        style={{
            //                            paddingTop: '15px',
            //                            opacity: 1,
            //                            borderRadius: 10
            //                        }}
            //         />
            //         <label htmlFor="description" className="label-history">{
            //             <div style={{display: 'flex', alignItems: 'center'}}>
            //                 {data.user.avatar && data.user.avatar != 'null' ?
            //                     <img style={{width: '20px', borderRadius: '20px'}} src={`${appSettings.api.url}/storage/file/preview/${data.user.avatar}`}/>
            //                     :
            //                     <img className="search-item" src={`https://ui-avatars.com/api/?background=random&name=${data.user.lastName}+${data.user.middleName}+${data.user.firstName}`}/>
            //                 }
            //                 <div className="ml-1">
            //                     <p>{data.user.lastName + ' ' + data.user.middleName + ' ' + data.user.firstName}</p>
            //                 </div>
            //                 &nbsp; - &nbsp;
            //                 <>{CommonFunction.formatDateTime(data.createDate)}</>
            //                 &nbsp; - &nbsp;
            //                 <>{t('task.attachment.file.version')}: {data.versionNo}</>
            //             </div>
            //         }</label>
            //     </span>
            // </div>
        );
    };

    return (
        <Dialog
            header={currentObject.file ? currentObject.file.name : "..."}
            visible={showDetail}
            modal
            maximized={true}
            // className="wd-1024-768 task-document-detail"
            contentClassName="p-0"
            contentStyle={{ padding: 0 }}
            footer={
                <>
                    <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={hideDetail} loading={btnLoading} />
                    <Button label={t('common.save-close')} icon="bx bxs-save" className="p-button-primary" onClick={() => submit(true)} loading={btnLoading} />
                    {/*<Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={() => submit(false)} />*/}
                </>
            }
            onHide={hideDetail}
        >
            <div className="task-detail-attachment-detail">
                <div className="preview-attachment-container">
                    {(!currentObject || !currentObject.file || (currentObject && currentObject.file && !CommonFunction.isSupportPreview(currentObject.file.contentType)))
                        && <EmptyData message={t('common.document.preview.unsupported')} />}
                    {currentObject && currentObject.file && CommonFunction.isSupportPreview(currentObject.file.contentType)
                        && <>
                            <iframe style={{ width: '100%', height: '100%' }} src={`${appSettings.api.url}/storage/file/preview/${currentObject.file.id}`} />
                        </>}
                    {/*{CommonFunction.isSupportPreview(currentObject.file.contentType) && <span>Supported</span>}*/}
                    {/*Preview document*/}
                </div>
                <div className="border-left info-attachment-container">
                    <TabView>
                        <TabPanel header={t('task.document.detail')}>
                            <ScrollPanel style={{ width: '100%', height: '100%' }}>
                                <div className="p-fluid fluid ">
                                    <div className="formgrid grid mr-0" style={{ padding: '0.75rem' }}>
                                        {(!currentObject.currentWFDocument
                                            || currentObject.currentWFDocument.type !== 'reference') ?
                                            <>
                                                <div className="col-6">
                                                    <span className="p-float-label">
                                                        <InputText id="version" value={currentObject.versionNo}
                                                            onChange={(e) => applyChange('versionNo', e.target.value)}
                                                        />
                                                        <label htmlFor="version">{t('task.attachment.file.version')}</label>
                                                    </span>
                                                </div>
                                                <div className="col-6">
                                                    {props.task && props.task.state && props.task.state != 'DONE'
                                                        && props.task && props.task.state && props.task.state != 'COMPLETED'
                                                        && props.task && props.task.state && props.task.state != 'CANCELED'
                                                        &&
                                                        <></>
                                                        // <FileUpload mode="basic"
                                                        //     name="document"
                                                        //     accept="*"
                                                        //     maxFileSize={1000000}
                                                        //     onSelect={onSelect}
                                                        //     onUpload={onUpload}
                                                        //     chooseLabel={t('common.change-document')}
                                                        //     // chooseOptions={{ icon: 'bx bx-upload', label: currentObject.file ? truncate(currentObject.file.name, 50) : '', className: 'p-button-primary' }}
                                                        //     chooseOptions={{ icon: 'bx bx-upload', label: t('common.change-document'), className: 'p-button-primary' }}
                                                        //     style={{ float: 'left' }}
                                                        //     className="mb-4"
                                                        // />
                                                    }
                                                    {/*{currentObject.file && <div className="mt-2">*/}
                                                    {/*    <a href={`${appSettings.api.url}/storage/file/download/${currentObject.file.id}`}>*/}
                                                    {/*        {truncate(currentObject.file.name, 10)}*/}
                                                    {/*    </a>*/}
                                                    {/*</div>}*/}
                                                </div>
                                            </> : <></>}
                                        <div className="col-12">
                                            <span className="p-float-label">
                                                <InputTextarea id="description" value={currentObject.description} rows={1} cols={10}
                                                    onChange={(e) => applyChange('description', e.target.value)}
                                                    autoResize autoFocus />
                                                <label htmlFor="description">{t('task.attachment.file.description')}</label>
                                            </span>
                                        </div>
                                        <div className="col-12">
                                            {/*<Fieldset className="activity-automatic mb-2 pb-0" legend={t(`task.document.history`)} toggleable>*/}
                                            {/*</Fieldset>*/}
                                            <Divider align="left">
                                                <span className="p-float-label">
                                                    <Dropdown id="version"
                                                        value={version}
                                                        options={versions}
                                                        onChange={(e) => setVersion(e.value)}
                                                        optionLabel={(option) => `${t('task.attachment.file.version')}: ${option.versionNo}`}
                                                        showClear
                                                    />
                                                    <label htmlFor="version">{t('task.attachment.file.version')}</label>
                                                </span>
                                                {/*<Button label="Button" icon="pi pi-search" className="p-button-outlined"></Button>*/}
                                            </Divider>

                                            <DataView value={histories}
                                                itemTemplate={itemTemplate}
                                                paginator
                                                rows={rows}
                                                layout="list"
                                            // sortOrder={sortOrder} sortField={sortField}
                                            />


                                        </div>
                                    </div>
                                </div>
                            </ScrollPanel>
                        </TabPanel>
                        <TabPanel header={t('task.document.history')}>
                            <DataTable
                                value={documents}
                                dataKey="id"
                                className="p-datatable-gridlines"
                                emptyMessage={t('common.no-record-found')}
                                loading={loading}
                                lazy
                                paginator
                            >
                                <Column header={t('task.attachment')} body={(rowData) => {
                                    return (
                                        <>
                                            <a href={`${appSettings.api.url}/storage/file/download/${rowData.file.id}`}>
                                                <i className="fas fa-download"></i> {rowData.file.name}
                                            </a>
                                            <br />
                                            <small>{"(" + rowData.versionNo + ")"}</small>
                                        </>
                                    );
                                }}></Column>
                                <Column header={t('common.user')} body={(rowData) => {
                                    return (
                                        <>
                                            {rowData.user
                                                &&
                                                <Chip
                                                    key={rowData.id}
                                                    label={rowData.user.fullName}
                                                    image={
                                                        rowData.user.avatar
                                                            ? `${appSettings.api.url}/storage/file/preview/${rowData.user.avatar}`
                                                            : `https://ui-avatars.com/api/?background=random&name=${rowData.user.fullName}`
                                                    }
                                                    className="dense mr-2 mb-2" />}
                                            <br />
                                            <span>{rowData.action}</span>
                                        </>
                                    )
                                }}></Column>
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

        </Dialog>
    );
};

TaskDetailAttachmentDetail = forwardRef(TaskDetailAttachmentDetail);

export default TaskDetailAttachmentDetail;

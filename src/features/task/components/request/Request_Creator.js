import React, { forwardRef,  useEffect, useImperativeHandle, useRef, useState } from 'react';

// import "./scss/InitRequest.scss";
import classNames from 'classnames';
import _ from "lodash";

import CommonFunction from '@lib/common';
import RequestApi from "services/RequestApi";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { CalendarN } from 'components/calendar/CalendarN';
import { Chip } from 'primereact/chip';
import DynamicForm from 'components/dynamic-form/DynamicForm';
import Enumeration from '@lib/enum';
import { FileUpload } from 'primereact/fileupload';
import FileApi from 'services/FileApi';
import { UserAC } from "components/autocomplete/UserAC";
import { GroupDropdown } from "components/autocomplete/GroupDropdown";
import EmptyDataCompact from "@xdp/ui-lib/dist/components/empty-data/EmptyDataCompact";
import GroupApi from "services/GroupService";
import { Tree } from 'primereact/tree';
import { XLayout, XLayout_Center, XLayout_Left, XLayout_Right, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { UserInfo } from '@ui-lib/user-info/UserInfo';

function Request_Creator(props, ref) {
    const emptyRequest = {
        // submit
        requestedBy: null,
        responsibleId: null,
        workflowId: null,
        activityId: null,
        name: null,
        description: null,
        startDate: null,
        deadline: null, // date and time
        inputFields: [],
        // only for show
        responsible: null,
    }

    const emptyComboboxOptions = {
        responsible: [],
        participant: [],
        observer: []
    }

    const minDate = new Date();

    const emptyValidate = {
        name: null,
        responsible: null
    }

    const emptyDocument = {
        [Enumeration.workflow_document_type.inRequest]: [],
        [Enumeration.workflow_document_type.template]: [],
        [Enumeration.workflow_document_type.reference]: []
    }


    const t = CommonFunction.t;

    const [show, setShow] = useState(false);
    const { user } = props;
    const [groups, setGroups] = useState([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [request, setRequest] = useState(emptyRequest);
    const [validate, setValidate] = useState(emptyValidate);
    const [comboboxOptions, setComboboxOptions] = useState(emptyComboboxOptions);
    const refDynamicForm = useRef(null);
    const [userGroupIds, setUserGroupIds] = useState(null);
    const [documents, setDocuments] = useState(emptyDocument);
    const [submitting, setSubmitting] = useState(false);

    const refInput = useRef(null);
    const [workflows, setWorkflows] = useState([]);
    const [workflow, setWorkflow] = useState(null);
    const refAllWorkflow = useRef([]);
    const stepEnum = {
        chooseWorkflow: "chooseWorkflow",
        workflowFirstStep: "workflowFirstStep",
    }
    const [step, setStep] = useState(stepEnum.chooseWorkflow);
    const [workflowFilter, setWorkflowFilter] = useState(null);

    useImperativeHandle(ref, () => ({

        /**
         * 
         * @param {*} application 
         * @param {*} refType 
         * @param {*} refId 
         */
        create: (application, refType, refId, _userGroupIds) => {
            create(application, refType, refId, _userGroupIds);
        },

        /**
         * init
         */
        init: (workflowId, userGroupIds) => {
            setValidate(emptyValidate);
            setUserGroupIds(userGroupIds);

            RequestApi.initRequest(workflowId, userGroupIds).then(res => {
                if (res) {

                    // prepare validate
                    let _request = {
                        requestedBy: res.requestedBy,
                        responsibleId: res.responsibleId,
                        performerGroupIds: res.activity.performerGroupIds,
                        responsible: res.responsibleUser,
                        responsibleIds: res.responsibleIds,
                        workflowId: res.workflowId,
                        activityId: res.activityId,
                        name: "",
                        description: "",
                        deadline: null,
                        inputFields: res.inputFields
                    }

                    // prepare combobox options
                    let _comboboxOptions = { ...emptyComboboxOptions };
                    _comboboxOptions.responsible = res.responsibleUsers;
                    _comboboxOptions.participant = res.participantUsers;
                    _comboboxOptions.observer = res.observerUsers;

                    // prepare documents
                    let _documents = _.cloneDeep(emptyDocument);
                    if (res.documents) {
                        res.documents.forEach(doc => {
                            _documents[doc.type].push({
                                ...doc,
                                icon: CommonFunction.getFileIcons(doc.name),
                                selected: false,
                                rawFileId: doc.fileId,
                                valid: true
                            });
                        });
                    }

                    setWorkflow({ ...res.workFlow, title: `${res.workFlow.code} - ${res.workFlow.name}` });
                    setComboboxOptions(_comboboxOptions);
                    setRequest(_request);
                    setDocuments(_documents);
                    setShow(true);
                }
            })
        }

    }))

    /**
     * clear impacting document
     */
    useEffect( () => {let fn=async () => {
        let _groups = [];
        if (props.parent && props.parent.groupId > 0) {
            let _group = await GroupApi.getById(props.parent.groupId);
            if (_group) {
                _groups.push(_group)
            }
        } else if (props.groups && props.groups.length > 0) {
            _groups = props.groups;
        } else {
            _groups = window.app_context.user.groups;
        }
        setGroups(_groups);
    };fn();


    }, []);


    /**
     * init request
     */
    const initRequest = (_workflow) => {

        setValidate(emptyValidate);

        RequestApi.initRequest(_workflow.id, userGroupIds).then(res => {
            if (res) {

                // prepare validate
                let _request = {
                    requestedBy: res.requestedBy,
                    responsibleId: res.responsibleId,
                    performerGroupIds: res.activity.performerGroupIds,
                    responsible: res.responsibleUser,
                    responsibleIds: res.responsibleIds,
                    workflowId: res.workflowId,
                    activityId: res.activityId,
                    name: "",
                    description: "",
                    deadline: null,
                    inputFields: res.inputFields
                }

                // prepare combobox options
                let _comboboxOptions = { ...emptyComboboxOptions };
                _comboboxOptions.responsible = res.responsibleUsers;
                _comboboxOptions.participant = res.participantUsers;
                _comboboxOptions.observer = res.observerUsers;

                // prepare documents
                let _documents = _.cloneDeep(emptyDocument);
                if (res.documents) {
                    res.documents.forEach(doc => {
                        _documents[doc.type].push({
                            ...doc,
                            icon: CommonFunction.getFileIcons(doc.name),
                            selected: false,
                            rawFileId: doc.fileId,
                            valid: true
                        });
                    });
                }

                setWorkflow({ ...res.workFlow, title: `${res.workFlow.code} - ${res.workFlow.name}` });
                setComboboxOptions(_comboboxOptions);
                setRequest(_request);
                setDocuments(_documents);
                setStep(stepEnum.workflowFirstStep);
                setTimeout(() => {
                    setShow(true);
                }, 200);
            }
        })
    }

    /**
     * create request
     * @param {*} application 
     * @param {*} refType 
     * @param {*} refId 
     */
    const create = (application, refType, refId) => {
        // load workflow
        let _currentInput = refInput.current;
        if (
            !_currentInput
            || application !== _currentInput.application
            || refType !== _currentInput.refType
            || refId !== _currentInput.refId
        ) {
            refInput.current = {
                application: application,
                refType: refType,
                refId: refId
            }

            loadWorkflow(() => {
                setStep(stepEnum.chooseWorkflow);
                setShow(true);
            });

        } else {
            setStep(stepEnum.chooseWorkflow);
            setShow(true);
        }
    }

    /**
     * load workflow
     */
    const loadWorkflow = (callback) => {

        // get user group id
        let groupIds = "";
        if (window.app_context.user && window.app_context.user.groups) {
            groupIds = window.app_context.user.groups.map(m => m.id).join(",");
            setUserGroupIds(groupIds);
        }

        RequestApi.getWorkflowsByUser(groupIds).then(res => {
            // let _workflows = [];
            // let index = 1;
            // for (const key in res) {
            //     // create group category
            //     let _cate = {
            //         key: `cat_${index}`,
            //         label: key,
            //         sort: key.toLowerCase(),
            //         children: []
            //     }

            //     // add workflows
            //     res[key].forEach(el => {
            //         _cate.children.push({
            //             key: el.id,
            //             label: `${el.code} - ${el.name}`
            //         });
            //     });

            //     _workflows.push(_cate);
            //     index += 1;
            // }

            // // sort categories
            // let _sort = _.sortBy(_workflows, o => o.sort);
            // setWorkflows(_sort);

            console.log(res);
            let _all = [];
            for (const key in res) {
                let id = CommonFunction.getIdNumber();
                _all.push({
                    id: id,
                    name: key,
                    code: "",
                    parentId: null,
                    isGroup: true
                });
                _all = _all.concat(res[key].map(m => ({ ...m, parentId: id })));
            }
            console.log(_all);

            _all.forEach(_wf => {
                _wf.parentId = _wf.parentId && _wf.parentId > 0 ? _wf.parentId : null;
                _wf.key = _wf.id;
                _wf.data = { name: _wf.name, code: _wf.code };
            });

            let _sorted = _.sortBy(_all, ["name"]);
            refAllWorkflow.current = _.cloneDeep(_sorted);
            let _workflows = CommonFunction.listToTree(_sorted, "id", "parentId", "children");
            _workflows = CommonFunction.buildObjectPath(_workflows);
            setWorkflows(_workflows);

            if (callback && typeof callback === "function") {
                callback();
            }
        })
    }

    /**
     * clear impacting document
     */
    const clearImpactDocument = (_documents) => {
        // set all other impact file is false
        _documents.forEach(_docType => {
            _docType.items.forEach(_item => {
                _item.impact = false;
            });
        });
    }

    /**
     * cancel file
     * @param {*} typeIndex
     * @param {*} fileIndex
     */
    const cancelFile = (typeIndex, fileIndex) => {
        let _documents = _.cloneDeep(documents);
        let sel = _documents[typeIndex].items[fileIndex];

        if (sel.isNew) {
            _documents[typeIndex].items.splice(fileIndex, 1);
        } else {
            _documents[typeIndex].items[fileIndex] = { ...sel.previousState };
            clearImpactDocument(_documents);
        }
        setDocuments(_documents);
    }
    /**
     * add document
     * @param {*} type
     * @param {*} index
     */
    const addDocument = (_type) => {
        let _documents = _.cloneDeep(documents);
        // clearImpactDocument(_documents);
        _documents[_type].push({
            id: null,
            code: "",
            type: _type,
            description: "",
            fileId: null,
            name: "", // file name
            fileContent: null,
            isNew: true,
            isMaster: true,
            impact: true // is add new, edit - use for display edit field
        });

        setDocuments(_documents);
    }

    /**
     * delete document
     * @param {*} id
     */
    const deleteDocument = (_type, _index) => {
        let _documents = _.cloneDeep(documents);
        _documents[_type].splice(_index, 1);
        setDocuments(_documents);
    }
    //#region sub/func

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        var _request = { ...request, [prop]: (val === undefined ? null : val) }
        switch (prop) {
            case 'responsibleUsers':
                if (val.length > 0) {
                    if (val.length > 1) {
                        CommonFunction.toastWarning(t("task.update.can.assign.one.people"))
                        val.shift();
                    }
                    _request.responsibleUsers = val;
                } else {
                    _request.responsibleUsers = [];
                }
                _request.responsibleId = val.map(m => m.id)[0];
                break;
            case 'groupId':
                _request.groupId = val;
                break;
            default: break;
        }
        setRequest(_request);
        performValidate([prop], _request);
    }

    /**
     * apply document selected
     * @param {*} type
     * @param {*} index
     * @param {*} selected
     */
    const applyFileChange = (type, value, index) => {
        let _documents = _.cloneDeep(documents);
        _documents[type][index].description = value;
        setDocuments(_documents);
    }

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props, _request) => {
        var result = { ...validate }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'name':
                    result[prop] = _request.name ? null : t("validate.required");
                    break;
                case 'responsible':
                    result[prop] = _request.responsibleId ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    /**
     * submit
     */
    const submit = (_request) => {
        let isValid = performValidate([], request);
        if (props.groupRequire && (!request.groupId || request.groupId <= 0)) {
            if (props.parent && props.parent.groupId > 0) {
                request.groupId = props.parent.groupId
            } else {
                CommonFunction.toastWarning(t("request-require-group"));
                isValid = false;
            }
        }
        let dynamic = refDynamicForm.current.get();

        // valid document
        let _documents = _.cloneDeep(documents);
        let documentRequire = [];
        _documents[Enumeration.workflow_document_type.template].forEach((doc, index) => {
            doc.valid = true;
            if (doc.isRequire && doc.rawFileId === doc.fileId) {
                documentRequire.push(doc.code);
                doc.valid = false;
                isValid = false;
            }
        });
        if (documentRequire.length > 0) {
            setDocuments(_documents);
            CommonFunction.toastWarning(t("request.document-require").format(documentRequire.join(", ")))
        }

        // submit
        if (isValid && dynamic.valid) {
            setSubmitting(true);
            // prepare documents
            let _prepareDocuments = [];
            for (const key in _documents) {
                _documents[key].forEach(_doc => {
                    _prepareDocuments.push(_doc);
                });
            }

            // upload files
            Promise.all((function* () {
                for (let _item of _prepareDocuments) {
                    yield new Promise(resolve => {
                        if ((_item.type === Enumeration.workflow_document_type.template
                            || _item.type === Enumeration.workflow_document_type.inRequest)
                            && _item.fileContent && _item.fileContent instanceof File) {
                            FileApi.uploadFiles({ folder: CommonFunction.uuid(), files: _item.fileContent }).then(res => {
                                _item.fileId = res[0].id;
                                _item.name = res[0].name;
                                resolve("");
                            })
                        } else {
                            resolve("");
                        }
                    })
                }
            })()).then(async () => {

                // delete unuse document props
                _prepareDocuments.forEach(_doc => {
                    ["icon", "selected", "rawFileId", "valid", "fileContent"].forEach(delKey => {
                        delete _doc[delKey];
                    })
                });

                try {
                    // submit request
                    let _request = {
                        requestedBy: request.requestedBy,
                        responsibleId: request.responsibleId,
                        groupId: request.groupId,
                        parentId: (props.parent && props.parent.id !== 0) ? props.parent.id : 0,
                        workflowId: request.workflowId,
                        activityId: request.activityId,
                        name: request.name,
                        description: request.description,
                        startDate: new Date(),
                        deadline: request.deadline,
                        inputFields: dynamic.data,
                        documents: _prepareDocuments
                    };

                    let createResponse = await RequestApi.create(userGroupIds, _request);
                    if (createResponse) {
                        CommonFunction.toastSuccess(t("common.save-success"));
                        if (props.onSubmit) {
                            props.onSubmit(createResponse);
                        }
                        setShow(false);
                    }

                } catch (error) {
                    console.log("create request error", error);
                } finally {
                    setSubmitting(false);
                }
            })
        }
    }

    /**
     * hide
     */
    const cancel = () => {
        setShow(false);
    }

    /**
     * on selected file
     * @param {*} e
     * @param {*} typeIndex
     * @param {*} index
     */
    const onFileSelect = (e, type, index) => {
        if (e.files && e.files.length > 0) {
            let _documents = _.cloneDeep(documents);
            let file = _documents[type][index];
            file.fileContent = e.files[0];
            file.name = e.files[0].name;
            file.fileId = -1;
            file.valid = true;

            setDocuments(_documents);
        }
    }

    /**
     * on next click
     */
    const onNextClick = () => {
        let _workflow = selectedWorkflowId ? refAllWorkflow.current.find(f => f.id === selectedWorkflowId) : null;
        if (selectedWorkflowId && _workflow && !_workflow.isGroup) {
            initRequest(_workflow);
        } else {
            CommonFunction.toastWarning(t("workflow.preview.empty"));
        }
    }

    /**
     * on back click
     */
    const onBackClick = () => {
        setStep(stepEnum.chooseWorkflow);
    }

    //#endregion

    return (
        <Dialog
            header={t("request.create")}
            visible={show}
            modal
            className="wd-16-9"
            footer={
                <>

                    <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={cancel} />
                    {step === stepEnum.workflowFirstStep && <>
                        <Button label={t("button.previous")} icon="bx bx-chevron-left" className="p-button-text text-muted" onClick={onBackClick} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} loading={submitting} />
                    </>}
                    {step === stepEnum.chooseWorkflow &&
                        <Button label={t("button.next")} icon="bx bx-chevron-right" className="p-button-primary" onClick={onNextClick} />
                    }

                </>
            }
            onHide={cancel}
        >

            {step === stepEnum.chooseWorkflow &&
                <XLayout className="px-2 pb-2">
                    <XLayout_Top>
                        {step === stepEnum.chooseWorkflow &&
                            <XLayout_Title className="mt-0">{t("request.choose-workflow")}</XLayout_Title>
                        }
                        {step === stepEnum.workflowFirstStep &&
                            <XLayout_Title className="mt-0">{workflow ? workflow.name : ""}</XLayout_Title>
                        }
                    </XLayout_Top>
                    <XLayout_Center className="p-0">
                        <TreeTable
                            value={workflows}
                            showGridlines
                            selectionMode="single"
                            selectionKeys={selectedWorkflowId}
                            onSelectionChange={(e) => setSelectedWorkflowId(e.value)}
                            scrollable
                            className="border-all bg-white"
                        >
                            <Column
                                header={t("common.name")}
                                field="name"
                                filterMatchMode="contains"
                                body={(d) => d.name}
                                expander
                                filter
                                filterBy="name"
                                
                            ></Column>
                            <Column
                                header={t("common.code")}
                                field="code"
                                body={(d) => d.code}
                                filterMatchMode="contains"
                                filter
                                filterBy="code"
                                
                                style={{ width: "250px" }}
                            ></Column>
                        </TreeTable>
                    </XLayout_Center>
                </XLayout>
            }

            {step === stepEnum.workflowFirstStep &&

                <XLayout right="300px">
                    <XLayout_Center>

                        <div className="p-fluid fluid  formgrid grid">
                            <div className="col-12">
                                <XLayout_Title className="my-0">{t("request.info")}</XLayout_Title>
                            </div>

                            <div className="col-8">
                                <span className="p-float-label">
                                    <InputText
                                        id="request-name"
                                        className="task-content-container task-description"
                                        value={request.name}
                                        onChange={(e) => applyChange('name', e.target.value)}
                                    />
                                    <label className="require">{t("request.name")}</label>
                                    {validate.name && <small className="p-invalid">{validate.name}</small>}
                                </span>
                            </div>

                            <div className="col-4">
                                <span className="p-float-label">
                                    <GroupDropdown
                                        filter
                                        showClear
                                        filterBy="name"
                                        id="task-detail-owner"
                                        value={(request.groupId && request.groupId > 0) ? request.groupId : (props.parent ? props.parent.groupId : 0)}
                                        listGroups={groups}
                                        onChange={(e) => applyChange('groupId', e.target.value)}
                                        optionLabel="name"
                                        optionValue="id"
                                        className="dense w-full" />
                                    <label>{t('task.owner.task')}</label>
                                </span>
                            </div>

                            {/* Mô tả */}
                            <div className="col-12">
                                <span className="p-float-label">
                                    <InputText
                                        id="request-description"
                                        
                                        value={request.description}
                                        onChange={(e) => applyChange('description', e.target.value)}
                                    />
                                    <label>{t("request.description")}</label>
                                </span>
                            </div>

                            <div className="col-8">
                                <span className="p-float-label">
                                    <UserAC
                                        displayType="thumbnail"
                                        id="responsibleUsers" value={request.responsibleUsers}
                                        groupIds={request.performerGroupIds}
                                        includeUserIds={request.responsibleIds}
                                        onChange={(e) => applyChange("responsibleUsers", e.value)}
                                    />
                                    <label className="require">{t("request.responsible")}</label>
                                    {validate.responsible && <small className="p-invalid">{validate.responsible}</small>}
                                </span>
                            </div>
                            <div className="col-4">
                                <CalendarN
                                    id="request-deadline"
                                    value={request.deadline}
                                    onChange={(e) => applyChange("deadline", e.value)}
                                    showTime
                                    showButtonBar
                                    minDate={minDate}
                                    style={{ width: "200px" }}
                                    label={t("request.deadline")}
                                />
                            </div>
                            {/* Customfield */}
                            <div className="col-12">
                                <DynamicForm ref={refDynamicForm} customFields={request.inputFields} className="" />
                            </div>

                            <div className="pl-2 pr-2 pt-1">
                                {/* Template files */}
                                {documents[Enumeration.workflow_document_type.template].length > 0 &&
                                    <div className="mb-3">
                                        <div className="x-group">
                                            <span>{t("request.documents")}</span>
                                        </div>

                                        {documents[Enumeration.workflow_document_type.template].map((file, index) => (

                                            <div key={index} className={classNames({
                                                "request-document-item request-document-reference border-left border-right border-bottom flex align-items-stretch justify-content-between": true,
                                                "border-top": index === 0
                                            })}>
                                                <div
                                                    className=" document-info flex"
                                                >

                                                    <div
                                                        className="flex flex-column document-description"
                                                        title={`${t("workflow.doc.download")} ${file.name}`}
                                                        onClick={() => CommonFunction.downloadFile(file.fileId)}
                                                    >
                                                        <div className="flex align-items-center">
                                                            <img className="file-icon mr-1" src={file.icon}></img>
                                                            <span className={classNames({ "file-code": true, "mark-require": file.isRequire })}>{file.code}</span>
                                                        </div>
                                                        <div><small><i>{file.description}</i></small></div>
                                                    </div>
                                                </div>
                                                <div className="document-action template-action border-left flex justify-content-end align-items-center">

                                                    {/* file empty */}
                                                    {file.fileId === file.rawFileId &&
                                                        <div className={classNames({
                                                            "file-upload file-empty flex align-items-center": true,
                                                            "file-not-valid": file.valid === false
                                                        })}>
                                                            <img className="file-upload-image" src={CommonFunction.getFileIcons("")} />
                                                            <div className="file-upload-name"><small>{t("request.document.file-empty")}</small></div>
                                                        </div>
                                                    }

                                                    {/* file uploaded */}
                                                    {file.fileId !== file.rawFileId &&
                                                        <div className={classNames({
                                                            "file-upload flex align-items-center": true,
                                                            "file-not-valid": file.valid === false
                                                        })}>
                                                            <img className="file-upload-image" src={CommonFunction.getFileIcons(file.name)} />
                                                            <div className="file-upload-name"><small>{file.name}</small></div>
                                                        </div>
                                                    }

                                                    <div title={t("button.upload")} className="ml-2">
                                                        <FileUpload
                                                            className="upload-file-button"
                                                            headerTemplate={(options) => (<>{options.chooseButton}</>)}
                                                            itemTemplate={() => (<></>)}
                                                            chooseOptions={{ icon: 'bx bx-upload', iconOnly: true }}
                                                            onSelect={(e) => onFileSelect(e, Enumeration.workflow_document_type.template, index)}
                                                            customUpload={true}
                                                            accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .7z"
                                                        />
                                                    </div>

                                                    <i className='bx bx-download text-blue'
                                                        title={`${t("workflow.doc.download")} ${file.name}`}
                                                        onClick={() => CommonFunction.downloadFile(file.fileId)}
                                                    />

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                                {/* init request */}
                                {documents[Enumeration.workflow_document_type.inRequest].length > 0 &&
                                    <div className="mb-3">
                                        <div className="x-group">
                                            <span>{t("addition.documents")}</span>
                                        </div>

                                        {documents[Enumeration.workflow_document_type.inRequest].map((file, index) => (

                                            <div key={index} className={classNames({
                                                "request-document-item request-document-reference border-left border-right border-bottom flex align-items-stretch justify-content-between": true,
                                                "border-top": index === 0
                                            })}>
                                                <div
                                                    className=" document-info flex"
                                                >

                                                    <div
                                                        className="flex flex-column document-description"
                                                        title={`${t("workflow.doc.download")} ${file.name}`}
                                                    >
                                                        <InputText
                                                            id="file-desc"
                                                            style={{ width: '100%' }}
                                                            className="task-content-container task-description"
                                                            value={file.description}
                                                            onChange={(e) => applyFileChange(Enumeration.workflow_document_type.inRequest, e.target.value, index)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="document-action template-action border-left flex justify-content-end align-items-center">
                                                    {/* file empty */}
                                                    {file.fileId === file.rawFileId &&
                                                        <div className={classNames({
                                                            "file-upload file-empty flex align-items-center": true,
                                                            "file-not-valid": file.valid === false
                                                        })}>
                                                            <img className="file-upload-image" src={CommonFunction.getFileIcons("")} />
                                                            <div className="file-upload-name"><small>{t("request.document.file-empty")}</small></div>
                                                        </div>
                                                    }

                                                    {/* file uploaded */}
                                                    {file.fileId !== file.rawFileId &&
                                                        <div className={classNames({
                                                            "file-upload flex align-items-center": true,
                                                            "file-not-valid": file.valid === false
                                                        })}>
                                                            <img className="file-upload-image" src={CommonFunction.getFileIcons(file.name)} />
                                                            <div className="file-upload-name"><small>{file.name}</small></div>
                                                        </div>
                                                    }

                                                    <div title={t("button.upload")} className="ml-2">
                                                        <FileUpload
                                                            className="upload-file-button"
                                                            headerTemplate={(options) => (<>{options.chooseButton}</>)}
                                                            itemTemplate={() => (<></>)}
                                                            chooseOptions={{ icon: 'bx bx-upload', iconOnly: true }}
                                                            onSelect={(e) => onFileSelect(e, Enumeration.workflow_document_type.inRequest, index)}
                                                            customUpload={true}
                                                            accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .7z"
                                                        />
                                                    </div>

                                                    <i className='bx bx-download text-blue'
                                                        title={`${t("workflow.doc.download")} ${file.name}`}
                                                        onClick={() => CommonFunction.downloadFile(file.fileId)}
                                                    />

                                                    <i
                                                        className='bx bxs-trash-alt'
                                                        style={{ color: "#f46a6a" }}
                                                        title={t("workflow.doc.delete")}
                                                        onClick={() => deleteDocument(Enumeration.workflow_document_type.inRequest, index)}
                                                    ></i>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }

                                <div className="x-group">
                                    <span>{t("request.references")}</span>
                                </div>

                                {documents[Enumeration.workflow_document_type.reference].length === 0 &&
                                    <EmptyDataCompact message={t("workflow.doc.reference.empty")}>
                                        <Button
                                            className="p-button-text width-fit-content"
                                            label={t('common.create')}
                                            icon="bx bx-plus"
                                            onClick={() => addDocument(Enumeration.workflow_document_type.inRequest)}
                                        />
                                    </EmptyDataCompact>
                                }

                                {/* Reference files */}
                                {documents[Enumeration.workflow_document_type.reference].length > 0 &&
                                    <>
                                        <Button
                                            className="p-button-success p-button-tiny"
                                            label={t('common.create')}
                                            icon="bx bx-plus"
                                            style={{ width: 'fit-content', minHeight: '24px' }}
                                            onClick={() => addDocument(Enumeration.workflow_document_type.inRequest)}
                                        />

                                        {documents[Enumeration.workflow_document_type.reference].map((file, index) => (
                                            <div key={index} className={classNames({
                                                "request-document-item request-document-reference border-left border-right border-bottom flex align-items-stretch justify-content-between": true,
                                                "border-top": index === 0
                                            })}>
                                                <div
                                                    className=" document-info"
                                                    title={`${t("workflow.doc.download")} ${file.name}`}
                                                    onClick={() => CommonFunction.downloadFile(file.fileId)}
                                                >
                                                    <div className="document-description">
                                                        <div className="flex align-items-center">
                                                            <img className="file-icon mr-1" src={file.icon}></img>
                                                            <div className="file-code">{file.code}</div>
                                                        </div>
                                                        <div><small><i>{file.description}</i></small></div>
                                                    </div>
                                                </div>
                                                <div className="document-action reference-action border-left flex justify-content-center align-items-center">
                                                    <i className='bx bx-download text-blue'
                                                        title={`${t("workflow.doc.download")} ${file.name}`}
                                                        onClick={() => CommonFunction.downloadFile(file.fileId)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>
                    </XLayout_Center>
                    <XLayout_Right className="border-left pl-2">

                        {props.parent && props.parent.id != 0 &&
                            <>
                                <div className="x-group">
                                    <span>{t("request.from.task")}</span>
                                </div>
                                <div className="mb-2 text-grey">{t("task.name")}</div>
                                <div className="mb-2 text-dark">{props.parent.name}</div>

                                <div className="mb-2 text-grey">{t('request.responsible')}</div>
                                {props.parent.responsibleUsers.length > 0 && (
                                    <>
                                        <div className="flex align-items-center p-flex-wrap mb-2">
                                            {props.parent.responsibleUsers.map((user, index) => (
                                                <UserInfo id={user.id}></UserInfo>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {props.parent.startDate && <>
                                    <div className="mb-2 text-grey">{t("common.startdate")}</div>
                                    <div className="mb-2 text-dark">{CommonFunction.formatDateTime(props.parent.startDate)}</div>
                                </>
                                }
                                {props.parent.deadline && <>
                                    <div className="mb-2 text-grey">{t("common.deadline")}</div>
                                    <div className="mb-2 text-dark">{CommonFunction.formatDateTime(props.parent.deadline)}</div>
                                </>
                                }
                                {props.parent.closedOn && <>
                                    <div className="mb-2 text-grey">{t("common.enddate")}</div>
                                    <div className="mb-2 text-dark">{CommonFunction.formatDateTime(props.parent.closedOn)}</div>
                                </>
                                }
                            </>
                        }

                        <XLayout_Title>
                            {t("request.joins")}
                        </XLayout_Title>

                        {/* Thành viên */}
                        {comboboxOptions.participant.length > 0 && (
                            <>
                                <div className="mb-2 text-grey-7">{t("request.participant")}</div>

                                <div className="flex align-items-center p-flex-wrap mb-2">
                                    {comboboxOptions.participant.map((user, index) => (
                                        <div key={index} className="w-full mb-1">
                                            <UserInfo id={user.id}></UserInfo>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Người theo dõi */}

                        {comboboxOptions.observer.length > 0 && (
                            <>
                                <div className="mb-2 text-grey-7">{t("request.observer")}</div>

                                <div className="flex align-items-center p-flex-wrap mb-2">
                                    {comboboxOptions.observer.map((user, index) => (
                                        <div key={index} className="w-full mb-1">
                                            <UserInfo id={user.id}></UserInfo>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </XLayout_Right>
                </XLayout>
            }

        </Dialog>

    );
};

Request_Creator = forwardRef(Request_Creator);

export default Request_Creator;

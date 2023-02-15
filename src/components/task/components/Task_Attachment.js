import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import _ from "lodash";

import { Button } from "primereact/button";
import TaskService from "services/TaskService";
import Enumeration from '@lib/enum';
import CommonFunction from '@lib/common';
import classNames from "classnames";
import { FileUpload } from "primereact/fileupload";
import { Checkbox } from "primereact/checkbox";
import EmptyDataCompact from "@ngdox/ui-lib/dist/components/empty-data/EmptyDataCompact";
import { Tooltip } from "primereact/tooltip";
import { Chip } from "primereact/chip";
// import TaskDetailAttachmentDetail from "./TaskDetailAttachmentDetail"
import { InputText } from "primereact/inputtext";

import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { Dropdown } from "primereact/dropdown";
import FileApi from "services/FileApi";
import "./scss/Task_Attachment.scss";
import { XLayout, XLayout_Bottom, XLayout_Box, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import TaskBaseApi from "services/TaskBaseApi";
import { OverlayPanel } from "primereact/overlaypanel";
import XFileUpload from "components/x-fileupload/XFileUpload";
import XPopover from '@ui-lib/x-popover/XPopover';
import XFilePreview from "components/x-file-preview/XFilePreview";
import { Column } from "primereact/column";
import {InputNumber} from "primereact/inputnumber";

/**
 * props:
 *      application: 'task-base', // default.Eg: project, booking,...
 *      entity: 'task_base', // default. Eg: booking, issues
 *      taskId: , // task's id
 *      allowSign: false, // boolean - default false
 *
 *      types: [{
 *          group: "addition",
 *          name: "Tài liệu bổ sung",
 *          editable: true, // allow add and remove
 *          businessTypes: [{
 *              code: "in-request",
 *              name: "Tài liệu...",
 *              allowChangeType: true,
 *              allowUpload: true,
 *          }] - sub type, default null
 *      }] // document type, default [{code: "addition", groupName: ""}]
 *
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function Task_Attachment(props, ref) {
    const { taskId, allowSign, types, application, refType,mode,noAdd, disableInformation, maxFileSize, invalidFileSizeMessageDetail, addMessage} = props;
    const t = CommonFunction.t;
    const refFilePreview = useRef(null);
    const [attachments, setAttachments] = useState(null);

    const refCreateAttachmentMenu = useRef(null);
    const deletedAttachments = useRef([]);
    const [loading, setLoading] = useState(false);
    const isSigning = useRef(false);
    const refTaskDetailAttachmentDetail = useRef(null);


    useImperativeHandle(ref, () => ({
        /**
         * get attachments
         */
        get: () => {

            let _attachments = _.cloneDeep(attachments);
            let changedData = [];

            // get changed data
            _attachments.forEach(_group => {
                if (_group.attachments && _group.attachments.length > 0) {
                    _group.attachments.forEach(_attachment => {
                        if (_attachment.state) {
                            changedData.push(_.cloneDeep(_attachment));
                        }
                    })
                }
            });

            // get deleted data
            if (deletedAttachments.current && deletedAttachments.current.length > 0) {
                changedData = changedData.concat(deletedAttachments.current.map(m => ({ ...m, state: Enumeration.crud.delete })));
            }

            let result = Object.assign({
                valid: true,
                errors: [],
                attachments: _.cloneDeep(attachments),
                changedData: changedData
            }, validAttachments());

            return result;
        },

        /**
         * set
         * @param {*} _attachments
         */
        set: (_attachments) => {
            setAttachments(_attachments);
        },

        /**
         * submit
         * @param {*} documents
         */
        submit: (callback) => {
            let validation = validAttachments();
            if (validation.valid) {
                let _attachments = _.cloneDeep(_attachments);
                let _submitList = [];

                // create and update attachments
                _attachments.forEach(group => {
                    group.attachments.forEach(_attachment => {
                        _submitList.push(_attachment);
                    });
                });

                // delete attachments
                let _deletedAttachments = _.cloneDeep(deletedAttachments);
                _deletedAttachments.forEach(_attachment => {
                    _attachment.state = Enumeration.crud.delete;
                    _submitList.push(_attachment);
                });

                try {
                    Promise.all((function* () {
                        for (let _attachment of _submitList) {
                            yield new Promise(resolve => {
                                switch (_attachment.state) {
                                    case Enumeration.crud.create:

                                        break;
                                    case Enumeration.crud.update:

                                        break;
                                    default:
                                        resolve("");
                                        break;
                                }
                            })
                        }
                    })()).then(() => {
                        if (callback) callback();
                    })
                } catch (error) {
                    console.log("upload file error", error);
                    CommonFunction.toastError();
                }
            } else {
                CommonFunction.toastWarning(`<ul><li>${validation.errors.map(m => t(`task.attachment.${m}`)).join("</li><li>")}</li></ul`)
            }

        },

        /**
         * reload data
         */
        reload: () => {
            loadAttachments();
        }

    }));

    /**
     * load attachments
     */
    useEffect(() => {
        // prepare default attachment
        loadAttachments();
    }, [taskId])


    const prepareAttachments = () => {
        let _attachments = types || [{
            group: 'addition',
            name: t('attachment.type.addition'),
            editable: true,
            businessTypes: null
        }];

        _attachments.forEach(_group => {
            _group.attachments = [];

            // convert business type to groupcode.businesstype
            if (_group.businessTypes && Array.isArray(_group.businessTypes) && _group.businessTypes.length > 0) {
                _group.businessTypes.forEach(_type => {
                    _type.code = `${_group.group}.${_type}`;
                })
            }
        });

        return _attachments;
    }

    /**
     * load attachments
     */
    const loadAttachments = () => {
        if (taskId) {
            setLoading(true);
            TaskBaseApi.getAttachments(taskId, application, refType).then(res => {
                if (res) {
                    // prepare document types
                    let _attachments = prepareAttachments();

                    _attachments.forEach(_group => {
                        // arrange attachments to group
                        if (res && Array.isArray(res) && res.length > 0) {
                            if (_group.businessTypes && Array.isArray(_group.businessTypes)) {
                                _group.businessTypes.forEach(_type => {
                                    res.forEach(file => {
                                        if (file.file.businessType === _type.code) {
                                            _group.attachments.push(file);
                                        }
                                    });
                                })
                            } else {
                                res.forEach(file => {
                                    if (CommonFunction.isEmpty(file.file.businessType)) {
                                        _group.attachments.push(file);
                                    }
                                });
                            }
                        }
                    });

                    setAttachments(_attachments);
                    setLoading(false);
                }
            });
        } else {
            // default if taskid not define - create mode
            setAttachments(prepareAttachments());
        }
    }

    /**
     *
     */
    const validAttachments = () => {
        let valid = true, errors = [];
        // check is signing
        if (isSigning.current) {
            errors.push(t("task-base.file-signing"));
            valid = false;
        }

        // check file is impacting
        if (isImpactingDocuments()) {
            errors.push(t("task-base.file-impacting"));
            valid = false;
        }
        return { valid: valid, errors: errors }
    }

    /**
     * check file impacting
     */
    const isImpactingDocuments = () => {
        let isImpacting = false;
        attachments.filter(f => f.attachments.length > 0).forEach(el => {
            for (let i = 0; i < el.attachments.length; i++) {
                if (el.attachments[i].impact) {
                    isImpacting = true;
                    break;
                }
            }
        });

        return isImpacting;
    }

    /**
     * view attachment detail
     * @param {*} file
     */
    const viewFile = (file) => {
        refTaskDetailAttachmentDetail.current.edit(file);
    }

    /**
     * on create button click
     */
    const toggleCreate = (e) => {
        if (attachments.length > 1) {
            refCreateAttachmentMenu.current.toggle(e);
        } else {
            create(attachments[0]);
        }
    }

    /**
     * add file
     */
    const create = (group) => {
        let _attachments = _.cloneDeep(attachments);
        for (let i = 0; i < _attachments.length; i++) {
            if (_attachments[i].group === group.group) {
                _attachments[i].attachments.push({
                    id: null,
                    businessType: (group.businessTypes && group.businessTypes.length > 0) ? group.businessTypes[0].code : null,
                    name: "",
                    description: "",
                    versionNo: "",
                    impact: true,
                    state: Enumeration.crud.create,
                    file: {
                        name: ""
                    }
                })
                break;
            }
        }
        refCreateAttachmentMenu.current.hide();
        setAttachments(_attachments);
    }

    /**
     * update attachment
     * @param {*} groupIndex
     * @param {*} attachmentIndex
     */
    const update = (groupIndex, attachmentIndex) => {
        if (!isProcessing()) {
            let _attachments = _.cloneDeep(attachments);
            let _attachment = _attachments[groupIndex].attachments[attachmentIndex];
            _attachment.raw = _.cloneDeep(_attachment);
            _attachment.impact = true;
            setAttachments(_attachments);
        }
    }

    /**
     * cancel edit
     * @param {*} fileIndex
     */
    const cancelUpdate = (groupIndex, attachmentIndex) => {
        let _attachments = _.cloneDeep(attachments);
        let _attachment = _attachments[groupIndex].attachments[attachmentIndex];

        // check if attachment has raw, if not, it's a new attachment, remove it
        if (_attachment.raw) {
            // reverse attachment info
            let _raw = _.cloneDeep(_attachment.raw);
            _raw.impact = false;
            _attachments[groupIndex].attachments[attachmentIndex] = _raw;
        } else {
            // remove new attachment
            _attachments[groupIndex].attachments = [
                ..._attachments[groupIndex].attachments.slice(0, attachmentIndex),
                ..._attachments[groupIndex].attachments.slice(attachmentIndex + 1)
            ]
        }

        setAttachments(_attachments);
    }

    /**
     * apply edit
     * @param {*} groupIndex
     * @param {*} attachmentIndex
     */
    const applyEdit = (groupIndex, attachmentIndex) => {
        let _attachments = _.cloneDeep(attachments);
        let _attachment = _.cloneDeep(_attachments[groupIndex].attachments[attachmentIndex]);
        let valid = true;
        let errors = []
        if(maxFileSize && _attachment.file && _attachment.file.fileContent && _attachment.file.fileContent.size > maxFileSize){
            valid = false;
            errors.push(invalidFileSizeMessageDetail || t("task.attachment.file-cannot-bigger-than").format(CommonFunction.formatSizeUnits(maxFileSize)))
        }
        if(CommonFunction.isEmpty(_attachment.file.name)){
            valid = false
            errors.push(t("task.attachment.file-not-empty"))
        }
        if(CommonFunction.isEmpty(_attachment.name)){
            valid = false
            errors.push(t("task.attachment.file.name-not-empty"))
        }
        if(CommonFunction.isEmpty(_attachment.versionNo)){
            valid = false
            errors.push(t("task.attachment.file.version-not-empty"))


        }
        if(_attachment.versionNo) {
            if((_attachment).versionNo>9 || _attachment.versionNo<1) {
                valid = false
                errors.push(t("task.attachment.file.versionNo-1-9"))
            }
        }
        if(_attachment.name.length>100){
            valid = false;
            errors.push(t("task.attachment.file.name-not-lt-100"))
        }
        if(_attachment.description>100){
            valid = false;
            CommonFunction.toastWarning(t("task.attachment.not-valid"))
        }

        if (valid) {
            _attachment.impact = false;
            _attachment.icon = CommonFunction.getFileIcons(_attachment.file.name);
            if (_attachment.state !== Enumeration.crud.create) {
                _attachment.state = Enumeration.crud.update;
            }
            delete _attachment.raw;
            _attachments[groupIndex].attachments[attachmentIndex] = _attachment;
            setAttachments(_attachments);
        }
        else {
            CommonFunction.toastWarning(errors)
        }
    }

    /**
     * delete file
     * @param {*} file
     * @param {*} attachmentIndex
     */
    const remove = (groupIndex, attachmentIndex) => {
        if (!isProcessing()) {
            let _attachments = _.cloneDeep(attachments);
            if (_attachments[groupIndex].attachments[attachmentIndex].state !== Enumeration.crud.create) {
                deletedAttachments.current.push(_.cloneDeep(_attachments[groupIndex].attachments[attachmentIndex]));
            }
            _attachments[groupIndex].attachments = [
                ..._attachments[groupIndex].attachments.slice(0, attachmentIndex),
                ..._attachments[groupIndex].attachments.slice(attachmentIndex + 1)];
            setAttachments(_attachments);
        }
    }

    /**
     * on selected file
     * @param {*} e
     * @param {*} typeIndex
     * @param {*} attachmentIndex
     */
    const onFileSelect = (e, groupIndex, attachmentIndex) => {
        if (e.files && e.files.length > 0) {
            if (e.files[0].size > 0) {
                let _attachments = _.cloneDeep(attachments);
                let _attachment = _attachments[groupIndex].attachments[attachmentIndex];
                let _attachmentFile = _attachments[groupIndex].attachments[attachmentIndex].file;
                _attachmentFile.id = null; // set file's id null to mark upload
                _attachmentFile.fileContent = e.files[0];
                _attachmentFile.name = e.files[0].name;
                _attachmentFile.signedUsers = []; // remove signed user
                _attachmentFile.fileChanged = true;

                _attachment.name = e.files[0].name;
                _attachment.versionNo = "0.0.0";

                setAttachments(_attachments);
            } else {
                CommonFunction.toastWarning(t("task-base.attachment.file-empty-content"));
            }
        }
    }

    /**
     * sign files
     */
    const signFiles = () => {
        let signIds = [];
        let notUploaded = [];
        let _attachments = _.cloneDeep(attachments);
        _attachments.forEach(el => {
            if (el.attachments.length > 0) {
                el.attachments.forEach(_attachment => {
                    if (_attachment.selected) {
                        if (_attachment.id && _attachment.file && _attachment.file.id) {
                            signIds.push(_attachment.id);
                        } else {
                            notUploaded.push(_attachment.name);
                        }
                    }
                })
            }
        });

        if (signIds.length === 0) {
            if (notUploaded.length === 0) {
                CommonFunction.toastWarning(t("task-base.attachment.sign-not-selected"));
            } else {
                CommonFunction.toastWarning(t("task-base.attachment.cannot-sign-new-file"));
            }
        } else {
            setLoading(true);
            TaskBaseApi.signAttachments({
                application: application,
                refType: refType,
                refId: taskId,
                ids: signIds,
                action: ["sign"]
            }).then(res => {
                if (res) {
                    // re-map file
                    _attachments.forEach(el => {
                        if (el.attachments.length > 0) {
                            el.attachments.forEach(_file => {
                                let _afterSign = res.find(f => f.id === _file.id);
                                if (_afterSign) {
                                    _file.file = _afterSign.file;
                                }
                            })
                        }
                    });
                    CommonFunction.toastSuccess(t("task-base.attachment.sign-success"));
                }
                setLoading(false);
            })
        }
    }

    /**
     * check files is processing
     * @returns
     */
    const isProcessing = () => {
        if (loading) {
            CommonFunction.toastWarning(t("task.attachment.file-processing"));
        }
        return loading;
    }

    /**
     * render toolbar
     * @returns
     */
    const toolbarRenderer = () => {
        const isDisabled = mode === 'view' ? true : false;
        if(!noAdd){
            return (
                <div className="flex mb-2">
                    <Button className=" mr-1 p-button-text" disabled={isDisabled} onClick={toggleCreate}>
                        <i className="bx bx-plus text-green"></i>
                        <span   className="text-grey-9">{t(addMessage ? addMessage : "task.attchment.add")}</span>
                    </Button>
                    {allowSign &&
                        <Button className="link-button p-button-text" disabled={isDisabled} onClick={signFiles}>
                            <i className="bx bx-pen text-indigo"></i>
                            <span className="text-grey-9">{t("task.attchment.sign")}</span>
                        </Button>
                    }
                </div>
            )
            }
    }

    /**
     * apply change
     */
    const applyChange = (groupIndex, attachmentIndex, prop, value) => {
        let _attachments = _.cloneDeep(attachments);
        _attachments[groupIndex].attachments[attachmentIndex][prop] = value;
        setAttachments(_attachments);
    }

    /**
     * preview file
     * @param {*} attachment
     */
    const previewFile = (attachment) => {
        refFilePreview.current.show([{ refId: attachment.id, id: attachment.file.id, name: attachment.file.name }], 0);
    }

    const getCheckBoxRender=(attachment,groupIndex,attachmentIndex)=>{
        if(!noAdd){
            return (
                <>
                <div className="task-attachment-selection">
                    <Checkbox
                        disabled={mode == 'view' ? true : false }
                        checked={attachment.selected}
                        onChange={e => applyChange(groupIndex, attachmentIndex, "selected", e.checked)}
                    />
                </div>
                </>
            )
        }else{
            return (
                <>
                <div className="task-attachment-selection">
                    {attachmentIndex+1}
                </div>
                </>
            )
        }
    }
    const getRowButtonRender=(attachment,groupIndex,attachmentIndex)=>{
        if(!noAdd){
            return (<>
            <div className="task-attachment-action">
                        {attachment.file && attachment.file.id &&
                            <Button

                                className="p-button-rounded p-button-text"
                                icon="bx bx-down-arrow-circle text-grey"
                                tooltip={t("button.download")}
                                tooltipOptions={{ position: "bottom" }}
                                onClick={() => CommonFunction.downloadFile(attachment.file.id)}
                            ></Button>
                        }
                        <Button
                            disabled={mode === 'view' ? true : false}
                            className="p-button-rounded p-button-text"
                            icon="bx bx-pencil text-grey"
                            tooltip={t('common.update')}
                            tooltipOptions={{ position: "bottom" }}
                            onClick={() => update(groupIndex, attachmentIndex)}
                        ></Button>
                        <Button
                            disabled={mode === 'view' ? true : false}
                            className="p-button-rounded p-button-text"
                            icon="bx bx-trash text-grey"
                            tooltip={t('common.delete')}
                            tooltipOptions={{ position: "bottom" }}
                            onClick={() => remove(groupIndex, attachmentIndex)}
                        ></Button>
                    </div>
            </>)
        }else{
            return (<>
             <div className="task-attachment-action">
                        {attachment.file && attachment.file.id &&
                            <Button
                                className="p-button-rounded p-button-text"
                                icon="bx bx-down-arrow-circle text-grey"
                                tooltip={t("button.download")}
                                tooltipOptions={{ position: "bottom" }}
                                onClick={() => CommonFunction.downloadFile(attachment.file.id)}
                            ></Button>
                        }
                        </div>
            </>)
        }
    }
    /**
     * render attachment
     */
    const renderAttachment = (attachment, attachmentIndex, group, groupIndex) => {
        if (attachment.impact) {
            // attachment is impacting
            return (<div key={attachmentIndex} className="task-attachment-item impacting border-all">
                <div className="task-attachment-selection"></div>
                <div className="task-attachment-content">
                    <div className="p-fluid fluid  formgrid grid p-0">
                        <div className={`p-field ${disableInformation ? 'col-12' : 'col-4'} task-attachment-file-upload`}>
                            <img className="file-icon" src={CommonFunction.getFileIcons(attachment.file.name)} />

                            <InputText
                                className={classNames({ "x-file-upload-field": true, "p-invalid": CommonFunction.isEmpty(attachment.file.name) })}
                                value={attachment.file.name}
                                disabled
                                onChange={(e) => { }}
                            />

                            <XFileUpload
                                type="in-field"
                                className={classNames({ "p-invalid": CommonFunction.isEmpty(attachment.file.name) })}
                                chooseOptions={{ icon: 'bx bx-cloud-upload', label: t("button.choose-file") }}
                                onSelect={(e) => onFileSelect(e, groupIndex, attachmentIndex)}
                                maxFileSize={maxFileSize}
                                invalidFileSizeMessageDetail={invalidFileSizeMessageDetail}
                                accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .7z"
                            />
                        </div>
                        {!disableInformation &&
                            <>
                                <div className="col-6">
                                    <InputText
                                        className={classNames({ "p-invalid": CommonFunction.isEmpty(attachment.name) })}
                                        value={attachment.name}
                                        placeholder={t("task.attachment.file.name")}
                                        onChange={(e) => applyChange(groupIndex, attachmentIndex, "name", e.target.value)}
                                    ></InputText>
                                </div>
                                <div className="col-2">
                                    <InputText
                                        className={classNames({ "p-invalid": CommonFunction.isEmpty(attachment.versionNo) })}
                                        value={attachment.versionNo}
                                        placeholder={t("task.attachment.file.version")}
                                        onChange={(e) => applyChange(groupIndex, attachmentIndex, "versionNo", e.target.value)}
                                    ></InputText>
                                </div>
                                {attachment.businessType && attachment.businessType.length > 0 &&
                                    <div div className="col-4">
                                        <Dropdown
                                            value={attachment.businessType}
                                            options={group.businessTypes}
                                            optionLabel="name"
                                            optionValue="code"
                                            onChange={(e) => applyChange(groupIndex, attachmentIndex, "businessType", e.value)}
                                        ></Dropdown>
                                    </div>
                                }
                                <div className={classNames({
                                    "col-8": attachment.businessType && attachment.businessType.length > 0,
                                    "col-12": !attachment.businessType || attachment.businessType.length === 0
                                })}>
                                    <InputText
                                        value={attachment.description}
                                        placeholder={t("task.attachment.file.description")}
                                        onChange={(e) => applyChange(groupIndex, attachmentIndex, "description", e.target.value)}
                                    ></InputText>
                                </div>
                            </>
                        }
                    </div>
                    <div className="task-attachment-button">
                        <div className="link-button" onClick={() => applyEdit(groupIndex, attachmentIndex)}>
                            <span className="bx bx-check text-green"></span>
                            <span>{t('button.accept')}</span>
                        </div>
                        <div className="link-button" onClick={() => cancelUpdate(groupIndex, attachmentIndex)}>
                            <span className="bx bx-undo text-grey"></span>
                            <span>{t('button.undo')}</span>
                        </div>
                    </div>
                </div>
            </div >)
        } else {
            // attachment is not impact
            return (<div key={attachmentIndex} className={classNames({
                "task-attachment-item task-attachment-view border-all": true,
                "new-item": attachment.state === Enumeration.crud.create,
                "edit-item": attachment.state === Enumeration.crud.update
            })}>
                {getCheckBoxRender(attachment,groupIndex,attachmentIndex)}
                  {/* <div className="task-attachment-selection">
                    <Checkbox
                        disabled={mode == 'view' ? true : false }
                        checked={attachment.selected}
                        onChange={e => applyChange(groupIndex, attachmentIndex, "selected", e.checked)}
                    />
                </div> */}
                <div className="task-attachment-content">
                    <div className="task-attachment-info">
                        <XPopover
                            position="bottom"
                            width={400}
                            title={() => (<div className="task-attachment-name">
                                <img className="file-icon" src={CommonFunction.getFileIcons(attachment.file.name)} />
                                <span className="link-button" onClick={() => previewFile(attachment)}>{attachment.file.name}</span>
                            </div>)}
                            content={() => (<div className="x-popover-default-style task-attachment-popover-content">
                                <img className="popover-file-icon" src={CommonFunction.getFileIcons(attachment.file.name)} />
                                <div>
                                    <div className="attachment-detail-row">
                                        <span className="prop-name">{t("common.name")}:</span>
                                        <span className="prop-value">{attachment.name}</span>
                                    </div>
                                    {attachment.description &&
                                        <div className="attachment-detail-row">
                                            <span className="prop-name">{t("common.description")}:</span>
                                            <span className="prop-value">{attachment.description}</span>
                                        </div>
                                    }
                                    <div className="attachment-detail-row">
                                        <span className="prop-name">{t("common.version")}:</span>
                                        <span className="prop-value">{attachment.versionNo}</span>
                                    </div>
                                </div>
                            </div>)}
                        ></XPopover>
                    </div>
                    {getRowButtonRender(attachment,groupIndex,attachmentIndex)}
                    {/* <div className="task-attachment-action">
                        {attachment.file && attachment.file.id &&
                            <Button

                                className="p-button-rounded p-button-text"
                                icon="bx bx-down-arrow-circle text-grey"
                                tooltip={t("button.download")}
                                tooltipOptions={{ position: "bottom" }}
                                onClick={() => CommonFunction.downloadFile(attachment.file.id)}
                            ></Button>
                        }
                        <Button
                            disabled={mode === 'view' ? true : false}
                            className="p-button-rounded p-button-text"
                            icon="bx bx-pencil text-grey"
                            tooltip={t('common.update')}
                            tooltipOptions={{ position: "bottom" }}
                            onClick={() => update(groupIndex, attachmentIndex)}
                        ></Button>
                        <Button
                            disabled={mode === 'view' ? true : false}
                            className="p-button-rounded p-button-text"
                            icon="bx bx-trash text-grey"
                            tooltip={t('common.delete')}
                            tooltipOptions={{ position: "bottom" }}
                            onClick={() => remove(groupIndex, attachmentIndex)}
                        ></Button>
                    </div> */}
                </div>

            </div >)
        }
    }

    if (!attachments || attachments.length === 0) {
        return <></>
    }

    return (<>
        <XLayout className="task-attachment position-relative">
            <XLayout_Top>
                {toolbarRenderer()}
            </XLayout_Top>
            {(() => {
                let _attachments = attachments.filter(f => f.attachments.length > 0);
                if (_attachments.length > 0) {
                    return (
                        <XLayout_Center className="task-attachment-detail position-relative">
                            <LoadingBar loading={loading} top={0} />
                            {_attachments.map((group, groupIndex) => (<React.Fragment key={groupIndex}>
                                {attachments.length > 1 &&
                                    <div className="task-attachment-group">
                                        <i className="bx bxs-folder-open"></i>
                                        {group.name}
                                    </div>
                                }
                                {group.attachments.map((attachment, attachmentIndex) => renderAttachment(attachment, attachmentIndex, group, groupIndex))}
                            </React.Fragment>))}
                        </XLayout_Center>
                    )
                }
                return <></>;
            })()}
        </XLayout>

        <XFilePreview ref={refFilePreview} allowHistory={true}></XFilePreview>

        {attachments.filter(f => f.editable).length > 0 &&
            <OverlayPanel ref={refCreateAttachmentMenu} className="x-menu">
                {attachments.filter(f => f.editable).map((group, index) => (
                    <div key={index} className="x-menu-button" onClick={() => create(group)}>
                        <span>{group.name}</span>
                    </div>
                ))}
            </OverlayPanel>
        }
    </>);
}

Task_Attachment = forwardRef(Task_Attachment);

export default Task_Attachment;

import React, {forwardRef,  useEffect, useImperativeHandle, useRef, useState} from "react";
import _ from "lodash";

import {Button} from "primereact/button";
import TaskService from "services/TaskService";
import Enumeration from '@lib/enum';
import CommonFunction from '@lib/common';
import classNames from "classnames";
import {FileUpload} from "primereact/fileupload";
import {Checkbox} from "primereact/checkbox";
import EmptyDataCompact from "@xdp/ui-lib/dist/components/empty-data/EmptyDataCompact";
import {Tooltip} from "primereact/tooltip";
import {Chip} from "primereact/chip";
import TaskDetailAttachmentDetail from "./TaskDetailAttachmentDetail"
import {InputText} from "primereact/inputtext";

import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import {Dropdown} from "primereact/dropdown";
import FileApi from "services/FileApi";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';

function TaskDetailAttachment(props, ref) {
    const t = CommonFunction.t;

    const emptyValidateDocument = {
        code: null,
        name: null
    }

    const defaultDocumentCount = {
        [Enumeration.workflow_document_type.template]: 0,
        [Enumeration.workflow_document_type.reference]: 0,
        [Enumeration.workflow_document_type.inTask]: 0,
        [Enumeration.workflow_document_type.inRequest]: 0,
        totalAddition: 0,
        total: 0,
    }

    const documentType = [
        { name: t("task.attachment.type.in-task"), value: Enumeration.workflow_document_type.inTask },
        { name: t("task.attachment.type.in-request"), value: Enumeration.workflow_document_type.inRequest },
    ];

    const { user } = props;
    const { task } = props;
    const [docType, setDocType] = useState(documentType);
    const [documentCount, setDocumentCount] = useState(defaultDocumentCount);
    const [documents, setDocuments] = useState([]);
    const deletedDocuments = useRef([]);
    const refTaskDetailAttachmentDetail = useRef(null);
    const [loading, setLoading] = useState(false);
    const isSigning = useRef(false);

    useImperativeHandle(ref, () => ({
        /**
         * get attachments
         */
        get: () => {
            let result = {
                valid: true,
                documents: []
            };
            let _documents = _.cloneDeep(documents);

            // check is signing
            if (isSigning.current) {
                CommonFunction.toastWarning(t("task.attachment.file-signing"));
                result.valid = false;
            }

            // check file is impacting
            if (result.valid) {
                if (isImpactingDocuments()) {
                    CommonFunction.toastWarning(t("task.attachment.file-impacting"));
                    result.valid = false;
                }
            }

            if (result.valid) {
                // add or update documents
                _documents.forEach(el => {
                    if (el.fileChanged || el.infoChanged) {
                        let params = { uploadFilesParam: null, uploadDocumentParam: null }

                        if (el.fileChanged) {
                            params.uploadFilesParam = {
                                folder: task.id,
                                files: el.file.fileContent
                            }
                        }

                        params.uploadDocumentParam = {
                            id: el.id || 0,
                            fileId: el.file.id,
                            name: el.file.name,
                            type: el.type,
                            code: el.code,
                            taskId: task.id,
                            versionNo: el.versionNo,
                            description: el.description,
                            action: el.id ? "UPDATE" : "ADD"
                        }

                        result.documents.push(params);
                    }
                })

                // delete documents
                deletedDocuments.current.forEach(el => {
                    let params = { uploadFilesParam: null, uploadDocumentParam: null }
                    params.uploadDocumentParam = {
                        id: el.id,
                        fileId: el.file.id,
                        name: el.file.name,
                        type: el.type,
                        code: el.code,
                        taskId: task.id,
                        versionNo: el.versionNo,
                        description: el.description,
                        action: "DELETE"
                    }
                    result.documents.push(params);
                })
            }

            return result;
        },

        /**
         * submit
         * @param {*} documents
         */
        submit: (_documents, callback) => {
            try {
                Promise.all((function* () {
                    for (let _document of _documents) {
                        yield new Promise(resolve => {
                            if (_document.uploadFilesParam) {
                                // upload file then upload document
                                FileApi.uploadFiles(_document.uploadFilesParam).then(res => {
                                    if (res) {
                                        _document.uploadDocumentParam.fileId = res[0].id;
                                        _document.uploadDocumentParam.name = res[0].name;
                                        TaskService.uploadDocument(_document.uploadDocumentParam).then(res => {
                                            resolve("");
                                        })
                                    }

                                })
                            } else {
                                // upload document
                                TaskService.uploadDocument(_document.uploadDocumentParam).then(res => {
                                    resolve("");
                                })
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
        }

    }));

    /**
     * load documents
     */
    useEffect(() => {
        if (task && task.id) {
            loadAttachments();
        }
        if(props.scope && props.scope === 'TASK'){
            let _docType = _.cloneDeep(docType);
            _.remove(_docType, function(obj){
                return obj.value === Enumeration.workflow_document_type.inRequest
            });
            setDocType(_docType);
        }
    }, [task])

    /**
     * load attachments
     */
    const loadAttachments = () => {
        TaskService.getDocumentsByTask(task.id).then(res => {
            if (res) {
                let _count = { ...defaultDocumentCount };

                res.forEach(el => {
                    // count doc type
                    _count[el.type] += 1;

                    // prepare document info
                    el.icon = CommonFunction.getFileIcons(el.file ? el.file.name : undefined);
                    el.isNew = false;
                    el.fileChanged = false;
                    el.infoChanged = false;
                    el.impact = false;
                    el.selected = false;
                    el.validate = { ...emptyValidateDocument }
                });

                _count.totalAddition = _count[Enumeration.workflow_document_type.inTask] + _count[Enumeration.workflow_document_type.inRequest];
                _count.total = _count[Enumeration.workflow_document_type.reference] + _count[Enumeration.workflow_document_type.template] + _count.totalAddition;

                setDocumentCount(_count);
                setDocuments(res);

            } else {
                setDocumentCount(defaultDocumentCount)
            }
        });
    }

    /**
     * check file impacting
     */
    const isImpactingDocuments = () => {
        let isImpacting = false;
        for (let i = 0; i < documents.length; i++) {
            if (documents[i].impact) {
                isImpacting = true;
                break;
            }
        }
        return isImpacting;
    }

    /**
     * apply change
     * @param {*} index
     * @param {*} prop
     * @param {*} value
     */
    const applyChange = (index, prop, value) => {
        let _documents = _.cloneDeep(documents);
        _documents[index][prop] = value;
        setDocuments(_documents);
    }

    /**
     * view attachment detail
     * @param {*} file
     */
    const viewFile = (file) => {
        refTaskDetailAttachmentDetail.current.edit(file);
    }

    /**
     * add file
     */
    const addFile = () => {
        let _documents = _.cloneDeep(documents);
        _documents.push({
            id: null,
            code: "",
            description: "",
            file: { name: "" },
            versionNo: "",
            fileChanged: true,
            infoChanged: true,
            type: Enumeration.workflow_document_type.inTask,
            action: "ADD",
            impact: true,
            user: getCurrentUserInfo()
        });

        let _documentCount = reCalculateDocumentCount(_documents);

        setDocumentCount(_documentCount);
        setDocuments(_documents);
    }

    /**
     * re-calculate document count
     * @param {*} _documents
     */
    const reCalculateDocumentCount = (_documents) => {
        let _documentCount = _.cloneDeep(defaultDocumentCount);
        _documentCount.total = _documents.length;
        _documents.forEach(el => {
            _documentCount[el.type] += 1;
            switch (el.type) {
                case Enumeration.workflow_document_type.inTask:
                case Enumeration.workflow_document_type.inRequest:
                    _documentCount.totalAddition += 1;
                    break;
                default:
                    break;
            }
        })

        return _documentCount;
    }

    /**
     * get current user info
     * @returns
     */
    const getCurrentUserInfo = () => {
        return {
            fullName: window.app_context.user.fullName,
            avatar: window.app_context.user.avatar,
        }
    }

    /**
     * edit file
     * @param {*} file
     * @param {*} fileIndex
     */
    const editFile = (file, fileIndex) => {
        if (!isProcessing()) {
            let _documents = _.cloneDeep(documents);
            _documents[fileIndex].raw = _.cloneDeep(_documents[fileIndex]);
            _documents[fileIndex].impact = true;
            setDocuments(_documents);
        }
    }

    /**
     * cancel edit
     * @param {*} fileIndex
     */
    const cancelEditFile = (fileIndex) => {
        let _documents = _.cloneDeep(documents);
        if (_documents[fileIndex].action === "ADD" && CommonFunction.isEmpty(_documents[fileIndex].file.name)) {
            _documents = [..._documents.slice(0, fileIndex), ..._documents.slice(fileIndex + 1)]
        } else {
            let _raw = _.cloneDeep(_documents[fileIndex].raw);
            _raw.impact = false;
            _documents[fileIndex] = _raw;
        }

        let _documentCount = reCalculateDocumentCount(_documents);

        setDocumentCount(_documentCount);
        setDocuments(_documents);
    }

    /**
     * apply edit
     * @param {*} fileIndex
     */
    const applyEditFile = (fileIndex) => {
        let _documents = _.cloneDeep(documents);
        let _document = _.cloneDeep(_documents[fileIndex]);
        let valid = true;

        if (CommonFunction.isEmpty(_document.file.name)
            || CommonFunction.isEmpty(_document.code)
            || CommonFunction.isEmpty(_document.description)
            || CommonFunction.isEmpty(_document.versionNo)) {
            valid = false;
            CommonFunction.toastWarning(t("task.attachment.not-valid"))
        }

        if (valid) {
            _document.impact = false;
            _document.icon = CommonFunction.getFileIcons(_document.file.name);
            _document.infoChanged = (
                _document.action === "ADD"
                || _document.code !== _document.raw.code
                || _document.description !== _document.raw.description
                || _document.versionNo !== _document.raw.versionNo
            );
            delete _document.raw;
            _documents[fileIndex] = _document;
            setDocuments(_documents);
        }

    }

    /**
     * delete file
     * @param {*} file
     * @param {*} fileIndex
     */
    const deleteFile = (file, fileIndex) => {
        if (!isProcessing()) {
            let _documents = _.cloneDeep(documents);
            deletedDocuments.current.push(_.cloneDeep(_documents[fileIndex]));
            _documents = [..._documents.slice(0, fileIndex), ..._documents.slice(fileIndex + 1)];
            setDocuments(_documents);
        }
    }

    /**
     * on selected file
     * @param {*} e
     * @param {*} typeIndex
     * @param {*} fileIndex
     */
    const onFileSelect = (e, fileIndex) => {
        if (e.files && e.files.length > 0) {
            let _documents = _.cloneDeep(documents);
            let file = _documents[fileIndex].file;
            file.id = null; // set file's id null to marl upload
            file.fileContent = e.files[0];
            file.name = e.files[0].name;
            _documents[fileIndex].signedUsers = []; // remove signed user
            _documents[fileIndex].fileChanged = true;
            setDocuments(_documents);
        }
    }

    /**
     * sign files
     */
    const signFiles = () => {
        let valid = true;
        let _documents = _.cloneDeep(documents);
        console.log("xxxx", _documents);

        // check if file is impacting
        if (isImpactingDocuments()) {
            CommonFunction.toastWarning(t("task.attachment.file-impacting"));
            valid = false;
        }

        // check if file has change
        if (valid) {
            for (let i = 0; i < _documents.length; i++) {
                if (_documents[i].fileChanged) {
                    CommonFunction.toastWarning(t("task.attachment.file-changed"));
                    valid = false;
                }
            }
        }

        // start sign
        if (valid) {
            let selectedDocuments = [];
            let selectedDocumentsName = [];

            _documents.forEach((el, index) => {
                if (el.selected) {
                    if (el.id !== null && el.id !== 0) {
                        selectedDocuments.push({
                            id: el.id,
                            index: index
                        });
                        selectedDocumentsName.push(el.file.name);
                    }
                }
            })

            if (selectedDocuments.length > 0) {
                try {
                    CommonFunction.showConfirm(
                        <div style={{ maxWidth: "450px" }}>
                            {`${t("task.signed.document.list")} ${selectedDocumentsName.join(", ")}?`}
                        </div>
                        , null,
                        () => {
                            // mark flag signing
                            isSigning.current = true;

                            // set loading
                            setLoading(true);

                            // sign
                            let filesToSign = selectedDocuments.map(m => m.id);
                            TaskService.sign(task.id, filesToSign).then(res => {
                                if (res) {
                                    isSigning.current = false;
                                    setLoading(false);
                                    CommonFunction.toastSuccess(t("doc.signed"));
                                    loadAttachments();
                                } else {
                                    setLoading(false);
                                    isSigning.current = false;
                                    CommonFunction.toastError();
                                }
                            });
                        }
                    )
                } catch (error) {
                    console.log("Sign error", error);
                    CommonFunction.toastError();
                    isSigning.current = false;
                }
            } else {
                CommonFunction.toastWarning(t("task.attachment.empty-sign-file"));
            }
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
        return loading
    }

    /**
     * file renderer
     * @param {*} file
     */
    const fileRenderer = (file, fileIndex) => {

        let className = "template-item";
        switch (file.type) {
            case Enumeration.workflow_document_type.template:
                className = "template-item"
                break;
            case Enumeration.workflow_document_type.inTask:
            case Enumeration.workflow_document_type.inRequest:
                className = "additional-item"
                break;
            default:
                break;
        }

        return (

            <div className="attachment-group template-item">

                {!file.impact && <>
                    {/* file select */}
                    <div className="flex align-items-center justify-content-center">
                        <Checkbox
                            checked={file.selected}
                            onChange={e => applyChange(fileIndex, "selected", e.checked)}
                        />
                    </div>

                    {/* file info */}
                    <Tooltip content={`${t("workflow.doc.download")} ${file.name}`} target={`.download-file-info-${fileIndex}`} position="bottom"></Tooltip>
                    <div className=" document-info flex flex-column border-left border-right h-full">
                        <div className="flex flex-column ml-1">
                            <span className={classNames({ "file-code ": true, "mark-require": file.isRequire })}><b>{file.code}</b> - {file.description}</span>
                            <div className="flex">
                                <img className="file-icon mr-1" src={file.icon}></img>
                                <div className="flex flex-column mt-1">
                                    <div className="flex align-items-center">
                                        <i className='bx bx-file-blank fs-18 mr-2 text-grey-7'></i>
                                        <Tooltip content={t("task.attachment.preview")} target=".button-link-preview-file" position="bottom"></Tooltip>
                                        <span className="link-button text-blue button-link-preview-file" onClick={() => viewFile(file)}>{file.file ? file.file.name : ''}</span>
                                        <i className='bx bx-copy-alt fs-18 mr-2 ml-2 text-grey-6'></i>
                                        <span className="link-button text-blue button-link-preview-file" onClick={() => viewFile(file)}>{t("task.attachment.file.version")}: {file.versionNo}</span>
                                        <Tooltip content={t("task.attachment.download")} target=".button-link-download-file" position="bottom"></Tooltip>
                                        <i className='bx bx-download fs-18 mr-2 ml-2 link-button text-green button-link-download-file' onClick={() => CommonFunction.downloadFile(file.file ? file.file.id : '')}></i>
                                    </div>

                                    {(file.type === Enumeration.workflow_document_type.inTask || file.type === Enumeration.workflow_document_type.inRequest) &&
                                        <div className="flex align-items-center mt-1">
                                            <i className='bx bx-category fs-18 mr-2 text-grey-7'></i>
                                            <span>{t("task.attachment.type")}: {t(`task.attachment.type.${file.type}`)}</span>
                                        </div>
                                    }

                                    <div className="flex align-items-center mt-1">
                                        <i className='bx bx-user fs-18 mr-2 text-grey-7'></i>
                                        <span>{t("task.attachment.file.create-by")}: </span>
                                        <Chip
                                            label={file.user.fullName}
                                            image={CommonFunction.getImageUrl(file.user.avatar, file.user.fullName)}
                                            className="tiny ml-1" />
                                    </div>
                                    {file.signedUsers && file.signedUsers.length > 0 &&
                                        <div className="flex align-items-stretch mt-1">
                                            <i className='fas fa-signature fs-16 mr-2 text-grey-7'></i>
                                            <span className="white-space-nowrap">{t("document.signed.user")}: </span>
                                            <div className="w-full">
                                                {file.signedUsers.map((signedUser, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={signedUser.fullName}
                                                        image={CommonFunction.getImageUrl(signedUser.avatar, signedUser.fullName)}
                                                        className="tiny ml-1" />
                                                ))}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* template actions */}
                    <div className="document-action flex align-items-center justify-content-center">
                        <Tooltip content={t("task.attachment.edit")} target=".button-link-edit-file" position="bottom"></Tooltip>
                        <i className='bx bx-pencil link-button text-orange-9 button-link-edit-file' onClick={() => editFile(file, fileIndex)}></i>
                        {(file.type === Enumeration.workflow_document_type.inTask || file.type === Enumeration.workflow_document_type.inRequest) && <>
                            <Tooltip content={t("task.attachment.delete")} target=".button-link-delete-file" position="bottom"></Tooltip>
                            <i className='bx bx-trash link-button text-red-9 button-link-delete-file' onClick={() => deleteFile(file, fileIndex)}></i>
                        </>}
                    </div>
                </>}

                {file.impact && <>
                    <div></div>
                    {/* edit file content */}
                    <div className=" document-edit flex flex-column border-left border-right h-full">

                        {/* code and description of template file */}
                        {file.type === Enumeration.workflow_document_type.template &&
                            <span className={classNames({ "file-code ": true, "mark-require": file.isRequire })}><b>{file.code}</b> - {file.description}</span>
                        }

                        {/* code and description of additional file */}
                        {(file.type === Enumeration.workflow_document_type.inTask || file.type === Enumeration.workflow_document_type.inRequest) && <>
                            <div className="flex align-items-center">
                                <i className='bx bx-code-alt fs-18 mr-2 text-grey-7'></i>
                                <InputText
                                    className={classNames({ "dense file-code": true, "p-invalid": CommonFunction.isEmpty(file.code) })}
                                    value={file.code}
                                    placeholder={t("task.attachment.code")}
                                    onChange={e => applyChange(fileIndex, "code", e.target.value)}
                                />
                                <i className='bx bx-category fs-18 ml-2 mr-2 text-grey-7'></i>
                                <Dropdown
                                    className="dense file-type"
                                    value={file.type} options={docType}
                                    onChange={e => applyChange(fileIndex, "type", e.value)}
                                    optionLabel="name"
                                    optionValue="value" />
                            </div>
                            <div className="flex align-items-center mt-1">
                                <i className='bx bx-align-left fs-18 mr-2 text-grey-7'></i>
                                <InputText
                                    className={classNames({ "dense file-description": true, "p-invalid": CommonFunction.isEmpty(file.description) })}
                                    value={file.description}
                                    placeholder={t("task.attachment.description")}
                                    onChange={e => applyChange(fileIndex, "description", e.target.value)}
                                />
                            </div>
                        </>}

                        <div className="flex align-items-center mt-1 mb-1 position-relative">
                            <i className='bx bx-file-blank fs-18 mr-2 text-grey-7'></i>
                            <img className="file-upload-image" src={CommonFunction.getFileIcons(file.file.name)} />
                            <InputText
                                className={classNames({ "dense file-name": true, "p-invalid": CommonFunction.isEmpty(file.file.name) })}
                                value={file.file.name}
                                disabled
                                onChange={(e) => { }}
                            />
                            <Tooltip content={t("task.attachment.choose-file")} target=".upload-file-button" position="bottom"></Tooltip>
                            <FileUpload
                                className="upload-file-button"
                                headerTemplate={(options) => (<>{options.chooseButton}</>)}
                                itemTemplate={() => (<></>)}
                                chooseOptions={{ icon: 'bx bx-upload text-white', iconOnly: true }}
                                onSelect={(e) => onFileSelect(e, fileIndex)}
                                customUpload={true}
                                accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .7z"
                            />
                            <i className='bx bx-copy-alt fs-18 mr-2 ml-2 text-grey-6'></i>
                            <span className="mr-2 file-version-text">{t("task.attachment.file.version")}</span>
                            <InputText
                                className={classNames({ "dense file-version": true, "p-invalid": CommonFunction.isEmpty(file.versionNo) })}
                                value={file.versionNo}
                                onChange={e => applyChange(fileIndex, "versionNo", e.target.value)} />
                        </div>

                    </div>

                    {/* template impact actions */}
                    <div className="document-action flex align-items-center justify-content-center">
                        <Tooltip content={t("task.attachment.apply-edit")} target=".button-link-apply-edit-file" position="bottom"></Tooltip>
                        <i className='bx bx-check link-button text-green button-link-apply-edit-file' onClick={() => applyEditFile(fileIndex)}></i>
                        <Tooltip content={t("task.attachment.cancel-edit")} target=".button-link-cancel-edit-file" position="bottom"></Tooltip>
                        <i className='bx bx-undo link-button text-grey-7 button-link-cancel-edit-file' onClick={() => cancelEditFile(fileIndex)}></i>
                    </div>
                </>}
            </div>
        )
    }

    const toolbarRenderer = () => {
        return (
            <XToolbar
                className="p-0 mb-2"
                left={() => (
                    <div className="p-2">
                        {!CommonFunction.isEmpty(task.id) &&
                        <Button icon="bx bx-plus" label={t("task.attchment.add")} onClick={addFile} />
                        }
                        {!CommonFunction.isEmpty(task.id) && props.showSign &&
                        <Button icon="fas fa-signature" label={t("task.attchment.sign")} onClick={signFiles} />
                        }
                    </div>
                )}
            >
            </XToolbar>
        )
    }

    return (<>
        <LoadingBar loading={loading} top={46} />
        <div className="task-detail-attachment w-full pr-2">
            {toolbarRenderer()}

            {documentCount[Enumeration.workflow_document_type.template] > 0 && (
                <>
                    <div className="attachment-group header-group">
                        <i className='bx bxs-folder-open'></i>
                        <span className="bold-and-color">{t("task.documents")}</span>
                    </div>

                    {documents.length > 0 && documents.map((file, fileIndex) => (
                        <React.Fragment key={fileIndex}>
                            {file.type === Enumeration.workflow_document_type.template && fileRenderer(file, fileIndex)}
                        </React.Fragment>
                    ))}
                </>
            )}

            {documentCount[Enumeration.workflow_document_type.reference] > 0 &&
                <>
                    <div className="attachment-group header-group">
                        <i className='bx bxs-folder-open'></i>
                        <span className="bold-and-color">{t("task.reference")}</span>
                    </div>

                    {documents.map((file, fileIndex) => (
                        <React.Fragment key={fileIndex}>
                            {file.type === Enumeration.workflow_document_type.reference && (
                                <div className="attachment-group reference-item">

                                    <Tooltip content={`${t("workflow.doc.download")} ${file.name}`} target={`.download-file-info-${fileIndex}`} position="bottom"></Tooltip>
                                    <div className=" document-info flex flex-column border-left border-right h-full">
                                        <div className="flex flex-column ml-1">
                                            <span className={classNames({ "file-code ": true, "mark-require": file.isRequire })}><b>{file.code}</b> - {file.description}</span>
                                            <div className="flex">
                                                <img className="file-icon mr-1" src={file.icon}></img>
                                                <div className="flex flex-column mt-1">
                                                    <div className="flex align-items-center">
                                                        <i className='bx bx-file-blank fs-18 mr-2 text-grey-7'></i>
                                                        <Tooltip content={t("task.attachment.preview")} target=".button-link-preview-file" position="bottom"></Tooltip>
                                                        <span className="link-button text-blue button-link-preview-file" onClick={() => viewFile(file)}>{file.file.name}</span>
                                                        <Tooltip content={t("task.attachment.download")} target=".button-link-download-file" position="bottom"></Tooltip>
                                                        <i className='bx bx-download fs-18 mr-2 ml-2 link-button text-green button-link-download-file' onClick={() => CommonFunction.downloadFile(file.file.id)}></i>
                                                    </div>
                                                    <div className="flex align-items-center mt-1">
                                                        <i className='bx bx-user fs-18 mr-2 text-grey-7'></i>
                                                        <span>{t("task.attachment.file.create-by")}: </span>
                                                        <Chip
                                                            label={file.user.fullName}
                                                            image={CommonFunction.getImageUrl(file.user.avatar, file.user.fullName)}
                                                            className="tiny ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </>
            }

            <div className="attachment-group header-group">
                <i className='bx bxs-folder-open'></i>
                <span className="bold-and-color">{t("task.moreDocuments")}</span>
            </div>

            {documentCount.totalAddition === 0 &&
                <div className="attachment-group empty-additional-item">
                    <EmptyDataCompact message={t("task.attachment.empty-additional")} className="border-left pt-1 pb-1 pl-2" size={22} />
                </div>
            }

            {documentCount.totalAddition > 0 && documents.map((file, fileIndex) => (
                <React.Fragment key={fileIndex}>
                    {(file.type === Enumeration.workflow_document_type.inTask || file.type === Enumeration.workflow_document_type.inRequest) && fileRenderer(file, fileIndex)}
                </React.Fragment>
            ))}


        </div>

        {documentCount.total > 4 && toolbarRenderer()}

        <TaskDetailAttachmentDetail ref={refTaskDetailAttachmentDetail} task={task} />
    </>);
}

TaskDetailAttachment = forwardRef(TaskDetailAttachment);

export default TaskDetailAttachment;

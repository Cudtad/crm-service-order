import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import CommonFunction from '@lib/common';
import _ from "lodash";
import './scss/TaskCheckList.scss'


import {Dialog} from "primereact/dialog";
import TaskService from "services/TaskService";
import {FileUpload} from "primereact/fileupload";
import {Tag} from "primereact/tag";
import "./scss/TaskDocument.scss"
import {Dropdown} from "primereact/dropdown";
import {Fieldset} from "primereact/fieldset";
import FileApi from "services/FileApi";
import appSettings from 'appSettings';

function TaskDocument (props, ref) {
    const t = CommonFunction.t;

    const [totalSize, setTotalSize] = useState(0);
    const [items, setItems] = useState([]);
    const [task, setTask] = useState({});
    const [rowIndex, setRowIndex] = useState(0);
    const [enableDialog, setEnableDialog] = useState(false);
    const postRef = useRef();
    const fileUploadRef = useRef();

    const docType = [
        {
            code: 'in-task',
            name: t('doc.in.task')
        },
        {
            code: 'in-request',
            name: t('doc.in.request')
        },
        {
            code: 'template',
            name: t('doc.template')
        },
        {
            code: 'reference',
            name: t('doc.reference')
        }
    ];

    const m = {
        ADD: 'ADD',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    }

    let emptyDocument = {
        rowIndex : 0,
        id : 0,
        taskId : 0,
        fileId : "",
        type : "",
        name : "",
        versionNo: "",
        description : "",
        action : 'ADD'
    }

useImperativeHandle(ref, () => ({
    openDialog: (_items, _task) => {
        let _rowIndex = rowIndex;

        _items.map((_item) => {
            _rowIndex = _rowIndex + 1;
            _item.rowIndex = _rowIndex;
            _item.action = 'UPDATE';
        })

        if(_items.length === 0){
            let _emptyDocument = emptyDocument;
            _items.push(_emptyDocument);
        }

        setRowIndex(_rowIndex);
        setItems(_items)
        setTask(_task);
        setEnableDialog(true);
    },

    hideDialog: () => {
        hideDetail();
    }
}))

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () =>{
        let _rowIndex = rowIndex;
        items.map((_item) => {
            _rowIndex = _rowIndex + 1;
            _item.rowIndex = _rowIndex;
            _item.action = 'UPDATE';
        })
        setRowIndex(_rowIndex);
    }

    const submitDocument = async () => {
        let _items = [...items];
        try{
            var fileChange = false;
            let _newItem = []
            Promise
                .all((function* (){
                    for(let _item of _items){

                        yield new Promise(resolve => {
                            if(_item.file && _item.file instanceof File){
                                fileChange = true;
                                 FileApi.uploadFiles({folder: task.id, files: _item.file}).then(res =>{
                                    let _response = res;
                                    if(_response && _response.length > 0){
                                        let _updated = TaskService.uploadDocument({
                                            id: _item.id,
                                            fileId: _response[0].id,
                                            name: _response[0].name,
                                            type: _item.type,
                                            taskId: task.id,
                                            versionNo: _item.versionNo,
                                            description: _item.description,
                                            action: _item.action
                                        });
                                        _item.id = _updated.id;
                                        _item.taskId = task.id;
                                        _item.file.id = _response[0].id;
                                        _item.name = _response[0].name;
                                        _item.user = props.userLogin;
                                    }
                                     resolve("");
                                })
                            }
                            else
                            {
                                TaskService.uploadDocument({id: _item.id,
                                    name: _item.name,
                                    type: _item.type,
                                    taskId: task.id,
                                    versionNo: _item.versionNo,
                                    description: _item.description,
                                    action: _item.action});
                                resolve("");
                            }

                        })
                    }

                })())
                .then(() => {
                    _.remove(_items, function(_item){
                       return _item.action === m.DELETE
                    });
                    console.log('xxx',_items);
                    setItems(_items);
                }).finally(  () => {
                     TaskService.getDocumentsByTask(task.id).then(res => {
                         props.doReload(task.id, res);
                    });
                    CommonFunction.toastSuccess(t("save.successful"));
                    hideDetail();
                });
        } catch(error) {
            console.log(error)
        }
    }
    const applyItemChange = (_item, prop, val) => {
        let _items = [...items]

        if (_item) {
            let _index = _item.rowIndex;

            switch (prop) {
                case "name":
                    _.find(_items, {'rowIndex': _index}).name = val;
                    break;
                case "versionNo":
                    _.find(_items, {'rowIndex': _index}).versionNo = val;
                    break;
                case "type":
                    _.find(_items, {'rowIndex': _index}).type = val;
                    break;
                case "description":
                    _.find(_items, {'rowIndex': _index}).description = val;
                    break;
                default:
                    break;
            }
            setItems(_items);
        }

        // props.onChange( _checkList)
    };

    const addTaskDocument = () =>{

    }

    const inputName = (item, index) => {
        return (
            <>
                <InputText id={"name" + index} value={item.name}
                           // disabled={props.disabled}
                           
                           onChange={(e) => applyItemChange(item, 'name', e.target.value)} />
            </>
        );
    };

    const inputVersion = (item, index) => {
        return (
            <>
                <InputText id={"version" + index} value={item.versionNo}
                    // disabled={props.disabled}
                           
                           onChange={(e) => applyItemChange(item, 'versionNo', e.target.value)} />
            </>
        );
    };

    const inputFile = (item, index) => {
        return (
            <>
                <InputText id={"file_" + index} value={item.type}
                    // disabled={props.disabled}
                           className="dense mr-4 action-duration"
                           onChange={(e) => applyItemChange(item, 'type', e.target.value)} />
            </>
        );
    };

    const inputType = (item, index) => {
        return (
            <>
                <Dropdown id={"type_" + index} value={docType.find(e => e.code === item.type)}
                          options={docType}
                          style={{width: '150px'}}
                          opntionValue="code" optionLabel="name"
                          onChange={(e) => applyItemChange(item,'type', e.value.code)}
                />

                {/*<InputText id={"type_" + index} value={item.type}*/}
                {/*           // disabled={props.disabled}*/}
                {/*           className="dense mr-4 action-duration"*/}
                {/*           onChange={(e) => applyItemChange(item, 'type', e.target.value)} />*/}
            </>
        );
    };

    const inputDescription = (item, index) => {
        return (
            <>
                <InputText id={"description" + index} value={item.description}
                           // disabled={props.disabled}
                           className="dense mr-4 action-duration"
                           onChange={(e) => applyItemChange(item, 'description', e.target.value)} />
            </>
        );
    };

    const addRow = (e) => {
        // Generate new key of new item
        let _emptyDocument = emptyDocument;
        setRowIndex(prevState => (prevState + 1));
        _emptyDocument.rowIndex = rowIndex + 1;

        setItems([...items, _emptyDocument]);
    }

    const deleteRow = (_removedItem) => {
        let _items = [...items];
        let _index = _removedItem.rowIndex;

        if(_removedItem.id != 0){
            _.find(_items, {'rowIndex': _index}).action = m.DELETE;
        }else{
            _.remove(_items, function(obj){
                return obj.rowIndex === _removedItem.checkItemRowIndex;
            })
        }

        setItems(_items);

        // Pass new value into Parent Component through Event onChange
        // props.onChange(_checkList)
    }

    const hideDetail = () => {
        setEnableDialog(false);
    }

    const onTemplateSelect = (e, _item) => {
        let _items = [...items]

        if(_item){
            let _index = _item.rowIndex;
            _.find(_items, {'rowIndex': _index}).file = e.files[0];
        }

        setItems(_items);

        console.log(_items);
    }

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    }

    const onTemplateUpload = (e) => {
        let _totalSize = 0;
        console.log('onTemplateUpload upload history xxxxx', e);
        e.files.forEach(file => {
            _totalSize += (file.size || 0);

        });

        setTotalSize(_totalSize);
    }

    const onUploadHandler = (files) => {
        let _totalSize = 0;
        console.log('onUploadHandler upload history xxxxx', files);
        _.forEach(files, function(file){
            console.log('file : ', file)
        });

        setTotalSize(_totalSize);
    }


    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        return (
            <div className={className} style={{backgroundColor: 'transparent', display: 'flex', alignItems: 'center'}}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
            </div>
        );
    }

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center p-dir-col">
                <i className="pi pi-image mt-3 p-p-5" style={{'fontSize': '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)'}}></i>
                <span style={{'fontSize': '1.2em', color: 'var(--text-color-secondary)'}} className="p-my-5">Drag and Drop Image Here</span>
            </div>
        )
    }

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center p-flex-wrap">
                <div className="flex align-items-center" style={{width: '40%'}}>
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                    <span className="flex p-dir-col p-text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                        {file.taskDocumentId}
                        <Tag value={props.formatSize} severity="warning" />
                    </span>
                </div>
                <div className="px-3 py-2" style={{width: '40%'}}>
                    {inputType(file.document, "")}

                    {inputName(file.document, "")}

                    {inputDescription(file.document, "")}
                </div>
                <Button type="button" icon="bx bx-x" className="p-button-outlined p-button-rounded p-button-danger p-ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        )
    }
    const chooseOptions = {icon: 'bx bx-upload', iconOnly: true, className: 'p-button-primary'};
    const uploadOptions = {icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'};
    const cancelOptions = {icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'};


    return (
       <Dialog
            // header={getDialogHeader}
            // header={header}
            visible={enableDialog}
            modal
            style={{width: '60%', height: '100%'}}
            position="right"
            // maximized={true}
            // footer={dialogFooterTemplate}
            onHide={hideDetail}
            footer={
                <>
                    <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={(hideDetail)} />
                    <Button label={t('common.save')} icon="bx bx-save" className="p-button-text" onClick={submitDocument} />
                </>
            }
           >
           <div className="p-fluid fluid  task-document">
               <Fieldset className="activity-automatic mb-2 pb-0" legend={t(`task.document.list`)} toggleable>
                   { items.length === 0 &&
                   <div className="add-automatic text-green-9" onClick={addTaskDocument}>
                       <i className="bx bx-plus"></i>
                       <span>{t("workflow.activity.event.add")}</span>
                   </div>
                   }

                   { items.length > 0 &&
                   items.map((_item, index) => {
                       if(_item.action && _item.action != m.DELETE)
                       {
                           return (
                           <div key={index} className="flex flex-column">
                               <div className="flex mb-2">
                                   <FileUpload ref={fileUploadRef} mode="basic"
                                               className="pr-2"
                                               onUpload={onTemplateUpload}
                                               onSelect={(e) => onTemplateSelect(e, _item)}
                                               customUpload = {true}
                                               uploadHandler={onUploadHandler}
                                               uploadLabel={t("file")}
                                               chooseOptions={chooseOptions}/>
                                    {_item.file &&
                                    <a href={`${appSettings.api.url}/storage/file/download/${_item.file.id}`}>
                                       {_item.file.name} ({_item.file.contentType})
                                    </a>
                                    }
                               </div>
                               <div className="flex align-items-center activity-actions mb-2" >
                                   <span className="p-float-label" style={{width: '150px'}}>
                                        {inputType(_item, _item.checkItemRowIndex + "-" + _item.checkItemId)}
                                           <label>{t(`type`)}</label>
                                   </span>
                                   <span className="p-float-label" style={{width: '200px'}}>
                                       {inputVersion(_item, _item.checkItemRowIndex + "-" + _item.checkItemId)}
                                       <label>{t(`version`)}</label>
                                   </span>
                                   <span className="p-float-label" style={{width: '300px'}}>
                                       {inputDescription(_item, _item.checkItemRowIndex + "-" + _item.checkItemId)}
                                       <label>{t(`description`)}</label>
                                    </span>
                                   <i className='bx bx-x text-red-9' onClick={() => deleteRow(_item)}></i>
                               </div>
                           </div>

                       )
                       }})
                   }
                   <div className="activity-actions ">
                    <i className=' bx bx-plus text-green-9' onClick={addRow}></i>
                   </div>
               </Fieldset>

           </div>
        </Dialog>
    );
}

TaskDocument = forwardRef(TaskDocument);

export default TaskDocument;

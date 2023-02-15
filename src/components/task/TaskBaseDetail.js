import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from "react";
import { Button } from "primereact/button";

import { Dialog } from "primereact/dialog";
import CommonFunction from '@lib/common';

import { Checkbox } from "primereact/checkbox";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { InputText } from "primereact/inputtext";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { GroupDropdown } from "components/autocomplete/GroupDropdown";
import UserApi from "services/UserService";
import TaskBaseApi from "services/TaskBaseApi";
import _ from "lodash";
import { XLayout, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XTodo from "components/x-todo/XTodo";
import Enumeration from '@lib/enum';
import { UserAutoComplete } from '@ui-lib/x-autocomplete/UserAutoComplete';
import "./scss/TaskBaseDetail.scss";
import { Task_History } from "./components/Task_History";
import Task_Attachment from "./components/Task_Attachment";
import { OverlayPanel } from "primereact/overlaypanel";
import Task_State from "./components/Task_State";
import classNames from "classnames";
import Task_Comments from "@ui-lib/x-task/Task_Comments";
import XEditor from '@ui-lib/x-editor/XEditor';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import WorkLogTask from "../autocomplete/WorkLogTask";

/**
 * props:
 *      entityName: "" // entity's name
 *      defautData: () => ( { task: {}, involves: [] } ): function return default task object
 *      toolbar: { left: () => (<></>), center: () => (<></>), right: () => (<></>) } : custom toolbar
 *      dialog: true, // render dialog or not, default true
 *
 *      modules: [{ "base_info", "checklist", "attachment", "sub_task", "comment", "history"  }] // modules config
 *      modulesDefinition: {
 *          entity_info: {
 *              title: "" // module title
 *              icon: "" // module icon
 *              renderer: async () => (<></>) // define custom modules
 *          }
 *      }
 *
 *      allowSign: false // allow sign attachment, default - false
 *
 *      beforeChange: async (type, prop, newValue, oldValue, currentObject) => { return true; } : before change data, return boolean, if false, change will not be applied
 *      afterChange: async (type, newObject) => {} : after change
 *
 *      beforeSubmit: async (editMode, task) => { return [true, task]; }: before submit data, return boolean, if false, change will not be applied, return allow submit and task
 *      afterSubmit: async (editMode, responseAfterSubmit) => {}: aftersubmit response submit
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function TaskBaseDetail(props, ref) {

    const t = CommonFunction.t;
    const {
        entityName, application, refType, refTypeInternal,
        groups, defautData, toolbar, onHide,
        beforeChange, afterChange, beforeSubmit, afterSubmit,
        modules, modulesDefinition, dialog, disableToolbar,
        className, multipleUsers, readOnly, mode
    } = props;

    const entityApplication = application || "task-base";
    const entityRefType = refType || "task_base";
    const entityRefTypeInternal = refTypeInternal || "task_base";
    const entityModules = modules || ["base_info", "checklist", "attachment", "sub_task", "comment", "history"];
    const { user } = props;
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const dialogId = `task-dialog-${CommonFunction.getIdNumber()}`
    const refDescription = useRef(null);
    const refChangeStageMenu = useRef(null);
    const refEditMode = useRef(null);

    const defaultErrors = {
        task: {
            name: ""
        },
        involves: {
            RESPONSIBLE: ""
        }
    }
    const [errors, setErrors] = useState(defaultErrors);
    const refBasicInfoErrors = useRef([]); // contains all error message

    // task and task's components state
    const [task, setTask] = useState(null);
    const [taskDescription, setTaskDescription] = useState("");
    const [involves, setInvolves] = useState(null);
    const [checklist, setChecklist] = useState([]);
    const refTodo = useRef(null);
    const refAttachments = useRef(null);
    const refWorkLog = useRef(null);

    // comments
    const refCommentHistories = useRef(null);

    useImperativeHandle(ref, () => ({
        /**
         * show dialog
         */
        show: () => {
            setShow(true);
        },

        /**
         * hide dialog
         */
        hide: () => {
            setShow(false);
            if (refAttachments.current) {
                refAttachments.current.reload();
            }
        },
        reloadAttachment: () => {
            if (refAttachments.current) {
                refAttachments.current.reload();
            }

        },

        /**
         * create
         */
        create: () => {
            create();
        },

        /**
         * update
         * @param {*} _task if task is object, binding data to component, else _task is id, update task by id
         */
        update: (_task) => {
            if (_task && typeof _task === "object") {
                refEditMode.current = Enumeration.crud.update;
                bindingDataToComponent(_task); // _task is object task or object entity

                setTimeout(() => {
                    setShow(true);
                }, 200);

            } else {
                update(_task); // _task is task's id
            }
        },

        /**
         * get task
         */
        get: async () => {
            return await combineTaskInfos();
        },

        /**
         * set task
         */
        set: () => {

        },

        /**
         * get edit mode
         * @returns
         */
        getEditMode: () => {
            return refEditMode.current;
        },

        /**
         * set loading
         * @param {*} loading
         */
        setLoading: (loading) => {
            setLoading(loading || false);
        },

        /**
         * validate
         * @returns
         */
        validate: () => {
            return prepareTaskBeforeSubmit();
        },

        /**
         * submit modules
         * @param {*} _task
         * @returns
         */
        submitModules: async (_task) => {
            return await submitModules(_task);
        }
    }))

    /**
     * prepare involve
     * @param {*} _involves
     * @returns
     */
    const prepareInvolve = (_involves) => {
        let _involvesObject = {};
        if (_involves && _involves.length > 0) {
            _involves.forEach(involve => {
                _involvesObject[involve.role] = { ...involve };
            });
        }
        return _involvesObject;
    }

    /**
     * create
     */
    const create = () => {
        setErrors(defaultErrors);
        setLoading(true);

        refEditMode.current = Enumeration.crud.create;

        let _task = defautData && typeof defautData === "function" ? defautData() : {
            task: {
                name: "",
                description: "",
                startDate: CommonFunction.formatDateISO8601(new Date()),
                deadline: null,
                type: "TASK",
                important: false,
                review: false
            },
            involves: [{
                role: "RESPONSIBLE",
                involveType: "user",
                involveIds: [{
                    id: window.app_context.user.id,
                    fullName: window.app_context.user.fullName,
                    avatar: window.app_context.user.avatar,
                    status: true
                }]
            }]
        };

        // set states
        setTask(_task.task);
        setTaskDescription(_task.description);
        setInvolves(prepareInvolve(_task.involves));
        setLoading(false);
        setShow(true);
    }

    /**
     * update task
     */
    const update = (id) => {
        TaskBaseApi.get(id, "next-states").then(res => {
            refEditMode.current = Enumeration.crud.update;
            if (res) {
                setErrors(defaultErrors);
                setLoading(true);
                bindingDataToComponent(res);

                setTimeout(() => {
                    setShow(true);
                }, 200);

                setLoading(false);
            }
        })
    }

    /**
     * binding task to components
     */
    const bindingDataToComponent = (_task) => {
        // set task
        if (entityModules.indexOf("base_info") > -1) {

            if (_task.task && _task.task.groupId && typeof _task.task.groupId === "object" && _task.task.groupId.hasOwnProperty("id")) {
                _task.task.groupId = parseInt(_task.task.groupId.id);
            }

            setTask(_task.task);
            setTaskDescription(_task.task.description || "");
            setInvolves(prepareInvolve(_task.involves));
        } else {
            if (_task.task) {
                setTask({
                    id: _task.task.id,
                    type: _task.task.type
                })
            } else {
                setTask({});
            }
        }


        // binding for others components
        for (let i = 0; i < entityModules.length; i++) {
            const module = entityModules[i];
            if (module === "checklist") {
                setChecklist(_task.checklists);
            }
        }

        // load components if necessary
        if (_task.include && _task.include.length > 0) {
            _task.include.forEach(el => {
                switch (el) {
                    case 'comment':
                        CommonFunction.waitFor(() => refCommentHistories.current).then(() => {
                            refCommentHistories.current.get();
                        })
                        break;
                    default:
                        break;
                }
            });
        }

        if (refWorkLog && refWorkLog.current) {
            refWorkLog.current.loadItems(_task.task)
        }
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _task = _.cloneDeep(task);
        let canChange = true;

        // handle before change
        if (beforeChange && typeof beforeChange === "function") {
            canChange = await beforeChange("task", prop, _.cloneDeep(val), _.cloneDeep(_task[prop]), _.cloneDeep(_task));
        }

        if (canChange) {
            // change data
            switch (prop) {
                default:
                    break;
            }

            _task[prop] = val;
            validateBasicInfo([prop], _task)
            setTask(_task);

            // handle after change
            if (afterChange && typeof afterChange === "function") {
                canChange = await afterChange("task", _.cloneDeep(_task));
            }
        }
    }

    /**
     * validate
     * @param {*} props
     * @param {*} _task
     * @returns
     */
    const validateBasicInfo = async (props, _task) => {
        _task = _task || _.cloneDeep(task);
        let result = { ...errors }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result.task) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case "name":
                    result.task.name = _task.name.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let basicInfoErrors = []
        for (const property in result.task) {
            if (!CommonFunction.isEmpty(result.task[property])) {
                isValid = false;
                basicInfoErrors.push(result.task[property]);
            }
        }
        refBasicInfoErrors.current = basicInfoErrors;

        return isValid;
    };

    /**
     * apply involve changes
     * @param {string} prop
     * @param {*} val
     */
    const applyInvolvesChange = async (involveType, val) => {
        let _involves = _.cloneDeep(involves);
        let canChange = true;

        // handle before change
        if (beforeChange && typeof beforeChange === "function") {
            canChange = await beforeChange("involve", involveType, _.cloneDeep(val), _.cloneDeep(_involves[involveType].involveIds), _.cloneDeep(_involves));
        }

        if (canChange) {
            _involves[involveType].involveIds = val;
            validateInvolves([involveType], _involves);
            setInvolves(_involves);

            // handle after change
            if (afterChange && typeof afterChange === "function") {
                canChange = await afterChange("involve", _.cloneDeep(_involves));
            }
        }
    }

    /**
     * validate
     * @param {*} involveTypes
     * @param {*} _involves
     * @returns
     */
    const validateInvolves = async (involveTypes, _involves) => {
        _involves = _involves || _.cloneDeep(involves);
        let result = { ...errors }, isValid = true;

        // validate all props
        if (involveTypes.length === 0) {
            for (const property in result.involves) {
                involveTypes.push(property);
            }
        }

        // validate props
        involveTypes.forEach(involveType => {
            switch (involveType) {
                case "RESPONSIBLE":
                    result.involves.RESPONSIBLE = _involves.RESPONSIBLE.involveIds.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        for (const property in result.task) {
            if (!CommonFunction.isEmpty(result.task[property])) {
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    /**
     * combine all state into task
     */
    const combineTaskInfos = async () => {
        let [_task, isValid, errors] = await prepareTaskBeforeSubmit();

        return {
            editMode: refEditMode.current,
            isValid: isValid,
            errors: errors,
            task: _task
        };
    }

    /**
     * submit task
     * @param {*} _task
     */
    const submit = async (_task, callback) => {
        _task = _task || {
            task: _.cloneDeep(task)
        };
        let isValid = true,
            res = null,
            allErrors = null,
            editMode = refEditMode.current;

        // prepare data before submit
        [_task, isValid, allErrors] = await prepareTaskBeforeSubmit(_task);

        if (isValid) {
            setLoading(true);

            // call event
            let canSubmit = true;
            if (beforeSubmit && typeof beforeSubmit === "function") {
                [canSubmit, _task] = await beforeSubmit(editMode, _task);
            }

            // submit
            if (canSubmit) {

                switch (editMode) {
                    case Enumeration.crud.create:
                        // create task
                        res = await TaskBaseApi.create(_task);
                        if (res) {
                            // create success, change mode to update
                            refEditMode.current = Enumeration.crud.update;
                        }
                        break;
                    case Enumeration.crud.update:
                        // update task
                        res = await TaskBaseApi.update(_task);
                        break;
                    default:
                        break;
                }

                // submit modules
                let submitModulesResult = true;
                if (res) {
                    submitModulesResult = await submitModules(res);
                }

                if (res && submitModulesResult) {

                    // callback
                    if (callback && typeof callback === 'function') {
                        res = await callback(res);
                    }

                    // call event
                    if (afterSubmit && typeof afterSubmit === "function") {
                        await afterSubmit(editMode, res);
                    }

                    // get new task and change mode to update
                    update(res.task.id);

                    CommonFunction.toastSuccess(t("common.save-success"));
                }
            }
            setLoading(false);
        } else {
            CommonFunction.toastWarning(allErrors);
        }
    }


    /**
     * submit modules: attachments
     */
    const submitModules = async (_task) => {
        let success = true, reloadModules = [];

        for (let i = 0; i < entityModules.length; i++) {
            const _module = entityModules[i];

            if (_module === "attachment") {
                let attachmentSubmitResult = await submitAttachments(_task);
                success = attachmentSubmitResult;
                reloadModules.push(_module);
            }
        }

        // reload module data
        if (success && reloadModules.length > 0) {
            for (let i = 0; i < reloadModules.length; i++) {
                switch (reloadModules[i]) {
                    case "attachment":
                        refAttachments.current.reload();
                        break;
                    default:
                        break;
                }
            }
        }

        return success;
    }

    /**
     * submit attachments
     * @param {*} _task
     */
    const submitAttachments = async (_task) => {
        let _attachment = refAttachments.current.get();
        let refId = _task.task.id, application = entityApplication, refType = entityRefType, changedData = _attachment.changedData;

        // submit attachments
        let success = true;
        try {
            await Promise.all((function* () {
                for (let _attachment of changedData) {
                    yield new Promise((resolve, reject) => {

                        let _file = _attachment.file;
                        let _data = {
                            application: application,
                            refType: refType,
                            refId: refId,
                            name: _attachment.name,
                            versionNo: _attachment.versionNo,
                            description: _attachment.description,
                            businessType: _attachment.businessType
                        }

                        switch (_attachment.state) {
                            case Enumeration.crud.create:
                                TaskBaseApi.createAttachments(null, _file ? _file.fileContent : null, _data).then((res) => {
                                    if (!res) {
                                        success = false;
                                    }
                                    resolve("");
                                });
                                break;
                            case Enumeration.crud.update:
                                TaskBaseApi.updateAttachments(null, _attachment.id, _file.id ? null : _file.fileContent, _data).then((res) => {
                                    if (!res) {
                                        success = false;
                                    }
                                    resolve("");
                                });
                                break;
                            case Enumeration.crud.delete:
                                TaskBaseApi.deleteAttachments(null, _attachment.id, _file.id ? null : _file.fileContent, _data).then((res) => {
                                    if (!res) {
                                        success = false;
                                    }
                                    resolve("");
                                })
                                break;
                            default:
                                resolve("");
                                break;
                        }
                    })
                }
            })())
        } catch (error) {
            CommonFunction.toastError();
            success = false;
        }

        return success;
    }

    /**
     * prepare task before submit
     * @param {*} _task
     */
    const prepareTaskBeforeSubmit = async (_task) => {
        let isValid = true,
            allErrors = [];

        _task = _task || { task: _.cloneDeep(task) };

        // prepare others module
        for (let i = 0; i < entityModules.length; i++) {
            let module = entityModules[i], moduleErrors = [];

            if (module === "base_info") {
                [moduleErrors, _task] = await prepareBaseInfo(_task);
            } else if (module === "checklist") {
                [moduleErrors, _task] = prepareCheckList(_task);
            } else if (module === "attachment") {
                [moduleErrors, _task] = prepareAttachment(_task);
            }

            if (moduleErrors && moduleErrors.length > 0) {
                isValid = false;
                allErrors = allErrors.concat([...moduleErrors]);
            }
        }

        return [_task, isValid, allErrors];
    }

    /**
     * validate basic info
     */
    const prepareBaseInfo = async (_task) => {
        // validate to get errors
        await validateBasicInfo([]);

        // prepare task
        ["companyId", "responsibleId", "groupId"].forEach(editProps => {
            if (_task.task[editProps] && typeof _task.task[editProps] === "object" && _task.task[editProps].id) {
                _task.task[editProps] = _task.task[editProps].id;
            }
        });

        // description
        _task.task.description = taskDescription;

        // delete unneccesary properties
        ["createBy", "updateBy"].forEach(p => {
            if (_task.task.hasOwnProperty(p)) delete _task.task[p];
        });

        // prepare involves
        if (involves && Object.keys(involves).length) {
            let _involves = [];
            for (const involveType in involves) {
                _involves.push({
                    ...involves[involveType],
                    involveIds: involves[involveType].involveIds.map(m => m.id),

                });
            }
            _task.involves = _involves
        }

        return [refBasicInfoErrors.current, _task];
    }

    /**
     * validate check list
     */
    const prepareCheckList = (_task) => {
        let _checklists = refTodo.current.get();
        if (_checklists.valid) {
            _task.checklists = _checklists.data
        }

        return [_checklists.errors, _task];
    }

    /**
     * validate check list
     */
    const prepareAttachment = (_task) => {
        let _attachments = refAttachments.current.get();
        return [_attachments.errors, _task];
    }

    /**
     * change state
     * @param {*} state
     */
    const changeState = (state) => {
        // submit before change state
        submit(null, async (_task) => {
            // after submit success, call change state
            let res = await TaskBaseApi.changeState(_task.task.id, state);
            refChangeStageMenu.current.hide();
            return res;
        })
    }

    /**
     * render base task info
     * @returns
     */
    const renderBaseInfo = () => {
        return (<>
            <XLayout_Title className="task-block-title mt-0">
                <i className="bx bx-task"></i>
                {t("task.info")}
            </XLayout_Title>

            <div className="task-block-content">
                <div className="flex align-items-center mb-1">
                    {refEditMode.current !== Enumeration.crud.create && <>
                        <span className="mr-1">{t("task.state")} </span>
                        <Task_State state={task.state} className="border-all">
                            {t(`task.state.${task.state}`)}
                        </Task_State>
                    </>}
                </div>
                <div className="p-fluid fluid  formgrid grid p-0">
                    <div className="col-12">
                        <span className="p-float-label">
                            <InputText
                                value={task.name}
                                onChange={(e) => applyChange('name', e.target.value)}
                            />
                            <label className="require">{t("task.name")}</label>
                            {errors.task["name"] && <small className="p-invalid">{errors.task["name"]}</small>}
                        </span>
                    </div>
                    <div className="col-12">
                        <span className="p-float-label">
                            <GroupDropdown
                                filter
                                filterInputAutoFocus
                                showClear
                                filterBy="name"
                                id="task-detail-owner"
                                value={task.groupId}
                                listGroups={groups || []}
                                onChange={(e) => applyChange('groupId', e.target.value)}
                                optionLabel="name"
                                optionValue="id"
                            />
                            <label>{t("task.owner.task")}</label>
                        </span>
                    </div>
                    <div className="col-12">
                        <XEditor
                            ref={refDescription}
                            value={taskDescription}
                            onBlur={newContent => setTaskDescription(newContent)} // preferred to use only this option to update the content for performance reasons
                            config={{
                                placeholder: t("common.description"),
                                buttons: [
                                    'bold',
                                    'strikethrough',
                                    'underline',
                                    'italic', '|',
                                    'superscript', 'subscript', '|',
                                    'ul', 'ol', '|',
                                    'indent', 'outdent', '|',
                                    'align', 'font', 'fontsize', 'paragraph', '|',
                                    'image', 'table', 'link', '|',
                                ],
                                useSearch: false,
                                spellcheck: false,
                                showCharsCounter: false,
                                showWordsCounter: false,
                                showXPathInStatusbar: false,
                                height: 'auto',
                                minHeight: 40,
                                maxHeight: 400,
                                language: CommonFunction.getCurrentLanguage(),
                            }}
                        ></XEditor>
                    </div>
                    <div className="col-6">
                        <span className="p-float-label">
                            <UserAutoComplete
                                displayType="thumbnail"
                                multiple={multipleUsers ? multipleUsers : false}
                                value={involves && involves.RESPONSIBLE ? involves.RESPONSIBLE.involveIds : []}
                                groupIds={groups ? groups.map(m => m.id) : []}
                                excludeUserIds={involves && involves.RESPONSIBLE ? involves.RESPONSIBLE.involveIds.map(m => m.id) : []}
                                onChange={(value) => applyInvolvesChange('RESPONSIBLE', value)}
                            />
                            <label htmlFor="responsibleUsers">{t('task.responsibleUsers')}</label>
                            {errors.involves.RESPONSIBLE && <small className="p-invalid">{errors.involves.RESPONSIBLE}</small>}
                        </span>
                    </div>
                    <div className="col-6">
                        <XCalendar
                            showTime
                            label={t('common.startdate')}
                            value={task.startDate}
                            onChange={(e) => applyChange('startDate', e)}
                        />
                    </div>
                    <div className="col-6">
                        <XCalendar
                            showTime
                            label={t('common.deadline')}
                            value={task.deadline}
                            onChange={(e) => applyChange('deadline', e)}
                        />
                    </div>
                    <div className="col-12 flex align-items-center">
                        <div className="p-field-checkbox mb-0">
                            <Checkbox
                                inputId="chkImportant"
                                checked={task.important}
                                onChange={(e) => applyChange('important', e.checked)}
                            />
                            <label htmlFor="chkImportant">{t(`task.important`)}</label>
                        </div>
                    </div>
                </div>
            </div>
        </>)
    }

    /**
     * render checklist
     * @returns
     */
    const renderChecklist = () => {
        return (<>
            <XLayout_Title className="task-block-title">
                <i className="bx bx-list-check"></i>
                {t("task.todo")}
            </XLayout_Title>

            <div className="task-block-content">
                <XTodo
                    ref={refTodo}
                    allowAddGroup
                    allowEditGroup
                    allowDeleteGroup
                    allowAddItem
                    allowEditItem
                    allowDeleteItem
                    allowDeadline
                    allowDeadlineTime
                    allowAssign
                    assignQueryFn={async (paging) => {
                        let res = await UserApi.search({ filter: paging.search.toLowerCase() });
                        return {
                            page: res.page,
                            size: res.pageSize,
                            total: res.total,
                            data: res.content.map(u => ({
                                id: u.id,
                                fullName: u.fullName,
                                avatar: CommonFunction.getImageUrl(u.avatar, u.fullName)
                            }))
                        }
                    }}
                    // itemTemplate={(item) => (
                    //     <div className="whatever you like">{item.name}xxxxx</div>
                    // )}
                    data={checklist}
                ></XTodo>
            </div>
        </>)
    }

    /**
     * render attachment
     * @returns
     */
    const renderAttachment = () => {
        return (<>
            <XLayout_Title className="task-block-title">
                <i className="bx bx-paperclip"></i>
                {t("task.attachment")}
            </XLayout_Title>

            <div className="task-block-content">
                <Task_Attachment
                    mode={readOnly === true ? "view" : ''}
                    ref={refAttachments}
                    application={entityApplication}
                    refType={entityRefType}
                    taskId={task.id}
                    allowSign={refEditMode.current !== Enumeration.crud.create}
                ></Task_Attachment>
            </div>
        </>)
    }

    /**
     * render sub task
     * @returns
     */
    const renderSubTask = () => {
        return (<></>)
    }

    const renderComment = () => {
        if (refEditMode.current === Enumeration.crud.create) {
            return <></>
        } else {
            return (<>
                <XLayout_Title className="task-block-title">
                    <i className="bx bx-chat"></i>
                    {t("task.comment")}
                </XLayout_Title>

                <div className="task-block-content">
                    <Task_Comments
                        application={entityApplication}
                        refType={entityRefType}
                        ref={refCommentHistories}
                        refId={task.id}
                        type={task.type}
                        containerId={dialogId}
                        user={{
                            id: window.app_context.user.id,
                            name: window.app_context.user.fullName,
                            avatar: CommonFunction.getImageUrl(window.app_context.user.avatar, window.app_context.user.fullName)
                        }}
                    ></Task_Comments>
                </div>
            </>)
        }
    }

    const renderInternalComment = () => {
        if (refEditMode.current === Enumeration.crud.create) {
            return <></>
        } else {
            return (<>
                <XLayout_Title className="task-block-title">
                    <i className="bx bx-chat"></i>
                    {t("task.internal-comment")}
                </XLayout_Title>

                <div className="task-block-content">
                    <Task_Comments
                        application={entityApplication}
                        refType={entityRefTypeInternal}
                        ref={refCommentHistories}
                        refId={task.id}
                        type={task.type}
                        containerId={dialogId}
                        user={{
                            id: window.app_context.user.id,
                            name: window.app_context.user.fullName,
                            avatar: CommonFunction.getImageUrl(window.app_context.user.avatar, window.app_context.user.fullName)
                        }}
                    ></Task_Comments>
                </div>
            </>)
        }
    }

    const renderWorkLog = () => {
        if (refEditMode.current === Enumeration.crud.create) {
            return <></>
        } else {
            return (<>
                <div className="col-12" >
                    <WorkLogTask task={task} ref={refWorkLog} application={entityApplication}
                        taskEntity={task.type} rootType={task.rootType} rootId={task.rootKey} />
                </div>
            </>)
        }
    }
    /**
     * render history
     * @returns
     */
    const renderHistory = () => {
        if (refEditMode.current === Enumeration.crud.create) {
            return <></>
        }
        else {
            return (<>
                <XLayout_Title className="task-block-title">
                    <i className="bx bx-history"></i>
                    {t("task.history")}
                </XLayout_Title>
                <div className="task-block-content">
                    <Task_History taskId={task.id} application={application} type={task.type}></Task_History>
                </div>
            </>)
        }
    }

    /**
     * render custom module
     */
    const renderCustomModule = (module, index) => {
        // check valid module config
        let hasTitle = (module.icon || module.title);
        if (module.renderer && typeof module.renderer === "function" && module.visible !== false) {
            return (<>
                {hasTitle &&
                    <XLayout_Title className={classNames({
                        "task-block-title": true,
                        "mt-0": index === 0
                    })} >
                        <i className={module.icon || "bx bxs-component"}></i>
                        {module.title || "..."}
                    </XLayout_Title>
                }
                <div className={classNames({ "task-block-content": hasTitle })}>
                    {module.renderer()}
                </div>
            </>)
        }

        return <></>
    }

    /**
     * return content
     * @returns
     */
    const renderContent = () => {
        return (
            <>
                <XLayout>
                    {!disableToolbar && <XLayout_Top className="task-base-x-toolbar">
                        <XToolbar
                            left={toolbar && toolbar.left && typeof toolbar.left === "function" ? toolbar.left : () => (<>
                                <Button
                                    icon="bx bxs-save"
                                    tooltip={t('common.save')}
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => submit()}
                                />
                                {refEditMode.current !== Enumeration.crud.create && task["next-states"] && task["next-states"].length > 0 && <>
                                    <div className="x-toolbar-separator"></div>
                                    <Button label={t("task.change.state")} icon="bx bx-transfer-alt" onClick={(e) => refChangeStageMenu.current.toggle(e)} />
                                </>}
                            </>)}
                            center={toolbar && toolbar.center && typeof toolbar.center === "function" && toolbar.center}
                            right={toolbar && toolbar.right && typeof toolbar.right === "function" && toolbar.right}
                        ></XToolbar>
                    </XLayout_Top>}

                    <XLayout_Center className="task-blocks">
                        {entityModules.map((module, index) => (
                            <div key={index} className={`task-block module_${module}`}>

                                {module === "base_info" && renderBaseInfo()}

                                {module === "checklist" && renderChecklist()}

                                {module === "attachment" && renderAttachment()}

                                {module === "sub_task" && renderSubTask()}

                                {module === "comment" && renderComment()}

                                {module === "internal_comment" && renderInternalComment()}

                                {module === "history" && renderHistory()}

                                {module === "work_log" && renderWorkLog()}

                                {modulesDefinition && modulesDefinition[module] && renderCustomModule(modulesDefinition[module], index)}

                            </div>
                        ))}
                    </XLayout_Center>
                </XLayout >

                <OverlayPanel ref={refChangeStageMenu} className="x-menu">
                    {task && task["next-states"] && task["next-states"].map((s, index) => (
                        <div key={index} className="x-menu-button" onClick={() => changeState(s)}>
                            <i className={Enumeration.task.ui[s].icon}></i>
                            <span>{t(`task.state.${s}`)}</span>
                        </div>
                    ))}
                </OverlayPanel>
            </>
        )
    }
    const header = () => {
        if (mode === 'create') {
            return <span>{t('common.dialog.title.create').format(entityName || t("task").toLowerCase())}</span>
        }
        if (mode === 'update') {
            return <span>{t('common.dialog.title.update').format(entityName || t("task").toLowerCase())}</span>
        }
        if (mode === 'view') {
            return <span>{t('common.dialog.title.view').format(entityName || t("task").toLowerCase())}</span>
        }
    }
    if (!task) {
        return <></>;
    } else if (dialog === false) {
        return renderContent();
    } else {
        return (
            <Dialog
                id={dialogId}
                visible={show}
                header={header}
                contentClassName="p-0 position-relative"
                modal
                className={className || "wd-16-9"}
                onHide={() => {
                    if (onHide && typeof onHide === 'function') {
                        onHide(() => {
                            setShow(false);
                        });
                    } else {
                        setShow(false)
                    }
                }}
            >
                <LoadingBar loading={loading} />
                {renderContent()}
            </Dialog >)
    }

}

TaskBaseDetail = forwardRef(TaskBaseDetail);

export default TaskBaseDetail;

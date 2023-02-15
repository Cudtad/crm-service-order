import React, {forwardRef,  useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import classNames from "classnames";

import {Badge} from "primereact/badge";
import TaskService from "services/TaskService";
import CommonFunction from '@lib/common';
import {Dialog} from "primereact/dialog";
import {Dropdown} from "primereact/dropdown";
import {Toolbar} from "primereact/toolbar";
import {UserAC} from "../../../components/autocomplete/UserAC";
import {CalendarN} from "../../../components/calendar/CalendarN";

import _ from "lodash";
import "./scss/TaskDetail.scss"
import {InputTextarea} from 'primereact/inputtextarea';
import DynamicForm from "../../../components/dynamic-form/DynamicForm";
import Badges from '@ui-lib/badges/Badges';
import Enumeration from '@lib/enum';

function TaskDetailQuick(props, ref) {

    let emptyTask = {
        name: "",
        description: "",
        state: "",
        group: {},
        groupId: 0,
        userId: "",
        createBy: "",
        parentId: "",
        requestedBy: "",
        requestedByUser: {},
        requestedByUsers: [], //tempo
        deadline: null,
        startDate: null,
        closedOn: null,
        saveAsTemplate: false,
        important: false,
        repsonsibleUser: {},
        responsibleId: 0,
        responsibleUsers: [],
        responsibleIds: [],
        participantUsers: [],
        participantIds: [],
        observerUsers: [],
        observerIds: [],
        histories: [],
        checkList: []
    }

    let empTaskValidate = {
        name: "",
        description: ""
    }

    const t = CommonFunction.t;
    const { user } = props;

    const [fixGroup, setFixGroup] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [children, setChildren] = useState([])
    const [scope, setScope] = useState('TASK')
    const [documents, setDocuments] = useState([])
    const [references, setReferences] = useState([])
    const [selectedDocuments, setSelectedDocuments] = useState([])
    const [parentTask, setParentTask] = useState(null)
    const [userLogin, setUserLogin] = useState(null);
    const [task, setTask] = useState(emptyTask);
    const [addTaskRefs, setAddTaskRefs] = useState([]);
    const [addTaskRefType, setAddTaskRefType] = useState(null);
    const [taskValidate, setTaskValidate] = useState(empTaskValidate);
    const [groups, setGroups] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [toggleEditing, setToggleEditing] = useState(true);
    const [userLoginRole, setUserLoginRole] = useState(-1);
    const [validDateRange, setValidDateRange] = useState(null);
    const refSubTaskDetail = useRef();
    const refDynamicForm = useRef();


    const referenceTypes = [
        { name: t("task.dependency"), value: Enumeration.task_reference.dependency },
        { name: t("task.start_to_start"), value: Enumeration.task_reference.start_to_start },
        { name: t("task.start_to_finish"), value: Enumeration.task_reference.start_to_finish },
        { name: t("task.finish_to_start"), value: Enumeration.task_reference.finish_to_start },
        { name: t("task.finish_to_finish"), value: Enumeration.task_reference.finish_to_finish },
    ];

    const taskRole = {
        NO_ROLE: 0,
        OBSERVER: 1,
        CREATE_BY: 2,
        PARTICIPANT: 3,
        REQUESTER: 4,
        RESPONSIBLE: 5,
        ADMIN: 6,
    }

    const m = {
        CREATE: 'CREATE',
        EDIT: 'EDIT',
        COPY: 'COPY',
        MARK_IMPORTANT: 'MARK_IMPORTANT',
        ASSIGN: 'ASSIGN',
        ESCALATE: 'ESCALATE'
    }

    const type = {
        TASK: 'TASK',
        REQUEST: 'REQUEST'
    }

    const consState = {
        PENDING: 'PENDING',
        IN_PROGRESS: 'IN_PROGRESS',
        DEFERRED: 'DEFERRED',
        CANCELED: 'CANCELED',
        COMPLETED: 'COMPLETED',
        REVIEWING: 'REVIEWING',
        FAILED: 'FAILED',
        DONE: 'DONE'
    }

    // useEffect(() => {
    //     loadItems();
    // }, []);

    useEffect(() => {
        let _selectedDocuments = []
        _.forEach(documents, function (doc) {
            if (doc.currentWFDocument && doc.currentWFDocument.isSignRequire) {
                _selectedDocuments.push(doc)
            }
        });
        setSelectedDocuments(_selectedDocuments);
    }, [documents]);

    // const loadItems = () => {
    //     console.log("check list", task.checkList)
    //     _.forEach(task.checkList, function (checkList) {
    //         let _checkListRowIndex = checkListRowIndex;
    //         _checkListRowIndex = _checkListRowIndex + 1;
    //         checkList.checkItemRowIndex = _checkListRowIndex;

    //         setCheckListRowIndex(_checkListRowIndex);
    //     });
    // }


    useImperativeHandle(ref, () => ({

        /**
         * create task
         * @param {*} _userLogin
         * @param {*} _parentTask
         */
        createTask: (_userLogin, _parentTask, _groupId, _validDateRange) => {
            let _task = emptyTask;
            _task.workFlowId = 0;
            _task.activityId = 0;
            _task.type = 'TASK'
            _task.userId = _userLogin.id;
            _task.requestedBy = _userLogin.id;

            // default logged in user as requested by user
            let _requestedByUser = {
                userId: _userLogin.id,
                firstName: _userLogin.firstName,
                lastName: _userLogin.lastName,
                middleName: _userLogin.middleName,
                fullName: _userLogin.fullName,
                avatar: _userLogin.avatar
            };
            _task.requestedByUser = { ..._requestedByUser };
            _task.requestedByUsers.push({ ..._requestedByUser });
            if (_groupId) {
                _task.groupId = _groupId;
                setFixGroup(true);
            }
            applyGroups();
            setScope(type.TASK)
            setTaskValidate(empTaskValidate);
            setEditMode(m.CREATE);
            setToggleEditing(true);
            setShowTaskDetail(true);
            setUserLogin(_userLogin);
            setUserLoginRole(taskRole.CREATE_BY)
            setValidDateRange(props.validDateRange)

            if (_parentTask) {
                _task.parentId = _parentTask.id;
                setParentTask(_parentTask)
            }
            setTask(_task);
        },

        /**
         * copy task
         * @param {*} _userLogin
         * @param {*} _orgTask
         */
        copyTask: (_userLogin, _orgTask) => {
            applyGroups();
            let _task = _.cloneDeep(_orgTask);
            _task.workFlowId = 0;
            _task.activityId = 0;
            _task.parentId = 0;
            _task.userId = _userLogin.id;
            _task.requestedBy = _userLogin.id;
            _task.requestedByUser = {
                userId: _userLogin.id,
            };
            _task.requestedByUsers.push({
                userId: _userLogin.id,
            });

            _task.id = 0;
            _task.state = null;
            _.each(_task.checkList, function (_checkList, listIndex) {
                _task.checkList[listIndex].checkGroupId = 0;
                _task.checkList[listIndex].action = 'ADD';
                _.each(_checkList.checkItems, function (_checkItem, itemIndex) {
                    _task.checkList[listIndex].checkItems[itemIndex].checkItemId = 0;
                    _task.checkList[listIndex].checkItems[itemIndex].action = 'ADD';
                })
            })

            setTaskValidate(empTaskValidate);
            setEditMode(m.CREATE);
            setToggleEditing(true);
            setShowTaskDetail(true);
            setUserLogin(_userLogin);
            setUserLoginRole(taskRole.CREATE_BY)
            setValidDateRange(props.validDateRange)

            setTask(_task);
        },

        /**
         * edit task
         */
        editTask: async (_task, mode, _scope) => {
            let _userLogin = window.app_context.user;
            setUserLogin(_userLogin);
            _task.requestedByUsers = []
            _task.requestedByUsers.push(_task.requestedByUser)
            if (_scope) {
                console.log('scope', _scope);
                if (_scope === type.REQUEST) {
                    if (_task.parentId && _task.parentId != 0) {
                        let _parentTask = await TaskService.getByIdAndType(_task.parentId, type.REQUEST)
                        _task.parent = _parentTask;
                        setParentTask(_parentTask);
                    } else {
                        setParentTask({});
                    }
                }
            } else {
                if (_task.parentId && _task.parentId != 0) {
                    let _parentTask = await TaskService.getById(_task.parentId)
                    _task.parent = _parentTask;
                    setParentTask(_parentTask);
                } else {
                    setParentTask({});
                }
            }

            let _children = await TaskService.getChildren(_task.id);
            setChildren(_children);

            let _documents = await TaskService.getDocumentsByTask(_task.id);
            setDocuments(_documents);

            let _references = await TaskService.getReferences(_task.id);
            setReferences(_references)
            // setToggleEditing(false);

            let _userLoginRole = -1;
            if (_task.responsibleIds && _task.responsibleIds.length > 0) {
                _.forEach(_task.responsibleIds, function (ids) {
                    if (ids === _userLogin.id) {
                        _userLoginRole = taskRole.RESPONSIBLE;
                    }
                });
            }

            if (_userLoginRole === -1) {
                if (_task.requestedBy && _task.requestedBy === _userLogin.id) {
                    _userLoginRole = taskRole.REQUESTER;
                }
            }

            if (_userLoginRole === -1) {
                if (_task.participantIds && _task.participantIds.length > 0) {
                    _.forEach(_task.participantIds, function (ids) {
                        if (ids === _userLogin.id) {
                            _userLoginRole = taskRole.PARTICIPANT;
                        }
                    });
                }
            }

            if (_userLoginRole === -1) {
                if (_task.createBy && _task.createBy === _userLogin.id) {
                    _userLoginRole = taskRole.CREATE_BY
                }
            }

            if (_userLoginRole === -1) {
                if (_task.observerIds && _task.observerIds.length > 0) {
                    _.forEach(_task.observerIds, function (ids) {
                        if (ids === _userLogin.id) {
                            _userLoginRole = taskRole.OBSERVER;
                        }
                    });
                }
            }

            if (_userLoginRole === -1) {
                _userLoginRole = taskRole.NO_ROLE;
            }

            // set states
            applyGroups();
            setTask(_task)
            setScope(_scope ? _scope : type.TASK)
            setUserLoginRole(_userLoginRole);
            setEditMode(mode);
            setValidDateRange(props.validDateRange)
            setShowTaskDetail(true)
        },
    }));



    /**
     * set groups
     */
    const applyGroups = () => {
        setGroups(props.groups);
    }

    const applyTaskRef = async (prop, val) => {
        let _addTaskRefs = _.cloneDeep(addTaskRefs)
        switch (prop){
            case "task":
                if (val) {
                    if (val.length > 0) {
                        _addTaskRefs = [val[val.length - 1]];
                    } else {
                        _addTaskRefs = [];
                    }
                }
                break;
            default:
                break;
        }
        setAddTaskRefs(_addTaskRefs);
    }
    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyTaskChange = (prop, val) => {
        let _task = _.cloneDeep(task);
        switch (prop) {
            case "group":
                _task.groupId = val;
                // console.log('applychange', val);
                break;
            case "requestedByUsers":
                /** process convert list to one **/
                if (val.length > 0) {
                    if (val.length > 1) {
                        val.shift();
                    }
                    _task.requestedBy = val[0].id;
                    _task.requestedByUser = val[0];
                } else {
                    _task.requestedBy = null;
                    _task.requestedByUser = null;
                    _task.requestedByUsers = [];
                }

                break;
            case "responsibleUsers":
                if (editMode != m.CREATE) {
                    if (val.length > 0) {
                        if (val.length > 1) {
                            CommonFunction.toastWarning(t("task.update.can.assign.one.people"))
                            val.shift();
                        }
                        _task.responsibleUsers = val;
                    } else {
                        _task.responsibleUsers = [];
                    }
                }
                _task.responsibleIds = val.map(m => m.id);
                break;
            case "participantUsers":
                _task.participantIds = val.map(m => m.id);
                break;
            case "observerUsers":
                _task.observerIds = val.map(m => m.id);
                break;
            default:
                break;
        }

        _task[prop] = val;
        setTask(_task);
    }

    const cancel = () => {
        setShowTaskDetail(false);
    }

    const createReferenceTask = () => {
        refSubTaskDetail.current.createReferenceTask(userLogin, task);
    }

    const submitTask = async (showAfterSubmit, callback) => {
        let _task = { ...task };

        // validate
        let isValid = performValidateTask([]);
        if(props.groupRequire && (!_task.groupId || _task.groupId <= 0)){
            CommonFunction.toastWarning(t("task-require-group"));
            isValid = false;
        }
        if(props.deadlineRequire && (!_task.deadline)){
            CommonFunction.toastWarning(t("task-require-deadline"));
            isValid = false;
        }
        if(validDateRange && parentTask && parentTask.startDate && parentTask.deadline){
            let _currStartDate = new Date(_task.startDate ? _task.startDate : new Date());
            let _currDeadline = new Date(_task.deadline);
            let _parentStartDate = new Date(parentTask.startDate);
            let _parentDeadline = new Date(parentTask.deadline);
            if(_currStartDate < _parentStartDate || _currDeadline > _parentDeadline){
                CommonFunction.toastWarning(t("sub-task-timeline-must-be-in-parent-task-time-line"));
                isValid = false;
            }
        }
        // submit
        if (isValid) {
            setBtnLoading(true);
            // call api
            try {
                // after submit documents
                switch (editMode) {
                    case m.CREATE:
                        let _createdTask = await TaskService.create(_task);
                        if(_createdTask.id){
                            if(addTaskRefs && addTaskRefs.length > 0){
                                if(addTaskRefs[0].id){
                                    await TaskService.addReference({
                                        referenceType: addTaskRefType
                                        , fromTaskId: addTaskRefs[0].id
                                        , toTaskId: _createdTask.id
                                    });
                                }
                            }
                        }


                        _task = _.cloneDeep(_createdTask)

                        // setToggleEditing(false);
                        if (props.tasks) {
                            props.tasks.unshift(_task)
                        }
                        _task = { ..._createdTask }
                        break;
                    default:
                        break;
                }

                if (callback) { callback(_task); }
                else { setTask(_task); setBtnLoading(false) }

                // callback on submit task
                if (props.onSubmitTask) {
                    props.onSubmitTask(_task, editMode);
                }

                // close after submit
                if (!showAfterSubmit) {
                    cancel();
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const performValidateTask = (props) => {
        var result = { ...taskValidate }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case "name":
                    result[prop] = task.name.length > 0 ? null : t("name-can-not-be-empty");
                    break;
                default:
                    break;
            }
        });

        // set state
        setTaskValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }
        return isValid;
    };

    const getDialogHeader = () => {
        return (
            <Toolbar className="task-toolbar"
                left={
                    <React.Fragment>

                    </React.Fragment>
                }
                right={
                    <React.Fragment>
                        {dialogFooterTemplate()}
                    </React.Fragment>
                }>
            </Toolbar>
        );
    };


    const dialogFooterTemplate = () => {
        return (

                <Button loading={btnLoading}
                        tooltip={t('common.save-close')} tooltipOptions={{ position: 'top' }}
                        icon="bx bxs-save" className="p-button-primary pr-2" onClick={() => submitTask(false)} />
        )
    };


    /**
     * scroll to
     * @param {*} elm
     */
    const scrollTo = (elm) => {
        let container = document.querySelector("#task-detail-container"),
            element = document.querySelector(`#${elm}`);

        CommonFunction.scrollTo(container, element);
    };

    return (
        <Dialog
            // header={getDialogHeader}
            showHeader={false}
            visible={showTaskDetail}
            contentClassName="p-0"
            className="task-window-detail"
            id="task-detail-window"
            style={{ height: "70vh", width: "50%", minWidth: "600px" }}
            modal
            footer={getDialogHeader}
            onHide={() => { }}
        >
            <div className="task-close-button" onClick={cancel}>
                <i className='bx bx-x'></i>
            </div>
            <div className="task-panel flex flex-column overflow-hidden">

                {/* task title */}
                <div className="flex align-items-center">
                    <i className='bx bx-task task-icon'></i>
                    <InputText
                        className={classNames({ "task-title": true, "p-invalid": taskValidate.name })}
                        value={task.name}
                        placeholder={t("task.task-name-placeholder")}
                        onChange={(e) => applyTaskChange('name', e.target.value)}
                        onBlur={(e) => performValidateTask(["name"])} />

                </div>

                <div className="flex-panel">
                    <div className="flex-left-panel pr-2" id="task-detail-container">
                        <div id="task-navigator-info">
                            <div className="task-state-and-workflow-info pt-1-5 mb-1 mr-1">

                                {/* task state */}
                                {task.state &&
                                    <Badges
                                        span
                                        pill
                                        className={classNames({
                                            "mr-2": true,
                                            "text-orange bg-orange-1": task.state === "PENDING",
                                            "text-green bg-green-1": task.state === "IN_PROGRESS",
                                            "text-red-9 bg-red-1": task.state === "DEFERRED",
                                            "text-red bg-red-1": task.state === "CANCELED",
                                            "text-blue bg-blue-1": task.state === "COMPLETED",
                                            "text-purple bg-purple-1": task.state === "REVIEWING"
                                        })}
                                    >
                                        <div
                                            className="flex align-items-center width-fit-content pl-1 pointer"
                                            // onClick={(event) => menuChangeTaskState.current.toggle(event)}
                                            aria-controls="menu_change_task_state"
                                            aria-haspopup
                                        >
                                            {t("task.state." + task.state)}
                                            <i className='bx bxs-pencil ml-1' ></i>
                                        </div>
                                    </Badges>

                                }

                                {/* task important */}
                                <Badges
                                    span
                                    pill
                                    className={classNames({
                                        "bg-grey-3 text-grey-7": !task.important,
                                        "bg-orange-1 text-yellow-9": task.important
                                    })}
                                >
                                    <div
                                        className="flex align-items-center width-fit-content pl-1 pointer"
                                        onClick={() => applyTaskChange('important', !task.important)}
                                    >
                                        <i className={
                                            classNames({
                                                "dense mr-1": true,
                                                "bx bx-tag-alt ": !task.important,
                                                "bx bxs-tag-alt": task.important
                                            })}
                                        />
                                        {t("task.important")}
                                    </div>
                                </Badges>

                                {scope === type.REQUEST && task.workFlow &&
                                    <>
                                        <span className='bx bx-git-branch ml-2 mr-1 text-grey-6'></span>
                                        <span className="workflow-item-name">{task.workFlow.name}</span>
                                    </>}
                                {scope === type.REQUEST && task.activity &&
                                    <>
                                        <span className='bx bx-radio-circle-marked ml-1 mr-1 text-grey-6'></span>
                                        <span className="workflow-item-name">{task.activity.name}</span>
                                    </>}
                            </div>

                            {/* parent task */}
                            {(parentTask && parentTask.id && parentTask.id > 0 && scope != type.REQUEST) &&
                                <div className="subtask-container">
                                    <span className='bx bx-menu-alt-right text-grey-6 mr-1'></span>
                                    <span className="small">{`${t("task.child-task-of")}: ${parentTask.name}`}</span>
                                </div>
                            }
                        </div>

                        {/* TASK INFO */}
                        <div className="p-inputgroup mt-1 mb-1 pr-2">
                            <div className="p-inputgroup-addon flex align-items-center">
                                <i className="fas fa-user-shield mr-1"></i>
                                <span>{t('task.owner.task')}</span>
                            </div>

                            <Dropdown
                                filter
                                showClear
                                filterBy="name"
                                id="task-detail-owner"
                                value={task.groupId}
                                options={groups}
                                onChange={(e) => applyTaskChange('group', e.target.value)}
                                optionLabel="name"
                                optionValue="id"
                                className="dense w-full"
                                itemTemplate={(item) => {
                                    return (
                                        <div className="combo_task-page-search-group-item-container flex align-items-stretch overflow-hidden">
                                            <div className="flex align-items-center justify-content-center">
                                                <Badge
                                                    value={item.type}
                                                    className={classNames({
                                                        "mr-2": true,
                                                        "bg-orange": item.type === "org",
                                                        "bg-teal": item.type !== "org"
                                                    })} />
                                            </div>
                                            <div className="group-detail-content flex flex-column">
                                                <span className="bold-and-color">{item.name}</span>
                                                <small>{item.path}</small>
                                            </div>
                                        </div>
                                    )
                                }}
                            />

                        </div>

                        {/* DESCRIPTION, DYNAMIC FORM - CUSTOM FIELDS */}
                        <div className="flex mb-2 mt-2 align-items-center" id="task-navigator-description" >
                            <i className='bx bx-align-justify task-icon'></i>
                            <div className="task-content-header">{t("task.nav.description")}</div>
                        </div>

                        <div className="task-content-container mr-2 flex flex-column">

                            <InputTextarea
                                className="task-description mt-1"
                                placeholder={t("task.task-description-placeholder")}
                                value={task.description}
                                onChange={(e) => applyTaskChange('description', e.target.value)}
                            // onTextChange={(e) => applyTaskChange('description', e.htmlValue)}
                            />

                        </div>

                        <div className="task-content-container mt-2">
                            {task.outputFieldValues &&
                                <DynamicForm ref={refDynamicForm} customFields={task.outputFieldValues} />}
                        </div>

                        {/* DUE DATE */}
                        <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-due">
                            <i className='bx bx-timer task-icon' ></i>
                            <div className="task-content-header">{t("task.due")}</div>
                        </div>

                        <div className="task-content-container flex align-items-center">
                            <div title={t('common.startdate')}>
                                <i className="fas fa-hourglass-start task-icon mr-2"></i>
                                <CalendarN
                                    showTime
                                    monthNavigator
                                    yearNavigator
                                    // label={t('common.startdate')}
                                    placeholder={t('common.startdate')}
                                    hourFormat="24"
                                    className="task-time-input"
                                    style={{ width: "130px" }}
                                    value={task.startDate}
                                    onChange={(e) => applyTaskChange('startDate', e.target.value)} />
                            </div>
                            <div title={t('task.deadline')}>
                                <i className="fas fa-hourglass-end task-icon mr-2 ml-2"></i>
                                <CalendarN
                                    showTime
                                    monthNavigator
                                    yearNavigator
                                    // label={t('task.deadline')}
                                    placeholder={t('task.deadline')}
                                    hourFormat="24"
                                    className="task-time-input"
                                    style={{ width: "130px" }}
                                    value={task.deadline}
                                    onChange={(e) => applyTaskChange('deadline', e.target.value)} />
                            </div>
                            <div title={t('task.closedOn')}>
                                {
                                    task.state === consState.CANCELED || task.state === consState.COMPLETED ?
                                        <CalendarN disabled
                                            showTime hourFormat="24"
                                            monthNavigator yearNavigator
                                            id="closedOn" value={task.closedOn} showIcon
                                            label={t('task.closedOn')} />
                                        :
                                        <></>
                                }
                            </div>
                        </div>

                        {/* MEMBERS */}
                        <div className="flex mb-3 mt-3 align-items-center" id="task-navigator-join">
                            <i className='bx bx-group task-icon'></i>
                            <div className="task-content-header"> {t("task.join")}</div>
                        </div>

                        <div className="task-content-container mr-2 p-fluid fluid ">

                            <span className="p-float-label mb-2-5">
                                    <UserAC
                                        displayType="thumbnail"
                                        disabled={!toggleEditing}
                                        id="responsibleUsers" value={task.responsibleUsers}
                                        groupIds={props.rootGroupId ? [props.rootGroupId] : groups.map(m => m.id)}
                                        // excludeUserIds={task.responsibleUsers.map(m => m.id)}
                                        onChange={(e) => applyTaskChange('responsibleUsers', e.value)}
                                        onBlur={(e) => performValidateTask(["responsibleUsers"])} />
                                <label htmlFor="responsibleUsers">{t('task.responsibleUsers')}</label>
                            </span>
                        </div>
                        {/*<div className="flex mb-3 mt-3 align-items-center" id="task-navigator-join">*/}
                        {/*    <i className='bx bx-group task-icon'></i>*/}
                        {/*    <div className="task-content-header"> {t("task.join")}</div>*/}
                        {/*</div>*/}
                        {/*<div className="task-content-container flex  mr-2 p-fluid fluid ">*/}
                        {/*    <span className="p-float-label mb-2-5 col-8">*/}
                        {/*        <TaskAC id="taskTemplate"*/}
                        {/*                value={addTaskRefs}*/}
                        {/*                onChange={(e) => applyTaskRef("task", e.value)}*/}
                        {/*                 />*/}
                        {/*        <label htmlFor="taskTemplate">{t('task.template')}</label>*/}
                        {/*    </span>*/}
                        {/*    <span className="p-float-label mb-2-5 col-4">*/}
                        {/*        <Dropdown*/}
                        {/*            className="dense file-type"*/}
                        {/*            value={addTaskRefType}*/}
                        {/*            options={referenceTypes}*/}
                        {/*            onChange={e => setAddTaskRefType(e.target.value)}*/}
                        {/*            optionLabel="name"*/}
                        {/*            optionValue="value" />*/}
                        {/*        <label htmlFor="refType">{t('task.referencetype')}</label>*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>

            </div>
        </Dialog >
    );
};

TaskDetailQuick = forwardRef(TaskDetailQuick);

export default TaskDetailQuick;

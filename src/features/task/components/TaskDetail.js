import React, {forwardRef,  useEffect, useImperativeHandle, useRef, useState} from 'react';
import classNames from "classnames";

import _ from "lodash";

import CommonFunction from '@lib/common';
import TaskUtil from "./util/TaskUtil";
import TaskService from "services/TaskService";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {XLayout, XLayout_Center, XLayout_Top} from '@ui-lib/x-layout/XLayout';
import Badges from '@ui-lib/badges/Badges';
import XEditor from '@ui-lib/x-editor/XEditor';
import {UserAC} from "../../../components/autocomplete/UserAC";
import EmptyDataCompact from "@xdp/ui-lib/dist/components/empty-data/EmptyDataCompact";
import {Chip} from "primereact/chip";
import TaskDetailAttachment from "./task-detail/TaskDetailAttachment";
import Mentions from "../../../components/mention/Mentions";
import {InputTextarea} from "primereact/inputtextarea";
import RequestDetail from "../../../components/request/RequestDetail";
import InitRequestDialog from "../../request/components/dialog/InitRequestDialog";
import TaskNextActivity from "./TaskNextActivity";
import TaskDocumentDetail from "./TaskDocumentDetail";
import TaskDocument from "./TaskDocument";
import {Tooltip} from 'primereact/tooltip';
import {Menu} from "primereact/menu";
import {Dialog} from "primereact/dialog";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import {GroupDropdown} from "../../../components/autocomplete/GroupDropdown";
import DynamicForm from "../../../components/dynamic-form/DynamicForm";
import WorkLogTask from "../../../components/autocomplete/WorkLogTask";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import {TaskDetailHistory} from "./task-detail/TaskDetailHistory";
import Comment from "./Comment";
import ProjectUtil from "features/project/components/ProjectUtil";
import ProjectService from "services/ProjectService";
import WBSRenderer from "features/project/components/WBSRenderer";

function TaskDetail(props, ref) {
    const t = CommonFunction.t;
    const { user } = props;
    const {
        rootType, rootKey // reference rootObject
        , prepareData // prepare customfield or action permission
        , miniMode // show mini menu
        , review // enable review mode
        , showDetailRequest // show business layout
        , beforeChangeState // function update before change state
        , beforeSubmit // function execute to get validate
        , afterChangeState // function update after change state
        , includeContentComponent // include component into middle-form ** READONLY **
        , includeGroupComponent // include component after dropdown ** READONLY **
        , project
        , onSubmitTask
    } = props;

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
        rootType: rootType,
        rootKey: rootKey,
        saveAsTemplate: false,
        important: false,
        review: review,
        responsibleUser: {},
        responsibleId: 0,
        responsibleUsers: [],
        responsibleIds: [],
        createByUser: window.app_context.user,
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

    let emptyCheckList = {
        checkListRowIndex: 0,
        name: "",
        checkItems: [],
        action: "ADD"
    }

    let emptyCheckItem = {
        checkItemId: 0,
        name: "",
        isImportant: false,
        isComplete: false,
        participantIds: [],
        observerIds: [],
        action: "ADD"
    }

    const hasPermission = useRef({});
    const [description, setDescription] = useState();
    const [additionProperties, setAdditionProperties] = useState();
    const splitMenu = useRef(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [children, setChildren] = useState([])
    const [scope, setScope] = useState('TASK')
    const [documents, setDocuments] = useState([])
    const [selectedDocuments, setSelectedDocuments] = useState([])
    const [parentTask, setParentTask] = useState(null)
    const [userLogin, setUserLogin] = useState(null);
    const [task, setTask] = useState(emptyTask);
    const [taskTemplate, setTaskTemplate] = useState([]);
    const [taskValidate, setTaskValidate] = useState(empTaskValidate);
    const [groups, setGroups] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [showCancelReason, setShowCancelReason] = useState(false);
    const [checkListRowIndex, setCheckListRowIndex] = useState(0);
    const [toggleEditing, setToggleEditing] = useState(true);
    const [userLoginRole, setUserLoginRole] = useState(-1);
    const [comment, setComment] = useState(null);
    const [resetComment, setResetComment] = useState(undefined);
    const [customFieldsData, setCustomFieldsData] = useState(null);
    const [validDateRange, setValidDateRange] = useState(null);
    const [includeGroupLayout, setIncludeGroupLayout] = useState(null);
    const [includeContentLayout, setIncludeContentLayout] = useState(null);
    const [fixGroup, setFixGroup] = useState(false);
    const [showWBS, setShowWBS] = useState(false);
    const [previewProject, setPreviewProject] = useState(false);
    const refTaskDetailAttachment = useRef(null);
    const refMentions = useRef();
    const refComment = useRef();
    const refTaskDocumentDetail = useRef();
    const refSubTaskDetail = useRef();
    const refReferenceTask = useRef(null);
    const refTaskDocument = useRef();
    const refDynamicForm = useRef();
    const refRequestDetail = useRef();
    const refTaskNextActivity = useRef();
    const refInitRequestDialog = useRef();

    const joditUploaderConfig = CommonFunction.getJoditUploaderConfig();
    const refDescription = useRef(null);
    const refDescriptionConfig = useRef({
        enableDragAndDropFileToEditor: true,
        placeholder: t("common.description"),
        buttonsSM: ['bold', 'strikethrough', 'underline', 'italic', '|', 'ul',
            'ol', '|', 'outdent', 'indent', '|', 'image', 'table', 'link', '|',],
        buttons: ['bold', 'strikethrough', 'underline', 'italic', '|', 'ul',
            'ol', '|', 'outdent', 'indent', '|', 'image', 'table', 'link', '|',],
        buttonsXS: ['bold', 'strikethrough', 'underline', 'italic', '|', 'ul',
            'ol', '|', 'outdent', 'indent', '|', 'image', 'table', 'link', '|',],
        buttonsMD: ['bold', 'strikethrough', 'underline', 'italic', '|', 'ul',
            'ol', '|', 'outdent', 'indent', '|', 'image', 'table', 'link', '|',],
        useSearch: false,
        spellcheck: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        language: CommonFunction.getCurrentLanguage(),
        height: 'auto',
        minHeight: 40,
        maxHeight: 400
    });
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

    const splitButton = [
        {
            label: t('task.create.reference-task'),
            icon: 'bx bx-refresh',
            command: (e) => {
                createReferenceTask()
            }
        },
        {
            label: t('task.copy'),
            icon: 'bx bx-x',
            command: (e) => {
                copyTask()
            }
        }
    ];

    useEffect(() => {
        let _selectedDocuments = []
        _.forEach(documents, function (doc) {
            if (doc.currentWFDocument && doc.currentWFDocument.isSignRequire) {
                _selectedDocuments.push(doc)
            }
        });
        setSelectedDocuments(_selectedDocuments);
    }, [documents]);



    /**
     * show content approved wbs
     * @param {*} _task
     * @param {*} _parent
     * @returns
     */
    const renderContentComponent = async (_task, _parent) => {
        let _rootType = _task.rootType||null;
        let _rootKey = _task.rootKey;
        if(_task.workflowId && _task.workflowId > 0){
            _rootType = (_parent ? (_parent.rootType||null) : _rootType)
            _rootKey = (_parent ? _parent.rootKey : _rootKey)
        }
        if(_rootType){
            let res;
            switch (_rootType){
                case ProjectUtil.const_TASK_ROOT().time_version:
                    res = await ProjectService.getVersionsById(_rootKey);
                    if(res){
                        return(
                            <>
                                <div className="flex pointer mb-2 mt-3 align-items-center" id="task-navigator-due" onClick={(e) => onShowWBS(res.id,_parent)}>
                                    <i className='bx bx-timer task-icon'></i>
                                    <div className="task-content-header"><i><a>{t("project.time.version.number.need.approve") + ": " + res.versionNo}</a></i></div>
                                </div>
                                <div className="task-content-container flex align-items-center">

                                </div>
                            </>
                        );
                    }
                    break;
                default:
                    break;
            }
        }else {
            return (<></>)
        }
    }

    useImperativeHandle(ref, () => ({

        /**
         * create task
         * @param {*} _userLogin
         * @param {*} _parentTask
         */
        createTask: async (_userLogin, _parentTask, _groupId, defaultObj) => {
            let _task = { ...emptyTask, ...(defaultObj ? defaultObj : emptyTask) };
            setAdditionProperties(defaultObj);

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
            _task.groupId = _groupId;

            setDescription(_task.description)
            applyGroups();
            setScope(TaskUtil.const_TaskScope().TASK)
            setTaskValidate(empTaskValidate);
            setEditMode(m.CREATE);
            setToggleEditing(true);
            setShowTaskDetail(true);
            setUserLogin(_userLogin);
            setUserLoginRole(taskRole.CREATE_BY)
            setChildren([])
            setDocuments([])

            if (_task.workflowId === 0 && props.entity && props.entityId) {
                let _data = await TaskService.getFieldsByTask(_task.id, props.entity, props.entityId);
                _data = _.sortBy(_data, [function (o) {
                    return o.orderIndex;
                }]);
                _task.outputFieldValues = _data;
            }
            if (_task.outputFieldValues) {
                setCustomFieldsData(_.cloneDeep(_task.outputFieldValues))
            }

            // WorkflowApi.getFieldLayout(task, props.entityId).then(async _data => {
            //     _data = _.sortBy(_data, [function (o) {
            //         return o.orderIndex;
            //     }]);
            //     if (prepareData && prepareData["customfield"] && typeof prepareData["customfield"] === "function") {
            //         _data = await prepareData["customfield"]({ "fields": _data, "task": _task });
            //     }
            //     _task.outputFieldValues = _data;
            //     if (_task.outputFieldValues) {
            //         setCustomFieldsData(_.cloneDeep(_task.outputFieldValues))
            //     } else {
            //         setCustomFieldsData(null);
            //     }
            // });


            if (_parentTask) {
                _task.parentId = _parentTask.id;
                setParentTask(_parentTask)
            } else {
                setParentTask({})
            }
            setValidDateRange(props.validDateRange)
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
        editTask: async (_taskId, mode, _fixGroup) => {
            let _userLogin = window.app_context.user;
            setUserLogin(_userLogin);
            let _task = await TaskService.getById(_taskId);
            _task.requestedByUsers = []
            _task.requestedByUsers.push(_task.requestedByUser);
            setDescription(_task.description)
            let _parentTask = {}
            let _scope = TaskUtil.getTaskScope(_task);

            if (_task.parentId !== 0) {
                _parentTask = await TaskService.getByIdAndType(_task.parentId, _scope)
                if (_parentTask) {
                    _task.parent = _parentTask;
                    setParentTask(_parentTask);
                }
            }
            if (!_task.parent) {
                setParentTask({})
            }
            TaskService.getChildren(_task.id).then(async _children => {
                let _childRequest = await TaskService.getChildren(_task.id, { type: 'REQUEST' });
                _children = ([..._children, ..._childRequest])
                setChildren(_children);
            });
            TaskService.getDocumentsByTask(_task.id).then(_documents => {
                setDocuments(_documents);
            });


            // setToggleEditing(false);
            if (_task.workflowId === 0 && props.entity && props.entityId) {
                let _data = await TaskService.getFieldsByTask(_task.id, props.entity, props.entityId);
                _data = _.sortBy(_data, [function (o) {
                    return o.orderIndex;
                }]);
                _task.outputFieldValues = _data;
            }
            if (_task.outputFieldValues) {
                setCustomFieldsData(_.cloneDeep(_task.outputFieldValues))
            }

            if (prepareData && prepareData["roleAction"] && typeof prepareData["roleAction"] === "function") {
                let _per = await prepareData["roleAction"](state, _task);
                hasPermission.current = _.cloneDeep(_per);
            }

            if (includeGroupComponent) {
                includeGroupComponent(_task).then(res => {
                    setIncludeGroupLayout(res);
                });
            }

            renderContentComponent(_task, _parentTask).then(res => {
                setIncludeContentLayout(res);
            });

            let _userLoginRole = getUserRole(_task);
            // set states
            applyGroups();
            setTask(_task);
            setFixGroup(_fixGroup);
            setScope(_scope ? _scope : TaskUtil.const_TaskScope().TASK)
            setUserLoginRole(_userLoginRole);
            setEditMode(mode);
            setValidDateRange(props.validDateRange)
            setShowTaskDetail(true)
        },
    }));

    /**
     *
     * @param {*} _versionId
     */
    const onShowWBS = async (_versionId,_task) => {
        setShowWBS(true)
        let res = await ProjectService.getProjectByGroupId(_task.groupId, null, _versionId);
        if(res){
            debugger
            res = CommonFunction.buildObjectPath(res);
            ProjectUtil.buildProcessing(res);
            setPreviewProject(res);
        }
    }

    const getUserRole = (_task) => {
        let _userLoginRole = -1;
        let _userLogin = window.app_context.user;
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

        return _userLoginRole;
    }

    useEffect(() => {
        let _task = _.cloneDeep(task);
        _task.description = description;
        setTask(_task);
    }, [description])
    /**
     * set groups
     */
    const applyGroups = () => {
        setGroups(props.groups);
    }
    /**
     * set groups
     */
    const exPermission = (_button, _component) => {
        return true;
    }

    const onValidateBeforeSubmit = async () => {
        let _task = _.cloneDeep(task);

        if (props.groupRequire && (!_task.groupId || _task.groupId <= 0)) {
            CommonFunction.toastWarning(t("task-require-group"));
            return false;
        }
        if (props.deadlineRequire && (!_task.deadline)) {
            CommonFunction.toastWarning(t("task-require-deadline"));
            return false;
        }

        if (validDateRange && parentTask && parentTask.startDate && parentTask.deadline) {
            let _currStartDate = new Date(_task.startDate || new Date());
            let _currDeadline = new Date(_task.deadline || new Date());
            let _parentStartDate = new Date(parentTask.startDate);
            let _parentDeadline = new Date(parentTask.deadline);

            if (_currStartDate < _parentStartDate || _currDeadline > _parentDeadline) {
                CommonFunction.toastWarning(t("sub-task-timeline-must-be-in-parent-task-time-line")
                    .format(CommonFunction.formatDateTime(_parentStartDate)
                        , CommonFunction.formatDateTime(_parentDeadline)));
                return false;
            }
        }

        if (beforeSubmit && beforeSubmit["validate"] && typeof beforeSubmit["validate"] === "function") {
            if (refDynamicForm && refDynamicForm.current) {
                let _dynamicData = refDynamicForm.current.get();
                if (_dynamicData && _dynamicData.data) {
                    let _inputFields = _dynamicData.data;
                    _task.inputFields = _inputFields;
                }
            }
            return await beforeSubmit["validate"](_task);
        }
        return true;
    }

    const reloadDocument = async (taskId, _documents) => {
        if (taskId) {
            let _documents = await TaskService.getDocumentsByTask(taskId);
            setDocuments(_documents);
        }
    }

    const reloadDocumentCurrent = async (documentId, _currentDocument) => {
        let _documents = await TaskService.getDocumentsByTask(task.id);
        setDocuments(_documents);
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyTaskChange = (prop, val) => {
        let _task = _.cloneDeep(task);
        switch (prop) {
            case "refTask":
                _task.refTask = val;
                break;
            case "group":
                _task.groupId = val;
                break;
            case "requestedByUsers":
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
                if (editMode !== m.CREATE) {
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
            case "cancelReason":
                _task.cancelReason = val;
                break;

            default:
                break;
        }

        _task[prop] = val;
        setTask(_task);
    }

    const cancel = () => {
        setShowTaskDetail(false);
        setShowCancelReason(false);
    }

    /**
     * view workflow process
     * @param {*} request
     */
    const viewWorkflowProcess = (task) => {

        refRequestDetail.current.init({ id: task.id });
    }

    const reloadTask = async () => {
        let _task = await TaskService.getById(task.id);
        if (onSubmitTask) {
            onSubmitTask(_task, 'EDIT');
        }
        setTask(_task)
    }

    const changeState = async (newState) => {
        try {
            let _currentTask = _.cloneDeep(task);
            if (_currentTask.workflowId === 0 && props.entity && props.entityId) {
                if (newState && beforeChangeState && beforeChangeState[newState]
                    && typeof beforeChangeState[newState] === "function") {
                    if (refDynamicForm && refDynamicForm.current) {
                        let _dynamicData = refDynamicForm.current.get();
                        if (_dynamicData && _dynamicData.data) {
                            let _inputFields = _dynamicData.data;
                            _currentTask.inputFields = _inputFields;
                        }
                    }
                    let _valid = await beforeChangeState[newState](_currentTask);

                    if (!_valid) {
                        return false;
                    }
                }
            }
            switch (newState) {
                case 'start':
                    changeStateTask(newState, true).then(data => {
                        if (data) setBtnLoading(false)
                    });
                    break;
                case 'defer':
                    changeStateTask(newState, true).then(data => {
                        if (data) setBtnLoading(false)
                    });
                    break;
                case 'sign':
                    if (selectedDocuments && selectedDocuments.length > 0) {
                        let _docId = [];
                        let docName = '';
                        _.forEach(selectedDocuments, function (doc) {
                            _docId.push(doc.id);
                            docName += doc.name + ', '
                        })
                        setBtnLoading(true);
                        CommonFunction.showConfirm(
                            <>
                                <h6>{t("task.signed.document.list")}</h6>
                                <span>{docName}</span>
                            </>
                            , t("task.signed.document.list"),
                            async () => {
                                submitTask(true, (_task) => {
                                    TaskService.sign(task.id, _docId).then(async (res) => {
                                        let _documents = await TaskService.getDocumentsByTask(task.id);

                                        setDocuments(_documents);
                                        CommonFunction.toastSuccess(t("doc.signed") + " !");
                                        setBtnLoading(false);
                                    });
                                });
                            }, () => {
                                setBtnLoading(false);
                            }
                        )
                    }
                    break;
                case 'cancel':
                    setShowCancelReason(true);
                    break;
                case 'finish':
                    CommonFunction.showConfirm(t("confirm.task.completed") + " '" + task.name + "' ? ", t("task.change.state"), () => {
                        changeStateTask(newState, true).then(data => {
                            if (data) setBtnLoading(false)
                        });
                    }, () => setBtnLoading(false))
                    break;
                case 'close-activity':
                    let _docUnsigneds = [];
                    if ((userLoginRole === taskRole.RESPONSIBLE) || (userLoginRole === taskRole.REQUESTER)) {
                        if (scope === TaskUtil.const_TaskScope().REQUEST) {
                            if (documents && documents.length > 0) {
                                _.forEach(documents, function (doc) {
                                    if (doc.currentWFDocument && doc.currentWFDocument.isSignRequire) {
                                        if (!doc.signedUsers || doc.signedUsers.length === 0) {
                                            _docUnsigneds.push(doc.name);
                                        } else {
                                            if (!_.find(doc.signedUsers, { 'id': userLogin.id })) {
                                                _docUnsigneds.push(doc.name);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    if (_docUnsigneds.length > 0) {
                        CommonFunction.showConfirm(_docUnsigneds.length + " "
                            + t("confirm.document.un-signed") + ": "
                            + _docUnsigneds.join(", ") + "' ? "
                            , t("task.close"),
                            async () => {
                                setBtnLoading(true);
                                submitTask(true, async (_task) => {
                                    let res = await TaskService.finishActivity(_task);
                                    if (res) {
                                        refTaskNextActivity.current.showActivities(res, _task)
                                        onSubmitTask(_task, 'EDIT');
                                    }
                                    setBtnLoading(false);
                                });
                            }, () => {
                                setBtnLoading(false);
                            }
                        )
                    } else {
                        submitTask(true, async (_task) => {
                            let res = await TaskService.finishActivity(_task);
                            if (res) {
                                refTaskNextActivity.current.showActivities(res, _task)
                            }
                            setBtnLoading(false);
                        });
                    }

                    break;
                case 'pause':
                    changeStateTask(newState, true).then(data => {
                        if (data) setBtnLoading(false);
                    });
                    break;
                case 'resume':
                    changeStateTask(newState, true).then(data => {
                        if (data) setBtnLoading(false);
                    });
                    break;
                case 'finish_review':
                    changeStateTask(newState, true).then(data => {
                        if (data) setBtnLoading(false);
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error);
            setBtnLoading(false);
        }
    }

    const createReferenceTask = () => {
        refReferenceTask.current.createTask(userLogin, task, task.groupId);
    }

    const createSubTask = () => {
        refReferenceTask.current.createTask(userLogin, task, task.groupId, additionProperties);
    }

    const createSubRequest = () => {
        refInitRequestDialog.current.open(userLogin, task, task.groupId);
    }

    const editSubTask = (subTask) => {
        refSubTaskDetail.current.editTask(subTask, m.EDIT);
    }

    const copyTask = () => {
        refSubTaskDetail.current.copyTask(userLogin, task);
    }

    const onSubTaskSubmitted = async (_task, _mode) => {
        if (_task && _task.id) {
            TaskService.getByIdAndType(_task.id, TaskUtil.const_TaskScope().TASK).then(_impactedTask => {
                if (_impactedTask) {
                    try {
                        let _children = _.cloneDeep(children);
                        if (!_children) {
                            _children = []
                        }
                        if (_mode === m.CREATE) {
                            _children.push(_impactedTask)
                        } else if (_mode === m.EDIT) {
                            let _index = CommonFunction.findArrayIndex(_children, 'id', _impactedTask.id)[0];
                            _children[_index] = _impactedTask;
                        }
                        setChildren(_children);
                        if (props.onSubmitTask) {
                            props.onSubmitTask(_task, _mode);
                        }
                    } catch (error) {
                        console.log("on task submitted error", error);
                    }
                }
            });
        }
    }

    const onSubRequestSubmitted = async (_request) => {
        if (_request && _request.id && refInitRequestDialog.current) {
            TaskService.getByIdAndType(_request.id, 'REQUEST').then(_impactedTask => {
                if (_impactedTask) {
                    try {
                        let _children = _.cloneDeep(children);
                        if (!_children) {
                            _children = []
                        }

                        _children = [_impactedTask, ..._children]
                        setChildren(_children);
                        refInitRequestDialog.current.hide();
                    } catch (error) {
                        console.log("on task submitted error", error);
                    }

                }
            })
        }
    }

    const submitComment = () => {
        if (!comment || comment.length === 0) return;
        TaskService.createMention({ taskId: task.id, content: comment.value, mentions: comment.selected.map(_selected => _selected.id) }).then(data => {
            // refMentions.current.clear();
            // refComment.current.reload();
            refComment.current.add(data);
            setResetComment('');
            setComment('');
        });
    };

    /**
     *
     * @param {*} newState
     * @param {*} showAfterSubmit
     * @param {*} callback
     * @param {*} cancelReason
     * @returns
     */
    const changeStateTask = async (newState, showAfterSubmit, callback, cancelReason) => {
        let _task = _.cloneDeep(task);
        let isValidResponse = true;
        // validate
        let isValid = performValidateTask([]);
        if (isValid) {
            isValid = await onValidateBeforeSubmit();
        }
        if ((_task.cancelReason === undefined || _task.cancelReason.length === 0) && newState === 'cancel') {
            CommonFunction.toastError(`${t('task.cancel.reason')} ${t('message.cant-be-empty')}`)
            return;
        }
        let attachment = refTaskDetailAttachment.current.get();

        // submit
        if (isValid && attachment.valid) {
            setBtnLoading(true);
            // call api
            try {
                // submit documents
                refTaskDetailAttachment.current.submit(attachment.documents, async () => {
                    let _isValid = true;
                    // after submit documents
                    switch (editMode) {
                        case m.EDIT:
                            if (refDynamicForm && refDynamicForm.current) {
                                let _dynamicData = refDynamicForm.current.get();
                                if (_dynamicData && _dynamicData.data) {
                                    _isValid = _dynamicData.valid;
                                    let _inputFields = _dynamicData.data;
                                    _task.inputFields = _inputFields;
                                }
                            }
                            if (_isValid) {
                                let _updateTask = await TaskService.changeState(_task, newState);
                                if (_updateTask) {
                                    _task = _.cloneDeep(_updateTask);
                                    setShowCancelReason(false);
                                } else {
                                    setShowCancelReason(false);
                                    setBtnLoading(false);
                                    isValidResponse = false;
                                }
                            } else {
                                CommonFunction.toastError(t("invalid.custom.data"))
                                setBtnLoading(false);
                                return;
                            }
                            break;
                        default:
                            break;
                    }

                    if (isValidResponse) {
                        if (callback) {
                            callback(_task);
                        } else {
                            setTask(_task);
                            setBtnLoading(false)
                        }

                        // callback on submit task
                        if (props.onSubmitTask) {
                            props.onSubmitTask(_task, editMode);
                        }

                        // close after submit
                        if (!showAfterSubmit) {
                            cancel();
                        }
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }
    };
    /**
     *
     * @param {*} showAfterSubmit
     * @param {*} callback
     */
    const submitTask = async (showAfterSubmit, callback) => {
        let _task = _.cloneDeep(task);
        let isValidResponse = true;
        // validate
        let isValid = performValidateTask([]);
        if (isValid) {
            isValid = await onValidateBeforeSubmit();
        }


        let attachment = refTaskDetailAttachment.current.get();

        // submit
        if (isValid && attachment.valid) {
            setBtnLoading(true);
            // call api
            try {
                // submit documents
                refTaskDetailAttachment.current.submit(attachment.documents, async () => {
                    let _isValid = true;
                    // after submit documents
                    switch (editMode) {
                        case m.CREATE:
                            if (refDynamicForm && refDynamicForm.current) {
                                let _dynamicData = refDynamicForm.current.get();
                                if (_dynamicData && _dynamicData.data) {
                                    _isValid = _dynamicData.valid;
                                    let _inputFields = _dynamicData.data;
                                    _task.inputFields = _inputFields;
                                }
                            }

                            let _createdTask;

                            if (_isValid) {
                                _createdTask = await TaskService.create(_task);
                            } else {
                                CommonFunction.toastError(t("invalid.custom.data"))
                                setBtnLoading(false);
                                return;
                            }
                            if (_createdTask) {
                                //reload
                                let _userLogin = window.app_context.user;
                                _createdTask.requestedByUsers = []
                                _createdTask.requestedByUsers.push(_task.requestedByUser)

                                if (_createdTask.parentId && _createdTask.parentId !== 0) {
                                    let _parentTask = await TaskService.getById(_createdTask.parentId)
                                    _createdTask.parent = _parentTask;
                                    setParentTask(_parentTask);
                                } else {
                                    setParentTask({});
                                }

                                TaskService.getChildren(_createdTask.id).then(_children => {
                                    setChildren(_children);
                                });


                                TaskService.getDocumentsByTask(_createdTask.id).then(_documents => {
                                    setDocuments(_documents);
                                });


                                _task = _.cloneDeep(_createdTask)
                                setEditMode(m.EDIT)
                                // setToggleEditing(false);

                                let _userLoginRole = getUserRole(_task);
                                setUserLoginRole(_userLoginRole);
                                //
                                if (props.tasks) {
                                    props.tasks.unshift(_task)
                                }
                            }
                            break;
                        case m.EDIT:
                            if (refDynamicForm && refDynamicForm.current) {
                                let _dynamicData = refDynamicForm.current.get();
                                if (_dynamicData && _dynamicData.data) {
                                    _isValid = _dynamicData.valid;
                                    let _inputFields = _dynamicData.data;
                                    _task.inputFields = _inputFields;
                                }
                            }
                            if (_isValid) {
                                let _updateTask = await TaskService.update(_task);
                                if (_updateTask) {
                                    _task = _.cloneDeep(_updateTask);
                                } else {
                                    setBtnLoading(false);
                                    isValidResponse = false;
                                }
                            } else {
                                CommonFunction.toastError(t("invalid.custom.data"))
                                setBtnLoading(false);
                                return;
                            }
                            break;
                        default:
                            break;
                    }

                    if (isValidResponse) {
                        if (callback) {
                            callback(_task);
                        } else {
                            setTask(_task);
                            setBtnLoading(false)
                        }

                        // callback on submit task
                        if (props.onSubmitTask) {
                            props.onSubmitTask(_task, editMode);
                        }

                        // close after submit
                        if (!showAfterSubmit) {
                            cancel();
                        }
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }
    };

    /**
     *
     * @param {*} props
     * @returns
     */
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

    const button = (btnLabel) => {
        let per = exPermission(btnLabel)
        switch (btnLabel) {
            case 'start':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE]))) {

                    return (
                        <Button
                            loading={btnLoading} label={t("start")} tooltipOptions={{ position: 'top' }}
                            icon="bx bx-play-circle" onClick={() => changeState("start")} />
                    )
                }
                break;
            case 'defer':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE]))) {

                    return (<Button
                        loading={btnLoading} label={t("defer")} tooltipOptions={{ position: 'top' }}
                        icon="bx bx-stopwatch" onClick={() => changeState('defer')} />)
                }
                break;
            case 'cancel':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE, TaskUtil.R().CREATE_BY, TaskUtil.R().REQUESTER]))) {

                    return (<Button
                        loading={btnLoading} label={t("cancel")} tooltipOptions={{ position: 'top' }}
                        icon="bx bx-power-off" onClick={() => changeState('cancel')} />)

                }

                break;
            case 'sign':
                if ((per || userLoginRole === taskRole.RESPONSIBLE)) {

                    // return (<Button
                    //     loading={btnLoading} tooltip={t("sign")} tooltipOptions={{ position: 'top' }}
                    //     icon="bx bx-pen" onClick={() => changeState('sign')} />)
                }
                break;
            case 'finish':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE]))) {
                    let _signValid = true;
                    if (scope === TaskUtil.const_TaskScope().REQUEST) {
                        if (documents && documents.length > 0) {
                            _.forEach(documents, function (doc) {
                                if (doc.currentWFDocument && doc.currentWFDocument.isSignRequire) {
                                    if (!doc.signedUsers || doc.signedUsers.length === 0) {
                                        _signValid = false;
                                    } else {
                                        if (!_.find(doc.signedUsers, { 'id': userLogin.id })) {
                                            _signValid = false;
                                        }
                                    }
                                }
                            });
                        }
                        if (true || _signValid) {
                            return (<Button loading={btnLoading}
                                label={t("finish")} tooltipOptions={{ position: 'top' }}
                                icon="bx bx-check-circle" onClick={() => changeState('close-activity')} />)
                        }
                    } else {
                        return (<Button loading={btnLoading}
                            label={t("finish")} tooltipOptions={{ position: 'top' }}
                            icon="bx bx-check-circle" onClick={() => changeState('finish')} />)
                    }
                }
                break;
            case 'finish_review':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().REQUESTER]))) {
                    return (<Button loading={btnLoading}
                        label={t("finish-review")} tooltipOptions={{ position: 'top' }}
                        icon="bx bx-message-square-check" onClick={() => changeState('finish_review')} />)
                }
                break;
            case 'pause':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE]))) {
                    return (<Button
                        loading={btnLoading} label={t("pause")} tooltipOptions={{ position: 'top' }}
                        icon="bx bx-pause-circle" onClick={() => changeState('pause')} />)
                }
                break;
            case 'resume':
                if ((per || TaskUtil.hasRoles(task, userLogin, [TaskUtil.R().RESPONSIBLE, TaskUtil.R().REQUESTER]))) {
                    return (<Button loading={btnLoading}
                        label={t("resume")} tooltipOptions={{ position: 'top' }}
                        icon="bx bx-repeat" onClick={() => changeState('resume')} />)
                }
                break;
            default:
                return (<></>)
        }
    };

    const renderTaskButton = () => {
        switch (task.state) {
            case consState.PENDING:
                return (
                    <>
                        {/*<span className="p-buttonset">*/}
                        {button('start')}
                        {button('defer')}
                        {button('sign')}
                        {button('cancel')}
                        {button('finish')}
                        {/*</span>*/}
                    </>
                )
                break;
            case consState.IN_PROGRESS:
                return (
                    <>
                        {/*<span className="p-buttonset">*/}
                        {button('pause')}
                        {button('sign')}
                        {button('cancel')}
                        {button('finish')}
                        {/*</span>*/}

                    </>
                )
                break;
            case consState.DEFERRED:
                return (
                    <>
                        {/*<span className="p-buttonset">*/}
                        {button('resume')}
                        {button('cancel')}
                        {button('finish')}
                        {/*</span>*/}
                    </>
                )
            case consState.CANCELED:
                return (<></>);
                break;
            case consState.COMPLETED:
                return (<></>);
                break;
            case consState.REVIEWING:
                return (
                    <>
                        {/*<span className="p-buttonset">*/}
                        {button('resume')}
                        {button('finish_review')}
                        {/*</span>*/}
                    </>
                );
                break;
            default:
                break;
        }
    };

    const dialogFooterTemplate = () => {
        return (
            <>
                {scope !== TaskUtil.const_TaskScope().MASTER_REQUEST && !miniMode &&
                    <div className="pr-2 toggle-div mr-2">
                        <Menu style={{ width: '200px' }} model={splitButton} popup ref={splitMenu} id="popup_menu" />
                        <Button label={t("action")} tooltipOptions={{ position: 'top' }}
                            className="popup_menu "
                            icon="pi pi-bars" onClick={(event) => splitMenu.current.toggle(event)} aria-controls="popup_menu" aria-haspopup />
                    </div>
                }
                {
                    (task.state !== consState.DONE
                        && task.state !== consState.COMPLETED
                        && task.state !== consState.CANCELED) && (toggleEditing || editMode === m.CREATE)
                        && scope !== TaskUtil.const_TaskScope().MASTER_REQUEST
                        && (userLoginRole > 1 || exPermission('save'))
                        ?
                        <Button loading={btnLoading}
                            label={t('common.save-close')} tooltipOptions={{ position: 'top' }}
                            icon="bx bxs-save create" onClick={() => submitTask(false)} />
                        : <></>
                }
                {
                    (task.state !== consState.DONE
                        && task.state !== consState.COMPLETED
                        && task.state !== consState.CANCELED) && (toggleEditing || editMode === m.CREATE)
                        && scope !== TaskUtil.const_TaskScope().MASTER_REQUEST
                        && !miniMode
                        && (userLoginRole > 1 || exPermission('save'))
                        ?
                        <Button loading={btnLoading}
                            label={t('common.save')} tooltipOptions={{ position: 'top' }}
                            icon="bx bx-save create" onClick={() => submitTask(true)} />
                        : <></>
                }
            </>
        )
    };

    return (
        <Dialog
            header={`[${editMode === m.create ? t('common.create') : t('common.update')}] ${t("task")}`}
            visible={showTaskDetail}
            contentClassName="p-0"
            className="task-window-detail"
            breakpoints={{ '960px': '75vw', '640px': '100vw' }}
            id="task-detail-window"
            style={{ height: !miniMode ? "100vh" : "70vh", width: !miniMode ? "80%" : "60%", minWidth: !miniMode ? "1200px" : "600px" }}
            modal
            // footer={getDialogHeader}
            onHide={() => cancel()}
        >
            <XLayout>
                <XLayout_Top>
                    <XToolbar className="mx-2 mb-2"
                        left={() => (
                            renderTaskButton()
                        )}
                        right={() => (
                            dialogFooterTemplate()
                        )}
                    >
                    </XToolbar>
                    <div className="flex align-items-center px-2">
                        <i className='bx bx-task task-icon fs-20 mr-1'></i>
                        <InputText
                            className={classNames({ "task-title": true, "p-invalid": taskValidate.name })}
                            value={task.name}
                            placeholder={t("task.task-name-placeholder")}
                            onChange={(e) => applyTaskChange('name', e.target.value)}
                            onBlur={(e) => performValidateTask(["name"])}
                            className="w-full"
                        />

                    </div>
                </XLayout_Top>
                <XLayout_Center id="task-detail-container" className="p-2 task-panel">
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
                                        aria-controls="menu_change_task_state"
                                        aria-haspopup
                                    >
                                        {t("task.state." + task.state)}
                                        <i className='bx bxs-pencil ml-1'></i>
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

                            {scope === TaskUtil.const_TaskScope().REQUEST && task.workFlow &&
                                <>
                                    <span className='bx bx-git-branch ml-2 mr-1 text-grey-6'></span>
                                    <span className="workflow-item-name">{task.workFlow.name}</span>
                                </>}
                            {scope === TaskUtil.const_TaskScope().REQUEST && task.activity &&
                                <>
                                    <span className='bx bx-radio-circle-marked ml-1 mr-1 text-grey-6'></span>
                                    <span className="workflow-item-name">{task.activity.name}</span>
                                </>}
                        </div>

                        {/* parent task */}
                        {(parentTask && parentTask.id && parentTask.id > 0 && scope !== TaskUtil.const_TaskScope().REQUEST) &&
                            <div className="subtask-container">
                                <span className='bx bx-menu-alt-right text-grey-6 mr-1'></span>
                                <span className="small">{`${t("task.child-task-of")}: ${parentTask.name}`}</span>
                                <span className="small "><i>{` : ( ${CommonFunction.formatDateTime(parentTask.startDate)}
                                                                    - ${CommonFunction.formatDateTime(parentTask.deadline)} )`}</i></span>
                            </div>
                        }
                    </div>

                    {/* TASK INFO */}
                    <div className="p-inputgroup mt-1 mb-1 pr-2">
                        <div className="p-inputgroup-addon flex align-items-center">
                            <i className="fas fa-user-shield mr-1"></i>
                            <span>{t('task.owner.task')}</span>
                        </div>

                        <GroupDropdown
                            filter disabled={fixGroup || (parentTask && parentTask.id && parentTask.id > 0)} //disable change task if has parent
                            filterInputAutoFocus
                            showClear
                            filterBy="name"
                            id="task-detail-owner"
                            value={task.groupId}
                            listGroups={groups}
                            onChange={(e) => applyTaskChange('group', e.target.value)}
                            className="dense w-full" />
                    </div>
                    {includeGroupLayout}
                    {/* DESCRIPTION, DYNAMIC FORM - CUSTOM FIELDS */}
                    <div className="flex mb-2 mt-2 align-items-center" id="task-navigator-description">
                        <i className='bx bx-align-justify task-icon'></i>
                        <div className="task-content-header">{t("task.nav.description")}</div>
                    </div>

                    <div className="task-content-container mr-2 flex flex-column">
                        <XEditor
                            ref={refDescription}
                            value={description}
                            onBlur={newContent => {
                                setDescription(newContent)
                            }} // preferred to use only this option to update the content for performance reasons
                            // value={description}
                            config={refDescriptionConfig.current}
                        ></XEditor>
                        {/*<JoditEditor*/}
                        {/*    value={description}*/}
                        {/*    config={refDescriptionConfig.current}*/}
                        {/*    onBlur={newContent => {*/}
                        {/*        setDescription(newContent)*/}
                        {/*    }} // preferred to use only this option to update the content for performance reasons*/}
                        {/*    // onChange={newContent => { }}*/}
                        {/*/>*/}

                        {/*<InputTextarea*/}
                        {/*    className="task-description mt-1"*/}
                        {/*    placeholder={t("task.task-description-placeholder")}*/}
                        {/*    value={task.description}*/}
                        {/*    onChange={(e) => applyTaskChange('description', e.target.value)}*/}
                        {/*// onTextChange={(e) => applyTaskChange('description', e.htmlValue)}*/}
                        {/*/>*/}

                    </div>

                    <div className="task-content-container mt-2">
                        {customFieldsData &&
                            <DynamicForm ref={refDynamicForm} customFields={customFieldsData} />
                        }
                    </div>
                    {/*<div className="flex mb-2 mt-2 align-items-center" id="task-navigator-description"  onClick={() => showDetailRequest()}>*/}
                    {/*    <i className='bx bx-align-justify task-icon'></i>*/}
                    {/*    <div className="task-content-header">{t("task.nav.description")}</div>*/}
                    {/*</div>*/}
                    {/*<div className="task-content-container mt-2" onClick={() => showDetailRequest()}>*/}
                    {/*</div>*/}

                    {includeContentLayout}
                    {task && task.id && <WorkLogTask task={task} project={project} />}
                    {/* DUE DATE */}
                    <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-due">
                        <i className='bx bx-timer task-icon'></i>
                        <div className="task-content-header">{t("task.due")}</div>
                    </div>

                    <div className="task-content-container flex align-items-center">
                        <div className="mr-2">
                            <XCalendar
                                showTime
                                label={t('common.startdate')}
                                
                                value={task.startDate}
                                onChange={(value) => applyTaskChange('startDate', value)} />
                        </div>
                        <div className="mr-2">
                            <XCalendar
                                showTime
                                label={t('task.deadline')}
                                
                                value={task.deadline}
                                onChange={(value) => applyTaskChange('deadline', value)} />
                        </div>


                        <div title={t('task.closedOn')}>
                            {
                                task.state === consState.CANCELED || task.state === consState.COMPLETED ?
                                    <XCalendar disabled
                                        showTime
                                        id="closedOn" value={task.closedOn}
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
                        {!miniMode && <>
                            <span className="p-float-label mb-2-5">
                                <UserAC
                                    id="requestedBy"
                                    disabled={!toggleEditing || editMode !== m.CREATE || scope === TaskUtil.const_TaskScope().REQUEST}
                                    value={task.requestedByUsers}
                                    onChange={(e) => applyTaskChange('requestedByUsers', e.value)}
                                    onBlur={(e) => performValidateTask(["requestedByUsers"])}
                                    className="w-full"
                                    style={{ width: "100%" }} />
                                <label htmlFor="requestBy">{t('task.requestBy')}</label>
                            </span>
                        </>}

                        <span className="p-float-label mb-2-5">
                            {scope === TaskUtil.const_TaskScope().REQUEST &&
                                <UserAC
                                    displayType="thumbnail"
                                    disabled={!toggleEditing}
                                    id="responsibleUsers" value={task.responsibleUsers}
                                    groupIds={groups.map(m => m.id)}
                                    excludeUserIds={task.responsibleUsers.map(m => m.id)}
                                    onChange={(e) => applyTaskChange('responsibleUsers', e.value)}
                                    onBlur={(e) => performValidateTask(["responsibleUsers"])} />}
                            {scope === TaskUtil.const_TaskScope().TASK &&
                                <UserAC
                                    displayType="thumbnail"
                                    disabled={!toggleEditing}
                                    id="responsibleUsers" value={task.responsibleUsers}
                                    groupIds={props.rootGroupId ? [props.rootGroupId] : groups.map(m => m.id)}
                                    // excludeUserIds={task.responsibleUsers.map(m => m.id)}
                                    onChange={(e) => applyTaskChange('responsibleUsers', e.value)}
                                    onBlur={(e) => performValidateTask(["responsibleUsers"])} />}
                            <label htmlFor="responsibleUsers">{t('task.responsibleUsers')}</label>
                        </span>
                        {!miniMode && <>
                            <span className="p-float-label mb-2-5">
                                <UserAC
                                    disabled={!(exPermission(null, 'participant'))}
                                    className="w-full" displayType="thumbnail"
                                    id="participantUsers" value={task.participantUsers}
                                    onChange={(e) => applyTaskChange('participantUsers', e.value)}
                                    onBlur={(e) => performValidateTask(["participantUsers"])} />
                                <label htmlFor="participantUsers">{t('task.participantUsers')}</label>
                            </span>

                            <span className="p-float-label">
                                <UserAC
                                    disabled={!toggleEditing}
                                    id="observerUsers" value={task.observerUsers}
                                    onChange={(e) => applyTaskChange('observerUsers', e.value)}
                                    onBlur={(e) => performValidateTask(["observerUsers"])} />
                                <label htmlFor="participantUsers">{t('task.observerUsers')}</label>
                            </span>
                        </>}
                    </div>
                    {/* SUB TASKS */}
                    {!miniMode && <>
                        <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-sub-task">
                            <i className='bx bx-align-right task-icon'></i>
                            <div className="task-content-header">{t("task.sub-task")}</div>
                        </div>

                        <div className="task-content-container flex flex-column">
                            <div className="flex mb-2">
                                {CommonFunction.taskActionAvailable(task)
                                    &&
                                    <XToolbar
                                        className="p-0 mb-2"
                                        left={() => (
                                            <div className="p-2">
                                                <Button icon="bx bx-plus" label={t("task.add.sub-task")} onClick={createSubTask} />
                                                <Button icon="bx bx-plus" label={t("request.create")} onClick={createSubRequest} />
                                            </div>
                                        )}
                                    >
                                    </XToolbar>
                                }
                            </div>
                            {children && children.length === 0 &&
                                <EmptyDataCompact message={t("task.empty-sub-task")}>
                                </EmptyDataCompact>
                            }
                            {children && children.length > 0 && children.map((subTask, index) => (
                                <React.Fragment key={index}>
                                    {subTask.showGroup && (
                                        <div className="x-group mb-0 pt-2 pl-2" id={`task-group-index-${subTask.groupId}`}>
                                            <span>{subTask.groupName}</span>
                                        </div>
                                    )}

                                    <div className="border-bottom flex align-items-stretch justify-content-between task-item-container">
                                        <div className="flex align-items-center p-1">
                                            <div className="flex flex-column">
                                                <div className="flex align-items-center">
                                                    <Tooltip target={`.user-task-state.${subTask.state}`} content={t(`request.task.state.${subTask.state}`)} position="bottom" />
                                                    <i className={classNames({
                                                        "user-task-state task-list-quick-action bx": true,
                                                        "PENDING bx-pause text-grey-7": subTask.state === "PENDING",
                                                        "IN_PROGRESS bx-play text-teal": subTask.state === "IN_PROGRESS",
                                                        "DEFERRED bx-stopwatch text-orange-9": subTask.state === "DEFERRED",
                                                        "CANCELED bx-x text-red-9": subTask.state === "CANCELED",
                                                        "COMPLETED bx-check text-green": subTask.state === "COMPLETED",
                                                        "REVIEWING bx-help text-purple": subTask.state === "REVIEWING"
                                                    })} />

                                                    <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom" />
                                                    <i className={
                                                        classNames({
                                                            "user-important-task task-list-quick-action ml-1 mr-2": true,
                                                            "bx bx-tag-alt text-grey-7": !subTask.important,
                                                            "bx bxs-tag-alt text-yellow-9": subTask.important
                                                        })}
                                                    />

                                                    <span onClick={() => editSubTask(subTask, m.EDIT)} className="bold-and-color link-button mr-2">
                                                        {subTask.name}
                                                    </span>
                                                </div>
                                                <div className="task-workflow-info flex align-items-center mb-1">
                                                    {subTask.requestedByUser &&
                                                        <>
                                                            <div className='bx bx-user h-full text-grey-6 mr-1'></div>
                                                            <span className="text-grey-8 mr-1">{t("task.list.request-by")}</span>
                                                            <Chip
                                                                label={subTask.requestedByUser.fullName}
                                                                image={CommonFunction.getImageUrl(subTask.requestedByUser.avatar, subTask.requestedByUser.fullName)}
                                                                className="tiny text-ellipsis task-page-request-by-user-tooltip" />

                                                            <i className="bx bx-right-arrow-alt text-primary mr-1 ml-1"></i>
                                                        </>
                                                    }
                                                    {subTask.responsibleUser &&
                                                        <>
                                                            <Chip
                                                                label={subTask.responsibleUser.fullName}
                                                                image={CommonFunction.getImageUrl(subTask.responsibleUser.avatar, subTask.responsibleUser.fullName)}
                                                                className="tiny text-ellipsis task-page-responsible-by-user-tooltip" />
                                                        </>
                                                    }


                                                    {subTask.deadline &&
                                                        <div className="ml-2">
                                                            <span className='bx bx-timer text-grey-6'></span>
                                                            <span className="task-page-task-deadline ml-1 text-grey-8">
                                                                {`${t("task.due")}: `}
                                                            </span>
                                                            <span className={classNames({
                                                                "task-page-task-deadline": true,
                                                                "text-red": subTask.isOverDue,
                                                                "text-grey-8": !subTask.isOverDue
                                                            })}>
                                                                {CommonFunction.formatDateTime(subTask.deadline)}
                                                            </span>

                                                        </div>
                                                    }

                                                    {(subTask.state === "CANCELED" || subTask.state === "COMPLETED") && subTask.closedOn &&
                                                        <div className="ml-2">
                                                            <span className='bx bx-calendar-check text-grey-6'></span>
                                                            <span className="task-page-task-deadline ml-1 text-grey-8">
                                                                {`${t("task.close")}: `}
                                                            </span>
                                                            <span className={classNames({
                                                                "task-page-task-deadline ml-1": true,
                                                                "text-grey-8": !subTask.deadline,
                                                                "text-red": subTask.deadline && subTask.isCompleteOverDue === true,
                                                                "text-green": subTask.deadline && subTask.isCompleteOverDue === false
                                                            })}>
                                                                {CommonFunction.formatDateTime(subTask.closedOn)}
                                                            </span>
                                                        </div>
                                                    }
                                                </div>

                                                {/* workflow info */}
                                                {(subTask.workFlow || subTask.activity) &&
                                                    <div className="task-workflow-info task-view-process link-button mb-1" onClick={() => viewWorkflowProcess(subTask)}>
                                                        <Tooltip target=".task-view-process" content={t("request.view-process")} position="bottom" />

                                                        {subTask.workFlow &&
                                                            <>
                                                                <span className='bx bx-git-branch mr-1 text-grey-6'></span>
                                                                <span className="mr-1 text-grey-8">{subTask.workFlow.name}</span>
                                                            </>
                                                        }
                                                        {subTask.activity &&
                                                            <>
                                                                <br />
                                                                <span className='bx bx-radio-circle-marked mr-1 text-grey-6'></span>
                                                                <span className="mr-1 text-grey-8">{subTask.activity.name}</span>
                                                            </>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}

                        </div>
                    </>}

                    {/* ATTACHMENTS */}
                    {!miniMode && <>
                        <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-attachment">
                            <i className='bx bx-paperclip task-icon'></i>
                            <div className="task-content-header">{t("task.attachment")}</div>
                        </div>

                        <div className="task-content-container">
                            <TaskDetailAttachment ref={refTaskDetailAttachment} task={task} scope={scope} showSign={userLoginRole === taskRole.RESPONSIBLE} />
                        </div>
                    </>}

                    {miniMode && <>
                        <div className="task-content-container" style={{ display: 'none' }}>
                            <TaskDetailAttachment ref={refTaskDetailAttachment} task={task} scope={scope} showSign={userLoginRole === taskRole.RESPONSIBLE} />
                        </div>
                    </>}
                    {!miniMode && <>
                        <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-comment">
                            <i className='bx bx-chat task-icon'></i>
                            <div className="task-content-header">{t("task.comment")}</div>

                        </div>

                        <div className="task-content-container mr-2 task-comments">
                            <div className=" flex align-items-center">
                                <img className="comment-avatar border-shadow" src={CommonFunction.getImageUrl(window.app_context.user.avatar, window.app_context.user.fullName)} />
                                <Mentions
                                    className="mr-2 ml-2"
                                    ref={refMentions}
                                    resetValue={resetComment}
                                    onChangeComment={(e) => {
                                        setResetComment(undefined);
                                        setComment(e);
                                    }}
                                />
                                <Button onClick={submitComment} label={t('comment.send')}
                                />
                            </div>

                            <div className="mt-4">
                                <Comment ref={refComment} referenceId={task.id} />
                            </div>
                        </div>
                    </>}

                    {/* HISTORY */}

                    {editMode !== m.CREATE && !miniMode &&
                        <>
                            <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-history">
                                <i className='bx bx-history task-icon'></i>
                                <div className="task-content-header">{t("task.history")}</div>
                            </div>

                            <div className="task-content-container history">
                                <TaskDetailHistory taskId={task.id} />
                            </div>

                            {/* <div className="task-content-container mr-2 p-fluid fluid ">
                                    <TaskHistory taskId={task.id} />
                                </div> */}

                        </>
                    }

                </XLayout_Center>
            </XLayout>

            <Dialog
                header={`${t('task.cancel.reason')}`}
                visible={showCancelReason}
                className="p-fluid fluid  "
                id="cancel-reason"
                style={{ width: "420px" }}
                modal
                footer={
                    <>
                        <Button label={t('common.close')} icon="bx bx-x" className="p-button-text text-muted" onClick={() => setShowCancelReason(false)} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary"
                            onClick={() => {
                                changeStateTask('cancel', true, null).then(data => {
                                    if (data) {
                                        setBtnLoading(false)
                                        setShowCancelReason(false)
                                    }
                                });
                            }} />
                    </>
                }
                onHide={() => setShowCancelReason(false)} >
                <XLayout>
                    <XLayout_Center>
                        <div className="formgrid grid">
                            <div className="col-12">
                                <InputTextarea id="task.cancelReason"  style={{ width: '400px' }}
                                    value={task.cancelReason} rows={6}
                                    onChange={(e) => applyTaskChange('cancelReason', e.target.value)} />
                            </div>
                        </div>
                    </XLayout_Center>
                </XLayout>


            </Dialog>
            <Dialog
                visible={showWBS}
                onHide={() => (setShowWBS(false))}
                resizable={true}
                modal
                className="p-fluid fluid  wd-1024-768"
                footer={
                    <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={() => setShowWBS(false)} />

                }
            >
                <XLayout>
                    <XLayout_Center>
                        <WBSRenderer wbs={previewProject} readOnly={true} expandAll={false} />
                    </XLayout_Center>
                </XLayout>
            </Dialog>

            <TaskDetail ref={refSubTaskDetail} prepareData={prepareData} rootGroupId={props.rootGroupId} groups={groups} groupRequire={props.groupRequire} deadlineRequire={props.deadlineRequire} validDateRange={props.validDateRange} />
            {/*<TaskDetailQuick ref={refReferenceTask} rootGroupId={props.rootGroupId} groups={groups} onSubmitTask={onSubTaskSubmitted} groupRequire={props.groupRequire} deadlineRequire={props.deadlineRequire} validDateRange={props.validDateRange}/>*/}
            <TaskDetail miniMode={true} ref={refReferenceTask} prepareData={prepareData}
                rootGroupId={props.rootGroupId} groups={groups}
                groupRequire={props.groupRequire} deadlineRequire={props.deadlineRequire}
                validDateRange={props.validDateRange}
                onSubmitTask={onSubTaskSubmitted} />
            <TaskDocument ref={refTaskDocument} doReload={reloadDocument} userLogin={userLogin} />
            <TaskDocumentDetail ref={refTaskDocumentDetail} doReload={reloadDocumentCurrent} task={task} documents={documents} />
            <TaskNextActivity ref={refTaskNextActivity} doReload={reloadTask} onSubmitTask={onSubmitTask} />
            <InitRequestDialog ref={refInitRequestDialog} task={task} onSubmit={onSubRequestSubmitted} groupRequire={props.groupRequire} />
            <RequestDetail ref={refRequestDetail} />
        </Dialog>
    );
}

TaskDetail = forwardRef(TaskDetail);

export default TaskDetail;

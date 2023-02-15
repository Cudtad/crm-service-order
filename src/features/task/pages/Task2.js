import { XLayout, XLayout_Box, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';

import React, {  useEffect, useRef, useState } from 'react';
import _ from "lodash";
import { useNavigate } from 'react-router-dom';
import { Tooltip } from "primereact/tooltip";
import classNames from "classnames";
import CommonFunction from '@lib/common';
import moment from "moment";
import TaskDetail from "../components/TaskDetail";
import { UserAC } from "components/autocomplete/UserAC";
import TaskUtil from "../components/util/TaskUtil";
import TaskBaseApi from 'services/TaskBaseApi';
import TaskService from "services/TaskService";
import Enumeration from '@lib/enum';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Badge } from "primereact/badge";

import RequestDetail from "../components/RequestDetail";
import { UserInfo } from '@ui-lib/user-info/UserInfo';
import { Dialog } from "primereact/dialog";
import XErrorPage from '@ui-lib/x-error-page/XErrorPage';

export default function Task2(props) {
    const t = CommonFunction.t;
    const menuCode = "project-service_list_tasks_list-task-workflow";
    const [permission, setPermission] = useState(true);
    const [selectedTasks, setSelectedTasks] = useState([])
    const history = useNavigate();
    const [project, setProject] = useState(null);
    const { user } = props;
    const [userLogin, setUserLogin] = useState(null);
    const [groupTasks, setGroupTasks] = useState(null); // get task by group
    const [groups, setGroups] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const refProjectTaskDetail = useRef();
    const refInitRequestDialog = useRef();
    const [taskGroupNavigation, setTaskGroupNavigation] = useState([]);
    const refRequestDetail = useRef(null);
    const refMapTaskWorkpackage = useRef({});
    const op = useRef(null);
    // filter
    const defaultFilter = {
        type:menuCode,
        id: 0,
        groups: [],
        selectResponsibleUsers: [],
        selectedRoles: ['responsible'],
        selectResponsible: true,
        selectParticipant: false,
        selectRequester: false,
        selectCreateby: false,
        selectObserver: false,
        keyword: "",
        groupId: -1,
        states:['PENDING', 'IN_PROGRESS'],
        taskOverDue: false,
        taskTodayDue: false,
        groupIds: [],
        workflowId: 0
    };

    const [filters, setFilters] = useState([defaultFilter]);
    const [filter, setFilter] = useState(defaultFilter);
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
    const [showNameFilter, setShowNameFilter] = useState(false);

    const roleMenuItems = [
        { name: t('task.responsible'), code: 'responsible' },
        { name: t('task.participant'), code: 'participant' },
        { name: t('task.set-by-me'), code: 'set-by-me' },
        { name: t('task.create-by-me'), code: 'create-by-me' },
        { name: t('task.following'), code: 'following' },
    ]

    const taskStateMenuItems = [
        { name: t('task.state.PENDING'), code: 'PENDING' },
        { name: t('task.state.IN_PROGRESS'), code: 'IN_PROGRESS' },
        { name: t('task.state.COMPLETED'), code: 'COMPLETED' },
        { name: t('task.state.DEFERRED'), code: 'DEFERRED' },
        { name: t('task.state.CANCELED'), code: 'CANCELED' },
        { name: t('task.state.REVIEWING'), code: 'REVIEWING' },
        { name: t('task.state.TODAYDUE'), code: 'TODAYDUE' },
        { name: t('task.state.OVERDUE'), code: 'OVERDUE' },
    ]

    const [lazy, setLazy] = useState({
        page: 0,
        first: 0,
        size: 25,
        affect: {
            groups: [],
            selectResponsibleUsers: [],
            selectedRoles: ['responsible'],
            selectResponsible: true,
            selectParticipant: false,
            selectRequester: false,
            selectCreateby: false,
            selectObserver: false,
            keyword: "",
            groupId: -1,
            states:['PENDING', 'IN_PROGRESS'],
            taskOverDue: false,
            taskTodayDue: false,
            groupIds: [],
            workflowId: 0
        },
        condition: {
            groupId: -1,
            conditions:
                [
                    {
                        logicOperator: "",
                        conditionType: "GROUP",
                        filterType: "ROLE",
                        children: []
                    }
                ],
        }
    });

    let defaultRoleCondition = {
        logicOperator: "",
        conditionType: "RULE",
        filterType: "ROLE",
        fieldName: "PARTICIPANT",
        values: [window.app_context.keycloak.tokenParsed.sub]
    }

    const m = {
        CREATE: 'CREATE',
        EDIT: 'EDIT',
        MARK_IMPORTANT: 'MARK_IMPORTANT',
        ASSIGN: 'ASSIGN',
        ESCALATE: 'ESCALATE'
    }
    useEffect( () => {
        let fn = async () => {
            // user login
            let _userLogin = window.app_context.user;
            setUserLogin(_userLogin);

            // groups
            let _groups = window.app_context.user.groups;
            setGroups(_groups);

            let _lazy = _.cloneDeep(lazy);
            _lazy.affect.groupIds = _groups.map(m => "" + m.id);
            // load tasks
            loadLazyData(_lazy);
            loadFilter()
        }
        fn();

    }, [])

    /**
     * get role condition
     * @returns
     */
    const getRoleCondition = (_lazy) => {
        let conditions = [];

        // filter by group
        let _groupRoleCondition = {
            logicOperator: "",
            conditionType: "GROUP",
            filterType: "ROLE",
            children: [
                {
                    logicOperator: "",
                    conditionType: "RULE",
                    filterType: "ROLE",
                    fieldName: null,
                    values: [window.app_context.keycloak.tokenParsed.sub]
                }
            ]
        };
        let selectAll = false;
        if (!_lazy.affect.selectResponsible
            && !_lazy.affect.selectParticipant
            && !_lazy.affect.selectRequester
            && !_lazy.affect.selectCreateby
            && !_lazy.affect.selectObserver) {
            selectAll = true;
        }

        _groupRoleCondition.children = [];
        if (!selectAll) {
            if (_lazy.affect.selectParticipant) {
                let _vParticipant = {
                    ...defaultRoleCondition,
                    fieldName: "PARTICIPANT",
                    logicOperator: "OR"
                };
                _groupRoleCondition.children.push(_vParticipant);
            }

            if (_lazy.affect.selectObserver) {
                let _vObserver = {
                    ...defaultRoleCondition,
                    fieldName: "OBSERVER",
                    logicOperator: "OR"
                };
                _groupRoleCondition.children.push(_vObserver);
            }

            if (_lazy.affect.selectResponsible) {
                let _vResponsible = {
                    ...defaultRoleCondition,
                    fieldName: "RESPONSIBLE",
                    logicOperator: "OR"
                };
                _groupRoleCondition.children.push(_vResponsible);
            }

            if (_lazy.affect.selectRequester) {
                let _vRequester = {
                    ...defaultRoleCondition,
                    fieldName: "REQUESTER",
                    logicOperator: "OR"
                };
                _groupRoleCondition.children.push(_vRequester);
            }

            if (_lazy.affect.selectCreateby) {
                let _vRequester = {
                    ...defaultRoleCondition,
                    fieldName: "create_by",
                    logicOperator: "OR",
                    filterType: "FIELD",
                    fieldType: "STRING",
                    operator: "IN"
                };
                _groupRoleCondition.children.push(_vRequester);
            }
        }

        if (_groupRoleCondition.children.length > 0) {
            _groupRoleCondition.children[0].logicOperator = "";
        }

        conditions.push(_groupRoleCondition);

        // change tab index personal
        if (!CommonFunction.isEmpty(_lazy.affect.keyword)) {
            TaskUtil.addCondition(conditions, "name", null, "LIKE", _lazy.affect.keyword)
        }
         // filter by state
         if (_lazy.affect.states && _lazy.affect.states.length > 0) {
            TaskUtil.addCondition(conditions, "state", null, null, _lazy.affect.states)
        }

        TaskUtil.addCondition(conditions, "workflow_id", "LONG", "=", "0", "AND NOT")

        // filter by groups
        // if (!CommonFunction.isEmpty(_lazy.affect.groupIds)) {
        //     TaskUtil.addCondition(conditions, "group_id", "LONG", "IN", _lazy.affect.groupIds);
        // }

        // filter by due
        if (_lazy.affect.taskOverDue || _lazy.affect.taskTodayDue) {
            let dueCondition = {
                logicOperator: "AND",
                conditionType: "GROUP",
                children: []
            };

            if (_lazy.affect.taskOverDue) {
                TaskUtil.addCondition(dueCondition.children, "a.deadline < coalesce(a.closed_on, now())"
                    , "DATE_TIME", "EXPRESSION"
                    , []);
            }

            if (_lazy.affect.taskTodayDue) {
                TaskUtil.addCondition(dueCondition.children, "deadline", "DATE_TIME", "BETWEEN"
                    , [CommonFunction.formatDateISO8601((new Date()).setHours(0, 0, 0, 0)),
                    CommonFunction.formatDateISO8601((new Date()).setHours(23, 59, 59, 9999)),]);
            }

            conditions.push(dueCondition);
        }
        if (_lazy.affect.workflowId && _lazy.affect.workflowId > 0) {
            // TaskUtil.addCondition(conditions, "responsible_id", null, null, userLogin.id);
            // TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
            // TaskUtil.addCondition(conditions, "closed_on is null", null, "EXPRESSION", null);
            TaskUtil.addCondition(conditions, "workflow_id", 'LONG', null, _lazy.affect.workflowId.toString());
            // _lazy.affect.workflowId = 0;
        }

        if (_lazy.affect.selectResponsibleUsers && _lazy.affect.selectResponsibleUsers.length > 0) {
            TaskUtil.addCondition(conditions, "responsible_id", null, null
                , _lazy.affect.selectResponsibleUsers.map(m => m.id).join());
        }

        return conditions;
    }
    /**
     * set search responsible
     * @param {*} role
     * @param {*} val
     */
    const applySearchResponsibleUsers = (val) => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.selectResponsibleUsers = val;
        if (val && val.length > 0) { // remove select roles
            _lazy.affect.selectParticipant = false;
            _lazy.affect.selectObserver = false;
            _lazy.affect.selectResponsible = false;
            _lazy.affect.selectCreateby = false;
            _lazy.affect.selectRequester = false;
            _lazy.affect.selectedRoles = [];
        }
        setFilter(_lazy.affect);
        loadLazyData(_lazy)
    }
    /**
     * set select role
     * @param {*} role
     * @param {*} val
     */
    const setSelectedRole = (val) => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.selectedRoles = val
        _lazy.affect.selectParticipant = false;
        _lazy.affect.selectObserver = false;
        _lazy.affect.selectResponsible = false;
        _lazy.affect.selectCreateby = false;
        _lazy.affect.selectRequester = false;

        val.map(m => {
            if (m === 'responsible') {
                _lazy.affect.selectResponsible = true;
            } else if (m === 'participant') {
                _lazy.affect.selectParticipant = true;
            } else if (m === 'set-by-me') {
                _lazy.affect.selectRequester = true;
            } else if (m === 'create-by-me') {
                _lazy.affect.selectCreateby = true;
            } else if (m === 'following') {
                _lazy.affect.selectObserver = true;
            }
        });
        setFilter(_lazy.affect);
        loadLazyData(_lazy);
    }
    /**
     * set select role
     * @param {*} state
     * @param {*} val
     */
    const setSelectedTaskState = (val) => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.states = val;
        setFilter(_lazy.affect);
        loadLazyData(_lazy);
    };

    /**
     * set select role
     * @param {*} state
     * @param {*} val
     */
    const selectedPendWorkflow = (selected) => {
        let _lazy = _.cloneDeep(lazy);
        if (selected && selected.workflow && selected.workflowId) {
            _lazy.affect.workflowId = selected.workflowId;
        }
        loadLazyData(_lazy);
    }
    /**
     * load data
     */
    const loadLazyData = async (_lazy) => {
        setLoading(true);
        let _currentLazy = _lazy ? _lazy : lazy;
        // _currentLazy.condition.groupId = _currentLazy.affect.groupId ? _currentLazy.affect.groupId : 1;
        _currentLazy.condition.conditions = getRoleCondition(_currentLazy);

        // get data
        let res = await TaskService.getGroupTasks(_currentLazy);
        if (res) {
            _currentLazy.total = res.total;

            // prepare data
            let _data = res.content;

            // order by group
            _data = _.sortBy(_data, ["groupId", "groupName"]);
            let _taskGroupNavigation = [];

            for (const el of _data) {
                const index = _data.indexOf(el);
                if (el.groupId !== 0) {
                    el.groupName = `${t("task.work.in.phase")} "${el.group.name}"`;
                } else {
                    el.groupName = t("task.work.without.group");
                }

                el.showGroup = false;
                if (index === 0 || el.groupId !== _data[index - 1].groupId) {
                    el.showGroup = true; // show group name on first item of group
                    _taskGroupNavigation.push({
                        id: el.groupId,
                        name: el.groupName
                    });
                }

                // check if task is overdue
                if (["PENDING", "IN_PROGRESS", "DEFERRED", "REVIEWING"].indexOf(el.state) > -1
                    && el.deadline && moment(el.deadline, Enumeration.ios8601) < moment()) {
                    el.isOverDue = true;
                }

                // check if task is overdue
                if (["CANCELED", "COMPLETED"].indexOf(el.state) > -1
                    && el.deadline && el.closedOn) {
                    el.isCompleteOverDue = moment(el.deadline, Enumeration.ios8601) < moment(el.closedOn, Enumeration.ios8601);
                }

                if (el.rootType) {
                    el.rootObject = await TaskUtil.getRootDisplay(el, refMapTaskWorkpackage)
                }

                // caculate deadline
                // if (["PENDING", "IN_PROGRESS", "DEFERRED", "REVIEWING"].indexOf(el.state) > -1 && el.deadline && el.createDate) {
                //     let createDate = moment(el.createDate);
                //     let deadline = moment(el.deadline);
                //     let now = moment();

                //     if (deadline < now) {
                //         el.timePercent = 100;
                //     } else {
                //         let total = createDate.diff(deadline, 'minutes');
                //         let used = createDate.diff(moment(), 'minutes');
                //         el.timePercent = Math.ceil(used / total * 100);
                //     }
                // }
            }
            // state
            setLazy(_currentLazy);

            setGroupTasks(_data);
            setTaskGroupNavigation(_taskGroupNavigation);
            setLoading(false);
        }

    }

    /**
     * change group search
     * @param {*} val
     */
    const onChangeGroupSearch = (val) => {
        let _lazy = _.cloneDeep(lazy);
        let _groupIds = [];
        if (val) {
            _groupIds.push("" + val);
        } else {
            groups.map(m => _groupIds.push("" + m.id));
        }
        _lazy.affect.groupIds = _groupIds;
        _lazy.affect.groups = val;
        loadLazyData(_lazy);
    }

    /**
     * change search keyword
     * @param {*} val
     */
    const changeSearchKeyword = (val) => {

        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.keyword = val;
        setLazy(_lazy)
        loadLazyData(_lazy);
    }

    /**
     * create task
     */
    const createTask = () => {
        let _defaultObj = { review: true }
        refProjectTaskDetail.current.createTask(_defaultObj);
        // refTaskDetail.current.createTask(userLogin);
    };

    /**
     * create task
     */
    const createRequest = () => {
        refInitRequestDialog.current.open(userLogin);
    };

    /**
     * edit task
     * @param {*} selected
     * @param {*} mode
     */
    const editTask = async (selected, mode) => {
        // let _task = await TaskService.getById(selected.id)
        // refTaskDetail.current.editTask(_task, mode);
        refProjectTaskDetail.current.editTask(selected.id, mode);
        // refProjectTaskDetail.current.editTask(selected, mode);
    }

    /**
     * next page
     */
    const nextPage = () => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.page = lazy.page + 1;
        loadLazyData(_lazy);
    }

    /**
     * previous page
     */
    const previousPage = () => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.page = lazy.page - 1;
        loadLazyData(_lazy);
    }

    /**
     * refesh
     */
    const refresh = () => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.page = 0;
        loadLazyData(_lazy);
    }

    /**
     * toogle right panel
     */
    const toggleLeftPanel = () => {
        setShowLeftPanel(!showLeftPanel);
    }

    /**
     * scroll to
     * @param {*} elm
     */
    const scrollTo = (elm) => {
        let container = document.querySelector("#task-group-container"),
            element = document.querySelector(`#${elm}`);

        CommonFunction.scrollTo(container, element);
    }

    /**
     * view workflow process
     * @param {*} request
     */
    const viewWorkflowProcess = (task) => {
        refRequestDetail.current.init({ id: task.parentId });
    }

    const onPage = (e) => {
        let _lazy = _.cloneDeep({ ...lazy, ...e, size: e.rows });
        setLazy(_lazy);
        loadLazyData(_lazy);
    };

    /**
     * get permission
     */
    const getPermission = (_permission) => {
        setPermission(_permission[menuCode] || false);
    }

    /**
   * permission approved
   * @returns 
   */
    const checkPermissionApproved = (_task) => {
        let _hasPermission = false
        if (_task.responsibleUsers && _task.responsibleUsers.length > 0) {
            _task.responsibleUsers.map(_user => {
                if (_user.id === window.app_context.user.id) {
                    _hasPermission = true;
                }
            })
        }
        return _hasPermission
    }

    /**
     * approved request
     * @param {*} request
     */
    const approvedRequest = () => {
        let _groupTasks = _.cloneDeep(groupTasks);
        let _taskSelected = _.cloneDeep(selectedTasks);
        if (_taskSelected && _taskSelected.length > 0) {
            let _submitError = [];
            let _submitSuccess = [];
            let _notPermission = [];
            Promise.all((function* () {
                for (let i = 0; i < _taskSelected.length; i++) {
                    let _currentTask = _.cloneDeep(_taskSelected[i]);
                    let _valid = checkPermissionApproved(_currentTask)
                    if (_valid && _currentTask.name.length > 0) {
                        let _scope = TaskUtil.getTaskScope(_currentTask);
                        if (_scope === TaskUtil.const_TaskScope().REQUEST) {
                            yield new Promise(resolve => {
                                TaskService.finishActivity(_currentTask).then((_activities) => {
                                    if (_activities && _activities.length > 0) {
                                        let _submit = false;
                                        if (_activities.length === 1) {
                                            // _listTaskTicket = res.content; resolve("");
                                            if (_activities[0].state === "DONE") {
                                                _submit = true
                                            } else if (_activities[0].responsibleUsers && _activities[0].responsibleUsers.length > 0) {
                                                _activities[0].responsibleUsers = [_activities[0].responsibleUsers[0]]
                                                _activities[0].responsibleId = _activities[0].responsibleUsers[0].id;
                                                _activities[0].responsibleIds = [_activities[0].responsibleUsers[0].id];
                                                _activities[0].responsibleUser = _activities[0].responsibleUsers[0];
                                                _submit = true
                                            } else {
                                                _submit = false
                                            }
                                        }
                                        if (_submit) {
                                            let createNext = {};
                                            createNext.nextTasks = _activities;
                                            createNext.groupId = (_currentTask.groupId ? _currentTask.groupId : 0);
                                            createNext.comment = '';
                                            TaskService.createNextActivity(_currentTask.id, createNext)
                                            _submitSuccess.push(_currentTask)
                                        } else {
                                            _submitError.push(_currentTask)
                                        }
                                    }
                                    resolve("");
                                })
                            })
                        } else {
                            _submitError.push(_currentTask)
                        }
                    } else {
                        _notPermission.push(_currentTask);
                    }
                }
            })()).then(() => {
                _submitSuccess.forEach(_task => {
                    let _indexTask = _.findIndex(_groupTasks, { id: _task.id });
                    if (_indexTask > -1) {
                        _groupTasks[_indexTask].state = "COMPLETED"
                    }
                });
                if (_submitSuccess && _submitSuccess.length > 0) {
                    CommonFunction.toastSuccess(`${t("common.success.approved")}: ${_submitSuccess.length}`)
                }
                if (_submitError && _submitError.length > 0) {
                    CommonFunction.toastWarning(`${t("common.error.approved")}: ${_submitError.length}`)
                }
                if (_notPermission && _notPermission.length > 0) {
                    CommonFunction.toastError(`${t("you-do-not-have-action")}: ${_notPermission.length}`)
                }
                setSelectedTasks([])
                setGroupTasks(_groupTasks)
            });
        } else {
            CommonFunction.toastWarning(t("workflow.task.empty"))
        }
    }

    /***
      * load filter
      */
    const loadFilter = () => {
        TaskBaseApi.getFilter(menuCode).then(data => {
            if (data) {
                let _filters = [];
                if (data && data.length > 0) {
                    data.map(_filter => {
                        _filters.push({
                            type: menuCode,
                            id: _filter.id,
                            name: _filter.filterName,

                            groups:_filter.config.groups,
                            selectResponsibleUsers: _filter.config.selectResponsibleUsers,
                            selectedRoles:_filter.config.selectedRoles,
                            selectResponsible:_filter.config.selectResponsible,
                            selectParticipant: _filter.config.selectParticipant,
                            selectRequester: _filter.config.selectRequester,
                            selectCreateby: _filter.config.selectCreateby,
                            selectObserver:_filter.config.selectObserver ,
                            groupId: _filter.config.groupId,
                            states:_filter.config.states,
                            taskOverDue:_filter.config.taskOverDue ,
                            taskTodayDue: _filter.config.taskTodayDue,
                            groupIds: _filter.config.groupIds,
                            workflowId: _filter.config.workflowId
                        })
                    })
                }
                setFilters(_filters);
            }
        })
    };

    /**
     * update filter
     * @param {*} val
     */
    const hideFilterName = () => {
        setShowNameFilter(false)
    };

    /***
    * change filter
    */
    const applyChangeSelectedFilter = (val) => {
        let _lazy = _.cloneDeep(lazy)
        _lazy.affect = val;

        loadLazyData(_lazy);
        setFilter(val);
        setSelectedFilter(val);
    }

    /**
    * change search keyword
    * @param {*} val
    */
    const applyChangeFilterName = (val) => {
        let _filter = _.cloneDeep(filter);
        _filter.name = val;
        setFilter(_filter);
    };

    /**
     * update filter
     * @param {*} val
     */
    const submitFilter = (mode) => {
        let _filter = _.cloneDeep(filter);
        let _filters = _.cloneDeep(filters);
        if (mode && mode === "create") {
            _filter.id = 0;
        }
        if (mode && mode === "update" && !_filter.id) {
            setFilter(_filter);
            createFilter();
            return
        }
        _filter.type = menuCode;
        TaskBaseApi.updateFilter(_filter).then((res) => {
            if (res) {
                let _index = _.findIndex(_filters, { id: _filter.id });
                if (_index > -1) {
                    _filters[_index] = _filter
                } else {
                    _filter.id = res.id
                    _filters.push(_filter)
                }
                hideFilterName();
                setFilters(_filters);
                setSelectedFilter(_filter);
                CommonFunction.toastSuccess(t('common.save-success'));
            }
        })
    };

    /**
     * create filter
     * @param {*} val
     */
    const deleteFilter = () => {
        let _filter = _.cloneDeep(filter);
        let _filters = _.cloneDeep(filters);
        if (_filter.id && _filter.name) {
            TaskBaseApi.deleteFilter(_filter).then(res => {
                if (res) {
                    let _index = _.findIndex(_filters, { id: _filter.id });
                    if (_index > -1) {
                        _filters.splice(_index, 1);
                    }
                    setFilters(_filters);
                    setFilter({..._filter,id:0});
                    CommonFunction.toastSuccess(t("common.deleted"));
                }
            }).catch(error => {
                CommonFunction.toastError(error)
            })
        }
    };

    /**
     * create filter
     * @param {*} val
     */
    const createFilter = () => {
        setShowNameFilter(true)
    };

    try {
        return (<>
            <XLayout className="p-2">
                <XLayout_Top>
                    <XToolbar
                        className="p-0 mb-2"
                        left={() => (
                            <>
                                <Button
                                    label={t('common.quick-approved')}
                                    icon="bx bx-check-double"
                                    onClick={() => approvedRequest()}
                                ></Button>
                            </>
                        )}
                        right={() => (<>
                            <span className="p-input-icon-left">
                                <i className="bx bx-search-alt" />
                                <InputText
                                    onInput={(e) => CommonFunction.debounce(null, changeSearchKeyword, e.target.value)}
                                    placeholder={t("common.search")} />
                            </span>
    
                            <Button icon="bx bx-filter'" className="p-button-rounded p-button-text" onClick={(e) => op.current.toggle(e)} />
    
                        </>)}
                    >
                    </XToolbar>
                </XLayout_Top>
                <XLayout_Center>
                    <XLayout_Box className="h-full p-0 position-relative">
                        <DataTable
                            loading={loading}
                            value={groupTasks}
                            dataKey="id"
                            className="p-datatable-gridlines p-datatable-paging border-none"
                            emptyMessage={t('common.no-record-found')}
                            scrollable
                            scrollDirection='both'
                            scrollHeight='flex'
                            lazy
                            paginator
                            first={lazy.first}
                            rows={lazy.size}
                            totalRecords={lazy.total}
                            rowsPerPageOptions={[20, 25, 50, 100, 150]}
                            onPage={onPage}
                            paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} - {last} / {totalRecords}"
                            selection={selectedTasks}
                            selectionMode="checkbox"
                            onSelectionChange={e => {
                                let _data = _.filter(e.value, function (o) {
                                    return ((o.state !== "COMPLETED") && (o.state !== "CANCELED"))
                                });
                                setSelectedTasks(_data)
                            }}
                        >
                            <Column frozen selectionMode="multiple" style={{ flex: '0 0 40px', textAlign: "center" }}></Column>
                            <Column header={t('task.state')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => {
                                    return (
                                        <div className="flex flex-column">
                                            <div className="flex align-items-center pb-2">
                                                <span style={{ borderRadius: '6px' }}
                                                    className={classNames({
                                                        "user-task-state p-1": true,
                                                        "PENDING bg-grey-4": task.state === "PENDING",
                                                        "IN_PROGRESS bg-light-green-3": task.state === "IN_PROGRESS",
                                                        "DEFERRED bg-orange-3": task.state === "DEFERRED",
                                                        "CANCELED bg-red-3": task.state === "CANCELED",
                                                        "COMPLETED bg-blue-3": task.state === "COMPLETED",
                                                        "REVIEWING bg-purple-2": task.state === "REVIEWING"
                                                    })}
                                                >{_.find(taskStateMenuItems, { "code": task.state }) ? _.find(taskStateMenuItems, { "code": task.state })["name"] : ''}</span>
                                                <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom" />
                                                <i className={classNames({
                                                    "user-important-task task-list-quick-action ml-1 mr-2": true,
                                                    "bx bx-tag-alt text-grey-7": !task.important,
                                                    "bx bxs-tag-alt text-yellow-9": task.important
                                                })} />
                                            </div>
                                        </div>
                                    )
                                }}>
                            </Column>
                            <Column header={t('task.name')}
                                style={{ flex: '1 0 300px' }}
                                body={(task) => (
                                    <span onClick={() => editTask(task, m.EDIT)} className="bold-and-color link-button mr-2">
                                        {task.name}
                                    </span>
                                )}>
                            </Column>
                            <Column header={t('common.workflow')}
                                style={{ flex: '0 0 300px' }}
                                body={(task) => (
                                    <React.Fragment>
                                        {(task.workFlow || task.activity) &&
                                            <div className="task-workflow-info task-view-process link-button mb-1" onClick={() => viewWorkflowProcess(task)}>
                                                <Tooltip target=".task-view-process" content={t("request.view-process")} position="bottom" />
                                                <div className="flex flex-column">
                                                    {task.workFlow &&
                                                        <div>
                                                            <span className='bx bx-git-branch mr-1 text-grey-6'></span>
                                                            <span className="mr-1 text-grey-8">{task.workFlow.name}</span>
                                                        </div>
                                                    }
                                                    {task.activity && task.activity.name &&
                                                        <div>
                                                            <span className='bx bx-radio-circle-marked mr-1 text-grey-6'></span>
                                                            <span className="mr-1 text-grey-8">{task.activity.name}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </React.Fragment>
                                )}>
                            </Column>
                            <Column header={t('workflow.position.requester')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => (
                                    <UserInfo className="p-m-auto" id={task.requestedByUser.id} />
                                )}>
                            </Column>
                            <Column header={t('workflow.position.responsible')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => (
                                    <UserInfo className="p-m-auto" id={task.responsibleUser.id} />
                                )}>
                            </Column>
                            <Column header={t('common.startdate')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => {
                                    return CommonFunction.formatDateTime(task.startDate)
                                }}>
                            </Column>
                            <Column header={t('common.deadline')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => {
                                    return (<>{CommonFunction.formatDateTime(task.deadline)}{TaskUtil.getDueDisplay(task)}</>)
                                }}>
                            </Column>
                            <Column header={t('closeDate')}
                                style={{ flex: '0 0 150px', textAlign: 'center' }}
                                body={(task) => {
                                    return CommonFunction.formatDateTime(task.closedOn)
                                }}>
                            </Column>
                            <Column
                                frozen
                                alignFrozen='right'
                                headerClassName='frozen-right-first-column'
                                bodyClassName='p-0 flex justify-content-center align-items-center border-all frozen-right-first-column'
                                body={(task) => (
                                    <Button
                                        className="p-button-rounded p-button-text"
                                        icon="bx bx-pencil"
                                        tooltip={t('common.update')}
                                        tooltipOptions={{ position: "bottom" }}
                                        onClick={() => editTask(task, m.EDIT)}
                                    ></Button>
                                )}
                                style={{ flex: "0 0 60px" }}
                            ></Column>
                        </DataTable>
                    </XLayout_Box>
                </XLayout_Center>
            </XLayout>
    
            {/* <ProjectManagement_Ot_Detail ref={refOtDetail} project={project} projectGroups={projectGroups} /> */}
            <TaskDetail permission={permission} project={project} ref={refProjectTaskDetail} groups={groups}
                tasks={groupTasks} onSubmitTask={refresh} />
            {/* <InitRequestDialog ref={refInitRequestDialog} groups={groups} groupRequire={true} /> */}
            <RequestDetail ref={refRequestDetail} />
    
            <OverlayPanel ref={op} className="x-menu">
                <XLayout>
                    <XLayout_Top className="pb-2 mb-2 border-bottom">
                        <XToolbar
                            left={() => (<>
                                <Dropdown
                                    
                                    value={selectedFilter}
                                    options={filters}
                                    optionLabel="name"
                                    filter
                                    onChange={(e) => { applyChangeSelectedFilter(e.value) }}
                                />
                            </>)}
                            right={() => (
                                <>
                                    <Button icon="bx bx-save" className="p-button-text" tooltip={t('common.save')} onClick={() => submitFilter("update")}></Button>
                                    <Button icon="bx bx-filter' create" tooltip={t('common.create')} onClick={() => createFilter()}></Button>
                                    <Button icon="bx bx-trash" tooltip={t('delete')} onClick={() => deleteFilter()}></Button>
                                </>
                            )}
                        ></XToolbar>
                    </XLayout_Top>
                    <XLayout_Center>
                        <div className="grid formgrid p-fluid fluid " style={{ width: '450px' }}>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <Dropdown
                                        filter showClear
                                        filterBy="name" id="group"
                                        value={lazy.affect.groups} options={groups}
                                        onChange={(e) => onChangeGroupSearch(e.target.value)}
                                        optionLabel="name" optionValue="id"
                                        // placeholder={t("task.owner.task")}
                                        inputId="group-filter"
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
                                    <label htmlFor="group-filter">{t("task.owner.task")}</label>
                                </span>
                            </div>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <UserAC
                                        id="responsible-user-id"
                                        value={lazy.affect.selectResponsibleUsers}
                                        // groupIds={[project.groupId]}
                                        onChange={(e) => applySearchResponsibleUsers(e.value)}
                                    />
                                    <label htmlFor="responsible-user-id">{t('issue.responsibleUsers')}</label>
                                </span>
                            </div>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <MultiSelect optionLabel="name" optionValue="code"
                                        display="chip"
                                        value={lazy.affect.selectedRoles}
                                        inputId="role-filter"
                                        options={roleMenuItems} onChange={(e) => setSelectedRole(e.value)} />
                                    <label htmlFor="role-filter">{t("task.filter.role")}</label>
                                </span>
                            </div>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <MultiSelect optionLabel="name" optionValue="code"
                                        display="chip"
                                        value={lazy.affect.states}
                                        inputId="state-filter"
                                        options={taskStateMenuItems} onChange={(e) => setSelectedTaskState(e.value)} />
                                    <label htmlFor="state-filter">{t("task.filter.state")}</label>
                                </span>
                            </div>
                        </div>
                    </XLayout_Center>
                </XLayout>
            </OverlayPanel>
            <Dialog
                header={t('common.filter.name')}
                visible={showNameFilter}
                modal
                style={{ width: '300px'}}
                footer={
                    <>
                        <Button label={t('common.close')} icon="bx bx-x" className="p-button-text text-muted" onClick={hideFilterName} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={() => submitFilter("create")} />
                    </>
                }
                onHide={hideFilterName}>
                <XLayout>
                    <XLayout_Center>
                        <div className="p-fluid fluid ">
                            <span>
                                <InputText
                                    className="mr-2"
                                    onInput={(e) => CommonFunction.debounce(null, applyChangeFilterName, e.target.value)}
                                    placeholder={t("common.search")} />
                            </span>
                        </div>
                    </XLayout_Center>
                </XLayout>
            </Dialog>
        </>);
    } catch (error){
        return <XErrorPage error={error}></XErrorPage>
    }

}

import React, { useEffect, useRef, useState} from 'react';
import PageHeader from "../../../components/page-header/PageHeader";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import classNames from "classnames";

import {Badge} from "primereact/badge";
import TaskService from "services/TaskService";
import CommonFunction from '@lib/common';
import {Checkbox} from "primereact/checkbox";
import {Dropdown} from "primereact/dropdown";
import {Chip} from "primereact/chip";

import _ from "lodash";
import TaskDetail from "../components/TaskDetail";
import {TabPanel, TabView} from "primereact/tabview";
import "../scss/Task.scss"
import EmptyData from "@xdp/ui-lib/dist/components/empty-data/EmptyData";
import {Tooltip} from 'primereact/tooltip';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import moment from 'moment';
import RequestDetail from '../components/RequestDetail';
import Enumeration from '@lib/enum';
import appSettings from 'appSettings';

export default function Task() {
    const t = CommonFunction.t;
    const { user } = props;
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectResponsible, setSelectResponsible] = useState(false);
    const [selectParticipant, setSelectParticipant] = useState(false);
    const [selectRequester, setSelectRequester] = useState(false);
    const [selectCreateby, setSelectCreateby] = useState(false);
    const [selectObserver, setSelectObserver] = useState(false);
    const [userLogin, setUserLogin] = useState(null);
    const [groupTasks, setGroupTasks] = useState(null); // get task by group
    const [groups, setGroups] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const refTaskDetail = useRef();
    const [searchGroupId, setSearchGroupId] = useState(null);
    const [taskGroupNavigation, setTaskGroupNavigation] = useState([]);
    const [taskStatePending, setTaskStatePending] = useState(true);
    const [taskStateInProgress, setTaskStateInProgress] = useState(true);
    const [taskStateDeferred, setTaskStateDeferred] = useState(false);
    const [taskStateCancelled, setTaskStateCancelled] = useState(false);
    const [taskStateCompleted, setTaskStateCompleted] = useState(false);
    const [taskStateReviewing, setTaskStateReviewing] = useState(false);
    const [taskOverDue, setTaskOverDue] = useState(false);
    const [taskTodayDue, setTaskTodayDue] = useState(false);
    const refRequestDetail = useRef(null);


    const [lazy, setLazy] = useState({
        page: 0,
        size: 25,
        affect: {
            selectResponsible: false,
            selectParticipant: false,
            selectRequester: false,
            selectCreateby: false,
            selectObserver: false,
            activeTabIndex: 0,
            keyword: "",
            groupId: -1,
            taskStatePending: true,
            taskStateInProgress: true,
            taskStateDeferred: false,
            taskStateCancelled: false,
            taskStateCompleted: false,
            taskStateReviewing: false,
            taskOverDue: false,
            taskTodayDue: false
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

    /**
     * onetime
     */
    useEffect(() => {
        // user login
        let _userLogin = window.app_context.user;
        setUserLogin(_userLogin);

        // groups
        let _groups = window.app_context.user.groups;
        setGroups(_groups);

        // load tasks
        loadLazyData();
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

        // filter by keywork
        if (!CommonFunction.isEmpty(_lazy.affect.keyword)) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "name",
                operator: "LIKE",
                values: [_lazy.affect.keyword]
            });
        }

        // filter by state
        let states = ["PENDING", "IN_PROGRESS", "DEFERRED", "CANCELED", "COMPLETED", "REVIEWING"];
        if (_lazy.affect.taskStatePending
            || _lazy.affect.taskStateInProgress
            || _lazy.affect.taskStateDeferred
            || _lazy.affect.taskStateCancelled
            || _lazy.affect.taskStateCompleted
            || _lazy.affect.taskStateReviewing
        ) {
            states = [];
            if (_lazy.affect.taskStatePending) states.push("PENDING");
            if (_lazy.affect.taskStateInProgress) states.push("IN_PROGRESS");
            if (_lazy.affect.taskStateDeferred) states.push("DEFERRED");
            if (_lazy.affect.taskStateCancelled) states.push("CANCELED");
            if (_lazy.affect.taskStateCompleted) states.push("COMPLETED");
            if (_lazy.affect.taskStateReviewing) states.push("REVIEWING");
        }

        let _stateCondition = {
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "STRING",
            fieldName: "state",
            operator: "IN",
            values: states
        };

        // filter by due
        if (_lazy.affect.taskOverDue || _lazy.affect.taskTodayDue) {
            let dueCondition = {
                logicOperator: "AND",
                conditionType: "GROUP",
                children: []
            };

            if (_lazy.affect.taskOverDue) {
                dueCondition.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "FIELD",
                    fieldType: "DATE_TIME",
                    fieldName: "a.deadline < coalesce(a.closed_on, now()) ",
                    operator: "EXPRESSION",
                    values: []
                })
            }

            if (_lazy.affect.taskTodayDue) {
                dueCondition.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "FIELD",
                    fieldType: "DATE_TIME",
                    fieldName: "deadline",
                    operator: "BETWEEN",
                    values: [
                        CommonFunction.formatDateISO8601((new Date()).setHours(0, 0, 0, 0)),
                        CommonFunction.formatDateISO8601((new Date()).setHours(23, 59, 59, 9999)),
                    ]
                })
            }

            conditions.push(dueCondition);
        }

        conditions.push(_stateCondition);

        return conditions;
    }

    /**
     * set select role
     * @param {*} role
     * @param {*} val
     */
    const setSelectRole = (role, val) => {
        let _lazy = _.cloneDeep(lazy);

        // set state and change affect affect value
        switch (role) {
            case 'PARTICIPANT':
                setSelectParticipant(val);
                _lazy.affect.selectParticipant = val;
                break;
            case 'OBSERVER':
                setSelectObserver(val);
                _lazy.affect.selectObserver = val;
                break;
            case 'RESPONSIBLE':
                setSelectResponsible(val);
                _lazy.affect.selectResponsible = val;

                break;
            case 'CREATEBY':
                setSelectCreateby(val);
                _lazy.affect.selectCreateby = val;
                break;
            case 'REQUESTBY':
                setSelectRequester(val);
                _lazy.affect.selectRequester = val;
                break;
        }

        loadLazyData(_lazy);
    }

    /**
    * set select role
    * @param {*} state
    * @param {*} val
    */
    const setSelectState = (state, val) => {
        let _lazy = _.cloneDeep(lazy);

        // set state and change affect affect value
        switch (state) {
            case 'PENDING':
                setTaskStatePending(val);
                _lazy.affect.taskStatePending = val;
                break;
            case 'IN_PROGRESS':
                setTaskStateInProgress(val);
                _lazy.affect.taskStateInProgress = val;
                break;
            case 'DEFERRED':
                setTaskStateDeferred(val);
                _lazy.affect.taskStateDeferred = val;
                break;
            case 'CANCELED':
                setTaskStateCancelled(val);
                _lazy.affect.taskStateCancelled = val;
                break;
            case 'COMPLETED':
                setTaskStateCompleted(val);
                _lazy.affect.taskStateCompleted = val;
                break;
            case 'REVIEWING':
                setTaskStateReviewing(val);
                _lazy.affect.taskStateReviewing = val;
                break;
            case 'TODAYDUE':
                setTaskTodayDue(val);
                _lazy.affect.taskTodayDue = val;
                break;
            case 'OVERDUE':
                setTaskOverDue(val);
                _lazy.affect.taskOverDue = val;
                break;
            default:
                break;
        }

        loadLazyData(_lazy);
    }

    /**
     * load data
     */
    const loadLazyData = async (_lazy) => {
        setLoading(true);

        _lazy = _lazy ? _lazy : lazy;
        _lazy.condition.groupId = _lazy.affect.groupId ? _lazy.affect.groupId : 1;
        _lazy.condition.conditions = getRoleCondition(_lazy);

        // get data
        let res = null;
        if (_lazy.affect.activeTabIndex === 1) {
            if (_lazy.condition.groupId && _lazy.condition.groupId > 0) {
                res = await TaskService.getGroupTasks(_lazy);
            }
            else {
                res = await TaskService.getUserTasks(_lazy);
            }
        } else if (_lazy.affect.activeTabIndex === 0) {
            res = await TaskService.getRequestTasks(_lazy);
        }

        if (res) {

            // prepare lazy
            _lazy.page = res.page;
            _lazy.size = res.pageSize;
            _lazy.total = res.total;
            _lazy.from = res.page * res.pageSize + 1;
            _lazy.to = Math.min(res.page * res.pageSize + res.pageSize, res.total);
            _lazy.last = (res.page + 1) * res.pageSize >= res.total;
            _lazy.first = res.page === 0;

            // prepare data
            let _data = res.content;

            // order by group
            _data = _.sortBy(_data, ["groupId", "groupName"]);
            let _taskGroupNavigation = [];

            _data.forEach((el, index) => {
                el.groupName = el.groupId === 0 ? t("task.work.without.group") : `${t("task.work.in.group")} ${el.group.name}`;

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
            });

            // state
            setLazy(_lazy);
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
        _lazy.affect.groupId = val ? val : - 1;
        setSearchGroupId(val);
        loadLazyData(_lazy);
    }

    /**
     * change search keyword
     * @param {*} val
     */
    const changeSearchKeywork = (val) => {

        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.keyword = val;
        setLazy(_lazy)
        loadLazyData(_lazy);
    }

    /**
     * create task
     */
    const createTask = () => {
        refTaskDetail.current.createTask(userLogin);
    }

    /**
     * edit task
     * @param {*} selected
     * @param {*} mode
     */
    const editTask = async (selected, mode) => {
        let _task = await TaskService.getById(selected.id)
        if (activeIndex === 1) {
            refTaskDetail.current.editTask(_task, mode);
        } else if (activeIndex === 0) {
            refTaskDetail.current.editTask(_task, mode, 'REQUEST');
        }

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
     * change selected tab
     * @param {*} index
     */
    const changeTab = (index) => {

        let _lazy = { ...lazy };
        _lazy.affect.activeTabIndex = index;
        setActiveIndex(index);
        loadLazyData(_lazy);
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

    return (
        <div className="page-container overflow-hidden">
            <PageHeader title={t('menu.task')} breadcrumb={[t('menu.task')]} />
            <div className="flex w-full h-full task-page-container overflow-hidden">
                <div className={classNames({
                    "task-page-left-panel": true,
                    "task-page-left-panel-hidden": !showLeftPanel
                })}>
                    <div className="width-fit-content mb-3">
                        <Button label={t("task.create")} icon="bx bx-plus" className="p-button-success" onClick={createTask} />
                    </div>
                    {/* filter */}
                    <span className="group-title mb-2">{t("task.filter")}</span>
                    <div className="p-fuild mb-3">
                        <span className="p-input-icon-left w-full mb-1">
                            <i className="bx bx-search-alt" />
                            <InputText
                                className="w-full"
                                onInput={(e) => CommonFunction.debounce(null, changeSearchKeywork, e.target.value)}
                                placeholder={t("common.search")} />
                        </span>

                        <Dropdown
                            filter
                            showClear
                            filterBy="name"
                            id="group"
                            value={searchGroupId}
                            options={groups}
                            className="w-full"
                            onChange={(e) => onChangeGroupSearch(e.target.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder={t("task.owner.task")}
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

                    {/* category filter */}
                    <div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="task-category-filter-responsible" checked={selectResponsible} onChange={e => setSelectRole('RESPONSIBLE', e.checked)} />
                            <label htmlFor="task-category-filter-responsible">{t('task.responsible')}</label>
                        </div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="task-category-filter-participant" checked={selectParticipant} onChange={e => setSelectRole('PARTICIPANT', e.checked)} />
                            <label htmlFor="task-category-filter-participant">{t('task.participant')}</label>
                        </div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="task-category-filter-set-by-me" checked={selectRequester} onChange={e => setSelectRole('REQUESTBY', e.checked)} />
                            <label htmlFor="task-category-filter-set-by-me">{t('task.set-by-me')}</label>
                        </div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="task-category-filter-create-by-me" checked={selectCreateby} onChange={e => setSelectRole('CREATEBY', e.checked)} />
                            <label htmlFor="task-category-filter-create-by-me">{t('task.create-by-me')}</label>
                        </div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="task-category-filter-following" checked={selectObserver} onChange={e => setSelectRole('OBSERVER', e.checked)} />
                            <label htmlFor="task-category-filter-following">{t('task.following')}</label>
                        </div>
                    </div>

                    <span className="group-title">{t("task.state")}</span>
                    {/* state filter */}
                    <div className="grid mb-2 mt-2-5">
                        <div className="p-col">
                            <div className="p-field-checkbox text-grey-7">
                                <Checkbox inputId="task-state-pending" checked={taskStatePending} onChange={e => setSelectState('PENDING', e.checked)} />
                                <label htmlFor="task-state-pending">{t('task.state.PENDING')}</label>
                            </div>
                            <div className="p-field-checkbox text-teal">
                                <Checkbox inputId="task-state-in-progress" checked={taskStateInProgress} onChange={e => setSelectState('IN_PROGRESS', e.checked)} />
                                <label htmlFor="task-state-in-progress">{t('task.state.IN_PROGRESS')}</label>
                            </div>
                            <div className="p-field-checkbox text-green-9">
                                <Checkbox inputId="task-state-completed" checked={taskStateCompleted} onChange={e => setSelectState('COMPLETED', e.checked)} />
                                <label htmlFor="task-state-completed">{t('task.state.COMPLETED')}</label>
                            </div>
                            <div className="p-field-checkbox text-orange-9">
                                <Checkbox inputId="task-state-deferred" checked={taskStateDeferred} onChange={e => setSelectState('DEFERRED', e.checked)} />
                                <label htmlFor="task-state-deferred">{t('task.state.DEFERRED')}</label>
                            </div>
                            <div className="p-field-checkbox text-red-9">
                                <Checkbox inputId="task-state-cancelled" checked={taskStateCancelled} onChange={e => setSelectState('CANCELED', e.checked)} />
                                <label htmlFor="task-state-cancelled">{t('task.state.CANCELED')}</label>
                            </div>

                            <div className="p-field-checkbox text-purple">
                                <Checkbox inputId="task-state-reviewing" checked={taskStateReviewing} onChange={e => setSelectState('REVIEWING', e.checked)} />
                                <label htmlFor="task-state-reviewing">{t('task.state.REVIEWING')}</label>
                            </div>
                        </div>

                        <div className="p-col">
                            <div className="p-field-checkbox">
                                <Checkbox inputId="task-state-todaydue" checked={taskTodayDue} onChange={e => setSelectState('TODAYDUE', e.checked)} />
                                <label htmlFor="task-state-todaydue">{t('task.state.TODAYDUE')}</label>
                            </div>
                            <div className="p-field-checkbox">
                                <Checkbox inputId="task-state-in-overdue" checked={taskOverDue} onChange={e => setSelectState('OVERDUE', e.checked)} />
                                <label htmlFor="task-state-in-overdue">{t('task.state.OVERDUE')}</label>
                            </div>
                        </div>

                    </div>

                    {/* group filter */}
                    <span className="group-title">{t("task.type-navigation")}</span>
                    <div className="flex mt-2 p-flex-wrap">
                        {taskGroupNavigation.map((group, index) => (
                            <div key={index} className="pointer" onClick={() => scrollTo(`task-group-index-${group.id}`)}>
                                <Chip key={index} label={group.name} className="dense mr-2 mb-2" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="task-page-right-panel position-relative border-all">
                    <LoadingBar loading={loading} top={46} />
                    <div className="task-toolbar flex justify-content-between border-bottom p-1">
                        <div className="task-toolbar-tools">
                            <Button
                                icon={classNames({
                                    "bx bx-menu-alt-left": showLeftPanel,
                                    "bx bx-menu-alt-right": !showLeftPanel
                                })}
                                className="p-button-rounded p-button-text p-button-secondary"
                                onClick={toggleLeftPanel}
                                tooltip={showLeftPanel ? t('task.hide-left-panel') : t('task.show-left-panel')}
                                tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />
                            <Button
                                icon="bx bx-refresh"
                                className="p-button-rounded p-button-text p-button-secondary"
                                onClick={refresh}
                                tooltip={t('button.refresh')}
                                tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />
                        </div>
                        <div className="task-toolbar-paging flex align-items-center">
                            <span>{lazy.from}</span>
                            <span className="mr-1 ml-1">-</span>
                            <span>{lazy.to}</span>
                            <span className="mr-1 ml-1">/</span>
                            <span>{lazy.total}</span>
                            <Button
                                icon="bx bx-chevron-left"
                                className="p-button-rounded p-button-text p-button-secondary ml-2"
                                onClick={previousPage}
                                disabled={lazy.first}
                                tooltip={t('button.newer')}
                                tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />

                            <Button
                                icon="bx bx-chevron-right"
                                className="p-button-rounded p-button-text p-button-secondary"
                                onClick={nextPage}
                                disabled={lazy.last}
                                tooltip={t('button.older')}
                                tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />
                        </div>
                    </div>
                    {/* Fake tab - just for filter data */}
                    <TabView
                        className="task-page-tab"
                        activeIndex={activeIndex}
                        onTabChange={(e) => changeTab(e.index)}
                    >
                        <TabPanel leftIcon="bx bx-git-branch" header={t('task.in.request')} id="tabRequest" >
                        </TabPanel>
                        <TabPanel leftIcon="bx bx-user" header={t('task.personal')} id="tabPerson" >
                        </TabPanel>
                    </TabView>


                    {/* Real data display */}
                    <div id="task-group-container" className="flex flex-column w-full h-full overflow-auto task-items-container">

                        {groupTasks && groupTasks.length === 0 &&
                            <EmptyData message={t("task.empty-task")}>
                                <Button label={t("task.create")} icon="bx bx-plus" className="p-button-success" onClick={createTask} />
                            </EmptyData>
                        }

                        {groupTasks && groupTasks.length > 0 && groupTasks.map((task, index) => (
                            <React.Fragment key={index}>
                                {task.showGroup && (
                                    <div className="x-group mb-0 pt-2 pl-2" id={`task-group-index-${task.groupId}`}>
                                        <span>{task.groupName}</span>
                                    </div>
                                )}

                                <div className="border-bottom flex align-items-stretch justify-content-between task-item-container">

                                    <div className="task-item-actions">
                                        {/* <i className='bx bx-dots-vertical-rounded link-button text-grey-8' onClick={(e) => handleRequestMenu(e, request)}></i> */}
                                        <Tooltip target=".request-item-action-view-process" content={t("request.view-process")} position="bottom" />
                                        <Tooltip target=".request-item-action-edit" content={t("task.update")} position="bottom" />
                                        <i className='bx bx-git-branch link-button text-grey-7 small request-item-action-view-process' onClick={() => viewWorkflowProcess(task)}></i>
                                        <i className='bx bx-pencil link-button text-grey-7 small request-item-action-edit' onClick={() => editTask(task, m.EDIT)}></i>
                                    </div>

                                    <div className="flex align-items-center p-1">
                                        <div className="flex flex-column">
                                            <div className="flex align-items-center">
                                                <Tooltip target={`.user-task-state.${task.state}`} content={t(`request.task.state.${task.state}`)} position="bottom" />
                                                <i className={classNames({
                                                    "user-task-state task-list-quick-action bx": true,
                                                    "PENDING bx-pause text-grey-7": task.state === "PENDING",
                                                    "IN_PROGRESS bx-play text-teal": task.state === "IN_PROGRESS",
                                                    "DEFERRED bx-stopwatch text-orange-9": task.state === "DEFERRED",
                                                    "CANCELED bx-x text-red-9": task.state === "CANCELED",
                                                    "COMPLETED bx-check text-green": task.state === "COMPLETED",
                                                    "REVIEWING bx-help text-purple": task.state === "REVIEWING"
                                                })} />

                                                <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom" />
                                                <i className={
                                                    classNames({
                                                        "user-important-task task-list-quick-action ml-1 mr-2": true,
                                                        "bx bx-tag-alt text-grey-7": !task.important,
                                                        "bx bxs-tag-alt text-yellow-9": task.important
                                                    })}
                                                />

                                                <span
                                                    onClick={() => editTask(task, m.EDIT)}
                                                    className="bold-and-color link-button mr-2"
                                                >
                                                    {task.name}
                                                </span>

                                                {/* <Tooltip target={`.task-page-request-by-user-tooltip`} content={t("task.requestBy")} position="bottom" />
                                                <Chip
                                                    label={task.requestedByUser.fullName}
                                                    image={
                                                        task.requestedByUser.avatar
                                                            ? `${appSettings.api.url}/storage/file/preview/${task.requestedByUser.avatar}`
                                                            : `https://ui-avatars.com/api/?background=random&name=${task.requestedByUser.fullName}`
                                                    }
                                                    className="tiny text-ellipsis task-page-request-by-user-tooltip" />

                                                <i className="bx bx-right-arrow-alt text-primary mr-1 ml-1"></i>

                                                <Tooltip target={`.task-page-responsible-by-user-tooltip`} content={t("task.responsibleUsers")} position="bottom" />
                                                <Chip
                                                    label={task.responsibleUser.fullName}
                                                    image={
                                                        task.responsibleUser.avatar
                                                            ? `${appSettings.api.url}/storage/file/preview/${task.responsibleUser.avatar}`
                                                            : `https://ui-avatars.com/api/?background=random&name=${task.responsibleUser.fullName}`
                                                    }
                                                    className="tiny text-ellipsis task-page-responsible-by-user-tooltip" /> */}

                                                {/* {task.timePercent &&
                                                    <div className={classNames({
                                                        "flex align-items-center ml-2": true,
                                                        "text-green": task.timePercent < 70,
                                                        "text-orange": task.timePercent >= 70 && task.timePercent < 85,
                                                        "text-red": task.timePercent >= 85
                                                    })}>
                                                        <Tooltip target={`.task-page-task-deadline`} content={t("task.deadline")} position="bottom" />
                                                        <i className='bx bx-timer'></i>
                                                        <small className="task-page-task-deadline ml-1">{CommonFunction.formatDateTime(task.deadline)}</small>
                                                    </div>
                                                } */}
                                            </div>
                                            <div className="task-workflow-info flex align-items-center mb-1" >

                                                <div className='bx bx-user h-full text-grey-6 mr-1'></div>
                                                <span className="text-grey-8 mr-1">{t("task.list.request-by")}</span>
                                                <Chip
                                                    label={task.requestedByUser.fullName}
                                                    image={CommonFunction.getImageUrl(task.requestedByUser.avatar, task.requestedByUser.fullName)}
                                                    className="tiny text-ellipsis task-page-request-by-user-tooltip" />

                                                <i className="bx bx-right-arrow-alt text-primary mr-1 ml-1"></i>

                                                <Chip
                                                    label={task.responsibleUser.fullName}
                                                    image={CommonFunction.getImageUrl(task.responsibleUser.avatar, task.responsibleUser.fullName)}
                                                    className="tiny text-ellipsis task-page-responsible-by-user-tooltip" />

                                                {task.deadline &&
                                                    <div className="ml-2">
                                                        <span className='bx bx-timer text-grey-6'></span>
                                                        <span className="task-page-task-deadline ml-1 text-grey-8">
                                                            {`${t("task.due")}: `}
                                                        </span>
                                                        <span className={classNames({
                                                            "task-page-task-deadline": true,
                                                            "text-red": task.isOverDue,
                                                            "text-grey-8": !task.isOverDue
                                                        })}>
                                                            {CommonFunction.formatDateTime(task.deadline)}
                                                        </span>

                                                    </div>
                                                }

                                                {(task.state === "CANCELED" || task.state === "COMPLETED") && task.closedOn &&
                                                    <div className="ml-2">
                                                        <span className='bx bx-calendar-check text-grey-6'></span>
                                                        <span className="task-page-task-deadline ml-1 text-grey-8">
                                                            {`${t("task.close")}: `}
                                                        </span>
                                                        <span className={classNames({
                                                            "task-page-task-deadline ml-1": true,
                                                            "text-grey-8": !task.deadline,
                                                            "text-red": task.deadline && task.isCompleteOverDue === true,
                                                            "text-green": task.deadline && task.isCompleteOverDue === false
                                                        })}>
                                                            {CommonFunction.formatDateTime(task.closedOn)}
                                                        </span>
                                                    </div>
                                                }
                                            </div>

                                            {/* workflow info */}
                                            {(task.workFlow || task.activity) &&
                                                <div className="task-workflow-info task-view-process link-button mb-1" onClick={() => viewWorkflowProcess(task)}>
                                                    <Tooltip target=".task-view-process" content={t("request.view-process")} position="bottom" />

                                                    {task.workFlow &&
                                                        <>
                                                            <span className='bx bx-git-branch mr-1 text-grey-6'></span>
                                                            <span className="mr-1 text-grey-8">{task.workFlow.name}</span>
                                                        </>
                                                    }
                                                    {task.activity &&
                                                        <>
                                                            <span className='bx bx-radio-circle-marked mr-1 text-grey-6'></span>
                                                            <span className="mr-1 text-grey-8">{task.activity.name}</span>
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
                </div>
            </div>
            <TaskDetail ref={refTaskDetail} groups={groups} tasks={groupTasks} />
            <RequestDetail ref={refRequestDetail} />
        </div >
    );
}

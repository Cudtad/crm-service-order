import React, {  useEffect, useRef, useState } from 'react';


import _ from "lodash";
import { Dialog } from "primereact/dialog";
import Enumeration from '@lib/enum';
import ReactApexChart from "react-apexcharts";
import classNames from "classnames";
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dropdown } from "primereact/dropdown";
import { Badge } from "primereact/badge";
import { MultiSelect } from "primereact/multiselect";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "../scss/TaskBaseList.scss";
import TaskBaseDetail from "components/task/TaskBaseDetail";
import { XLayout, XLayout_Bottom, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import TaskBaseApi from 'services/TaskBaseApi';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import Task_State from 'components/task/components/Task_State';
import CommonFunction from '@lib/common';

export default function TaskBaseList(props) {
    const t = CommonFunction.t;
    const { user } = props;
    const [tasks, setTasks] = useState(null);
    const [groups, setGroups] = useState(null);
    const [loading, setLoading] = useState(false);
    const refTaskDetail = useRef();
    const [searchGroupId, setSearchGroupId] = useState(null);
    const [totalTasks, setTotalTasks] = useState(0);
    const [dashboardByDeadline, setDashboardByDeadline] = useState(null);
    const [dashboardByState, setDashboardByState] = useState(null);
    const refFilterPanel = useRef(null);
    const refChangeStageMenu = useRef(null);
    const refImpactingTask = useRef();
    const [impactTaskNextStates, setImpactTaskNextStates] = useState({});

    const defaultFilter = {
        type:"task-base",
        id: 0,
        name: t("task.filter.default-name"),
        group: null,
        state: [Enumeration.task.state.pending, Enumeration.task.state.inProgress],
        role: [Enumeration.task.role.responsible]
    };
    const [filters, setFilters] = useState([defaultFilter]);
    const [filter, setFilter] = useState(defaultFilter);
    const [showNameFilter, setShowNameFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
    const taskStateMenuItems = [
        { name: t('task.state.PENDING'), code: Enumeration.task.state.pending },
        { name: t('task.state.IN_PROGRESS'), code: Enumeration.task.state.inProgress },
        { name: t('task.state.COMPLETED'), code: Enumeration.task.state.completed },
        { name: t('task.state.DEFERRED'), code: Enumeration.task.state.deferred },
        { name: t('task.state.CANCELED'), code: Enumeration.task.state.canceled },
        { name: t('task.state.REVIEWING'), code: Enumeration.task.state.reviewing },
        { name: t('task.state.TODAYDUE'), code: Enumeration.task.state.todayDue },
        { name: t('task.state.OVERDUE'), code: Enumeration.task.state.overDue },
    ];

    const roleMenuItems = [
        { name: t('task.responsible'), code: Enumeration.task.role.responsible },
        { name: t('task.participant'), code: Enumeration.task.role.participant },
        { name: t('task.set-by-me'), code: Enumeration.task.role.requester },
        { name: t('task.create-by-me'), code: Enumeration.task.role.createBy },
        { name: t('task.following'), code: Enumeration.task.role.following },
    ];

    const defaultPaging = {
        first: 0,
        size: 20,
        page: 0,
        total: 0
    }
    const [paging, setPaging] = useState({ ...defaultPaging });

    const refParameters = useRef({
        ...defaultPaging,
        keyword: "",
        group: defaultFilter.group,
        state: defaultFilter.state,
        role: defaultFilter.role
    })

    /**
     * onetime
     */
    useEffect(() => {

        // groups
        let _groups = _.cloneDeep(window.app_context.user.groups);
        _groups = _.sortBy(_groups, ['name']);

        setGroups(_groups);

        // get filters
        loadFilter()

        // load tasks
        loadData();
        loadDashboard();
    }, []);

    /***
     * load filter
     */
    const loadFilter = () => {
        TaskBaseApi.getFilter("task-base").then(data => {
            if (data) {
                let _filters = [];
                if(data && data.length > 0 ){
                    data.map(_filter => {
                        _filters.push({
                            type: "task-base",
                            id: _filter.id,
                            name: _filter.filterName,
                            group: _filter.config.group||0,
                            state: _filter.config.state||[],
                            role: _filter.config.role||[]
                        })
                    })
                }
                setFilters(_filters)
            }
        })
    }
    /**
     * get role condition
     * @returns
     */
    const getConditions = () => {

        let _params = _.cloneDeep(refParameters.current),
            conditions = [{
                logicOperator: "",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "type",
                operator: "IN",
                values: ["TASK"]
            }],
            userId = window.app_context.user.id;

        // filter by group
        if (_params.group) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "LONG",
                fieldName: "group_id",
                operator: "IN",
                values: [_params.group]
            });
        }

        // filter by role
        if (!_params.role || _params.role.length == 0) {
            _params.role = [
                Enumeration.task.role.responsible,
                Enumeration.task.role.participant,
                Enumeration.task.role.requester,
                Enumeration.task.role.following,
                Enumeration.task.role.createBy
            ];
        }

        let mappingRole = {};
        mappingRole[Enumeration.task.role.responsible] = Enumeration.task.role.responsible;
        mappingRole[Enumeration.task.role.participant] = Enumeration.task.role.participant;
        mappingRole[Enumeration.task.role.requester] = Enumeration.task.role.requester;
        mappingRole[Enumeration.task.role.following] = Enumeration.task.role.following;
        mappingRole[Enumeration.task.role.createBy] = "create_by";

        let _roleConditions = {
            logicOperator: "AND",
            conditionType: "GROUP",
            filterType: "ROLE",
            children: []
        }

        _params.role.forEach((role, index) => {
            _roleConditions.children.push({
                logicOperator: index === 0 ? "" : "OR",
                conditionType: "RULE",
                filterType: "ROLE",
                fieldName: mappingRole[role],
                values: [userId]
            });
        });

        conditions.push(_roleConditions);

        // filter by state
        if (_params.state && _params.state.length > 0) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "state",
                operator: "IN",
                values: _params.state
            });
        }

        // filter by name
        if (!CommonFunction.isEmpty(_params.keyword)) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "name",
                operator: "LIKE",
                values: [_params.keyword]
            });
        }

        return [{
            logicOperator: "",
            conditionType: "GROUP",
            filterType: "ROLE",
            children: conditions
        }];
    };

    /**
     * load data
     */
    const loadData = async () => {

        setLoading(true);

        // load data for data table
        let _params = {
            page: refParameters.current.page,
            size: refParameters.current.size,
            body: {
                props: ["id", "name", "deadline", "responsibleId", "create_by", "start_date", "state"],
                include: ["next-states"],
                conditions: getConditions()
            }
        };

        TaskBaseApi.list(_params).then(res => {
            if (res) {
                // set tasks data
                setTasks(res.content);

                // set paging state
                setPaging({
                    ...paging,
                    total: res.total,
                    first: refParameters.current.first,
                    page: refParameters.current.page
                });

                // set ref parameter
                refParameters.current.total = res.total;

            }
            setLoading(false);
        });
    };

    /**
     * load dashboard
     */
    const loadDashboard = () => {
        // load data for dashboard
        let _dashboardParams = {
            body: {
                conditions: getConditions()
            }
        };

        TaskBaseApi.summary(_dashboardParams).then(res => {
            if (res) {
                prepareDashboardSummary(res);
                prepareDashboardByDeadline(res);
                prepareDashboardByState(res);
            }
        });
    }

    const prepareDashboardSummary = (data) => {
        let total = 0;
        if (data && data.length > 0) {
            data.forEach(d => {
                total += (d.total || 0)
            })
        }
        setTotalTasks(total);
    }

    /**
     * prepare dashboard by deadline
     * @param {*} data 
     */
    const prepareDashboardByDeadline = (data) => {
        let onDue = 0, // chưa hoàn thành còn hạn
            overDue = 0, // chưa hoàn thành trễ hạn
            completeOnDue = 0, // hoàn thành trong hạn
            compelteOverDue = 0, // hoàn thành trễ hạn
            hasData = false;

        if (data && data.length > 0) {
            data.forEach(d => {
                switch (d.state) {
                    case Enumeration.task.state.pending:
                    case Enumeration.task.state.inProgress:
                    case Enumeration.task.state.reviewing:
                        onDue += (d.ondue || 0);
                        overDue += (d.overdue || 0);
                        break;
                    case Enumeration.task.state.completed:
                        completeOnDue += (d.ondue || 0);
                        compelteOverDue += (d.overdue || 0);
                        break;
                    default:
                        break;
                }
            })
        }

        // build series and labels
        let series = [], labels = [];
        if (onDue > 0) {
            hasData = true;
            series.push(onDue);
            labels.push(t("task.dashboard.on-due"));
        }
        if (overDue > 0) {
            hasData = true;
            series.push(overDue);
            labels.push(t("task.dashboard.over-due"));
        }
        if (completeOnDue > 0) {
            hasData = true;
            series.push(completeOnDue);
            labels.push(t("task.dashboard.complete-on-due"));
        }
        if (compelteOverDue > 0) {
            hasData = true;
            series.push(compelteOverDue);
            labels.push(t("task.dashboard.complete-over-due"));
        }

        let _config = {
            series: series,
            options: {
                labels: labels,
                legend: {
                    position: 'bottom'
                }
            },
        };

        setDashboardByDeadline(hasData ? _config : null);
    }

    /**
     * prepare dashboard by state
     * @param {*} data 
     */
    const prepareDashboardByState = (data) => {
        let series = [], labels = [], hasData = false;

        if (data && data.length > 0) {
            data.forEach(d => {
                if (d.total > 0) hasData = true;
                series.push(d.total);
                labels.push(t(`task.state.${d.state}`));
            })
        }

        let _config = {
            series: series,
            options: {
                labels: labels,
                legend: {
                    position: 'bottom'
                }
            },
        };

        setDashboardByState(hasData ? _config : null);
    }

    /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        refParameters.current = { ...refParameters.current, ...event };
        loadData();
    };

    /***
     * on changer filter
     */
    const applyChangeFilter = (prop,val) => {
        let _filter = _.cloneDeep(filter)
        switch (prop){
            case "state":
            case "role":
                val = val.length > 0 ? val : []
                break;        
            case "group":
                val = val || null
                break;
            
        }
        _filter[prop] = val;

        refParameters.current[prop] = val ;
        setFilter(_filter)
        loadData();
        loadDashboard();
    }

    /**
     * change search keyword
     * @param {*} val
     */
    const onChangeFilter_Keyword = (val) => {
        val = val.trim();
        if (val !== refParameters.current.keyword) {
            refParameters.current.keyword = val;
            loadData();
            loadDashboard();
        }
    };
    
    /**
     * change search keyword
     * @param {*} val
     */
    const applyChangeFilterName = (val) => {
        let _filter = _.cloneDeep(filter);
        _filter.name = val;
        setFilter(_filter)
    };
    
    /**
     * update filter
     * @param {*} val
     */
    const submitFilter = (mode) => {
        let _filter = _.cloneDeep(filter);
        let _filters = _.cloneDeep(filters);
        if(mode && mode === "create"){
            _filter.id = 0;
        }
        if(mode && mode === "update" && !_filter.id) {
            setFilter(_filter);
            createFilter();
            return
        }
        TaskBaseApi.updateFilter(_filter).then((res) => {
            if(res) {
                let _index  = _.findIndex(_filters,{id:_filter.id});
                if(_index > -1) {
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
     * update filter
     * @param {*} val
     */
    const hideFilterName = () => {
        setShowNameFilter(false)
    };
    
    /**
     * create filter
     * @param {*} val
     */
    const createFilter = () => {
        setShowNameFilter(true)
    };

    /**
     * create filter
     * @param {*} val
     */
    const deleteFilter = () => {
        let _filter = _.cloneDeep(filter);
        let _filters = _.cloneDeep(filters);
        if(_filter.id && _filter.name){
            TaskBaseApi.deleteFilter(_filter).then(res => {
                if(res){
                    let _index  = _.findIndex(_filters,{id:_filter.id});
                    if(_index > -1){
                        _filters.splice(_index,1);
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
     * create task
     */
    const createTask = () => {
        refTaskDetail.current.create();
    }

    /**
     * update task
     */
    const updateTask = (_task) => {
        refTaskDetail.current.update(_task.id);
    }

    /**
     * create task
     */
    const createRequest = () => {
    }

    /**
     * after submit task base detail
     */
    const afterSubmitTaskBaseDetail = async (editMode, responseAfterSubmit) => {
        let _task = {
            task: {
                id: responseAfterSubmit.task.id,
                state: responseAfterSubmit.task.state,
                name: responseAfterSubmit.task.name,
                createBy: responseAfterSubmit.task.createBy,
                responsibleId: responseAfterSubmit.task.responsibleId,
                startDate: responseAfterSubmit.task.startDate,
                deadline: responseAfterSubmit.task.deadline
            }
        }

        switch (editMode) {
            case Enumeration.crud.create:
                // after create, push item into first row
                setTasks([_task, ...tasks]);
                break;
            case Enumeration.crud.update:
                // after update, update task info
                let _tasks = _.cloneDeep(tasks);
                for (let i = 0; i < _tasks.length; i++) {
                    if (_tasks[i].task.id === _task.task.id) {
                        _tasks[i] = _task;
                        break;
                    }
                }
                setTasks(_tasks);
                break;
            default:
                break;
        }
    }

    /**
     * toggle change state menu
     */
    const toggleChangeState = (e, _task) => {
        if (_task["next-states"] && _task["next-states"].length) {
            let _states = {};
            _task["next-states"].forEach(s => {
                _states[s] = true;
            });
            setImpactTaskNextStates(_states);
            refImpactingTask.current = _.cloneDeep(_task);
            refChangeStageMenu.current.toggle(e);
        }
    }

    /**
     * change state
     * @param {*} state 
     */
    const changeState = (state) => {
        if (refImpactingTask.current) {
            TaskBaseApi.changeState(refImpactingTask.current.id, state).then(res => {
                if (res) {
                    let _tasks = _.cloneDeep(tasks);
                    for (let i = 0; i < _tasks.length; i++) {
                        if (_tasks[i].task.id === refImpactingTask.current.id) {
                            _tasks[i].task.state = res.task.state;
                            _tasks[i].task['next-states'] = res.task['next-states'] || [];
                            break;
                        }

                    }
                    setTasks(_tasks);
                    CommonFunction.toastSuccess(t("common.save-success"));
                }
                refChangeStageMenu.current.hide();
            })
        }
    }

    /***
     * change filter
     */

    const applyChangeSelectedFilter = (val) => {
        for (const property in val) {
            refParameters.current[property] = val[property]
        }
        loadData();
        loadDashboard();
        setFilter(val);
        setSelectedFilter(val);
    }

    return (<>
        <XLayout left="300px" className="p-2">
            <XLayout_Left className="pr-2 overflow-visible">
                <XLayout className="overflow-visible" bottom="calc(50% - 10px)">
                    <XLayout_Top>
                        <XLayout_Box>
                            <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center">
                                    <i className="bx bx-task fs-20 mr-1"></i>
                                    {t("task.total")}
                                </div>
                                <span className="bold">{totalTasks}</span>
                            </div>
                        </XLayout_Box>
                    </XLayout_Top>
                    <XLayout_Center className="mt-2 mb-2 overflow-visible">
                        <XLayout_Box className="p-0 flex align-items-center justify-content-center h-full overflow-visible">
                            {dashboardByDeadline ?
                                <ReactApexChart options={dashboardByDeadline.options} series={dashboardByDeadline.series} type="pie" height="100%" width="100%" />
                                : <div className="flex align-items-center justify-content-center text-grey">{t("common.empty-data")}</div>
                            }
                        </XLayout_Box>
                    </XLayout_Center>
                    <XLayout_Bottom className="overflow-visible">
                        <XLayout_Box className="pl-0 pr-0 flex align-items-center justify-content-center h-full overflow-visible">
                            {dashboardByState ?
                                <ReactApexChart options={dashboardByState.options} series={dashboardByState.series} type="pie" height="100%" width="100%" />
                                : <div className="flex align-items-center justify-content-center text-grey">{t("common.empty-data")}</div>
                            }
                        </XLayout_Box>
                    </XLayout_Bottom>
                </XLayout>
            </XLayout_Left>
            <XLayout_Center>
                <XLayout>
                    <XLayout_Top>
                        <XToolbar
                            className="p-0 mb-2"
                            left={() => (<div className="p-2">
                                <Button label={t("task.add")} icon="bx bx-task create" onClick={createTask}></Button>
                                <Button label={t("request.add")} icon="bx bx-message-detail create" onClick={createRequest}></Button>
                            </div>)}
                            right={() => (<>
                                <span className="p-input-icon-left">
                                    <i className="bx bx-search-alt" />
                                    <InputText
                                        className="mr-2"
                                        style={{ width: '180px' }}
                                        onInput={(e) => CommonFunction.debounce(null, onChangeFilter_Keyword, e.target.value)}
                                        placeholder={t("common.search")} />
                                </span>
                                <Button
                                    className="ml-1"
                                    icon="bx bx-filter' setting"
                                    tooltip={t("task.config-filter")}
                                    tooltipOptions={{ position: "top" }}
                                    onClick={(e) => refFilterPanel.current.toggle(e)}
                                ></Button>
                            </>)}
                        ></XToolbar>
                    </XLayout_Top>
                    <XLayout_Center>
                        <XLayout_Box className="h-full p-0 position-relative">
                            <LoadingBar loading={loading}></LoadingBar>
                            <DataTable
                                value={tasks}
                                selectionMode="single"
                                dataKey="id"
                                className="p-datatable-gridlines p-datatable-paging border-none"
                                emptyMessage={t('common.no-record-found')}
                                scrollable
                                scrollDirection='both'
                                scrollHeight='flex'
                                lazy
                                paginator
                                first={paging.first}
                                rows={paging.size}
                                totalRecords={paging.total}
                                rowsPerPageOptions={[20, 25, 50, 100]}
                                onPage={onPage}
                                paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink NextPageLink LastPageLink"
                                currentPageReportTemplate="{first} - {last} / {totalRecords}"
                            >
                                <Column header={t('task.name')} 
                                    frozen
                                    style={{ flex: '1 0 250px' }}
                                body={(task) => (
                                    <div className="flex align-items-center pointer width-fit-content">
                                        <div className="mr-1" onClick={(e) => toggleChangeState(e, task.task)} title={t(`task.state.${task.task.state}`)}>
                                            <Task_State
                                                state={task.task.state}
                                                style={{ width: "64px" }}
                                                className="border-all"
                                            >
                                                {t(`task.state.sort.${task.task.state}`)}
                                            </Task_State>
                                        </div>
                                        <span className="link-button" onClick={() => updateTask(task.task)}>{task.task.name}</span>
                                    </div>)}
                                ></Column>
                                <Column header={t('workflow.position.requester')}
                                     style={{ flex: '0 0 200px' }}
                                body={(task) => (
                                    <XAvatar
                                        src={CommonFunction.getImageUrl(task.task.createBy.avatar, task.task.createBy.fullName)}
                                        label={() => <span>{task.task.createBy.fullName}</span>}
                                    ></XAvatar>
                                )}></Column>
                                <Column header={t('workflow.position.responsible')} 
                                    style={{ flex: '0 0 200px' }}
                                    body={(task) => (
                                    <XAvatar
                                        src={CommonFunction.getImageUrl(task.task.responsibleId.avatar, task.task.responsibleId.fullName)}
                                        label={() => <span>{task.task.responsibleId.fullName}</span>}
                                    ></XAvatar>
                                )}></Column>
                                <Column header={t('common.startdate')} 
                                    style={{ flex: '0 0 150px' }}
                                    body={(task) => (
                                    <div>{CommonFunction.formatDateTime(task.task.startDate)}</div>
                                )}></Column>
                                <Column header={t('common.deadline')}
                                    style={{ flex: '0 0 150px' }}
                                    body={(task) => (
                                    <div>{CommonFunction.formatDateTime(task.task.deadline)}</div>
                                )}></Column>
                            </DataTable>
                        </XLayout_Box>
                    </XLayout_Center>
                </XLayout>

            </XLayout_Center>
        </XLayout>

        <OverlayPanel ref={refChangeStageMenu} className="x-menu">
            {impactTaskNextStates[Enumeration.task.state.pending] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.pending)}>
                    <i className='bx bx-pause'></i>
                    <span>{t("task.state.PENDING")}</span>
                </div>
            }
            {impactTaskNextStates[Enumeration.task.state.inProgress] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.inProgress)}>
                    <i className='bx bx-play'></i>
                    <span>{t("task.state.IN_PROGRESS")}</span>
                </div>
            }
            {impactTaskNextStates[Enumeration.task.state.deferred] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.deferred)}>
                    <i className='bx bx-stop'></i>
                    <span>{t("task.state.DEFERRED")}</span>
                </div>
            }
            {impactTaskNextStates[Enumeration.task.state.canceled] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.canceled)}>
                    <i className='bx bx-x'></i>
                    <span>{t("task.state.CANCELED")}</span>
                </div>
            }
            {impactTaskNextStates[Enumeration.task.state.completed] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.completed)}>
                    <i className='bx bx-check'></i>
                    <span>{t("task.state.COMPLETED")}</span>
                </div>
            }
            {impactTaskNextStates[Enumeration.task.state.reviewing] &&
                <div className="x-menu-button" onClick={() => changeState(Enumeration.task.state.reviewing)}>
                    <i className='bx bx-search-alt-2'></i>
                    <span>{t("task.state.REVIEWING")}</span>
                </div>
            }
        </OverlayPanel>

        <OverlayPanel ref={refFilterPanel} className="p-0" style={{ width: "500px", maxHeight: "90vh" }}>
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
                                <Button icon="bx bx-trash"  tooltip={t('delete')} onClick={() => deleteFilter()}></Button>
                            </>
                        )}
                    ></XToolbar>
                </XLayout_Top>
                <XLayout_Center>
                    <div className="p-fluid fluid ">
                        <span className="p-float-label">
                            <Dropdown
                                filter showClear
                                filterBy="name" id="group"
                                value={filter.group} options={groups}
                                
                                onChange={(e) => applyChangeFilter("group",e.target.value)}
                                optionLabel="name" optionValue="id"
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
                                                        "bg-teal": item.type !== "org",
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
                        <span className="p-float-label mt-1">
                            <MultiSelect optionLabel="name" optionValue="code"
                                display="chip" 
                                value={filter.role}
                                inputId="role-filter"
                                options={roleMenuItems} onChange={(e) => applyChangeFilter("role",e.value)} />
                            <label htmlFor="role-filter">{t("task.filter.role")}</label>
                        </span>

                        <span className="p-float-label mt-1">
                            <MultiSelect optionLabel="name" optionValue="code"
                                display="chip" 
                                value={filter.state}
                                inputId="state-filter"
                                options={taskStateMenuItems} onChange={(e) => applyChangeFilter("state",e.value)} />
                            <label htmlFor="state-filter">{t("task.filter.state")}</label>
                        </span>
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
                <XLayout_Center className="p-fluid fluid ">
                    <InputText
                        id="filter-name"
                        value={filter.name}
                        className='dense'
                        onChange={(e) => applyChangeFilterName(e.target.value)}
                    />
                    
                </XLayout_Center>
            </XLayout>
        </Dialog>
        <TaskBaseDetail ref={refTaskDetail} groups={groups} afterSubmit={afterSubmitTaskBaseDetail} />
    </>);
}

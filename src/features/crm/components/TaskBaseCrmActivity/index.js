import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";

import _ from "lodash";
import { Dialog } from "primereact/dialog";
import Enumeration from "@lib/enum";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { XCalendar } from "@ui-lib/x-calendar/XCalendar";
import { XLayout, XLayout_Center, XLayout_Top } from "@ui-lib/x-layout/XLayout";
import CommonFunction from "@lib/common";

import { CrmMdActivityApi } from "services/crm/CrmMdActivityService";
import { CrmMdPriorityApi } from "services/crm/CrmMdPriorityService";
import { CrmMdTaskTypeApi } from "services/crm/CrmMdTaskTypeService";
import { CrmEmployeeApi } from "services/crm/CrmEmployeeService";
import { CrmContactApi } from "services/crm/CrmContactService";
import { CrmMdDurationUnitApi } from "services/crm/CrmMdDurationUnitService";
import { ACTIVITY_TYPE } from "features/crm/utils/constants";
import { UserAutoComplete } from "features/crm/components/UserAutoComplete";
import { getPermistion } from "features/crm/utils";

import TaskBaseCrmDetail from "components/task/TaskBaseCrmDetail";
import HistoriesActivity from "./Histories";
import classNames from "classnames";
import { ACTIVITY_LIST } from "../../utils/constants";
import { TASK_OBJECT_TYPE_CONGIG } from "../../../../components/task/TaskBaseCrmDetail";
import TaskUtil from "../../../task/components/util/TaskUtil";

export default function TaskBaseCrmActivity(props) {
  const t = CommonFunction.t;
  const {
    permissionCode,
    objectTypeId,
    queryfieldName,
    selectFieldName,
    screenId,
    screenNameId,
    accountId
  } = props;

  const ACTIVITY_TYPE_TEXT = [
    {
      id: 1,
      text: t("crm.task-base.acctivity-type.task"),
    },
    { id: 2, text: t("crm.task-base.acctivity-type.phone-call") },
    { id: 3, text: t("crm.task-base.acctivity-type.email") },
    { id: 4, text: t("crm.task-base.acctivity-type.appointment") },
  ];

  // const [tasks, setTasks] = useState(null);
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

  const allowEmployeeIds = localStorage.getItem('allowEmployeeIds') ? localStorage.getItem('allowEmployeeIds').split(',') : []

  const defaultFilter = {
    type: "task-base",
    id: 0,
    name: t("task.filter.default-name"),
    group: null,
    state: [],
    role: [Enumeration.task.role.responsible, Enumeration.task.role.requester, Enumeration.task.role.createBy],
    objectTypeId: objectTypeId ? [objectTypeId] : [],
    responsibleId: [],
    requestedBy: []
  };
  const [filters, setFilters] = useState([defaultFilter]);
  const [filter, setFilter] = useState(defaultFilter);
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);

  const refHistoriesActivity = useRef();

  const [openFilterByTime, setOpenFilterByTime] = useState(false);

  const taskStateMenuItems = [
    { name: t("task.state.PENDING"), code: Enumeration.task.state.pending },
    {
      name: t("task.state.IN_PROGRESS"),
      code: Enumeration.task.state.inProgress,
    },
    { name: t("task.state.COMPLETED"), code: Enumeration.task.state.completed },
    { name: t("task.state.DEFERRED"), code: Enumeration.task.state.deferred },
    { name: t("task.state.CANCELED"), code: Enumeration.task.state.canceled },
    { name: t("task.state.REVIEWING"), code: Enumeration.task.state.reviewing },
    { name: t('task.state.REPROCESS'), code: Enumeration.task.state.reprocess },
  ];

  const roleMenuItems = [
    { name: t("task.responsible"), code: Enumeration.task.role.responsible },
    { name: t("task.participant"), code: Enumeration.task.role.participant },
    { name: t("task.set-by-me"), code: Enumeration.task.role.requester },
    { name: t("task.create-by-me"), code: Enumeration.task.role.createBy },
    { name: t("task.following"), code: Enumeration.task.role.following },
  ];

  const defaultPaging = {
    first: 0,
    size: 5,
    page: 0,
    total: 0,
  };
  const [paging, setPaging] = useState({ ...defaultPaging });

  const refParameters = useRef({
    ...defaultPaging,
    keyword: "",
    group: defaultFilter.group,
    state: defaultFilter.state,
    role: defaultFilter.role,
    objectTypeId: defaultFilter.objectTypeId,
  });

  const [permission, setPermission] = useState();

  const [tasks, setTasks] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [priorities, setPriorities] = useState([]);

  const [taskTypes, setTaskTypes] = useState([]);

  const [durationUnits, setDurationUnits] = useState([]);

  const [edittingData, setEdittingData] = useState();

  const [employeeAll, setEmployeeAll] = useState([]);

  const [tabActive, setTabActive] = useState(null); //task, phone, email, appointment

  const [activityTypes, setactivityTypes] = useState([])

  const [objectTypes, setObjectTypes] = useState([])

  const [allowEmployees, setAllowEmployees] = useState([])

  useEffect(() => {
    const _activityTypes = ACTIVITY_LIST.map(o => {
      return {
        ...o,
        name: t(o.name)
      }
    })
    setactivityTypes(_activityTypes)

    const _objectTypes = TASK_OBJECT_TYPE_CONGIG.map(o => {
      return {
        id: o.id,
        name: t(`crm.task-base.detail.${o.name}`)
      }
    })
    setObjectTypes(_objectTypes)
  }, [])

  useEffect(() => {
    const _employeeAll = [];
    employees.map((o) => {
      if (o.userId) {
        _employeeAll.push({
          id: o.id,
          fullName: `${o.employeeLastName ? o.employeeLastName : ""}${o.employeeMiddleName ? ` ${o.employeeMiddleName}` : ``
            }${o.employeeFirstName ? ` ${o.employeeFirstName}` : ``}`,
          userId: o.userId,
        });
      }
    });

    setEmployeeAll(_employeeAll);
  }, [employees]);
  /**
   * onetime
   */
  useEffect(() => {
    // groups
    let _groups = _.cloneDeep(window.app_context.user.groups);
    _groups = _.sortBy(_groups, ["name"]);

    setGroups(_groups);
    // get filters
    loadFilter();
    // load tasks

    loadDashboard();

    setPermission(getPermistion(window.app_context.user, permissionCode));

    loadTaskTypes();
    loadDurationUnits();
    loadAllowEmployees()
  }, []);

  /**
   * load all Task Type
   */
  const loadTaskTypes = () => {
    CrmMdTaskTypeApi.get().then((res) => {
      if (res) {
        setTaskTypes(res);
      } else {
        setTaskTypes([]);
      }
    });
  };

  /**
   * load all Task Type
   */
  const loadDurationUnits = () => {
    CrmMdDurationUnitApi.get().then((res) => {
      if (res) {
        setDurationUnits(res);
      } else {
        setDurationUnits([]);
      }
    });
  };

  /**
         * load all Allow Employees
         */
  const loadAllowEmployees = () => {
    const employeeId = localStorage.getItem("employeeId")
    if (allowEmployeeIds.length) {
      CrmEmployeeApi.getAll().then((res) => {
        if (res) {
          let _allowEmployees = []
          let _res = []
          res.map(o => {
            _res.push({
              ...o,
              fullName: `${o.employeeLastName ? o.employeeLastName : ''}${o.employeeMiddleName ? ` ${o.employeeMiddleName}` : ``}${o.employeeFirstName ? ` ${o.employeeFirstName}` : ``}`,
            })
            if (allowEmployeeIds.indexOf(o.id.toString()) != -1) {
              _allowEmployees.push({
                ...o,
                fullName: `${o.employeeLastName ? o.employeeLastName : ''}${o.employeeMiddleName ? ` ${o.employeeMiddleName}` : ``}${o.employeeFirstName ? ` ${o.employeeFirstName}` : ``}`,
              })
            }
          })
          _.remove(_res, o => !o.userId)
          _.remove(_allowEmployees, o => !o.userId)
          const idRequest = res.filter(o => `${o.id}` === `${employeeId}`).map(u => u.userId)
          setFilter({
            ...filter,
            requestedBy: idRequest,
            responsibleId: []
          })
          refParameters.current[`requestedBy`] = idRequest
          refParameters.current[`responsibleId`] = []
          refParameters.current[`allowEmployees`] = _allowEmployees
          setAllowEmployees(_allowEmployees)
          loadData();
        } else {
          setAllowEmployees([])
          refParameters.current[`requestedBy`] = []
          refParameters.current[`responsibleId`] = []
          refParameters.current[`allowEmployees`] = []
          setFilter({
            ...filter,
            requestedBy: [],
            responsibleId: []
          })
        }
      })
    } else {
      loadData();
    }
  }

  /***
   * load filter
   */
  const loadFilter = () => {
    // TaskBaseApi.getFilter("task-base").then(data => {
    //     if (data) {
    //         let _filters = [];
    //         if(data && data.length > 0 ){
    //             data.map(_filter => {
    //                 _filters.push({
    //                     type: "task-base",
    //                     id: _filter.id,
    //                     name: _filter.filterName,
    //                     group: _filter.config.group||0,
    //                     state: _filter.config.state||[],
    //                     role: _filter.config.role||[]
    //                 })
    //             })
    //         }
    //         setFilters(_filters)
    //     }
    // })
  };
  /**
   * get role condition
   * @returns
   */
  const getConditions = () => {
    let _params = _.cloneDeep(refParameters.current);
    let conditions = objectTypeId
      ? [
        {
          logicOperator: "AND",
          conditionType: "RULE",
          filterType: "FIELD",
          fieldType: "LONG",
          fieldName: queryfieldName,
          operator: "IN",
          values: [screenId],
        }
      ]
      : [];
    let userId = window.app_context.user.id;

    // // filter by group
    // if (objectTypeId && _params.group) {
    //     conditions.push({
    //         logicOperator: "AND",
    //         conditionType: "RULE",
    //         filterType: "FIELD",
    //         fieldType: "LONG",
    //         fieldName: queryfieldName,
    //         operator: "IN",
    //         values: [screenId]
    //     });
    // }
    if (_params.requestedBy && _params.requestedBy.length) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "requested_by",
        operator: "IN",
        values: _params.requestedBy
      });
    }
    if (_params.responsibleId && _params.responsibleId.length) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "responsible_id",
        operator: "IN",
        values: _params.responsibleId
      });
    }

    if (!localStorage.getItem('isAdmin')) {
      // filter by role
      if (!_params.role || _params.role.length == 0) {
        _params.role = [
          Enumeration.task.role.responsible,
          Enumeration.task.role.participant,
          Enumeration.task.role.requester,
          Enumeration.task.role.following,
          Enumeration.task.role.createBy,
        ];
      }

      let mappingRole = {};
      mappingRole[Enumeration.task.role.responsible] =
        Enumeration.task.role.responsible;
      mappingRole[Enumeration.task.role.participant] =
        Enumeration.task.role.participant;
      mappingRole[Enumeration.task.role.requester] =
        Enumeration.task.role.requester;
      mappingRole[Enumeration.task.role.following] =
        Enumeration.task.role.following;
      mappingRole[Enumeration.task.role.createBy] = "create_by";

      const _allowUser = (_params[`allowEmployees`] ?? []).map(o => (o.userId))

      let _roleConditions = {
        logicOperator: "AND",
        conditionType: "GROUP",
        filterType: "ROLE",
        children: [],
      };

      _params.role.forEach((role, index) => {
        _roleConditions.children.push({
          logicOperator: index === 0 ? "" : "OR",
          conditionType: "RULE",
          filterType: "ROLE",
          fieldName: mappingRole[role],
          values: mappingRole[role] == Enumeration.task.role.requester || mappingRole[role] == Enumeration.task.role.responsible ? [userId, ..._allowUser] : [userId]
        });
      });

      conditions.push(_roleConditions);
    }

    // filter by state
    if (_params.state && _params.state.length > 0) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "state",
        operator: "IN",
        values: _params.state,
      });
    }

    // filter by priority
    if (_params.priorityId && _params.priorityId.length > 0) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "priority_id",
        operator: "IN",
        values: _params.priorityId
      });
    }
    // filter by activity Type
    if (_params.activityTypeId && _params.activityTypeId.length > 0) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "activity_type_id",
        operator: "IN",
        values: _params.activityTypeId
      });
    }
    // filter by object Type
    if (_params.objectTypeId && _params.objectTypeId.length > 0) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "object_type_id",
        operator: "IN",
        values: _params.objectTypeId
      });
    }
    // filter date
    if (!CommonFunction.isEmpty(_params.startFrom)) {
      TaskUtil.addCondition(conditions, "start_date", "DATE", ">=", CommonFunction.formatDateISO8601(_params.startFrom), "AND");
    }
    if (!CommonFunction.isEmpty(_params.startTo)) {
      TaskUtil.addCondition(conditions, "start_date", "DATE", "<=", CommonFunction.formatDateISO8601(_params.startTo), "AND");
    }
    if (!CommonFunction.isEmpty(_params.deadlineFrom)) {
      TaskUtil.addCondition(conditions, "deadline", "DATE", ">=", CommonFunction.formatDateISO8601(_params.deadlineFrom), "AND");
    }
    if (!CommonFunction.isEmpty(_params.deadlineTo)) {
      TaskUtil.addCondition(conditions, "deadline", "DATE", "<=", CommonFunction.formatDateISO8601(_params.deadlineTo), "AND");
    }
    if (!CommonFunction.isEmpty(_params.closeFrom)) {
      TaskUtil.addCondition(conditions, "closed_on", "DATE", ">=", CommonFunction.formatDateISO8601(_params.closeFrom), "AND");
    }
    if (!CommonFunction.isEmpty(_params.closeTo)) {
      TaskUtil.addCondition(conditions, "closed_on", "DATE", "<=", CommonFunction.formatDateISO8601(_params.closeTo), "AND");
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
        values: [_params.keyword],
      });
    }

    return [
      {
        logicOperator: "",
        conditionType: "GROUP",
        filterType: "ROLE",
        children: conditions,
      },
    ];
    // return conditions
  };

  /**
   * load data
   */
  const loadData = async (isReset = true) => {
    setLoading(true);
    let _priorities = _.cloneDeep(priorities);
    if (!_priorities.length) {
      _priorities = await CrmMdPriorityApi.get().catch(() => { });
      setPriorities(_priorities);
    }
    let _employees = _.cloneDeep(employees);
    if (!_employees.length) {
      _employees = await CrmEmployeeApi.getAll({
        status: 1,
      }).catch(() => { });
      setEmployees(_employees);
    }
    // load data for data table
    let _params = {
      page: refParameters.current.page,
      size: refParameters.current.size,
      body: {
        props: [
          "id",
          "name",
          "deadline",
          "responsibleId",
          "closed_on",
          "create_by",
          "start_date",
          "state",
          "priorityId",
          "activityTypeId",
          "description",
        ],
        include: ["next-states", "involves"],
        conditions: getConditions(),
        checkPermission: false,
        checkActivityTask: false,
      },
    };

    CrmMdActivityApi.list(_params).then((res) => {
      if (res) {
        // set tasks data
        const _task = res.content.map((o) => {
          const _priority = _.find(_priorities, { id: o.task.priorityId });
          const responseUser = _.find(o.involves, { role: "RESPONSIBLE" })
          let _rsEmployees = []
          if (responseUser) {
            responseUser.involveIds.map(_user => {
              const _employee = _.find(_employees, {
                userId: _user.id,
              });
              if (_employee) {
                _rsEmployees.push({
                  ..._employee,
                  fullName: `${_employee.employeeLastName
                    ? `${_employee.employeeLastName} `
                    : ``
                    }${_employee.employeeMiddleName
                      ? `${_employee.employeeMiddleName} `
                      : ``
                    }${_employee.employeeFirstName
                      ? _employee.employeeFirstName
                      : ``
                    }`
                })
              }
            })
          }

          return {
            ...o,
            task: {
              ...o.task,
              priorityName: _priority?.priorityName,
              responsible: _rsEmployees
            },
          };
        });

        setTasks((task) => (isReset ? _task : [...task, ..._task]));

        // set paging state
        setPaging({
          ...paging,
          total: res.total,
          first: refParameters.current.first,
          page: refParameters.current.page,
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
        conditions: getConditions(),
      },
    };

    CrmMdActivityApi.summary(_dashboardParams).then((res) => {
      if (res) {
        prepareDashboardSummary(res);
        prepareDashboardByDeadline(res);
        prepareDashboardByState(res);
      }
    });
  };

  const prepareDashboardSummary = (data) => {
    let total = 0;
    if (data && data.length > 0) {
      data.forEach((d) => {
        total += d.total || 0;
      });
    }
    setTotalTasks(total);
  };

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
      data.forEach((d) => {
        switch (d.state) {
          case Enumeration.task.state.pending:
          case Enumeration.task.state.inProgress:
          case Enumeration.task.state.reviewing:
            onDue += d.ondue || 0;
            overDue += d.overdue || 0;
            break;
          case Enumeration.task.state.completed:
            completeOnDue += d.ondue || 0;
            compelteOverDue += d.overdue || 0;
            break;
          default:
            break;
        }
      });
    }

    // build series and labels
    let series = [],
      labels = [];
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
          position: "bottom",
        },
      },
    };

    setDashboardByDeadline(hasData ? _config : null);
  };

  /**
   * prepare dashboard by state
   * @param {*} data
   */
  const prepareDashboardByState = (data) => {
    let series = [],
      labels = [],
      hasData = false;

    if (data && data.length > 0) {
      data.forEach((d) => {
        if (d.total > 0) hasData = true;
        series.push(d.total);
        labels.push(t(`task.state.${d.state}`));
      });
    }

    let _config = {
      series: series,
      options: {
        labels: labels,
        legend: {
          position: "bottom",
        },
      },
    };

    setDashboardByState(hasData ? _config : null);
  };

  /**
   * on datatable change paging
   * @param {*} event
   */
  // const onPage = (event) => {
  //   refParameters.current = { ...refParameters.current, ...event };
  //   loadData();
  // };

  const handleSeeMore = () => {
    refParameters.current = {
      ...refParameters.current,
      page: refParameters.current.page + 1,
    };
    loadData(false);
  };

  /***
   * on changer filter
   */
  const applyChangeFilter = (prop, val) => {
    let _filter = _.cloneDeep(filter);
    switch (prop) {
      case "state":
      case "role":
        val = val.length > 0 ? val : [];
        break;
      // case "group":
      //     val = val || null
      //     break;
    }
    _filter[prop] = val;
    refParameters.current[prop] = val;
    refParameters.current = {
      ...refParameters.current,
      page: 0,
    };
    setFilter(_filter);
    loadData();
    loadDashboard();
  };

  const handleChangeRequestedBy = (e) => {
    applyChangeFilter("requestedBy", e.value);
  };
  const handleChangeResponsible = (e) => {
    applyChangeFilter("responsibleId", e.value);
  };

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
    setFilter(_filter);
  };

  /**
   * update filter
   * @param {*} val
   */
  const submitFilter = (mode) => {
    // let _filter = _.cloneDeep(filter);
    // let _filters = _.cloneDeep(filters);
    // if(mode && mode === "create"){
    //     _filter.id = 0;
    // }
    // if(mode && mode === "update" && !_filter.id) {
    //     setFilter(_filter);
    //     createFilter();
    //     return
    // }
    // TaskBaseApi.updateFilter(_filter).then((res) => {
    //     if(res) {
    //         let _index  = _.findIndex(_filters,{id:_filter.id});
    //         if(_index > -1) {
    //             _filters[_index] = _filter
    //         } else {
    //             _filter.id = res.id
    //             _filters.push(_filter)
    //         }
    //         hideFilterName();
    //         setFilters(_filters);
    //         setSelectedFilter(_filter);
    //         CommonFunction.toastSuccess(t('common.save-success'));
    //     }
    // })
  };

  const handleCancel = () => {
    setEdittingData(null);
    setTabActive(null);
  };

  /**
   * update filter
   * @param {*} val
   */
  const hideFilterName = () => {
    setShowNameFilter(false);
  };

  /**
   * create filter
   * @param {*} val
   */
  const createFilter = () => {
    setShowNameFilter(true);
  };

  /**
   * create filter
   * @param {*} val
   */
  const deleteFilter = () => {
    // let _filter = _.cloneDeep(filter);
    // let _filters = _.cloneDeep(filters);
    // if(_filter.id && _filter.name){
    //     TaskBaseApi.deleteFilter(_filter).then(res => {
    //         if(res){
    //             let _index  = _.findIndex(_filters,{id:_filter.id});
    //             if(_index > -1){
    //                 _filters.splice(_index,1);
    //             }
    //             setFilters(_filters);
    //             setFilter({..._filter,id:0});
    //             CommonFunction.toastSuccess(t("common.deleted"));
    //         }
    //     }).catch(error => {
    //         CommonFunction.toastError(error)
    //     })
    // }
  };

  /**
   * update task
   */
  const updateTask = (_task) => () => {
    // setEdittingData(_task)
    // refTaskDetail.current.show();
    CrmMdActivityApi.getById(
      {
        include: ["next-states"],
      },
      _task.task.id
    ).then((res) => {
      if (res) {
        setEdittingData(res);
      }
    });
  };

  // /**
  //  * create task
  //  */
  // const createRequest = () => {
  // }

  const createTask = () => {
    let _task = {
      activityTypeId: ACTIVITY_TYPE.TASK_OBJECT,
      objectTypeId,
      type: "TASK",
    };
    if (objectTypeId) {
      _task[screenNameId] = screenId;
    }

    setEdittingData({
      task: _task,
      involves: [
        {
          role: "REQUESTER",
          involveType: "user",
          involveIds: [
            {
              id: window.app_context.user.id,
            },
          ],
        },
        {
          role: "RESPONSIBLE",
          involveType: "user",
          involveIds: [],
        },
      ],
    });
  };

  const createPhoneCall = () => {
    let _task = {
      activityTypeId: ACTIVITY_TYPE.PHONE_CALL_OBJECT,
      objectTypeId,
      type: "TASK",
    };
    if (objectTypeId) {
      _task[screenNameId] = screenId;
    }
    setEdittingData({
      task: _task,
      involves: [
        {
          role: "REQUESTER",
          involveType: "user",
          involveIds: [
            {
              id: window.app_context.user.id,
            },
          ],
        },
        {
          role: "RESPONSIBLE",
          involveType: "user",
          involveIds: [],
        },
      ],
    });
  };

  const createEmail = () => {
    let _task = {
      activityTypeId: ACTIVITY_TYPE.EMAIL_OBJECT,
      objectTypeId,
      type: "TASK",
    };
    if (objectTypeId) {
      _task[screenNameId] = screenId;
    }
    setEdittingData({
      task: _task,
      involves: [
        {
          role: "REQUESTER",
          involveType: "user",
          involveIds: [
            {
              id: window.app_context.user.id,
            },
          ],
        },
        {
          role: "RESPONSIBLE",
          involveType: "user",
          involveIds: [],
        },
      ],
    });
  };

  const createAppointment = () => {
    let _task = {
      activityTypeId: ACTIVITY_TYPE.APPOINTMENT_OBJECT,
      objectTypeId,
      type: "TASK",
    };
    if (objectTypeId) {
      _task[screenNameId] = screenId;
    }
    setEdittingData({
      task: _task,
      involves: [
        {
          role: "REQUESTER",
          involveType: "user",
          involveIds: [
            {
              id: window.app_context.user.id,
            },
          ],
        },
        {
          role: "RESPONSIBLE",
          involveType: "user",
          involveIds: [],
        },
        {
          role: "ASSIGNEE",
          involveType: "user",
          involveIds: [],
        },
      ],
    });
  };

  /**
   * toggle change state menu
   */
  const toggleChangeState = (e, _task) => {
    if (_task["next-states"] && _task["next-states"].length) {
      let _states = {};
      _task["next-states"].forEach((s) => {
        _states[s] = true;
      });
      setImpactTaskNextStates(_states);
      refImpactingTask.current = _.cloneDeep(_task);
      refChangeStageMenu.current.toggle(e);
    }
  };

  /**
   * change state
   * @param {*} state
   */
  const changeState = (state) => {
    if (refImpactingTask.current) {
      CrmMdActivityApi.changeState(refImpactingTask.current.id, state).then(
        (res) => {
          if (res) {
            let _tasks = _.cloneDeep(tasks);
            for (let i = 0; i < _tasks.length; i++) {
              if (_tasks[i].task.id === refImpactingTask.current.id) {
                _tasks[i].task.state = res.task.state;
                _tasks[i].task["next-states"] = res.task["next-states"] || [];
                break;
              }
            }
            setTasks(_tasks);
            CommonFunction.toastSuccess(t("common.save-success"));
          }
          refChangeStageMenu.current.hide();
        }
      );
    }
  };

  /***
   * change filter
   */

  const applyChangeSelectedFilter = (val) => {
    for (const property in val) {
      refParameters.current[property] = val[property];
    }
    loadData();
    loadDashboard();
    setFilter(val);
    setSelectedFilter(val);
  };

  const renderToolbarLeft = () => {
    return (
      <div className="p-p-2 crm-toolbar-left">
        <Button
          label={t("crm.task-base.create-task")}
          icon="bx bx-task create color-task "
          onClick={() => {
            setTabActive("task");
            createTask();
          }}
          disabled={!permission?.create_task}
          className={`crm-button ${tabActive === "task" ? "active" : ""}`}
        />
        <Button
          label={t("crm.task-base.create-phone-call")}
          icon="bx bx-phone create color-phone"
          onClick={() => {
            setTabActive("phone");
            createPhoneCall();
          }}
          disabled={!permission?.create_task}
          className={`crm-button ${tabActive === "phone" ? "active" : ""}`}
        />
        <Button
          label={t("crm.task-base.create-email")}
          icon="bx bx-envelope create color-email"
          onClick={() => {
            setTabActive("email");
            createEmail();
          }}
          disabled={!permission?.create_task}
          className={`crm-button ${tabActive === "email" ? "active" : ""}`}
        />
        <Button
          label={t("crm.task-base.create-appointment")}
          icon="bx bxs-calendar-plus create color-calendar"
          onClick={() => {
            setTabActive("appointment");
            createAppointment();
          }}
          disabled={!permission?.create_task}
          className={`crm-button ${tabActive === "appointment" ? "active" : ""
            }`}
        />
      </div>
    );
  };

  const renderToolbarRight = () => {
    return <div className="crm-toolbar-right"></div>;
  };

  const renderFilter = () => {
    return (
      <div className="flex justify-content-end align-items-center card mt-3">
        <span className="link-button crm-text-13">{t("common.filter")}</span>
        <Button
          className="p-button-outlined text-color-secondary ml-1 p-2"
          icon="bx bx-filter-alt text-xl"
          tooltip={t("task.config-filter")}
          tooltipOptions={{ position: "top" }}
          onClick={(e) => refFilterPanel.current.toggle(e)}
        ></Button>
      </div>
    );
  };

  const onShowAll = () => {
    refHistoriesActivity.current.showAll()
  }

  return (
    <>
      <XLayout className="border-1 border-400 border-round-md">
        <XLayout_Top>
          <div className="crm-toolbar mb-3">
            {renderToolbarLeft()}
            {renderToolbarRight()}
          </div>
        </XLayout_Top>
        <XLayout_Center>
          {!edittingData ? (
            <div className="flex  justify-content-center align-items-center mx-3 mb-3">
              <span className="w-full text-center border-1 border-400 border-round-md   p-2 opacity-50 mr-2 ">
                {t("crm.task-base.create-task")}
              </span>
              <Button
                className="p-button p-component p-button-sm justify-content-center line-height-3 py-2 w-5rem"
                onClick={() => {
                  setTabActive("task");
                  createTask();
                }}
              >
                {t("insert")}
              </Button>
            </div>
          ) : (
            <TaskBaseCrmDetail
              ref={refTaskDetail}
              data={edittingData}
              priorities={priorities}
              employees={employees}
              taskTypes={taskTypes}
              groups={groups}
              accountId={accountId}
              durationUnits={durationUnits}
              dialog={false}
              afterSubmit={loadData}
              handleCancel={handleCancel}
              disableToolbar={true}
              cancel={handleCancel}
              objectTypeId={objectTypeId}
            />
          )}
        </XLayout_Center>
      </XLayout>

      {renderFilter()}

      <div className="flex justify-content-end my-3 align-items-center card  card  ">
        <a className="link-button crm-text-13" onClick={onShowAll}>
          {t("crm.task-base.extended-description")}
        </a>
        <span className="text-xl font-bold mx-1">·</span>
        <a className="link-button crm-text-13">{t("crm.task-base.view-all")}</a>
      </div>

      <HistoriesActivity
        ref={refHistoriesActivity}
        tasks={tasks}
        paging={paging}
        permission={permission}
        setTasks={setTasks}
        updateTask={updateTask}
        handleSeeMore={handleSeeMore}
      />

      <OverlayPanel ref={refChangeStageMenu} className="x-menu">
        {impactTaskNextStates[Enumeration.task.state.pending] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.pending)}
          >
            <i className="bx bx-pause"></i>
            <span>{t("task.state.PENDING")}</span>
          </div>
        )}
        {impactTaskNextStates[Enumeration.task.state.inProgress] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.inProgress)}
          >
            <i className="bx bx-play"></i>
            <span>{t("task.state.IN_PROGRESS")}</span>
          </div>
        )}
        {impactTaskNextStates[Enumeration.task.state.deferred] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.deferred)}
          >
            <i className="bx bx-stop"></i>
            <span>{t("task.state.DEFERRED")}</span>
          </div>
        )}
        {impactTaskNextStates[Enumeration.task.state.canceled] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.canceled)}
          >
            <i className="bx bx-x"></i>
            <span>{t("task.state.CANCELED")}</span>
          </div>
        )}
        {impactTaskNextStates[Enumeration.task.state.completed] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.completed)}
          >
            <i className="bx bx-check"></i>
            <span>{t("task.state.COMPLETED")}</span>
          </div>
        )}
        {impactTaskNextStates[Enumeration.task.state.reviewing] && (
          <div
            className="x-menu-button"
            onClick={() => changeState(Enumeration.task.state.reviewing)}
          >
            <i className="bx bx-search-alt-2"></i>
            <span>{t("task.state.REVIEWING")}</span>
          </div>
        )}
      </OverlayPanel>

      <OverlayPanel
        ref={refFilterPanel}
        className="p-0 overflow-y-scroll"
        style={{ width: "500px", maxHeight: "90vh" }}
      >
        <XLayout className="surface-200">
          <XLayout_Top className="surface-300 border-none border-bottom-1 border-400 py-2">
            <span className="link-button ml-2 text-lg font-medium">
              {t("common.filter")}
            </span>
          </XLayout_Top>
          <XLayout_Center className={"overflow-hidden"}>
            <div className="p-fluid fluid formgrid grid crm-filter p-2 mt-1">
              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="name"
                    optionValue="id"
                    display="chip"
                    value={filter.activityTypeId}
                    inputId="activity-type-filter"
                    options={activityTypes}
                    onChange={(e) => applyChangeFilter("activityTypeId", e.value)}
                  />
                  <label htmlFor="responsible-filter" className="crm-text-13">
                    {t("crm.task-base.acctivity-type")}
                  </label>
                </span>
              </div>
              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="name"
                    optionValue="id"
                    display="chip"
                    value={filter.objectTypeId}
                    inputId="object-type-filter"
                    options={objectTypes}
                    onChange={(e) => applyChangeFilter("objectTypeId", e.value)}
                    disabled={objectTypeId}
                  />
                  <label htmlFor="responsible-filter" className="crm-text-13">
                    {t("crm.task-base.detail.object-type")}
                  </label>
                </span>
              </div>
              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="name"
                    optionValue="code"
                    display="chip"
                    value={filter.state}
                    inputId="state-filter"
                    options={taskStateMenuItems}
                    onChange={(e) => applyChangeFilter("state", e.value)}
                  />
                  <label htmlFor="responsible-filter" className="crm-text-13">
                    {t("task.filter.state")}
                  </label>
                </span>
              </div>

              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="priorityName"
                    optionValue="id"
                    display="chip"
                    value={filter.priorityId}
                    inputId="priority-filter"
                    options={priorities}
                    onChange={(e) => applyChangeFilter("priorityId", e.value)}
                  />
                  <label htmlFor="responsible-filter" className="crm-text-13">
                    {t("crm.task-base.detail.priority")}
                  </label>
                </span>
              </div>
              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="fullName"
                    optionValue="userId"
                    display="chip"
                    value={filter.responsibleId}
                    filter
                    filterBy='fullName'
                    inputId="responsible-filter"
                    options={allowEmployees}
                    onChange={(e) => applyChangeFilter("responsibleId", e.value)}
                  />
                  <label htmlFor="responsible-filter" className="crm-text-13">
                    {t("crm.task-base.responsible")}
                  </label>
                </span>
              </div>
              <div className="col-6">
                <span className="p-float-label">
                  <MultiSelect
                    optionLabel="fullName"
                    optionValue="userId"
                    display="chip"
                    value={filter.requestedBy}
                    filter
                    filterBy='fullName'
                    inputId="requested-filter"
                    options={allowEmployees}
                    onChange={(e) => applyChangeFilter("requestedBy", e.value)}
                  />
                  <label htmlFor="requested-filter" className="crm-text-13">
                    {t("crm.task-base.requested")}
                  </label>
                </span>
              </div>


              <div className="col-12 crm-text-13 my-2 flex align-items-center">
                <Button
                  className='p-button-text w-auto'
                  label={t('crm.task-base.filter-by-time')}
                  icon={classNames({ 'bx bxs-chevron-up': openFilterByTime, 'bx bxs-chevron-down': !openFilterByTime })}
                  onClick={() => setOpenFilterByTime(!openFilterByTime)}
                />
              </div>

              {openFilterByTime && (
                <>
                  {/* <div className="col-6 crm-text-13 mb-1">
                                    <Checkbox></Checkbox>
                                    <span className="ml-1">
                                        {t("crm-sale.opportunity.in-due-date")}
                                    </span>
                                </div>
                                <div className="col-6 crm-text-13 mb-1">
                                    <Checkbox></Checkbox>
                                    <span className="ml-1 crm-text-13">
                                        {t("crm-sale.opportunity.out-of-date")}
                                    </span>
                                </div> */}
                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.start-date-from")}
                          </span>
                        }
                        value={filter.startFrom}
                        onChange={(value) => applyChangeFilter("startFrom", value)}
                      />
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.start-date-to")}
                          </span>
                        }
                        value={filter.startTo}
                        onChange={(value) => applyChangeFilter("startTo", value)}
                      />
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.dealine-from")}
                          </span>
                        }
                        value={filter.deadlineFrom}
                        onChange={(value) => applyChangeFilter("deadlineFrom", value)}
                      />
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.dealine-to")}
                          </span>
                        }
                        value={filter.deadlineTo}
                        onChange={(value) => applyChangeFilter("deadlineTo", value)}
                      />
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.close-date-from")}
                          </span>
                        }
                        value={filter.closeFrom}
                        onChange={(value) => applyChangeFilter("closeFrom", value)}
                      />
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="p-float-label">
                      <XCalendar
                        label={
                          <span className="crm-text-13">
                            {t("crm.task-base.close-date-to")}
                          </span>
                        }
                        value={filter.closeTo}
                        onChange={(value) => applyChangeFilter("closeTo", value)}
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          </XLayout_Center>
        </XLayout>
      </OverlayPanel>
    </>
  );
}

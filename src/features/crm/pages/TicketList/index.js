import React, { useEffect, useRef, useState } from "react";


import CommonFunction from '@lib/common';
import _ from "lodash";
import Enumeration from '@lib/enum';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import TicketEnumeration from "../../ticket-common/TicketEnumeration";
import TicketDetail from "../../components/TicketDetail";
import TicketApi from "services/TicketApi";
import DisplayUtil from "components/util/DisplayUtil";
import { CrmUserAutoComplete } from "features/crm/components/CrmUserAutoComplete"
import TicketUtil from "../../ticket-common/TicketUtil";
import Ticket_ListTask_Detail from "../../components/Ticket_ListTask_Detail";
import { Checkbox } from "primereact/checkbox";
import "./styles.scss";
import { Tooltip } from "primereact/tooltip";
import TaskUtil from "components/util/TaskUtil";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import TicketTable from "../TicketTable";
import { SelectButton } from "primereact/selectbutton";
import TicketKanban from "../TicketKanban";
import { Panel } from "primereact/panel";
import XErrorPage from '@ui-lib/x-error-page/XErrorPage';
import { PriorityDropdown } from "../../components/PriorityDropdown";
import { CrmAccountApi } from "../../../../services/CrmAccountService";
import { CrmMdAccountUserApi } from "../../../../services/CrmMdAccountUserService";
import { CrmAccountUserApi } from "../../../../services/CrmAccountUser";
import RoleApi from "../../../../services/RoleService";
import UserApi from "../../../../services/UserService";

const application = `crm-service-service`
const type = `crm-service-service`
const refType = `crm-product`

export default function TicketList(props) {
    const t = CommonFunction.t;
    const permissionCode = "crm-service-service_ticket";

    const { user } = props;
    const refTicketDetail = useRef();
    const refTaskDetail = useRef();
    const refTicketTable = useRef();
    const refTicketKanban = useRef();
    const [viewType, setViewType] = useState("list");
    const refFilterPanel = useRef(null);
    const refPendingTask = useRef(null);
    const refImpactingTask = useRef();
    const [pendingTasks, setPendingTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [totalTicket, setTotalTicket] = useState(0);
    const [totalTicketNotClose, setTotalTicketNotClose] = useState(0);
    const [permission, setPermission] = useState(false);

    const [accounts, setAccounts] = useState([]);

    const [accountIdUsers, setAccountIdUsers] = useState([]);

    const [account, setAccount] = useState([]);

    const [roles, setRoles] = useState([]);

    const [roleUsers, setRoleUsers] = useState([]);

    const [allUsers, setAllUsers] = useState([]);

    const [groupUsers, setGroupUsers] = useState([]);
    const refInitLoad = useRef({
        initLoad: false
    });

    const defaultFilter = {
        checkPermission: false,
        id: -1,
        projectId: null,
        name: t("task.filter.default-name"),
        groupId: null,
        roleId: null,
        // state: [TicketEnumeration.state.ticket.init, TicketEnumeration.state.ticket.pending, TicketEnumeration.state.ticket.response, TicketEnumeration.state.ticket.inProgress, TicketEnumeration.state.change.accepted, TicketEnumeration.state.change.evaluation],
        role: [],
        checkTask: false,
        priority: null,
        type: [TicketEnumeration.type.ticket, TicketEnumeration.type.change, TicketEnumeration.type.problem],
    };

    const taskStateMenuItems = [
        { name: t("ticket.state.ticket.INIT"), code: TicketEnumeration.state.ticket.init },
        { name: t("ticket.state.ticket.IN_PROGRESS"), code: TicketEnumeration.state.ticket.inProgress },
        { name: t("ticket.state.ticket.RESPONSE"), code: TicketEnumeration.state.ticket.response },
        { name: t("ticket.state.ticket.PENDING"), code: TicketEnumeration.state.ticket.pending },
        { name: t("ticket.state.ticket.CANCELED"), code: TicketEnumeration.state.ticket.canceled },
        { name: t("ticket.state.ticket.SOLVED"), code: TicketEnumeration.state.ticket.solved },
        { name: t("ticket.state.ticket.COMPLETED"), code: TicketEnumeration.state.ticket.completed },
        { name: t("ticket.state.ticket.EVALUTION"), code: TicketEnumeration.state.change.evaluation },
        { name: t("ticket.state.ticket.ACCEPTED"), code: TicketEnumeration.state.change.accepted },
        { name: t("ticket.state.ticket.DEFERRED"), code: TicketEnumeration.state.change.deferred },
    ];

    const issuePrioritiesMenuItems = [
        { code: "VERY_HIGH", name: t("priority-very-high"), score: 5, color: "#f51515" },
        { code: "HIGH", name: t("priority-high"), score: 4, color: "#c94831" },
        { code: "MEDIUM", name: t("priority-medium"), score: 3, color: "#ea821a" },
        { code: "LOW", name: t("priority-low"), score: 2, color: "#f8ff76" },
        { code: "VERY_LOW", name: t("priority-very-low"), score: 1, color: "#ffd15e" },
    ];
    const [colorMatrix, setColorMatrix] = useState(issuePrioritiesMenuItems);
    const defaultPaging = {
        first: 0,
        size: 20,
        page: 0,
        total: 0,
    };

    const refParameters = useRef({
        ...defaultPaging,
        keyword: "",
        roleId: defaultFilter.roleId,
        state: defaultFilter.state,
        role: defaultFilter.role,
        projectId: defaultFilter.projectId,
        priority: defaultFilter.priority,
        requesterUsers: [],
        responsibleUsers: [],
        assigneeUsers: [],
    });

    const ticketTypes = [
        { name: t("ticket.ticket"), code: TicketEnumeration.type.ticket },
        { name: t("ticket.change"), code: TicketEnumeration.type.change },
        { name: t("ticket.problem"), code: TicketEnumeration.type.problem },
    ];
    const [lazy, setLazy] = useState({
        page: 0,
        first: 0,
        size: 25,
        affect: {
            type: [],
            projectId: defaultFilter.projectId,
            role: defaultFilter.role,
            state: defaultFilter.state,
            keyword: "",
            requesterUsers: [],
            responsibleUsers: [],
            assigneeUsers: [],
            observerUsers: [],
            taskOverDue: false,
            taskTodayDue: false,
            taskOnDue: false,

            startDateFrom: null,
            startDateTo: null,
            deadlineFrom: null,
            deadlineTo: null,

            responseDeadlineFrom: null,
            responseDeadlineTo: null,
            resolvedDateFrom: null,
            resolvedDateTo: null,

            closeOnFrom: null,
            closeOnTo: null,
            responseDateFrom: null,
            responseDateTo: null,
            roleId: null,
            priority: null,
        },
        condition: {
            groupId: -1,
            conditions: [],
        },
    });

    const [loadingExport, setLoadingExport] = useState(false);
    const refDynamicForm = useRef(null);

    /**
     * onetime
     */
    useEffect(() => {
        applyChangeFilter(null, null, viewType);
    }, [viewType]);

    useEffect(() => {
        let _groupUsers = _.cloneDeep(roleUsers)
        accountIdUsers.map(o => {
            const index = _.findIndex(_groupUsers, { id: o.id })
            if (index == -1) {
                _groupUsers.push(o)
            }
        })
        setGroupUsers(_groupUsers)
    }, [roleUsers, accountIdUsers])
    /**
     * onetime
     */
    useEffect(() => {
        checkPermission();
        getTotalticket();
        loadAccounts()
        loadUserFlowAccount()
        loadRoles()
    }, []);

    const loadAccounts = () => {
        CrmAccountApi.getAllNonPermission({
            status: 1
        }).then(res => {
            if (res) {
                setAccounts(res);
            } else {
                setAccounts([]);
            }
        })
    }

    const loadUserFlowAccount = () => {
        CrmAccountApi.getByUserId(window.app_context.user?.id).then((res) => {
            if (!CommonFunction.isEmpty(res) && res.length) {
                setAccount(res)
                loadUserFlowAccountList(res, (_users) => {
                    setAccountIdUsers(_users);
                })
            } else {
                loadUserFlowAccountList([], () => {})
            }
        })
    }

    const loadUserFlowAccountList = (_accounts, callBack) => {
        try {
            CrmAccountUserApi.get({
                size: 99999,
            }).then(allUser => {
                if (allUser && allUser.content.length) {
                    setAllUsers(allUser.content)
                    let _users = []
                    Promise.all((function* () {

                        for (let _account of _accounts) {
                            yield new Promise(resolve => {
                                CrmMdAccountUserApi.get(_account.id).then(_us => {
                                    _us.map((o, index) => {
                                        const _user = _.find(allUser.content, { id: o.userId });
                                        o.id = _user?.id
                                        o.fullName = _user?.fullName
                                        if (!_.find(_users, { id: o.id })) {
                                            _users.push(o)
                                        }
                                    });
                                    resolve("")
                                })
                            })
                        }
                    })()).then(() => {
                        callBack(_users)
                    })
                }
            })
        } catch (e) {
            callBack([])
        }
    }

    const loadRoles = () => {
        RoleApi.getByApplicationAndType(application, type, refType, null).then(res => {
            if (res) {
                res.forEach(el => {
                    el.roleSet = el.roleSet || "";
                });
                res = _.sortBy(res, ["roleSet", "name"]);
                setRoles(res);
            }
        });
    }

    const loadRoleUsers = (id) => {
        if (id) {
            RoleApi.getRoleUsers(id).then(res => {
                setRoleUsers(res)
            })
        } else {
            setRoleUsers([])
        }
    }

    /**
     * get total ticket
     * @param {*} val
     */
    const getTotalticket = () => {
        // load data for total
        let _params = {
            page: 0,
            size: 9999,
            body: {
                props: ["id", "state"],
                include: ["next-states", "involves"],
                conditions: [
                    {
                        logicOperator: "",
                        conditionType: "RULE",
                        filterType: "FIELD",
                        fieldType: "STRING",
                        fieldName: "type",
                        operator: "IN",

                        values: [TicketEnumeration.type.ticket, TicketEnumeration.type.change, TicketEnumeration.type.problem],
                    },
                    {
                        logicOperator: "AND",
                        conditionType: "RULE",
                        filterType: "FIELD",
                        fieldType: "STRING",
                        fieldName: "state",
                        operator: "IN",
                        values: ["INIT", "RESPONSE", "IN_PROGRESS", "PENDING", "CANCELED", "SOLVED", "COMPLETED", "EVALUTION", "ACCEPTED"],
                    },
                ],
            },
        };
        TicketApi.list(_params).then((res) => {
            if (res) {
                // set total ticket not close
                let issueIsCloses = _.filter(res.content, function (e) {
                    return e.task.state === "CANCELED" || e.task.state === "SOLVED" || e.task.state === "COMPLETED";
                });
                setTotalTicketNotClose(res.total - (issueIsCloses ? issueIsCloses.length : 0));
                // set total
                setTotalTicket(res.total);
            } else {
                setTotalTicket(0);
            }
        });
    };

    /**
     * get role condition
     * @returns
     */
    const onChangeViewType = (val) => {
        if (viewType !== "list") {
            refParameters.current.type = [TicketEnumeration.type.ticket, TicketEnumeration.type.change, TicketEnumeration.type.problem];
        }
        setViewType(val ? val : "list");
        // applyChangeFilter(null, null, val)
    };

    /**
     * get role condition
     * @returns
     */
    const getConditions = async (_lazy, ignoreState = false) => {
        let conditiondate = [];

        if (!refInitLoad || !refInitLoad?.current?.initLoad) {
            const userRoles = await RoleApi.getUserRoles(window.app_context.user.id).catch(() => { })
            if (userRoles) {
                let _userRoles = _.filter(userRoles, { application: "crm-service-service", type: "crm-service-service", refType: "crm-product" })
                refInitLoad.current.userRoles = _userRoles
            }
            refInitLoad.current.initLoad = true
        }

        let _params = _.cloneDeep(refParameters.current),
            conditions = [
                {
                    logicOperator: "",
                    conditionType: "RULE",
                    filterType: "FIELD",
                    fieldType: "STRING",
                    fieldName: "type",
                    // priority: _lazy.condition.conditions[0]?.priority,
                    operator: "IN",
                    values: _params.type && _params.type.length > 0 ? _params.type : [TicketEnumeration.type.ticket, TicketEnumeration.type.change, TicketEnumeration.type.problem],
                },
            ],
            userId = window.app_context.user.id;
        let initConditions = {
            logicOperator: "AND",
            conditionType: "GROUP",
            filterType: "ROLE",
            children: []
        }
        // liên quan đến user đăng nhập
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
            logicOperator: "",
            conditionType: "GROUP",
            filterType: "ROLE",
            children: []
        }
        const _allowUser = (_params[`allowEmployees`] ?? []).map(o => (o.userId))

        _params.role.forEach((role, index) => {
            _roleConditions.children.push({
                logicOperator: index === 0 ? "" : "OR",
                conditionType: "RULE",
                filterType: "ROLE",
                fieldName: mappingRole[role],
                values: mappingRole[role] == Enumeration.task.role.requester || mappingRole[role] == Enumeration.task.role.responsible ? [userId, ..._allowUser] : [userId]
            });
        });
        initConditions.children.push(_roleConditions)
        if (refInitLoad.current.userRoles.length) {
            initConditions.children.push({
                logicOperator: "OR",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "LONG",
                fieldName: "role_id",
                operator: "IN",
                values: refInitLoad.current.userRoles.map(o => o.id),
            })
        }
        conditions.push(initConditions)


        // filter by group
        if (_params.roleId) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "LONG",
                fieldName: "role_id",
                operator: "IN",
                values: [_params.roleId],
            });
        }
        // filter by state
        if (!ignoreState && _params.state && _params.state.length > 0) {
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

        if (_params.priority) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "priority",
                operator: "IN",
                values: [_params.priority],
            });
        }

        // filter by project
        if (_params.accountId && _params.accountId > 0) {
            conditions.push({
                logicOperator: "AND",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "LONG",
                fieldName: "account_id",
                operator: "IN",
                values: [_params.accountId],
            });
        }

        if ((_params.responsibleUsers && _params.responsibleUsers.length > 0) || (_params.requesterUsers && _params.requesterUsers.length > 0) || (_params.assigneeUsers && _params.assigneeUsers.length > 0) || (_params.observerUsers && _params.observerUsers.length > 0)) {
            let _roleConditions = {
                logicOperator: "AND",
                conditionType: "GROUP",
                filterType: "ROLE",
                children: [],
            };
            if (_params.responsibleUsers && _params.responsibleUsers.length > 0) {
                _roleConditions.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "ROLE",
                    fieldName: Enumeration.task.role.responsible,
                    operator: "IN",
                    values: _params.responsibleUsers.map((u) => u.id),
                });
            }
            if (_params.requesterUsers && _params.requesterUsers.length > 0) {
                _roleConditions.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "ROLE",
                    fieldName: TicketEnumeration.role.requester,
                    operator: "IN",
                    values: _params.requesterUsers.map((u) => u.id),
                });
            }
            if (_params.assigneeUsers && _params.assigneeUsers.length > 0) {
                _roleConditions.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "ROLE",
                    fieldName: TicketEnumeration.role.assignee,
                    operator: "IN",
                    values: _params.assigneeUsers.map((u) => u.id),
                });
            }
            if (_params.observerUsers && _params.observerUsers.length > 0) {
                _roleConditions.children.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "ROLE",
                    fieldName: TicketEnumeration.role.observer,
                    operator: "IN",
                    values: _params.observerUsers.map((u) => u.id),
                });
            }
            conditions.push(_roleConditions);
        }

        if (_lazy.affect.taskOverDue || _lazy.affect.taskTodayDue || _lazy.affect.taskOnDue) {
            let duedate = {
                logicOperator: "AND",
                conditionType: "GROUP",
                children: [],
            };
            if (_lazy.affect.taskOverDue) {
                TaskUtil.addCondition(duedate.children, "a.deadline < coalesce(a.closed_on, now())", "DATE_TIME", "EXPRESSION", []);
            }
            if (_lazy.affect.taskOnDue) {
                TaskUtil.addCondition(duedate.children, "a.deadline > coalesce(a.closed_on, now())", "DATE_TIME", "EXPRESSION", []);
            }

            if (_lazy.affect.taskTodayDue) {
                TaskUtil.addCondition(duedate.children, "deadline", "DATE_TIME", "BETWEEN", [CommonFunction.formatDateISO8601(new Date().setHours(0, 0, 0, 0)), CommonFunction.formatDateISO8601(new Date().setHours(23, 59, 59, 9999))]);
            }
            conditions.push(duedate);
        }

        // filter by user

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
            conditions.push({
                logicOperator: "OR",
                conditionType: "RULE",
                filterType: "FIELD",
                fieldType: "STRING",
                fieldName: "code",
                operator: "LIKE",
                values: [_params.keyword],
            });
            if (_.isInteger(parseInt(_params.keyword))) {
                conditions.push({
                    logicOperator: "OR",
                    conditionType: "RULE",
                    filterType: "FIELD",
                    fieldType: "LONG",
                    fieldName: "id",
                    operator: "=",
                    values: [parseInt(_params.keyword)],
                });
            }
        }

        // filter start date
        if (!CommonFunction.isEmpty(_lazy.affect.startDateFrom)) {
            TaskUtil.addCondition(conditions, "start_date", "DATE", ">=", _lazy.affect.startDateFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.startDateTo)) {
            TaskUtil.addCondition(conditions, "start_date", "DATE", "<=", _lazy.affect.startDateTo, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.deadlineFrom)) {
            TaskUtil.addCondition(conditions, "deadline", "DATE", ">=", _lazy.affect.deadlineFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.deadlineTo)) {
            TaskUtil.addCondition(conditions, "deadline", "DATE", "<=", _lazy.affect.deadlineTo, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.responseDeadlineFrom)) {
            TaskUtil.addCondition(conditions, "response_deadline", "DATE", ">=", _lazy.affect.responseDeadlineFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.responseDeadlineTo)) {
            TaskUtil.addCondition(conditions, "response_deadline", "DATE", "<=", _lazy.affect.responseDeadlineTo, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.resolvedDateFrom)) {
            TaskUtil.addCondition(conditions, "resolved_date", "DATE", ">=", _lazy.affect.resolvedDateFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.resolvedDateTo)) {
            TaskUtil.addCondition(conditions, "resolved_date", "DATE", "<=", _lazy.affect.resolvedDateTo, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.closeOnFrom)) {
            TaskUtil.addCondition(conditions, "closed_on", "DATE", ">=", _lazy.affect.closeOnFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.closeOnTo)) {
            TaskUtil.addCondition(conditions, "closed_on", "DATE", "<=", _lazy.affect.closeOnTo, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.responseDateFrom)) {
            TaskUtil.addCondition(conditions, "response_date", "DATE", ">=", _lazy.affect.responseDateFrom, "AND");
        }
        if (!CommonFunction.isEmpty(_lazy.affect.responseDateTo)) {
            TaskUtil.addCondition(conditions, "response_date", "DATE", "<=", _lazy.affect.responseDateTo, "AND");
        }

        return [
            {
                logicOperator: "OR",
                conditionType: "GROUP",
                filterType: "ROLE",
                children: conditions,
            },
        ];
    };

    /**
     * set select role
     * @param {*} state
     * @param {*} val
     */
    const applyChangeFilter = (prop, val, _viewType = viewType) => {
        let _lazy = _.cloneDeep(lazy);
        if (prop) {
            let _affect = _lazy.affect;
            switch (prop) {
                case "startDateFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "startDateTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "closeOnFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "closeOnTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "responseDateFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "responseDateTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "deadlineFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "deadlineTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "responseDeadlineFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "responseDeadlineTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "resolvedDateFrom":
                    val = val ? CommonFunction.formatDateISO8601(val) : val;
                    break;
                case "resolvedDateTo":
                    if (val) {
                        val = CommonFunction.formatDateISO8601(new Date(val.setHours(23, 59, 59)));
                    }
                    break;
                case "checkTask":
                    if (val) {
                        refParameters.current["type"] = [TicketEnumeration.type.task];
                    } else {
                        refParameters.current["type"] = [TicketEnumeration.type.ticket, TicketEnumeration.type.change, TicketEnumeration.type.problem];
                    }
                    break;
                case "priority":
                    _affect[prop] = val;
                    _lazy.condition.conditions[prop] = val;
                    break;

                case "roleId":

                    loadRoleUsers(val)
                    break
                default:
                    break;
            }
            _affect[prop] = val;

            refParameters.current[prop] = val;
            setLazy(_lazy);
        }

        // load tasks
        CommonFunction.debounce(null, () => {
            if (_viewType === "list") {
                refTicketTable.current.filter(_lazy);
            } else if (_viewType === "kanban") {
                refTicketKanban.current.filter(_lazy);
            }
        });
    };

    /**
     * create task
     */
    const createTicket = (type) => {
        refTicketDetail.current.create(type);
    };

    /**
     * update task
     */
    const updateTask = (_task) => {
        if (permission) {
            refImpactingTask.current = _.cloneDeep(_task);
            if (_task.type === TicketEnumeration.type.task) {
                refTaskDetail.current.update(_task.id);
            } else {
                refTicketDetail.current.update(_task.id);
            }
        } else {
            CommonFunction.toastError(t("you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator"));
        }
    };

    /**
     * after submit task base detail
     */
    const afterSubmitTicketDetail = async (editMode, responseAfterSubmit) => {
        getTotalticket();
        if (viewType === "list") {
            refTicketTable.current.afterSubmitTicketDetail(editMode, responseAfterSubmit);
        } else {
            refTicketKanban.current.afterSubmitTicketDetail(editMode, responseAfterSubmit, editMode === Enumeration.crud.create ? null : _.cloneDeep(refImpactingTask.current));
        }
    };

    /**
     * toggle view pending tasks
     */
    const toggleViewPendingTasks = (e, _ticket) => {
        if (_ticket["pendingTasks"] && _ticket["pendingTasks"].length > 0) {
            setPendingTasks(_ticket["pendingTasks"]);
            refPendingTask.current.toggle(e);
        }
    };

    // header filter date
    const templateHeaderFilterDate = (options) => {
        const toggleIcon = options.collapsed ? "pi pi-chevron-down" : "pi pi-chevron-up";

        return <Button label={t("common.filter.time")} icon={`${toggleIcon}`} className={`${options.togglerClassName} p-button-text`} onClick={options.onTogglerClick}></Button>;
    };

    // header filter custom field
    const templateHeaderFilterCustomField = (options) => {
        const toggleIcon = options.collapsed ? "pi pi-chevron-down" : "pi pi-chevron-up";

        return <Button label={t("common.filter.custom-field")} icon={`${toggleIcon}`} className={`${options.togglerClassName} p-button-text`} onClick={options.onTogglerClick}></Button>;
    };

    /**
     * permission
     */
    const checkPermission = () => {
        if ((window.app_context.user.menuActions[permissionCode] && window.app_context.user.menuActions[permissionCode].update_task) || (window.app_context.user.menuActions[permissionCode] && window.app_context.user.menuActions[permissionCode].create_task)) {
            setPermission(true);
        } else {
            setPermission(false);
        }
    };

    try {
        return (
            <>
                <XLayout className="p-2">
                    <XLayout_Center>
                        <XLayout>
                            <XLayout_Top>
                                <XToolbar
                                    className="p-0 mb-2"
                                    left={() => (
                                        <div className="p-2">
                                            <Button disabled={!permission} label={t("ticket.ticket.add")} icon={`${TicketEnumeration.ui.ticket.icon} create`} onClick={() => createTicket(TicketEnumeration.type.ticket)}></Button>
                                            <Button disabled={!permission} label={t("ticket.change.add")} icon={`${TicketEnumeration.ui.change.icon} create`} onClick={() => createTicket(TicketEnumeration.type.change)}></Button>
                                            <Button disabled={!permission} label={t("ticket.problem.add")} icon={`${TicketEnumeration.ui.problem.icon} create`} onClick={() => createTicket(TicketEnumeration.type.problem)}></Button>
                                        </div>
                                    )}
                                    center={() => (
                                        <>
                                            <span>
                                                {t("ticket.total")}: {totalTicket}
                                            </span>
                                            <span className="ml-3">
                                                {t("ticket.total.not-close")}: {totalTicketNotClose || 0}
                                            </span>
                                        </>
                                    )}
                                    right={() => (
                                        <>
                                            {viewType === "list" && (
                                                <div className=" p-mr-5">
                                                    <Checkbox inputId="custom-checkTask" name="custom-checkTask" checked={refParameters.current.checkTask} onChange={(e) => applyChangeFilter("checkTask", e.checked)} />
                                                    <label className=" ml-1" htmlFor="custom-checkTask">
                                                        {t("ticket.task")}
                                                    </label>
                                                </div>
                                            )}
                                            <div className="p-fluid fluid  flex align-items-center pr-2 p-ml-auto">
                                                <SelectButton
                                                    value={viewType}
                                                    options={[
                                                        { icon: "bx bx-list-ul", value: "list", label: t("view-type.list") },
                                                        { icon: "bx bx-grid-horizontal", value: "kanban", label: t("view-type.kanban") },
                                                    ]}
                                                    onChange={(e) => onChangeViewType(e.value)}
                                                    itemTemplate={(option) => <i id={`view-type-${option.value}`} className={`${option.icon} fs-18`} />}
                                                    className="view-type-button"
                                                />
                                                <Tooltip target=".view-type-list" content={t(`view-type.list`)} position="bottom" />
                                                <Tooltip target=".view-type-kanban" content={t(`view-type.kanban`)} position="bottom" />
                                            </div>
                                            <span className="p-input-icon-left">
                                                <i className="bx bx-search-alt" />
                                                <InputText
                                                    // style={{ width: '180px' }}
                                                    value={lazy.affect.keyword}
                                                    onInput={(e) => applyChangeFilter("keyword", e.target.value)}
                                                    placeholder={t("common.search")}
                                                />
                                            </span>

                                            <div className="pl-2">
                                                <Button icon="bx bx-filter setting" tooltip={t("task.config-filter")} tooltipOptions={{ position: "top" }} onClick={(e) => refFilterPanel.current.toggle(e)}></Button>
                                                <Button
                                                    tooltip={t("gantt.export-task")}
                                                    tooltipOptions={{ position: "top" }}
                                                    icon="bx bxs-file text-green-9"
                                                    loading={loadingExport}
                                                    onClick={async () => {
                                                        setLoadingExport(true);
                                                        const condition = await getConditions(lazy)
                                                        await TicketUtil.exportTicketTable(condition, t, lazy);
                                                        setLoadingExport(false);
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                ></XToolbar>
                            </XLayout_Top>
                            <XLayout_Center>
                                <div className="flex flex-column h-full">
                                    {viewType === "list" && <TicketTable ref={refTicketTable} getConditions={getConditions} toggleViewPendingTasks={toggleViewPendingTasks} updateTask={updateTask} permission={permission} lazy={lazy} setLazy={setLazy} />}
                                    {viewType === "kanban" && <TicketKanban ref={refTicketKanban} getConditions={getConditions} colorMatrix={colorMatrix} toggleViewPendingTasks={toggleViewPendingTasks} updateTask={updateTask} permission={permission} lazy={lazy} setLazy={setLazy} />}
                                </div>
                            </XLayout_Center>
                        </XLayout>
                    </XLayout_Center>
                </XLayout>

                <OverlayPanel ref={refPendingTask} className="x-menu">
                    {pendingTasks &&
                        pendingTasks.length > 0 &&
                        pendingTasks.map((s, index) => (
                            <div key={index} className="border-bottom my-1-5">
                                <span>{s.taskName}</span>
                                <span className="ml-2">{DisplayUtil.displayChipUser(s.responsibleUser)}</span>
                            </div>
                        ))}
                </OverlayPanel>

                <OverlayPanel ref={refFilterPanel} className="x-menu" style={{ width: "600px" }}>
                    <XLayout>
                        <XLayout_Center>
                            <div className="grid formgrid p-fluid fluid ">
                                <div className="p-field  col-12">
                                    <span className="p-float-label mt-1">
                                        <Dropdown
                                            value={lazy.affect.accountId}
                                            options={accounts}
                                            optionLabel="accountName"
                                            optionValue="id"
                                            inputId="account-filter"
                                            filter
                                            showClear
                                            filterBy="accountName"
                                            onChange={(e) => applyChangeFilter("accountId", e.target.value)}
                                        />
                                        <label htmlFor="account-filter">{t("ticket.account")}</label>
                                    </span>
                                </div>
                                {!refParameters.current.checkTask && (
                                    <div className="p-field  col-6">
                                        <span className="p-float-label mt-1">
                                            <MultiSelect id="cboFilterTicketType" optionLabel="name" optionValue="code" display="chip" value={lazy.affect.type} options={ticketTypes} onChange={(e) => applyChangeFilter("type", e.value)} />
                                            <label htmlFor="cboFilterTicketType">{t("common.type")}</label>
                                        </span>
                                    </div>
                                )}
                                {/* <span className="p-float-label mt-1">
                                <MultiSelect optionLabel="name" optionValue="code"
                                    display="chip" 
                                    value={lazy.affect.role}
                                    inputId="role-filter"
                                    options={roleMenuItems} onChange={(e) => applyChangeFilter("role",e.value)} />
                                <label htmlFor="role-filter">{t("task.filter.role")}</label>
                            </span> */}

                                <div className="p-field  col-6">
                                    <span className="p-float-label mt-1">
                                        <MultiSelect optionLabel="name" optionValue="code" disply="chip" value={lazy.affect.state} inputId="state-filter" options={taskStateMenuItems} onChange={(e) => applyChangeFilter("state", e.value)} />
                                        <label htmlFor="state-filter">{t("task.filter.state")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <PriorityDropdown id="priority" options={issuePrioritiesMenuItems} value={lazy.affect.priority} onChange={(e) => applyChangeFilter("priority", e.value)}></PriorityDropdown>
                                        <label>{t("ticket.priority")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.requesterUsers && lazy.affect.requesterUsers.length ? lazy.affect.requesterUsers : null}
                                            users={allUsers}
                                            onChange={(e) => applyChangeFilter("requesterUsers", e.value)}
                                        />
                                        <label>{t("ticket.requester")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.responsibleUsers && lazy.affect.responsibleUsers.length ? lazy.affect.responsibleUsers : null}
                                            users={allUsers}
                                            onChange={(e) => applyChangeFilter("responsibleUsers", e.value)}
                                        />
                                        <label>{t("ticket.responsible")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.assigneeUsers && lazy.affect.assigneeUsers.length ? lazy.affect.assigneeUsers : null}
                                            users={lazy.affect.roleId ? roleUsers : allUsers}
                                            onChange={(e) => applyChangeFilter("assigneeUsers", e.value)}
                                        />
                                        <label>{t("ticket.assign")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.observerUsers && lazy.affect.observerUsers.length ? lazy.affect.observerUsers : null}
                                            users={lazy.affect.roleId ? groupUsers : allUsers}
                                            onChange={(e) => applyChangeFilter("observerUsers", e.value)}
                                        />
                                        <label>{t("ticket.observer")}</label>
                                    </span>
                                </div>
                                <div className="p-field  col-6">
                                    <span className="p-float-label">
                                        <Dropdown
                                            value={lazy.affect.roleId}
                                            options={roles}
                                            optionLabel="name"
                                            optionValue="roleId"
                                            inputId="role-filter"
                                            filter
                                            showClear
                                            filterBy="name"
                                            onChange={(e) => applyChangeFilter("roleId", e.target.value)}
                                        />
                                        <label htmlFor="role-filter">{t("ticket.role")}</label>
                                    </span>
                                </div>

                                {/* <div className="p-field  col-6">
                                    <span className="p-float-label mt-1">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.requesterUsers ? lazy.affect.requesterUsers : []}
                                            groupIds={projects.map((p) => p.groupId)}
                                            excludeUserIds={lazy.affect.requesterUsers ? lazy.affect.requesterUsers.map((m) => m.id) : []}
                                            onChange={(value) => applyChangeFilter("requesterUsers", value)}
                                        />
                                        <label>{t("ticket.requester")}</label>
                                    </span>
                                </div> */}
                                {/* <div className="p-field  col-6">
                                    <span className="p-float-label mt-1">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.responsibleUsers ? lazy.affect.responsibleUsers : []}
                                            groupIds={projects.map((p) => p.groupId)}
                                            excludeUserIds={lazy.affect.responsibleUsers ? lazy.affect.responsibleUsers.map((m) => m.id) : []}
                                            onChange={(value) => applyChangeFilter("responsibleUsers", value)}
                                        />
                                        <label>{t("ticket.responsible")}</label>
                                    </span>
                                </div> */}
                                {/* <div className="p-field  col-6">
                                    <span className="p-float-label mt-1">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.assigneeUsers ? lazy.affect.assigneeUsers : []}
                                            groupIds={projects.map((p) => p.groupId)}
                                            excludeUserIds={lazy.affect.assigneeUsers ? lazy.affect.assigneeUsers.map((m) => m.id) : []}
                                            onChange={(value) => applyChangeFilter("assigneeUsers", value)}
                                        />
                                        <label>{t("ticket.assign")}</label>
                                    </span>
                                </div> */}
                                {/* <div className="p-field  col-6">
                                    <span className="p-float-label mt-1">
                                        <CrmUserAutoComplete
                                            multiple
                                            value={lazy.affect.observerUsers ? lazy.affect.observerUsers : []}
                                            groupIds={projects.map((p) => p.groupId)}
                                            excludeUserIds={lazy.affect.observerUsers ? lazy.affect.observerUsers.map((m) => m.id) : []}
                                            onChange={(value) => applyChangeFilter("observerUsers", value)}
                                        />
                                        <label>{t("ticket.observer")}</label>
                                    </span>
                                </div> */}
                            </div>
                            <Panel collapsed={true} className="p-0 filter-date" headerTemplate={templateHeaderFilterDate} toggleable>
                                <div className="grid formgrid p-fluid fluid ">
                                    <div className="col-4 mt-1 ">
                                        <span className="p-field-checkbox p-0">
                                            <Checkbox inputId="is-today-due" name="status" checked={lazy.affect.taskTodayDue} onChange={(e) => applyChangeFilter("taskTodayDue", e.checked)} />
                                            <label htmlFor="is-today-due">{t("task.state.TODAYDUE")}</label>
                                        </span>
                                    </div>
                                    <div className="col-4 mt-1 ">
                                        <span className="p-field-checkbox p-0">
                                            <Checkbox inputId="is-over-due" name="status" checked={lazy.affect.taskOverDue} onChange={(e) => applyChangeFilter("taskOverDue", e.checked)} />
                                            <label htmlFor="is-over-due">{t("task.state.OVERDUE")}</label>
                                        </span>
                                    </div>
                                    <div className="col-4 mt-1 ">
                                        <span className="p-field-checkbox p-0">
                                            <Checkbox inputId="is-on-due" name="status" checked={lazy.affect.taskOnDue} onChange={(e) => applyChangeFilter("taskOnDue", e.checked)} />
                                            <label htmlFor="is-on-due">{t("task.due.ondue")}</label>
                                        </span>
                                    </div>

                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.startDate.from")} value={lazy.affect.startDateFrom} onChange={(e) => applyChangeFilter("startDateFrom", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.deadline.from")} value={lazy.affect.deadlineFrom} onChange={(e) => applyChangeFilter("deadlineFrom", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.response-deadline.from")} value={lazy.affect.responseDeadlineFrom} onChange={(e) => applyChangeFilter("responseDeadlineFrom", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.startDate.to")} value={lazy.affect.startDateTo} onChange={(e) => applyChangeFilter("startDateTo", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.deadline.to")} value={lazy.affect.deadlineTo} onChange={(e) => applyChangeFilter("deadlineTo", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.response-deadline.to")} value={lazy.affect.responseDeadlineTo} onChange={(e) => applyChangeFilter("responseDeadlineTo", e)} />
                                        </span>
                                    </div>
                                </div>

                                <div className="grid formgrid p-fluid fluid  mt-2">
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.resolved-date.from")} value={lazy.affect.resolvedDateFrom} onChange={(e) => applyChangeFilter("resolvedDateFrom", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.close-on.from")} value={lazy.affect.closeOnFrom} onChange={(e) => applyChangeFilter("closeOnFrom", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.response-date.from")} value={lazy.affect.responseDateFrom} onChange={(e) => applyChangeFilter("responseDateFrom", e)} />
                                        </span>
                                    </div>

                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.resolved-date.to")} value={lazy.affect.resolvedDateTo} onChange={(e) => applyChangeFilter("resolvedDateTo", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.close-on.to")} value={lazy.affect.closeOnTo} onChange={(e) => applyChangeFilter("closeOnTo", e)} />
                                        </span>
                                    </div>
                                    <div className="col-4">
                                        <span className="p-float-label mt-1">
                                            <XCalendar showDate label={t("common.response-date.to")} value={lazy.affect.responseDateTo} onChange={(e) => applyChangeFilter("responseDateTo", e)} />
                                        </span>
                                    </div>
                                </div>
                            </Panel>
                        </XLayout_Center>
                    </XLayout>
                </OverlayPanel>

                <TicketDetail
                    roles={roles}
                    customers={account}
                    accountIdUsers={accountIdUsers}
                    ref={refTicketDetail}
                    afterSubmit={afterSubmitTicketDetail}
                />
                <Ticket_ListTask_Detail projects={projects} ref={refTaskDetail} afterSubmit={afterSubmitTicketDetail} />
            </>
        );
    } catch (error) {
        return <XErrorPage error={error}></XErrorPage>;
    }
}

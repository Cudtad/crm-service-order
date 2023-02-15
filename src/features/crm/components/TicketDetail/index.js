import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import _ from "lodash";
import TaskBaseDetail from "components/task/TaskBaseDetail";
import Enumeration from '@lib/enum';
import CommonFunction from '@lib/common';
import { InputText } from "primereact/inputtext";
import { CrmUserAutoComplete } from "features/crm/components/CrmUserAutoComplete"
import { Button } from "primereact/button";

import { OverlayPanel } from "primereact/overlaypanel";
import XEditor from '@ui-lib/x-editor/XEditor';
import Task_State from "components/task/components/Task_State";
import TicketApi from "services/TicketApi";
import { Ticket_History } from "features/crm/components/Ticket_History";
import { Dropdown } from "primereact/dropdown";
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';
import TicketEnumeration from "features/crm/ticket-common/TicketEnumeration";
import FieldDynamicForm from "components/field-dynamic-form/FieldDynamicForm";
import "./styles.scss";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import Ticket_ListTask from "features/crm/components/Ticket_ListTask";
import ProjectApi from "services/ProjectService";
// import { PriorityDropdown } from "../../project/components/ProjectDetail/component/PriorityDropdown";
import ProjectUtil from "components/util/ProjectUtil";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TicketReferenceDetail from "features/crm/components/TicketReferenceDetail";
import { XLayout_Form } from "@ngdox/ui-lib/dist/components/x-layout/XLayout";
import { PriorityDropdown } from "../PriorityDropdown";
import { CrmAccountTypeApi } from "../../../../services/CrmAccountTypeService";
import { CrmProductApi } from "../../../../services/CrmProductService";
import CrmResourceApi from "../../../../services/CrmResourceApi";
import CrmCategoryApi from "../../../../services/CrmCategoryApi";
import { CrmAccountUserSettingApi } from "../../../../services/CrmAccountUserSettingService";
import { CrmAccountApi } from "../../../../services/CrmAccountService";
import RoleApi from "../../../../services/RoleService";
import { CrmApplicationConfigApi } from "../../../../services/CrmApplicationConfig";
import FieldEntityApi from "services/config/FieldEntityApi"
import { CrmMdAccountUserApi } from "../../../../services/CrmMdAccountUserService";
import { CrmAccountUserApi } from "../../../../services/CrmAccountUser";


function TicketDetail(props, ref) {
    const t = CommonFunction.t;
    const { user } = props;
    const { afterSubmit, match, ticketId, roles, accountIdUsers, customers } = props;
    const refTicketDetail = useRef(null);
    const modeEnum = {
        create: "create",
        update: "update",
        copy: "copy",
    };
    const defaultData = {
        type: "TICKET",
        name: "",
        email: "",
        phone: "",
        description: "",
        startDate: new Date(),
        projectId: null,
        // locationId: 0,
        urgency: null,
        impact: null,
        priority: null,
        resourceId: null,
        // rootPhaseId: 0,
        // rootWorkPackageId: 0,
        subtype: 1,
        accountId: null,
        accountEmail: null,
        accountPhone: null,
        productId: null
    };

    const issuePrioritiesMenuItems = [
        { code: "CRITICAL", name: t("priority-critical"), score: 7, color: "#f22515" },
        { code: "VERY_HIGH", name: t("priority-very-high"), score: 6, color: "#f51515" },
        { code: "HIGH", name: t("priority-high"), score: 5, color: "#c94831" },
        { code: "MEDIUM", name: t("priority-medium"), score: 4, color: "#ea821a" },
        { code: "LOW", name: t("priority-low"), score: 3, color: "#f8ff76" },
        { code: "VERY_LOW", name: t("priority-very-low"), score: 2, color: "#ffd15e" },
        { code: "UNAFFECT", name: t("priority-unaffect"), score: 1, color: "#fdd15e" },
    ];

    const [ticket, setTicket] = useState(defaultData);
    const [responsibleId, setResponsibleId] = useState(defaultData);
    const [ticketDescription, setTicketDescription] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showTimelineticket, setShowTimelineticket] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showSubtype, setShowSubtype] = useState(false);
    const [ticketImpacts, setTicketImpacts] = useState("");
    const [ticketCauses, setTicketCauses] = useState("");
    const [ticketSymptoms, setTicketSymptoms] = useState("");
    const [ticketControl, setTicketControl] = useState("");
    const [ticketSolution, setTicketSolution] = useState("");
    const [fieldsConfig, setFieldsConfig] = useState([]);
    const [categories, setCategories] = useState([]);
    const [resources, setResources] = useState([]);
    // const [locations, setLocations] = useState([]);
    const [groupDetail, setGroupDetail] = useState([]);
    const [rootGroupId, setRootGroupId] = useState(0);
    const [mode, setMode] = useState(modeEnum.create);
    const [groups, setGroups] = useState([]);
    // const [rootPhases, setRootPhases] = useState([]);
    // const [rootWorkpackages, setRootWorkpackages] = useState([]);
    const referenceTicket = useRef(null);
    // const [locations, setLocations] = useState([]);
    const [btnLoading, setBtnLoading] = useState(false);

    const [account, setAccount] = useState(null);

    const [accountTypes, setAccountTypes] = useState([])

    const [products, setProducts] = useState([])

    const [roleUsers, setRoleUsers] = useState([]);

    const [groupUsers, setGroupUsers] = useState([]);

    const [accounts, setAccounts] = useState([]);

    const [usersFlowAccount, setUsersFlowAccount] = useState([]);

    const [allUsers, setAllUsers] = useState([]);

    const refDynamicForm = useRef(null);
    const defaultErrors = {
        name: "",
        projectId: "",
        involves: {
            REQUESTER: "",
        },
        priority: "",
    };
    const [errors, setErrors] = useState(defaultErrors);

    // involves
    const defaultInvolves = [
        {
            role: "REQUESTER",
            involveType: "user",
            involveIds: [
                {
                    id: window.app_context.user.id,
                    fullName: window.app_context.user.fullName,
                    avatar: window.app_context.user.avatar,
                    status: true,
                },
            ],
        },
        {
            role: "ASSIGNEE",
            involveType: "user",
            involveIds: [],
        },
        {
            role: "OBSERVER",
            involveType: "user",
            involveIds: [],
        },
        {
            role: "ASSIGNEE",
            involveType: "group",
            involveIds: [],
        },
        {
            role: "RESPONSIBLE",
            involveType: "user",
            involveIds: [
                {
                    id: window.app_context.user.id,
                    fullName: window.app_context.user.fullName,
                    avatar: window.app_context.user.avatar,
                    status: true,
                },
            ],
        },
    ];

    // analysis
    const defaultAnalysis = [
        {
            type: "Impacts",
            content: "",
        },
        {
            type: "Causes",
            content: "",
        },
        {
            type: "Symptoms",
            content: "",
        },
        {
            type: "Control",
            content: "",
        },
    ];
    const [involves, setInvolves] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [activate, setActivate] = useState(null);
    const [refTicket, setRefTicket] = useState([]);

    // matrix color
    const [colorMatrix, setColorMatrix] = useState(issuePrioritiesMenuItems);
    const [severityMatrix, setSeverityMatrix] = useState([]);

    const [showDialog, setShowDialog] = useState(true);

    // state
    const refChangeStageMenu = useRef(null);
    const refListTaskRequest = useRef(null);
    const newsState = {
        draft: {
            key: "DRAFT",
            name: t("newsfeed.state.DRAFT"),
            icon: "bx bx-edit-alt",
        },
        approved: {
            key: "APPROVED",
            name: t("newsfeed.state.APPROVED"),
            icon: "bx bx-check",
        },
    };

    // jodit config
    const refDescription = useRef(null);
    const refSolution = useRef(null);
    const refImpacts = useRef(null);
    const refCauses = useRef(null);
    const refSymptoms = useRef(null);
    const refControl = useRef(null);

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

    useEffect(() => {
        setGroups(ProjectUtil.getGroupFromRoot(window.app_context.user, rootGroupId));
    }, [rootGroupId]);

    useEffect(() => {
        if (ticketId) {
            setMode(modeEnum.update);
            setShowDialog(false);
            update(ticketId);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: (type) => {
            setMode(modeEnum.create);
            create(type);
        },

        /**
         * update
         * @param {*} id
         */
        update: (id) => {
            setMode(modeEnum.update);
            update(id);
        },

        delete: (_news) => {
            setMode(modeEnum.update);
            remove(_news);
        },
    }));

    const loadDataByProjectId = () => {
        loadAccounts()
        loadCategories()
        loadAccountTypes()
        loadProducts()
        setRootGroupId(0)
        loadSetting()
    };

    const loadUserFlowAccount = (id) => {
        if (id) {
            CrmMdAccountUserApi.get(id).then(_users => {
                if (_users.length) {
                    if (allUsers.length) {
                        _users = _users.map((o, index) => {
                            const _user = _.find(allUsers, { id: o.userId });
                            o.id = _user?.id
                            o.fullName = _user?.fullName
                            return o
                        });
                        setUsersFlowAccount(_users);
                    } else {
                        loadUsers((_allUsers) => {
                            _users = _users.map((o, index) => {
                                const _user = _.find(_allUsers, { id: o.userId });
                                o.id = _user?.id
                                o.fullName = _user?.fullName
                                return o
                            });
                            setUsersFlowAccount(_users);
                        })
                    }
                } else {
                    if (allUsers.length) {
                        setUsersFlowAccount(allUsers)
                    } else {
                        loadUsers((_allUsers) => {
                            setUsersFlowAccount(_allUsers);
                        })
                    }
                }
            })
        } else {
            loadUsers((_allUsers) => {
                setUsersFlowAccount(_allUsers);
            })
        }
    }

    const loadUsers = (callBack) => {
        CrmAccountUserApi.get({
            size: 99999,
        }).then(allUser => {
            if (allUser && allUser.content.length) {
                setAllUsers(allUser.content)
            }
            callBack(allUser?.content ?? [])
        }).catch(() => {
            callBack([])
        })
    }

    const loadFields = (type) => {
        FieldEntityApi.getByEntityType("crm-service-service", `ticket.${type}`, 0).then((res) => {
            setFieldsConfig(res);
        });
    }

    /**
     * load Accounts
     */
    const loadAccounts = () => {
        CrmAccountApi.getAllNonPermission({
            status: 1
        }).then((res) => {
            if (res) {
                setAccounts(res)
            } else {
                setAccounts([])
            }
        })
    }

    /**
     * load Account type
     */
    const loadAccountTypes = () => {
        CrmAccountTypeApi.get().then((res) => {
            if (res) {
                setAccountTypes(res)
            } else {
                setAccountTypes([])
            }
        })
    }
    const loadSetting = () => {
        CrmApplicationConfigApi.get().then((res) => {
            if (!CommonFunction.isEmpty(res) && res.config) {
                let _matrixConfig = res.config.matrixSeverity;
                if (_matrixConfig.colorMatrix) {
                    let _colorMatrix = _matrixConfig.colorMatrix;
                    _colorMatrix.map(function (m) {
                        let _meta = _.find(issuePrioritiesMenuItems, { code: m.code });
                        if (_meta) {
                            m.name = _meta.name;
                        }
                    });
                    setColorMatrix(_colorMatrix);
                }
                if (_matrixConfig.matrix) {
                    setSeverityMatrix(_matrixConfig.matrix);
                }
            } else {
                let _data = ProjectUtil.buildDefaultSeverityMatrix(issuePrioritiesMenuItems);
                setColorMatrix(issuePrioritiesMenuItems);
                if (_data) {
                    setSeverityMatrix(_data);
                }
            }
        })
    }


    /**
     * load Products
     */
    const loadProducts = () => {
        CrmProductApi.getAll({
            status: 1
        }).then((res) => {
            if (res) {
                setProducts(res)
            } else {
                setProducts([])
            }
        })
    }

    const loadCategories = async () => {
        let _lazy = {
            size: 9999,
            page: 0
        };
        await CrmCategoryApi.list(_lazy).then((data) => {
            if (!CommonFunction.isEmpty(data)) {
                setCategories(data.content);
            } else {
                setCategories([]);
            }
        });
    };
    const loadResource = (flg) => {
        let _lazy = {
            first: 0,
            rows: 999,
            page: 0,
            status: 1
        };
        CrmResourceApi.list(_lazy).then((data) => {
            if (!CommonFunction.isEmpty(data)) {
                if (flg) {
                    _.remove(data.content, { id: parseInt(window.app_context.user.portalSourceId) })
                }
                setResources(data.content);
            } else {
                setResources([]);
            }
        });
    };

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
     * create
     */
    const create = async (type) => {
        // prepare default data
        let _defaultData = _.cloneDeep(defaultData);
        _defaultData.type = type || _defaultData.type;
        if (customers.length) {
            _defaultData.accountId = customers[0].id
        }
        if (_defaultData.accountId) {
            await CrmAccountApi.getById(_defaultData.accountId).then((res) => {
                if (!CommonFunction.isEmpty(res)) {
                    setAccount(res)
                    _defaultData.accountPhone = res.accountPhone
                    _defaultData.accountEmail = res.accountEmail
                    _defaultData.accountTypeId = res.accountTypeId
                }
            })
        }
        if (roles.length) {
            _defaultData.roleId = roles[0].roleId
        }
        loadResource(true)
        setTicket(_defaultData);
        setShowHistory(false);
        setShowTimelineticket(false);
        setShowAnalysis(false);
        setShowSubtype(type === TicketEnumeration.type.ticket);
        setTicketDescription("");
        setTicketSolution("");
        setTicketImpacts("");
        setTicketCauses("");
        setTicketSymptoms("");
        setTicketControl("");
        setInvolves(prepareInvolve(_.cloneDeep(defaultInvolves)));
        setAnalysis(prepareAnalysis(_.cloneDeep(defaultAnalysis)));
        setErrors(_.cloneDeep(defaultErrors));
        setGroups([]);
        loadDataByProjectId();
        loadFields(type)
        loadUserFlowAccount()

        setTimeout(() => {
            refTicketDetail.current.create();
        }, 100);
    };

    /**
     * update
     * @param {*} id
     */
    const update = async (id) => {
        let _ticket = await TicketApi.get(id, "next-states");

        if (_ticket.task && _ticket.task.groupId && typeof _ticket.task.groupId === "object" && _ticket.task.groupId.hasOwnProperty("id")) {
            _ticket.task.groupId = parseInt(_ticket.task.groupId.id);
        }
        if (_ticket.task.accountId) {

            await CrmAccountApi.getById(_ticket.task.accountId).then((res) => {
                if (!CommonFunction.isEmpty(res)) {
                    setAccount(res)
                    _ticket.task.accountPhone = res.accountPhone
                    _ticket.task.accountEmail = res.accountEmail
                    _ticket.task.accountTypeId = res.accountTypeId
                }
            })
        }

        if (_ticket.task.roleId) {
            loadRoleUsers(_ticket.task.roleId)
        }

        let _groups = ProjectUtil.getGroupFromRoot(window.app_context.user, _ticket.task.groupId);
        if (_groups) {
            setGroups(_groups);
        } else {
            setGroups([]);
        }
        loadUserFlowAccount(ticket.accountId)
        loadDataByProjectId();
        loadResource(_ticket.task.resourceId != parseInt(window.app_context.user.portalSourceId))
        setShowSubtype(_ticket.task.type === TicketEnumeration.type.ticket);
        setShowHistory(true);
        setShowTimelineticket(false);
        setShowAnalysis(_ticket.task.type === TicketEnumeration.type.change || _ticket.task.type === TicketEnumeration.type.problem);
        setTicket(_ticket.task);
        setTicketDescription(_ticket.task.description || "");
        setTicketSolution(_ticket.task.solution || "");

        setInvolves(prepareInvolve(_ticket.involves));
        setAnalysis(prepareAnalysis(_ticket.analysis));
        setActivate(_ticket.activate);
        setRefTicket(_ticket.refticket);
        setErrors(_.cloneDeep(defaultErrors));

        // prepare fields
        let _fields = [];
        if (_ticket.fields) {
            _ticket.fields.forEach((_field) => {
                _fields.push({
                    ..._field.fieldConfig,
                    values: _field.values,
                    displayValues: _field.displayValues,
                });
            });
        }
        if (_fields && _fields.length > 0) {
            setFieldsConfig(_fields);
        } else {
            loadFields(_ticket.task.type)
        }

        setTimeout(() => {
            refTicketDetail.current.update(_ticket);
            refTicketDetail.current.show();
            // refListTaskRequest.current.reload();
            refTicketDetail.current.setLoading(false);
        }, 100);
        return _ticket
    };

    const deleteReference = (id) => {
        CommonFunction.showConfirm(t("confirm.delete.refence"), t("button.confirm"), () => {
            TicketApi.refticket.delete(id).then((data) => {
                if (data) {
                    let _refTicket = _.remove(refTicket, function (n) {
                        return n.id !== id;
                    });
                    setRefTicket(_refTicket);
                } else {
                    CommonFunction.toastError(t("common.save-un-success"));
                }
            });
        });
    };

    /**
     * prepare involve
     * @param {*} _involves
     * @returns
     */
    const prepareInvolve = (_involves) => {
        let _involvesObject = {};

        // default involve
        let _defaultInvolves = _.cloneDeep(defaultInvolves);
        defaultInvolves.forEach((_defaultInvolve) => {
            _involvesObject[`${_defaultInvolve.role}_${_defaultInvolve.involveType}`] = { ..._defaultInvolve };
        });

        // ticket involve
        if (_involves && _involves.length > 0) {
            _involves.forEach((involve) => {
                _involvesObject[`${involve.role}_${involve.involveType}`] = { ...involve };
            });
        }
        return _involvesObject;
    };
    /**
     * prepare analysis
     * @param {*} _analysis
     * @returns
     */
    const prepareAnalysis = (_analysis) => {
        let _analysisObject = {};

        // default analysis
        let _defaultAnalysis = _.cloneDeep(defaultAnalysis);
        defaultAnalysis.forEach((_defaultAna) => {
            _analysisObject[_defaultAna.type] = { ..._defaultAna };
        });

        //        setTicketDescription(res.task.description || "");
        // ticket analysis
        if (_analysis && _analysis.length > 0) {
            _analysis.forEach((ana) => {
                _analysisObject[ana.type] = { ...ana };
                if (typeof ana.content !== "undefined" && ana.type === "Impacts") {
                    setTicketImpacts(ana.content || "");
                }
                if (typeof ana.content !== "undefined" && ana.type === "Causes") {
                    setTicketCauses(ana.content || "");
                }
                if (typeof ana.content !== "undefined" && ana.type === "Symptoms") {
                    setTicketSymptoms(ana.content || "");
                }
                if (typeof ana.content !== "undefined" && ana.type === "Control") {
                    setTicketControl(ana.content || "");
                }
            });
        }

        return _analysisObject;
    };

    /**
     * delete news
     */
    const remove = (_news) => {
        CommonFunction.showConfirm(t("confirm.delete.message").format(_news.name || t("newsfeed.news").toLowerCase()), t("ticket.delete.title"), () => {
            // accept delete
            TicketApi.delete(_news).then((res) => {
                if (res) {
                    CommonFunction.toastSuccess(t("common.deleted"));
                }
            });
        });
    };

    /**
     * get current edit mode
     * @returns
     */
    const getEditMode = () => {
        return refTicketDetail.current ? refTicketDetail.current.getEditMode() : null;
    };

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _ticket = _.cloneDeep(ticket);
        switch (prop) {

            case "roleId":
                loadRoleUsers(val)
                let _involves = _.cloneDeep(involves);
                _involves['RESPONSIBLE_user'].involveIds = [];
                _involves['OBSERVER_user'].involveIds = [];
                _involves['ASSIGNEE_user'].involveIds = [];

                setInvolves(_involves);
                break

            case "accountId":
                let _account = null
                if (val) {
                    _account = await CrmAccountApi.getById(val).catch(() => { })
                }
                if (_account) {
                    _ticket[`accountPhone`] = _account.accountPhone;
                    _ticket[`accountEmail`] = _account.accountEmail;
                    _ticket[`accountTypeId`] = _account.accountTypeId;
                } else {
                    _ticket[`accountPhone`] = ``;
                    _ticket[`accountEmail`] = ``;
                    _ticket[`accountTypeId`] = null;
                }
                applyInvolvesChange("REQUESTER_user", null)
                loadUserFlowAccount(val)
                break
            default:
                break;
        }
        _ticket[prop] = val;
        if ((prop === "urgency" || prop === "impact") && _ticket.urgency && _ticket.impact) {
            let _severity = ProjectUtil.getSeverity(_ticket.urgency, _ticket.impact, severityMatrix);
            if (_severity && _severity.severity) {
                _ticket.priority = _severity.severity.code || "";
            }
        }
        validateTicket([prop], _ticket);
        setTicket(_ticket);
    };

    /**
     * convert time to days minute secondss
     */

    const minuetesToDhm = (minutes) => {
        minutes = Number(minutes);
        let d = Math.floor(minutes / (60 * 24));
        let h = Math.floor((minutes % (60 * 24)) / 60);
        let m = Math.floor((minutes % 60) / 60);

        let dDisplay = d > 0 ? d + (d == 1 ? " " + t("ticket.sla.day") + " " : " " + t("ticket.sla.days") + " ") : "";
        let hDisplay = h > 0 ? h + (h == 1 ? " " + t("ticket.sla.hour") + " " : " " + t("ticket.sla.hours") + " ") : "";
        let mDisplay = m > 0 ? m + (m == 1 ? " " + t("ticket.sla.minute") + " " : " " + t("ticket.sla.minutes") + " ") : "";
        return dDisplay + hDisplay + mDisplay;
    };

    const getUser = (user) => {
        let temp = user.split(","),
            userOject = {};
        for (let i = 0; i < temp.length; i++) {
            temp[i].split("=");
            userOject[temp[i].split("=")[0].replace(" ", "")] = temp[i].split("=")[1].replace("}", "");
        }

        return userOject;
    };

    /**
     * apply involve changes
     * @param {string} prop
     * @param {*} val
     */
    const applyInvolvesChange = (involveType, val) => {
        let _involves = _.cloneDeep(involves);
        _involves[involveType].involveIds = val;
        validateInvolves([involveType], _involves);
        setInvolves(_involves);
    };

    /**
     * validate involves
     * @param {*} involveTypes
     * @param {*} _involves
     * @returns
     */
    const validateInvolves = (involveTypes, _involves) => {
        _involves = _involves || _.cloneDeep(involves);
        let result = { ...errors },
            isValid = true;

        // validate all props
        if (involveTypes.length === 0) {
            for (const property in result.involves) {
                involveTypes.push(property);
            }
        }

        // validate props
        involveTypes.forEach((involveType) => {
            switch (involveType) {
                case "REQUESTER_user":
                    result.involves.REQUESTER_user = _involves.REQUESTER_user?.involveIds?.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set is valid
        let allErrors = [];
        for (const property in result.involves) {
            if (!CommonFunction.isEmpty(result.involves[property])) {
                isValid = false;
                allErrors.push(result.involves[property]);
            }
        }

        // set state
        setErrors(result);

        return [isValid, _.uniq(allErrors)];
    };

    /**
     * validate ticket
     * @param {*} props
     * @param {*} _ticket
     * @returns
     */
    const validateTicket = async (props, _ticket) => {
        _ticket = _ticket || _.cloneDeep(ticket);
        let result = { ...errors },
            isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach((prop) => {
            switch (prop) {
                // case "accountId":
                //     result.accountId = _ticket.accountId ? null : `${t("ticket.account")} ${t("message.cant-be-empty")}`;
                case "name":
                    result.name = _ticket.name ? null : `${t("common.name")} ${t("message.cant-be-empty")}`;
                    break;
                case "email":
                    result.email = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/.test(_ticket.email) ? null : t("user.validate.email-wrong-pattern");
                    break;
                case "phone":
                    result.phone = /^[0-9\b]+$/.test(_ticket.phone) ? null : t("ticket.validate.phone-wrong-pattern");
                    break;
                // case "projectId":
                //     result.projectId = _ticket.projectId ? null : t("ticket.project-require");
                //     break;
                case "priority":
                    result.priority = _ticket.priority ? null : `${t("ticket.priority")} ${t("message.cant-be-empty")}`;
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let allErrors = [];
        for (const property in result) {
            if (!CommonFunction.isEmpty(result[property])) {
                if (property !== "involves") {
                    isValid = false;
                    allErrors.push(result[property]);
                }
            }
        }

        return [isValid, _.uniq(allErrors)];
    };

    /**
     * submit
     */
    const submit = async (callback, showAfterSubmit) => {
        setBtnLoading(true);

        // validate ticket
        let [isTicketValid, ticketErrors] = await validateTicket([]);
        let [isInvolveValid, involveErrors] = validateInvolves([]);

        if (!isInvolveValid) {
            isTicketValid = false;
            ticketErrors = ticketErrors.concat(involveErrors);
        }

        // custom fields
        let _fields = refDynamicForm.current.get();
        if (!_fields.valid) {
            isTicketValid = false;
            ticketErrors = ticketErrors.concat(_fields.errors);
        }

        // get from task base detail
        let _taskbase = await refTicketDetail.current.get();

        if (isTicketValid && _taskbase.isValid) {
            refTicketDetail.current.setLoading(true);

            let editMode = getEditMode();

            // combine task
            let _ticket = _.cloneDeep(_taskbase.task);
            _ticket.task = Object.assign(_ticket.task, _.cloneDeep(ticket));

            // request by
            _ticket.task.requestedBy = window.app_context.user.id;

            // description
            _ticket.task.description = ticketDescription;
            _ticket.task.solution = ticketSolution;

            // involves
            _ticket.involves = _.cloneDeep(defaultInvolves);
            _ticket.involves.forEach((_involve) => {
                if (involves[`${_involve.role}_${_involve.involveType}`] && involves[`${_involve.role}_${_involve.involveType}`].involveIds.length > 0) {
                    _involve.involveIds = involves[`${_involve.role}_${_involve.involveType}`].involveIds.map((m) => m.id);
                } else {
                    _involve.involveIds = []
                }
            });

            _ticket.analysis = _.cloneDeep(defaultAnalysis);
            _ticket.analysis.forEach((_analysis) => {
                if (analysis[_analysis.type] && _analysis.type === "Impacts") {
                    _analysis.content = ticketImpacts;
                }
                if (analysis[_analysis.type] && _analysis.type === "Causes") {
                    _analysis.content = ticketCauses;
                }
                if (analysis[_analysis.type] && _analysis.type === "Symptoms") {
                    _analysis.content = ticketSymptoms;
                }
                if (analysis[_analysis.type] && _analysis.type === "Control") {
                    _analysis.content = ticketControl;
                }
            });

            // other infos
            ["companyId", "responsibleId", "groupId"].forEach((editProps) => {
                if (_ticket.task[editProps] && typeof _ticket.task[editProps] === "object" && _ticket.task[editProps].id) {
                    if (editProps === "responsibleId") {
                        _ticket.involves.map((m) => {
                            if (m.role === "RESPONSIBLE" && m.involveIds.length > 0) {
                                _ticket.task[editProps] = m.involveIds[0];
                            } else {
                                _ticket.task[editProps] = "";
                            }
                        });
                    } else {
                        _ticket.task[editProps] = _ticket.task[editProps].id;
                    }
                }
            });

            // delete unneccesary props
            ["createBy", "updateBy"].forEach((delProps) => {
                if (_ticket.task.hasOwnProperty(delProps)) {
                    delete _ticket.task[delProps];
                }
            });

            // apply custom fields data
            _ticket.fields = _fields.data;

            // submit
            let res = null;
            switch (editMode) {
                case Enumeration.crud.create:
                    // create
                    res = await TicketApi.create(_ticket);
                    break;
                case Enumeration.crud.update:
                    // update
                    res = await TicketApi.update(_ticket);
                    break;
                default:
                    break;
            }

            // submit modules
            let submitModulesResult = true;
            if (res) {
                submitModulesResult = await refTicketDetail.current.submitModules(res);
            }
            if (res && submitModulesResult) {
                if (callback && typeof callback === "function") {
                    res = await callback(res);
                }

                // update current task
                if (showAfterSubmit) {
                    const resTicket = await update(res.task.id);
                    if (afterSubmit && typeof afterSubmit === "function") {
                        afterSubmit(editMode, resTicket);
                    }
                } else {
                    cancel();
                    // call event
                    if (afterSubmit && typeof afterSubmit === "function") {
                        afterSubmit(editMode, res);
                    }
                }
                CommonFunction.toastSuccess(t("common.save-success"));
            }
            setBtnLoading(false);
        } else {
            ticketErrors = (ticketErrors || []).concat(_taskbase.errors || []);
            ticketErrors = _.uniq(ticketErrors);
            CommonFunction.toastWarning(ticketErrors);
            setBtnLoading(false);
        }
    };

    const afterSubmitReference = (data) => {
        if (data) {
            let _ticket = _.cloneDeep(ticket);
            update(_ticket.id);
        }
    };

    /**
     * render errors
     * @param {*} prop
     */
    const renderErrors = (prop) => {
        if (errors[prop]) {
            return <small className="p-invalid">{errors[prop]}</small>;
        } else {
            return <></>;
        }
    };

    /**
     * render involve errors
     * @param {*} prop
     */
    const renderInvolveErrors = (prop) => {
        if (errors.involves[prop]) {
            return <small className="p-invalid">{errors.involves[prop]}</small>;
        } else {
            return <></>;
        }
    };

    const handleChangeAccount = (e) => {
        applyChange("accountId", e.value)
    }

    const handleChangeAccountEmail = (e) => {
        applyChange("accountEmail", e.target.value)
    }

    const handleChangeAccountPhone = (e) => {
        applyChange("accountPhone", e.target.value)
    }

    const handleChangeProduct = (e) => {
        applyChange("productId", e.value)
    }

    /**
     * render news info
     * @returns
     */
    const renderTicketInfo = () => {
        let editMode = getEditMode();
        return (
            <>
                {editMode !== Enumeration.crud.create && (
                    <div className="mb-1">
                        <span>{t("task.state")} </span>
                        <Task_State style={{ width: "110px" }} state={ticket.state} className="border-all">
                            {t(`ticket.state.ticket.${ticket.state}`)}
                        </Task_State>
                    </div>
                )}
                <XLayout_Form>
                    <div className="col-3">
                        <span className="p-float-label">
                            <Dropdown
                                value={ticket.accountId}
                                options={customers.length ? customers : accounts}
                                optionLabel="accountName"
                                optionValue="id"
                                filter
                                showClear
                                filterBy="accountName"
                                onChange={handleChangeAccount}
                            />
                            <label>{t("ticket.account")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <Dropdown
                                options={accountTypes}
                                optionLabel="accountTypeName"
                                optionValue="id"
                                filter
                                filterBy="accountTypeName"
                                value={ticket.accountTypeId}
                                disabled={true}
                            />
                            <label>{t("ticket.account-type")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label ">
                            <InputText
                                value={ticket.accountEmail}
                                onChange={handleChangeAccountEmail}
                            />
                            <label>{t("ticket.account-email")}</label>
                            {renderErrors("accountEmail")}
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label ">
                            <InputText
                                value={ticket.accountPhone}
                                onChange={handleChangeAccountPhone}
                            />
                            <label>{t("ticket.account-phone")}</label>
                            {renderErrors("accountPhone")}
                        </span>
                    </div>

                    {/* <div className="col-3">
                        <span className="p-float-label">
                            <Dropdown value={ticket.rootPhaseId} options={rootPhases} optionLabel="name" optionValue="rootId" filter showClear filterBy="name" onChange={(e) => applyChange("rootPhaseId", e.value)}></Dropdown>
                            <label>{t("phase")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <Dropdown value={ticket.rootWorkPackageId} options={rootWorkpackages} optionLabel="name" optionValue="rootId" filter showClear filterBy="name" onChange={(e) => applyChange("rootWorkPackageId", e.value)}></Dropdown>
                            <label>{t("workpackage")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <Dropdown value={ticket.locationId || ""} options={locations} optionLabel="code" optionValue="id" disabled={!ticket.projectId} filter showClear filterBy="name" onChange={(e) => applyChange("locationId", e.value)}></Dropdown>
                            <label>{t("ticket.location")}</label>
                        </span>
                    </div> */}
                    <div className="col-3">
                        <span className="p-float-label">
                            <PriorityDropdown id="urgency" options={colorMatrix} onChange={(e) => applyChange("urgency", e.value)} value={ticket.urgency}></PriorityDropdown>
                            <label>{t("ticket.urgency")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <PriorityDropdown id="impact" options={colorMatrix} onChange={(e) => applyChange("impact", e.value)} value={ticket.impact}></PriorityDropdown>
                            <label>{t("ticket.impact")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <PriorityDropdown id="priority" options={colorMatrix} onChange={(e) => applyChange("priority", e.value)} value={ticket.priority}></PriorityDropdown>
                            <label className="require">{t("ticket.priority")}</label>
                        </span>
                    </div>

                    {showSubtype && (
                        <>
                            <div className="col-3">
                                <span className="p-float-label">
                                    <XDropdownTree value={ticket.subtype === undefined ? 1 : ticket.subtype} options={TicketEnumeration.dropdown.subtype.options} optionLabel="name" optionValue="id" filter showClear filterBy="name" onChange={(e) => applyChange("subtype", e.value)}></XDropdownTree>
                                    <label>{t("ticket.subtype")}</label>
                                </span>
                            </div>
                        </>
                    )}
                    <div className="col-3">
                        <span className="p-float-label">
                            <XDropdownTree
                                value={ticket.resourceId}
                                options={resources}
                                optionLabel="name"
                                optionValue="id"
                                filter
                                showClear
                                filterBy="name"
                                onChange={(e) => applyChange("resourceId", e.value)}
                                disabled={ticket.resourceId == parseInt(window.app_context.user.portalSourceId)}
                            />
                            <label>{t("ticket.resource")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label">
                            <XDropdownTree value={ticket.categoryId} options={categories} optionLabel="name" optionValue="id" filter showClear filterBy="name" onChange={(e) => applyChange("categoryId", e.value)}></XDropdownTree>
                            <label>{t("ticket.category")}</label>
                        </span>
                    </div>

                    <div className="col-3">
                        <span className="p-float-label">

                            <Dropdown
                                value={ticket.productId}
                                options={products}
                                optionLabel="productName"
                                optionValue="id"
                                filter
                                showClear
                                filterBy="productName"
                                onChange={handleChangeProduct}
                            />
                            <label>{t("ticket.product")}</label>
                        </span>
                    </div>
                    <div className="col-3">
                        <span className="p-float-label ">
                            <InputText
                                value={ticket.company}
                                disabled
                            />
                            <label>{t("ticket.account-company")}</label>
                        </span>
                    </div>
                </XLayout_Form>
                <XLayout_Form className="col-12">
                    <FieldDynamicForm className="col-12" ref={refDynamicForm} fieldsConfig={fieldsConfig}></FieldDynamicForm>
                </XLayout_Form>
                <XLayout_Form>
                    <div className="col-12">
                        <span className="p-float-label ">
                            <InputText value={ticket.name} onChange={(e) => applyChange("name", e.target.value)} />
                            <label className="require">{t("common.name")}</label>
                            {renderErrors("name")}
                        </span>
                    </div>

                    <div className="col-12">
                        <XEditor
                            ref={refDescription}
                            value={ticketDescription}
                            onBlur={(newContent) => setTicketDescription(newContent)} // preferred to use only this option to update the content for performance reasons
                            config={{
                                placeholder: t("ticket.content"),
                                buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                useSearch: false,
                                spellcheck: false,
                                showCharsCounter: false,
                                showWordsCounter: false,
                                showXPathInStatusbar: false,
                                askBeforePasteHTML: false,
                                askBeforePasteFromWord: false,
                                height: "auto",
                                minHeight: 100,
                                language: CommonFunction.getCurrentLanguage(),
                            }}
                        ></XEditor>
                    </div>

                    <div className="col-12">
                        <XEditor
                            ref={refSolution}
                            value={ticketSolution}
                            onBlur={(newContent) => setTicketSolution(newContent)} // preferred to use only this option to update the content for performance reasons
                            config={{
                                placeholder: t("ticket.solution"),
                                buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                useSearch: false,
                                spellcheck: false,
                                showCharsCounter: false,
                                showWordsCounter: false,
                                showXPathInStatusbar: false,
                                askBeforePasteHTML: false,
                                askBeforePasteFromWord: false,
                                height: "auto",
                                minHeight: 100,
                                language: CommonFunction.getCurrentLanguage(),
                            }}
                        ></XEditor>
                    </div>
                </XLayout_Form>
            </>
        );
    };
    /**
     * render ticket date
     * @returns
     */
    const renderTicketDate = () => {
        let editMode = getEditMode();
        return (
            <>
                <XLayout_Form>
                    {editMode !== Enumeration.crud.create && (
                        <>
                            <div className="col-2 avatar-inline">
                                <XCalendar showTime label={t("common.createDate")} value={ticket.createDate} disabled />
                            </div>
                            <div className="col-2 avatar-inline">
                                <XCalendar showTime label={t("common.resolvedDate")} value={ticket.resolvedDate} disabled />
                            </div>
                            <div className="col-2 avatar-inline">
                                <XCalendar showTime label={t("common.closedDate")} value={ticket.closedOn} disabled />
                            </div>
                            <div className="col-2">
                                <XCalendar showTime label={t("common.responsedeadline")} value={ticket.responseDeadline} onChange={(value) => applyChange("responseDeadline", value)} />
                            </div>
                            <div className="col-1 percentage-ticket">
                                <div style={{ position: "absolute", fontSize: "11px" }}>{percentage(ticket.createDate, ticket.responseDeadline) && percentage(ticket.createDate, ticket.responseDeadline).percent}%</div>
                                <div
                                    className="center"
                                    style={{
                                        backgroundColor: percentage(ticket.createDate, ticket.responseDeadline) && percentage(ticket.createDate, ticket.responseDeadline).color,
                                        width: `${percentage(ticket.createDate, ticket.responseDeadline) && percentage(ticket.createDate, ticket.responseDeadline).percent}%`,
                                        height: "12px",
                                    }}
                                ></div>
                            </div>
                            <div className="col-2">
                                <XCalendar showTime label={t("common.resolvedeadline")} value={ticket.deadline} onChange={(value) => applyChange("deadline", value)} />
                            </div>
                            <div className="col-1 percentage-ticket">
                                <div style={{ position: "absolute", fontSize: "11px" }}>{percentage(ticket.createDate, ticket.deadline) && percentage(ticket.createDate, ticket.deadline).percent}%</div>
                                <div
                                    className="center"
                                    style={{
                                        backgroundColor: percentage(ticket.createDate, ticket.deadline) && percentage(ticket.createDate, ticket.deadline).color,
                                        width: `${percentage(ticket.createDate, ticket.deadline) && percentage(ticket.createDate, ticket.deadline).percent}%`,
                                        height: "12px",
                                    }}
                                ></div>
                            </div>
                        </>
                    )}
                </XLayout_Form>
            </>
        );
    };

    const itemTemplate = (item) => {
        return <XAvatar
            name={item.fullName} avatar={item.avatar}
            label={() => <>
                <div>{item.fullName}</div>
                <div>{item.username}</div>
            </>}
            size="20px"
        />
    }
    /**
     * render news info
     * @returns
     */
    const renderTicketUser = () => {
        let editMode = getEditMode();
        return (
            <>
                <div className="p-fluid fluid formgrid grid">
                    <div className="col-4">
                        <span className="p-float-label">
                            <Dropdown
                                value={ticket.roleId}
                                options={roles}
                                optionLabel="name"
                                optionValue="roleId"
                                filter
                                showClear
                                filterBy="name"
                                onChange={(e) => applyChange("roleId", e.value)}
                            />
                            <label>{t("ticket.role")}</label>
                        </span>
                    </div>
                    <div className="col-8"></div>
                    <div className="col-4">
                        <span className="p-float-label">
                            <CrmUserAutoComplete
                                value={involves && involves.REQUESTER_user && involves.REQUESTER_user?.involveIds?.length ? involves.REQUESTER_user.involveIds : null}
                                users={usersFlowAccount}
                                onChange={(e) => applyInvolvesChange("REQUESTER_user", e.value)}
                            // disabled
                            />
                            <label>{t("ticket.requester")}</label>
                            {renderInvolveErrors("REQUESTER_user")}
                        </span>
                    </div>
                    <div className="col-4">
                        <span className="p-float-label ">
                            <InputText value={ticket.email} onChange={(e) => applyChange("email", e.target.value)} />
                            <label>{t("common.email")}</label>
                        </span>
                    </div>
                    <div className="col-4">
                        <span className="p-float-label ">
                            <InputText value={ticket.phone} onChange={(e) => applyChange("phone", e.target.value)} pattern="[0-9]*" />
                            <label>{t("common.phone")}</label>
                        </span>
                    </div>

                    <div className="col-4">
                        <span className="p-float-label">
                            <CrmUserAutoComplete
                                value={involves && involves.RESPONSIBLE_user && involves.RESPONSIBLE_user.involveIds && involves.RESPONSIBLE_user.involveIds.length > 0 ? involves.RESPONSIBLE_user.involveIds : null}
                                users={groupUsers}
                                onChange={(e) => applyInvolvesChange("RESPONSIBLE_user", e.value)}
                            />
                            <label>{t("ticket.responsible")}</label>
                        </span>
                    </div>
                    <div className="col-4">
                        <span className="p-float-label">
                            <CrmUserAutoComplete
                                multiple
                                itemTemplate={itemTemplate}
                                value={involves && involves.OBSERVER_user && involves.OBSERVER_user.involveIds.length ? involves.OBSERVER_user.involveIds : null}
                                users={groupUsers}
                                onChange={(e) => applyInvolvesChange("OBSERVER_user", e.value)}
                            />
                            <label>{t("task.observerUsers")}</label>
                        </span>
                    </div>
                    <div className="col-4">
                        <span className="p-float-label">
                            <CrmUserAutoComplete
                                multiple
                                itemTemplate={itemTemplate}
                                value={involves && involves.ASSIGNEE_user && involves.ASSIGNEE_user.involveIds.length ? involves.ASSIGNEE_user.involveIds : null}
                                users={roleUsers}
                                onChange={(e) => applyInvolvesChange("ASSIGNEE_user", e.value)}
                            />
                            <label>{t("ticket.assign")}</label>
                        </span>
                    </div>
                    {/* <div className="col-12">
                        <span className="p-float-label">
                            <GroupAutoComplete
                                multiple
                                value={involves && involves.ASSIGNEE_group ? involves.ASSIGNEE_group.involveIds : []}
                                excludeUserIds={involves && involves.ASSIGNEE_group ? involves.ASSIGNEE_group.involveIds.map((m) => m.id) : []}
                                onChange={(value) => applyInvolvesChange("ASSIGNEE_group", value)}
                                groupType={"project.member"}
                                rootGroupId={rootGroupId}
                            />
                            <label>{t("ticket.assigngroup")}</label>
                        </span>
                    </div> */}
                </div>
            </>
        );
    };

    /**
     * render ticket analysis
     */
    const renderTicketAnalysis = () => {
        let editMode = getEditMode();
        if (editMode !== Enumeration.crud.create) {
            return (
                <XLayout_Form>
                    {(ticket.type === TicketEnumeration.type.problem || ticket.type === TicketEnumeration.type.change) && (
                        <div className="col-12">
                            <XEditor
                                ref={refImpacts}
                                value={ticketImpacts}
                                onBlur={(newContent) => setTicketImpacts(newContent)}
                                config={{
                                    placeholder: t("content.impacts"),
                                    buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                    useSearch: false,
                                    spellcheck: false,
                                    showCharsCounter: false,
                                    showWordsCounter: false,
                                    showXPathInStatusbar: false,
                                    height: "auto",
                                    minHeight: 100,
                                    language: CommonFunction.getCurrentLanguage(),
                                }}
                            ></XEditor>
                        </div>
                    )}
                    {ticket.type === TicketEnumeration.type.problem && (
                        <div className="col-12">
                            <XEditor
                                ref={refCauses}
                                value={ticketCauses}
                                onBlur={(newContent) => setTicketCauses(newContent)}
                                config={{
                                    placeholder: t("content.causes"),
                                    buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                    useSearch: false,
                                    spellcheck: false,
                                    showCharsCounter: false,
                                    showWordsCounter: false,
                                    showXPathInStatusbar: false,
                                    height: "auto",
                                    minHeight: 100,
                                    language: CommonFunction.getCurrentLanguage(),
                                }}
                            ></XEditor>
                        </div>
                    )}
                    {ticket.type === TicketEnumeration.type.problem && (
                        <div className="col-12">
                            <XEditor
                                ref={refSymptoms}
                                value={ticketSymptoms}
                                onBlur={(newContent) => setTicketSymptoms(newContent)}
                                config={{
                                    placeholder: t("content.symptoms"),
                                    buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                    useSearch: false,
                                    spellcheck: false,
                                    showCharsCounter: false,
                                    showWordsCounter: false,
                                    showXPathInStatusbar: false,
                                    height: "auto",
                                    minHeight: 100,
                                    language: CommonFunction.getCurrentLanguage(),
                                }}
                            ></XEditor>
                        </div>
                    )}
                    {ticket.type === TicketEnumeration.type.change && (
                        <div className="col-12">
                            <XEditor
                                ref={refControl}
                                value={ticketControl}
                                onBlur={(newContent) => setTicketControl(newContent)}
                                config={{
                                    placeholder: t("content.control"),
                                    buttons: ["bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript", "|", "ul", "ol", "|", "indent", "outdent", "|", "align", "font", "fontsize", "paragraph", "|", "image", "table", "link", "|"],
                                    useSearch: false,
                                    spellcheck: false,
                                    showCharsCounter: false,
                                    showWordsCounter: false,
                                    showXPathInStatusbar: false,
                                    height: "auto",
                                    minHeight: 100,
                                    language: CommonFunction.getCurrentLanguage(),
                                }}
                            ></XEditor>
                        </div>
                    )}
                </XLayout_Form>
            );
        }
    };
    // render list task ticket
    const renderListTask = () => {
        let editMode = getEditMode();
        if (editMode !== Enumeration.crud.create) {
            return (
                <>
                    {ticket && ticket.id && (
                        <XLayout_Form>
                            <Ticket_ListTask
                                ref={refListTaskRequest}
                                filterByObj={{
                                    listBy: "ROOT",
                                    rootKey: ticket.id,
                                    rootType: ticket.type,
                                }}
                                projectId={ticket.projectId}
                                categories={categories}
                                afterSubmit={afterSubmit}
                                resources={resources}
                                groups={groups}
                                parent={ticket}
                                rootGroupId={rootGroupId}
                            />
                        </XLayout_Form>
                    )}
                </>
            );
        }
    };

    const validateWhenChangeState = (state) => {
        if (state === "SOLVED" || state === "COMPLETED") {
            if (ticketSolution) {
                return true;
            }
            return false;
        } else {
            return true;
        }
    };
    /**
     * change state
     * @param {*} state
     */
    const changeState = (state) => {
        //valid when state SOLVED or COMPLETED
        let valid = validateWhenChangeState(state, ticket);
        // submit before change state
        if (valid) {
            submit(async (_ticket) => {
                // after submit success, call change state
                let res = await TicketApi.changeState(_ticket.task.id, state);
                refChangeStageMenu.current.hide();
                _ticket.task.state = state;
                return _ticket;
            }, true);
        } else {
            CommonFunction.toastError(`${t("ticket.field.solution")} ${t("message.cant-be-empty")}`);
        }
    };

    const percentage = (createDate, deadLine) => {
        if (deadLine) {
            if (new Date(createDate) > new Date(deadLine)) {
                return { percent: "100", color: "#e57373" };
            }
            let totalTime = Date.parse(deadLine) - Date.parse(createDate);
            let currentTime = Date.parse(new Date()) - Date.parse(createDate);
            let percent = Math.round((currentTime * 100) / totalTime);

            if (percent > 90) {
                if (percent > 100) {
                    return { percent: "100", color: "#e57373" };
                }
                return { percent: percent, color: "#e57373" };
            } else if (percent <= 20) {
                if (percent <= 0) {
                    return { percent: "0", color: "#4caf50" };
                } else {
                    return { percent: percent, color: "#4caf50" };
                }
            } else {
                return { percent: percent, color: "#ffb74d" };
            }
        }
    };
    /**
     * render toolbar
     */
    const renderToolbarLeft = () => {
        if (ticket.state) {
            // when creating news
            return (
                <>
                    <Button label={`${t("task.change.state")} [${ticket.code}]`} icon="bx bx-transfer-alt" onClick={(e) => refChangeStageMenu.current.toggle(e)} />
                </>
            );
        }
    };
    const renderToolbarRight = () => {
        let editMode = getEditMode();
        return (
            <>
                {editMode !== Enumeration.crud.create && <Button label={t("ticket.reference.create")} icon="bx bx-transfer-alt" onClick={(e) => referenceTicket.current.createReference(ticket)} />}
                <Button icon="bx bxs-save create" loading={btnLoading} label={t('common.save')} onClick={() => submit(false, true)} />
                <Button icon="bx bxs-save create" loading={btnLoading} label={t('common.save-close')} onClick={() => submit(false, false)} />
            </>
        );
    };
    const renderTicketRef = () => {
        let editMode = getEditMode();
        // let ticket = _.clone()

        if (editMode !== Enumeration.crud.create) {
            return (
                <>
                    {refTicket && refTicket.length > 0 && (
                        <div className="position-relative mt-2">
                            <DataTable
                                value={refTicket}
                                dataKey="id"
                                // className="p-datatable-gridlines"
                                showGridlines
                                emptyMessage={t("common.no-record-found")}
                                // style={{ width: 'calc(100vw - 345px)' }}
                                scrollable
                                stripedRows
                                scrollHeight="calc(100vh - 350px)"
                                lazy
                                resizableColumns
                            >
                                <Column
                                    header={t("reference.ticketId")}
                                    headerStyle={{ width: "100px", textAlign: "center" }}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                    body={(rowData) => {
                                        if (rowData.ticket.id == ticket.id) {
                                            return rowData.root.code ? rowData.root.code : rowData.root.id;
                                        } else {
                                            return rowData.ticket.code ? rowData.ticket.code : rowData.ticket.id;
                                        }
                                    }}
                                ></Column>
                                <Column
                                    header={t("reference.form")}
                                    headerStyle={{ width: "200px", textAlign: "center" }}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                    body={(rowData) => {
                                        if (rowData.ticket.id == ticket.id) {
                                            return rowData.root.name;
                                        } else {
                                            return rowData.ticket.name;
                                        }
                                    }}
                                ></Column>
                                <Column
                                    header={t("refType.reference")}
                                    headerStyle={{ width: "80px", textAlign: "center" }}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                    body={(rowData) => {
                                        if (rowData.refType === "child") {
                                            return <>{t("ticket-ref-child")}</>;
                                        } else if (rowData.refType === "cancel") {
                                            return <>{t("ticket-ref-cancel")}</>;
                                        } else {
                                            return <>{t("ticket-ref-duplicate")}</>;
                                        }
                                    }}
                                ></Column>
                                <Column
                                    header={t("action.description")}
                                    headerStyle={{ width: "100px", textAlign: "center" }}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                    body={(rowData) => {
                                        return <>{rowData.description && rowData.description.replace(/<[^>]+>/g, "")}</>;
                                    }}
                                ></Column>
                                <Column
                                    header={t("ticket.action")}
                                    style={{ width: "30px" }}
                                    body={(rowData) => {
                                        return (
                                            <>
                                                <div className="grid actions justify-content-center">
                                                    {ticket.state && ticket.state !== "COMPLETED" && (
                                                        <Button
                                                            icon="bx bx-x"
                                                            className="p-button-text text-muted text-red-10 p-0"
                                                            // tooltip={t(`project.setting.working.${String(type).toLowerCase()}.delete`)}
                                                            tooltipOptions={{ position: "top" }}
                                                            onClick={() => deleteReference(rowData.id)}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        );
                                    }}
                                ></Column>
                            </DataTable>
                        </div>
                    )}
                </>
            );
        }
    };

    /**
     * render Timelineticket
     */
    const renderTimelineticket = () => {
        let editMode = getEditMode();
        if (editMode !== Enumeration.crud.create) {
            return (
                <React.Fragment>
                    {!showTimelineticket && (
                        <div className="link-button" onClick={() => setShowTimelineticket(true)}>
                            <span className="text-grey-9">{t("ticket.timeline")}</span>
                        </div>
                    )}

                    {showTimelineticket && (
                        <div className="history-item">
                            <div className="event-timeline-dot">
                                <i className="bx bx-right-arrow-circle"></i>
                            </div>

                            <div className="history-detail ">
                                <div className=" history-detail-header p-fluid fluid  formgrid grid p-0">
                                    <div className="col-2 history-detail-item">{t("entry.date")}</div>
                                    <div className="col-2 history-detail-item">User</div>
                                    <div className="col-2 history-detail-item">{t("ticket.state.old")}</div>
                                    <div className="col-2 history-detail-item">{t("ticket.state.new")}</div>
                                    <div className="col-4 history-detail-item">{t("ticket.delay")}</div>
                                </div>

                                {activate.map((active, index) => (
                                    <div key={index} className="p-fluid fluid  formgrid grid p-0">
                                        <div className="col-2 history-detail-item">{CommonFunction.formatDateTime(active.createDate)}</div>
                                        <div className="col-2 history-detail-item" style={{ display: "grid" }}>
                                            <XAvatar src={CommonFunction.getImageUrl(getUser(active.createBy).avatar, getUser(active.createBy).fullName)} tooltip={getUser(active.createBy).fullName} label={() => getUser(active.createBy).fullName}></XAvatar>
                                        </div>
                                        <div className="col-2 history-detail-item">{active.prevState ? t(`ticket.state.${ticket.type.toLowerCase()}.${active.prevState}`) : ""}</div>
                                        <div className="col-2 history-detail-item">{t(`ticket.state.${ticket.type.toLowerCase()}.${active.currState}`)}</div>
                                        <div className="col-4 history-detail-item">
                                            <span>{getUser(active.createBy).dtoDuration ? minuetesToDhm(active.slaDuration) + " - " : minuetesToDhm(active.slaDuration)}</span>
                                            <span style={{ color: "red" }}>{getUser(active.createBy).dtoDuration ? t(`ticket.overdue`) + ": " + minuetesToDhm(getUser(active.createBy).dtoDuration) : ""}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </React.Fragment>
            );
        }
    };
    const cancel = () => {
        refTicketDetail.current.hide();
    };
    return (
        <>
            <TaskBaseDetail
                dialog={showDialog}
                ref={refTicketDetail}
                refType={"ticket"}
                refTypeInternal={"ticket-internal"}
                application="crm-service"
                entityName={t(`ticket.${ticket.type.toLowerCase()}`).toLowerCase()}
                toolbar={{ left: renderToolbarLeft, right: renderToolbarRight }}
                modules={["ticket_info", "ticket_user", "ticket_date", "ticket_ref", "attachment", "ticket_list_task", "sub_task", "comment", "internal_comment", "ticket_analysis", "ticket_timeline", "ticket_history"]}
                modulesDefinition={{
                    ticket_info: {
                        title: t(`ticket.${ticket.type.toLowerCase()}`) + `${mode !== modeEnum.create ? " : " + (ticket.code ? ticket.code : ticket.id) : ""}`,
                        icon: "bx bx-receipt",
                        renderer: renderTicketInfo,
                    },
                    ticket_user: {
                        title: t(`task.nav.join`),
                        icon: "bx bx-user-circle",
                        renderer: renderTicketUser,
                    },
                    ticket_ref: {
                        title: t(`ticket.reference`),
                        icon: "bx bx-link",
                        renderer: renderTicketRef,
                    },
                    ticket_date: {
                        title: t(`ticket.date`),
                        icon: "bx bx-time",
                        renderer: renderTicketDate,
                    },
                    ticket_analysis: {
                        title: t(`ticket.analysis`),
                        icon: "bx bx-analyse",
                        renderer: renderTicketAnalysis,
                        visible: showAnalysis,
                    },
                    // ticket_list_task: {
                    //     title: t(`ticket.task`),
                    //     icon: "bx bxs-folder-open",
                    //     renderer: renderListTask,
                    //     // visible: showAnalysis
                    // },
                    ticket_timeline: {
                        title: t("ticket.history"),
                        icon: "bx bx-history",
                        renderer: renderTimelineticket,
                    },
                    ticket_history: {
                        title: t("task.history"),
                        icon: "bx bx-history",
                        renderer: () => <Ticket_History taskId={ticket.id} getHistoriesFn={TicketApi.getHistories} />,
                        visible: showHistory,
                    },
                }}
            ></TaskBaseDetail>

            <OverlayPanel ref={refChangeStageMenu} className="x-menu">
                {ticket &&
                    ticket["next-states"] &&
                    ticket["next-states"].map((s, index) => (
                        <div key={index} className="x-menu-button" onClick={() => changeState(s)}>
                            <i class="bx bx-fast-forward"></i>
                            <span>{t(`ticket.state.ticket.${s}`)}</span>
                        </div>
                    ))}
            </OverlayPanel>
            <TicketReferenceDetail ref={referenceTicket} afterSubmitReference={afterSubmitReference} />
        </>
    );
}

TicketDetail = forwardRef(TicketDetail);

export default TicketDetail;

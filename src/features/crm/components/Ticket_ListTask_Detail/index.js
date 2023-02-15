import React, {forwardRef, useContext, useImperativeHandle, useRef, useState} from "react";

import _ from "lodash";
import TaskBaseDetail from "components/task/TaskBaseDetail";
import Enumeration from '@lib/enum';
import CommonFunction from '@lib/common';
import {InputText} from "primereact/inputtext";
import { UserAutoComplete } from '@ui-lib/x-autocomplete/UserAutoComplete';
import classNames from "classnames";
import {GroupAutoComplete} from "components/autocomplete/GroupAutoComplete";
import {Button} from "primereact/button";

import {OverlayPanel} from "primereact/overlaypanel";
import XEditor from '@ui-lib/x-editor/XEditor';
import {GroupDropdown} from "components/autocomplete/GroupDropdown";
import TicketApi from "services/TicketApi";
import {Ticket_History} from "features/crm/components/Ticket_History";
import FieldEntityApi from "services/config/FieldEntityApi";
import FieldDynamicForm from "components/field-dynamic-form/FieldDynamicForm";
import Ticket_ListTask from "features/crm/components/Ticket_ListTask";
import {InputNumber} from "primereact/inputnumber";
import WorkLogTask from "components/autocomplete/WorkLogTask";
import ProjectUtil from "components/util/ProjectUtil";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';


function Ticket_ListTask_Detail(props, ref) {
    const t = CommonFunction.t;
    const { user } = props;
    const {filterByObj, groups, categories, resources, afterSubmit,rootGroupId,projectId,parent,onSubmitTask} = props;
    const refTicketDetail = useRef(null);
    const defaultData = {
        type: "TASK",
        name: "",
        email: "",
        phone: "",
        description: "",
        startDate: new Date()
    }
    const [parentTask, setParentTask] = useState(defaultData);
    const [ticket, setTicket] = useState(defaultData);
    const [ticketDescription, setTicketDescription] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [ticketImpacts, setTicketImpacts] = useState("");
    const [ticketCauses, setTicketCauses] = useState("");
    const [ticketSymptoms, setTicketSymptoms] = useState("");
    const [ticketControl, setTicketControl] = useState("");
    const [ticketSolution, setTicketSolution] = useState("");
    const [fieldsConfig, setFieldsConfig] = useState([]);
    const [btnLoading, setBtnLoading] = useState(false);
    const [readOnlyResponsibleUser, setReadOnlyResponsibleUser] = useState(false);

    const refDynamicForm = useRef(null);
    const [groupId, setGroupId] = useState("");
    const [groupsPr,setGroups] = useState([]);
    const defaultErrors = {
        name: "",
        involves: {
            REQUESTER: ""
        }
    }
    const [errors, setErrors] = useState(defaultErrors);

    // involves
    const defaultInvolves = [
        {
            role: "REQUESTER",
            involveType: "user",
            involveIds: [{
                id: window.app_context.user.id,
                fullName: window.app_context.user.fullName,
                avatar: window.app_context.user.avatar,
                status: true
            }]
        }, {
            role: "ASSIGNEE",
            involveType: "user",
            involveIds: []
        }, {
            role: "OBSERVER",
            involveType: "user",
            involveIds: []
        }, {
            role: "ASSIGNEE",
            involveType: "group",
            involveIds: []
        }, {
            role: "RESPONSIBLE",
            involveType: "user",
            involveIds: []
        }
    ];

    // analysis
    const defaultAnalysis = [
        {
            type: "Impacts",
            content: ""
        }, {
            type: "Causes",
            content: ""
        }, {
            type: "Symptoms",
            content: ""
        }, {
            type: "Control",
            content: ""
        }
    ];
    const [involves, setInvolves] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    // const [activate, setActivate] = useState(null);
    // state
    const refChangeStageMenu = useRef(null);
    const refListTaskRequest = useRef(null);
    const newsState = {
        draft: {
            key: "DRAFT",
            name: t("newsfeed.state.DRAFT"),
            icon: "bx bx-edit-alt"
        },
        approved: {
            key: "APPROVED",
            name: t("newsfeed.state.APPROVED"),
            icon: "bx bx-check"
        }
    }

    // jodit config
    const refDescription = useRef(null);
    const refSolution = useRef(null);
    const refImpacts = useRef(null);
    const refCauses = useRef(null);
    const refSymptoms = useRef(null);
    const refControl = useRef(null);
    const refWorkLog = useRef(null);

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: (type) => {
            create(type);
            setReadOnlyResponsibleUser(false);
        },

        /**
         * update
         * @param {*} id
         */
        update: (_taskId) => {
            update(_taskId);
            setReadOnlyResponsibleUser(false);
        },

        delete: (_news) => {
            remove(_news);
            setReadOnlyResponsibleUser(false);
        }

    }))

    /**
     * create
     */
    const create = async (type) => {
        // prepare default data
        let _defaultData = _.cloneDeep(defaultData);
        _defaultData.type = type || _defaultData.type;
        if(parent){
            setParentTask(parent);
            _defaultData.name = parent.name;
            setTicketDescription(parent.description);
        }else{
            setTicketDescription("");
        }
        setTicket(_defaultData);
        setShowHistory(false);
        setTicketSolution("");
        setTicketImpacts("");
        setTicketCauses("");
        setTicketSymptoms("");
        setTicketControl("");
        setInvolves(prepareInvolve(_.cloneDeep(defaultInvolves)));
        setAnalysis(prepareAnalysis(_.cloneDeep(defaultAnalysis)));
        setErrors(_.cloneDeep(defaultErrors));
        setGroupId(rootGroupId);

        let _fields = await FieldEntityApi.getByEntityType("crm-service-service", `ticket.${type}`);
        setFieldsConfig(_fields && _fields.length > 0 ? _fields : []);

        setTimeout(() => {
            refTicketDetail.current.create();
        }, 100);
    }

    /**
     * update
     * @param {*} id
     */
    const update = async (id) => {
        let _ticket = await TicketApi.get(id, "next-states");
        if (_ticket.task.type === 'TASK') {
            TicketApi.get(_ticket.task.rootKey).then(res => {
                if (res) {
                    setParentTask(res.task);
                }
            })
        }

        refTicketDetail.current.show();
        if (_ticket.task && _ticket.task.groupId && typeof _ticket.task.groupId === "object" && _ticket.task.groupId.hasOwnProperty("id")) {
            _ticket.task.groupId = parseInt(_ticket.task.groupId.id);
        }
        let _groups = ProjectUtil.getGroupFromRoot(window.app_context.user,_ticket.task.groupId)
        setGroups(_groups||[]);
        setGroupId(_ticket.task.groupId||0);
        setShowHistory(true);
        setTicket(_ticket.task);
        setTicketDescription(_ticket.task.description || "");
        setTicketSolution(_ticket.task.solution || "");

        setInvolves(prepareInvolve(_ticket.involves));
        setAnalysis(prepareAnalysis(_ticket.analysis));
        // setActivate(_ticket.activate);
        setErrors(_.cloneDeep(defaultErrors));

        // prepare fields
        let _fields = [];
        if (_ticket.fields) {
            _ticket.fields.forEach(_field => {
                _fields.push({
                    ..._field.fieldConfig,
                    values: _field.values,
                    displayValues: _field.displayValues
                })
            });
        }
        setFieldsConfig(_fields);

        setTimeout(() => {
            refTicketDetail.current.update(_ticket);
            refTicketDetail.current.setLoading(false);
            if (refWorkLog && refWorkLog.current) {
                refWorkLog.current.loadItems(_ticket.task);
            }
        }, 100);
    }

    /**
     * prepare involve
     * @param {*} _involves
     * @returns
     */
    const prepareInvolve = (_involves) => {
        let _involvesObject = {};

        // default involve
        let _defaultInvolves = _.cloneDeep(defaultInvolves);
        defaultInvolves.forEach(_defaultInvolve => {
            _involvesObject[`${_defaultInvolve.role}_${_defaultInvolve.involveType}`] = { ..._defaultInvolve }
        })

        // ticket involve
        if (_involves && _involves.length > 0) {
            _involves.forEach(involve => {
                _involvesObject[`${involve.role}_${involve.involveType}`] = { ...involve };
            });
        }
        return _involvesObject;
    }
    /**
     * prepare analysis
     * @param {*} _analysis
     * @returns
     */
    const prepareAnalysis = (_analysis) => {
        let _analysisObject = {};

        // default analysis
        let _defaultAnalysis = _.cloneDeep(defaultAnalysis);
        defaultAnalysis.forEach(_defaultAna => {
            _analysisObject[_defaultAna.type] = { ..._defaultAna }
        })

        //        setTicketDescription(res.task.description || "");
        // ticket analysis
        if (_analysis && _analysis.length > 0) {
            _analysis.forEach(ana => {
                _analysisObject[ana.type] = { ...ana };
                if (typeof ana.content !== 'undefined' && ana.type === "Impacts") {
                    setTicketImpacts(ana.content || "");
                }
                if (typeof ana.content !== 'undefined' && ana.type === "Causes") {
                    setTicketCauses(ana.content || "");
                }
                if (typeof ana.content !== 'undefined' && ana.type === "Symptoms") {
                    setTicketSymptoms(ana.content || "");
                }
                if (typeof ana.content !== 'undefined' && ana.type === "Control") {
                    setTicketControl(ana.content || "");
                }

            });
        }

        return _analysisObject;
    }

    /**
     * delete news
     */
    const remove = (_news) => {
        CommonFunction.showConfirm(t("confirm.delete.message").format(_news.name || t("newsfeed.news").toLowerCase()), t("ticket.delete.title"),
            () => {
                // accept delete
                TicketApi.delete(_news).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.deleted"));
                    }
                });
            }
        )
    }

    /**
     * get current edit mode
     * @returns
     */
    const getEditMode = () => {
        return refTicketDetail.current ? refTicketDetail.current.getEditMode() : null;
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _ticket = _.cloneDeep(ticket);

        _ticket[prop] = val;
        validateTicket([prop], _ticket);
        setTicket(_ticket);
    }

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
    }

    /**
     * validate involves
     * @param {*} involveTypes
     * @param {*} _involves
     * @returns
     */
    const validateInvolves = (involveTypes, _involves) => {
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
                case "REQUESTER_user":
                    result.involves.REQUESTER_user = _involves.REQUESTER_user.involveIds.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set is valid
        let allErrors = []
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
        let result = { ...errors }, isValid = true;

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
                    result.name = _ticket.name.length > 0 ? null : `${t("common.name")} ${t('message.cant-be-empty')}`;
                    break;
                case "email":
                    result.email = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/.test(_ticket.email) ? null : t("user.validate.email-wrong-pattern");
                    break;
                case "phone":
                    result.phone = /^[0-9\b]+$/.test(_ticket.phone) ? null : t("ticket.validate.phone-wrong-pattern");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let allErrors = []
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
    const submit = async (callback, close) => {
        setBtnLoading(true)
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
            let _confirmSubmit = false;
            if(refWorkLog.current) {
                let _worklogtask = refWorkLog.current.getWorklogTasks();
                if(_worklogtask && _worklogtask.length > 0) {
                    _worklogtask.forEach(element => {
                        if(element.changerWorklog) {
                            _confirmSubmit = true
                        }
                    });
                }
            }
            if (_confirmSubmit) {
                CommonFunction.showConfirm(t("worklog.changer"),t("confirm.submit"),
                    async () => {
                        refTicketDetail.current.setLoading(true);
                        let editMode = getEditMode();

                        // combine task
                        let _ticket = _.cloneDeep(_taskbase.task)
                        _ticket.task = Object.assign(_ticket.task, _.cloneDeep(ticket));
                        // parent
                        if(parentTask){
                            _ticket.task.rootType = parentTask.type
                            _ticket.task.rootKey = parentTask.id
                        }else{
                            let listBy = filterByObj.listBy;
                            if (listBy === 'ROOT' && filterByObj.rootKey && filterByObj.rootType) {
                                _ticket.task.rootType = filterByObj.rootType
                                _ticket.task.rootKey = filterByObj.rootKey
                            } else if (listBy === 'PARENT' && filterByObj.parentId) {
                                _ticket.task.parentId = filterByObj.parentId
                            }
                        }
                        // request by
                        _ticket.task.requestedBy = window.app_context.user.id;

                        _ticket.task.userId = window.app_context.user.id;
                        // request by
                        delete _ticket.task.requestedByUsers;
                        delete _ticket.task.requestedByUser;
                        delete _ticket.task.createByUser;
                        // description
                        _ticket.task.description = ticketDescription;
                        _ticket.task.solution = ticketSolution;

                        // involves
                        _ticket.involves = _.cloneDeep(defaultInvolves);
                        _ticket.involves.forEach(_involve => {
                            if (involves[`${_involve.role}_${_involve.involveType}`] && involves[`${_involve.role}_${_involve.involveType}`].involveIds.length > 0) {
                                _involve.involveIds = involves[`${_involve.role}_${_involve.involveType}`].involveIds.map(m => m.id);
                            }
                        });

                        _ticket.analysis = _.cloneDeep(defaultAnalysis);
                        _ticket.analysis.forEach(_analysis => {
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
                        ["companyId", "responsibleId", "groupId"].forEach(editProps => {
                            if (_ticket.task[editProps] && typeof _ticket.task[editProps] === "object" && _ticket.task[editProps].id) {
                                _ticket.task[editProps] = _ticket.task[editProps].id;
                            }
                        });

                        // delete unneccesary props
                        ["createBy", "updateBy"].forEach(delProps => {
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
                                res = await TicketApi.create(_ticket)
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

                            // call event
                            if (afterSubmit && typeof afterSubmit === "function") {
                                await afterSubmit(editMode, res);
                            }
                            // onSubmitTask
                            if (onSubmitTask && typeof onSubmitTask === "function") {
                                await onSubmitTask(res,editMode);
                            }
                            if(close) {
                                refTicketDetail.current.hide()
                            } else {
                            // update current task
                                update(res.task.id);
                            }

                            CommonFunction.toastSuccess(t("common.save-success"));
                        }
                    },
                    () => {

                    }
                )
            } else {
                refTicketDetail.current.setLoading(true);

                let editMode = getEditMode();

                // combine task
                let _ticket = _.cloneDeep(_taskbase.task)
                _ticket.task = Object.assign(_ticket.task, _.cloneDeep(ticket));
                // parent
                if (parentTask) {
                    _ticket.task.rootType = parentTask.type
                    _ticket.task.rootKey = parentTask.id
                } else {
                    let listBy = filterByObj.listBy;
                    if (listBy === 'ROOT' && filterByObj.rootKey && filterByObj.rootType) {
                        _ticket.task.rootType = filterByObj.rootType
                        _ticket.task.rootKey = filterByObj.rootKey
                    } else if (listBy === 'PARENT' && filterByObj.parentId) {
                        _ticket.task.parentId = filterByObj.parentId
                    }
                }
                // request by
                _ticket.task.requestedBy = window.app_context.user.id;

                _ticket.task.userId = window.app_context.user.id;
                // request by
                delete _ticket.task.requestedByUsers;
                delete _ticket.task.requestedByUser;
                delete _ticket.task.createByUser;
                // description
                _ticket.task.description = ticketDescription;
                _ticket.task.solution = ticketSolution;

                // involves
                _ticket.involves = _.cloneDeep(defaultInvolves);
                _ticket.involves.forEach(_involve => {
                    if (involves[`${_involve.role}_${_involve.involveType}`] && involves[`${_involve.role}_${_involve.involveType}`].involveIds.length > 0) {
                        _involve.involveIds = involves[`${_involve.role}_${_involve.involveType}`].involveIds.map(m => m.id);
                    }
                });

                _ticket.analysis = _.cloneDeep(defaultAnalysis);
                _ticket.analysis.forEach(_analysis => {
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
                ["companyId", "responsibleId", "groupId"].forEach(editProps => {
                    if (_ticket.task[editProps] && typeof _ticket.task[editProps] === "object" && _ticket.task[editProps].id) {
                        _ticket.task[editProps] = _ticket.task[editProps].id;
                    }
                });

                // delete unneccesary props
                ["createBy", "updateBy"].forEach(delProps => {
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
                        res = await TicketApi.create(_ticket)
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
                    // call event
                    if (afterSubmit && typeof afterSubmit === "function") {
                        afterSubmit(editMode, res);
                    }
                    // onSubmitTask
                    if (onSubmitTask && typeof onSubmitTask === "function") {
                        onSubmitTask(res,editMode);
                    }
                    if (close) {
                        refTicketDetail.current.hide()
                    } else {
                        // update current task
                        update(res.task.id);
                    }
                    CommonFunction.toastSuccess(t("common.save-success"));
                }
            }
        } else {
            ticketErrors = (ticketErrors || []).concat(_taskbase.errors || []);
            ticketErrors = _.uniq(ticketErrors);
            CommonFunction.toastWarning(ticketErrors);
        }
        setBtnLoading(false)
    }

    /**
     * render errors
     * @param {*} prop
     */
    const renderErrors = (prop) => {
        if (errors[prop]) {
            return <small className="p-invalid">{errors[prop]}</small>
        } else {
            return <></>
        }
    }

    /**
     * render involve errors
     * @param {*} prop
     */
    const renderInvolveErrors = (prop) => {
        if (errors.involves[prop]) {
            return <small className="p-invalid">{errors.involves[prop]}</small>
        } else {
            return <></>
        }
    }

    /**
     * render news info
     * @returns
     */
    const renderTicketInfo = () => {
        let editMode = getEditMode();
        return (<>
            <div className="p-fluid fluid  formgrid grid p-0">
                { parentTask &&
                <div className="p-autocomplete-multiple-container p-component p-inputtext p-disabled  ml-1 col-12 flex align-items-center w-full">
                    <i className="bx bxs-package mr-1"></i>
                    <span>{t('ticket.parent')}</span>
                    <span id="work-package" className="p-autocomplete p-component p-inputwrapper x-auto-compelete x-auto-compelete-for-37077223 ml-3 mt-1  p-autocomplete-dd p-autocomplete-multiple p-inputwrapper-filled" aria-haspopup="listbox" aria-expanded="false" aria-owns="work-package_list">
                        <ul className="p-autocomplete-multiple-container p-component p-inputtext p-disabled">
                            <li className="p-autocomplete-token p-highlight">
                                <span className="p-autocomplete-token-label">
                                    <div>
                                        <div className="flex align-items-stretch">
                                            <div className="flex align-items-center">
                                                <div>
                                                    <span className="link-button mr-3">{parentTask.code} {(parentTask.code && parentTask.name) ?  " - " : "" } {parentTask.name.length > 40 ? parentTask.name.slice(0,60)+ " ..." : parentTask.name}</span>
                                                </div>
                                                <div>{CommonFunction.formatDateTime(parentTask.startDate)} {(parentTask.deadline && parentTask.startDate) ?  " - " : "" } {CommonFunction.formatDateTime(parentTask.deadline)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </span>
                            </li>
                        </ul>

                    </span>
                </div> }
                <div className="col-4">
                    <span className="p-float-label">
                        <UserAutoComplete
                            value={involves && involves.REQUESTER_user ? involves.REQUESTER_user.involveIds : []}
                            groupIds={groupId?[groupId]:[]}
                            excludeUserIds={involves && involves.REQUESTER_user ? involves.REQUESTER_user.involveIds.map(m => m.id) : []}
                            onChange={(value) => applyInvolvesChange('REQUESTER_user', value)}
                        />
                        <label>{t('ticket.requester')}</label>
                        {renderInvolveErrors("REQUESTER_user")}
                    </span>
                </div>
                <div className="col-12">
                    <span className="p-float-label ">
                        <InputText
                            value={ticket.name}
                            onChange={(e) => applyChange('name', e.target.value)}
                        />
                        <label className="require">{t("common.name")}</label>
                        {renderErrors("name")}
                    </span>
                </div>
                <div className="col-12">
                    <XEditor
                        ref={refDescription}
                        value={ticketDescription}
                        onBlur={newContent => setTicketDescription(newContent)} // preferred to use only this option to update the content for performance reasons
                        config={{
                            placeholder: t("ticket.content"),
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
                            minHeight: 100,
                            language: CommonFunction.getCurrentLanguage(),
                        }}
                    ></XEditor>
                </div>
                <div className="col-12">
                    <span className="p-float-label">
                        <GroupDropdown
                            filter
                            filterInputAutoFocus
                            showClear
                            filterBy="name"
                            value={rootGroupId}
                            listGroups={groups?groups:groupsPr || []}
                            onChange={(e) => applyChange('groupId', e.target.value)}
                            optionLabel="name"
                            optionValue="id"
                            disabled
                        />
                        <label>{t("task.owner.task")}</label>
                    </span>
                </div>
                <div className="col-12">
                    <span className="p-float-label">
                        <UserAutoComplete
                            multiple
                            value={involves && involves.OBSERVER_user ? involves.OBSERVER_user.involveIds : []}
                            groupIds={groupId?[groupId]:[]}
                            excludeUserIds={involves && involves.OBSERVER_user ? involves.OBSERVER_user.involveIds.map(m => m.id) : []}
                            onChange={(value) => applyInvolvesChange('OBSERVER_user', value)}
                        />
                        <label>{t('task.observerUsers')}</label>
                    </span>
                </div>
                <div className="col-12">
                    <span className="p-float-label">
                        <GroupAutoComplete
                            multiple
                            value={involves && involves.ASSIGNEE_group && involves.ASSIGNEE_group.involveIds && involves.ASSIGNEE_group.involveIds.length > 0 ? involves.ASSIGNEE_group.involveIds : null}
                            groupIds={groupId?[groupId]:[]}
                            excludeUserIds={involves && involves.ASSIGNEE_group ? involves.ASSIGNEE_group.involveIds.map(m => m.id) : []}
                            onChange={(value) => applyInvolvesChange('ASSIGNEE_group', value)}
                        />
                        <label>{t('ticket.assigngroup')}</label>
                    </span>
                </div>
                <div className="col-12">
                    <span className="p-float-label">
                        <UserAutoComplete
                            multiple
                            value={involves && involves.RESPONSIBLE_user ? involves.RESPONSIBLE_user.involveIds : []}
                            groupIds={groupId?[groupId]:[]}
                            disabled={readOnlyResponsibleUser}
                            excludeUserIds={involves && involves.RESPONSIBLE_user ? involves.RESPONSIBLE_user.involveIds.map(m => m.id) : []}
                            onChange={(value) => applyInvolvesChange('RESPONSIBLE_user', value)}
                        />
                        <label>{t('ticket.responsible')}</label>
                    </span>
                </div>
                <div className="col-2">
                    <XCalendar
                        showTime
                        label={t('common.startDate')}
                        value={ticket.startDate}
                        onChange={(value) => applyChange('startDate', value)}
                    />
                </div>
                <div className="col-2">
                    <XCalendar
                        showTime
                        label={t('common.resolvedeadline')}
                        value={ticket.deadline}
                        onChange={(value) => applyChange('deadline', value)}
                    />
                </div>
                <div className="col-2">
                    <XCalendar
                        showTime
                        label={t('common.realStartDate')}
                        value={ticket.realStartDate}
                        onChange={(value) => applyChange('realStartDate',value)}
                    />
                </div>
                <div className="col-2">
                    <XCalendar
                        showTime
                        label={t('common.realEndDate')}
                        value={ticket.realEndDate}
                        onChange={(value) => applyChange('realEndDate', value)}
                    />
                </div>
                <div className="col-2">
                    <span className={classNames({"p-float-label": true})}>
                        <InputNumber id="requireWorkHour" 
                            mode="decimal" minFractionDigits={1} maxFractionDigits={20}
                            value={ticket.requireWorkHour} onChange={(e) => applyChange('requireWorkHour', e.value)} />
                        <label htmlFor="requireWorkHour">{t('requireWorkHour')}</label>
                    </span>
                </div>
                <div className="col-2">
                    <span className={classNames({"p-float-label": true})}>
                        <InputNumber id="donePercent" mode="decimal"
                            minFractionDigits={1} maxFractionDigits={20} value={ticket.donePercent}
                            onChange={(e) => applyChange('donePercent', e.value)}  />
                        <label htmlFor="requireWorkHour">{t('donePercent')}</label>
                    </span>
                </div>
            </div>


                <FieldDynamicForm
                    ref={refDynamicForm}
                    fieldsConfig={fieldsConfig}
                ></FieldDynamicForm>

                {ticket && (editMode !== Enumeration.crud.create) &&
                <div className="col-12" >
                    <WorkLogTask ref={refWorkLog} setReadOnlyResponsibleUser={setReadOnlyResponsibleUser} task={ticket} projectId={projectId} application="crm-service-service"
                                 taskEntity={ticket.type} rootType={ticket.rootType} rootId={ticket.rootKey} />
                </div>
                }
        </>)
    }

      // render list task ticket
      const renderListTask = () => {
        let editMode = getEditMode();
        if (editMode !== Enumeration.crud.create) {
            return (
                <div className="p-fluid fluid  formgrid grid p-0">
                    <Ticket_ListTask ref={refListTaskRequest}
                                       filterByObj={{
                                           listBy: 'PARENT',
                                            parentId: ticket.id,
                                       }}
                                        categories={categories}
                                        afterSubmit={afterSubmit}
                                        resources={resources}
                                        rootGroupId={groupId}
                                        groups={groups?groups:groupsPr}/>
                </div>
            )
        }
    }


    /**
     * change state
     * @param {*} state
     */
    const changeState = (state) => {
        // submit before change state
        submit(async (_ticket) => {
            // after submit success, call change state
            let res = await TicketApi.changeState(_ticket.task.id, state);
            refChangeStageMenu.current.hide();
            _ticket.task.state = state;
            return _ticket;
        })
    }
    /**
     * render toolbar
     */
    const renderToolbarLeft = () => {
        if (ticket.state) {
            // when creating news
            return (<>
                <Button label={t("task.change.state")} icon="bx bx-transfer-alt" onClick={(e) => refChangeStageMenu.current.toggle(e)} />
            </>)
        }
    };
    const renderToolbarRight = () => {
        return (
            <>
            <Button loading={btnLoading} icon="bx bxs-save create" label={t('common.save')} onClick={() => submit()} />
            <Button loading={btnLoading} label={t('common.save-close')}
                            icon="bx bxs-save create" onClick={() => submit(false,true)} />
        </>
        )
    }


    return (<>
        <TaskBaseDetail
            ref={refTicketDetail}
            refType={"ticket"}
            application="crm-service-service"
            // onHide={() => setTicket(null)}
            entityName={t(`ticket.create-task`)}
            toolbar={{ left: renderToolbarLeft , right: renderToolbarRight}}
            modules={["ticket_info", "sub_task", "comment","ticket_list_task", "ticket_history"]}
            modulesDefinition={{
                ticket_info: {
                    title: ticket.subtype && (ticket.subtype === 2 ? t(`ticket.request`) : t(`ticket.incident`)) || t(`ticket.${ticket.type.toLowerCase()}`),
                    icon: "bx bx-receipt",
                    renderer: renderTicketInfo
                },
                ticket_list_task: {
                    title: t(`ticket.task`),
                    icon: "bx bxs-folder-open",
                    renderer: renderListTask,
                    // visible: showAnalysis
                },
                ticket_history: {
                    title: t("task.history"),
                    icon: "bx bx-history",
                    renderer: () => <Ticket_History taskId={ticket.id} getHistoriesFn={TicketApi.getHistories} />,
                    visible: showHistory
                }
            }}
        ></TaskBaseDetail>

        <OverlayPanel ref={refChangeStageMenu} className="x-menu">
            {ticket && ticket["next-states"] && ticket["next-states"].map((s, index) => (
                <div key={index} className="x-menu-button" onClick={() => changeState(s)}>
                    <i className='bx bx-radio-circle'></i>
                    <span>{t(`ticket.state.sort.${s}`)}</span>
                </div>
            ))}
        </OverlayPanel>
    </>)
}

Ticket_ListTask_Detail = forwardRef(Ticket_ListTask_Detail);

export default Ticket_ListTask_Detail;

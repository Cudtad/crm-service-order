import CommonFunction from '@lib/common';
// import TaskService from "services/TaskService";
// import RequestApi from "services/RequestApi";
import _ from "lodash";
import {Tooltip} from "primereact/tooltip";
import classNames from 'classnames';
import React from "react";
import Enumeration from "components/enumration/EnumrationTicket";
// import WorkPackageApi from "services/WorkPackageService";
// import ProjectUtil from "components/util/ProjectUtil";
// import ProjectService from "services/ProjectService";

const taskScope = {
    TASK: 'TASK',
    REQUEST: 'REQUEST',
    MASTER_REQUEST: 'MASTER_REQUEST'
}

const taskRole = {
    NO_ROLE: 0,
    OBSERVER: 1,
    CREATE_BY: 2,
    PARTICIPANT: 3,
    REQUESTER: 4,
    RESPONSIBLE: 5,
    ADMIN: 6,
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

const consDetailScope = {
    PROJECT: 'project',
    TASK: 'task'
}

const TaskUtil = {
    R(){
        return taskRole;
    },
    S(){
        return consState;
    },
    DetailScope(){
        return consDetailScope;
    },
    const_TaskScope(){
        return taskScope;
    },
    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getDetailScope(_task){
        let _scope = consDetailScope.TASK
        if(!_task.group){
            return _scope
        }
        let _groupType = _.task.group.type;
        if(_groupType &&
            (_groupType === 'project' || _groupType === 'phase')){
            return consDetailScope.PROJECT
        }
        if(_task.rootType && _task.rootType in ('ISSUE', 'project.work-package')){
            return consDetailScope.PROJECT
        }
    },

    getDefaultLazy() {
        let _lazy = {
            page: 0,
            size: 0,
            affect: {
                keyword: "",
                groupId: -1,
                listBy: null,
                parentId: 0,
                rootKey: "",
                rootType: "",
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
        }
        return _lazy;
    },

    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    addInvolveCondition(conditions, fieldName, condition, value, logicOperator){
        if(!conditions){
            conditions = [];
        }
        let values = Array.isArray(value) ? value : (value ? value.split(",") : null)
        conditions.push({
            logicOperator: logicOperator ? logicOperator : "AND",
            conditionType: "RULE",
            filterType: "ROLE",
            fieldType: "STRING",
            fieldName: fieldName,
            operator: condition ? condition : "IN",
            values: values ? values : []
        });
        return conditions;
    },
    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    addCondition(conditions, fieldName, fieldType, condition, value, logicOperator){
        if(!conditions){
            conditions = [];
        }
        let values = Array.isArray(value) ? value : (value ? value.split(",") : null)
        conditions.push({
            logicOperator: logicOperator ? logicOperator : "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: fieldType ? fieldType : "STRING",
            fieldName: fieldName,
            operator: condition ? condition : "IN",
            values: values ? values : []
        });
        return conditions;
    },
    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getDueState(_task, propsCloseDate, propsDeadline) {
        let _progress = null;
        let _propsDeadline = propsDeadline ? propsDeadline : "deadline";
        let _propCloseDate = propsCloseDate ? propsCloseDate : "closedOn";
        if (!_task[_propsDeadline]) {
            return;
        }
        if (!_task[_propCloseDate]) {
            _progress = TaskUtil.compareDateTime(new Date(), _task[_propsDeadline]);
        }
        return _progress;
    },


    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */

    compareDateTime(dateTimeOne,deateTimeTwo) {
        let _progress = null;
        let _dateTimeOne = new Date(dateTimeOne);
        let _dateTimeTwo = new Date(deateTimeTwo);
        let _compare = CommonFunction.compareDate(_dateTimeOne, _dateTimeTwo);
        if (_compare === 0 ) {
            if(_dateTimeOne > _dateTimeTwo) {
                _progress = "overdue"
            } else {
                _progress = "due"
            }
        } else if (_compare > 0) {
            _progress = "overdue"
        }
        return _progress
    },

    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getTaskCustomValue(_fields, _fieldCode) {
        let value;
        if(_fields && _fields.length > 0){
            _fields.map(c => {
                if(c.fieldCode === _fieldCode){
                    switch (c.fieldType) {
                        case Enumeration.customfield_datatype.STRING:
                            value = c.values && c.values.length > 0 ? c.values[0] : "";
                            break;
                        case Enumeration.customfield_datatype.LONG:
                        case Enumeration.customfield_datatype.DOUBLE:
                            value = c.values && c.values.length > 0 ? c.values[0] : null;
                            break;
                        case Enumeration.customfield_datatype.DATE:
                        case Enumeration.customfield_datatype.DATE_TIME:
                            value = c.values && c.values.length > 0 ? c.values[0] : null;
                            break;
                        case Enumeration.customfield_datatype.BOOLEAN:
                            value = null;
                            if (c.values && c.values.length > 0) {
                                if (c.values[0].toLowerCase() === "true") {
                                    value = true;
                                } else if (c.values[0].toLowerCase() === "false") {
                                    value = false;
                                }
                            }
                            break;
                        case Enumeration.customfield_datatype.LIST_SINGLE:
                            if (c.listMethod && c.listMethod === "METHOD_CONFIG") {
                                if (c.configResponseType === "all") {
                                    // outbounce data and get all data
                                    value = c.values && c.values.length > 0 ? c.values[0] : null;
                                } else {
                                    // outbounce data and get paging data
                                    value = c.displayValues;
                                }
                            } else {
                                // inbounce data
                                value = c.values[0];
                            }
                            break;
                        case Enumeration.customfield_datatype.LIST_MULTI:
                            if (c.listMethod && c.listMethod === "METHOD_CONFIG") {
                                if (c.configResponseType === "all") {
                                    // outbounce data and get all data
                                    value = c.values && c.values.length > 0 ? c.values : null;
                                } else {
                                    // outbounce data and get paging data
                                    value = c.displayValues;
                                }
                            } else {
                                // inbounce data
                                value = c.values;
                            }
                            break;
                        default:
                            break;
                    }
                }
            })
        }
        return value;
    },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async getListTaskByRoot(_rootType, _rootId) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];

    //     conditions.push({
    //         logicOperator: "AND",
    //         conditionType: "RULE",
    //         filterType: "FIELD",
    //         fieldType: "STRING",
    //         fieldName: "root_type",
    //         operator: "=",
    //         values: [_rootType]
    //     });

    //     conditions.push({
    //         logicOperator: "AND",
    //         conditionType: "RULE",
    //         filterType: "FIELD",
    //         fieldType: "STRING",
    //         fieldName: "root_key",
    //         operator: "=",
    //         values: [_rootId]
    //     });


    //     if (conditions.length > 0) {
    //         conditions[0].logicOperator = "";
    //     }

    //     _lazy.condition.conditions = conditions;

    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         let _data = res.content;
    //         _data.map(o => {
    //             if (o.type === 'REQUEST') {
    //                 RequestApi.get(o.id).then(requestRes => {
    //                     o = _.cloneDeep(requestRes);
    //                 })
    //             }
    //         })
    //         return _data;
    //     }

    //     return [];
    // },

    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async countTaskByUserId(_userId, _groupIds) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];
    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     if(_groupIds){
    //         TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    //     }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async countTotalWorkByUserId(_userId, _groupIds) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];
    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     if(_groupIds){
    //         TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    //     }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async countTaskPendByUserId(_userId, _groupIds) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];
    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     TaskUtil.addCondition(conditions, "closed_on is null", null, "EXPRESSION", null);
    //     if(_groupIds){
    //         TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    //     }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async countTaskPendByWorkflowId(_userId, _groupIds, _workflow_id) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];

    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     TaskUtil.addCondition(conditions, "closed_on is null", null, "EXPRESSION", null);
    //     TaskUtil.addCondition(conditions, "workflow_id", 'LONG', null, _workflow_id.toString());
    // if(_groupIds){
    //     TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    // }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async countTaskPendingOverDueByUserId(_userId, _groupIds) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];
    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     TaskUtil.addCondition(conditions, "state", null, "IN", 'COMPLETED', "AND NOT");
    //     TaskUtil.addCondition(conditions, "closed_on is null", null, "EXPRESSION", null);
    //     TaskUtil.addCondition(conditions, "deadline > now()", null, "EXPRESSION", null);
    //     if(_groupIds){
    //         TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    //     }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async getRequestByRoot(_rootKey, _rootType) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     let conditions = [];

    //     TaskUtil.addCondition(conditions, "root_key", null, null, _rootKey);
    //     TaskUtil.addCondition(conditions, "root_type", null, null, _rootType);
    //     conditions[0].logicOperator = "";
    //     _lazy.condition.conditions = conditions;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         return res.content;
    //     }
    //     return [];
    // },
    /**
     * get due state
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getDueDisplay(_task, props, propsDeadline){
        let _due = TaskUtil.getDueState(_task, props ,propsDeadline);
        if(_due){
            return (
                <>
                    {TaskUtil.getDueState(_task, props, propsDeadline) === 'overdue' &&
                    <>
                        <Tooltip target={`.flag-over-due`} content={CommonFunction.t(`task.due.overdue`)} position="bottom" />
                        <i className={
                            classNames({
                                "flag-over-due project-list-quick-action bx bxs-hourglass-bottom ml-1 mr-2": true,
                                "text-red-6": true
                            })}>
                        </i>
                    </>
                    }
                    {TaskUtil.getDueState(_task, props, propsDeadline) === 'due' &&
                    <>
                        <Tooltip target={`.flag-due`} content={CommonFunction.t(`task.due.due`)} position="bottom"/>
                        <i className={
                            classNames({
                                "flag-due project-list-quick-action bx bxs-hourglass ml-1 mr-2": true,
                                "text-yellow-9": true
                            })}>
                        </i>
                    </>
                    }
                </>
            )
        }
    },
    /**
     * get task role with User
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getTaskRoles(_involves, _user){
        let _role = [];
        let _task = {};
        _task.responsibleIds =  (_involves["RESPONSIBLE_user"] ? _involves["RESPONSIBLE_user"].involveIds : []);
        _task.requestedBy =  (_involves["REQUESTER_user"] ? _involves["REQUESTER_user"].involveIds : []);
        _task.participantIds =  (_involves["PARTICIPANT_user"] ? _involves["PARTICIPANT_user"].involveIds : []);
        _task.observerIds =  (_involves["OBSERVER_user"] ? _involves["OBSERVER_user"].involveIds : []);

        if (_task.responsibleIds && _task.responsibleIds.length > 0) {
            _.forEach(_task.responsibleIds, function (ids) {
                if (ids.id === _user.id) {
                    _role.push(taskRole.RESPONSIBLE);
                }
            });
        }

        if (_task.requestedBy && _task.requestedBy.length > 0) {
            _.forEach(_task.requestedBy, function (ids) {
                if (ids.id === _user.id) {
                    _role.push(taskRole.REQUESTER);
                }
            });
        }

        if (_task.participantIds && _task.participantIds.length > 0) {
            _.forEach(_task.participantIds, function (ids) {
                if (ids.id === _user.id) {
                    _role.push(taskRole.PARTICIPANT);
                }
            });
        }

        if (_task.observerIds && _task.observerIds.length > 0) {
            _.forEach(_task.observerIds, function (ids) {
                if (ids === _user.id) {
                    _role.push(taskRole.OBSERVER);
                }
            });
        }

        return _.uniqWith(_role, _.isEqual);
    },

    /**
     * get task role with User
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    getTaskRole(_involves, _user){
        let _roles = TaskUtil.getTaskRoles(_involves, _user);
        return _.max(_roles);
    },

    /**
     * get task role with User
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    hasRole(_involves, _user, _role){
        let _roles = TaskUtil.getTaskRoles(_involves, _user);
        return (_.indexOf(_roles, _role) > -1);
    },
    /**
     * get task role with User
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    hasRoles(_involves, _user, _roles){
        let _has = false;
        _roles.map(m => {
            if (TaskUtil.hasRole(_involves, _user, m)){
                _has = true;
            }
        })
        return _has;
    },
    // check is the responsible user for the task
    checkIsResponsibleForTask(responsible, _userLogin){
        if(responsible) {
            const _responsible = typeof responsible === 'object' ? responsible.id : responsible;
            if (_responsible === _userLogin.id) {
                return true
            }
        }
        return false
    },
    //task {}
    //states []
    checkTaskState(task, states){
        let _hasState = false;
        if(task && states && states.length > 0) {
            states.map(_state => {
                if(task.state === _state){
                    _hasState = true;
                }
            })
        }
        return _hasState
    },

    getTaskScope(_task){
        if (_task.type === taskScope.REQUEST) {
            return taskScope.MASTER_REQUEST;
        } else {
            if (_task.workflowId === 0) {
                return taskScope.TASK;
            } else {
                return taskScope.REQUEST
            }
        }
    },

    // async getRootDisplay(_task, _refCache){
    //     let _rootObject;
    //     if(_task.rootType && _task.rootKey){
    //         if(!_refCache.current[_task.rootType]){
    //             _refCache.current[_task.rootType] = {};
    //         }
    //         if(_refCache.current && _refCache.current[_task.rootType][_task.rootKey]){
    //             _rootObject = _refCache.current[_task.rootType][_task.rootKey];
    //         }else{
    //             if(_task.rootType === ProjectUtil.const_TASK_ROOT().workpackage) {
    //                 _rootObject = await WorkPackageApi.getDisplayById(_task.rootKey);
    //             }else if(_task.rootType === ProjectUtil.const_TASK_ROOT().issue){
    //                 _rootObject = await ProjectService.getIssueDisplayById(_task.rootKey);
    //             }
    //             _refCache.current[_task.rootType][_task.rootKey] = _rootObject;
    //         }
    //     }
    //     return _rootObject;
    // },

    // async getRootParent(_task){
    //     let _parent;
    //     if(_task.parentId && _task.parentId > 0){
    //         _parent = await ProjectService.task.getById(_task.parentId);
    //     }
    //     if(_parent && _parent.task){
    //         return TaskUtil.getRootParent(_parent.task);
    //     }else{
    //         return _task;
    //     }
    // },
    // /**
    //  * get due state
    //  * @param {*} obj
    //  * @param {*} path
    //  * @returns
    //  */
    // async filterResponsibleByMe(_application, _userId, _groupIds) {
    //     let _lazy = TaskUtil.getDefaultLazy();
    //     _lazy.size = 9999;
    //     let conditions = [];
    //     TaskUtil.addCondition(conditions, "responsible_id", null, null, _userId);
    //     TaskUtil.addCondition(conditions, "type", null, null, 'TASK');
    //     if(_groupIds){
    //         TaskUtil.addCondition(conditions, "group_id", 'LONG', null, _groupIds);
    //     }
    //     _lazy.condition.conditions = conditions;
    //     let count = 0;
    //     let res = await TaskService.getBaseTasks(_lazy);
    //     if(res){
    //         count = res.total;
    //     }
    //     return count;
    // },
}

export default TaskUtil;

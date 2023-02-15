import _ from "lodash";
import React from "react";
import CommonFunction from '@lib/common';
import moment from "moment";
import TaskUtil from "../../task/components/util/TaskUtil";
import WorkPackageService from "services/WorkPackageService";
import PhaseService from "services/PhaseService";
import ProjectService from "services/ProjectService";

var debounceCurrent = null;
var debounceDelay = 500;
var toastDelay = 3000;

var maxId = 99999999,
    minId = 10000000;

const t = CommonFunction.t
const resourceAction = {
    project_information: {
        code: 'project_information',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_organization :{
        code: 'project_organization',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_customer :{
        code: 'project_customer',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_deliverable :{
        code: 'project_deliverable',
        action: {view: 'VIEW', update: 'UPDATE', delete: 'DELETE', admin: 'ADMIN'}
    },
    project_task :{
        code: 'project_task',
        action: {view: 'VIEW', update: 'UPDATE', delete: 'DELETE', create: 'CREATE', admin: 'ADMIN'}
    },
    project_ot_plan :{
        code: 'project_ot_plan',
        action: {view: 'VIEW', update: 'UPDATE', delete: 'DELETE', create: 'CREATE', admin: 'ADMIN'}
    },
    project_issue :{
        code: 'project_issue',
        action: {view: 'VIEW', update: 'UPDATE', delete: 'DELETE', create: 'CREATE'
            , update_matrix: 'UPDATE_MATRIX'
            , create_task: 'CREATE_TASK', admin: 'ADMIN'}
    },
    project_wbs :{
        code: 'project_wbs',
        action: {view: 'VIEW', update: 'UPDATE',  create_version: 'CREATE_VERSION', approve_version: 'APPROVE_VERSION', admin: 'ADMIN'}
    },
    project_allocate :{
        code: 'project_allocate',
        action: {view: 'VIEW', update: 'UPDATE', create_version: 'CREATE_VERSION', approve_version: 'APPROVE_VERSION', admin: 'ADMIN'}
    },
    project_cost :{
        code: 'project_cost',
        action: {view: 'VIEW', update: 'UPDATE', create_version: 'CREATE_VERSION', approve_version: 'APPROVE_VERSION', admin: 'ADMIN'}
    },
    project_revenue :{
        code: 'project_revenue',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_storage :{
        code: 'project_storage',
        action: {view: 'VIEW', update: 'UPDATE', create_folder: 'CREATE_FOLDER', delete_folder: 'DELETE_FOLDER', create_file: 'CREATE_FILE', delete_file:'DELETE_FILE', admin: 'ADMIN'}
    },
    project_permission :{
        code: 'project_permission',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_location :{
        code: 'project_location',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_calendar :{
        code: 'project_calendar',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_workflow :{
        code: 'project_workflow',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
    project_customfield :{
        code: 'project_customfield',
        action: {view: 'VIEW', update: 'UPDATE', admin: 'ADMIN'}
    },
}

const ENTITY = {
    phase: 'phase',
    workpackage: 'workpackage',
    task: 'task',
    project: 'project'
}

const WBS_ACTION = {
    createPhase:            'create-phase',
    informationPhase:       'information-phase',
    scalePhase:             'scale-phase',
    deletePhase:            'delete-phase',
    createWorkpackage:      'create-workpackage',
    informationWorkpackage: 'information-workpackage',
    scaleWorkpackage:       'scale-workpackage',
    deleteWorkpackage:      'delete-workpackage',
    copyWorkpackage:        'copy-workpackage',
    copyTask:               'copy-task',
    createTask:             'create-task'
}
const WP_STATE = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    CHECKING: 'CHECKING',
    DONE: 'DONE'
}

const STATE = {
    approved: 'APPROVED',
    init: 'INIT'
}

const VERSION_TYPE = {
    time: 'time',
    resource: 'resource'
    , cost: 'cost'
    , onSelectCompareVersionresource: 'resource'
}

const REF_TYPE = {
    start_to_start: "start-to-start"
    , finish_to_finish: "finish-to-finish"
    , start_to_finish: "start-to-finish"
    , finish_to_start: "finish-to-start"
}

const REF_TIME = {
    before_start: "before-start"
    , after_start: "after-start"
    , before_end: "before-end"
    , after_end: "after-end"
    , direct: "direct"
}

const TIME_UNIT = {
    day: "day"
    , hour: "hour"
    , minute: "minute"
}

const BUSINESS_WORKFLOW_CODE = {
    ot_approve: 'OT-APPROVE',
    time_version: "CHANGE_TIME_VERSION",
    resource_version: "CHANGE_RESOURCE_VERSION",
    cost_version: "CHANGE_COST_VERSION"
}

const TASK_ROOT = {
    workpackage: 'project.workpackage',
    issue: 'issue',
    time_version: "project.time-version",
    cost_version: "project.cost-version",
    resource_version: "project.resource-version",
    ot_approve: "task.ot.plan"
}

const VERSION_EDIT_SCOPE = {
    all: "all",
    limited: "limited",
    none: "none",
    planApproved: 'baselineApproved'
}

const ProjectUtil = {
    const_priority() {
        return [
            {
                code: 'CRITICAL',
                score: 7,
                color: "#f22515"
            },
            {
                code: 'VERY_HIGH',
                score: 6,
                color: "#f51515"
            },
            {
                code: 'HIGH',
                score: 5,
                color: "#c94831"
            },
            {
                code: 'MEDIUM',
                score: 4,
                color: "#ea821a"
            },
            {
                code: 'LOW',
                score: 3,
                color: "#f8ff76"

            },
            {
                code: 'VERY_LOW',
                score: 2,
                color: "#ffd15e"
            },
            {
                code: 'UNAFFECT',
                score: 1,
                color: "#fdd15e"
            }
        ];
    },

    const_RA() {
        return resourceAction;
    },

    const_STATE() {
        return STATE;
    },

    const_WBS_ACTION() {
        return WBS_ACTION;
    },

    const_WP_STATE() {
        return WP_STATE;
    },

    const_VERSION_EDIT_SCOPE() {
        return VERSION_EDIT_SCOPE;
    },

    const_ENTITY() {
        return ENTITY;
    },

    const_REF_TYPE() {
        return REF_TYPE;
    },

    const_REF_TIME() {
        return REF_TIME;
    },

    const_TIME_UNIT() {
        return TIME_UNIT;
    },

    const_VERSION_TYPE() {
        return VERSION_TYPE;
    },

    const_BUSINESS_WORKFLOW_CODE() {
        return BUSINESS_WORKFLOW_CODE;
    },

    const_TASK_ROOT() {
        return TASK_ROOT;
    },

    checkReadOnlyResourceAllocate(_version,_sumType , _type,_filtering) {
        // if (_filtering) {
        //     return false
        // } else {
        //     if ( _version && _version.state === ProjectUtil.const_STATE().approved && _version.active === false ) {
        //         return false
        //     } else {
        //         if (_type === "all") {
        //             return true
        //         } else if (_sumType === "plan") {
        //             if (_type === "role") {
        //                 return true
        //             }
        //             if (_type === "user") {
        //                 return false
        //             }
        //         } else if (_sumType === "loaded") {
        //             if (_type === "role") {
        //                 return true
        //             }
        //
        //             if (_type === "user") {
        //                 return true
        //             }
        //         }
        //     }
        // }
        if ( _version && _version.state === ProjectUtil.const_STATE().approved && _version.active === false ) {
            return false
        } else {
            if (_type === "all") {
                return true
            } else if (_sumType === "plan") {
                if (_type === "role") {
                    return true
                }
                if (_type === "user") {
                    return false
                }
            } else if (_sumType === "loaded") {
                if (_type === "role") {
                    return true
                }

                if (_type === "user") {
                    return true
                }
            }
        }
    },

    checkVersionEditScope(_version, action) {
        if (!_version) {
            return false;
        }
        if (_version.state === STATE.init && !_version.active) {
            return true;
        }
        if (action === WBS_ACTION.createPhase) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.informationPhase) {
            if (_version.state === STATE.init || _version.active) {
                return true;
            }
        } else if (action === WBS_ACTION.scalePhase) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.deletePhase) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.createWorkpackage) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.informationWorkpackage) {
            if (_version.state === STATE.init || _version.active) {
                return true;
            }
        } else if (action === WBS_ACTION.scaleWorkpackage) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.deleteWorkpackage) {
            if (_version.state === STATE.init) {
                return true;
            }
        } else if (action === WBS_ACTION.createTask) {
            if (_version.state === STATE.init || _version.active) {
                return true;
            }
        }else if (action === WBS_ACTION.copyWorkpackage) {
            return true;
        }else if (action === WBS_ACTION.copyTask) {
            if (_version.active) {
                return true;
            }
        }
        return false;
    },

    per(permission, action, groupId) {
        if(!permission){
            return false;
        }
        if(groupId){
            return permission[action][groupId]
        }
        return (permission[action] || permission['admin'] );
        // return (CommonFunction.per(user, resource, action, groupId) || CommonFunction.per(user, resource, 'ADMIN', groupId));
    },

    perMenu(user, resource, action, groupId) {
        return (CommonFunction.per(user, resource, action, groupId) || CommonFunction.per(user, resource, 'ADMIN', groupId));
    },

    isPM(state) {
        let _found = false;
        if (window.app_context.userRoles) {
            window.app_context.userRoles.forEach(r => {
                if (r.userId === window.app_context.user.id && r.roleName === "PM") {
                    _found = true;
                }
            })
        }
        return _found;
    },

    isDisabledSelectTaskGroup(_task) {
        if (_task.rootType && _.indexOf([TASK_ROOT.workpackage], _task.rootType) > -1) {
            return true;
        }
        return false;
    },

    isVersionBaseline(versionNo) {
        try {
            let _firstLetter = _.split(versionNo, '.')[0];
            let noversion = versionNo.replaceAll('.', '');
            let baselineVersion = _.cloneDeep(_firstLetter);

            for (var i = _firstLetter.length; i < noversion.length; i++) {
                baselineVersion = baselineVersion.concat('0');
            }

            if (baselineVersion === noversion) {
                return true;
            }

        } catch (e) {
            return false;
        }
        return false;
    },

    async buildGanttCalendar(_gantt, ){

    },
    // async setUserPMContext(state, dispatch, groupId) {
    //     let res = await UserRoleService.get({groupId: groupId});
    //     dispatch({type: 'SET_USER_ROLES', payload: res});
    // },

    remapProjectHierarchyWithoutResortRecursive(w, _impactedObject, type) {
        let found = false;
        if (w.projectId && w.projectId > 0 && w.rootId === _impactedObject.rootId) {
            w = _.assignIn(w, _impactedObject)
            found = true;
        }
        if (found) {
            ProjectUtil.removeTaskCanceled(w)
        }
        if (!found && w.children && w.children.length > 0) {
            _.map(w.children, function (subW) {
                ProjectUtil.remapProjectHierarchyWithoutResortRecursive(subW, _impactedObject, type)
            })
        }
    },
    removeTaskCanceled(parent){

        if (parent.tasks && parent.tasks.length > 0) {
            let _cloneTasks = _.cloneDeep(parent.tasks);
            parent.tasks = _.filter(_cloneTasks, function(e){return (e.state !== "CANCELED")})
            _.map(parent.tasks, function (t) {
                ProjectUtil.removeTaskCanceled(t)
            })
        }

        if (parent.workPackages && parent.workPackages.length > 0) {
            _.map(parent.workPackages, function (w) {
                ProjectUtil.removeTaskCanceled(w)
            })
        }

        if (parent.children && parent.children.length > 0) {
            let _cloneChildren = _.cloneDeep(parent.children);
            parent.children = _.filter(_cloneChildren, function(e){return (e.state !== "CANCELED")});
            _.map(parent.children, function (c) {
                ProjectUtil.removeTaskCanceled(c)
            })
        }
    },
    mapStartDateToEndDateForWeek(startDate,endDate) {
        let i = 1;
        let _startDateParent = new Date(startDate);
        let _endDateParent = new Date(endDate);
        let arrWeek = [];
        let startWeek = _startDateParent;
        let endWeek = moment(_startDateParent).endOf('week').toDate();

        // first
        if (new Date(endWeek) > _endDateParent) {
            endWeek = _endDateParent;
        }
        arrWeek.push(
            {
                week: i,
                startDateWeek: startWeek,
                endDateWeek: new Date(new Date(endWeek).setHours(23,59,59,999))
            }
        )

        // continute
        while(_endDateParent > new Date(endWeek)){
            ++i;
            if (startWeek !== null) {
                startWeek = endWeek;
            }

            endWeek = new Date(moment(startWeek).add(7, 'days').toDate());

            if (endWeek > _endDateParent) {
                endWeek = _endDateParent
            }
            arrWeek.push(
                {
                    week: i,
                    startDateWeek: startWeek,
                    endDateWeek: new Date(new Date(endWeek).setHours(23,59,59,999))
                }
            )
        }

        return arrWeek;
    },

    unionWeeksToWeeks(dataWeekProject,dataWeekChild, startDate) {
        // tuần bắt đầu của nhân viên
        let weekStart;
        dataWeekProject.map((week) => {
            if (new Date(week.startDateWeek) <= new Date(startDate)
                && new Date(startDate) <= new Date(week.endDateWeek)) {
                weekStart = week.week
            }
        })
        // map số tuần làm việc của nhân viên
        if (weekStart) {
            dataWeekChild.map(week => {
                week.week = weekStart;
                weekStart++;

            })
        }
    },

    mapWorkingdayStaff(startDateProject,endDateProject,startDateWp,endDateWp,startDateStaffJoin,endDateStaffJoin,percentJoin, _gantt) {
        _gantt = _gantt ? _gantt : _.cloneDeep(window.gantt);
        let dataWeekProject = ProjectUtil.mapStartDateToEndDateForWeek(startDateProject,endDateProject);
        let _startDateWp = _.cloneDeep(startDateWp);
        let _endDateWp = _.cloneDeep(endDateWp);
        let _startDateStaffJoin = _.cloneDeep(startDateStaffJoin);
        let _endDateStaffJoin = _.cloneDeep(endDateStaffJoin);
        // ngày bắt đầu, kêt thúc tham gia dự án phải nằm trong thời gian của gói việc
        if (new Date(_startDateStaffJoin) <  new Date(_startDateWp)) {
            _startDateStaffJoin = new Date(_startDateWp)
        }
        if (new Date(_startDateStaffJoin) >  new Date(_endDateWp)) {
            return dataWeekProject
        }
        if (new Date(_endDateStaffJoin) >  new Date(_endDateWp)) {
            _endDateStaffJoin = new Date(_endDateWp)
        }
        if(new Date(_endDateStaffJoin) < new Date(_startDateWp)) {
            return dataWeekProject
        }
        // tính md của nhân viên
        let dataWeekStaff = ProjectUtil.mapStartDateToEndDateForWeek(_startDateStaffJoin,_endDateStaffJoin);
        dataWeekStaff.map((week) => {
            let _workDays = ((_gantt.calculateDuration(new Date(week.startDateWeek),new Date(week.endDateWeek))/60/8)*percentJoin)/100;
            week.workDays = Number(_workDays.toFixed(2));
        })
        ProjectUtil.unionWeeksToWeeks(dataWeekProject,dataWeekStaff, _startDateStaffJoin);

        // map tuần làm việc của nhân viên vào project
        dataWeekProject.map(weekProject => {
            dataWeekStaff.map(weekStaff => {
                if (weekProject.week === weekStaff.week){
                    weekProject.workDays = weekStaff.workDays
                    weekProject.originWorkDays = weekStaff.workDays
                }
            })
        })

        return dataWeekProject;
    },

    remapProjectHierarchyWithoutResort(_currentProject, _impactedObject, type, setProject) {
        let _project = _.cloneDeep(_currentProject);
        let _impacted = _.cloneDeep(_impactedObject);
        let i = 0;
        _.map(_project.phases, function (p) {
            if (type === ProjectUtil.const_ENTITY().phase && p.rootId === _impactedObject.rootId) {
                p = _.assignIn(p, _impactedObject);
                ProjectUtil.removeTaskCanceled(p);
            }
            if (type === ProjectUtil.const_ENTITY().workpackage) {
                _.map(p.workPackages, function (w) {
                    ProjectUtil.remapProjectHierarchyWithoutResortRecursive(w, _impactedObject, type)
                })
            }
        });
        _project = CommonFunction.buildObjectPath(_project);
        ProjectUtil.buildProcessing(_project);
        if (setProject) {
            setProject(_project)
        }
        return [_project, _impacted];
    },

    async rebuildProjectTree(_workpackage, project, setProject) {
        if (_workpackage.parentId && _workpackage.parentId > 0) {
            let res = await WorkPackageService.getById(_workpackage.parentId)
            return ProjectUtil.remapProjectHierarchyWithoutResort
            (project, res, ProjectUtil.const_ENTITY().workpackage, setProject   );

        } else if (_workpackage.phaseId && _workpackage.phaseId > 0) {
            let res = await PhaseService.getById(_workpackage.phaseId)
            return ProjectUtil.remapProjectHierarchyWithoutResort
            (project, res, ProjectUtil.const_ENTITY().phase, setProject);

        }
    },

    async rebuildProjectTreeByVersion(_workpackage, project, setProject,versionId) {
        if(_workpackage && _workpackage.phase && versionId){
            let _phase = await ProjectService.getPhaseByIdKeyAndVersion(_workpackage.phase.rootId,versionId)
            return ProjectUtil.remapProjectHierarchyWithoutResort(project, _phase, ProjectUtil.const_ENTITY().phase, setProject);
        } else {
            return [project,null]
        }
    },

    rebuildProjectHierarchy(_currentProject, _impactedObject, _parentPath, _currentPath) {
        let _project = _.cloneDeep(_currentProject);
        let _impacted = _.cloneDeep(_impactedObject);
        let mode = _currentPath ? 'EDIT' : 'CREATE';
        let _parent;
        if (_parentPath.length === 0) {
            _parent = _.cloneDeep(_project);
            _parent._type = "PROJECT";
        } else {
            _parent = CommonFunction.getValueByPath(_project, _parentPath)
        }
        if (_impacted.type && _impacted.type === 'TASK') {
            _impacted.isTask = true;
        }
        if (_parent.type && _parent.type === 'TASK') { // parent = task
            _parent._type = 'TASK'
        } else if (_parent.phaseId) { // parent = workpackage
            _parent._type = 'WORK_PACKAGE'
        } else if (_parent.projectId) { // parent = phase
            _parent._type = 'PHASE'
        }
        if (_parent) {
            if (mode === "CREATE") {
                if (_parent._type === 'WORK_PACKAGE') { // parent = workpackage
                    if (_impacted.isTask) {
                        _parent.tasks = [..._parent.tasks, {..._impacted}];
                    } else {
                        _parent.children = _parent.children ? [..._parent.children, {..._impacted}] : [{..._impacted}];
                    }
                } else if (_parent._type === 'PHASE') { // parent = phase
                    _parent.workPackages = [..._parent.workPackages, {..._impacted}];
                } else if (_parent._type === 'TASK') { // parent = task
                    _parent.children = _parent.children ? [..._parent.children, {..._impacted}] : [{..._impacted}];
                } else if (_parent._type === 'PROJECT') { // parent = project
                    _parent.phases = [..._parent.phases, {..._impacted}];
                }
                if(_parent._type !== "PROJECT") {
                    CommonFunction.setValueByPath(_project, _parentPath, _parent);
                } else {
                    _project = _parent
                }
            } else if (mode === "EDIT") {
                CommonFunction.setValueByPath(_project, _currentPath, _impacted);
            }

            CommonFunction.buildObjectPath(_project);

            let _children = []
            if (_parent._type === 'WORK_PACKAGE') { // parent = workpackage
                if (_impacted.isTask) {
                    _children = _parent.tasks;
                    _impacted = _.find(_children, {'id': _impacted.id, 'rootKey': String(_parent.id)});
                } else {
                    _children = _parent.children;
                    _impacted = _.find(_children, {'id': _impacted.id, 'parentId': _parent.id});
                }
            } else if (_parent._type === 'PHASE') { // parent = phase
                _children = _parent.workPackages;
                _impacted = _.find(_children, {'id': _impacted.id, 'phaseId': _parent.id});
            } else if (_parent._type === 'TASK') { // parent = task
                _children = _parent.children;
                _impacted = _.find(_children, {'id': _impacted.id, 'parentId': _parent.id});
            } else if (_parent._type === 'PROJECT') { // parent = project
                _children = _parent.phases;
                _impacted = _.find(_children, {'id': _impacted.id, 'parentId': _parent.id});
            }
        }

        return [_project, _impacted];
    },

    endDateValidate(obj) {
        if (obj.endDate == null) {
            return `${t('common.enddate')} ${t('message.cant-be-empty')}`;
        } else if (obj.startDate &&  obj.endDate && new Date(obj.endDate) < new Date(obj.startDate)) {
            return `${t('common.enddate')} ${t('message.cant-be-before-start-date')}`;
        } else {
            return null;
        }
    },

    startDateValidate(obj) {
        if (obj.startDate == null) {
            return `${t('common.startdate')} ${t('message.cant-be-empty')}`;
        } else if (obj.startDate && obj.endDate && new Date(obj.startDate) > new Date(obj.endDate)) {
            return `${t('common.startdate')} ${t('message.cant-be-after-end-date')}`;
        } else {
            return null;
        }
    },

    dateValidate(child, parent, prop) {
        let message;

        switch (prop) {
            case 'startDate':
                if (!child[prop]) {
                    message = `${t('common.start-date')} ${t('message.cant-be-empty')}`;
                } else if (new Date(child.endDate) && new Date(child[prop]) > new Date(child.endDate)) {
                    message = `${t('common.start-date')} ${t('message.cant-be-after-end-date')}`;
                } else if (new Date(child[prop]) < new Date(parent[prop])) {
                    message = `${t('common.start-date')} ${t('message.date.must-be-after-or-equal')} ${CommonFunction.formatDate(parent.startDate, 'DD/MM/YYYY')}`;
                } else {
                    message = null;
                }
                break;
            case 'endDate':
                if (!child[prop]) {
                    message = `${t('common.end-date')} ${t('message.cant-be-empty')}`;
                } else if (new Date(child.startDate) && new Date(child[prop]) < new Date(child.startDate)) {
                    message = `${t('common.end-date')} ${t('message.cant-be-before-start-date')}`;
                } else if (new Date(child[prop]) > new Date(parent[prop])) {
                    message = `${t('common.end-date')} ${t('message.date.must-be-before-or-equal')} ${CommonFunction.formatDate(parent.endDate, 'DD/MM/YYYY')}`;
                } else {
                    message = null;
                }
                break;
            default:
                break;
        }

        return message;
    },

    setProcessingRecursive(parent, _donePercent) {
        if (parent.tasks && parent.tasks.length > 0) {
            let _cloneTasks = _.cloneDeep(parent.tasks);
            parent.tasks = _.filter(_cloneTasks,function(t){return (t.state !== TaskUtil.S().CANCELED)});
            parent.tasks = _.orderBy(parent.tasks, 'priority');
            _.map(parent.tasks, function (t) {
                t.countDonePercent = _donePercent;
                ProjectUtil.setProcessingRecursive(t, _donePercent)
            })
        }

        if (parent.workPackages && parent.workPackages.length > 0) {
            parent.workPackages = _.orderBy(parent.workPackages, 'priority');
            _.map(parent.workPackages, function (w) {
                w.countDonePercent = _donePercent
                ProjectUtil.setProcessingRecursive(w, _donePercent)
            })
        }

        if (parent.children && parent.children.length > 0) {
            parent.children = _.orderBy(parent.children, 'priority');
            let _cloneChildren = _.cloneDeep(parent.children);
            parent.children = _.filter(_cloneChildren,function(t){return (t.state !== TaskUtil.S().CANCELED)});
            _.map(parent.children, function (c) {
                c.countDonePercent = _donePercent
                ProjectUtil.setProcessingRecursive(c, _donePercent)
            })
        }
    },

    buildWorkTime(parent, _gantt) {
        if(parent && parent.tasks && parent.tasks.length > 0 ) {
            let _cloneTasks = _.cloneDeep(parent.tasks);
            parent.tasks = _.filter(_cloneTasks,function(t){return (t.state !== TaskUtil.S().CANCELED)});
            parent.tasks = _.orderBy(parent.tasks, 'priority');
        }
        if(parent && parent.children && parent.children.length > 0 ) {
            let _cloneChildren = _.cloneDeep(parent.children);
            parent.children = _.filter(_cloneChildren,function(t){return (t.state !== TaskUtil.S().CANCELED)});
        }
        let _brotherCount = (parent.workPackages ? parent.workPackages.length : 0)
            + (parent.tasks ? parent.tasks.length : 0)
            + (parent.children ? parent.children.length : 0);
        let countWorkHourNeed = 0;
        let countHourWorklog = 0;
        let actualStartDate = null;
        let actualEndDate = null;

        if (_brotherCount === 0) {
            if (parent.type === "TASK") {
                // có nhập giờ làm yeu cầu

                // let _workHour = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "so_gio_lam_yeu_cau");
                let _workHour = parent.requireWorkHour
                if (_workHour && Number(_workHour) > 0) {
                    countWorkHourNeed = Number(_workHour);
                } else if(parent.startDate && parent.deadline && _gantt) {
                    countWorkHourNeed = (_gantt.calculateDuration(new Date(parent.startDate), new Date(parent.deadline))) / 60;
                }

                // giờ làm việc thực tế
                countHourWorklog = parent.totalHourWorklog;
                // có nhập ngày bắt đầu và kết thúc thực tế
                // let _actualStartDate = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "bat_dau_lam_thuc_te");
                // let _actualEndDate = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "ket_thuc_thuc_te");
                let _actualStartDate = parent.realStartDate
                let _actualEndDate = parent.realEndDate
                if (_actualStartDate != null) {
                    actualStartDate = _actualStartDate;
                } else {
                    actualStartDate = null;
                }
                if (_actualEndDate != null) {
                    actualEndDate = _actualEndDate;
                } else {
                    actualEndDate = null;
                }

            } else {
                let startDate = new Date(parent.startDate);
                let endDate = new Date(parent.endDate);
                if (_gantt && startDate && endDate) {
                    countWorkHourNeed = (_gantt.calculateDuration(startDate, endDate)) / 60;
                } else {
                    countWorkHourNeed = 0;
                }
                countHourWorklog = 0;
                actualStartDate = null;
                actualEndDate = null;
            }
        } else {
            if (parent.type === "TASK") {
                let _workHour = parent.requireWorkHour
                if (_workHour && Number(_workHour) > 0) {
                    countWorkHourNeed = Number(_workHour);
                } else if(parent.startDate && parent.deadline && _gantt) {
                    countWorkHourNeed = (_gantt.calculateDuration(new Date(parent.startDate), new Date(parent.deadline))) / 60;
                }

                // giờ làm việc thực tế
                countHourWorklog = parent.totalHourWorklog;
                // có nhập ngày bắt đầu và kết thúc thực tế
                let _actualStartDate = parent.realStartDate
                let _actualEndDate = parent.realEndDate
                if (_actualStartDate != null) {
                    actualStartDate = _actualStartDate;
                } else {
                    actualStartDate = null;
                }
                if (_actualEndDate != null) {
                    actualEndDate = _actualEndDate;
                } else {
                    actualEndDate = null;
                }
            }
            if (parent.tasks && parent.tasks.length > 0) {
                _.map(parent.tasks, function (t) {
                    ProjectUtil.buildWorkTime(t, _gantt);
                    countWorkHourNeed += t.countWorkHourNeed;
                    countHourWorklog += t.countHourWorklog;
                    if (t.actualStartDate !== null) {
                        if (actualStartDate !== null) {
                            if (new Date(t.actualStartDate) < new Date(actualStartDate)) {
                                actualStartDate = t.actualStartDate;
                            }
                        } else {
                            actualStartDate = t.actualStartDate;
                        }
                    }
                    if (t.actualEndDate !== null) {
                        if (actualEndDate !== null) {
                            if (new Date(t.actualEndDate) > new Date(actualEndDate)) {
                                actualEndDate = t.actualEndDate;
                            }
                        } else {
                            actualEndDate = t.actualEndDate;
                        }
                    }
                })
            }

            if (parent.workPackages && parent.workPackages.length > 0) {
                _.map(parent.workPackages, function (w) {
                    ProjectUtil.buildWorkTime(w, _gantt)
                    countWorkHourNeed += w.countWorkHourNeed;
                    countHourWorklog += w.countHourWorklog;
                    if (w.actualStartDate !== null) {
                        if (actualStartDate !== null) {
                            if (new Date(w.actualStartDate) < new Date(actualStartDate)) {
                                actualStartDate = w.actualStartDate;
                            }
                        } else {
                            actualStartDate = w.actualStartDate;
                        }
                    }
                    if (w.actualEndDate !== null) {
                        if (actualEndDate !== null) {
                            if (new Date(w.actualEndDate) > new Date(actualEndDate)) {
                                actualEndDate = w.actualEndDate;
                            }
                        } else {
                            actualEndDate = w.actualEndDate;
                        }
                    }
                })
            }

            if (parent.children && parent.children.length > 0) {
                if (parent.type === "TASK" ) {
                    _.map(parent.children, function (c) {
                        ProjectUtil.buildWorkTime(c, _gantt);
                        if (c.actualStartDate !== null) {
                            if (actualStartDate !== null) {
                                if (new Date(c.actualStartDate) < new Date(actualStartDate)) {
                                    actualStartDate = c.actualStartDate;
                                }
                            } else {
                                actualStartDate = c.actualStartDate;
                            }
                        }
                        if (c.actualEndDate !== null) {
                            if (actualEndDate !== null) {
                                if (new Date(c.actualEndDate) > new Date(actualEndDate)) {
                                    actualEndDate = c.actualEndDate;
                                }
                            } else {
                                actualEndDate = c.actualEndDate;
                            }
                        }
                        countHourWorklog += c.countHourWorklog
                    })
                } else {
                    _.map(parent.children, function (c) {
                        ProjectUtil.buildWorkTime(c, _gantt)
                        countWorkHourNeed += c.countWorkHourNeed;
                        countHourWorklog += c.countHourWorklog;
                        if (c.actualStartDate !== null) {
                            if (actualStartDate !== null) {
                                if (new Date(c.actualStartDate) < new Date(actualStartDate)) {
                                    actualStartDate = c.actualStartDate;
                                }
                            } else {
                                actualStartDate = c.actualStartDate;
                            }
                        }
                        if (c.actualEndDate !== null) {
                            if (actualEndDate !== null) {
                                if (new Date(c.actualEndDate) > new Date(actualEndDate)) {
                                    actualEndDate = c.actualEndDate;
                                }
                            } else {
                                actualEndDate = c.actualEndDate;
                            }
                        }
                    })
                }
            }
        }
        if(parent.type !== "TASK" && parent.state !== TaskUtil.S().DONE){
            actualEndDate = null
        } else {
            if(parent.closeDate) {
                if(actualEndDate){
                    if (new Date(parent.closeDate) > new Date(actualEndDate)) {
                        actualEndDate = parent.closeDate;
                    }
                } else {
                    actualEndDate = parent.closeDate;
                }
            }
        }
        parent.countWorkHourNeed = countWorkHourNeed;
        parent.countHourWorklog = countHourWorklog;
        parent.actualStartDate = actualStartDate;
        parent.actualEndDate = actualEndDate;
    },

    buildProcessingRecursive(parent, _gantt) {
        if(parent && parent.tasks && parent.tasks.length > 0 ) {
            let _cloneTasks = _.cloneDeep(parent.tasks);
            parent.tasks = _.filter(_cloneTasks,function(t){return (t.state !== TaskUtil.S().CANCELED)});
            parent.tasks = _.orderBy(parent.tasks, 'priority');
        }
        if(parent && parent.children && parent.children.length > 0 ) {
            let _cloneChildren = _.cloneDeep(parent.children);
            parent.children = _.orderBy(parent.children, 'priority');

            parent.children = _.filter(_cloneChildren,function(t){return (t.state !== TaskUtil.S().CANCELED)});
        }
        if(parent && parent.workPackages && parent.workPackages.length > 0 ) {
            parent.workPackages = _.orderBy(parent.workPackages, 'priority');
        }
        let _brotherCount = (parent.workPackages ? parent.workPackages.length : 0)
            + (parent.tasks ? parent.tasks.length : 0)
            + (parent.children ? parent.children.length : 0);
        if (_brotherCount === 0) {
            if (parent.state === TaskUtil.S().DONE || parent.state === TaskUtil.S().COMPLETED) {
                parent.countDonePercent = 100;
            } else {
                if (parent.type === "TASK") {
                    let _doneTaskPercent = 0;

                    // let _percent = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "phan_tram_hoan_thanh");
                    let _percent = parent.donePercent
                    if (_percent != null) {
                        _doneTaskPercent = Number(_percent);
                    } else {
                        _doneTaskPercent = 0;
                    }
                    parent.countDonePercent = _doneTaskPercent;
                } else {
                    parent.countDonePercent = 0
                }
            }
            // ngày bắt đầu và kết thúc theo thực tế
            if (parent.type === "TASK") {
                // let _actualStartDate = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "bat_dau_lam_thuc_te");
                // let _actualEndDate = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "ket_thuc_thuc_te");
                let _actualStartDate = parent.realStartDate
                let _actualEndDate = parent.realEndDate
                if (_actualStartDate != null) {
                    parent.actualStartDate = _actualStartDate;
                } else {
                    parent.actualStartDate = null;
                }

                if (_actualEndDate != null) {
                    parent.actualEndDate = _actualEndDate;
                } else {
                    parent.actualEndDate = null;
                }

            }
            // số giờ làm việc theo plan và thực tế
            if (parent.type === "TASK") {
                let _countWorkHourNeed = 0;
                // let _workHour = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "so_gio_lam_yeu_cau");
                let _workHour = parent.requireWorkHour
                if (_workHour && Number(_workHour) > 0) {
                    _countWorkHourNeed = Number(_workHour);
                } else if(parent.startDate && parent.deadline && _gantt) {
                    _countWorkHourNeed = (_gantt.calculateDuration(new Date(parent.startDate), new Date(parent.deadline))) / 60;
                }
                parent.countHourWorklog = parent.totalHourWorklog;
                parent.countWorkHourNeed = _countWorkHourNeed
            } else {
                let startDate = new Date(parent.startDate);
                let endDate = new Date(parent.endDate);
                if (_gantt && startDate && endDate && _gantt) {
                    parent.countWorkHourNeed = (_gantt.calculateDuration(startDate, endDate)) / 60;
                } else {
                    parent.countWorkHourNeed = 0;
                }
                parent.countHourWorklog = 0;
            }
            return parent.countDonePercent;
        } else {
            if (parent.state === TaskUtil.S().DONE || parent.state === TaskUtil.S().COMPLETED) {
                parent.countPendPercent = 0;
                parent.countDonePercent = 100;
                ProjectUtil.setProcessingRecursive(parent, 100);
                ProjectUtil.buildWorkTime(parent, _gantt);
                return parent.countDonePercent;
            }

            let _doneWorkpackages = [];
            if (parent.workPackages && parent.workPackages.length > 0) {
                for (let i = 0; i < parent.workPackages.length; i++) {
                    if (parent.workPackages[i] && parent.workPackages[i].state === TaskUtil.S().DONE) {
                        parent.workPackages[i].countDonePercent = 100
                        _doneWorkpackages.push(parent.workPackages[i]);
                    }
                }
            }
            let _doneChildren = [];
            if (parent.children && parent.children.length > 0) {
                for (let i = 0; i < parent.children.length; i++) {
                    if (parent.children[i] && (parent.children[i].state === TaskUtil.S().DONE
                        || parent.children[i].state === TaskUtil.S().COMPLETED)) {
                        parent.children[i].countDonePercent = 100
                        _doneChildren.push(parent.children[i]);
                    }
                }
            }
            let _doneTasks = [];
            if (parent.tasks && parent.tasks.length > 0) {
                for (let i = 0; i < parent.tasks.length; i++) {
                    if (parent.tasks[i] && parent.tasks[i].state === TaskUtil.S().COMPLETED) {
                        parent.tasks[i].countDonePercent = 100
                        _doneTasks.push(parent.tasks[i]);
                    }
                }
            }
            let _done = _doneWorkpackages.length + _doneTasks.length + _doneChildren.length;

            if (_done === _brotherCount) {
                parent.countPendPercent = 0;
                parent.countDonePercent = 100;
                ProjectUtil.setProcessingRecursive(parent, 100);
                ProjectUtil.buildWorkTime(parent,_gantt);
                return 100;
            }

            let _doneInBrother = 0;
            let _workHourNeed = 0;
            let _worklog = 0;
            let _actualEndDate = null;
            let _actualStartDate = null;
            if (parent.type === "TASK" && parent.totalHourWorklog !== undefined) {
                _worklog += parent.totalHourWorklog;
            }
            if (parent.workPackages && parent.workPackages.length > 0) {
                parent.workPackages.map(w => {
                    let _doneChildPercentW = ProjectUtil.buildProcessingRecursive(w, _gantt)
                    _doneChildPercentW = w.state !== TaskUtil.S().DONE
                        ? _doneChildPercentW : 0
                    _doneChildPercentW = (1 / _brotherCount) * _doneChildPercentW
                    w.doneInBrother = _doneChildPercentW;
                    _doneInBrother = _doneInBrother + _doneChildPercentW;
                    _workHourNeed += w.countWorkHourNeed;
                    _worklog += w.countHourWorklog;
                    if (w.actualStartDate !== null) {
                        if (_actualStartDate !== null) {
                            if (new Date(w.actualStartDate) < new Date(_actualStartDate)) {
                                _actualStartDate = w.actualStartDate;
                            }
                        } else {
                            _actualStartDate = w.actualStartDate;
                        }
                    }
                    if (w.actualEndDate !== null) {
                        if (_actualEndDate !== null) {
                            if (new Date(w.actualEndDate) > new Date(_actualEndDate)) {
                                _actualEndDate = w.actualEndDate;
                            }
                        } else {
                            _actualEndDate = w.actualEndDate;
                        }
                    }
                })
            }
            if (parent.children && parent.children.length > 0) {
                if(parent.type === "TASK") {
                    parent.children.map(c => {
                        ProjectUtil.buildProcessingRecursive(c, _gantt); 
                        _worklog += c.countHourWorklog
                    })
                    if (parent.state === TaskUtil.S().DONE || parent.state === TaskUtil.S().COMPLETED) {
                        parent.countDonePercent = 100;
                    } else {
                        let _doneTaskPercent = 0;

                        // let _percent = TaskUtil.getTaskCustomValue(parent.outputFieldValues, "phan_tram_hoan_thanh");
                        let _percent = parent.donePercent
                        if (_percent != null) {
                            _doneTaskPercent = Number(_percent);
                        } else {
                            _doneTaskPercent = 0;
                        }
                        parent.countDonePercent = _doneTaskPercent;
                    }
                    // ngày bắt đầu và kết thúc theo thực tế

                    let _actualStartDate = parent.realStartDate
                    let _actualEndDate = parent.realEndDate
                    if (_actualStartDate != null) {
                        parent.actualStartDate = _actualStartDate;
                    } else {
                        parent.actualStartDate = null;
                    }

                    if (_actualEndDate != null) {
                        parent.actualEndDate = _actualEndDate;
                    } else {
                        parent.actualEndDate = null;
                    }
                    // số giờ làm việc theo plan và thực tế
                    let _countWorkHourNeed = 0;
                    let _workHour = parent.requireWorkHour
                    if (_workHour && Number(_workHour) > 0) {
                        _countWorkHourNeed = Number(_workHour);
                    } else if(parent.startDate && parent.deadline && _gantt) {
                        _countWorkHourNeed =  (_gantt.calculateDuration(new Date(parent.startDate), new Date(parent.deadline))) / 60;
                    }
                    parent.countHourWorklog = _worklog;
                    parent.countWorkHourNeed = _countWorkHourNeed
                    return parent.countDonePercent;
                } else {
                    parent.children.map(c => {
                        let _doneChildPercentW = ProjectUtil.buildProcessingRecursive(c, _gantt)
                        _doneChildPercentW = (c.state !== TaskUtil.S().DONE && c.state !== TaskUtil.S().COMPLETED)
                            ? _doneChildPercentW : 0
                        _doneChildPercentW = (1 / _brotherCount) * _doneChildPercentW
                        c.doneInBrother = _doneChildPercentW;
                        _doneInBrother = _doneInBrother + _doneChildPercentW;
                        _workHourNeed += c.countWorkHourNeed;
                        _worklog += c.countHourWorklog;
                        if (c.actualStartDate !== null) {
                            if (_actualStartDate !== null) {
                                if (new Date(c.actualStartDate) < new Date(_actualStartDate)) {
                                    _actualStartDate = c.actualStartDate;
                                }
                            } else {
                                _actualStartDate = c.actualStartDate;
                            }
                        }
                        if (c.actualEndDate !== null) {
                            if (_actualEndDate !== null) {
                                if (new Date(c.actualEndDate) > new Date(_actualEndDate)) {
                                    _actualEndDate = c.actualEndDate;
                                }
                            } else {
                                _actualEndDate = c.actualEndDate;
                            }
                        }
                    })
                }
            }
            if (parent.tasks && parent.tasks.length > 0) {
                parent.tasks.map(t => {
                    let _doneChildPercentW = ProjectUtil.buildProcessingRecursive(t, _gantt)
                    _doneChildPercentW = (t.state !== TaskUtil.S().COMPLETED) ? _doneChildPercentW : 0;
                    _doneChildPercentW = (1 / _brotherCount) * _doneChildPercentW
                    t.doneInBrother = _doneChildPercentW;
                    _doneInBrother = _doneInBrother + _doneChildPercentW;
                    _workHourNeed += t.countWorkHourNeed;
                    _worklog += t.countHourWorklog;
                    if (t.actualStartDate !== null) {
                        if (_actualStartDate !== null) {
                            if (new Date(t.actualStartDate) < new Date(_actualStartDate)) {
                                _actualStartDate = t.actualStartDate;
                            }
                        } else {
                            _actualStartDate = t.actualStartDate;
                        }
                    }
                    if (t.actualEndDate !== null) {
                        if (_actualEndDate !== null) {
                            if (new Date(t.actualEndDate) > new Date(_actualEndDate)) {
                                _actualEndDate = t.actualEndDate;
                            }
                        } else {
                            _actualEndDate = t.actualEndDate;
                        }
                    }
                })
            }
            if(parent.type !== "TASK"  && parent.state !== TaskUtil.S().DONE){
                _actualEndDate = null
            } else {
                if(parent.closeDate) {
                    if(_actualEndDate){
                        if (new Date(parent.closeDate) > new Date(_actualEndDate)) {
                            _actualEndDate = parent.closeDate;
                        }
                    } else {
                        _actualEndDate = parent.closeDate;
                    }
                }
            }

            let _pend = ((_brotherCount - _done) / _brotherCount) * 100;
            let _donePercent = (_done / _brotherCount) * 100 + _doneInBrother;
            parent.countPendPercent = _pend;
            parent.countDonePercent = _donePercent;
            parent.countWorkHourNeed = _workHourNeed;
            parent.countHourWorklog = _worklog;
            parent.actualEndDate = _actualEndDate;
            parent.actualStartDate = _actualStartDate;
            return _donePercent;
        }
    },


    buildProcessing(_project,_currentGantt) {
        let _gantt = _currentGantt ? _currentGantt : _.cloneDeep(window.gantt);
        let _phases = _project.phases;
        let percentProject = 0;
        let countWorkHourNeed = 0;
        let countHourWorklog = 0;
        let actualStartDate = null;
        let actualEndDate = null;
        let startDate = new Date(_project.startDate);
        let endDate = new Date(_project.endDate);
        let allPhaseHasCompleted = true;
        if (_phases.length === 0 && _gantt && startDate && endDate) {
            countWorkHourNeed = (_gantt.calculateDuration(startDate, endDate)) / 60;
        } else {
            _phases.map(p => {
                ProjectUtil.buildProcessingRecursive(p, _gantt);
                countWorkHourNeed += p.countWorkHourNeed;
                countHourWorklog += p.countHourWorklog;
                percentProject += (1 / _phases.length) * p.countDonePercent;
                if (p.actualStartDate !== null) {
                    if (actualStartDate !== null) {
                        if (new Date(p.actualStartDate) < new Date(actualStartDate)) {
                            actualStartDate = p.actualStartDate;
                        }
                    } else {
                        actualStartDate = p.actualStartDate;
                    }
                }
                if (p.actualEndDate !== null && p.actualEndDate !== undefined) {
                    if (actualEndDate !== null) {
                        if (new Date(p.actualEndDate) > new Date(actualEndDate)) {
                            actualEndDate = p.actualEndDate;
                        }
                    } else {
                        actualEndDate = p.actualEndDate;
                    }
                } else {
                    allPhaseHasCompleted = false;
                }
            });
        }

        _project.countDonePercent = percentProject;
        _project.countWorkHourNeed = countWorkHourNeed;
        _project.countHourWorklog = countHourWorklog;
        _project.actualStartDate = actualStartDate;
        _project.actualEndDate = allPhaseHasCompleted ? actualEndDate : null;
    },

    buildResourceWeeksWorkpackage(_project,_workpackage,levelWpAllocate,level,_gantt) {
        if(_workpackage.children && _workpackage.children.length > 0 && (level < levelWpAllocate)) {
            _workpackage.roles = []

            _workpackage.children.map(function(_wpChildren){
                ProjectUtil.buildResourceWeeksWorkpackage(_project,_wpChildren,levelWpAllocate,++level,_gantt);
            })

            _workpackage._id = _workpackage._id ? _workpackage._id : CommonFunction.getIdNumber();
            let _workNumberWeek = [];
            _project.numberWeeks.map(function(workWeek, workIndex){
                _workNumberWeek.push({
                    week: workWeek.week,
                    workDays: _.sumBy(_workpackage.children, function(workPackageRole){
                        if(workPackageRole.numberWeeks && workPackageRole.numberWeeks[workIndex] && workPackageRole.numberWeeks[workIndex].week === workWeek.week){
                            return  workPackageRole.numberWeeks[workIndex].workDays ? workPackageRole.numberWeeks[workIndex].workDays : 0
                        }
                    }),
                    startDateWeek: workWeek.startDateWeek,
                    endDateWeek: workWeek.endDateWeek
                })
            })
            _workpackage.numberWeeks = _workNumberWeek;
        } else {
            _workpackage.children = []
            if(_workpackage.roles && _workpackage.roles.length > 0){
                _workpackage.roles.map(function (r){
                    r._id = r._id ? r._id : CommonFunction.getIdNumber();
                    r.numberWeeks = ProjectUtil.mapWorkingdayStaff
                                        (_project.startDate,_project.endDate
                                            , _workpackage.startDate,_workpackage.endDate
                                            , r.startDate, r.endDate, r.percent,_gantt)
                })

                _workpackage._id = _workpackage._id ? _workpackage._id : CommonFunction.getIdNumber();
                let _workNumberWeek = [];
                _project.numberWeeks.map(function(workWeek, workIndex){
                    _workNumberWeek.push({
                        week: workWeek.week,
                        workDays: _.sumBy(_workpackage.roles, function(workPackageRole){
                            if(workPackageRole.numberWeeks && workPackageRole.numberWeeks[workIndex] && workPackageRole.numberWeeks[workIndex].week === workWeek.week){
                                return  workPackageRole.numberWeeks[workIndex].workDays ? workPackageRole.numberWeeks[workIndex].workDays : 0
                            }
                        }),
                        startDateWeek: workWeek.startDateWeek,
                        endDateWeek: workWeek.endDateWeek
                    })
                })
                _workpackage.numberWeeks = _workNumberWeek;
            } else {
                let dataWeekProject = ProjectUtil.mapStartDateToEndDateForWeek(_project.startDate,_project.endDate);
                _workpackage.numberWeeks = dataWeekProject;
            }
        }

    },

    buildResourceWeeks(_project,levelWpAllocate,_gantt) {
        _project.numberWeeks = ProjectUtil.mapStartDateToEndDateForWeek(_project.startDate, _project.endDate);
        _project.phases.map(function(p){
            p._id = p._id ? p._id : CommonFunction.getIdNumber();
            if(levelWpAllocate > 0 && p.workPackages && p.workPackages.length > 0){
                p.roles = []
                p.workPackages.map((w) => {
                    ProjectUtil.buildResourceWeeksWorkpackage(_project,w,levelWpAllocate,1,_gantt);
                })
                let _phaseNumberWeek = [];
                _project.numberWeeks.map(function(phaseWeek, phaseIndex){
                    _phaseNumberWeek.push({
                        week: phaseWeek.week,
                        workDays: _.sumBy(p.workPackages, function(wp){
                            if(wp.numberWeeks && wp.numberWeeks[phaseIndex] && wp.numberWeeks[phaseIndex].week === phaseWeek.week){
                                return  wp.numberWeeks[phaseIndex].workDays ? wp.numberWeeks[phaseIndex].workDays : 0
                            }
                        }),

                        startDateWeek: phaseWeek.startDateWeek,
                        endDateWeek: phaseWeek.endDateWeek
                    })
                })
                p.numberWeeks = _phaseNumberWeek;
            } else if(p.roles && p.roles.length > 0) {
                p.workPackages = []

                p.roles.map(function (r){
                    r._id = r._id ? r._id : CommonFunction.getIdNumber();
                    r.numberWeeks = ProjectUtil.mapWorkingdayStaff
                                        (_project.startDate,_project.endDate
                                            , p.startDate,p.endDate
                                            , r.startDate, r.endDate, r.percent,_gantt)
                })

                p._id = p._id ? p._id : CommonFunction.getIdNumber();
                let _workNumberWeek = [];
                _project.numberWeeks.map(function(workWeek, workIndex){
                    _workNumberWeek.push({
                        week: workWeek.week,
                        workDays: _.sumBy(p.roles, function(workPackageRole){
                            if(workPackageRole.numberWeeks && workPackageRole.numberWeeks[workIndex] && workPackageRole.numberWeeks[workIndex].week === workWeek.week){
                                return  workPackageRole.numberWeeks[workIndex].workDays ? workPackageRole.numberWeeks[workIndex].workDays : 0
                            }
                        }),
                        startDateWeek: workWeek.startDateWeek,
                        endDateWeek: workWeek.endDateWeek
                    })
                })
                p.numberWeeks = _workNumberWeek;
            } else {
                p.workPackages = [];
                p.roles = [];
                let dataWeekProject = ProjectUtil.mapStartDateToEndDateForWeek(_project.startDate,_project.endDate);
                p.numberWeeks = dataWeekProject;
            }


        })

        let _projectNumberWeek = [];
        _project.numberWeeks.map(function(projectWeek, index){
            _projectNumberWeek.push({
                week: projectWeek.week,
                workDays: _.sumBy(_project.phases, function(phaseWorkPackage){
                    if(phaseWorkPackage.numberWeeks && phaseWorkPackage.numberWeeks[index] && phaseWorkPackage.numberWeeks[index].week === projectWeek.week){
                        return  phaseWorkPackage.numberWeeks[index].workDays ? phaseWorkPackage.numberWeeks[index].workDays : 0
                    }
                }),
                startDateWeek: projectWeek.startDateWeek,
                endDateWeek: projectWeek.endDateWeek
            })
        })
        _project.numberWeeks = _projectNumberWeek;
    },

    buildResourceHour(_project) {
        if(_project.phases && _project.phases.length > 0) {
            _project.phases.map( (phase) => {
                if(phase.workPackages && phase.workPackages.length>0) {
                    phase.workPackages.map((workPackage) => {
                        if(workPackage.roles && workPackage.roles.length > 0 ) {
                            workPackage.roles.map((role) => {
                                if(role.workDates && role.workDates.length > 0) {
                                    role.workDates.map((workDate) => {
                                        workDate.otHour = workDate.otHour?Number(workDate.otHour.toFixed(2)):0;
                                        workDate.workHour = workDate.workHour?Number(workDate.workHour.toFixed(2)):0;
                                        workDate.totalHour =  workDate.otHour +  workDate.workHour
                                    })
                                    role.otHour = _.sumBy(role.workDates,"otHour");
                                    role.workHour = _.sumBy(role.workDates,"workHour");
                                    role.totalHour = role.otHour + role.workHour;
                                }else {
                                    role.otHour = 0.0;
                                    role.workHour = 0.0;
                                    role.totalHour = 0.0;
                                }
                            })
                            workPackage.otHour = _.sumBy(workPackage.roles,"otHour");
                            workPackage.workHour = _.sumBy(workPackage.roles,"workHour");
                            workPackage.totalHour = workPackage.otHour + workPackage.workHour;
                        } else {
                            workPackage.otHour = 0.0;
                            workPackage.workHour = 0.0;
                            workPackage.totalHour = 0.0;
                        }
                    })
                    phase.otHour = _.sumBy(phase.workPackages,"otHour");
                    phase.workHour = _.sumBy(phase.workPackages,"workHour");
                    phase.totalHour = phase.otHour + phase.workHour;
                } else {
                    phase.otHour = 0.0;
                    phase.workHour = 0.0;
                    phase.totalHour = 0.0;
                }
            })
            _project.otHour = _.sumBy(_project.phases,"otHour");
            _project.workHour = _.sumBy(_project.phases,"workHour");
            _project.totalHour = _project.otHour + _project.workHour;
        } else {
            _project.otHour = 0.0;
            _project.workHour = 0.0;
            _project.totalHour = 0.0;
        }
    },

    findWorkPackageRecursive(_data, _workPackages, _lazy) {
        _workPackages.map(wp => {
            _data.push(wp);
            if (wp.children && wp.children.length > 0) {
                ProjectUtil.findWorkPackageRecursive(_data, wp.children, _lazy);
            }
            if (wp.tasks && wp.tasks.length > 0) {
                wp.tasks.forEach(task => {
                    _data.push(task);
                })
            };
        });
    },

    findAllWorkPackage(_project, _lazy) {
        let _data = [];
        let _phases = _project.phases;

        _phases.map(p => {
            _data.push(p)
            if (p.workPackages && p.workPackages.length > 0) {
                ProjectUtil.findWorkPackageRecursive(_data, p.workPackages);
            }
        });
        if (_data && _lazy && _lazy.affect) {
            // let _filterObj = _.cloneDeep(_lazy.affect);
            // _data = _.filter(_data, function(o){
            //     return (_filterObj.phaseId && _filterObj.phaseId > 0  && o.phaseId === _filterObj.phaseId)
            //         || (_filterObj.isDue && moment(new Date(o.endDate)).isBefore(new Date()))
            //         || (_filterObj.keyword && name.toLowerCase().includes(_lazy.affect[filter].toLowerCase()))
            // });

            for (const filter in _lazy.affect) {
                if (filter === 'users') {
                    if (_lazy.affect[filter] && _lazy.affect[filter].length > 0) {
                        _data = _data.filter(o => _lazy.affect[filter].map(f => f.id).includes(o.involveUserId||o.responsibleId));
                    }
                }
                if (filter === 'states') {
                    if (_lazy.affect[filter] && _lazy.affect[filter].length > 0) {
                        _data = _data.filter(o => _lazy.affect[filter].includes(o.state));
                    }
                }
                if (filter === 'phasePath') {
                    if (_lazy.affect[filter]) {
                        _data = _.filter(_data,function (o) {
                            let _path = o._path;
                            let _curentPath = _path.split(".");
                            let _phasePath = _curentPath[0].toString();
                            if(_phasePath === _lazy.affect[filter]) {
                                return true;
                            } else {
                                return false;
                            }
                        })
                    }
                }
                if (filter === 'dateDue') {
                    if (_lazy.affect[filter]) {
                        let _dateDue = moment(new Date()).add(_lazy.affect[filter], 'days').format();
                        let _searchDue = new Date(new Date(_dateDue).setHours(0, 0, 0)).getTime();
                        _data = _.filter(_data,function (o) {
                            let _deadline = new Date(new Date(o.deadline||o.endDate).setHours(0, 0, 0)).getTime();
                            if (_searchDue === _deadline) {
                                return true
                            } else {
                                return false
                            }
                        })
                    }
                }
                if (filter === 'isDue') {
                    if (_lazy.affect[filter]) {
                        _data = _data.filter(o => moment(new Date(o.endDate||o.deadline)).isBefore(new Date()));
                    }
                }
                if (filter === 'keyword') {
                    if (_lazy.affect[filter]) {
                        _data = _data.filter(o => o.name.toLowerCase().includes(_lazy.affect[filter].toLowerCase()));
                    }
                } else {

                }
            }
        }

        return _data;
    },

    findAllTask(_project) {
        let _data = [];
        let workPackage = ProjectUtil.findAllWorkPackage(_project);
        if (workPackage != null) {
            workPackage.map(w => {
                if (w.tasks && w.tasks.length > 0) {
                    ProjectUtil.findAllTaskRecursive(_data, w.tasks);
                }
            })
        }
        return _data;
    },

    findAllTaskRecursive(_data, tasks) {
        tasks.map(t => {
            _data.push(t);
            if (t.children && t.children.length > 0) {
                ProjectUtil.findAllTaskRecursive(_data, t.children);
            }
        })
    },

    getGroupsFromProject(_project) {
        let _projectGroups = []
        _projectGroups.push({id: _project.groupId, type: ProjectUtil.const_ENTITY().project, name: _project.name, code: _project.code, projectId: _project.id, phaseId: 0});

        if (_project.phases && _project.phases.length > 0) {
            _project.phases.map((_phase) => {
                _projectGroups.push({id: _phase.groupId, type: ProjectUtil.const_ENTITY().phase, name: _phase.name, code: _phase.code, projectId: _project.id, phaseId: _phase.id});
            });
        }
        return _projectGroups;
    },

    getGroupFromRoot(stateUser, rootGroupId) {
        return _.filter(stateUser.groups, function(g){
            return (g.id === rootGroupId ||  g.pathId.startsWith(rootGroupId + "."));
        })
    },

    markStateRecursive(obj, state) {
        obj.compareState = state
        if (obj.children && obj.children.length > 0) {
            obj.children = obj.children.map(c => ProjectUtil.markStateRecursive(c, state))
        }
        return obj;
    },

    compareTimeVersion(currentVer, compareVer) {
        let checkModified = (current, compare) => {
            return (current.name && compare.name && current.name !== compare.name)
                || compare.startDate !== current.startDate || compare.endDate !== current.endDate
                || (compare.description && current.description && compare.description !== current.description)
                || (compare.state && current.state && compare.state !== current.state)
                || (compare.deliverableId && current.deliverableId && compare.deliverableId !== current.deliverableId)
        }

        let compareWpRecursive = (currentWpList, compareWpList) => {
            let resultObj = {merged: [], modified: false}

            // catch edge case
            if (currentWpList.length > 0 && compareWpList.length === 0) {
                resultObj.merged = currentWpList.map(wp => ProjectUtil.markStateRecursive(wp, "REMOVE"))
                resultObj.modified = true;
            }

            // catch edge case
            if (currentWpList.length === 0 && compareWpList.length > 0) {
                resultObj.merged = compareWpList.map(wp => ProjectUtil.markStateRecursive(wp, "ADD"))
                resultObj.modified = true;
            }

            if (currentWpList.length > 0 && compareWpList.length > 0) {
                let merged = []
                for (let i = 0; i < currentWpList.length; i++) {
                    let currentWp = _.cloneDeep(currentWpList[i])
                    let findMatch = false
                    for (let j = 0; j < compareWpList.length; j++) {
                        let compareWp = compareWpList[j]
                        if (compareWp.marked) {
                            continue;
                        }
                        if (currentWp.rootId === compareWp.rootId) {
                            // continue check if modified and children
                            compareWp.marked = true;
                            findMatch = true;

                            let modified = checkModified(currentWp, compareWp)

                            // check children
                            if (currentWp.children && compareWp.children) {
                                let compareChildren = compareWpRecursive(currentWp.children, compareWp.children);
                                compareWp.children = compareChildren.merged
                                modified = modified || compareChildren.modified;
                            }

                            resultObj.modified = modified;
                            compareWp.compareState = modified ? "MODIFIED" : "UNCHANGED";
                            compareWp.oldObj = modified ? currentWp : {};
                            merged.push(_.cloneDeep(compareWp));
                        }
                    }

                    // no match found of current work package in compare ver, meaning compare ver remove current work package
                    if (!findMatch) {
                        resultObj.modified = true;
                        currentWp = ProjectUtil.markStateRecursive(currentWp, "REMOVE")
                        merged.push(currentWp);
                    }
                }

                // unmarked work package in compare ver means compare ver add
                for (let i = 0; i < compareWpList.length; i++) {
                    if (!compareWpList[i].marked) {
                        resultObj.modified = true;
                        let clone = _.cloneDeep(compareWpList[i]);
                        clone = ProjectUtil.markStateRecursive(clone, "ADD")
                        merged.push(clone);
                    }
                }

                resultObj.merged = merged;
            }

            return resultObj;
        }
        if (currentVer.phases && compareVer.phases) {
            // catch edge case
            if (currentVer.phases.length <= 0 && compareVer.phases.length <= 0) {
                return [];
            }

            // catch edge case
            if (currentVer.phases.length === 0 && compareVer.phases.length > 0) {
                return compareVer.phases.map(p => {
                    p.compareState = "ADD"
                    if (p.workPackages && p.workPackages.length > 0) {
                        p.workPackages = p.workPackages.map(wp => ProjectUtil.markStateRecursive(wp, "ADD"))
                    }
                })
            }

            // catch edge case
            if (currentVer.phases.length > 0 && compareVer.phases.length === 0) {
                return currentVer.phases.map(p => {
                    p.compareState = "REMOVE"
                    if (p.workPackages && p.workPackages.length > 0) {
                        p.workPackages = p.workPackages.map(wp => ProjectUtil.markStateRecursive(wp, "REMOVE"))
                    }
                })
            }

            let merged = [];
            for (let i = 0; i < currentVer.phases.length; i++) {
                let currentPhase = _.cloneDeep(currentVer.phases[i])
                let findMatch = false
                for (let j = 0; j < compareVer.phases.length; j++) {
                    let comparePhase = compareVer.phases[j]
                    // skip already pushed work package
                    if (comparePhase.marked) {
                        continue;
                    }
                    if (currentPhase.rootId === comparePhase.rootId) {
                        // continue check if modified and children
                        comparePhase.marked = true;
                        findMatch = true;

                        let compareResult;
                        if (comparePhase.workPackages && currentPhase.workPackages) {
                            compareResult = compareWpRecursive(currentPhase.workPackages, comparePhase.workPackages)
                            comparePhase.workPackages = compareResult.merged
                        }

                        let modified = checkModified(currentPhase, comparePhase) || (compareResult && compareResult.modified);

                        comparePhase.compareState = modified ? "MODIFIED" : "UNCHANGED";
                        comparePhase.oldObj = modified ? currentPhase : {};
                        merged.push(_.cloneDeep(comparePhase));
                    }
                }

                // no match found of current phase in compare ver, meaning compare ver remove current phase
                if (!findMatch) {
                    currentPhase.compareState = "REMOVE"
                    if (currentPhase.workPackages && currentPhase.workPackages.length > 0) {
                        currentPhase.workPackages = currentPhase.workPackages.map(wp => ProjectUtil.markStateRecursive(wp, "REMOVE"))
                    }
                    merged.push(currentPhase);
                }
            }

            // unmarked phase in compare ver means compare ver add
            for (let i = 0; i < compareVer.phases.length; i++) {
                if (!compareVer.phases[i].marked) {
                    let clone = _.cloneDeep(compareVer.phases[i]);
                    clone.compareState = "ADD"
                    if (clone.workPackages && clone.workPackages.length > 0) {
                        clone.workPackages = clone.workPackages.map(wp => ProjectUtil.markStateRecursive(wp, "ADD"))
                    }
                    merged.push(clone);
                }
            }
            return merged
        }
    },
    countPercentAllProject(_project, _dateForCount, _gantt, _percentType, _parentOverTime = false) {
        /*      Des:    Count completed percent in a project: Count in phases
                Output: The project with added obj named [percentType]
                Variables:
                   _project : needed to count
                   _dateForCount: count to this day, if null count to Today
                   _gantt: for counting working-day, exclude ( holiday, weekend, leave,..)
                   percentType: name of the return obj (percentPlan, percentBaseline,...)
        */
        if (!CommonFunction.isEmpty(_project)) {
            let cloneProject = _.cloneDeep(_project);
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;
            let daysInActual = null;
            let daysPlanActualPercent = null;
            let checkOverTime = false;

            startDate = cloneProject.startDate;
            endDate = cloneProject.endDate;
            daysInPlan = ProjectUtil.countWorkDayGantt(startDate, endDate, _gantt);

            // If _dateForCount > project.endDate => 100% & set all child 100%.
            if (_parentOverTime === true || moment(endDate).isBefore(_dateForCount, 'day')) {
                checkOverTime = true;
                daysPlanActualPercent = 100;
            }
            if (checkOverTime === false) {
                if (_dateForCount) {
                    daysInActual = ProjectUtil.countWorkDayGantt(startDate, _dateForCount, _gantt);
                } else {
                    daysInActual = ProjectUtil.countWorkDayGantt(startDate, moment().toDate(), _gantt);
                }
                if (daysInPlan !== 0) {
                    daysPlanActualPercent = daysInActual / daysInPlan * 100;
                }
            }

            let _newWPhase = [];
            if (checkOverTime === false) {
                if (!CommonFunction.isEmpty(cloneProject.phases)) {
                    let sumProject_X = 0;
                    let sumProjectDaysPlan_Y = 0;
                    cloneProject.phases.forEach(r => {
                        let phase = ProjectUtil.countPercentPhase(r, _dateForCount, _gantt, _percentType, false);
                        sumProjectDaysPlan_Y = phase[_percentType].daysInPlan + sumProjectDaysPlan_Y;
                        sumProject_X = phase[_percentType].daysInPlan * phase[_percentType].daysPlanActualPercent + sumProject_X;
                        _newWPhase.push(phase);
                    })
                    cloneProject.phases = _newWPhase;
                    if (sumProjectDaysPlan_Y !== 0) {
                        daysPlanActualPercent = sumProject_X / sumProjectDaysPlan_Y;
                    }
                }
            } else { //checkOverTime===true
                if (!CommonFunction.isEmpty(cloneProject.phases)) {
                    cloneProject.phases.forEach(r => {
                        let phase = ProjectUtil.countPercentPhase(r, _dateForCount, _gantt, _percentType, true);
                        _newWPhase.push(phase);
                    })
                    cloneProject.phases = _newWPhase;
                }
            }


            let percentOut = {
                daysInPlan: daysInPlan
                , daysInActual: daysInActual
                , daysPlanActualPercent: daysPlanActualPercent
                , checkOverTime: checkOverTime
            };
            cloneProject[_percentType] = percentOut;

            return cloneProject;
        }
    },
    countPercentPhase(_phase, _dateForCount, _gantt, _percentType, _parentOverTime = false) {
        /*  Des:    Count completed percent in a phase: Count in workPackages and Tasks
            Output: The phase with added obj named [percentType]
            Variables:
                _phase : need to count
                _dateForCount: count to this day, if null count to Today
                _gantt: for count working day
                percentType: name of the return obj (percentPlan, percentBaseline,...)
        */
        if (!CommonFunction.isEmpty(_phase)) {
            let clonePhase = _.cloneDeep(_phase);
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;
            let daysInActual = null;
            let daysPlanActualPercent = null;
            let checkOverTime = false;

            startDate = clonePhase.startDate;
            endDate = clonePhase.endDate;
            daysInPlan = ProjectUtil.countWorkDayGantt(startDate, endDate, _gantt);
            // If _dateForCount > phase.endDate => 100% & set all child 100%.
            if (_parentOverTime === true || moment(endDate).isBefore(_dateForCount, 'day')) {
                checkOverTime = true;
                daysPlanActualPercent = 100;
            }
            if (checkOverTime === false) {
                if (_dateForCount === null) {
                    daysInActual = ProjectUtil.countWorkDayGantt(startDate, moment().toDate(), _gantt);
                } else {
                    if (_dateForCount) {
                        daysInActual = ProjectUtil.countWorkDayGantt(startDate, _dateForCount, _gantt);
                    } else {
                        // console.log("########## countPercentTask elseelseelseelse  isValidisValidisValidisValid");
                    }
                }

                if (daysInPlan !== 0) {
                    daysPlanActualPercent = daysInActual / daysInPlan * 100;
                }
            }
            let _newWorkPackage = [];
            if (checkOverTime === false) {
                if (!CommonFunction.isEmpty(clonePhase.workPackages)) {
                    let sumWP_X = 0;
                    let sumWPDaysPlan_Y = 0;
                    clonePhase.workPackages.forEach(r => {
                        let workpackage = ProjectUtil.countPercentWorkPackage(r, _dateForCount, _gantt, _percentType, false);
                        sumWPDaysPlan_Y = workpackage[_percentType].daysInPlan + sumWPDaysPlan_Y;
                        sumWP_X = workpackage[_percentType].daysInPlan * workpackage[_percentType].daysPlanActualPercent + sumWP_X;
                        _newWorkPackage.push(workpackage);
                    })
                    clonePhase.workPackages = _newWorkPackage;
                    if (sumWPDaysPlan_Y !== 0) {
                        daysPlanActualPercent = sumWP_X / sumWPDaysPlan_Y;
                    }
                }
            } else { /// checkOverTime === true
                if (!CommonFunction.isEmpty(clonePhase.workPackages)) {
                    clonePhase.workPackages.forEach(r => {
                        let workpackage = ProjectUtil.countPercentWorkPackage(r, _dateForCount, _gantt, _percentType, true);
                        _newWorkPackage.push(workpackage);
                    })
                    clonePhase.workPackages = _newWorkPackage;
                }
            }

            let percentOut = {
                daysInPlan: daysInPlan
                , daysInActual: daysInActual
                , daysPlanActualPercent: daysPlanActualPercent
                , checkOverTime: checkOverTime
            };
            clonePhase[_percentType] = percentOut;

            return clonePhase;
        }
    },
    countPercentWorkPackage(_workPackage, _dateForCount, _gantt, _percentType, _parentOverTime = false) {
        /*
        Des:    Count completed percent in a work packages: Count in workPackages, child-workPackages,Tasks
        Output: The work package with added obj named [percentType]
        Variables:
            _workPackage : need to count
            _dateForCount: count to this day, if null count to Today
            _gantt: for count working day
            _percentType: name of the return obj (percentPlan, percentBaseline,...)
        */
        if (!CommonFunction.isEmpty(_workPackage)) {
            let cloneWorkPackage = _.cloneDeep(_workPackage);
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;
            let daysInActual = null;
            let daysPlanActualPercent = null;
            let checkOverTime = false;

            startDate = cloneWorkPackage.startDate;
            endDate = cloneWorkPackage.endDate;
            daysInPlan = ProjectUtil.countWorkDayGantt(startDate, endDate, _gantt);

            // If _dateForCount > wp.endDate => 100% & set all child 100%.
            if (_parentOverTime === true || moment(endDate).isBefore(_dateForCount, 'day')) {
                checkOverTime = true;
                daysPlanActualPercent = 100;
            }
            if (checkOverTime === false) {
                if (_dateForCount === null) {
                    daysInActual = ProjectUtil.countWorkDayGantt(startDate, moment().toDate(), _gantt);
                } else {
                    if (_dateForCount) {
                        daysInActual = ProjectUtil.countWorkDayGantt(startDate, _dateForCount, _gantt);
                    } else {
                        // console.log("########## countPercentTask elseelseelseelse  isValidisValidisValidisValid");
                    }
                }

                if (daysInPlan !== 0) {
                    daysPlanActualPercent = daysInActual / daysInPlan * 100;
                }
            }

            // Have children
            let sumWP_X = 0;
            let sumWPDaysPlan_Y = 0;
            let _newWPChildren = [];
            if (checkOverTime === false) {
                if (!CommonFunction.isEmpty(cloneWorkPackage.children)) {
                    cloneWorkPackage.children.forEach(r => {
                        let wpChild = ProjectUtil.countPercentWorkPackage(r, _dateForCount, _gantt, _percentType, false);
                        sumWPDaysPlan_Y = wpChild[_percentType].daysInPlan + sumWPDaysPlan_Y;
                        sumWP_X = wpChild[_percentType].daysInPlan * wpChild[_percentType].daysPlanActualPercent + sumWP_X;
                        _newWPChildren.push(wpChild);
                    })
                    cloneWorkPackage.children = _newWPChildren;
                }
            } else { // checkOverTime===true)
                if (!CommonFunction.isEmpty(cloneWorkPackage.children)) {
                    cloneWorkPackage.children.forEach(r => {
                        let wpChild = ProjectUtil.countPercentWorkPackage(r, _dateForCount, _gantt, _percentType, true);
                        _newWPChildren.push(wpChild);
                    })
                    cloneWorkPackage.children = _newWPChildren;
                }
            }

            // Have task
            let sumTask_X = 0;
            let sumTaskDaysPlan_Y = 0;
            let _newTaskChildren = [];
            if (checkOverTime === false) {
                if (!CommonFunction.isEmpty(cloneWorkPackage.tasks)) {
                    cloneWorkPackage.tasks.forEach(r => {
                        let taskChild = ProjectUtil.countPercentTask(r, _dateForCount, _gantt, _percentType, false);
                        sumTaskDaysPlan_Y = taskChild[_percentType].daysInPlan + sumTaskDaysPlan_Y;
                        sumTask_X = taskChild[_percentType].daysInPlan * taskChild[_percentType].daysPlanActualPercent + sumTask_X;
                        _newTaskChildren.push(taskChild);
                    })
                    cloneWorkPackage.tasks = _newTaskChildren;
                }
            } else { //checkOverTime===true
                if (!CommonFunction.isEmpty(cloneWorkPackage.tasks)) {
                    cloneWorkPackage.tasks.forEach(r => {
                        let taskChild = ProjectUtil.countPercentTask(r, _dateForCount, _gantt, _percentType, true);
                        _newTaskChildren.push(taskChild);
                    })
                    cloneWorkPackage.tasks = _newTaskChildren;
                }
            }

            if ((sumWPDaysPlan_Y > 0 || sumTaskDaysPlan_Y > 0) && (checkOverTime === false)) {
                daysPlanActualPercent = (sumWP_X + sumTask_X) / (sumWPDaysPlan_Y + sumTaskDaysPlan_Y);
                // console.log("sumWPDaysPlan_Y=", sumWPDaysPlan_Y, " sumTaskDaysPlan_Y=", sumTaskDaysPlan_Y);
            }
            let percentOut = {
                daysInPlan: daysInPlan
                , daysInActual: daysInActual
                , daysPlanActualPercent: daysPlanActualPercent
                , checkOverTime: checkOverTime
            };
            cloneWorkPackage[_percentType] = percentOut;
            return cloneWorkPackage;
        }
    },
    countPercentTask(_task, _dateForCount, _gantt, _percentType, _parentOverTime = false) {
        /*
        Des:    Count completed percent in a Task: Count in tasks & child-task. If _dateForCount > _task.deadline => 100%
        Output: The task with added obj named [percentType]
        Variables:
            _task : need to count
            _dateForCount: count to this day, if null count to Today
            -_gantt: for counting working-day
            _percentType: name of the return obj (percentPlan, percentBaseline,...)
            _parentOverTime: = true => Set all child percent=100%
        */
        if (!CommonFunction.isEmpty(_task)) {
            let cloneTask = _.cloneDeep(_task);
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;
            let daysInActual = null;
            let daysPlanActualPercent = null;
            let checkOverTime = false;

            startDate = cloneTask.startDate;
            endDate = cloneTask.deadline;
            daysInPlan = ProjectUtil.countWorkDayGantt(startDate, endDate, _gantt);

            // If _dateForCount > _task.deadline => 100% & set all child 100%.
            if (_parentOverTime === true || moment(endDate).isBefore(_dateForCount, 'day')) {
                checkOverTime = true;
                daysPlanActualPercent = 100;
            }

            if (checkOverTime === false) {
                if (_dateForCount === null) {
                    daysInActual = ProjectUtil.countWorkDayGantt(startDate, moment().toDate(), _gantt);

                } else {
                    if (_dateForCount) {
                        daysInActual = ProjectUtil.countWorkDayGantt(startDate, _dateForCount, _gantt);

                    } else {
                        // console.log("########## countPercentTask elseelseelseelse  isValidisValidisValidisValid");
                    }
                }

                if (daysInPlan !== 0) {
                    daysPlanActualPercent = daysInActual / daysInPlan * 100;
                }
            }

            let _newTaskChildren = [];
            if (!CommonFunction.isEmpty(cloneTask.children)) {
                if (checkOverTime === false) {
                    let sumTask_X = 0;
                    let sumTaskDaysPlan_Y = 0;

                    cloneTask.children.forEach(r => {
                        let taskChild = ProjectUtil.countPercentTask(r, _dateForCount, _gantt, _percentType, false);
                        sumTaskDaysPlan_Y = taskChild[_percentType].daysInPlan + sumTaskDaysPlan_Y;
                        sumTask_X = taskChild[_percentType].daysInPlan * taskChild[_percentType].daysPlanActualPercent + sumTask_X;
                        _newTaskChildren.push(taskChild);
                    })
                    cloneTask.children = _newTaskChildren;
                    if (sumTaskDaysPlan_Y !== 0) {
                        daysPlanActualPercent = sumTask_X / sumTaskDaysPlan_Y;
                    }
                } else {
                    cloneTask.children.forEach(r => {
                        let taskChild = ProjectUtil.countPercentTask(r, _dateForCount, _gantt, _percentType, true);
                        _newTaskChildren.push(taskChild);
                    })
                    cloneTask.children = _newTaskChildren;
                }
            }
            let percentOut = {
                daysInPlan: daysInPlan
                , daysInActual: daysInActual
                , daysPlanActualPercent: daysPlanActualPercent
                , checkOverTime: checkOverTime
            };
            cloneTask[_percentType] = percentOut;
            return cloneTask;
        }
    },
    countActualPercentTask(_task, _gantt) {
        /*
        Des:    Đối với task và sub task thì % thực tế sẽ lấy theo % người dùng nhập điền luôn lên cột % thực tế
                (người dùng ko nhập gì thì hiển thị 0%)
        */
        if (!CommonFunction.isEmpty(_task)) {
            let cloneTask = _.cloneDeep(_task);
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;
            let _percentType = "percentActual";
            let actualDonePercent = 0;

            startDate = cloneTask.startDate;
            endDate = cloneTask.deadline;

            daysInPlan = cloneTask.countWorkHourNeed;

            if (_task.countDonePercent !== undefined) {
                if (_task.countDonePercent > 0) {
                    actualDonePercent = _task.countDonePercent;
                }
            }

            let _newTaskChildren = [];
            if (!CommonFunction.isEmpty(cloneTask.children)) {
                cloneTask.children.forEach(r => {
                    let taskChild = ProjectUtil.countActualPercentTask(r, _gantt);
                    _newTaskChildren.push(taskChild);
                });
                cloneTask.children = _newTaskChildren;
            }
            let percentOut = {
                daysInPlan: daysInPlan
                , daysPlanActualPercent: actualDonePercent
            };
            cloneTask[_percentType] = percentOut;
            return cloneTask;
        }
    },
    countActualPercentWorkPackage(_workPackage, _gantt) {
        /*
            TH1 WP có task con thì tính theo bình quân gia quyền các task con
              TH2: WP không tạo con thì sẽ căn cứ vào trạng thái của WP. WP ở chuyển trạng thái là Hoàn thành
                --> % thực tế = 100%; các trạng thái còn lại là 0%
        */
        if (!CommonFunction.isEmpty(_workPackage)) {
            let cloneWorkPackage = _.cloneDeep(_workPackage);
            let _percentType = "percentActual";
            let actualDonePercent = 0;
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;

            let sumTask_X = 0;
            let sumTaskDaysPlan_Y = 0;
            let sumWP_X = 0;
            let sumWPDaysPlan_Y = 0;

            startDate = _workPackage.startDate;
            endDate = _workPackage.endDate;
            daysInPlan = _workPackage.countWorkHourNeed;
            if (CommonFunction.isEmpty(cloneWorkPackage.tasks) && CommonFunction.isEmpty(cloneWorkPackage.children)) {
                if (_workPackage.state === TaskUtil.S().DONE || _workPackage.state === TaskUtil.S().COMPLETED) {
                    actualDonePercent = 100;
                }
            } else {
                // Have children
                let _newWPChildren = [];
                if (!CommonFunction.isEmpty(cloneWorkPackage.children)) {
                    cloneWorkPackage.children.forEach(r => {
                        let wpChild = ProjectUtil.countActualPercentWorkPackage(r, _gantt);
                        // if (wpChild[_percentType].daysPlanActualPercent > 0) {
                        sumWPDaysPlan_Y = wpChild[_percentType].daysInPlan + sumWPDaysPlan_Y;
                        sumWP_X = wpChild[_percentType].daysInPlan * wpChild[_percentType].daysPlanActualPercent + sumWP_X;
                        // }
                        _newWPChildren.push(wpChild);
                    })
                    cloneWorkPackage.children = _newWPChildren;
                }
                // Have task
                let _newTaskChildren = [];
                if (!CommonFunction.isEmpty(cloneWorkPackage.tasks)) {
                    cloneWorkPackage.tasks.forEach(r => {
                        let taskChild = ProjectUtil.countActualPercentTask(r, _gantt);
                        // if (taskChild[_percentType].daysPlanActualPercent > 0) {
                        sumTaskDaysPlan_Y = taskChild[_percentType].daysInPlan + sumTaskDaysPlan_Y;
                        sumTask_X = taskChild[_percentType].daysInPlan * taskChild[_percentType].daysPlanActualPercent + sumTask_X;
                        // }
                        _newTaskChildren.push(taskChild);
                    })
                    cloneWorkPackage.tasks = _newTaskChildren;
                }
            }

            if ((sumWPDaysPlan_Y > 0 || sumTaskDaysPlan_Y > 0)) {
                actualDonePercent = (sumWP_X + sumTask_X) / (sumWPDaysPlan_Y + sumTaskDaysPlan_Y);
            }
            let percentOut = {
                daysInPlan: daysInPlan
                , daysPlanActualPercent: actualDonePercent
            };
            cloneWorkPackage[_percentType] = percentOut;
            return cloneWorkPackage;
        }
    },
    countActualPercentPhase(_phase, _gantt) {
        /*
            TH1: PHASE có WP con thì tính theo bình quân gia quyền các WP con
              TH2: PHASE không tạo con thì sẽ căn cứ vào trạng thái của PHASE. PHASE  ở chuyển trạng thái là Hoàn thành
                --> % thực tế = 100%; các trạng thái còn lại là 0%
        */
        if (!CommonFunction.isEmpty(_phase)) {
            let clonePhase = _.cloneDeep(_phase);
            let _percentType = "percentActual";
            let actualDonePercent = 0;
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;

            let sumWP_X = 0;
            let sumWPDaysPlan_Y = 0;

            startDate = _phase.startDate;
            endDate = _phase.endDate;
            daysInPlan = clonePhase.countWorkHourNeed;

            if (CommonFunction.isEmpty(clonePhase.workPackages)) {
                if (_phase.state === TaskUtil.S().DONE || _phase.state === TaskUtil.S().COMPLETED) {
                    actualDonePercent = 100;
                }
            } else {
                if (!CommonFunction.isEmpty(clonePhase.workPackages)) {
                    let _newWorkPackage = [];
                    clonePhase.workPackages.forEach(r => {
                        let workpackage = ProjectUtil.countActualPercentWorkPackage(r, _gantt);
                        // if (workpackage[_percentType].daysPlanActualPercent > 0) {
                        sumWPDaysPlan_Y = workpackage[_percentType].daysInPlan + sumWPDaysPlan_Y;
                        sumWP_X = workpackage[_percentType].daysInPlan * workpackage[_percentType].daysPlanActualPercent + sumWP_X;
                        // }
                        _newWorkPackage.push(workpackage);
                    })
                    clonePhase.workPackages = _newWorkPackage;
                    if (sumWPDaysPlan_Y !== 0) {
                        actualDonePercent = sumWP_X / sumWPDaysPlan_Y;
                    }
                }
            }

            let percentOut = {
                daysInPlan: daysInPlan
                , daysPlanActualPercent: actualDonePercent
            };
            clonePhase[_percentType] = percentOut;
            return clonePhase;
        }
    },
    countActualPercentAllProject(_project, _gantt) {
        if (!CommonFunction.isEmpty(_project)) {
            let cloneProject = _.cloneDeep(_project);
            let _percentType = "percentActual";
            let actualDonePercent = 0;
            let startDate = null;
            let endDate = null;
            let daysInPlan = null;

            let sumPhase_X = 0;
            let sumPhaseDaysPlan_Y = 0;

            startDate = _project.startDate;
            endDate = _project.endDate;
            daysInPlan = _project.countWorkHourNeed;

            if (CommonFunction.isEmpty(cloneProject.phases)) {
                if (cloneProject.state === TaskUtil.S().DONE || cloneProject.state === TaskUtil.S().COMPLETED) {
                    actualDonePercent = 100;
                }
            } else {
                if (!CommonFunction.isEmpty(cloneProject.phases)) {
                    let _newPhase = [];
                    cloneProject.phases.forEach(r => {
                        let phase = ProjectUtil.countActualPercentPhase(r, _gantt);
                        // if (phase[_percentType].daysPlanActualPercent > 0) {
                        sumPhaseDaysPlan_Y = phase[_percentType].daysInPlan + sumPhaseDaysPlan_Y;
                        sumPhase_X = phase[_percentType].daysInPlan * phase[_percentType].daysPlanActualPercent + sumPhase_X;
                        // }
                        _newPhase.push(phase);
                    })
                    cloneProject.phases = _newPhase;
                    if (sumPhaseDaysPlan_Y !== 0) {
                        actualDonePercent = sumPhase_X / sumPhaseDaysPlan_Y;
                    }
                }
            }

            let percentOut = {
                daysInPlan: daysInPlan
                , daysPlanActualPercent: actualDonePercent
            };
            cloneProject[_percentType] = percentOut;
            return cloneProject;
        }
    },
    countWorkDay11111(_startDate, _endDate, _workingSchedule) {
        // count working day
        // Holiday, leave: waiting
        if (moment(_startDate).isValid() && moment(_endDate).isValid() && !CommonFunction.isEmpty(_workingSchedule)) {
            // if (moment(_endDate).isBefore(_startDate, 'day')) {
            //     // if (_endDate > _startDate) {
            //     console.log(" _startDate = ", _startDate);
            //     console.log(" _endDate = ", _endDate);
            //
            //     console.log("isSameOrBefore");
            //     return null;
            // }
            if (_endDate < _startDate) {
                // console.log("isSameOrBefore");
                return null;
            }

            let weekNum = {
                0: false
                , 1: true
                , 2: true
                , 3: true
                , 4: true
                , 5: true
                , 6: false
            };

            if (!CommonFunction.isEmpty(_workingSchedule.workingSchedule.days)) {
                _workingSchedule.workingSchedule.days.forEach((val, valIndex) => {
                    if (val.times.length !== 0) {
                        weekNum[valIndex] = true;
                    } else {
                        weekNum[valIndex] = false;
                    }
                });
            }
            // console.log(" weekNumweekNum = ",weekNum);
            let count = 0;
            const curDate = new Date(_startDate);
            let endDate = new Date(_endDate);
            endDate.setHours(0, 0, 0, 0);
            curDate.setHours(0, 0, 0, 0);
            while (curDate <= endDate) {
                const dayOfWeek = curDate.getDay();
                if (weekNum[dayOfWeek]) count++;
                curDate.setDate(curDate.getDate() + 1);
                curDate.setHours(0, 0, 0, 0);
            }
            return count;

        } else {
            return null;
        }
    },
    countWorkDayGantt(_startDate, _endDate, _gantt) {
        // count working day
        // if (moment(_startDate).isValid() && moment(_endDate).isValid() && !CommonFunction.isEmpty(_gantt)) {
        if (_endDate < _startDate) {
            // console.log("isSameOrBefore");
            return null;
        }
        let startDate = new Date(new Date(_startDate).setHours(0, 0, 0, 0));
        let endDate = new Date(new Date(_endDate).setHours(0, 0, 0, 0));
        let hour = 0
        if (moment(startDate).diff(moment(endDate)) === 0) {
            hour = 8;
        } else if (_gantt && startDate && endDate) {
            hour = _gantt.calculateDuration(startDate, endDate) / 60;
        }
        if (hour < 0) {  // before the time
            return 0;
        }
        let countDay = 0;
        countDay = (hour / 8).toFixed(2);
        countDay = parseFloat(countDay);
        // console.log("_startDate = ", _startDate, "  _endDate=",_endDate, "  => hour= ",hour.toFixed(1), " days=",countDay);
        return countDay;
        // }
        // else {
        //     return null;
        // }
    },

    // matchingObj(obj, filterObj, project) {
    //     // return (
    //     //         ( (!filterObj.state || (filterObj.states.includes(obj.state)))
    //     //         && (!filterObj.users ||  (filterObj.users.some(u => {
    //     //                 let _checkObj = obj.responsibleUser ? obj.responsibleUser : obj.involveUser;
    //     //                 if(_checkObj && _checkObj.id === u.id){
    //     //                     return true;
    //     //                 }
    //     //             })))
    //     //         && (!filterObj.name || obj.name.includes(filterObj.name))
    //     //         && (!filterObj.phaseId || filterObj.phaseId === 0 || function(){
    //     //                 let _searchGroupId = _.filter(project.phases, {"id": filterObj.phaseId})["groupId"]
    //     //                 return obj.groupId === _searchGroupId;
    //     //             })
    //     //
    //     //         )
    //     //
    //     // )
    //
    //     let checkState = (obj, filterObj) => {
    //         let valid = false;
    //         if (filterObj.states && obj.state) {
    //             valid = filterObj.states.includes(obj.state);
    //         }
    //         return valid;
    //     };
    //     let checkUser = (obj, filterObj) => {
    //         let valid = false;
    //         if (filterObj.users) {
    //             if (filterObj.users.length === 0) {
    //                 return checkState(obj, filterObj);
    //             }
    //
    //             if (obj.involveUser) {
    //                 if (filterObj.users.some(u => u.id === obj.involveUser.id)) {
    //                     return checkState(obj, filterObj);
    //                 }
    //             } else {
    //                 valid = false;
    //             }
    //
    //             if (obj.responsibleUser) {
    //                 if (filterObj.users.some(u => u.id === obj.responsibleUser.id)) {
    //                     return checkState(obj, filterObj);
    //                 }
    //             } else {
    //                 valid = false;
    //             }
    //         } else {
    //             return checkState(obj, filterObj);
    //         }
    //         return valid;
    //     };
    //
    //     if (filterObj.name != null && obj.name != null && obj.name.includes(filterObj.name)) {
    //         return checkUser(obj, filterObj);
    //     } else {
    //         return checkUser(obj, filterObj);
    //     }
    // },
    //
    // filterTasks(tasks, filterObj) {
    //     let filtered = [];
    //     for (let i = 0; i < tasks.length; i++) {
    //         let _task = _.cloneDeep(tasks[i]);
    //         if (ProjectUtil.matchingObj(_task, filterObj)) {
    //             filtered.push(_task);
    //         } else if (_task.children) {
    //             let _filteredChildren = ProjectUtil.filterTasks(_task.children, filterObj);
    //             if (_filteredChildren.length > 0) {
    //                 _task.children = _filteredChildren;
    //                 filtered.push(_task);
    //             }
    //         }
    //     }
    //     return filtered;
    // },
    //
    // filterWP(workPackages, filterObj) {
    //     let filtered = [];
    //     for (let i = 0; i < workPackages.length; i++) {
    //         let _workPackage = _.cloneDeep(workPackages[i]);
    //         if (ProjectUtil.matchingObj(_workPackage, filterObj)) {
    //             filtered.push(_workPackage);
    //         } else {
    //             let push = false;
    //             if (_workPackage.children) {
    //                 let _filteredChildren = ProjectUtil.filterWP(_workPackage.children, filterObj);
    //                 if (_filteredChildren.length > 0) {
    //                     push = true;
    //                     _workPackage.children = _filteredChildren;
    //                 }
    //             }
    //             if (_workPackage.tasks) {
    //                 let _filteredTasks = ProjectUtil.filterTasks(_workPackage.tasks, filterObj);
    //                 if (_filteredTasks.length > 0) {
    //                     push = true;
    //                     _workPackage.tasks = _filteredTasks;
    //                 }
    //             }
    //             if (push) {
    //                 filtered.push(_workPackage);
    //             }
    //         }
    //     }
    //     return filtered;
    // },
    //
    // filterProject(project, filterObj) {
    //     let res = _.cloneDeep(project);
    //     let _phases = [];
    //
    //     for (let i = 0; i < project.phases.length; i++) {
    //         let _phase = _.cloneDeep(project.phases[i]);
    //         if (filterObj.name && filterObj.name !== "" && _phase.name.includes(filterObj.name)) {
    //             _phases.push(_phase);
    //         } else if (_phase.workPackages) {
    //             let _filteredWP = ProjectUtil.filterWP(_phase.workPackages, filterObj);
    //             if (_filteredWP.length > 0) {
    //                 _phase.workPackages = _filteredWP;
    //                 _phases.push(_phase);
    //             }
    //         }
    //     }
    //
    //     res.phases = _phases;
    //     return res;
    // }



    findObjectFromProjectRecursive(_target, _objectType, _objectId) {
        if (_objectType === ProjectUtil.const_ENTITY().workpackage
            && _target.projectId && _target.projectId > 0
            && _objectId === _target.id) {
            return _target;
        }
        if (_objectType === ProjectUtil.const_ENTITY().task
            && (!_target.projectId || _target.projectId === 0)
            && _objectId === _target.id) {
            return _target;
        }
        if (_target.children && _target.children.length > 0) {
            for (let i = 0; i < _target.children.length; i++) {
                let w = _target.children[i];
                let _found = ProjectUtil.findObjectFromProjectRecursive(w, _objectType, _objectId)
                if (_found) {
                    return _found
                }
            }
        }
        if (_target.tasks && _target.tasks.length > 0) {
            for (let i = 0; i < _target.tasks.length; i++) {
                let t = _target.tasks[i];
                let _found = ProjectUtil.findObjectFromProjectRecursive(t, _objectType, _objectId)
                if (_found) {
                    return _found
                }
            }
        }
    },

    findObjectFromProject(_project, _objectType, _objectId) {
        if (_objectType === ProjectUtil.const_ENTITY().project && _objectId === _project.id) {
            return _project;
        }
        if (_project.phases && _project.phases.length > 0) {
            for (let i = 0; i < _project.phases.length; i++) {
                let p = _project.phases[i];
                if (_objectType === ProjectUtil.const_ENTITY().phase && _objectId === p.id) {
                    return p;
                }
                if (p.workPackages && p.workPackages.length > 0) {
                    for (let j = 0; j < p.workPackages.length; j++) {
                        let w = p.workPackages[j];
                        if (_objectType === ProjectUtil.const_ENTITY().workpackage && _objectId === w.id) {
                            return w;
                        }
                        let _found = ProjectUtil.findObjectFromProjectRecursive(w, _objectType, _objectId);
                        if (_found) {
                            return _found;
                        }
                    }
                }
            }
        }
    },

    getColorMatrix(code, colorMatrix) {
        let _find = _.find(colorMatrix, {'code': code});
        if(_find){
            return _find.color;
        }
        return "#f8ff76";
    },

    getScoreFromMatrix(code, colorMatrix) {
        let _find = _.find(colorMatrix, {'code': code});
        if(_find){
            return _find.score;
        }
        return 0;
    },

    getSeverity(happen, impact, severityMatrix) {
        let _dataIndex = _.findIndex(severityMatrix, {'happen': happen, 'impact': impact});
        if(_dataIndex > -1){
            return severityMatrix[_dataIndex]
        }
        return {
            happen: "",
            impact: "",
            severity: {code: "UNAFFECT", color: "#b4ea1a"}
        }
    },

    getSeverityByScore(score, colorMatrix){
        if(score < 4){
            return {code: 'UNAFFECT', color: ProjectUtil.getColorMatrix('UNAFFECT', colorMatrix)};
        }
        if(score < 8){
            return {code: 'VERY_LOW',  color: ProjectUtil.getColorMatrix('VERY_LOW', colorMatrix)};
        }
        if(score < 15){
            return {code: 'LOW',  color: ProjectUtil.getColorMatrix('LOW', colorMatrix)};
        }
        if(score < 20) {
            return {code: 'MEDIUM', color: ProjectUtil.getColorMatrix('MEDIUM', colorMatrix)};
        }
        if(score < 29) {
            return {code: 'HIGH', color: ProjectUtil.getColorMatrix('HIGH', colorMatrix)};
        }
        if(score < 36) {
            return {code: 'VERY_HIGH', color: ProjectUtil.getColorMatrix('VERY_HIGH', colorMatrix)};
        }
        return {code: 'CRITICAL', color: ProjectUtil.getColorMatrix('CRITICAL', colorMatrix)};
    },

    buildDefaultSeverityMatrix (colorMatrix)  {
        let _data = []
        ProjectUtil.const_priority().forEach(function (happen, happenIndex){
            ProjectUtil.const_priority().forEach(function (impact, impactIndex){
                let _severityObject = ProjectUtil.getSeverityByScore(happen.score * impact.score, colorMatrix)
                let _item = {
                    happen: happen.code,
                    impact: impact.code,
                    severity: _severityObject
                }
                _data.push(_item)
            })
        })
        return _data;
    },

    async getRootParent(_task){
        let _parent;
        if((_task.parentId && _task.parentId > 0) || (_task.task.parentId && _task.task.parentId > 0)){
            _parent = await ProjectService.task.getById(_task.parentId || _task.task.parentId);
        }
        if(_parent){
            return await ProjectUtil.getRootParent(_parent);
        }else{
            return _task;
        }
    }
}
export default ProjectUtil;

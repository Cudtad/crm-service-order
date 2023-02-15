import React, {useContext, useState} from 'react';
import "./scss/UserAC.scss";
import CommonFunction from '@lib/common';
import TaskService from "services/TaskService";

import {Tooltip} from "primereact/tooltip";
import classNames from "classnames";
import {Chip} from "primereact/chip";

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import TaskUtil from 'features/task/components/util/TaskUtil';
import DisplayUtil from "../util/DisplayUtil";
import _ from "lodash";
import TaskBaseApi from "services/TaskBaseApi";

export const WorkGroupTaskAutoComplete = (props) => {

    const [filtered, setFiltered] = useState(null);
    const { user } = props;
    const t = CommonFunction.t;
    const [lazy, setLazy] = useState({
        page: 0,
        size: 25,
        refId: 0,
        refType: "work-group",
        affect: {
            keyword: "",
            groupId: -1,
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

    const {value, onChange, className, types, application, group, itemDisplay} = props;

    const selectedTemplate = (item) => {
        return (
            <>
                {itemDisplay &&
                    <div className={`project-column-definition milestone-task-container`}>
                        <div className="milestone-task-detail">
                            <div>
                                {/* task info */}
                                <div className="align-items-center milestone-task-item-info">
                                    <div className="flex flex-column">
                                        <div className="flex align-items-stretch">
                                            {itemDisplay && itemDisplay.state && <>
                                                <Tooltip target={`.user-task-state.${item.state}`} content={t(`request.task.state.${item.state}`)} position="bottom"/>
                                                <i className={classNames({
                                                    "user-task-state project-list-quick-action bx": true,
                                                    "PENDING bx-pause text-grey-7": item.state === "PENDING",
                                                    "IN_PROGRESS bx-play text-teal": item.state === "IN_PROGRESS",
                                                    "DEFERRED bx-stopwatch text-orange-9": item.state === "DEFERRED",
                                                    "CANCELED bx-x text-red-9": item.state === "CANCELED",
                                                    "COMPLETED bx-check text-green": item.state === "COMPLETED",
                                                    "REVIEWING bx-help text-purple": item.state === "REVIEWING"
                                                })} style={{lineHeight: "16px"}}/>
                                                <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom"/>
                                                <i className={
                                                    classNames({
                                                        "user-important-task project-list-quick-action ml-1 mr-2": true,
                                                        "bx bx-tag-alt text-grey-7": !item.important,
                                                        "bx bxs-tag-alt text-yellow-9": item.important
                                                    })}
                                                />
                                            </>
                                            }
                                            <div className="flex">
                                                {/* task's name */}
                                                {itemDisplay && itemDisplay.name &&
                                                    <div className="flex">
                                                        <span className="mr-2">{item.name}</span>
                                                    </div>
                                                }
                                                {/* time */}
                                                {itemDisplay && itemDisplay.date && <>
                                                    <div className="flex align-items-center project-header-text pl-2">
                                                        {CommonFunction.formatDate(item.startDate)}</div>
                                                    <div className="flex align-items-center project-header-text pl-2">
                                                        {CommonFunction.formatDate(item.deadline)}</div>
                                                    <div className="flex align-items-center project-header-text pl-2">
                                                        {CommonFunction.formatDate(item.closedOn)}</div>
                                                </>}
                                            </div>
                                        </div>
                                    </div>
                                    {itemDisplay && itemDisplay.responsible &&
                                        <div className="flex mt-1">
                                            <div className="flex">
                                                {item.responsibleUser &&
                                                    DisplayUtil.displayChipUser(item.responsibleUser, false, "18px")
                                                }
                                                <small className="pl-2 mt-2">{item.group && item.group.name}</small>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {!itemDisplay &&
                    itemTemplate(item)
                }
            </>


        )
    }

    const itemTemplate = (item) => {
        return (
            <div className={`project-column-definition milestone-task-container`}>
                <div className="milestone-task-detail">
                    <div>
                        {/* task info */}
                        <div className="align-items-center milestone-task-item-info">
                            <div className="flex flex-column">
                                <div className="flex align-items-stretch">
                                    <Tooltip target={`.user-task-state.${item.state}`} content={t(`request.task.state.${item.state}`)} position="bottom"/>
                                    <i className={classNames({
                                        "user-task-state project-list-quick-action bx": true,
                                        "PENDING bx-pause text-grey-7": item.state === "PENDING",
                                        "IN_PROGRESS bx-play text-teal": item.state === "IN_PROGRESS",
                                        "DEFERRED bx-stopwatch text-orange-9": item.state === "DEFERRED",
                                        "CANCELED bx-x text-red-9": item.state === "CANCELED",
                                        "COMPLETED bx-check text-green": item.state === "COMPLETED",
                                        "REVIEWING bx-help text-purple": item.state === "REVIEWING"
                                    })} style={{lineHeight: "16px"}}/>
                                    <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom"/>
                                    <i className={
                                        classNames({
                                            "user-important-task project-list-quick-action ml-1 mr-2": true,
                                            "bx bx-tag-alt text-grey-7": !item.important,
                                            "bx bxs-tag-alt text-yellow-9": item.important
                                        })}
                                    />
                                    <div className="flex">
                                        {/* task's name */}
                                        <div className="flex">
                                            <span className="mr-2">{item.name}</span>
                                        </div>
                                        {/* time */}
                                        <div className="flex align-items-center project-header-text pl-2">
                                            {CommonFunction.formatDate(item.startDate)}</div>
                                        <div className="flex align-items-center project-header-text pl-2">
                                            {CommonFunction.formatDate(item.deadline)}</div>
                                        <div className="flex align-items-center project-header-text pl-2">
                                            {CommonFunction.formatDate(item.closedOn)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex mt-1">
                                <div className="flex">
                                    {item.responsibleUser &&
                                        DisplayUtil.displayChipUser(item.responsibleUser, false, "18px")
                                    }
                                    <small className="pl-2 mt-2">{item.group && item.group.name}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }

    return (
        <XAutoComplete
            {...props}
            // complete method: search data
            // paging: { page: 0, search: "what user's typed", size: 10}
            // params: whatever pass to XAutoComplete's params props
            completeMethod={async (paging, params) => {
                let result = null;
                let conditions = [];
                conditions.push({
                    logicOperator: "AND",
                    conditionType: "RULE",
                    filterType: "FIELD",
                    fieldType: "STRING",
                    fieldName: "name",
                    operator: "LIKE",
                    values: [paging.search]
                });
                TaskUtil.addCondition(conditions, "type", null, null, types);
                if (props.byResponsbile) {
                    TaskUtil.addCondition(conditions, "responsible_id", null, null, props.byResponsbile);
                }
                if (group) {
                    TaskUtil.addCondition(conditions, "group_id", null, null, [group.id]);
                }
                if (props.rootType) {
                    TaskUtil.addCondition(conditions, "root_type", null, null, props.rootType);
                }
                if (props.rootKey) {
                    TaskUtil.addCondition(conditions, "root_key", null, null, props.rootKey);
                }
                if (props.notDoneTask) {
                    TaskUtil.addCondition(conditions, "state", null
                        , "IN", [TaskUtil.S().DONE, TaskUtil.S().CANCELED, TaskUtil.S().COMPLETED], " AND NOT");
                }
                if (props.notCanceledTask) {
                    TaskUtil.addCondition(conditions, "state", null, null, TaskUtil.S().CANCELED, " AND NOT");
                }
                lazy.page = paging.page;
                lazy.size = paging.size;
                lazy.body = {};
                lazy.body.include = ['involves'];
                lazy.body.conditions = conditions;
                lazy.body.application = application;
                lazy.body.checkPermission = true;
                lazy.body.conditions = conditions;
                lazy.body.refId = group ? group.id : 0;
                let taskProjects = [];
                let listTasks = [];
                let _listTasksWorkGroup = await TaskBaseApi.list(lazy);
                if (_listTasksWorkGroup && _listTasksWorkGroup.content) {
                    taskProjects = _listTasksWorkGroup.content.map(t => t.task) || [];
                }
                listTasks = taskProjects;
                if (listTasks && listTasks.length > 0) {
                    result = {
                        data: listTasks,
                        page: paging.page,
                        size: paging.size,
                        total: listTasks.length
                    }
                }
                return result;
            }}
            value={value}
            onChange={onChange}
            className={className}
            itemTemplate={(item) => itemTemplate(item)}
            selectedItemTemplate={(item) => selectedTemplate(item)}
        />
    )
}

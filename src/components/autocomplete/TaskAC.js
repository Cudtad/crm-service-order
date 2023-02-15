import {AutoComplete} from "primereact/autocomplete";
import React, {useContext, useState} from 'react';
import "./scss/UserAC.scss";
import _ from "lodash";
import CommonFunction from '@lib/common';
import TaskService from "services/TaskService";

import {Tooltip} from "primereact/tooltip";
import classNames from "classnames";
import {Chip} from "primereact/chip";


export const TaskAC = (props) => {

    const [filtered, setFiltered] = useState(null);
    const { user } = props;
    const t = CommonFunction.t;

    const [lazy, setLazy] = useState({
        page: 0,
        size: 25,
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

    const search = (event, data) => {
        let _lazy = _.cloneDeep(lazy);
        let conditions = [];
        conditions.push({
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "STRING",
            fieldName: "name",
            operator: "LIKE",
            values: [event.query.toLowerCase()]
        });
        let _groupIds = []
        if(props.groupIds && props.groupIds.length > 0){
            _groupIds = props.groupIds;
        }else{
            _groupIds = window.app_context.user.groups.map(m => m.id);
        }
        conditions.push({
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "LONG",
            fieldName: "group_id",
            operator: "IN",
            values: _groupIds
        });

        _lazy.condition.conditions = conditions;


        if (!event.query.trim().length) {
            setFiltered(data);
        } else {
            get(event.query.toLowerCase(), _lazy).then(data => {
                setFiltered(data.content)
            });
        }
    }
    const get = async (name, condition) => {
        if(props.type === 'TEMPLATE'){
            return await TaskService.search({
                status: props.status,
                type: props.type,
                filter: name
            })
        }else{
            return await TaskService.getGroupTasks(condition);
        }

    }

    const itemTemplate = (item) => {
        return (
            <div className={`project-column-definition milestone-task-container`} >
                <div className="milestone-task-detail">
                    <div>
                        {/* task info */}
                        <div className="align-items-center milestone-task-item-info">
                            <div className="flex flex-column">
                                <div className="flex align-items-stretch">
                                    <Tooltip target={`.user-task-state.${item.state}`} content={t(`request.task.state.${item.state}`)} position="bottom" />
                                    <i className={classNames({
                                        "user-task-state project-list-quick-action bx": true,
                                        "PENDING bx-pause text-grey-7": item.state === "PENDING",
                                        "IN_PROGRESS bx-play text-teal": item.state === "IN_PROGRESS",
                                        "DEFERRED bx-stopwatch text-orange-9": item.state === "DEFERRED",
                                        "CANCELED bx-x text-red-9": item.state === "CANCELED",
                                        "COMPLETED bx-check text-green": item.state === "COMPLETED",
                                        "REVIEWING bx-help text-purple": item.state === "REVIEWING"
                                    })} style={{ lineHeight: "16px" }} />
                                    <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom" />
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
                                            <span  className="link-button mr-2">{item.name}</span>
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
                                    <Chip
                                        label={item.responsibleUser.fullName}
                                        image={CommonFunction.getImageUrl(item.responsibleUser.avatar, item.responsibleUser.fullName)}
                                        className="tiny text-ellipsis task-page-responsible-by-user-tooltip"/>
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
        <AutoComplete
            disabled={props.disabled}
            autoHighlight
            id={props.id}
            type={props.type}
            status={props.status}
            value={props.value}
            suggestions={filtered}
            completeMethod={search}
            multiple
            getFirst={props.getFirst}
            delay={100}
            style={props.style}
            onChange={props.onChange}
            onBlur={props.onBlur}
            className={props.className}
            placeholder={props.placeholder}
            selectedItemTemplate={(item) => itemTemplate(item)}
            itemTemplate={(item) => itemTemplate(item)}
        />
    )
}

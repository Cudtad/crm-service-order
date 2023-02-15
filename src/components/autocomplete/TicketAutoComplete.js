import React, { useContext, useState } from 'react';
import "./scss/UserAC.scss";
import CommonFunction from '@lib/common';

import { Tooltip } from "primereact/tooltip";
import classNames from "classnames";
import { Chip } from "primereact/chip";

// import XAutoComplete from "@ngdox/ui-lib/dist/components/x-autocomplete/XAutoComplete";
import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import TicketApi from 'services/TicketApi';

export const TicketAutoComplete = (props) => {

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

    const { value, onChange, className, projectId, type, status, placeholder, itemDisplay } = props;

    const selectedTemplate = (item) => {
        return (
            <>
                { itemDisplay &&
                    <div className={`project-column-definition milestone-task-container`} >
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
                                                })} style={{lineHeight: "16px"}} />
                                                    <Tooltip target={`.user-important-task`} content={t(`task.important`)} position="bottom" />
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
                                            <Chip
                                                label={item.responsibleUser.fullName}
                                                image={CommonFunction.getImageUrl(item.responsibleUser.avatar, item.responsibleUser.fullName)}
                                                className="tiny text-ellipsis task-page-responsible-by-user-tooltip"/>
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
                { !itemDisplay &&
                    itemTemplate(item)
                }
            </>


        )
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
                                        <Chip
                                            label={item.responsibleUser.fullName}
                                            image={CommonFunction.getImageUrl(item.responsibleUser.avatar, item.responsibleUser.fullName)}
                                            className="tiny text-ellipsis task-page-responsible-by-user-tooltip" />
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
                let res = null;

                if (props.type === 'TEMPLATE') {
                    res = await TicketApi.list({
                        status: status,
                        type: type,
                        filter: paging.search
                    })
                } else {
                    let _params = {
                            page: 0,
                            size: 20,
                            sortField: "create_date",
                            sortOrder: 1,
                            body: {
                                props: ["id", "name", "projectId", "deadline", "state", "type", "code", "create_date"],
                                conditions: [
                                    {
                                        conditionType: "GROUP",
                                        filterType: "ROLE",
                                        logicOperator: "",
                                        children :[
                                            {
                                                logicOperator: "",
                                                conditionType: "RULE",
                                                filterType: "FIELD",
                                                fieldType: "LONG",
                                                fieldName: "project_id",
                                                operator: "=",
                                                values:[projectId]
                                            },
                                            {
                                                logicOperator: "AND",
                                                conditionType: "RULE",
                                                filterType: "FIELD",
                                                fieldType: "STRING",
                                                fieldName: "type",
                                                operator: "IN",
                                                values: [
                                                    "TICKET","PROBLEM","CHANGE"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        };
                    if (paging.search !== "") {
                        _params.body.conditions.push({
                            logicOperator: "AND",
                            conditionType: "RULE",
                            filterType: "FIELD",
                            fieldType: "STRING",
                            fieldName: "name",
                            operator: "LIKE",
                            values: [paging.search]
                        });
                    }
                    setLazy(_params);
                    res = await TicketApi.list(_params);
                }
                if (res && res.content && res.content.length > 0) {
                    result = {
                        data: (res.content.map(m=>m.task)),
                        page: res.page,
                        size: res.pageSize,
                        total: res.total
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

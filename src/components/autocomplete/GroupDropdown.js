import CommonFunction from '@lib/common';
                    import React from "react";
import {Badge} from "primereact/badge";
import {Dropdown} from "primereact/dropdown";

import classNames from "classnames";

export const GroupDropdown = (props) => {

    const t = CommonFunction.t;

    return (
        <Dropdown
            filter
            showClear
            filterBy="name"
            id={props.id}
            disabled={props.disabled}
            value={props.value}
            options={props.listGroups}
            onChange={props.onChange}
            optionLabel="name"
            optionValue="id"
            className={props.className}
            itemTemplate={(item) => {
                return (
                    <div className="combo_task-page-search-group-item-container flex align-items-stretch overflow-hidden">
                        <div className="flex align-items-center justify-content-center">
                            <Badge
                                value={t('group.type.' + item.type)}
                                className={classNames({
                                    "mr-2": true,
                                    "bg-lime-3": item.type === "1",
                                    "bg-orange": item.type === "org",
                                    "bg-yellow-10": item.type === "job",
                                    "bg-green": item.type === "project",
                                    "bg-teal-10": item.type === "project.member",
                                    "bg-teal-7": item.type === "phase"
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
    )
}

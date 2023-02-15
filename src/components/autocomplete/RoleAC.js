import React, {useState} from "react";
import {AutoComplete} from "primereact/autocomplete";

import RoleApi from "services/RoleService";
import classNames from "classnames";

export const RoleAC = (props) => {
    const [filtered, setFiltered] = useState(null);

    const search = (event) => {
        if (!event.query.trim().length) {
            setFiltered([]);
        } else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data.content)
            });
        }
    }

    const get = async (searchTerm = []) => {
        return await RoleApi.get({
            groupId: props.groupId ? props.groupId : -1,
            filter: searchTerm,
            rows: 50
        })
    }

    return (
        <AutoComplete
            id={props.id}
            autoHighlight
            multiple
            delay={100}
            groupId={props.groupId}
            disabled={props.disabled}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            field={props.field ? props.field : 'name'}
            className={props.className + ""}
            suggestions={filtered}
            completeMethod={search}
            itemTemplate={(item) => {
                return (
                    <div className={classNames({"p-text-line-through": item.status < 1})}>{item[props.field ? `${props.field}` : 'name']}</div>
                );
            }}
        />
    )
}

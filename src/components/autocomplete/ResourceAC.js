import React, {useState} from "react";
import {AutoComplete} from "primereact/autocomplete";

import ResourceApi from "services/ResourceService";

export const ResourceAC = (props) => {
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
        return await ResourceApi.get({
            filter: searchTerm,
            rows: 50
        })
    }

    return (
        <AutoComplete
            autoHighlight
            id={props.id}
            multiple
            delay={100}
            disabled={props.disabled}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            field={props.field ? props.field : 'name'}
            className={props.className + ""}
            suggestions={filtered}
            completeMethod={search}
        />
    )
}

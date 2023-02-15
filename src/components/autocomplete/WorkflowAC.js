import {AutoComplete} from "primereact/autocomplete";
import React, {useState} from "react";
import WorkflowApi from "services/WorkflowApi";

export const WorkflowAC = (props) => {

    const [filtered, setFiltered] = useState(null);

    const search = (event, users) => {
        if (!event.query.trim().length) {
            setFiltered(users);
        }
        else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data)
            });
        }
    }
    const get = async (searchTerm = []) => {
        return await WorkflowApi.get({
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

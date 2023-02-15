import {AutoComplete} from "primereact/autocomplete";
import React, {useState} from "react";
import CustomFieldConfigApi from "services/CustomFieldConfigService";

export const ConfigAC = (props) => {

    const [filtered, setFiltered] = useState(null);

    const search = (event, users) => {
        if (!event.query.trim().length) {
            setFiltered(users);
        } else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data.content)
            });
        }
    }
    const get = async (searchTerm = []) => {
        return await CustomFieldConfigApi.get({
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
            disabled={props.disabled}
            value={props.value}
            onChange={props.onChange}
            onSelect={props.onSelect}
            onBlur={props.onBlur}
            field={props.field ? props.field : 'name'}
            className={props.className + ""}
            suggestions={filtered}
            completeMethod={search}
        />
    )
}

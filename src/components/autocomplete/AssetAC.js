import {AutoComplete} from "primereact/autocomplete";
import React, {useState} from "react";
import AssetApi from "services/AssetService";

export const AssetAC = (props) => {
    const [filtered, setFiltered] = useState(null);

    const search = (event, users) => {
        if (!event.query.trim().length) {
            setFiltered(users);
        } else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data.content);
            });
        }
    }
    const get = (searchTerm = []) => {
        return AssetApi.get({
            filter: searchTerm,
            rows: 50
        });
    }

    return (
        <AutoComplete
            id={props.id}
            autoHighlight
            multiple
            delay={100}
            autoFocus={props.autoFocus}
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

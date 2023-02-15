import React, {useState} from "react";
import {AutoComplete} from "primereact/autocomplete";

import GroupApi from "services/GroupService";

import {Badge} from "primereact/badge";
import {Divider} from "primereact/divider";
import classNames from "classnames";

export const OrgAC = (props) => {
    const [filtered, setFiltered] = useState(null);

    const search = (event) => {
        if (!event.query.trim().length) {
            setFiltered([]);
        } else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data.content);
            });
        }
    }

    const get = async (searchTerm = []) => {
        return await GroupApi.get({
            type: props.groupType ? props.groupType : '',
            filter: searchTerm,
            rootGroupId: props.rootGroupId ? props.rootGroupId: -1,
            status : 1,
            rows: 50
        });
    }
    const onBlur = (e) =>{
        if(props.removeUnknowItem){
            let _element = document.getElementsByName(`orgAC_${props.id}`);
            if(_element && _element.length > 0){
                _element[0].value = '';
            }
        }

        if(props.onBlur){
            props.onBlur(e);
        }
    }
    return (
        <AutoComplete
            id={props.id}
            multiple
            autoHighlight
            name={`orgAC_${props.id}`}
            delay={100}
            disabled={props.disabled}
            autoFocus={props.autoFocus}
            groupType={props.groupType}
            path={props.path}
            value={props.value}
            onChange={props.onChange}
            onBlur={onBlur}
            className={props.className + ""}
            suggestions={filtered}
            completeMethod={search}
            placeholder={props.placeholder}
            selectedItemTemplate={(item) => {
                return (
                    <span className={classNames({"dense":true, "pl-2": true, "p-text-line-through": (!item.status || item.status < 1) })}>
                        {item.name}
                    </span>
                )
            }}
            itemTemplate={(item) => {
                return (
                    <div style={{maxWidth: "300px"}}>
                        <div className="mb-0">
                            <Badge value={item.type} severity="info" className="pr-2 pl-2" />
                            <span className={classNames({ "pl-2": true, "p-text-line-through": (!item.status || item.status < 1) })}>
                                {item.name}
                            </span>
                        </div>
                        <Divider type="dotted" style={{margin: '3px'}}/>
                        <div className="p-text-light pl-2" style={{fontSize: 'x-small'}}>
                            {item.path}
                        </div>
                    </div>
                )
            }}
        />
    )
}

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom'
import classNames from "classnames";


// Style
// import "./styles.scss";

// Utility
import _ from "lodash";

// Component
import { AutoComplete } from "primereact/autocomplete";

// API
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import CommonFunction from '@lib/common';
import { convertUsers } from "features/crm/utils";

export const CrmUserAutoComplete = (props) => {

    const t = CommonFunction.t;
    const [filteredUser, setFilteredUser] = useState(null);

    const { setRef, users, value, multiple, itemTemplate } = props;

    const [_users, setUsers] = useState([]);

    useEffect(() => {
        if (users && users.length) {
            setUsers(convertUsers(users))
            setFilteredUser(users)
        }
    }, [users]);

    const searchUser = (event, us) => {
        if (!event.query.trim().length) {
            setFilteredUser(us);
        } else {
            setFilteredUser(_.filter(_users, o => o._key && o._key.indexOf(event.query?.toLowerCase()) != -1))
        }
    }

    const onBlur = (e) => {
        if (props.removeUnknowItem) {
            let _element = document.getElementsByName(`userAC_${props.id}`);
            if (_element && _element.length > 0) {
                _element[0].value = '';
            }
        }

        if (props.onBlur) {
            props.onBlur(e);
        }
    }

    const onChange = (e) => {
        if (multiple) {
            props.onChange({value: e.value})
        } else {
            if (e.value.length) {
                props.onChange({value: [e.value[e.value.length - 1]]})
            } else {
                props.onChange({value: []})
            }
        }
    }

    return (

        <AutoComplete
            ref={setRef}
            autoHighlight
            disabled={props.disabled}
            autoFocus={props.autoFocus}
            id={props.id}
            name={`userAC_${props.id}`}
            value={value}
            suggestions={filteredUser}
            completeMethod={searchUser}
            multiple
            delay={100}
            style={props.style}
            inputStyle={props.inputStyle}
            onChange={onChange}
            onBlur={onBlur}
            className={props.className + " user-ac"}
            inputClassName={props.inputClassName}
            panelClassName={props.panelClassName}
            placeholder={props.placeholder}
            itemTemplate={itemTemplate ? itemTemplate : (item) => (
                <XAvatar
                    name={item.fullName} avatar={item.avatar} 
                    label={() => item.fullName}
                    size="20px"
                ></XAvatar>
            )}
            selectedItemTemplate={(item) => (
                <div title={item.orgs && item.orgs.length > 0 ? `${t("org")}: ${item.orgs.map(m => m.name).join(", ")}` : ""}>
                    <XAvatar
                        name={item.fullName} avatar={item.avatar} 
                        label={() => item.fullName}
                        size="18px"
                    ></XAvatar>
                </div>
            )}
        />

    )
}

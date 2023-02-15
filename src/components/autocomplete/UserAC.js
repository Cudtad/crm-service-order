import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom'
import classNames from "classnames";


// Style
import "./scss/UserAC.scss";

// Utility
import _ from "lodash";

// Component
import { AutoComplete } from "primereact/autocomplete";

// API
import UserApi from "services/UserService";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import CommonFunction from '@lib/common';

export const UserAC = (props) => {

    const t = CommonFunction.t;
    const [filteredUser, setFilteredUser] = useState(null);
    const { setRef } = props;

    useEffect(() => {
        // console.log(props.value)
    }, []);

    const searchUser = (event, users) => {
        if (!event.query.trim().length) {
            setFilteredUser(users);
        } else {
            get(event.query.toLowerCase()).then(data => {
                let response = data.content;
                if (props.value && props.value.length > 0 && response && response.length > 0) {
                    props.value.map((e, count) => {
                        if (e) {
                            response.map((i, index) => {
                                if (e.id && e.id === i.id) {
                                    response.splice(index, 1);
                                }
                            })
                        }
                    })
                }
                setFilteredUser(response);
            });
        }
    };
    const get = async (searchTerm = []) => {
        let _groupIds = '';
        if (props.groupIds) {
            if (props.groupIds.length > 0) {
                _.forEach(props.groupIds, function (value) {
                    _groupIds = _groupIds + (_groupIds === '' ? '' : ',') + (value || "");
                });
            } else {
                _groupIds = '-9';
            }
        }
        let _exUserIds = '';
        if (props.excludeUserIds && props.excludeUserIds.length > 0) {
            _.forEach(props.excludeUserIds, function (value) {
                _exUserIds = _exUserIds + (_exUserIds === '' ? '' : ',') + (value || "");
            });
        }
        let _inUserIds = '';
        if (props.includeUserIds && props.includeUserIds.length > 0) {
            _.forEach(props.includeUserIds, function (value) {
                _inUserIds = _inUserIds + (_inUserIds === '' ? '' : ',') + (value || "");
            });
        }
        return await UserApi.search({
            filter: searchTerm,
            groupIds: _groupIds,
            exclude: _exUserIds,
            include: _inUserIds,
            size: 20
        });
    };

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

    return (

        <AutoComplete
            ref={setRef}
            autoHighlight
            disabled={props.disabled}
            autoFocus={props.autoFocus}
            id={props.id}
            name={`userAC_${props.id}`}
            value={props.value}
            suggestions={filteredUser}
            completeMethod={searchUser}
            multiple
            delay={100}
            style={props.style}
            inputStyle={props.inputStyle}
            onChange={props.onChange}
            onBlur={onBlur}
            className={props.className + " user-ac"}
            inputClassName={props.inputClassName}
            panelClassName={props.panelClassName}
            placeholder={props.placeholder}
            itemTemplate={(item) => (
                <XAvatar
                    src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                    label={() => item.fullName}
                    size="20px"
                ></XAvatar>
            )}
            selectedItemTemplate={(item) => (
                <div title={item.orgs && item.orgs.length > 0 ? `${t("org")}: ${item.orgs.map(m => m.name).join(", ")}` : ""}>
                    <XAvatar
                        src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                        label={() => item.fullName}
                        size="18px"
                    ></XAvatar>
                </div>
            )}
        />

    )
}

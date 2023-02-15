import React, { useEffect, useRef, useState } from 'react';
import "./scss/UserAutoComplete.scss";
import CommonFunction from '@lib/common';

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import UserApi from 'services/UserService';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import _ from 'lodash';

export const UserAutoComplete = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, className, groupIds, excludeUserIds, includeUserIds, multiple, style, placeholder, disabled, useCache } = props;
    const refValue = useRef(null);
    const [userList, setUserList] = useState(null);

    useEffect(() => {
        if (value && Array.isArray(value)) {
            if (refValue.current !== JSON.stringify(value)) {
                refValue.current = JSON.stringify(value);

                let _value = value.filter(f => f); // remove null object

                if (_value.length > 0) {
                    if (useCache) {
                        // if use cache, check value type string or object
                        let ids = typeof _value[0] === "string" ? _value : value.map(m => m.id);
                        window.cache.user.getList(ids).then((_users) => {
                            setUserList(_users);
                        });
                    } else {
                        // if not use cache, use value as autocomplete's value
                        setUserList(_value);
                    }
                } else {
                    setUserList(null);
                }
            }
        } else {
            setUserList(null);
        }
    }, [value])

    return (
        <XAutoComplete
            // complete method: search data
            // paging: { page: 0, search: "what user's typed", size: 10}
            // params: whatever pass to XAutoComplete's params props
            disabled={disabled}
            multiple={multiple}
            completeMethod={async (paging, params) => {
                let result = null;
                let res = null;

                let _groupIds = '';
                if (groupIds) {
                    _groupIds = groupIds.length > 0 ? groupIds.join(",") : "-9";
                }

                let _exUserIds = excludeUserIds && excludeUserIds.length > 0 ? excludeUserIds.join(",") : '';

                let _inUserIds = includeUserIds && includeUserIds.length > 0 ? includeUserIds.join(",") : '';

                res = await UserApi.search({
                    filter: paging.search,
                    groupIds: _groupIds,
                    exclude: _exUserIds,
                    include: _inUserIds,
                    page: paging.page,
                    size: paging.size,
                });

                if (res && res.content && res.content.length > 0) {
                    result = {
                        data: res.content,
                        page: res.page,
                        size: res.pageSize,
                        total: res.total
                    }
                }

                return result;
            }}
            value={userList || null}
            onChange={onChange}
            className={`user-autocomplete ${className || ""}`}
            panelClassName="user-autocomplete-panel"
            style={style}
            placeholder={placeholder}
            itemTemplate={(item) => (
                <XAvatar
                    src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                    label={() => (<>
                        <div className="user-autocomplete-fullname">{item.fullName}</div>
                        <div className="user-autocomplete-email">{item.email}</div>
                    </>)}
                    size="28px"
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

import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import CommonFunction from '@lib/common';
import React, { useEffect, useRef, useState } from 'react';

import { HcmEmployeeApi } from "services/hcm/HcmEmployeeService";
import "./scss/UserAutoComplete.scss";
import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
// get data with employee has state !quit(nghỉ việc)
//dictionary : danh mục trạng thái hồ sơ
export const EmployeeDropdown = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, className, orgId, excludeUserIds, includeUserIds, multiple, style, placeholder, disabled,dictionary } = props;
    const refValue = useRef(null);
    const [userList, setUserList] = useState(null);
    useEffect(() => {
        if (value && Array.isArray(value) && refValue.current !== JSON.stringify(value)) {
            refValue.current = JSON.stringify(value);

            if (value.length > 0) {
                setUserList(value);
            } else {
                setUserList(null);
            }
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
                let f = {
                    states: [],
                    keyword: paging.search,
                };
                const _f = dictionary?.profile_status.filter((i) => i.code !== "quit");
                _f.forEach((i) => f.states.push(i.code));
                res = await HcmEmployeeApi.filterE(f);

                if (res && res.content && res.content.length > 0) {
                    result = {
                        data: res.content,
                        page: res.page,
                        size: res.pageSize,
                        total: res.total,
                    };
                }

                return result;
            }}
            value={userList}
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

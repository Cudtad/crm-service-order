import React, {useEffect, useRef, useState} from 'react';
import "./scss/UserAutoComplete.scss";
import CommonFunction from '@lib/common';

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import {HcmEmployeeApi} from "services/hcm/HcmEmployeeService";

export const EmployeeAutoComplete = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, className, orgId, excludeUserIds, includeUserIds, multiple, style, placeholder, disabled, fullItemLabel } = props;
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

    const fullItemTemplate = (item) => {
        return (<div className="flex flex-column">
            <XAvatar
                src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                label={() => (<>
                    <div className="user-autocomplete-fullname">{item.fullName}</div>
                    <div className="user-autocomplete-email">{item.workEmail}</div>
                </>)}
                size="28px"
            ></XAvatar>
            <small style={{fontWeight: '300'}}>{item.title ? '(' + item.title + ')' : ''}</small>
        </div>);
    }
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

                res = await HcmEmployeeApi.search(
                    orgId,
                    true,
                    paging.search,
                    1,
                    paging.page,
                    paging.size
                );

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
            value={userList}
            onChange={onChange}
            className={`user-autocomplete ${className || ""}`}
            panelClassName="user-autocomplete-panel"
            style={style}
            placeholder={placeholder}
            itemTemplate={(item) => {
                if(!fullItemLabel){
                return (
                    <div title={item.orgs && item.orgs.length > 0 ? `${t("org")}: ${item.orgs.map(m => m.name).join(", ")}` : ""}>
                        <XAvatar
                            src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                            label={() => item.fullName}
                            size="16px"
                        ></XAvatar>
                    </div>
                )
            }else{
                return fullItemTemplate(item)
            }}}
            selectedItemTemplate={(item) => {
                if(!fullItemLabel){
                    return (
                        <div title={item.orgs && item.orgs.length > 0 ? `${t("org")}: ${item.orgs.map(m => m.name).join(", ")}` : ""}>
                            <XAvatar
                                src={CommonFunction.getImageUrl(item.avatar, item.fullName)}
                                label={() => item.fullName}
                                size="16px"
                            ></XAvatar>
                        </div>
                    )
                }else{
                    return fullItemTemplate(item)
                }
            }}
        />
    )
}

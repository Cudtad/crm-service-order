import React, { useEffect, useRef, useState } from 'react';
import "./scss/UserAutoComplete.scss";
import CommonFunction from '@lib/common';

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import UserApi from 'services/UserService';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import _ from 'lodash';
import {HcmEmployeeApi} from "services/hcm/HcmEmployeeService";
import {Badge} from "primereact/badge";
import classNames from "classnames";
import {Divider} from "primereact/divider";
import {HcmOrganizationApi} from "services/hcm/HcmOrganizationService";

export const OrgAutoComplete = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, className, orgId, excludeUserIds, includeUserIds, multiple, style, placeholder, disabled, isActive } = props;
    const refValue = useRef(null);
    const [orgList, setOrgList] = useState(null);

    useEffect(() => {
        if (value && Array.isArray(value) && refValue.current !== JSON.stringify(value)) {
            refValue.current = JSON.stringify(value);

            if (value.length > 0) {
                setOrgList(value);
            } else {
                setOrgList(null);
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

                res = await HcmOrganizationApi.search({ search: paging.search, ...(isActive ? { status: 1 } : null) });

                if (res && res.length > 0) {
                    result = { data: isActive ? res.filter(el => el.status === 1) : res }
                }

                return result;
            }}
            value={orgList}
            onChange={onChange}
            className={`user-autocomplete ${className || ""}`}
            panelClassName="user-autocomplete-panel"
            style={style}
            placeholder={placeholder}
            itemTemplate={(item) => (
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
            )}
            selectedItemTemplate={(item) => (
                <span className={classNames({"dense":true, "pl-2": true, "p-text-line-through": (!item.status || item.status < 1) })}>
                    {item.name}
                </span>
            )}
        />
    )
}

import React, { useEffect, useRef, useState } from 'react';
import "./scss/UserAutoComplete.scss";
import CommonFunction from '@lib/common';

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import UserApi from 'services/UserService';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import _ from 'lodash';
import DictionaryApi from "services/DictionaryService";
import {HcmEmployeeApi} from "services/hcm/HcmEmployeeService";
export const BankAutoComplete = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, multiple, style, placeholder, disabled } = props;
    const refValue = useRef(null);
    const [bankList, setBankList] = useState(null);
    useEffect(() => {
        if (value && Array.isArray(value) && refValue.current !== JSON.stringify(value)) {
            refValue.current = JSON.stringify(value);

            if (value.length > 0) {
                setBankList(value);
            } else {
                setBankList(null);
            }
        }
    }, [value])
    return <XAutoComplete
        // complete method: search data
        // paging: { page: 0, search: "what user's typed", size: 10}
        // params: whatever pass to XAutoComplete's params props
        disabled={disabled}
        multiple={multiple}
        completeMethod={async (paging, params) => {
            let result = null;
            let res = null;

            res = await DictionaryApi.search(
                {application:"common",type:"bank",search:paging.search,}
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
        value={bankList}
        onChange={onChange}
        style={style}
        placeholder={placeholder}
        delay={500}
        itemTemplate={(item) => {
            return(
                <div>{item.name}</div>
        )}}
        selectedItemTemplate={(item) => (
            <div>{item.name}</div>
        )}
    />
}

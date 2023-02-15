import CommonFunction from '@lib/common';
                    import React, {useContext, useState} from 'react';
import "./scss/UserAC.scss";


import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import TerritoryApi from 'services/TerritoryService';

export const TerritoryAutoCompleteDetail = (props) => {
    const [filtered, setFiltered] = useState(null);
    const { user } = props;
    const t = CommonFunction.t;

    const {value, onChange, type, parent, className, disabled ,api} = props;

    const itemTemplate = (item) => {
        return (
            <div>
                <span>{item.name}</span>
            </div>
        )
    };

    const selectedItemTemplate = (item) => {
        return (
            <div>
               <span>{item.name}</span>
            </div>
        )
    };


    return (
        <XAutoComplete
            {...props}            
            completeMethod={async (paging) => {
                let result = {data:[]};
                let res = null;
                let params = {
                    search: paging.search,
                    type: type,
                    parent: parent,
                    page: paging.page,
                    size: paging.size,
                }
                res = await (api||TerritoryApi).get(params);

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
            id={props.id}
            value={value}
            disabled={disabled}
            onChange={onChange}
            className={className}
            itemTemplate={(item) => itemTemplate(item)}
            selectedItemTemplate={(item) => selectedItemTemplate(item)}
        />
    )
}

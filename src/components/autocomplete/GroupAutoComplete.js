import CommonFunction from '@lib/common';
                    import React from 'react';
import "./scss/UserAC.scss";
import classNames from "classnames";

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import GroupApi from 'services/GroupService';
import Badges from '@ui-lib/badges/Badges';

export const GroupAutoComplete = (props) => {
    const t = CommonFunction.t;
    const { value, onChange, className, multiple, groupType, rootGroupId, style, disabled } = props;

    return (
        <XAutoComplete
            // complete method: search data
            // paging: { page: 0, search: "what user's typed", size: 10}
            // params: whatever pass to XAutoComplete's params props
            disabled={disabled}
            multiple={multiple}
            completeMethod={async (paging, params) => {
                let result = null;

                let res = await GroupApi.get({
                    type: groupType ? groupType : '',
                    filter: paging.search,
                    rootGroupId: rootGroupId ? rootGroupId : -1,
                    status: 1,
                    page: paging.page,
                    rows: paging.size
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
            value={value}
            onChange={onChange}
            className={className}
            style={style}
            itemTemplate={(item) => {
                return (
                    <div style={{ maxWidth: "500px", whiteSpace: "normal" }}>
                        <Badges pill soft span className="bg-blue-2 text-blue-9">{t(item.type)}</Badges>
                        <span className={classNames({ "pl-2": true, "p-text-line-through": (!item.status || item.status < 1) })}>
                            {item.name}
                        </span>
                        <div className="tiny text-grey-5">
                            {item.pathName}
                        </div>
                    </div>
                )
            }}
            selectedItemTemplate={(item) => {
                return (
                    <span className={classNames({ "p-text-line-through": (!item.status || item.status < 1) })}>
                        {item.name}
                    </span>
                )
            }}
        />
    )
}

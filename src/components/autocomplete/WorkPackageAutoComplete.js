import React, {useContext, useState} from 'react';
import "./scss/UserAC.scss";
import CommonFunction from '@lib/common';


import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import WorkPackageApi from "services/WorkPackageService";
import DisplayUtil from "../util/DisplayUtil";
import PhaseApi from "services/PhaseService";

export const WorkPackageAutoComplete = (props) => {

    const [filtered, setFiltered] = useState(null);
    const { user } = props;
    const t = CommonFunction.t;

    const { value, onChange, className, projectId, phaseId, versionId, status, disabled, ignoreId,task } = props;

    const itemTemplate = (item) => {
        return (
            <div>
                <div className="flex align-items-stretch">
                    <i className="ml-1 mr-2 bx bxs-package"/>
                    <div className="flex align-items-center">
                        <div>
                            <span className="mr-3">{item.code} - {item.name}</span>
                        </div>
                        <div>{CommonFunction.formatDate(item.startDate)} - {CommonFunction.formatDate(item.endDate)}  {item.projectVersion && item.projectVersion.versionNo? "- ver:"+item.projectVersion.versionNo:"" }</div>
                    </div>
                    {DisplayUtil.displayChipUser(item.involveUser)}
                </div>
            </div>
        )
    };

    const selectedItemTemplate = (item) => {
        return (
            <div>
                <div className="flex align-items-stretch">
                    <i className="ml-1 mr-2 bx bxs-package"/>
                    <div className="flex align-items-center">
                        <div>
                            <span className="link-button mr-3">{task && task.phaseName? task.phaseName : ''} - {item.code}:{item.name}</span>
                        </div>
                        <div>{CommonFunction.formatDate(item.startDate)} - {CommonFunction.formatDate(item.endDate)} {item.projectVersion && item.projectVersion.versionNo? "- ver:"+item.projectVersion.versionNo:"" }</div>
                    </div>
                    {DisplayUtil.displayChipUser(item.involveUser)}
                </div>
            </div>
        )
    };

    const bindData = (data) => {
        if (ignoreId) {
            data = data.filter(o => o.id !== ignoreId)
        }
        return data;
    }

    const onBlur = (e) =>{
        if(props.removeUnknowItem){
            let _element = document.getElementsByName(`workpackageAC_${props.id}`);
            if(_element && _element.length > 0){
                _element[0].value = '';
            }
        }

        if(props.onBlur){
            props.onBlur(e);
        }
    }

    return (
        <XAutoComplete
            // complete method: search data
            // paging: { page: 0, search: "what user's typed", size: 10}
            // params: whatever pass to XAutoComplete is params props
            completeMethod={async (paging, params) => {
                let result = null;
                let res = null;
                let _search = paging.search? paging.search.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''):"";
                res = await WorkPackageApi.get({ ...paging, filter: _search, projectId, phaseId, versionId });
                if (res && res.content && res.content.length > 0) {
                    result = {
                        data: bindData(res.content),
                        page: res.page,
                        size: res.pageSize,
                        total: res.total
                    }
                }

                return result;
            }}
            id={props.id}
            name={`workpackageAC_${props.id}`}
            value={value}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            className={className}
            itemTemplate={(item) => itemTemplate(item)}
            selectedItemTemplate={(item) => selectedItemTemplate(item)}
        />
    )
}

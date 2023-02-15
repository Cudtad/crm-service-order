import CommonFunction from '@lib/common';
                    import React, {useState,useEffect} from "react";
import {AutoComplete} from "primereact/autocomplete";

import AgentApi from "services/AgentService";
import classNames from "classnames";
import ResourceAllocatePlanApi from "services/ProjectResourceAllocatePlanService";
import _ from 'lodash';
import {Divider} from "primereact/divider";
export const AgentAC = (props) => {
    const [filtered, setFiltered] = useState(null);
    const [projectRoles, setProjectRoles] = useState([]);
    const t = CommonFunction.t;
  
    useEffect(() => {
        ResourceAllocatePlanApi.getProjectRoleByProjectId(props.projectId||0).then(data => {
            if (data && data.content) {
                setProjectRoles(data.content)
            } else {
                setProjectRoles([])
            }

        });
    }, [])


    const search = (event) => {
        if (!event.query.trim().length) {
            setFiltered([]);
        } else {
            get(event.query.toLowerCase()).then(data => {
                if (data) {
                    if (data.content && data.content.length > 0) {
                        data.content.map((_item) => {
                            if(_item.roleId) {
                                let _role = _.find(projectRoles, {roleId:_item.roleId});
                                _item.role = _role
                            }
                        })
                    }
                    setFiltered(data.content);
                }else {
                    setFiltered([]);
                }
            });
        }
    }
    const get = async (searchTerm = []) => {
        return await AgentApi.get({
            filter: searchTerm,
            groupId: props.inGroup ? props.inGroup[0].id : 0 ,
            rootGroupId : props.rootGroupId ? props.rootGroupId : 0,
            rows: 50
        })
    }

    return (
        <AutoComplete
            id={props.id}
            autoHighlight
            multiple
            delay={100}
            disabled={props.disabled}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            field={props.field ? props.field : 'name'}
            className={props.className + ""}
            suggestions={filtered}
            completeMethod={search}
            itemTemplate={(item) => {
                return (
                    <>
                        <div>
                            <div className="mb-0">
                                <span className={classNames({ "pl-2": true })}>
                                    {item[props.field ? `${props.field}` : 'name']}
                                </span>
                            </div>
                            <Divider type="dotted" style={{margin: '3px'}}/>
                            <div className="p-text-light pl-4" style={{fontSize: '12px'}}>
                                <span className="mr-3">{t("agent.code-staff")}: {item.code}</span>
                                {item.role && 
                                    <span>{t("agent.role-name")}: {item.role.name}</span>
                                }
                            </div>
                        </div>
                    </>
                    
                );
            }}
        />
    )
}

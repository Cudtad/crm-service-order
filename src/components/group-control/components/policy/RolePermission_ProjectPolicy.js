import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import CommonFunction from '@lib/common';

import _ from 'lodash';
import GroupApi from 'services/GroupService';
import { XLayout, XLayout_Box, XLayout_Center } from '@ui-lib/x-layout/XLayout';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import RolePermissionEnum from 'components/role-permission/RolePermissionEnum';
import { Dropdown } from 'primereact/dropdown';

/**
 * return {
 *      valid: true/false,
 *      policy: {
 *          "groups":[
 *              { "id" : 1,"scopeType": "direct"},
 *              {"id" : 1, "scopeType": "recursive"}
 *           ],
 *          "types": ["TICKET","CHANGE"]
 *      }
 * }
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function RolePermission_ProjectPolicy(props, ref) {
    const t = CommonFunction.t;
    const { role } = props;
    const [projects, setProjects] = useState([]);
    const refAllProjects = useRef(null);
    const [projectsFilter, setProjectsFilter] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const refPolicy = useRef(null);

    useImperativeHandle(ref, () => ({
        setPolicy: (_policy) => {
            applyPolicy(_policy);
        },
        getPolicy: () => {
            let _policy = _.cloneDeep(refPolicy.current);

            // prepare groups
            let _groups = [];
            for (const key in _policy.groups) {
                _groups.push({
                    id: key,
                    scopeType: _policy.groups[key]
                })
            }
            _policy.groups = _groups;

            return { valid: true, policy: _policy };
        }
    }));

    useEffect(() => {
        applyPolicy();
    }, [role])

    const applyPolicy = async (_policy) => {
        setLoadingProjects(true);
        if (!_policy) {
            _policy = { groups: {} };
            if (role && role.policy) {
                _policy = _.cloneDeep(role.policy);
            }
        }
        refPolicy.current = _policy;

        // get projects if not loaded
        let allProjects = refAllProjects.current ? _.cloneDeep(refAllProjects.current) : null;
        if (!allProjects) {

            let projectResponse = await GroupApi.get({
                type: "project,phase",
                rootGroupId: -1,
                status: 1,
                page: 0,
                rows: 999
            });

            if (projectResponse) {
                let _content = projectResponse.content;
                _content.forEach(el => {
                    el.parentId = el.parentId === 0 ? null : el.parentId;
                });
                let _sortedProjects = _.sortBy(_content, ["name"]);
                allProjects = _sortedProjects;
                refAllProjects.current = _.cloneDeep(_sortedProjects);
            } else {
                allProjects = []
            }
        }

        // prepare policy for projects
        let _projectDataScope = {};
        if (allProjects && allProjects.length > 0) {
            // prepare data scope
            if (_policy && _policy.groups && Array.isArray(_policy.groups) && _policy.groups.length > 0) {
                role.policy.groups.forEach(el => {
                    _projectDataScope[el.id] = el.scopeType
                });
            }

            allProjects.forEach(_group => {
                _group.parentId = _group.parentId && _group.parentId > 0 ? _group.parentId : null;
                _group.key = _group.id;
                _group.data = { filterKey: _group.name };

                // apply data scope
                _group.dataScope = _projectDataScope[_group.id] || null;
            });
            allProjects = CommonFunction.listToTree(allProjects, "id", "parentId", "children");
            allProjects = CommonFunction.buildObjectPath(allProjects);
        }

        _policy.groups = _projectDataScope;

        setProjects(allProjects);
        setLoadingProjects(false);
    }

    /**
     * apply policy group data scope
     * @param {*} _group 
     * @param {*} value 
     */
    const applyPolicyGroupDataScope = (_group, value) => {
        let _projects = _.cloneDeep(projects);
        CommonFunction.setValueByPath(_projects, `${_group._path}.dataScope`, value);

        let _refPolicy = _.cloneDeep(refPolicy.current);

        if (value) {
            _refPolicy.groups[_group.id] = value;
        } else {
            delete _refPolicy.groups[_group.id];
        }
        refPolicy.current = _refPolicy;
        console.log(_refPolicy);
        setProjects(_projects);
    }

    if (role) {
        return (<>
            <XLayout className="pt-2">
                <XLayout_Center className="position-relative">
                    <LoadingBar loading={loadingProjects}></LoadingBar>
                    <XLayout_Box className="h-full p-0 overflow-hidden">
                        <TreeTable
                            value={projects}
                            globalFilter={projectsFilter}
                            filterKey="filterKey"
                            showGridlines
                            scrollable
                        >
                            <Column
                                header={t("project")}
                                field="filterKey"
                                filterMatchMode="contains"
                                body={(m) => (<>
                                    <span title={`${m.code} - ${m.name}`}>{m.name}</span>
                                </>)}
                                expander
                                filter
                                
                                style={{ width: "400px" }}
                            ></Column>
                            <Column
                                field="dataScope"
                                className="p-0"
                                body={(m) => (<>
                                    <Dropdown
                                        options={RolePermissionEnum.dataScope}
                                        value={m.dataScope}
                                        optionLabel="name"
                                        optionValue="code"
                                        onChange={(e) => applyPolicyGroupDataScope(m, e.value)}
                                        filter
                                        showClear
                                        className="inline-grid"
                                    ></Dropdown>
                                </>)}
                                style={{ width: "350px" }}
                            ></Column>
                            <Column></Column>
                        </TreeTable>
                    </XLayout_Box>
                </XLayout_Center>
            </XLayout>
        </>);
    }
    else {
        return <></>
    }
};

RolePermission_ProjectPolicy = forwardRef(RolePermission_ProjectPolicy);

export default RolePermission_ProjectPolicy;

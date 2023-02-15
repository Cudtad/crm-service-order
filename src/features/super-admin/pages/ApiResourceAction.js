import React, {useEffect, useRef, useState} from 'react';

import CommonFunction from '@lib/common';
import _ from "lodash";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import {XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Right, XLayout_Top} from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import {TreeTable} from 'primereact/treetable';
import {Column} from 'primereact/column';
import ResourceApi from 'services/super-admin/ResourceApi';
import {DataTable} from 'primereact/datatable';
import {Button} from 'primereact/button';
import {MultiSelect} from 'primereact/multiselect';

export default function ApiResourceAction(props) {
    const t = CommonFunction.t;
    const [menu, setMenu] = useState(null);
    const refRawMenu = useRef(null);
    const [menuFilter, setMenuFilter] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [apis, setApis] = useState(null);
    const [grantedApis, setGrantedApis] = useState(null);
    const [loadingApis, setLoadingApis] = useState(false);
    const refCacheApiActions = useRef({});

    useEffect(() => {
        // get menu
        ResourceApi.getMenu("", "menu,sub-menu").then(res => {
            if (res) {
                // order
                let _sort = _.sortBy(res, "sortOrder");
                _sort.forEach(m => {
                    m.key = m.id;
                    // m.isMenu = m.url ? true : false;
                    m.data = { filterKey: t(m.name) };
                })
                refRawMenu.current = _.cloneDeep(_sort);
                let _menu = CommonFunction.listToTree(_sort, "code", "parentCode", "children");
                setMenu(_menu);
            }
        })

        // get api
        ResourceApi.getApi().then(res => {
            if (res) {

                setApis(res);
            }
        })
    }, [])

    /**
     * on resource selected
     * @param {*} e
     */
    const onResourceSelected = (resourceId) => {
        setLoadingApis(true);
        let _menu = refRawMenu.current.find(f => f.id === resourceId);

        if (_menu) {
            ResourceApi.getMenuApiActions(resourceId).then(res => {
                if (res) {

                    let _cachedApiActions = _.cloneDeep(refCacheApiActions.current);

                    res.forEach((el, index) => {
                        // cache actions
                        _cachedApiActions[el.apiId] = _.cloneDeep(el.actions);

                        // prepare actions
                        el.actionsList = _.cloneDeep(el.actions);
                        el.actions = el.actions.filter(f => f.status === 1).map(m => m.actionCode);
                        el.index = index;
                    });

                    setGrantedApis(res);
                    setSelectedResource(resourceId);
                } else {
                    setGrantedApis(null);
                    setSelectedResource(null);
                }
                setLoadingApis(false);
            })
        } else {
            setGrantedApis(null);
            setSelectedResource(null);
        }
    }

    /**
     * add api to resource
     * @param {*} e
     */
    const addApiToResource = async (_api) => {
        let _grantedApis = grantedApis ? _.cloneDeep(grantedApis) : [];

        // check added
        for (let i = 0; i < _grantedApis.length; i++) {
            if (_grantedApis[i].apiId === _api.id) {
                CommonFunction.toastWarning("Duplicate action");
                return
            }
        }

        // get actions
        if (!refCacheApiActions.current[_api.id]) {
            let _actionsResponse = await ResourceApi.getApiAction(_api.id);
            if (_actionsResponse) {
                refCacheApiActions.current[_api.id] = _actionsResponse;
            }
        }

        _grantedApis.push({
            apiId: _api.id,
            apiCode: _api.code,
            apiApplication: _api.application,
            actionsList: refCacheApiActions.current[_api.id],
            actions: [],
            index: _grantedApis.length
        })

        setGrantedApis(_grantedApis);
    }

    /**
     * remove api from resource
     * @param {*} _api
     */
    const removeApiFromResource = (_api) => {
        let _grantedApis = grantedApis ? _.cloneDeep(grantedApis) : [];
        let index = _api.index;
        if (index > -1) {
            _grantedApis = [
                ..._grantedApis.slice(0, index),
                ..._grantedApis.slice(index + 1)
            ];

            for (let i = 0; i < _grantedApis.length; i++) {
                _grantedApis[i].index = i;
            }

            setGrantedApis(_grantedApis);
        }

    }

    /**
     * apply api action
     * @param {*} index
     * @param {*} value
     */
    const applyApiAction = (index, value) => {
        let _grantedApis = _.cloneDeep(grantedApis);
        _grantedApis[index].actions = value;
        setGrantedApis(_grantedApis);
    }

    /**
     * submit
     */
    const submit = () => {
        if (grantedApis) {

            let _grantedApis = _.cloneDeep(grantedApis);

            _grantedApis.forEach(_api => {
                _api.actions = _api.actions;
                delete _api.index;
                delete _api.actionsList;
            });

            ResourceApi.grantMenuApiActions(selectedResource, _grantedApis).then(res => {
                if (res) {
                    // reload data
                    onResourceSelected(selectedResource);

                    CommonFunction.toastSuccess(t("common.save-success"));
                }
            })

        } else {
            CommonFunction.toastWarning("Granted Api is null");
        }

    }

    /**
     * undo
     */
    const undo = () => {
        CommonFunction.showConfirm("Undo", "Undo", () => {
            onResourceSelected(selectedResource);
        })
    }

    if (menu && apis) {
        return (<>
            <XLayout className="p-2">
                <XLayout_Left className="mr-2">
                    <XLayout_Box className="h-full overflow-auto p-0">
                        <TreeTable
                            value={menu}
                            globalFilter={menuFilter}
                            filterKey="filterKey"
                            showGridlines
                            selectionMode="single"
                            selectionKeys={selectedResource}
                            onSelectionChange={(e) => onResourceSelected(e.value)}
                            style={{ width: "300px" }}
                        >
                            <Column
                                header="Resources"
                                field="filterKey"
                                filterMatchMode="contains"
                                body={(m) => (<>
                                    <span className={`${m.icon || "bx bxs-circle "} ${m.icon ? "fs-18" : "fs-4"} text-grey-7 mr-2`}></span><span>{t(m.name)}</span>
                                </>)}
                                expander
                                filter
                                
                            ></Column>
                        </TreeTable>
                    </XLayout_Box>
                </XLayout_Left>
                <XLayout_Center className="position-relative">
                    <LoadingBar loading={loadingApis}></LoadingBar>
                    <XLayout>
                        {selectedResource &&
                            <XLayout_Top className="mb-1">
                                <XToolbar
                                    left={() => (<>
                                        <Button icon="bx bxs-save" label={t('common.save')} onClick={submit}></Button>
                                        <Button icon="bx bx-undo" label={t("button.undo")} onClick={undo}></Button>
                                    </>)}
                                ></XToolbar>
                            </XLayout_Top>
                        }

                        <XLayout_Center>
                            <XLayout_Box className="h-full overflow-auto p-0">
                                {!selectedResource && <div className="h-full w-full flex align-items-center justify-content-center fs-28">Select resource first</div>}
                                {selectedResource &&
                                    <DataTable
                                        value={grantedApis}
                                        showGridlines
                                        scrollable
                                        scrollDirection='both'
                                        scrollHeight='flex'
                                        filterDisplay="row"
                                    >
                                        <Column
                                            header="Api's id"
                                            field="apiId"
                                            filter
                                            filterMatchMode="contains"
                                            showFilterMenu={false}
                                            showClearButton={false}
                                            
                                            style={{ flex: '0 0 80px' }}
                                        ></Column>
                                        <Column
                                            header="Api's application"
                                            field="apiApplication"
                                            filter
                                            filterMatchMode="contains"
                                            showFilterMenu={false}
                                            showClearButton={false}
                                            
                                            style={{ flex: '1 0 130px' }}
                                        ></Column>
                                        <Column
                                            header="Api's code"
                                            field="apiCode"
                                            filter
                                            filterMatchMode="contains"
                                            showFilterMenu={false}
                                            showClearButton={false}
                                            
                                            style={{ flex: '1 0 200px' }}
                                        ></Column>
                                        <Column
                                            style={{ flex: '1 0 100px', overflow: "hidden" }}
                                            header="Action"
                                            field="apiApplication"
                                            bodyClassName="p-0"
                                            body={(m) => (<>
                                                <MultiSelect
                                                    display="chip"
                                                    value={m.actions || []}
                                                    className="w-full inline-grid"
                                                    options={m.actionsList}
                                                    optionLabel="actionCode"
                                                    optionValue="actionCode"
                                                    onChange={(e) => applyApiAction(m.index, e.value)}
                                                ></MultiSelect>
                                            </>)}
                                        ></Column>

                                        <Column
                                            body={(m) => (
                                                <Button
                                                    className="p-button-rounded p-button-text"
                                                    icon="bx bx-trash text-red"
                                                    onClick={() => removeApiFromResource(m)}
                                                ></Button>
                                            )}
                                            style={{ flex: '0 0 50px' }}
                                            bodyClassName='p-0 flex align-items-center justify-content-center'
                                        ></Column>

                                    </DataTable>
                                }
                            </XLayout_Box>
                        </XLayout_Center>
                    </XLayout>
                </XLayout_Center>
                <XLayout_Right className="ml-2">
                    <XLayout_Box className="h-full overflow-auto p-0 position-relative">
                        {selectedResource &&
                            <DataTable
                                value={apis}
                                style={{ width: "350px" }}
                                showGridlines
                                scrollable
                                scrollDirection='both'
                                scrollHeight='flex'
                                filterDisplay='row'
                            >
                                <Column
                                    className="p-0"
                                    body={(m) => (<div className="flex align-items-center justify-content-center">
                                        <Button
                                            icon="bx bx-plus text-green"
                                            className="p-button-text p-button-rounded"
                                            onClick={() => addApiToResource(m)}
                                        ></Button>
                                    </div>)}
                                    style={{ flex: "0 0 40px" }}
                                    bodyClassName='p-0 flex align-items-center justify-content-center'
                                ></Column>
                                <Column
                                    header="Application"
                                    field="application"
                                    filter
                                    style={{ flex: "0 0 150px" }}
                                    showFilterMenu={false}
                                    showClearButton={false}
                                    
                                ></Column>
                                <Column
                                    header="Code"
                                    field="code"
                                    filter
                                    style={{ flex: "0 0 200px" }}
                                    showFilterMenu={false}
                                    showClearButton={false}
                                    
                                ></Column>

                                <Column
                                    header="Id"
                                    field="id"
                                    filter
                                    style={{ flex: "0 0 80px" }}
                                    showFilterMenu={false}
                                    showClearButton={false}
                                    
                                ></Column>
                            </DataTable>
                        }
                    </XLayout_Box>
                </XLayout_Right>
            </XLayout>
        </>);
    } else {
        return <XLayout className="position-relative"><LoadingBar loading={true}></LoadingBar></XLayout>
    }
}

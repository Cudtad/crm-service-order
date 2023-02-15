import React, {  useEffect, useRef, useState } from 'react';
import PageHeader from 'components/page-header/PageHeader';

import "../scss/Request.scss"
import EmptyDataCompact from "@xdp/ui-lib/dist/components/empty-data/EmptyDataCompact";
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import RequestApi from 'services/RequestApi';
import _ from 'lodash';
import InitRequest from 'features/request/components/InitRequest';
import EmptyData from "@xdp/ui-lib/dist/components/empty-data/EmptyData";
import { Tooltip } from 'primereact/tooltip';
import { Chip } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import WorkflowApi from 'services/WorkflowApi';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';

// store

import { Checkbox } from 'primereact/checkbox';
import CommonFunction from '@lib/common';
import { Menu } from 'primereact/menu';
import RequestDetail from '../components/RequestDetail';
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Row, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import Request_Creator from '../components/request/Request_Creator';
import { DataTable } from 'primereact/datatable';
import { UserInfo } from '@ui-lib/user-info/UserInfo';


export default function Request( props ) {
    const defaultLazy = {
        page: 0,
        pageSize: 20,
        affect: {
            requestStatePending: false,
            requestStateDone: false,
            requestStateFail: false,
            keyword: ""
        },
        condition: {
            groupId: -1,
            conditions:
                [
                    {
                        logicOperator: "",
                        conditionType: "GROUP",
                        filterType: "ROLE",
                        children: []
                    }
                ],
        }
    }

    //#region declaration
    const t = CommonFunction.t;

    // new ---------------
    const refRequestCreator = useRef(null);

    // new ---------------


    const [visibleAddRequestSidebar, setVisibleAddRequestSidebar] = useState(false);
    const [workflows, setWorkflows] = useState([]);
    const [requests, setRequests] = useState(null);
    const { user } = props;
    const refInitRequest = useRef(null);
    const [userGroupIds, setUserGroupIds] = useState("");
    const [lazy, setLazy] = useState(defaultLazy);
    const [recentWorkflow, setRecentWorkflow] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestStateDone, setRequestStateDone] = useState(false);
    const [requestStatePending, setRequestStatePending] = useState(false);
    const [requestStateFail, setRequestStateFail] = useState(false);
    const refRequestMenu = useRef(null);
    const refRequestDetail = useRef(null);
    const refSelectedRequest = useRef(null);

    //#endregion

    //#region effect

    /**
     * onetime
     */
    useEffect(() => {
        // get user group id
        let groupIds = "";
        if (window.app_context.user && window.app_context.user.groups) {
            groupIds = window.app_context.user.groups.map(m => m.id).join(",");
            setUserGroupIds(groupIds);
        }

        // load request
        loadRequests();

        // load recent workflow
        loadRecentWorkflow();

        // load workflow by user
        loadWorkflowsByUser(groupIds);
    }, [])

    //#region sub/func

    /**
     * load requests created by user
     */
    const loadRequests = (_lazy) => {
        _lazy = _lazy ? _lazy : _.cloneDeep(lazy);

        // filter by state
        let states = ["DONE", "FAILED", "PENDING"];
        if (_lazy.affect.requestStateDone
            || _lazy.affect.requestStatePending
            || _lazy.affect.requestStateFail
        ) {
            states = [];
            if (_lazy.affect.requestStatePending) states.push("PENDING");
            if (_lazy.affect.requestStateDone) states.push("DONE");
            if (_lazy.affect.requestStateFail) states.push("FAILED");
        }

        _lazy.condition.conditions = [{
            logicOperator: "",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "STRING",
            fieldName: "state",
            operator: "IN",
            values: states
        }];

        // filter by name and description
        if (!CommonFunction.isEmpty(_lazy.affect.keyword)) {
            _lazy.condition.conditions.push(
                {
                    logicOperator: "AND",
                    conditionType: "GROUP",
                    filterType: "ROLE",
                    children: [{
                        logicOperator: "",
                        conditionType: "RULE",
                        filterType: "FIELD",
                        fieldType: "STRING",
                        fieldName: "name",
                        operator: "LIKE",
                        values: [_lazy.affect.keyword]
                    },
                    {
                        logicOperator: "OR",
                        conditionType: "RULE",
                        filterType: "FIELD",
                        fieldType: "STRING",
                        fieldName: "description",
                        operator: "LIKE",
                        values: [_lazy.affect.keyword]
                    }]
                }
            );
        }

        setLoading(true);
        RequestApi.getUserRequets(_lazy, _lazy.condition).then(res => {
            if (res) {

                // prepare lazy
                _lazy.page = res.page;
                _lazy.pageSize = res.pageSize;
                _lazy.total = res.total;
                _lazy.from = res.page * res.pageSize + 1;
                _lazy.to = Math.min(res.page * res.pageSize + res.pageSize, res.total);
                _lazy.last = (res.page + 1) * res.pageSize >= res.total;
                _lazy.first = res.page === 0;

                // prepare data
                let _requests = [];
                if (res.content && res.content.length > 0) {
                    _requests = res.content;
                }

                setLazy(_lazy);
                setRequests(_requests);
            }
            setLoading(false);
        })
    }

    /**
     * load recent workflow
     */
    const loadRecentWorkflow = () => {
        WorkflowApi.getRecentWorkflow(5).then(res => {
            if (res) {

                // build recent workflow fake
                let _recentWorkflow = [];
                res.forEach(_wf => {
                    _recentWorkflow.push({
                        id: _wf.id,
                        title: `${_wf.code} - ${_wf.name}`
                    })
                });

                setRecentWorkflow(_recentWorkflow);
            }
        })
    }

    /**
     * next page
     */
    const nextPage = () => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.page = lazy.page + 1;
        loadRequests(_lazy);
    }

    /**
     * previous page
     */
    const previousPage = () => {
        let _lazy = _.cloneDeep(lazy);
        _lazy.page = lazy.page - 1;
        loadRequests(_lazy);
    }

    /**
     * set select role
     * @param {*} state
     * @param {*} val
     */
    const setSelectState = (state, val) => {
        let _lazy = _.cloneDeep(lazy);

        // set state and change affect affect value
        switch (state) {
            case 'PENDING':
                setRequestStatePending(val);
                _lazy.affect.requestStatePending = val;
                break;
            case 'DONE':
                setRequestStateDone(val);
                _lazy.affect.requestStateDone = val;
                break;
            case 'FAILED':
                setRequestStateFail(val);
                _lazy.affect.requestStateFail = val;
                break;
            default:
                break;
        }

        _lazy.page = 0;
        setLazy(_lazy);
        loadRequests(_lazy);
    }

    /**
     * change search keyword
     * @param {*} val
     */
    const changeSearchKeyword = (val) => {

        let _lazy = _.cloneDeep(lazy);
        _lazy.affect.keyword = val;

        _lazy.page = 0;
        setLazy(_lazy);
        loadRequests(_lazy);
    }

    /**
     * load workflows by user
     */
    const loadWorkflowsByUser = (groupIds) => {

        // load workflows by user
        RequestApi.getWorkflowsByUser(groupIds).then(res => {
            let _workflows = [];
            let index = 1;
            for (const key in res) {
                // create group category
                let _cate = {
                    key: `cat_${index}`,
                    label: key,
                    sort: key.toLowerCase(),
                    children: []
                }

                // add workflows
                res[key].forEach(el => {
                    _cate.children.push({
                        key: el.id,
                        label: `${el.code} - ${el.name}`
                    });
                });

                _workflows.push(_cate);
                index += 1;
            }

            // sort categories
            let _sort = _.sortBy(_workflows, o => o.sort);
            setWorkflows(_sort);
        })
    }

    /**
     * auto close add request sidebar when click outside
     */
    const autoCloseAddRequestSidebar = () => {
        if (visibleAddRequestSidebar) {
            setVisibleAddRequestSidebar(false);
        }
    }

    /**
     * init request
     */
    const initRequest = (node) => {
        refInitRequest.current.init(node.key, userGroupIds);
    }

    /**
     * init recent request
     */
    const initRecentRequest = (workflowId) => {
        refInitRequest.current.init(workflowId, userGroupIds);
    }

    /**
     * handle open request menu
     * @param {*} e
     * @param {*} request
     */
    const handleRequestMenu = (e, request) => {
        refSelectedRequest.current = request;
        refRequestMenu.current.toggle(e);
    }

    /**
     * view workflow process
     * @param {*} request
     */
    const viewWorkflowProcess = (request) => {
        refRequestDetail.current.init(request);
    }

    //#endregion

    /**
     * create request
     */
    const createRequest = () => {
        refRequestCreator.current.create(null, null, null, userGroupIds);
    }

    return (
        <>

            <XLayout className="p-2" left="350px">
                <XLayout_Top className="mb-2">
                    <XToolbar
                        left={() => (<>
                            <Button label={t("request.create")} icon="bx bx-plus" className="p-button-success" onClick={createRequest} />
                        </>)}
                        right={() => (<>
                            <span className="p-input-icon-left">
                                <i className="bx bx-search-alt" />
                                <InputText
                                    onInput={(e) => CommonFunction.debounce(null, changeSearchKeyword, e.target.value)}
                                    placeholder={t("common.search")} />
                            </span>
                        </>)}
                    ></XToolbar>
                </XLayout_Top>

                <XLayout_Left>
                    <XLayout_Box className="h-full mr-2">
                        {/* filter */}
                        <span className="p-input-icon-left w-full mb-2-5">
                            <i className="bx bx-search-alt" />
                            <InputText
                                className="w-full"
                                onInput={(e) => CommonFunction.debounce(null, changeSearchKeyword, e.target.value)}
                                placeholder={t("common.search")} />
                        </span>

                        <div className="p-field-checkbox text-teal">
                            <Checkbox inputId="request-state-pending" checked={requestStatePending} onChange={e => setSelectState('PENDING', e.checked)} />
                            <label htmlFor="request-state-pending">{t('request.state.PENDING')}</label>
                        </div>
                        <div className="p-field-checkbox text-green-9">
                            <Checkbox inputId="request-state-done" checked={requestStateDone} onChange={e => setSelectState('DONE', e.checked)} />
                            <label htmlFor="request-state-done">{t('request.state.DONE')}</label>
                        </div>
                        <div className="p-field-checkbox text-red-9">
                            <Checkbox inputId="request-state-fail" checked={requestStateFail} onChange={e => setSelectState('FAILED', e.checked)} />
                            <label htmlFor="request-state-fail">{t('request.state.FAIL')}</label>
                        </div>

                        {/* recent */}
                        <div className="flex align-items-center border-bottom pb-2 mt-1 mb-2-5">
                            <i className='bx bx-history text-blue mr-1'></i>
                            <span className="bold-and-color">{t("request.recent")}</span>
                        </div>

                        {recentWorkflow.length === 0 &&
                            <EmptyDataCompact message={t("request.recent.empty")} className="mb-3" />
                        }

                        {recentWorkflow.length > 0 && recentWorkflow.map((recent, index) => (
                            <div key={index} className="recent-workflow-item flex align-items-start" onClick={() => initRecentRequest(recent.id)}>
                                <i className='bx bxs-right-arrow'></i>
                                <span>{recent.title}</span>
                            </div>
                        ))}
                    </XLayout_Box>
                </XLayout_Left>

                <XLayout_Center>
                    <XLayout_Box className="h-full p-0">
                        <LoadingBar loading={loading} />
                        {/* navigation */}
                        <div className="request-toolbar flex align-items-center justify-content-between w-full height-fit-content border-bottom">
                            <div className="my-requests pl-2">
                                <span className="bold-and-color">{t("request.my-request")}</span>
                            </div>
                            <div className="requests-paging flex align-items-center p-1">
                                <span>{lazy.from}</span>
                                <span className="mr-1 ml-1">-</span>
                                <span>{lazy.to}</span>
                                <span className="mr-1 ml-1">/</span>
                                <span>{lazy.total}</span>
                                <Button
                                    icon="bx bx-chevron-left"
                                    className="p-button-rounded p-button-text p-button-secondary ml-2"
                                    onClick={previousPage}
                                    disabled={lazy.first}
                                    tooltip={t('button.newer')}
                                    tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />

                                <Button
                                    icon="bx bx-chevron-right"
                                    className="p-button-rounded p-button-text p-button-secondary"
                                    onClick={nextPage}
                                    disabled={lazy.last}
                                    tooltip={t('button.older')}
                                    tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} />

                            </div>
                        </div>
                        {/* request list */}
                        {(requests && requests.length === 0) &&
                            <EmptyData message={t("request.empty-request")}>
                                <Button label={t("request.create")} icon="bx bx-plus" className="p-button-primary" onClick={createRequest} />
                            </EmptyData>
                        }

                        {requests && requests.length > 0 &&

                            <div className="request-items-container">
                                {requests.map((request, index) => (
                                    <div key={index} className="request-item-container">

                                        <div>
                                            <XLayout_Row>
                                                <i className={classNames({
                                                    'bx fs-24': true,
                                                    "bx-check text-green-9": request.state === "DONE",
                                                    "bx-play text-teal": request.state === "PENDING",
                                                    "bx-x text-red-9": request.state === "FAILED"
                                                })}></i>
                                                <span className="bold">{request.name}</span>
                                            </XLayout_Row>

                                            {request.workFlow &&
                                                <XLayout_Row>
                                                    <span
                                                        className="link-button ml-2"
                                                        onClick={() => viewWorkflowProcess(request)}
                                                        title={t('request.view-process')}
                                                    >
                                                        {`${request.workFlow.code} - ${request.workFlow.name}`}
                                                    </span>
                                                </XLayout_Row>
                                            }

                                            <div className="pending-task-container mt-1">
                                                {request.pendingTasks && request.pendingTasks.map((task, index) => (
                                                    <XLayout_Row key={index} className="pending-task-item" title={t(`request.task.state.${task.state}`)}>
                                                        <i className={classNames({
                                                            'bx ml-2 fs-24': true,
                                                            "bx-pause text-grey-6": task.state === "PENDING",
                                                            "bx-play text-green": task.state === "IN_PROGRESS",
                                                            "bx-stop text-red-9": task.state === "DEFERRED"
                                                        })}></i>
                                                        <span>{task.activity.name}</span>
                                                        {task.responsibleUser &&
                                                            <UserInfo className="ml-2" id={task.responsibleUser.id}></UserInfo>
                                                        }
                                                    </XLayout_Row>
                                                ))}
                                            </div>
                                        </div>
                                        {/* <div className="request-item-actions border-left">
                                            <Button
                                                className="p-button-rounded p-button-text"
                                                tooltip={t("request.view-process")}
                                                tooltipOptions={{ position: "bottom" }}
                                                icon="bx bx-git-branch"
                                                onClick={() => viewWorkflowProcess(request)} >
                                            </Button>
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        }
                    </XLayout_Box>
                </XLayout_Center>

            </XLayout>

            <div className="page-container">
                <PageHeader title={t('menu.request')} breadcrumb={[t('menu.request')]} />
                <div className="page-content p-flex-row request-content">
                    <div className="request-left-panel pr-2" onClick={autoCloseAddRequestSidebar}>
                        <div className="mb-2-5">
                            <Button label={t("request.create")} icon="bx bx-plus" className="p-button-success" onClick={() => setVisibleAddRequestSidebar(true)} />
                        </div>


                    </div>
                    <div className="flex flex-column w-full h-full border-all p-card request-right-panel ml-2 position-relative">

                    </div>

                    <div className={classNames({ "add-request-side-bar": true, "choose-request": visibleAddRequestSidebar })}>
                        <div className="flex w-full h-full flex-column border-all">

                            <div className="flex align-items-center justify-content-between border-bottom p-2">
                                <span className="bold-and-color">{t("request.add-request-title")}</span>
                                <div className="add-request-close-button" onClick={() => setVisibleAddRequestSidebar(false)}>
                                    <i className='bx bx-x'></i>
                                </div>
                            </div>
                            <Tree
                                className="h-full w-full flex flex-column border-none p-2 add-request-tree"
                                filterPlaceholder={t("request.find")}
                                contentClassName="overflow-auto h-full"
                                value={workflows}
                                filter
                                nodeTemplate={(node, options) => {
                                    if (node.children) {
                                        // group template
                                        return (
                                            <>
                                                <i className="bx bxs-folder text-yellow-9 add-request-folder-icon mr-2" />
                                                <b>{node.label}</b>
                                            </>
                                        )
                                    } else {
                                        // leaf template
                                        return (
                                            <div
                                                className="add-request-workflow-item"
                                                onClick={() => initRequest(node)}>
                                                {node.label}
                                            </div>
                                        )
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Request_Creator
                ref={refRequestCreator}
            ></Request_Creator>

            <InitRequest ref={refInitRequest} />
            <RequestDetail ref={refRequestDetail} />
            <Menu
                model={[
                    {
                        label: t('request.view-process'), icon: 'bx bx-git-branch', command: (event) => {
                            refRequestDetail.current.init(refSelectedRequest.current);
                        }
                    },
                    {
                        label: t('request.update'), icon: 'bx bx-pencil', command: (event) => {
                        }
                    },
                ]}
                ref={refRequestMenu}
                popup
            />
        </>
    );
}

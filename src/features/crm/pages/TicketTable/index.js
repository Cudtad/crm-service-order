import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';


import CommonFunction from '@lib/common';
import _ from "lodash";
import Enumeration from '@lib/enum';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { XLayout, XLayout_Box, XLayout_Center } from '@ui-lib/x-layout/XLayout';
// import Task_State from '../../components/Task_State';
import TicketEnumeration from '../../ticket-common/TicketEnumeration';
import TicketApi from 'services/TicketApi';
import "./styles.scss";
import { Tooltip } from 'primereact/tooltip';
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from 'primereact/button';
import { UserInfo } from '@ui-lib/user-info/UserInfo';
import Task_State from '../../../../components/task/components/Task_State';
import moment from "moment"

export default function TicketTable(props, ref) {
    const t = CommonFunction.t;
    const { toggleViewPendingTasks, updateTask, lazy, permission, getConditions } = props;
    const { user } = props;
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(false);
    const [impactTaskNextStates, setImpactTaskNextStates] = useState({});
    const [customFields, setCustomFields] = useState([]);
    const refChangeStageMenu = useRef(null);
    const refImpactingTask = useRef();

    const defaultPaging = useRef({
        first: 0,
        size: 20,
        page: 0,
        total: 0
    });
    const [paging, setPaging] = useState({ ...defaultPaging.current });

    useEffect(() => {
        loadData();
    }, []);

    useImperativeHandle(ref, () => ({
        /**
         * filter
         * @param {*} _userLogin
         */
        filter: (_lazy) => {
            loadData(_lazy);
        },

        afterSubmitTicketDetail: (editMode, data) => {
            afterSubmitTicketDetail(editMode, data);
        }
    }));
    /**
     * load data
     */
    const loadData = async (_lazy = lazy) => {
        setLoading(true);
        const condition = await getConditions(_lazy)
        // load data for data table
        let _params = {
            page: defaultPaging.current.page,
            size: defaultPaging.current.size,
            sortField: "create_date",
            sortOrder: -1,
            body: {
                props: ["id", "name", "projectId", "deadline", "responsibleId", "requestedBy", "create_by", "start_date", "state", "type", "subtype", "responseDate", "responseDeadline", "resolvedDate", "priority", "code", "create_date", "closedOn"],
                include: ["next-states", "involves"],
                conditions: condition,
                checkPermission: false,
            }
        };

        if (_lazy.affect.projectId && _lazy.affect.projectId > 0) {
            _params.body.include.push("fields")
        }

        TicketApi.list(_params).then(res => {
            if (res) {
                let _currenListCustomfields = [];
                if (res.content && res.content.length > 0) {
                    res.content.map(_ticket => {
                        if (_ticket.fields && _ticket.fields.length > 0) {
                            _ticket.fields.map(_field => {
                                let _haveFieldColumn = _.find(_currenListCustomfields, function (e) { return (e.fieldId === _field.fieldId) });
                                if (!_haveFieldColumn) {
                                    _currenListCustomfields.push({
                                        fieldId: _field.fieldId,
                                        name: _field.fieldConfig.fieldName
                                    });
                                }
                            })
                        }
                    })
                }
                // field custom field
                setCustomFields(_currenListCustomfields)
                // set tasks data
                setTickets(res.content);
                // set paging state
                setPaging({
                    ...paging,
                    total: res.total,
                    first: defaultPaging.current.first,
                    page: defaultPaging.current.page,
                    size: defaultPaging.current.size
                });

                // set ref parameter
                defaultPaging.current.total = res.total;

            }
            setLoading(false);
        });
    };

    /**
     * toggle change state menu
     */
    const toggleChangeState = (e, _ticket) => {
        if (_ticket["next-states"] && _ticket["next-states"].length > 0) {
            setImpactTaskNextStates({
                type: _ticket.type.toLowerCase(),
                nextStates: _ticket["next-states"]
            });
            refImpactingTask.current = _.cloneDeep(_ticket);
            refChangeStageMenu.current.toggle(e);
        }
    }

    /**
     *
     */
    const nowDate = new Date();
    const checkDate = (startDate, endDate) => {
        if ((startDate === undefined && endDate === undefined) || endDate === undefined) {
            return false;
        } else {
            if (Date.parse(endDate) < Date.parse(nowDate)) {
                return true;
            }
            return false;
        }
    };

    const percentage = (createDate, deadLine) => {
        if (deadLine) {
            if (new Date(createDate) > new Date(deadLine)) {
                return { percent: '100', color: '#e57373' };
            }
            let totalTime = Date.parse(deadLine) - Date.parse(createDate);
            let currentTime = Date.parse(nowDate) - Date.parse(createDate);
            let percent = Math.round(currentTime * 100 / totalTime);

            if (percent > 90) {
                if (percent > 100) {
                    return { percent: '100', color: '#e57373' };
                }
                return { percent: percent, color: '#e57373' };
            } else if (percent <= 20) {
                if (percent <= 0) {
                    return { percent: "0", color: '#4caf50' };
                } else {
                    return { percent: percent, color: '#4caf50' };
                }
            } else {
                return { percent: percent, color: '#ffb74d' };
            }

        }
    }
    /**
     * change state
     * @param {*} state
     */
    const changeState = (state) => {
        if (refImpactingTask.current) {
            if (permission) {
                TicketApi.changeState(refImpactingTask.current.id, state).then(res => {
                    if (res) {
                        let _tasks = _.cloneDeep(tickets);
                        for (let i = 0; i < _tasks.length; i++) {
                            if (_tasks[i].task.id === refImpactingTask.current.id) {
                                _tasks[i].task = {
                                    ..._tasks[i].task,
                                    ...res.task
                                }
                                break;
                            }

                        }
                        setTickets(_tasks);
                        CommonFunction.toastSuccess(t("common.save-success"));
                    }
                    refChangeStageMenu.current.hide();
                })
            } else {
                CommonFunction.toastError(t("you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator"));
            }
        }
    }

    /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        defaultPaging.current = { ...defaultPaging.current, ...event, size: event.rows, };
        loadData();
    };

    /**
     * after submit task base detail
     */
    const afterSubmitTicketDetail = async (editMode, responseAfterSubmit) => {
        let _tickets = _.cloneDeep(tickets);
        let _priority = responseAfterSubmit.task.priority && _.find(TicketEnumeration.dropdown.priority.options, function (o) { return o.code == responseAfterSubmit.task.priority })
        let ticket = {
            task: {
                priority: (_priority ? _priority.code : ''),
                ...responseAfterSubmit.task
            },
            involves: responseAfterSubmit.involves
        }
        switch (editMode) {
            case Enumeration.crud.create:
                // after create, push item into first row
                _tickets.unshift(ticket)
                setTickets(_tickets);
                break;
            case Enumeration.crud.update:
                // after update, update task info
                let indexTaskUpdate = _.findIndex(_tickets, function (e) { return (e.task.id === ticket.task.id) })
                if (indexTaskUpdate > -1) {
                    _tickets[indexTaskUpdate] = ticket
                }
                setTickets(_tickets);
                break;
            default:
                break;
        }
    }
    return (<>
        <XLayout className="ticket-table">
            <XLayout_Center>
                <XLayout>
                    <XLayout_Center>
                        <XLayout_Box className="h-full p-0 position-relative">
                            <DataTable
                                value={tickets}
                                loading={loading}
                                selectionMode="single"
                                dataKey="id"
                                showGridlines
                                emptyMessage={t('common.no-record-found')}
                                scrollable
                                scrollDirection='both'
                                scrollHeight='flex'
                                className='p-datatable-frozen-x1'
                                lazy
                                resizableColumns
                                paginator
                                first={paging.first}
                                rows={paging.size}
                                totalRecords={paging.total}
                                rowsPerPageOptions={[20, 25, 50, 100]}
                                onPage={onPage}
                                paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink NextPageLink LastPageLink"
                                currentPageReportTemplate="{first} - {last} / {totalRecords}"
                            >
                                <Column
                                    frozen
                                    header={t('code')}
                                    style={{ flex: '0 0 150px' }}
                                    body={(ticket) => {
                                        let icon = ``
                                        if (ticket.task.deadline && ticket.task.state != TicketEnumeration.state.ticket.canceled) {
                                            const difDay = moment(ticket.task.deadline).startOf('day').diff(moment(Date.now()).startOf('day'), `days`)
                                            const difSeconds = moment(ticket.task.deadline).diff(moment(Date.now()), `seconds`)
                                            if (ticket.task.state == TicketEnumeration.state.ticket.completed) {
                                                const difSecondsLog = moment(ticket.task.deadline).diff(moment(ticket.task.closedOn), `seconds`)
                                                if (difSecondsLog < 0) {
                                                    icon = 'text-red-6'
                                                }
                                            } else {
                                                if (difSeconds < 0) {
                                                    icon = 'text-red-6'
                                                } else if (difDay == 0) {
                                                    icon = 'text-yellow-9'
                                                }
                                            }
                                        }
                                        return <>
                                            <span>{ticket.task.code ? ticket.task.code : ticket.task.id}</span>
                                            {icon && <i className={`bx bxs-hourglass-bottom ml-1 ${icon}`}></i>}
                                        </>
                                    }

                                    }
                                ></Column>
                                <Column header={t('task.name')}
                                    // frozen
                                    style={{ flex: '1 0 300px' }}
                                    body={(ticket) => (
                                        <>
                                            <div className="flex align-items-center pointer">
                                                <div className="mr-1" onClick={(e) => toggleChangeState(e, ticket.task)} title={t(`task.state.${ticket.task.state}`)}>
                                                    <Task_State state={ticket.task.state}>{t(`ticket.state.sort.${ticket.task.state}`)}</Task_State>
                                                </div>
                                                <span title={ticket.task.name} style={{ position: 'unset' }} className="line-clamp-3 pointer link-button" onClick={() => updateTask(ticket.task)}>{ticket.task.name}</span>
                                            </div>
                                            {(ticket.task && (ticket.task.pendingTasks && ticket.task.pendingTasks.length > 0)) &&
                                                <>
                                                    <div className="ticket-show-task pointer" onClick={(e) => toggleViewPendingTasks(e, ticket.task)}>
                                                        <i className='bx bx-menu'></i>
                                                    </div>
                                                    <Tooltip target=".ticket-show-task" content={t("work.name")} />
                                                </>
                                            }
                                        </>
                                    )}
                                ></Column>
                                <Column
                                    header={t('common.type')}
                                    style={{ flex: '0 0 150px' }}
                                    body={(task) => (
                                        <span>{t(`ticket.${task.task.type.toLowerCase()}`) + (task.task.subtype && _.find(TicketEnumeration.dropdown.subtype.options, function (o) { return o.id == task.task.subtype }) && " - " + _.find(TicketEnumeration.dropdown.subtype.options, function (o) { return o.id == task.task.subtype }).name || '')}</span>
                                    )}></Column>
                                <Column
                                    header={t('ticket.priority')}
                                    style={{ flex: '0 0 150px' }}
                                    body={(task) => (
                                        <div>{task.task.priority && _.find(TicketEnumeration.dropdown.priority.options, function (o) { return o.code == task.task.priority }) && _.find(TicketEnumeration.dropdown.priority.options, function (o) { return o.code == task.task.priority }).name || ''}</div>
                                    )}></Column>

                                <Column header={t('ticket.requester')}
                                    style={{ flex: '0 0 200px', flexWrap: "wrap" }} body={(task, index) => {
                                        if (task.task.requestedBy) {
                                            return (
                                                <UserInfo
                                                    key={`requester${index}`}
                                                    id={task.task.requestedBy.id}
                                                    showName={true}
                                                    showAvatar={true}
                                                ></UserInfo>
                                            )
                                        }
                                    }}></Column>
                                <Column header={t('workflow.position.responsible')} style={{ flex: '0 0 200px', flexWrap: "wrap" }}
                                    body={(task, index) => {
                                        if (task.task.responsibleId) {
                                            return (
                                                <UserInfo
                                                    key={`responsible${index}`}
                                                    id={task.task.responsibleId.id}
                                                    showName={true}
                                                    showAvatar={true}
                                                ></UserInfo>
                                            )
                                        }
                                    }}>
                                </Column>
                                <Column header={t('ticket.assign')} style={{ flex: '0 0 200px', flexWrap: "wrap" }} body={(task) => (
                                    task.involves.map((involve) => (involve.role === TicketEnumeration.role.assignee && involve.involveType === "user") ?
                                        involve.involveIds.map((item, index) => (
                                            <UserInfo
                                                key={`responsible${index}`}
                                                id={item.id}
                                                showName={true}
                                                showAvatar={true}
                                            ></UserInfo>
                                        )
                                        ) : "")
                                )}></Column>
                                <Column header={t('ticket.observer')} style={{ flex: '0 0 200px', flexWrap: "wrap" }} body={(task) => (
                                    task.involves.map((involve) => (involve.role === TicketEnumeration.role.observer && involve.involveType === "user") ?
                                        involve.involveIds.map((item, index) =>
                                            <UserInfo
                                                key={`assign${index}`}
                                                id={item.id}
                                                showName={true}
                                                showAvatar={true}
                                            ></UserInfo>
                                        ) : "")
                                )}></Column>

                                <Column header={t('common.startdate')} style={{ flex: '0 0 150px' }} body={(task) => (
                                    <div>{CommonFunction.formatDateTime(task.task.startDate)}</div>
                                )}></Column>
                                <Column header={t('common.responseDeadline')} style={{ flex: '0 0 150px', display: "flex", flexWrap: "wrap" }}
                                    body={(task) => (<>
                                        <div style={checkDate(task.task.responseDate, task.task.responseDeadline) ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.87)' }}>{CommonFunction.formatDateTime(task.task.responseDeadline)}</div>
                                        {task.task.responseDeadline &&
                                            <div className="center" style={{
                                                backgroundColor: '#ffffff', width: '50%',
                                                border: '1px solid #9BA563'
                                            }}>
                                                <div className="center" style={{
                                                    backgroundColor: percentage(task.task.createDate, task.task.responseDeadline) && percentage(task.task.createDate, task.task.responseDeadline).color,
                                                    width: `${percentage(task.task.createDate, task.task.responseDeadline) && percentage(task.task.createDate, task.task.responseDeadline).percent}%`, height: '12px'
                                                }}>
                                                    {percentage(task.task.createDate, task.task.responseDeadline) && percentage(task.task.createDate, task.task.responseDeadline).percent}%
                                                </div>
                                            </div>
                                        }
                                    </>)}>
                                </Column>
                                <Column header={t('common.deadline')} style={{ flex: '0 0 150px', display: "flex", flexWrap: "wrap" }}
                                    body={(task) => (<>
                                        <div style={checkDate(task.task.resolvedDate, task.task.deadline) ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.87)' }}>{CommonFunction.formatDateTime(task.task.deadline)}</div>
                                        {task.task.deadline &&
                                            <div className="center" style={{
                                                backgroundColor: '#ffffff', width: '50%',
                                                border: '1px solid #9BA563'
                                            }}>
                                                <div className="center" style={{
                                                    backgroundColor: percentage(task.task.createDate, task.task.deadline) && percentage(task.task.createDate, task.task.deadline).color,
                                                    width: `${percentage(task.task.createDate, task.task.deadline) && percentage(task.task.createDate, task.task.deadline).percent}%`, height: '12px'
                                                }}>
                                                    {percentage(task.task.createDate, task.task.deadline) && percentage(task.task.createDate, task.task.deadline).percent}%
                                                </div>
                                            </div>
                                        }
                                    </>)}>
                                </Column>
                                <Column header={t('common.resolvedDate')} style={{ flex: '0 0 150px' }} body={(task) => (
                                    <div>{CommonFunction.formatDateTime(task.task.resolvedDate)}</div>
                                )}></Column>
                                <Column header={t('common.closedDate')} style={{ flex: '0 0 150px' }} body={(task) => (
                                    <div>{CommonFunction.formatDateTime(task.task.closedOn)}</div>
                                )}></Column>
                                {customFields && customFields.length > 0 && customFields.map((_field, _index) => (
                                    <Column key={`field_${_index}`} header={_field.name} style={{ flex: '0 0 150px' }} body={(task) => {
                                        if (task.fields && task.fields.length > 0) {
                                            let _currentField = _.find(task.fields, { fieldId: _field.fieldId });
                                            if (_currentField && _currentField.values && _currentField.values.length > 0) {
                                                return (<span>{_currentField.values.toString()}</span>)
                                            }
                                        }
                                    }}></Column>
                                ))}
                                <Column
                                    frozen
                                    alignFrozen='right'
                                    headerClassName='frozen-right-first-column'
                                    bodyClassName='p-0 flex justify-content-center align-items-center border-all frozen-right-first-column'
                                    body={(ticket) => (
                                        <Button
                                            className="p-button-rounded p-button-text"
                                            icon="bx bx-pencil"
                                            tooltip={t('common.update')}
                                            disabled={!permission}
                                            tooltipOptions={{ position: "bottom" }}
                                            onClick={() => updateTask(ticket.task)}
                                        ></Button>
                                    )}
                                    style={{ flex: "0 0 60px" }}
                                ></Column>
                            </DataTable>
                        </XLayout_Box>
                    </XLayout_Center>
                </XLayout>
                <OverlayPanel ref={refChangeStageMenu} className="x-menu">
                    {impactTaskNextStates && impactTaskNextStates.nextStates && impactTaskNextStates.nextStates.map((s, index) => (
                        <div key={index} className="x-menu-button" onClick={() => changeState(s)}>
                            <i className='bx bx-radio-circle'></i>
                            <span>{t(`ticket.state.sort.${s}`)}</span>
                        </div>
                    ))
                    }
                </OverlayPanel>
            </XLayout_Center>
        </XLayout >
    </>);
}
TicketTable = forwardRef(TicketTable);

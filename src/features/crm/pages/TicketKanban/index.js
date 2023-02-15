import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import _ from "lodash";
import classNames from "classnames";
import {Tooltip} from "primereact/tooltip";
import CommonFunction from '@lib/common';

import TicketApi from "services/TicketApi";
import "./styles.scss"
import {XLayout, XLayout_Bottom, XLayout_Box, XLayout_Left, XLayout_Right, XLayout_Top} from '@ui-lib/x-layout/XLayout';
import ProjectUtil from "components/util/ProjectUtil";
import DisplayUtil from "components/util/DisplayUtil";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import XKanban from "components/x-kanban/XKanban";
import TaskUtil from "components/util/TaskUtil";
import TicketEnumeration from "../../ticket-common/TicketEnumeration";


function TicketKanban(props, ref) {
    const t = CommonFunction.t;

    const { permission,updateTask, lazy, getConditions
        ,  colorMatrix,  riskStateColor
    } = props;
    const refKanban = useRef();
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({lanes: []});
    const [elements, setElements] = useState({});
    const [totalIssues, setTotalIssues] = useState(0);

    const ticketStates = [
        {code: 'INIT', name: t("ticket.state.ticket.INIT"), score: 0, color: "#f51515"},
        {code: 'EVALUTION', name: t("ticket.state.ticket.EVALUTION"), score: 1, color: "#ea821a"},
        {code: 'ACCEPTED', name: t("ticket.state.ticket.ACCEPTED"), score: 2, color: "#ea821a"},
        {code: 'RESPONSE', name: t("ticket.state.ticket.RESPONSE"), score: 3, color: "#f51515"},
        {code: 'IN_PROGRESS', name: t("ticket.state.ticket.IN_PROGRESS"), score: 4, color: "#f8ff76"},
        {code: 'SOLVED', name: t("ticket.state.ticket.SOLVED"), score: 5, color: "#ffd15e"},
        {code: 'COMPLETED', name: t("ticket.state.ticket.COMPLETED"), score: 6, color: "#ffd15e"},
        {code: 'CANCELED', name: t("ticket.state.ticket.CANCELED"), score: 7, color: "#ffd15e"},
        {code: 'PENDING', name: t("ticket.state.ticket.PENDING"), score: 8, color: "#ffd15e"},
        {code: 'DEFERRED', name: t("ticket.state.ticket.DEFERRED"), score: 9, color: "#ea821a"},
        {code: 'CLOSED', name: t("ticket.state.ticket.CLOSED"), score: 10, color: "#ea821a"},
    ]

    const params = {
        page: 0,
        size: 10,
        sortField: "modified_date",
        sortOrder: -1,
        body: {
            props: ["id", "name", "projectId", "deadline", "requestedBy", "responsibleId", "create_by", "start_date", "state", "type", "subtype", "responseDate", "responseDeadline", "resolvedDate", "priority", "code", "create_date"],
            include: ["next-states", "involves"],
            conditions: []
        }
    };


    useImperativeHandle(ref, () => ({
        /**
         * filter
         * @param {*} _userLogin
         */
        filter: (_lazy) => {
            loadLazyData(_lazy);
        },

        afterSubmitTicketDetail: (editMode, responseAfterSubmit, oldTicket) => {
            afterSubmitTicketDetail(editMode, responseAfterSubmit, oldTicket);
        }
    }));

    /**
     * onetime
     */
    useEffect(() => {
    }, []);
    /**
     * *
     * update ticket
     */
    const afterSubmitTicketDetail = (editMode, responseAfterSubmit, oldTicket) => {
        let _data = _.cloneDeep(data);
        if (oldTicket && oldTicket.state && oldTicket.state !== responseAfterSubmit.task.state) {
            let _laneIndex = _.findIndex(_data.lanes, {"id": oldTicket.state});
            if (_laneIndex > -1) {
                let _cardIndex = _.findIndex(_data.lanes[_laneIndex].cards, {"id": oldTicket.id})
                if (_cardIndex > -1) {
                    _data.lanes[_laneIndex].cards.splice(_cardIndex, 1);
                }
            }
        }
        if (responseAfterSubmit && responseAfterSubmit.task) {
            refreshLane(responseAfterSubmit.task.state, null).then(res => {
                let _laneIndex = _.findIndex(_data.lanes, {"id": responseAfterSubmit.task.state});
                _data.lanes[_laneIndex] = res;
                setData(_data);
            })
        }

        // Update Kanban
        let _elements = _.cloneDeep(elements);
        const oldTicketStateCode = ticketStates.find(el => el.code === oldTicket.state) ? ticketStates.find(el => el.code === oldTicket.state).name : null;
        const newTicketStateCode = ticketStates.find(el => el.code === responseAfterSubmit.task.state) ? ticketStates.find(el => el.code === responseAfterSubmit.task.state).name : null;

        if (oldTicketStateCode && newTicketStateCode && oldTicketStateCode !== newTicketStateCode) {
            let _sourceIndex = _.findIndex(_elements[oldTicketStateCode], {"id": oldTicket.id});
            if (_sourceIndex > -1) {
                const [removedElement, newSourceList] = removeFromList(_elements[oldTicketStateCode], _sourceIndex);
                _elements[oldTicketStateCode] = newSourceList;
                const destinationList = _elements[newTicketStateCode];
                _elements[newTicketStateCode] = addToList(destinationList, 0, removedElement);

                setElements(_elements);
            }
        }
    }

    /**
     * load data
     */
    const loadLazyData = async (_lazy) => {
        setLoading(true);
        let _params = _.cloneDeep(params);
        _params.body.conditions = await getConditions(_lazy)
        _params.body.checkActivityTask = false
        setTimeout(() => {
            let _data = {lanes: []};
            let _elements = {};
            let _totalIssues = 0;
            Promise.all((function* () {
                for (let state of ticketStates) {
                    let _stateParam = _.cloneDeep(_params);
                    _stateParam.body.conditions.push({
                        logicOperator: "AND",
                        conditionType: "RULE",
                        filterType: "FIELD",
                        fieldType: "STRING",
                        fieldName: "state",
                        operator: "IN",
                        values: [state.code]
                    });

                    yield new Promise(resolve => {
                        TicketApi.list(_stateParam).then(res => {
                            _totalIssues += res.total;
                            let _laneStyle = (riskStateColor && riskStateColor[state.code] && riskStateColor[state.code].style)
                                ? riskStateColor[state.code].style : {};
                            let _lane = {
                                id: state.code,
                                title: state.name,
                                style: _laneStyle,
                                label: `${res.content.length}/${res.total}`,
                                total: res.total,
                                sort: state.score,
                                cards: []
                            };
                            if (res.content && res.content.length > 0) {
                                res.content.forEach(d => {
                                    _lane.cards.push({
                                        id: d.task.id
                                        , title: d.task.name
                                        , label: d.task.name
                                        , origin: d
                                    })
                                })
                            }
                            _data.lanes.push(_lane);
                            _elements[state.name] = [..._lane.cards]
                            resolve("");
                        })
                    })
                }
            })()).then(() => {
                // bind data
                if (_data) {
                    _data.lanes = _.orderBy(_data.lanes, ['sort'], ['asc']);
                    if (!_lazy.affect.state || _lazy.affect.state.length === 0) {
                        _lazy.affect.state = [
                            TicketEnumeration.state.ticket.init, TicketEnumeration.state.ticket.inProgress,
                            TicketEnumeration.state.ticket.response, TicketEnumeration.state.ticket.pending,
                            TicketEnumeration.state.ticket.canceled, TicketEnumeration.state.ticket.solved,
                            TicketEnumeration.state.ticket.completed, TicketEnumeration.state.change.evaluation,
                            TicketEnumeration.state.change.accepted, TicketEnumeration.state.change.deferred
                        ]
                    }
                    if (_lazy.affect.state) {
                        _data.lanes = _.filter(_data.lanes, (c) => (_lazy.affect.state.includes(c.id)));
                    }
                    setData(_data);
                }
                if (_elements) {
                    setElements(_elements);
                }
                if (_totalIssues) setTotalIssues(_totalIssues);
                setLoading(false);
            })
        }, 0);
    };

    const refreshLane = async (laneId, currentSize) => {
        let _data = _.cloneDeep(data);
        let _lane = _.find(_data.lanes, {id: laneId});
        let _param = _.cloneDeep(params);

        _param.size = currentSize ? currentSize : _lane.cards.length;
        _param.body.conditions = getConditions(lazy, false)
        _param.body.conditions.push({
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "STRING",
            fieldName: "state",
            operator: "IN",
            values: [laneId]
        });
        let res = await TicketApi.list(_param);
        if (res.content && res.content.length > 0) {
            _lane.label = `${res.content.length}/${res.total}`;
            _lane.total = res.total;
            _lane.cards = []
            res.content.forEach(d => {
                _lane.cards.push({
                    id: d.task.id
                    , title: d.task.name
                    , label: d.task.name
                    , origin: d
                })
            })
        }
        return _lane;
    }

    const loadMoreCard = (laneId) => {
        let _data = _.cloneDeep(data);
        let _lane = _.find(_data.lanes, {id: laneId});
        if (_lane && _lane.cards && _lane.cards.length >= (_lane.total || 0)) {
            return false;
        }
        let _curPage = Math.floor(_lane.cards.length / params.size);
        let _param = _.cloneDeep(params);
        _param.page = (_curPage);
        _param.body.conditions = getConditions(lazy, false)
        _param.body.conditions.push({
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "FIELD",
            fieldType: "STRING",
            fieldName: "state",
            operator: "IN",
            values: [laneId]
        });
        TicketApi.list(_param).then(res => {
            if (res.content && res.content.length > 0) {
                res.content.forEach(d => {
                    _lane.cards.push({
                        id: d.task.id
                        , title: d.task.name
                        , label: d.task.name
                        , origin: d
                    })
                })
                setData(_data);
            }
        })

        setLoading(false);
    }

    const renderCard = (card) => {
        let _task = card.origin.task;
        return (
            <XLayout_Box key={`${_task.state}_${_task.id}`} className={classNames({
                "mb-2 pointer fs-13 card p-1": true,
            })}>
                <XLayout>
                    <XLayout_Top className="pb-2">
                        <div className="link-button pb-2 fs-12" onClick={() => updateTask(_task, 'EDIT')}>
                            <small className="mr-1"><i>{"[" + (_task.code || ('TICKET_' + _task.id)) + "]"}</i></small>
                            {_task.name}
                        </div>
                        <div className="flex align-items-center">
                            <i className={classNames({
                                'bx bxs-flag-alt risk-priority mr-2 fs-14': true,
                                "VERY_HIGH issue-very-high": card.origin.priority === 'VERY_HIGH',
                                "HIGH issue-high": card.origin.priority === 'HIGH',
                                "MEDIUM issue-medium": card.origin.priority === 'MEDIUM',
                                "LOW issue-low": card.origin.priority === 'LOW',
                                "VERY_LOW issue-very-low": card.origin.priority === 'VERY_LOW'
                            })}
                               style={{color: ProjectUtil.getColorMatrix(_task.priority, colorMatrix)}}>

                            </i>
                            {/*<Tooltip target={`.risk-priority.${_task.priority}`}*/}
                            {/*         content={t('issue.priority') + " " + t(`priority.${_task.priority}`)} position="top" />*/}
                            <i className={classNames({
                                'bx bxs-skull risk-severity fs-16': true,
                                "VERY_HIGH issue-very-high": _task.severity === 'VERY_HIGH',
                                "HIGH issue-high": _task.severity === 'HIGH',
                                "MEDIUM issue-medium": _task.severity === 'MEDIUM',
                                "LOW issue-low": _task.severity === 'LOW',
                                "VERY_LOW issue-very-low": _task.severity === 'VERY_LOW'
                            })}
                               style={{color: ProjectUtil.getColorMatrix(_task.severity, colorMatrix)}}>

                            </i>
                        </div>
                        <div className="fs-12">
                            <small>{t('issueDate')} : <i>{CommonFunction.formatDateTime(_task.createDate)}</i></small>
                        </div>
                        <div>
                            <small>{t('common.deadline')} : <i>{CommonFunction.formatDateTime(_task.deadline) || 'N/A'}</i></small>
                            {TaskUtil.getDueDisplay(_task, "closeDate")}
                        </div>
                        {(!_task.pendingTasks || _task.pendingTasks.length === 0) &&
                            <div className="flex pt-2">
                                <Tooltip target=".total-task" content={t('task')} position="right"/>
                                <i className='bx bx-task fs-18 pr-1'/>
                                <span className="p-my-auto p-text-italic fs-12">{t('task.empty-task')}</span>
                            </div>
                        }
                        {(_task.pendingTasks && _task.pendingTasks.length > 0) &&
                            <div className="">
                                {_task.pendingTasks.map(subTask => (
                                    <div className="flex-column py-2 border-bottom align-items-stretch">
                                        <div className="flex">
                                            <Tooltip target={`.user-task-state.${subTask.state} `}
                                                     content={t(`request.task.state.${subTask.state}`)}
                                                     position="bottom"/>
                                            <i className={classNames({
                                                "user-task-state project-list-quick-action bx px-1 fs-20": true,
                                                "PENDING bx-pause text-grey-7": subTask.state === "PENDING",
                                                "IN_PROGRESS bx-play text-teal": subTask.state === "IN_PROGRESS",
                                                "DEFERRED bx-stopwatch text-orange-9": subTask.state === "DEFERRED",
                                                "CANCELED bx-x text-red-9": subTask.state === "CANCELED",
                                                "COMPLETED bx-check text-green": subTask.state === "COMPLETED",
                                                "REVIEWING bx-list-check text-purple": subTask.state === "REVIEWING"
                                            })} style={{lineHeight: "20px"}}/>
                                            <div className="flex justify-content-end">
                                                {DisplayUtil.displayChipUser(subTask.responsibleUser, false)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </XLayout_Top>
                    <XLayout_Bottom className="pt-2">
                        <XLayout left="100%">
                            <XLayout_Left className="flex flex-column">
                                <div className="flex align-items-center">
                                    {DisplayUtil.displayChipUser(_task.requestedBy, false)}
                                    <i className='bx bx-chevron-right'></i>
                                    {DisplayUtil.displayChipUser(_task.responsibleId, false)}
                                </div>
                            </XLayout_Left>
                            <XLayout_Right>

                            </XLayout_Right>
                        </XLayout>
                    </XLayout_Bottom>
                </XLayout>
            </XLayout_Box>
        )
    };

    const renderLaneHeader = (header) => (
        <header className="flex justify-content-between" key={header.id}>
            <div className="flex align-items-center">
                <span className="p-text-bold pr-2">{header.title}</span>
                {/*{header.id === 'INIT' &&*/}
                {/*    <>*/}
                {/*        <i className="bx bx-plus-circle fs-18 create-issue" onClick={(e) => createIssue(lazy.type)}/>*/}
                {/*        <Tooltip target=".create-issue" content={t(`${lazy.type.toLowerCase()}.create`)} position="right"/>*/}
                {/*    </>*/}
                {/*}*/}
            </div>
            <span className>{header.total}/{totalIssues}</span>
        </header>
    );

    const onDragEnd = (result) => {
        if(permission){
            if (!result.destination) {
                return;
            } else if (result.source.droppableId !== result.destination.droppableId) {
                const _data = _.cloneDeep(data);
                let _sourceLane = _.find(_data.lanes, { id: result.source.droppableId });
                let _destinationLane = _.find(_data.lanes, { id: result.destination.droppableId });

                if (_sourceLane && _sourceLane.cards && _sourceLane.cards.length > 0 && _sourceLane.cards[result.source.index] && _sourceLane.cards[result.source.index].origin && _sourceLane.cards[result.source.index].origin.task && _sourceLane.cards[result.source.index].origin.task['next-states'] && _sourceLane.cards[result.source.index].origin.task['next-states'].length > 0) {
                    let _accepted = false;
                    for (let i = 0; i < _sourceLane.cards[result.source.index].origin.task['next-states'].length; i++) {
                        if (_sourceLane.cards[result.source.index].origin.task['next-states'][i] === result.destination.droppableId) {
                            _accepted = true;
                            break;
                        }
                    }
                    if (!_accepted) {
                        CommonFunction.toastWarning(t('this-ticket-not-allow-change-to') + " " + t("ticket.state.ticket." + result.destination.droppableId.toString()))
                        return;
                    } else {
                        const [removedElement, newSourceList] = removeFromList(
                            _sourceLane.cards,
                            result.source.index
                        );
                        _data.lanes = _data.lanes.map(lane => {
                            if (lane.id === result.source.droppableId) {
                                return { ...lane, total: (--_sourceLane.total), cards: newSourceList };
                            } else if (lane.id === result.destination.droppableId) {
                                return addToList(_destinationLane, result.destination.index, removedElement);
                            }
                            return lane;
                        });
                        setData(_data);

                        TicketApi.changeState(_sourceLane.cards[result.source.index].origin.task.id, result.destination.droppableId).then(res => {
                            if (res && res.task) {
                                _data.lanes = _data.lanes.map(lane => {
                                    if (lane.id === result.destination.droppableId) {
                                        if (lane.cards && lane.cards.length > 0) {
                                            lane.cards = lane.cards.map(card => {
                                                if (card.origin.task.id === res.task.id) {
                                                    card.origin.task = res.task
                                                    return card;
                                                }
                                                return card;
                                            })
                                        }
                                    }
                                    return lane;
                                });
                                setData(_data);
                            }
                        });
                    }
                } else {
                    CommonFunction.toastWarning(t('ticket-with-type-not-config-state'))
                }
            }
        } else {
            CommonFunction.toastError(t("you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator"));
        }

    };

    const removeFromList = (list, index) => {
        const result = Array.from(list);
        const [removed] = result.splice(index, 1);
        return [removed, result];
    };

    const addToList = (lane, index, element) => {
        const result = _.cloneDeep(lane);
        result.cards.splice(index, 0, element);
        return { ...result, total: (++result.total) };
    };

    return (
        <div className="ticket-kanban-container position-relative bg-white">
            <LoadingBar loading={loading} top={0}/>
            <XKanban className="ticket-kanban" ref={refKanban}
                     components={{
                         Card: renderCard,
                         LaneHeader: renderLaneHeader
                     }}
                     onLaneScroll={(laneId) => loadMoreCard(laneId)}
                     data={data} handleDragEnd={onDragEnd}
            />
        </div>
    );
}

TicketKanban = forwardRef(TicketKanban);

export default TicketKanban;

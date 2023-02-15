import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Button} from "primereact/button";

import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import TaskService from "services/TaskService";
import CommonFunction from '@lib/common';
import {Dialog} from "primereact/dialog";
import {UserAC} from "../../../components/autocomplete/UserAC";
import _ from "lodash";
import "./scss/TaskDetail.scss"
import {InputTextarea} from 'primereact/inputtextarea';
import {Message} from "primereact/message";

function TaskNextActivity(props, ref) {

    let emptyTask = {
        name: "",
        description: "",
        state: "",
        group: {},
        groupId: 0,
        userId: "",
        createBy: "",
        parentId: "",
        requestedBy: "",
        requestedByUser: {},
        requestedByUsers: [], //tempo
        deadline: null,
        startDate: null,
        closedOn: null,
        saveAsTemplate: false,
        important: false,
        repsonsibleUser: {},
        responsibleId: 0,
        responsibleUsers: [],
        responsibleIds: [],
        participantUsers: [],
        participantIds: [],
        observerUsers: [],
        observerIds: [],
        histories: [],
        checkList: []
    }

    const t = CommonFunction.t;
    const { onSubmitTask } = props;
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentTask, setCurrentTask] = useState([]);
    const [comment, setComment] = useState(null);
    const [activityState, setActivityState] = useState([]);
    const emptyComboboxOptions = {
        responsible: [],
        participant: [],
        observer: []
    }

    const workflow_state = {
        REQUEST_FAILED: "FAILED",
        REQUEST_DONE: "DONE",
        HAS_NEXT: "HAS_NEXT",
        WAIT_PARALLEL: "WAIT_PARALLEL"
    }



    useEffect(() => {
    }, [activities]);


    useImperativeHandle(ref, () => ({
        showActivities: (_activities, _currentTask) => {
            let _state = workflow_state.HAS_NEXT;

            if(_activities){
                if(_activities.length === 1){
                    if(_activities[0].state === workflow_state.REQUEST_FAILED){
                        _state = workflow_state.REQUEST_FAILED;
                    }else if(_activities[0].state === workflow_state.REQUEST_DONE){
                        _state = workflow_state.REQUEST_DONE
                    }
                }else if(_activities.length === 0){
                    _state = workflow_state.WAIT_PARALLEL;
                }
                _.forEach(_activities, function(act, index) {
                    act.index = index;
                    if(act.responsibleUsers){
                        act.includeUserIds = act.responsibleUsers.map(m => m.id);
                        act.responsibleUsers = [];
                        act.responsibleUsers.push(act.responsibleUser);
                    }
                })
            }

            setActivityState(_state);
            setActivities(_activities);
            setCurrentTask(_currentTask);
            setShowTaskDetail(true);
        },
    }));

    const hideDetail = () => {
        setShowTaskDetail(false);
    }

    const applyChange = (rowData, index, key, value) => {
        let _activities = _.cloneDeep(activities);
        switch (key) {
            case "responsibleUsers":
                if (value.length > 0) {
                    if (value.length > 1) {
                        CommonFunction.toastWarning(t("task.update.can.assign.one.people"))
                        value.shift();
                    }
                    rowData.responsibleUsers = value;
                }
                rowData.responsibleIds = value.map(m => m.id);

                if(rowData.responsibleIds.length > 0){
                    rowData.responsibleId = rowData.responsibleIds[0];
                }
                break;
            case "participantUsers":
                rowData.participantUsers = value;
                rowData.participantIds = value.map(m => m.id);
                break;
            default:
                break;
        }
        _activities[index] = rowData;
        setActivities(_activities)
    }

    const submit = async () => {
        let _task = {...currentTask};
        let _activities = [...activities];
        try {
            setLoading(true);
            setBtnLoading(true);
            let createNext = {};
            createNext.nextTasks = _activities;
            createNext.groupId = (_task.groupId ? _task.groupId : 0);
            createNext.comment = comment;
            await TaskService.createNextActivity(_task.id, createNext)
            setActivities(_activities);
            if(props.doReload){
                props.doReload();
            }
            CommonFunction.toastSuccess( t("is.completed") + " !");
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
        setBtnLoading(false);
        if(onSubmitTask){
            onSubmitTask(_task, 'EDIT')
        }
        hideDetail()
    }

    return (
        <Dialog
            header={t("task.next.activities")}
            loading={loading}
            visible={showTaskDetail}
            contentClassName="p-0"
            className="task-window-detail"
            style={{ height: activityState === workflow_state.HAS_NEXT ? "100vh"
                            : "30vh"
                        , width: "800px"}}
            modal
            onHide={hideDetail}
            footer={
                <>
                    <Button label={t('button.re-check')} icon="bx bx-x" className="p-button-text" onClick={(hideDetail)} loading={btnLoading}/>
                    <Button label={t('button.confirm')} icon="bx bx-save" className="p-button-text" className="p-button-primary" onClick={submit} loading={btnLoading} />
                </>
            }
        >
            {
                activityState === workflow_state.HAS_NEXT &&
                    <>
                    <DataTable value={activities} className="p-datatable-gridlines" emptyMessage={t('empty.data')}>
                        <Column header={t("request.next-activity")} body={(rowData) => {
                            return(
                                <>
                                    <span><b>{rowData.activityName}</b></span>
                                    <br/>
                                    <small><i>{t("task.deadline") + ": " + (rowData.durationDTO ?
                                        CommonFunction.formatDateTime(rowData.durationDTO.endDate) : " ") }</i></small>
                                </>
                            )
                        }}></Column>
                        <Column header={t("workflow.position.responsible")} body={(rowData) => {
                            return (
                                <UserAC
                                    displayType="thumbnail"
                                    id="responsibleUsers" value={rowData.responsibleUsers}
                                    groupIds={rowData.activity.performerGroupIds}
                                    includeUserIds={rowData.includeUserIds}
                                    onChange={(e) => applyChange(rowData, rowData.index, 'responsibleUsers', e.value)}
                                    // onBlur={(e) => performValidateTask(["responsibleUsers"])}
                                />
                            )
                        }}></Column>
                    </DataTable>
                    <div className="col-12 mt-2 flex">
                        <span className="p-float-label col-12 p-fluid fluid ">
                            <InputTextarea
                                className="task-description mt-1 pl-3 pr-3"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                // onTextChange={(e) => applyTaskChange('description', e.htmlValue)}
                            />
                            <label htmlFor="type">{t('task.task-description-placeholder')}</label>
                        </span>

                    </div>
                    </>
            }
            { activityState === workflow_state.REQUEST_FAILED &&

                        <>
                            <Message severity="error" text={t("request.failed")}></Message>
                        </>
            }
            { activityState === workflow_state.REQUEST_DONE &&
                    <>
                        <Message severity="success" text={t("request.success")}></Message>
                    </>
            }
            { activityState === workflow_state.WAIT_PARALLEL &&
            <>
                <Message severity="warn" text={t("request.wait")}></Message>
            </>
            }
        </Dialog>
    );
};
TaskNextActivity = forwardRef(TaskNextActivity);

export default TaskNextActivity;

import CommonFunction from '@lib/common';
                    import React, { useEffect, useRef, useState} from 'react';
// import {FullCalendar} from 'primereact/fullcalendar';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
import TaskService from "services/TaskService";


import TaskDetail from "../components/TaskDetail";
import PageHeader from 'components/page-header/PageHeader';
import "../scss/Schedule.scss";
import XFullCalendar from 'components/fullcalendar/XFullCalendar';

export default function Schedule() {
    const [events, setEvents] = useState([]);
    let emptyTask = {
        name: "",
        description: "",
        group: {},
        groupId: 0,
        userId: "",
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
    }

    let empTaskValidate = {
        name: "",
        description: ""
    }

    let emptyEvent = {
        id: 0,
        title: "",
        start: null,
        end: null,
        task: {}
    }

    const t = CommonFunction.t;
    const { user } = props;

    const [userLogin, setUserLogin] = useState(window.app_context.user);
    const [userId, setUserId] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [groups, setGroups] = useState(window.app_context.user.groups);
    const [task, setTask] = useState(emptyTask);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const refTaskDetail = useRef();
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        size: 10,
        page: 0,
        condition: {
            groupId: 0,
            conditions:
                [
                    {
                        logicOperator: "",
                        conditionType: "RULE",
                        filterType: "ROLE",
                        fieldName: "RESPONSIBLE",
                        values: [window.app_context.keycloak.tokenParsed.sub]
                    }
                ],
        }
    });

    const onClickEvent = (info) => {
        editTask(info.event.id, 'EDIT');
    }

    useEffect(() => {
        loadLazyData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const editTask = async (id, mode) => {
        refTaskDetail.current.editTask(await TaskService.getByIdAndType(id), mode);
    }

    const loadLazyData = () => {
        try {
            setLoading(true);
            TaskService.getUserTasks(lazyParams).then(data => {
                setTotalRecords(data.totalElements);
                setEvents(rebind(data.content));
            });

            setLoading(false);
        } catch (error) {
            console.log("Get data has failed", error);
        }
    };

    /**
     * rebinding
     * @param {Array} arr
     */
    const rebind = (arr) => {
        return arr.map((obj) => {
            return {
                id: obj.id,
                start: new Date(obj.startDate),
                end: obj.closedOn ? new Date(obj.closedOn) : (obj.deadline ? new Date(obj.deadline) : null),
                title: obj.name
            }
        });
    };

    return (
        <div className="page-container schedule-container">
            <PageHeader className="dashboard-page-header" title={t('menu.schedule')} breadcrumb={[t('menu.schedule')]} />
            <XFullCalendar events={events} eventClick={onClickEvent} />
            <TaskDetail ref={refTaskDetail} groups={groups} />
        </div>
    );
}

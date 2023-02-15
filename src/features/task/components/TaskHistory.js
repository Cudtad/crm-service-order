import React, {useEffect, useState} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from 'primereact/column';
import CommonFunction from '@lib/common';
import _ from "lodash";
import './scss/TaskCheckList.scss'
import {UserAC} from "../../../components/autocomplete/UserAC";

import TaskService from "services/TaskService";
import {CalendarN} from "../../../components/calendar/CalendarN";
import {Chip} from "primereact/chip";
import appSettings from 'appSettings';

export const TaskHistory = (props) => {
    const t = CommonFunction.t;
    const [histories, setHistories] = useState(props.histories ? props.histories : []);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        size: 5,
        page: 0,
    });

    let emptyHistory = {
        id : 0,
        taskId: 0,
        action: "",
        actionDate: null,
        isComplete: false,
        actionUser: {},
        dataType: "",
        oldUsers: [],
        newUsers: [],
        oldUser : {},
        newUser : {},
        oldDate : null,
        newDate : null
    }

    useEffect(() => {
        loadHistory();
    }, [lazyParams]) // eslint-disable-line react-hooks/exhaustive-deps

    const onPage = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        _lazyParams.size = _lazyParams.rows;
        setLazyParams(_lazyParams);
    }

    const loadHistory = async () => {
        let _lazyParams = lazyParams;
        if(props && props.taskId){
            let data = await TaskService.getHistory(props.taskId, _lazyParams);
            setTotalRecords(data.total)
            let _t = data.content;
            let _users = [];
            /* set list value to show autoComplete*/
            _.forEach(_t, function(item){
                _users = [];
                _users.push(item.actionUser);
                item.actionUsers = _users;

                _users = []
                _users.push(item.oldUser)
                item.oldUser = _users;

                _users = []
                _users.push(item.newUser)
                item.newUser = _users;
            });
            setHistories(_t);
        }
    }

    const columnActionDateTemplate  = (rowData) => {
        return (
            <>
                <span>{CommonFunction.formatDate(rowData.actionDate, 'DD/MM/YYYY HH:mm')}</span>
            </>
        )
   }

    const columnUserActionTemplate  = (rowData) => {
        return (
            <>
                <Chip
                    label={rowData.actionUser.fullName}
                    image={
                        rowData.actionUser.avatar
                            ? `${appSettings.api.url}/storage/file/preview/${rowData.actionUser.avatar}`
                            : `https://ui-avatars.com/api/?background=random&name=${rowData.actionUser.fullName}`
                    }
                    className="tiny " />
            </>
        )
    }

    const columnActionTemplate  = (rowData) => {
        return (
            <>
                <span>{t("history." + rowData.action)}</span>
            </>
        )
    }

    const columnOldTemplate  = (rowData) => {
        switch(rowData.dataType)
        {
            case 'USER':
                return(<>
                    <UserAC showTime hourFormat="24" value={rowData.oldUser} disabled/>
                </>);
            case 'DATE':
                return (<>
                    <CalendarN showTime hourFormat="24" value={rowData.oldDate} disabled/>
                </>);
            case 'LIST_USER':
                return (<>
                    {/*<UserAC showTime hourFormat="24" value={rowData.oldUsers} disabled/>*/}
                    <div className="flex align-items-center p-flex-wrap mb-2">
                        {rowData.oldUsers.map((user, index) => (
                            <Chip
                                key={index}
                                label={user.fullName}
                                image={
                                    user.avatar
                                        ? `${appSettings.api.url}/storage/file/preview/${user.avatar}`
                                        : `https://ui-avatars.com/api/?background=random&name=${user.fullName}`
                                }
                                className="tiny" />

                        ))}
                    </div>
                </>);
            default:
                return(<>
                    <div dangerouslySetInnerHTML={{ __html: rowData.oldValue }} />
                </>)
        }
    }

    const columnNewTemplate  = (rowData) => {
        switch(rowData.dataType)
        {
            case 'USER':
                return(<>
                    <UserAC showTime hourFormat="24" value={rowData.newUser} disabled/>
                </>);
            case 'DATE':
                return (<>
                    <CalendarN showTime hourFormat="24" value={rowData.newDate} disabled/>
                </>);
            case 'LIST_USER':
                return (<>
                    {/*<UserAC showTime hourFormat="24" value={rowData.newUsers} disabled/>*/}
                    <div className="flex align-items-center p-flex-wrap mb-2">
                        {rowData.newUsers.map((user, index) => (
                            <Chip
                                key={index}
                                label={user.fullName}
                                image={
                                    user.avatar
                                        ? `${appSettings.api.url}/storage/file/preview/${user.avatar}`
                                        : `https://ui-avatars.com/api/?background=random&name=${user.fullName}`
                                }
                                className="tiny" />

                        ))}
                    </div>
                </>);
            default:
                return(<>
                    <div dangerouslySetInnerHTML={{ __html: rowData.newValue }} />
                </>)
        }
    }

    return (
        <React.Fragment >
            <DataTable value={histories} className="p-datatable-gridlines"
                       lazy
                       paginator
                       first={lazyParams.first}
                       rows={lazyParams.size}
                       totalRecords={totalRecords}
                       rowsPerPageOptions={[5, 20, 50, 100]}
                       onPage={onPage}
                       paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink  NextPageLink "
                       currentPageReportTemplate="{first} - {last} of {totalRecords}"
            >
                <Column body={columnActionDateTemplate}  header={t('action.date')}  headerStyle={{ width: '140px' }} ></Column>
                <Column body={columnUserActionTemplate}  header={t('action.user')}  style={{ width: '150px' }}></Column>
                <Column body={columnActionTemplate} header={t('action')}  style={{ minWidth: '160px' }}></Column>
                <Column body={columnOldTemplate} header={t('old.value')}  style={{ minWidth: '150px' }}></Column>
                <Column body={columnNewTemplate} header={t('new.value')}  style={{ minWidth: '150px' }}></Column>
            </DataTable>
        </React.Fragment>
    );
}

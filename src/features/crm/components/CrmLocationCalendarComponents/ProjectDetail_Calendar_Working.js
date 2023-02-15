import {XLayout, XLayout_Center, XLayout_Top} from '@ui-lib/x-layout/XLayout';
import React, {forwardRef, useContext, useEffect, useRef, useState} from "react";
import _ from "lodash";
import CommonFunction from "@lib/common";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import "./scss/ProjectDetail_Location_Calendar_Working.scss"
import Badges from "components/badge/Badges";
import classNames from "classnames";
import ProjectDetail_Calendar_Working_Detail from './ProjectDetail_Calendar_Working_Detail';
import ProjectUtil from "components/util/ProjectUtil";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import ProjectService from "services/ProjectService";


function ProjectDetail_Calendar_Working(props, ref) {
    const { permission } = props;
    const t = CommonFunction.t;

    const referenceType = {
        workflow: "work_flow",
        service: "crm-service-service",
        group: "group"
    };
    let emptyTemplate = {
        referenceType: referenceType.service,
        referenceId: 1,
        schemaId: null,//"config_service",
        isDefault : false,
    };
    const [loading, setLoading] = useState(false);
    const [workingTimes, setWorkingTimes] = useState(null);
    const [lazyParams, setLazyParams] = useState({
        referenceType: referenceType.service,
        referenceId: 1,
    });
    const fefCalendarWorkingDetail = useRef(null);
    const dt = useRef(null);
    useEffect(() => {
        loadLazyData()
    }, []);

    const loadLazyData = async () => {
        setLoading(true);
        await ProjectService.working_time.getByDeferenceAndDefault(lazyParams).then(data => {
            if (data) {
                setWorkingTimes(data);
            }
        });
        setLoading(false);
    }

     /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    }

    /**
     * on datatable click sort on header
     * @param {*} event
     */
    const onSort = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    }

    const createCalendar = () => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        fefCalendarWorkingDetail.current.create()
    }

    const updateCalendar = (rowData) => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        ProjectService.working_time.getById(rowData.id).then(data => {
            // open dialog
            fefCalendarWorkingDetail.current.update(data);
        });
    }
    const usingCalendar = (rowData) => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        let _emptyTemplate = _.cloneDeep(emptyTemplate);
        _emptyTemplate.isDefault  = !rowData.isDefaultInReference;
        _emptyTemplate.schemaId  = rowData.id;
        ProjectService.working_time.updateTemplate(_emptyTemplate).then(data => {
            if (data) {
                loadLazyData();
                CommonFunction.toastSuccess(t("common.save-success"));
            } else {
                CommonFunction.toastError(t("common.save-un-success"));
            }
        }).catch(error => CommonFunction.toastError(error));
    }

    return (
        <XLayout className="p-2 project-application">
            <XLayout_Top className="mb-2">
                <XToolbar
                    className="p-0 mb-2"
                    left={() => (<div className="p-2">
                        <Button label={t('entry.create')} icon="bx bx-plus create" className="p-button-success"
                                onClick={createCalendar}
                        />
                    </div>)}
                >
                </XToolbar>
            </XLayout_Top>
            <XLayout_Center>
                <div className="position-relative h-full bg-white">
                    <DataTable
                        ref={dt}
                        loading={loading}
                        value={workingTimes}
                        dataKey="id"
                        showGridlines
                        emptyMessage={t('common.no-record-found')}
                        scrollable
                        scrollDirection='both'
                        scrollHeight='flex'
                        lazy
                        sortField={lazyParams.sortField}
                        sortOrder={lazyParams.sortOrder}
                    >
                        <Column
                            style={{ flex: "0 0 100px" }}
                            body={(rowData) => {
                                return (
                                    <div className="grid actions p-m-auto">
                                        <Button icon={rowData.isDefaultInReference ? "bx bxs-calendar-check" : "bx bx-calendar-alt"}
                                                className={classNames({
                                                    "p-0" : true,
                                                    "p-button-link p-col button-edit": true,
                                                    "text-red-10": rowData.isDefaultInReference,
                                                    "text-blue-10": !rowData.isDefaultInReference
                                                })}
                                                disabled={!ProjectUtil.per(permission, 'update')}
                                                tooltip={rowData.isDefaultInReference ? t("crm-service.setting.calendar.working.default") : t("crm-service.setting.calendar.working.un-default")}
                                                tooltipOptions={{ position: 'top' }}
                                                onClick={() => usingCalendar(rowData)} />
                                    </div>
                                );
                            }}>
                        </Column>
                        <Column
                            style={{ flex: "0 0 150px" }}
                            field="code" header={t('entry.code')}
                            body={(rowData) => {
                                return (
                                    <div className="p-fluid fluid  pointer" onClick={() => updateCalendar(rowData)}>
                                        <div className="p-field">
                                            <div className="ml-1 p-text-bold">
                                                <span>{rowData.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            }
                        ></Column>
                        <Column
                            style={{ flex: "1 0 200px" }}
                            field="name" header={t('entry.name')}></Column>
                        <Column
                            style={{ flex: "0 0 150px" }}
                            field="type" header={t('entry.type')}></Column>
                        <Column
                            field="status"
                            header={t('entry.status')}
                            style={{ flex: "0 0 150px" }}
                            body={(rowData) => {
                                return (
                                    <>
                                        <Badges
                                            className={classNames({
                                                "mr-2": true,
                                                "text-green bg-green-1": rowData.status && rowData.status === 1,
                                                "text-red-9 bg-red-1": !rowData.status || rowData.status === 0
                                            })}
                                        >
                                            <div
                                                className="flex align-items-center width-fit-content pl-1 pr-1"
                                            >
                                                {t("boolean.status." + rowData.status)}
                                            </div>
                                        </Badges>
                                    </>
                                )
                            }}>
                        </Column>
                        <Column
                            frozen
                            alignFrozen='right'
                            bodyClassName='p-0 flex justify-content-center align-items-center border-all frozen-right-first-column'
                            body={(rowData) => (
                                <Button
                                    className="p-button-rounded p-button-text"
                                    icon="bx bx-pencil"
                                    tooltip={t('common.update')}
                                    tooltipOptions={{ position: "bottom" }}
                                    onClick={() => updateCalendar(rowData)}
                                ></Button>
                            )}
                            style={{ flex: "0 0 60px" }}
                        ></Column>
                    </DataTable>

                </div>
            </XLayout_Center>
            <ProjectDetail_Calendar_Working_Detail permission={permission} ref={fefCalendarWorkingDetail} loadLazyData={loadLazyData} />
        </XLayout>

    );
}

ProjectDetail_Calendar_Working = forwardRef(ProjectDetail_Calendar_Working);

export default ProjectDetail_Calendar_Working;

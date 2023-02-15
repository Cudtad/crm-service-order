import React, {forwardRef,  useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import CommonFunction from '@lib/common';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import Badges from '@ui-lib/badges/Badges';
import classNames from 'classnames';


import ProjectDetail_Working_Holiday_Detail from "./ProjectDetail_Working_Holiday_Detail";
import _ from 'lodash';
import ProjectUtil from "components/util/ProjectUtil";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import ProjectService from "services/ProjectService";
import {XLayout, XLayout_Center, XLayout_Top} from '@ui-lib/x-layout/XLayout';


function ProjectDetail_Working_Holiday(props, ref) {
    const t = CommonFunction.t;
    const { type, permission } = props;
    const referenceType = {
        workflow: "work_flow",
        service: "crm-service-service",
        group: "group"
    };

    const [holidays, setHolidays] = useState(null);

    const [loading, setLoading] = useState(false);
    const [lazyParams, setLazyParams] = useState({
        referenceType: referenceType.service,
        referenceId: 1,
        types: type,
        includeGlobal: (type === "CRM-SERVICE-SERVICE"? true:false)
    });

    const refHolidayDetail = useRef();

    useEffect(() => {
        loadLazyHolidayData();
    }, []);

    /**
     * get data
     */
    const loadLazyHolidayData = () => {
        setLoading(true);
        let _lazyParams = _.cloneDeep(lazyParams);
        ProjectService.holiday.getAllHolidayByProject(_lazyParams).then(async (data) => {
            if(data) {
                let sortData = _.orderBy(data, ['date'],['desc']);
                setHolidays(sortData);
            }
            setLoading(false);
        }).catch(error => CommonFunction.toastError(error));
    };

    /**
     * on datatable click sort on header
     * @param {*} event
     */
    const onSort = (event) => {
        let _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    };

    /**
     * on datatable filter
     * @param {String} val
     */
    const onFilter = (val) => {
        let _lazyParams = { ...lazyParams, page: 0, filter: val };
        setLazyParams(_lazyParams);
    };

    /**
     * create service
     */
    const addRow = () => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        // open dialog
        refHolidayDetail.current.add({ type: { code: type, name: t(`common.${String(type).toLowerCase()}`) } });
    };

    /**
     * edit service
     * @param {*} service
     */
    const editRow = (service) => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        // call api to get service
        ProjectService.holiday.getById(service.id).then(async (data) => {
            // open dialog
             refHolidayDetail.current.edit(data);
        });
    };

    const deteteDate = (rowData) => {
        if(!ProjectUtil.per(permission, 'update')){
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        CommonFunction.showConfirm(t(`crm-service.setting.working.${String(type).toLowerCase()}.delete`), t("button.confirm"),
        () => {
            let _data = {
                referenceType: referenceType.service,
                referenceId: 1,
                holidayId: rowData.id
            }
            ProjectService.working_time.deleteTemplateByReference(_data).then((data) => {
                if(data) {
                    loadLazyHolidayData();
                }
            }).catch(error => CommonFunction.toastError(error));
        })

    };

    return (
        <>
        <XLayout className="p-2 project-application">
            <XLayout_Top>
                <XToolbar
                    className="p-0 mb-2"
                    left={() => (<div className="p-2">
                        <Button label={t('entry.create')}
                                icon="bx bx-plus create" className="p-button-success" onClick={addRow} />
                    </div>)}
                >
                </XToolbar>
            </XLayout_Top>
            <XLayout_Center>
                <div className="position-relative h-full">
                    <LoadingBar loading={loading} top={43} />
                    <DataTable
                        value={holidays}
                        loading={loading}
                        dataKey="id"
                        className="p-datatable-sm"
                        showGridlines
                        emptyMessage={t('common.no-record-found')}
                        // loading={loading}
                        scrollable
                        scrollDirection='both'
                        scrollHeight='flex'
                        lazy
                        // sort
                        onSort={onSort}
                        sortField={lazyParams.sortField}
                        sortOrder={lazyParams.sortOrder}
                    >
                        <Column
                            style={{ flex: "0 0 100px" }}
                            body={(rowData) => {
                                return (
                                    <>
                                    {ProjectUtil.per(permission, 'update') && (rowData.type === type) &&
                                        <div className="grid actions justify-content-center">
                                            <Button icon="bx bx-x"
                                                    className="p-button-text text-muted text-red-10 p-0"
                                                    tooltip={t(`crm-service.setting.working.${String(type).toLowerCase()}.delete`)}
                                                    tooltipOptions={{ position: 'top' }}
                                                    onClick={() => deteteDate(rowData)} />
                                        </div>
                                    }
                                    </>

                                );
                            }}>
                        </Column>
                        <Column
                            style={{ flex: "1 0 150px" }}
                            field="code" header={t(`crm-service.setting.working.${String(type).toLowerCase()}.name`)}
                            body={(rowData) => {
                                return (
                                    <div className="p-fluid fluid  pointer" onClick={() => editRow(rowData)}>
                                        <div className="p-field">
                                            <div className="ml-1 p-text-bold">
                                                <span>{rowData.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }}
                        >
                        </Column>
                        <Column field="date"
                                header={t(`crm-service.setting.working.${String(type).toLowerCase()}.date`)}
                                style={{ flex: "0 0 150px" }}
                                body={(rowData) => {
                                    // const startTime = rowData.startTime === 0 ? null : CommonFunction.parseLongTimeToDate(rowData.startTime);
                                    // const endTime = rowData.endTime === 0 ? null : CommonFunction.parseLongTimeToDate(rowData.endTime);
                                    //
                                    // const holidayDetail = startTime && endTime ? `(${String(startTime.getHours()).padStart(2, "0") + ":" + String(startTime.getMinutes()).padStart(2, "0")} - ${String(endTime.getHours()).padStart(2, "0") + ":" + String(endTime.getMinutes()).padStart(2, "0")})` : '';

                                    return (
                                        <p>{CommonFunction.formatDate(rowData.date, "DD/MM/YYYY")}</p>
                                    );
                                }}
                        >
                        </Column>
                        <Column field="description"
                                header={t('entry.description')}
                                style={{ flex: "0 0 300px" }}
                        >
                        </Column>
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
                                                "bg-green-7": (rowData.status === 1),
                                                "text-grey-9 bg-grey-4": !(rowData.status === 1)
                                            })}
                                        >
                                            <div
                                                className="flex align-items-center width-fit-content pl-1 pr-1"
                                            >
                                                {rowData.status === 1 ? t('status.active') : t('status.denied')}
                                            </div>
                                        </Badges>
                                    </>
                                )
                            }}>
                        </Column>

                    </DataTable>
                </div>
                <ProjectDetail_Working_Holiday_Detail permission={permission} ref={refHolidayDetail} onSubmit={loadLazyHolidayData} type={type} />
            </XLayout_Center>
        </XLayout>
           
        </>
    );
}

ProjectDetail_Working_Holiday = forwardRef(ProjectDetail_Working_Holiday);

export default ProjectDetail_Working_Holiday;

import React, { forwardRef,  useEffect, useImperativeHandle, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import CommonFunction from '@lib/common';

import { InputText } from 'primereact/inputtext';
import _ from 'lodash';
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { WorkingTimeOption } from "../WorkingTimeOption";
import { CalendarN } from "components/calendar/CalendarN";
import moment from "moment";

import { XLayout, XLayout_Center } from '@ui-lib/x-layout/XLayout';
import ProjectService from "services/ProjectService";
import ProjectUtil from "components/util/ProjectUtil";

function ProjectDetail_Location_Calendar_Working_Detail(props, ref) {
    const t = CommonFunction.t;
    const { permission } = props;
    const referenceType = {
        workflow: "work_flow",
        service: "crm-service-service",
        group: "group"
    };
    const { project, loadLazyData } = props;
    const typeCalendar = [
        {
            code: "CRM-SERVICE-SERVICE",
            name: t('common.crm-service-service')
        },
        {
            code: "COMPANY",
            name: t('common.company')
        },
        {
            code: "GOV",
            name: t('common.government')
        }
    ];
    // default service
    let emptyWorkingTime = {
        type: "CRM-SERVICE-SERVICE",
        code: "",
        name: "",
        startDate: new Date(),
        endDate: null,
        days: [
            {
                day: 0, // Sunday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 1, // Monday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 2, // Tuesday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 3, // Wednesday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 4, // Thursday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 5, // Friday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            },
            {
                day: 6, // Saturday
                times: [
                    {
                        startTime: 0,
                        duration: 0
                    }
                ]
            }
        ],
        description: "",
        status: 1,
        isDefault: false,
        isDefaultInReference: false,
        referenceType: referenceType.service,
        referenceId: 1,
        includeHoliday: false
    };

    // default validate object
    let emptyValidate = {
        type: null,
        code: null,
        name: null,
        startDate: null,
        description: null
    };

    const modeEnum = {
        create: 'create',
        update: 'update',
        delete: 'delete',
        copy: 'copy'
    };
    const [mode, setMode] = useState(modeEnum.create);
    const [readonly, setReadonly] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [currentObject, setCurrentObject] = useState(emptyWorkingTime);
    const [objectValidate, setObjectValidate] = useState(emptyValidate);

    /**
     * bind form
     */
    useEffect(() => {
    }, []);

    useImperativeHandle(ref, () => ({
        /**
         * add group
         */
        create: () => {
            setReadonly(false);
            setMode(modeEnum.create);
            setCurrentObject(emptyWorkingTime);
            setObjectValidate(emptyValidate);
            setShowDetail(true);
        },

        /**
         * edit group elements
         */
        update: async (_obj) => {
            let _defaultActive = _obj.isDefault
            if (_defaultActive) {
                setReadonly(true)
            } else {
                setReadonly(false)
            }
            setMode(modeEnum.update);
            let _days = _.sortBy((await rebindDays(_obj.days)), o => o.day);
            setCurrentObject({ ..._obj, days: _days });
            setObjectValidate(emptyValidate);
            setShowDetail(true);
        }
    }));

    /**
     * rebinding
     * @param {Array} arr
     */
    const rebindDays = async (arr) => {
        return await Promise.all(arr.map(async (obj) => ({
            ...obj,
            day: obj.day - 1,
            startDate: new Date(obj.startDate),
            endDate: new Date(obj.endDate),
            times: await rebindTimes(obj.times)
        })));
    };

    /**
     * rebinding
     * @param {Array} arr
     */
    const rebindTimes = async (arr) => {
        return await Promise.all(arr.map(obj => {
            let startHour = obj.startTime >= 1000 ? obj.startTime.toString().substr(0, 2) : obj.startTime.toString().substr(0, 1);
            let startMinute = obj.startTime >= 1000 ? obj.startTime.toString().substr(2) : obj.startTime.toString().substr(1);

            let startTime = new Date();
            startTime.setHours(startHour);
            startTime.setMinutes(startMinute);
            startTime.setSeconds(0);

            let endTime = new Date(startTime.getTime() + (obj.duration * 60 * 1000));
            return {
                ...obj,
                startTime: startTime,
                endTime: endTime
            }
        }));
    };

    /**
     * hide window detail
     */
    const hideDetail = () => {
        setCurrentObject(emptyWorkingTime);
        setObjectValidate(emptyValidate);
        setShowDetail(false);
    };

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        switch (prop) {
            case 'days':

                break;
            case 'status':
                val === true ? (val = 1) : (val = 0)
                break;
            default:
                break;
        }
        let _currentObject = { ...currentObject, [prop]: (val === undefined ? null : val) }
        setCurrentObject(_currentObject);
        performValidate([prop], _currentObject);
    };

    const rebindPayload = (obj) => {
        const startDate = CommonFunction.formatDateISO8601(new Date(obj.startDate));
        const endDate = obj.endDate ? obj.endDate : new Date(obj.startDate.getFullYear() + 10, obj.startDate.getMonth(), obj.startDate.getDate(), obj.startDate.getHours(), obj.startDate.getMinutes(), obj.startDate.getSeconds());
        return obj.days.map((obj) => ({
            ...obj,
            day: obj.day + 1,
            startDate: startDate,
            endDate: CommonFunction.formatDateISO8601(new Date(endDate)),
            times: obj.times.map(time => {
                // if (String(time.startTime).indexOf(":") < 0 || String(time.endTime).indexOf(":") < 0) return;
                // let startTime = new Date();
                // startTime.setHours(time.startTime.split(":")[0]);
                // startTime.setMinutes(time.startTime.split(":")[1]);
                // startTime.setSeconds(0);

                // let endTime = new Date();
                // endTime.setHours(time.endTime.split(":")[0]);
                // endTime.setMinutes(time.endTime.split(":")[1]);
                // endTime.setSeconds(0);

                if (time.startTime < 1 || time.endTime < 1) return;

                let startTime = Number(time.startTime.getHours() + String(time.startTime.getMinutes()).padStart(2, '0'));

                return {
                    ...time,
                    startTime: startTime,
                    duration: Math.round((time.endTime.getTime() - time.startTime.getTime()) / 60000)
                }
            }).filter(time => time !== undefined)
        }));
    };

    /**
     * submit
     */
    const submit = async (close) => {
        if (!ProjectUtil.per(permission, 'update')) {
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        // validate
        let isValid = performValidate([], currentObject);

        if (isValid) {
            try {
                let _mode = _.cloneDeep(mode)
                // clone object
                let _object = _.cloneDeep({
                    ...currentObject,
                    endDate: currentObject.endDate ? currentObject.endDate : new Date(currentObject.startDate.getFullYear() + 10, currentObject.startDate.getMonth(), currentObject.startDate.getDate(), currentObject.startDate.getHours(), currentObject.startDate.getMinutes(), currentObject.startDate.getSeconds()),
                    days: rebindPayload(currentObject),
                    status: currentObject.status ? 1 : 0
                });
                if (_mode !== modeEnum.copy && _object.id && _object.id > 0) {
                    _mode = modeEnum.update;
                    setMode(modeEnum.update)
                }
                for (const property in _object) {
                    if (property === 'version') {
                        delete _object[property]
                    }
                    if (property === 'startDate' || property === 'endDate') {
                        _object[property] = CommonFunction.formatDateISO8601(new Date(_object[property]));
                    }
                }

                // submit
                switch (_mode) {
                    case modeEnum.create:
                        // create
                        ProjectService.working_time.create(_object).then(async (data) => {
                            if (data) {
                                setCurrentObject({ ..._object, ...data, days: await rebindDays(data.days) });
                                setMode(modeEnum.update);
                                if (loadLazyData && typeof loadLazyData === "function") {
                                    loadLazyData();
                                }
                                if (close) hideDetail();
                                CommonFunction.toastSuccess(t("common.save-success"));
                            } else {
                                CommonFunction.toastError(t('common.save-un-success'));
                            }
                        }).catch(error => CommonFunction.toastError(error));
                        break;
                    case modeEnum.update:
                        // update
                        ProjectService.working_time.update(_object).then(async (data) => {
                            if (data) {
                                setCurrentObject({ ..._object, ...data, days: await rebindDays(data.days) });
                                if (loadLazyData && typeof loadLazyData === "function") {
                                    loadLazyData();
                                }
                                if (close) hideDetail();
                                CommonFunction.toastSuccess(t("common.save-success"));
                            } else {
                                CommonFunction.toastError(t('common.save-un-success'));
                            }
                        }).catch(error => CommonFunction.toastError(error));
                        break;

                    default:
                        break;
                }
            } catch (e) {
                CommonFunction.toastError(e);
            }
        }
    };

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props, object) => {
        let result = { ...objectValidate }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                // case 'type':
                //     result[prop] = object.type.length > 0 ? null : `${t('entry.type')} ${t('message.cant-be-empty')}`;
                //     break;
                case 'description':
                    result[prop] = object.description && object.description.length > 255? `${t('entry.description')} ${t("crm-service.length-over-300")}` : null;
                    break;
                case 'name':
                    if(object.name.length < 255){
                        result[prop] = object.name.length > 0 ? null : `${t('entry.name')} ${t('message.cant-be-empty')}`;
                    }else{
                        result[prop] = object.name && object.name.length > 255? `${t('entry.name')} ${t("crm-service.length-over-300")}` : null;
                    }
                    break;
                case 'code':
                    result[prop] = object.code.length > 0 ? null : `${t('entry.code')} ${t('message.cant-be-empty')}`;
                    break;
                case 'startDate':
                    result[prop] = object.startDate ? null : `${t('entry.start-date')} ${t('message.cant-be-empty')}`;
                    break;
                case 'endDate':
                    if (object.startDate && object.endDate) {
                        result[prop] = !moment(object.startDate).isAfter(object.endDate) ? null : `${t('common.end-date-must-be-after-start-date')}`
                    }
                    break;
                default:
                    break;
            }
        });

        // set state
        setObjectValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    };


    return (
        <Dialog
            header={`${t('button.' + mode)} ${t('crm-service.setting.calendar.working')}`}
            visible={showDetail}
            modal
            className="wd-1024-768"
            contentClassName="working-time-detail"
            footer={
                <>
                    <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={hideDetail} />
                    <Button label={t('common.save')}
                        // disabled={!ProjectUtil.per(permission, 'update')}
                        icon="bx bxs-save" disabled={readonly} className="p-button-primary" onClick={() => submit(true)} />
                </>
            }
            onHide={hideDetail}
        >
            <XLayout>
                <XLayout_Center>
                    <div className="formgrid grid p-fluid fluid ">
                        <div className="col-3">
                            <span className="p-float-label">
                                <Dropdown id="type" value={currentObject.type ? typeCalendar.find(o => o.code === currentObject.type) : typeCalendar[0]}
                                    options={typeCalendar}
                                    optionLabel="name"
                                    disabled
                                    className='dense' />
                                <label htmlFor="type">{t('entry.type')}</label>
                            </span>
                            {objectValidate.type && <small className="p-invalid">{objectValidate.type}</small>}
                        </div>
                        <div className="col-3">
                            <span className="p-float-label">
                                <InputText id="code" value={currentObject.code}
                                    disabled={readonly}
                                    onChange={(e) => applyChange('code', e.target.value)}
                                    className={classNames({ "dense": true, 'p-invalid': objectValidate.code })} />
                                <label htmlFor="code" className="require">{t('entry.code')}</label>
                            </span>
                            {objectValidate.code && <small className="p-invalid">{objectValidate.code}</small>}
                        </div>
                        <div className="col-6">
                            <span className="p-float-label">
                                <InputText id="name" value={currentObject.name}
                                    disabled={readonly}
                                    onChange={(e) => applyChange('name', e.target.value)}
                                    className={classNames({ "dense": true, 'p-invalid': objectValidate.name })} />
                                <label htmlFor="name" className="require">{t('entry.name')}</label>
                            </span>
                            {objectValidate.name && <small className="p-invalid">{objectValidate.name}</small>}
                        </div>
                        <div className="col-12">
                            <span className="p-float-label">
                                <InputText id="description" value={currentObject.description} rows={2} cols={30}
                                    disabled={readonly}
                                    onChange={(e) => applyChange('description', e.target.value)}
                                    autoResize
                                    className={classNames({ 'p-invalid': objectValidate.description })} />
                                <label htmlFor="description">{t('entry.description')}</label>
                                {objectValidate.description && <small className="p-invalid">{objectValidate.description}</small>}
                            </span>
                        </div>
                        <div className="col-3">
                            <span className="p-float-label">
                                <CalendarN id="startDate" value={currentObject.startDate}
                                    disabled={readonly} require
                                    showIcon showOnFocus={false} showTime={false}
                                    onChange={(e) => applyChange('startDate', e.target.value)}
                                    label={t('entry.start-date')}
                                    className={classNames({ "dense": true, 'p-invalid': objectValidate.startDate })} />
                            </span>
                            {objectValidate.startDate && <small className="p-invalid">{objectValidate.startDate}</small>}
                        </div>
                        <div className="col-3">
                            <span className="p-float-label ">
                                <CalendarN id="endDate" value={currentObject.endDate}
                                    disabled={readonly} require
                                    showIcon showOnFocus={false} showTime={false}
                                    onChange={(e) => applyChange('endDate', e.target.value)}
                                    label={t('entry.end-date')}
                                    className={classNames({ 'p-invalid': objectValidate.endDate })} />
                            </span>
                            {objectValidate.endDate && <small className="p-invalid">{objectValidate.endDate}</small>}
                        </div>

                        <div className="col-3 flex align-items-center">
                            <div className="p-field-checkbox mb-0">
                                <Checkbox
                                    inputId="status"
                                    name="status"
                                    checked={currentObject.status === 1 ? true : false}
                                    disabled={readonly}
                                    onChange={(e) => applyChange('status', e.checked)} />
                                <label htmlFor="status">{t('status.active')}</label>
                            </div>
                        </div>
                        <div className="col-3 flex align-items-center">
                        <div className="p-field-checkbox mb-0">
                                <Checkbox inputId="include-holiday" disabled={readonly} name="include-holiday" checked={currentObject.includeHoliday}
                                          onChange={(e) => applyChange('includeHoliday', e.checked)}/>
                                <label htmlFor="include-holiday">{t('working-time.include-holiday.active')}</label>
                            </div>
                        </div>
                        {readonly &&
                            <div className="col-12">
                                <i>{`* ${t('crm-service.working-time.calendar.default-working-time')}`}</i>
                            </div>
                        }

                    </div>

                    <WorkingTimeOption days={currentObject.days} disabled={readonly} applyChange={applyChange} />

                </XLayout_Center>
            </XLayout>
        </Dialog>
    );
}
ProjectDetail_Location_Calendar_Working_Detail = forwardRef(ProjectDetail_Location_Calendar_Working_Detail);
export default ProjectDetail_Location_Calendar_Working_Detail;

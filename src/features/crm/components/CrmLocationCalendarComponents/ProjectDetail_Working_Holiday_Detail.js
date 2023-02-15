import React, { forwardRef,  useImperativeHandle, useState } from 'react';

import classNames from 'classnames';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from "primereact/checkbox";

import _ from 'lodash';
import CommonFunction from '@lib/common';
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";
import ProjectUtil from "components/util/ProjectUtil";
import { XLayout, XLayout_Center } from '@ui-lib/x-layout/XLayout';
import ProjectService from "services/ProjectService";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';

function ProjectDetail_Working_Holiday_Detail(props, ref) {
    const t = CommonFunction.t;
    const { type, permission } = props;
    const referenceType = {
        workflow: "work_flow",
        service: "crm-service-service",
        group: "group"
    };

    const typeHoliday = [
        {
            code: "COMPANY",
            name: t('common.company')
        },
        {
            code: "GOV",
            name: t('common.government')
        },
        {
            code: "CRM-SERVICE-SERVICE",
            name: t('common.crm-service-service')
        },
        {
            code: "WORKING",
            name: t('common.working')
        },
    ];
    // default service
    let emptyObject = {
        id: 0,
        groupId: 0,
        type: (type ? typeHoliday.find(o => o.code === type) : typeHoliday[2]),
        code: "",
        date: new Date(),
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(0, 0, 0, 0)),
        timeDTOS: [{ startTime: 0, duration: 0 }],
        startTime: 0,
        endTime: 0,
        duration: 0,
        description: "",
        status: true,
        referenceType: referenceType.service,
        referenceId: 1,
        userId: window.app_context.user.id
    };
    let emptyObjects = [emptyObject]

    // default validate object
    let emptyValidate = {
        code: null,
        description: null,
        date: null,
    };

    const modeEnum = {
        create: 'create',
        update: 'update',
        copy: 'copy'
    };


    const [detailMode, setDetailMode] = useState(modeEnum.create);

    const [showDetail, setShowDetail] = useState(false);
    const [readonly, setReadonly] = useState(false);
    const [currentObjects, setCurrentObjects] = useState(emptyObjects);
    const [objectValidates, setObjectValidates] = useState([emptyValidate]);

    useImperativeHandle(ref, () => ({
        /**
         * add
         */
        add: () => {
            let _emptyObjects = _.cloneDeep(emptyObjects)
            setDetailMode(modeEnum.create);
            setCurrentObjects(_emptyObjects);
            setObjectValidates([emptyValidate]);
            setShowDetail(true);
            setReadonly(false)
        },

        /**
         * edit
         */
        edit: (_obj) => {
            if (_obj && _obj.type !== type) {
                setReadonly(true)
            } else {
                setReadonly(false)
            }
            let _currentObject = rebindObject(_obj);
            let mapCurrentObj = { ...emptyObject, ..._currentObject }
            setDetailMode(modeEnum.update);
            setCurrentObjects([mapCurrentObj]);
            setObjectValidates([emptyValidate]);
            setShowDetail(true);
        }
    }));

    const rebindObject = (obj) => {
        return {
            ...obj,
            type: typeHoliday.find(type => type.code === obj.type),
            date: new Date(obj.date),
            startDate: obj.startTime === 0 ? null : CommonFunction.parseLongTimeToDate(obj.startTime),
            endDate: obj.endTime === 0 ? null : CommonFunction.parseLongTimeToDate(obj.endTime),
            timeDTOS: obj.timeDTOS && obj.timeDTOS.length > 0 ? rebindTimes(obj.timeDTOS) : [{ startTime: 0, duration: 0 }],
            status: obj.status === 1 ? true : false
        }
    };

    /**
     * rebinding
     * @param {Array} arr
     */
    const rebindTimes = (arr) => {
        arr.map(obj => {
            let startHour = obj.startTime >= 1000 ? obj.startTime.toString().substr(0, 2) : obj.startTime.toString().substr(0, 1);
            let startMinute = obj.startTime >= 1000 ? obj.startTime.toString().substr(2) : obj.startTime.toString().substr(1);

            let startTime = new Date();
            startTime.setHours(startHour);
            startTime.setMinutes(startMinute);

            let endTime = new Date(startTime.getTime() + (obj.duration * 60 * 1000));

            obj.startDate = startTime;
            obj.endDate = endTime;
        });
        return arr;
    };

    /**
     * hide window detail
     */
    const hideDetail = () => {
        setShowDetail(false);
    };

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val, indexParent, index) => {
        // set state value
        let _currentObjects = _.cloneDeep(currentObjects)
        let _currentObject = _currentObjects[indexParent];
        _currentObject[prop] = (val === undefined ? null : val)

        switch (prop) {
            case 'startDate':
                if (val) {
                    // const startTime = Number(String(val.getHours()) + String(val.getMinutes()).padStart(2, '0'));
                    _currentObject.timeDTOS[index].startDate = val;
                    _currentObject.timeDTOS[index].startTime = Number(String(val.getHours()) + String(val.getMinutes()).padStart(2, '0'));
                }
                break;
            case 'endDate':
                if (val) {
                    // const endTime = Number(String(val.getHours()) + String(val.getMinutes()).padStart(2, '0'));
                    _currentObject.timeDTOS[index].endDate = val;
                    _currentObject.timeDTOS[index].endTime = Number(String(val.getHours()) + String(val.getMinutes()).padStart(2, '0'));
                }
                break;
            default:
                break;
        }
        if (_currentObject.startDate && _currentObject.endDate) {
            _currentObject.duration = Math.floor((_currentObject.endDate.getTime() - _currentObject.startDate.getTime()) / 60000)
        }
        setCurrentObjects(_currentObjects);
        // performValidate([prop], _currentObject,indexParent);
    };

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props, currentObject, index) => {
        let _objectValidates = _.cloneDeep(objectValidates)
        let result = _objectValidates[index]
        let isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }
        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'description':
                    result[prop] = currentObject.description && currentObject.description.length > 255? `${t('entry.description')} ${t("crm-service.length-over-300")}` : null;
                    break;
                case 'code':
                    result[prop] = currentObject.code && currentObject.code.length > 0 ? (currentObject.code.length > 255 ? `${t('common.name')} ${t("crm-service.length-over-300")}` : null) : `${t('common.name')} ${t('message.cant-be-empty')}`;
                    break;
                case 'date':
                    result[prop] = currentObject.date ? null : `${t('entry.date')} ${t('message.cant-be-empty')}`;
                    break;
                default:
                    break;
            }
        });

        // set state
        setObjectValidates(_objectValidates);

        // check if object has error
        _objectValidates.forEach((itemObj) => {
            for (const property in itemObj) {
                if (itemObj[property]) {
                    isValid = false;
                    break;
                }
            }
        })


        return isValid;
    };

    /**
     * submit holiday
     */
    const submit = (close, mode = detailMode) => {
        if (!ProjectUtil.per(permission, 'update')) {
            CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
            return
        }
        // validate
        if (currentObjects && currentObjects.length > 0)
            currentObjects.map(async (currentObject, _indexObj) => {
                let isValid = performValidate([], currentObject, _indexObj);
                if (isValid) {
                    try {
                        // clone object
                        let _object = _.cloneDeep({
                            ...currentObject,
                            type: currentObject.type.code,
                            timeDTOS: currentObject.timeDTOS.map(time => {
                                if (time.startTime < 1 || time.endTime < 1) return;

                                let startTime = Number(time.startDate.getHours() + String(time.startDate.getMinutes()).padStart(2, '0'));

                                return {
                                    ...time,
                                    startTime: startTime,
                                    duration: Math.floor((time.endDate.getTime() - time.startDate.getTime()) / 60000)
                                }
                            }).filter(time => time !== undefined)
                        });
                        if (mode !== modeEnum.copy && _object.id && _object.id > 0) {
                            mode = modeEnum.update;
                        }
                        for (const property in _object) {
                            if (property === 'version') {
                                delete _object[property]
                            }
                        }

                        // submit
                        switch (mode) {
                            case modeEnum.create:
                                // create
                                await ProjectService.holiday.createHolidayByReference(_object).then(data => {
                                    if (data) {
                                        setDetailMode(modeEnum.update);
                                        props.onSubmit();
                                        if (close) hideDetail();
                                        CommonFunction.toastSuccess(t("common.save-success"));
                                    } else {
                                        CommonFunction.toastError(t('common.save-un-success'));
                                    }
                                });
                                break;
                            case modeEnum.update:
                                // update
                                await ProjectService.holiday.updateHolidayByReference(_object).then(data => {
                                    if (data) {
                                        props.onSubmit();
                                        if (close) hideDetail();
                                        CommonFunction.toastSuccess(t("common.save-success"));
                                    } else {
                                        CommonFunction.toastError(t('common.save-un-success'));
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    } catch (e) {
                        CommonFunction.toastError(e);
                    }
                }
            })

    };

    const addWorkingTime = (index) => {
        let _currentObjects = _.cloneDeep(currentObjects);
        let _currentObject = _currentObjects[index];
        let _emptyObj = { startTime: 0, endTime: 0, duration: 0 };

        _currentObject.timeDTOS.push(_emptyObj);
        setCurrentObjects(_currentObjects);
    };

    const deleteWorkingTime = (indexParent, index) => {
        let _currentObjects = _.cloneDeep(currentObjects);
        let _currentObject = _currentObjects[indexParent];
        _currentObject.timeDTOS.splice(index, 1);
        setCurrentObjects(_currentObjects);
    };

    // thêm 1 hàng mới
    const addRow = () => {
        let _currentObjects = _.cloneDeep(currentObjects);
        let _emptyObject = _.cloneDeep(emptyObject);
        let _objectValidates = _.cloneDeep(objectValidates);
        let _emptyObjectValidate = _.cloneDeep(emptyValidate);
        _objectValidates.push(_emptyObjectValidate)
        _currentObjects.push(_emptyObject);
        setObjectValidates(_objectValidates)
        setCurrentObjects(_currentObjects)
    };
    const deleteRow = (index) => {
        let _currentObjects = _.cloneDeep(currentObjects);
        let _objectValidates = _.cloneDeep(objectValidates);
        _currentObjects.splice(index, 1);
        _objectValidates.splice(index, 1);
        setObjectValidates(_objectValidates)
        setCurrentObjects(_currentObjects)
    }

    return (
        <Dialog
            header={`${t('button.' + detailMode)} ${t(`crm-service.setting.working.${String(type).toLowerCase()}`)}`}
            visible={showDetail}
            modal
            contentClassName="overflow-auto over"
            className="p-fluid fluid  wd-800-600"
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
                    <div className="formgrid grid">
                        <div className="col-12">
                            <span className="p-float-label">
                                <Dropdown id="type" value={type ? typeHoliday.find(o => o.code === type) : typeHoliday[0]}
                                    options={typeHoliday}
                                    optionLabel="name"
                                    disabled
                                    className='dense' />
                                <label htmlFor="type">{t('entry.type')}</label>
                            </span>
                        </div>
                    </div>
                    <div className="p-field formgrid">
                        {!readonly && detailMode !== modeEnum.update &&
                            <div className="width-fit-content mb-1">
                                <Button label={t("crm-service.setting.add-card")}
                                    icon="bx bx-screenshot"
                                    className="text-muted"
                                    disabled={readonly || detailMode === modeEnum.update}
                                    onClick={(addRow)} />
                            </div>
                        }
                    </div>

                    {currentObjects && currentObjects.length > 0 &&
                        currentObjects.map((currentObject, parentIndex) => (
                            <div className="formgrid grid p-shadow-2 pt-2 mx-0 mb-2" key={`child_${parentIndex}`} >
                                <div className="col-5">
                                    <span className="p-float-label">
                                        <InputText id={`code-${parentIndex}`} value={currentObject.code}
                                            disabled={readonly}
                                            onChange={(e) => applyChange('code', e.target.value, parentIndex)}
                                            className={classNames({ 'p-invalid': objectValidates[parentIndex].code, 'dense': true })} />
                                        <label htmlFor={`code-${parentIndex}`}>{t('common.name')}</label>
                                    </span>
                                    {objectValidates[parentIndex].code && <small className="p-invalid">{objectValidates[parentIndex].code}</small>}
                                </div>

                                <div className="col-5">
                                    <span className="p-float-label">
                                        <XCalendar id={`date-${parentIndex}`} value={currentObject.date}
                                            disabled={readonly}
                                            showDate
                                            onChange={(e) => applyChange('date', e, parentIndex)}
                                            label={t('entry.date')}
                                            className={classNames({ 'p-invalid': objectValidates[parentIndex].date, 'dense': true })} />
                                        {/*<label htmlFor="date">{t('entry.date')}</label>*/}
                                    </span>
                                    {objectValidates[parentIndex].date && <small className="p-invalid">{objectValidates[parentIndex].date}</small>}
                                </div>

                                <div className="col-2">
                                    {!readonly && detailMode !== modeEnum.update &&
                                        <div className="width-fit-content h-full p-ml-auto flex">
                                            <Button icon="bx bx-x"
                                                tooltip={t("crm-service.setting.delete-card")}
                                                tooltipOptions={{ position: 'bottom' }}
                                                className="p-as-start p-button-rounded p-button-text text-red-9"
                                                onClick={(e) => deleteRow(parentIndex)}
                                            />
                                        </div>
                                    }
                                </div>

                                {currentObject.type && currentObject.type.code === 'WORKING' &&
                                    currentObject.timeDTOS && currentObject.timeDTOS.map((time, index) => (
                                        <React.Fragment key={index}>
                                            <div className="col-5">
                                                <span className="p-float-label">
                                                    <Calendar id={`start-${parentIndex}`} value={time.startDate}
                                                        timeOnly mask="99:99" showIcon showOnFocus={false}
                                                        icon="pi pi-clock"
                                                        disabled={readonly}
                                                        onChange={(e) => applyChange('startDate', e.target.value, parentIndex, index)}
                                                        className={classNames({ 'dense': true })} />
                                                    <label htmlFor={`start-${parentIndex}`}>{t('entry.start-time')}</label>
                                                </span>
                                                {/* {objectValidates[index].startTime && <small className="p-invalid">{objectValidates[index].startTime}</small>} */}
                                            </div>
                                            <div className="col-5">
                                                <span className="p-float-label">
                                                    <Calendar id={`end-${parentIndex}`} value={time.endDate}
                                                        timeOnly mask="99:99" showIcon showOnFocus={false}
                                                        icon="pi pi-clock"
                                                        disabled={readonly}
                                                        onChange={(e) => applyChange('endDate', e.target.value, parentIndex, index)}
                                                        className={classNames({ 'dense': true })} />
                                                    <label htmlFor={`end-${parentIndex}`}>{t('entry.end-time')}</label>
                                                </span>
                                                {/* {objectValidates[index].endTime && <small className="p-invalid">{objectValidates[index].endTime}</small>} */}
                                            </div>
                                            <div className="col-2 mt-1 fs-26">
                                                <Tooltip target=".add-time" content={t('working-time.create')} position="bottom" />
                                                {index === 0 && !readonly && <i className='bx bx-plus text-green-9 add-time pointer' onClick={() => addWorkingTime(parentIndex)}></i>}

                                                <Tooltip target=".delete-time" content={t('working-time.delete')} position="bottom" />
                                                {!readonly && <i className='bx bx-x text-red-9 delete-time pointer' onClick={() => deleteWorkingTime(parentIndex, index)}></i>}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                {currentObject.timeDTOS && currentObject.timeDTOS.length === 0 && !readonly &&
                                    <div className="col-12">
                                        <Tooltip target=".add-time" content={t('working-time.create')} position="bottom" />
                                        <i className='bx bx-plus text-green-9 add-time' onClick={() => addWorkingTime(parentIndex)}></i>
                                    </div>
                                }

                                <div className="col-10">
                                    <span className="p-float-label">
                                        <InputTextarea id={`description-${parentIndex}`} value={currentObject.description} rows={2} cols={30}
                                            onChange={(e) => applyChange('description', e.target.value, parentIndex)}
                                            disabled={readonly}
                                            autoResize
                                        />
                                        <label htmlFor={`description-${parentIndex}`}>{t('entry.description')}</label>
                                    </span>
                                    {objectValidates[parentIndex].description && <small className="p-invalid">{objectValidates[parentIndex].description}</small>}
                                </div>
                                <div className="col-2 align-items-center flex">
                                    <Checkbox className="mr-2" inputId={`status-${parentIndex}`} name="status" disabled={readonly} checked={currentObject.status}
                                        onChange={(e) => applyChange('status', e.checked, parentIndex, parentIndex)} />
                                    <label htmlFor={`status-${parentIndex}`} className="p-0">{t('status.active')}</label>
                                </div>
                            </div>


                        ))
                    }
                </XLayout_Center>
            </XLayout>

        </Dialog>
    );
}

ProjectDetail_Working_Holiday_Detail = forwardRef(ProjectDetail_Working_Holiday_Detail);

export default ProjectDetail_Working_Holiday_Detail;

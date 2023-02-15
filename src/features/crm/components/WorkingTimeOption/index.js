import React, { useEffect, useState } from "react";
import classNames from 'classnames';

import _ from 'lodash';
import CommonFunction from "@lib/common";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { XLayout_Box } from '@ui-lib/x-layout/XLayout';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';

export const WorkingTimeOption = (props) => {
    // default validate object
    let emptyValidate = {
        startTime: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
        ],
        endTime: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
        ]
    };

    const t = CommonFunction.t;

    const dayNamesShort = [
        t("common.day.short.sunday"),
        t("common.day.short.monday"),
        t("common.day.short.tuesday"),
        t("common.day.short.wednesday"),
        t("common.day.short.thursday"),
        t("common.day.short.friday"),
        t("common.day.short.saturday")
    ];

    const dayNames = [
        t("common.day.sunday"),
        t("common.day.monday"),
        t("common.day.tuesday"),
        t("common.day.wednesday"),
        t("common.day.thursday"),
        t("common.day.friday"),
        t("common.day.saturday")
    ];

    const [objectValidate, setObjectValidate] = useState(emptyValidate);
    const [selectedDays, setSelectedDays] = useState(null);
    const [days, setDays] = useState(null);

    const dayOfWeek = [
        {
            name: dayNamesShort[0],
            value: 0,
        },
        {
            name: dayNamesShort[1],
            value: 1,
        },
        {
            name: dayNamesShort[2],
            value: 2,
        },
        {
            name: dayNamesShort[3],
            value: 3,
        },
        {
            name: dayNamesShort[4],
            value: 4,
        },
        {
            name: dayNamesShort[5],
            value: 5,
        },
        {
            name: dayNamesShort[6],
            value: 6,
        }
    ]

    useEffect(() => {
        if (props.days) {
            // let days = _.cloneDeep(props.days);
            //
            // // Sort by day
            // let sortDays = (_.sortBy(days, ['day'])).filter(day => day.times.length > 0);
            //
            // // Selected day
            // let selectedDays = (_.cloneDeep(sortDays)).filter(day => day.times.length > 0).map(day => (day.day));
            //
            // setSelectedDays(selectedDays);
            // setDays(sortDays);

            // demo
            setDays(props.days.map(day => {
                if (day.times && day.times.length > 0) {
                    return day;
                }
                return {
                    ...day,
                    times: []
                }
            }));
        }
    }, [props.days]);

    const performValidate = (props, val, indexDate, indexTime) => {
        // validate
        let result = { ...objectValidate }, isValid = true;

        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        const numberPropTime = Number(_.cloneDeep(val).replaceAll(":", "").replaceAll("_", ""));

        const intValue = Number(_.cloneDeep(val).replaceAll(":", "").replaceAll("_", ""));
        const time = _.cloneDeep(val).replaceAll("_", "").split(":");
        const hour = Number(time[0]);
        const minute = Number(time[1]);

        // validate props
        props.forEach(prop => {
            indexDate.forEach(idxDate => {
                indexTime.forEach(idxTime => {
                    result[prop][idxDate][idxTime] = null;

                    // check null or empty
                    switch (prop) {
                        case 'startTime':
                            const numberEndTime = days[idxDate].times[idxTime]['endTime'] ? Number(_.cloneDeep(days[idxDate].times[idxTime]['endTime']).replaceAll(":", "").replaceAll("_", "")) : 0;

                            result[prop][idxDate][idxTime] = numberEndTime > 0 && numberPropTime > numberEndTime ? t("common.invalid.start-time") : null;
                            // result[prop][idxDate][idxTime] = days[idxDate].times[idxTime][prop] > 0 ? null : `${t('common.start-time')} ${t('message.cant-be-empty')}`;
                            // if (!result[prop][idxDate][idxTime]) result['endTime'][idxDate][idxTime] = days[idxDate].times[idxTime]['endTime'] && days[idxDate].times[idxTime]['endTime'].length > 0 ? null : `${t('common.end-time')} ${t('message.cant-be-empty')}`;
                            break;
                        case 'endTime':
                            const numberStartTime = days[idxDate].times[idxTime]['startTime'] ? Number(_.cloneDeep(days[idxDate].times[idxTime]['startTime']).replaceAll(":", "").replaceAll("_", "")) : 0;

                            result[prop][idxDate][idxTime] = numberStartTime > 0 && numberStartTime > numberPropTime ? t("common.invalid.end-time") : null;
                            // result[prop][idxDate][idxTime] = days[idxDate].times[idxTime][prop] > 0 ? null : `${t('common.end-time')} ${t('message.cant-be-empty')}`;
                            // if (!result[prop][idxDate][idxTime]) result['startTime'][idxDate][idxTime] = days[idxDate].times[idxTime]['startTime'] && days[idxDate].times[idxTime]['startTime'].length > 0 ? null : `${t('common.start-time')} ${t('message.cant-be-empty')}`;
                            break;
                        default:
                            break;
                    }

                    // check format hour & minute
                    if (hour === NaN || hour < 0 || hour > 23) {
                        result[prop][idxDate][idxTime] = t("common.invalid.hour");
                    }
                    if (minute === NaN || minute < 0 || minute > 59) {
                        result[prop][idxDate][idxTime] = t("common.invalid.minute");
                    }
                })
            });
        });

        // set state
        setObjectValidate(result);

        // check if object has error
        for (const property in result) {
            indexDate.forEach(idxDate => {
                indexTime.forEach(idxTime => {
                    if (result[property][idxDate][idxTime]) {
                        isValid = false;

                    }
                });
            });
        }

        return isValid;
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     * @param {number} indexDate
     * @param {number} indexTime
     */
    const applyChangeTime = async (prop, val, indexDate, indexTime) => {
        // debugger
        let _days = _.cloneDeep(days);

        // set state value
        switch (prop) {
            case 'startTime':
                _days[indexDate].times[indexTime].startTime = val;
                break;
            case 'endTime':
                _days[indexDate].times[indexTime].endTime = val;
                break;
            default:
                break;
        }

        setDays(_days);
        props.applyChange('days', _days);
    };

    const changeDay = (e) => {
        let _oldDays = _.cloneDeep(selectedDays);
        let _newDays = _.cloneDeep(e.value);
        let _days = _.cloneDeep(days);

        // console.log('old', _oldDays)
        // console.log('new', _newDays)

        let addDay = _.difference(_newDays, _oldDays);
        let deleteDay = _.difference(_oldDays, _newDays);

        // console.log('newDay', addDay)
        // console.log('diffDay', deleteDay)

        if (addDay && addDay.length > 0) {
            _days.push({
                day: addDay,
                times: [
                    { startTime: 0, endTime: 0 }
                ]
            });
        } else if (deleteDay && deleteDay.length > 0) {
            let index = CommonFunction.findArrayIndex(_days, 'day', deleteDay[0])[0];
            if (index > -1) {
                _days.splice(index, 1);
            }
        }

        console.log('changeDay', _days)

        setDays(_days)
        setSelectedDays(_newDays);
        props.applyChange('days', _days);
    };

    const addWorkingTime = (index) => {
        const _days = [...days];

        _days[index].times = [..._days[index].times, { startTime: 0, duration: 0 }]

        setDays(_days);
    };

    const deleteWorkingTime = (indexDay, indexTime) => {
        const _days = [...days];

        _days[indexDay].times.splice(indexTime, 1);

        setDays(_days);
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "100px 200px 200px 1fr",
        width: "100%"
    }
    const headerClassName = "bold p-p-2 border-all bg-grey-2";
    const bodyClassName = "p-d-flex p-ai-center border-all bg-white";
    return (<XLayout_Box className="p-p-0 p-mb-1">
        <div style={gridStyle} >
            <div className={headerClassName}></div>
            <div className={headerClassName}>{t('common.start-time')}</div>
            <div className={headerClassName}>{t('common.end-time')}</div>
            <div className={headerClassName}></div>
        </div>
        {days && days.map((day, i) => (<React.Fragment key={i}>
            {day.times && day.times.map((time, index) => (<React.Fragment key={index}>
                <div style={gridStyle}>
                    <div className={classNames({ "p-d-flex p-ai-center p-px-2 border-left border-right bg-white": true, "border-top": index === 0 })}>
                        {index === 0 ? dayNames[day.day] : ""}
                    </div>
                    <div className={bodyClassName}>
                        <XCalendar
                            id={"startTime" + i + index}
                            className={classNames({
                                "inline-grid w-full": true,
                                'p-invalid': objectValidate.startTime.length > 0 && objectValidate.startTime[i][index]
                            })}
                            showTime
                            showDate={false}
                            value={time.startTime}
                            disabled={props.disabled}
                            onChange={(val) => applyChangeTime('startTime', val, i, index)}
                        />
                        {objectValidate.startTime.length > 0 && objectValidate.startTime[i][index] && <small className="p-invalid">{objectValidate.startTime[i][index]}</small>}
                    </div>

                    <div className={bodyClassName}>
                        <XCalendar
                            id={"endTime" + i + index}
                            className={classNames({
                                "inline-grid w-full": true,
                                'p-invalid': objectValidate.endTime.length > 0 && objectValidate.endTime[i][index]
                            })}
                            showTime
                            showDate={false}
                            value={time.endTime}
                            disabled={props.disabled}
                            onChange={(val) => applyChangeTime('endTime', val, i, index)}
                        />
                        {objectValidate.endTime.length > 0 && objectValidate.endTime[i][index] && <small className="p-invalid">{objectValidate.endTime[i][index]}</small>}
                    </div>

                    <div className={bodyClassName}>
                        {index === 0 && !props.disabled &&
                            <Button
                                icon="bx bx-plus text-green-9 fs-20"
                                className="p-button-text p-button-rounded"
                                tooltip={t('working-time.create')}
                                onClick={() => addWorkingTime(i)}

                            ></Button>
                        }
                        {!props.disabled &&
                            <Button
                                icon="bx bx-x text-red-9 fs-20"
                                className="p-button-text p-button-rounded"
                                tooltip={t('working-time.delete')}
                                onClick={() => deleteWorkingTime(i, index)}
                            ></Button>
                        }
                    </div>
                </div>
            </React.Fragment>))}

            {day.times && day.times.length === 0 && !props.disabled &&
                <div style={gridStyle}>
                    <div className="p-d-flex p-ai-center p-px-2 border-all">
                        {dayNames[day.day]}
                    </div>
                    <div className="border-all bg-grey-2"></div>
                    <div className="border-all bg-grey-2"></div>
                    <div className="border-all">
                        <Button
                            icon="bx bx-plus text-green-9 fs-20"
                            className="p-button-text p-button-rounded"
                            tooltip={t('working-time.create')}
                            onClick={() => addWorkingTime(i)}
                        ></Button>
                    </div>
                </div>
            }

        </React.Fragment>))
        }
    </XLayout_Box>);
}

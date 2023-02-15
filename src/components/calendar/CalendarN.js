import React, { forwardRef,  useEffect, useImperativeHandle, useRef, useState } from 'react';
import CommonFunction from '@lib/common';
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const CalendarN = (props) => {
    const id = `D_${CommonFunction.getIdNumber()}`;
    const [isFocus, setIsFocus] = useState(false);

    const monthNavigatorTemplate = (e) => {
        return <Dropdown  value={e.value} options={e.options}
            onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1 }} />;
    }

    const yearNavigatorTemplate = (e) => {
        return <Dropdown value={e.value} options={e.options}
            onChange={(event) => e.onChange(event.originalEvent, event.value)} className="ml-2" style={{ lineHeight: 1 }} />;
    }

    const onFocus = (e) => {
        setIsFocus(true);
    }

    const onBlur = (e) => {
        setIsFocus(false);
        if (props.onBlur) {
            props.onBlur(e);
        }
    }

    return (

        // <span className={`${props.label && "p-float-label"} ${props.labelClass && props.labelClass} ${props.disabled ? "calendar-disabled" : ""}`}>
        //     {props.disabled ?
        //         <>
        //             <div style={{ fontWeight: 'bold' }}>{props.label}</div>
        //             {props.value
        //                 ?
        //                 <div className="p-text-normal">
        //                     {(props.showTime ? CommonFunction.formatDate(props.value, 'DD/MM/YYYY HH:mm')
        //                         : CommonFunction.formatDate(props.value, 'DD/MM/YYYY'))}
        //                 </div>
        //                 :
        //                 <div className="p-text-light">
        //                     {(props.showTime ? '__/__/____ _:_'
        //                         : '__/__/____')}
        //                 </div>
        //             }
        //         </>
        //         :
        //         <>
        //             <Calendar
        //                 id={props.id ? props.id : id}
        //                 inline={props.inline}
        //                 showTime={props.showTime}
        //                 hourFormat={props.hourFormat}
        //                 value={props.value ? new Date(props.value) : null}
        //                 locale={CommonFunction.getCurrentLanguage()}
        //                 onChange={props.onChange}
        //                 onBlur={props.onBlur}
        //                 showIcon={props.showIcon}
        //                 showOnFocus={props.showOnFocus}
        //                 disabled={props.disabled}
        //                 showButtonBar={props.showButtonBar}
        //                 placeholder={props.placeholder}
        //                 icon="bx bx-calendar"
        //                 className={props.className}
        //                 style={props.style}
        //                 monthNavigator={props.monthNavigator}
        //                 yearNavigator={props.yearNavigator}
        //                 monthNavigatorTemplate={monthNavigatorTemplate}
        //                 yearNavigatorTemplate={yearNavigatorTemplate}
        //                 minDate={props.minDate}
        //                 maxDate={props.maxDate}
        //                 yearRange={props.yearRange ? props.yearRange : "2000:2040"}
        //             />
        //             {
        //                 props.label && <label htmlFor={props.id ? props.id : id}>{props.label}</label>
        //             }
        //
        //         </>
        //     }
        // </span>
        <>
            {(props.disabled && !props.label) ?
                <>
                    <span className={`p-col p-text-center p-inputnumber p-component ${(props.value || isFocus ? 'p-inputwrapper-filled' : '')}`} id={props.id ? props.id : id}>
                        <div style={{ fontWeight: 'bold' }}>{props.label}</div>
                        {props.value
                            ?
                            <div className="p-text-normal">
                                {(props.showTime ? CommonFunction.formatDate(props.value, 'DD/MM/YYYY HH:mm')
                                    : CommonFunction.formatDate(props.value, 'DD/MM/YYYY'))}
                            </div>
                            :
                            <div className="p-text-light">
                                {(props.showTime ? '__/__/____ _:_'
                                    : '__/__/____')}

                            </div>
                        }
                    </span>
                </>
                :
                <span className={`${props.label && "p-float-label"} ${props.labelClass && props.labelClass} ${props.disabled ? "calendar-disabled" : ""}`}>
                    <span className={`p-inputnumber p-component ${(props.value || isFocus ? 'p-inputwrapper-filled' : '')}`}
                        id={props.id ? props.id : id}>
                            <DatePicker
                                selected={props.value ? new Date(props.value) : null}
                                onChange={(value) => props.onChange({ target: { value }, value })}
                                onBlur={(e) => onBlur(e)}
                                disabled={props.disabled}
                                onFocus={onFocus}
                                // locale={CommonFunction.getCurrentLanguage()[0]}
                                className={`p-inputtext p-component  ${props.className}`}
                                // calendarClassName="flex"
                                // showTimeSelect={props.showTime}
                                placeholderText={props.placeholderText}
                                showTimeInput={props.showTime}
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                showPopperArrow={false}
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="time"
                                fixedHeight
                                dateFormat={props.showTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
                            />
                    </span>
                    {props.label && <label htmlFor={props.id ? props.id : id} className={props.require ? "require" : null}>{props.label}</label>}
                </span>
            }
        </>
    )
}

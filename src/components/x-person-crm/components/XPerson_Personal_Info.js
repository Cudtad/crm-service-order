import CommonFunction from '@lib/common';
import classNames from "classnames";
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import XErrorPage from '@ui-lib/x-error-page/XErrorPage';
import { XLayout, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import _ from "lodash";
import { Button } from "primereact/button";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Checkbox } from 'primereact/checkbox'

/**
 * props
 *      application: "hcm-service", // application
 *      dictionary: { fullName, }, // use dialog or not, default true
 *      config: {style: {}, className: "", onChange: () => {}}
 *      person: {} // current edit person
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XPerson_Personal_Info(props, ref) {
    const { application, dictionary, person, config } = props
    const t = CommonFunction.t;

    useEffect(() => {

    }, []);

    const submit = () => {
        config.onSubmit("personal_info", person)
    }

    const onActive = () => {
        config.onActive("personal_info", person)
    }

    const onDelete = () => {
        config.onDelete("personal_info", person)
    }

    const onPermission = (e) => {
        config.onPermission("personal_info", person, e.checked)
    }

    if (person) {
        try {
            let style = config && config.style ? config.style : {};
            let className = config && config.className ? config.className : "";
            return (
                <XLayout>
                    <XLayout_Top className="pt-1 px-3">
                        <XToolbar
                            left={() => (
                                <>
                                    <Button
                                        icon="bx bxs-save"
                                        label={t('common.save')}
                                        onClick={submit}
                                        disabled={
                                            !config.permission.update
                                        }
                                    ></Button>
                                    {config.onActive
                                        ? config.isActive
                                            ? <Button
                                                icon="bx bx-lock-open-alt text-green"
                                                label={t('common.close')}
                                                onClick={onActive}
                                                disabled={
                                                    !config.permission.update
                                                }
                                            ></Button>
                                            : <Button
                                                icon="bx bx-lock-alt text-red"
                                                label={t("button.open")}
                                                onClick={onActive}
                                                disabled={
                                                    !config.permission.update
                                                }
                                            ></Button>
                                        : null
                                    }
                                    {config.onDelete
                                        ? <Button
                                            icon="bx bx-trash text-red"
                                            label={t('common.delete')}
                                            onClick={onDelete}
                                            disabled={
                                                !config.permission.delete
                                            }
                                        ></Button>
                                        : null
                                    }
                                    {config.permissionAdmin?.view
                                        ?
                                        <div className="field-checkbox mb-0 ml-2">
                                            <Checkbox
                                                inputId="permission_box"
                                                checked={config.isAdmin == 1}
                                                onChange={onPermission}
                                                disabled={!config.permissionAdmin.update}
                                            />
                                            <label htmlFor="permission_box" className='p-button pointer-events-none'>{t('crm.employee.permission')}</label>
                                        </div>
                                        : null
                                    }

                                </>
                            )}
                        ></XToolbar>
                    </XLayout_Top>
                    <XLayout_Center className="p-0 px-3">
                        <div className={`grid formgrid p-fluid fluid  mt-2 ${className}`} style={style}>
                            {props.children}
                        </div>
                    </XLayout_Center>
                </XLayout>
            );
        } catch (error) {
            return <XErrorPage error={error}></XErrorPage>;
        }
    } else {
        return <></>;
    }
}

XPerson_Personal_Info = forwardRef(XPerson_Personal_Info);

export default XPerson_Personal_Info;

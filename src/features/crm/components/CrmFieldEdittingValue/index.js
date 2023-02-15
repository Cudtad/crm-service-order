import { Button } from 'primereact/button';
import React from 'react';
import "./styles.scss";
import CommonFunction from "@lib/common";

export default function CrmFieldEdittingValue(props) {

    const { label, children, require, onAdd, className } = props;
    const t = CommonFunction.t;

    return (
        <div className={`flex py-1 h-full mx-2 ${className}`}>
            <div className="field-preview-label pt-2">
                <div className={`field-preview-label-text`} >
                    <div className={`${require ? `field-require` : ``} text-sm`}>
                        {label}
                    </div>
                </div>
            </div>
            <div className="pt-2 flex-1 overflow-hidden field-content">
                {children}
            </div>
            {onAdd
                ? <div className='w-auto flex align-items-start ml-1 pt-2'>
                    <Button
                        icon="bx bx-plus"
                        tooltip={t("button.add")}
                        tooltipOptions={{ position: "top" }}
                        onClick={onAdd}
                        className="btn-add-field p-button-outlined"
                    />
                </div>
                : null
            }
        </div>
    );
}



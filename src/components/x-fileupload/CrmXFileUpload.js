import CommonFunction from '@lib/common';
import { FileUpload } from 'primereact/fileupload';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import './scss/XFileUpload.scss';

/**
 * props:
 *      type: one of "button", "in-field"
 * @param {*} props
 * @returns
 */
function CrmXFileUpload(props, ref) {
    const { type, className } = props;
    const refFileUpload = useRef();
    const refComponentId = useRef(`fileupload_${CommonFunction.getIdNumber()}`)

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        click: () => {
            try {
                document.querySelector(`#${refComponentId.current} input`).click()
            } catch (error) {
                console.error("XFileUpload click", error)
            }
        }
    }))
    switch (type) {
        case "button":
        case "in-field":
        default:
            return <FileUpload
                ref={refFileUpload}
                id={refComponentId.current}
                {...props}
                headerTemplate={(options) => (<>{options.chooseButton}</>)}
                itemTemplate={() => (<></>)}
                customUpload={true}
                className={`x-file-upload x-file-upload-button-crm ${type === "in-field" ? "in-field" : ""} ${className || ""}`}
            ></FileUpload>
            break;
    }
}

CrmXFileUpload = forwardRef(CrmXFileUpload);

export default CrmXFileUpload;

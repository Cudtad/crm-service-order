import React from 'react';
import "./styles.scss";
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';

export default function CrmPanel(props) {
    const { title, children, collapsed, className, clear } = props

    const template = (options) => {
        const toggleIcon = options.collapsed ? 'bx bx-chevron-down text-xl' : 'bx bx-chevron-up text-xl';
        const className = `${options.className} justify-content-start cursor-pointer p-0`;
        const titleClassName = `${options.titleClassName} text-base`;

        return (
            <div className='flex'>
                <Button
                    label={title}
                    icon={toggleIcon}
                    className={`p-button-sm text-left p-button-primary line-height-3 flex-1 ${clear ? `border-noround-right` : ``}`}
                    onClick={options.onTogglerClick}
                />
                {clear
                    ?
                    <Button
                        icon='bx bx-x text-xl'
                        className="p-button-sm w-auto border-noround-left crm-panel-button-clear"
                        onClick={clear}
                    />
                    : null
                }
            </div>
        )
    }

    return (
        <Panel
            headerTemplate={template}
            toggleable
            className={`crm-panel ${className ? className : ``}`}
            collapsed={collapsed}
        >
            {children}
        </Panel>
    );
}



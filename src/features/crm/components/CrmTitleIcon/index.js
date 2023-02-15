import React from 'react';
import CommonFunction from '@lib/common';
import _ from "lodash";
import "./styles.scss"
import CrmSmallIconBackground from '../CrmSmallIconBackground';
import { SplitButton } from 'primereact/splitbutton';

export default function CrmTitleIcon(props) {
    const t = CommonFunction.t;
    const { className, icon, title, iconSize, iconBgColor, iconColor, items } = props

    return <div className={`flex align-items-center justify-content-between p-3 card-header-nav ${className ? className : ``}`}>
        <div className={`flex align-items-center`}>
            <CrmSmallIconBackground
                icon={icon}
                size={iconSize}
                bgColor={iconBgColor}
                color={iconColor}
            />
            <div className='ml-3 text-xl font-semibold'>{title}</div>
        </div>
        <div className={``}>
            {items.length
                ? <SplitButton
                    dropdownIcon="bx bxs-down-arrow text-xs"
                    className="p-button-info"
                    buttonClassName="hidden"
                    menuClassName="crm-splitbutton-menu"
                    menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 menu-dropdown-button "
                    model={items}
                />
                : null
            }
        </div>

    </div>
}

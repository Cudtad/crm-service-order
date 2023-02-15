import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import React, { useContext, useEffect, useState } from 'react';
import "./styles.scss"
import ProjectDetail_Working_Holiday from "../../components/CrmLocationCalendarComponents/ProjectDetail_Working_Holiday";
import ProjectDetail_Calendar_Working from "../../components/CrmLocationCalendarComponents/ProjectDetail_Calendar_Working";
import Error403 from '../../../../components/error-pages/403';
import CommonFunction from '@lib/common';
import { getPermistion } from '../../utils';

export default function CrmLocationCalendar(props) {
	const t = CommonFunction.t;
	const menuCode = "crm-service-service_setting_schedule";
	const [permission, setPermission] = useState(null);
	const [selectedMenu, setSelectedMenu] = useState("calendar-working");
	const menu = [
		{
			key: "calendar-working",
			label: t("crm-service.setting.working-template"),
			icon: "bx bx-calendar-week",
		},
		{
			key: "working-holiday",
			label: t("crm-service.setting.working.project.date"),
			icon: "bx bx-time",
		}
	]
	useEffect(() => {
		setPermission(getPermistion(window.app_context.user, menuCode))
	}, [])

	return (<>
		<XLayout className="p-2 project-application">
                <XLayout_Center>
                    {!permission?.admin &&
                        <Error403 backUrl='#/crm-service' />
                    }
                    {permission?.admin &&
                        <div className="flex flex-column project-pages-container overflow-hidden position-relative">
                            <div className="flex w-full h-full bg-white border-all">
                                <div className="flex flex-column w-full border-right p-2 p-m" style={{ flex: "0 0 250px" }}>
                                    {menu.map((m, index) => (
                                        <div key={index} className={"left-menu-navigation border-all" + (selectedMenu === m.key ? " left-menu-navigation-selected" : "")}
                                            onClick={() => {
                                                setSelectedMenu(m.key)
                                            }}>
                                            <i className={m.icon}></i>
                                            <span>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex w-full">
                                    
                                    {selectedMenu && selectedMenu === "calendar-working" &&
                                        <ProjectDetail_Calendar_Working permission={permission}/>
                                    }
                                    {selectedMenu && selectedMenu === "working-holiday" &&
                                        <ProjectDetail_Working_Holiday type="CRM-SERVICE-SERVICE" permission={permission}/>
                                    }
                                    
                                </div>
                            </div>
                        </div>
                    }
                </XLayout_Center>
            </XLayout>
	</>);
}

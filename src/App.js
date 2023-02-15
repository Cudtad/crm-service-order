import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, HashRouter as Router } from 'react-router-dom';
import { Routes as AppRoutes } from './routes/routes';
import { XLayout, XLayout_Center } from "@ui-lib/x-layout/XLayout";
// import { XVerticalMenu } from '@ngdox/ui-lib/dist/components/x-vertical-menu/XVerticalMenu';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import CommonFunction from "@lib/common";
import XMainMenu from '@ui-lib/x-main-menu/XMainMenu';
import { CrmApplicationConfigApi } from "./services/CrmApplicationConfig";
import { CrmEmployeeApi } from "services/CrmEmployeeService"
import "./scss/_main.scss";
import { ConfirmDialog } from "primereact/confirmdialog";

export default (props) => {
    const { user } = props;
    const t = CommonFunction.t;
    const [menu] = useState((() => {
        let _menu = [];
        // prepare menu
        if (user.menu && user.menu["crm-service-order"] && user.menu["crm-service-order"].length > 0 && user.menu["crm-service-order"][0].children) {
            _menu = [...user.menu["crm-service-order"][0].children];
        }
        return _menu;
    })());

    const [initLoad, setInitLoad] = useState(false)

    useEffect(() => {
        CrmApplicationConfigApi.getMainConfig().then(res => {
            if (res && res?.config?.mainCompanyId) {
                window.app_context.user.mainCompanyId = res?.config?.mainCompanyId
                window.app_context.user.defaultRoleId = res?.config?.defaultRoleId
                window.app_context.user.portalSourceId = res?.config?.portalSourceId
            }
            CrmEmployeeApi.getByEmployeeId().then((res) => {
                if (res && res?.id) {
                    localStorage.setItem("employeeId", res.id);
                } else {
                    localStorage.removeItem("employeeId");
                }
    
                if (res && res?.allowEmployeeIds) {
                    localStorage.setItem(
                        "allowEmployeeIds",
                        res.allowEmployeeIds.join()
                    );
                } else {
                    localStorage.removeItem("allowEmployeeIds");
                }
    
                if (res && res?.isAdmin) {
                    localStorage.setItem("isAdmin", res.isAdmin);
                } else {
                    localStorage.removeItem("isAdmin");
                }
                setInitLoad(true)
            })
            
        })
    }, [])

    return (
        <Router>
            <XLayout>
                <ConfirmDialog/>
                <XMainMenu menu={menu} t={t}></XMainMenu>
                <XLayout_Center>
                    <Suspense fallback={<LoadingBar loading={true}></LoadingBar>}>
                        {initLoad
                            ?
                            <Routes>
                                {AppRoutes(props).map((r, index) => (
                                    <Route key={index} path={r.path} exact element={r.component} />
                                ))}
                            </Routes>
                            : null
                        }
                    </Suspense>
                </XLayout_Center>
            </XLayout>
        </Router>
    )
}


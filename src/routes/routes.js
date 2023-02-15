import React, { lazy } from "react";

const HomePage = lazy(() => import("../features/home-page/HomePage"));
const TicketDashboard = lazy(() => import("../features/crm/pages/TicketDashboard"));
const TicketList = lazy(() => import("../features/crm/pages/TicketList"));
const SystemRolePermission = lazy(() => import("../features/system/pages/SystemRolePermission"));
const GroupControl = lazy(() => import("../features/crm/pages/GroupControl"));
const TicketCategory = lazy(() => import("../features/crm/pages/TicketCategory"));
const TicketResource = lazy(() => import("../features/crm/pages/TicketResource"));
const TicketSettingsCustomField = lazy(() => import("../features/crm/pages/TicketSettingsCustomField"));
const TicketSettingsRuleAction = lazy(() => import("../features/crm/pages/TicketSettingsRuleAction"));
const TicketSettingsNotice = lazy(() => import("../features/crm/pages/TicketSettingsNotice"));
const TicketSettingsState = lazy(() => import("../features/crm/pages/TicketSettingsState"));
const SystemGroupUserRole = lazy(() => import("../features/system/pages/SystemGroupUserRole"));
const ActionSystem = lazy(() => import("../features/system/pages/Action"));
const Resource = lazy(() => import("../features/system/pages/Resource"));
const ApiResourceAction = lazy(() => import("../features/super-admin/pages/ApiResourceAction"));
const PriorityMatrix = lazy(() => import("../features/crm/pages/PriorityMatrix"));
const UserAdmin = lazy(() => import("../features/crm/pages/UserAdmin"));
const CrmLocationCalendar = lazy(() => import("../features/crm/pages/CrmLocationCalendar"));
const CrmMdEmployee = lazy(() => import("../features/crm/pages/CrmMdEmployee"));

const CrmServiceServiceOrderCost = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderCost"));
const CrmServiceServiceOder = lazy(() => import("../features/crm/pages/CrmServiceServiceOrder"));
const CrmServiceServiceOderInfor = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderInfor"));
const CrmServiceServiceOrderMaterial = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderMaterial"));
const CrmServiceServiceOrderHuman = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderHuman"));
const CrmServiceServiceOrderConfirmation = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderConfirmation"));

const CrmServiceServiceOrderActivate = lazy(() => import("../features/crm/pages/CrmServiceServiceOrderActivate"));

const Routes = (props) => [
    { path: "/crm-service", component: <HomePage {...props} /> },

    { path: "/crm-service/list", component: <TicketList {...props} /> },
    { path: "/crm-service/ticket/category", component: <TicketCategory {...props} /> },
    { path: "/crm-service/ticket/resource", component: <TicketResource {...props} /> },
    { path: "/crm-service/group", component: <GroupControl {...props} /> },
    { path: "/crm-service/settings/custom-field", component: <TicketSettingsCustomField {...props} /> },
    { path: "/crm-service/settings/rule", component: <TicketSettingsRuleAction {...props} /> },
    { path: "/crm-service/settings/notice", component: <TicketSettingsNotice {...props} /> },
    { path: "/crm-service/settings/state", component: <TicketSettingsState {...props} /> },
    { path: "/crm-service/user-role-group", component: <SystemGroupUserRole {...props} /> },
    { path: "/crm-service/roles", component: <SystemRolePermission {...props} /> },
    { path: "/crm-service/api-resource-action", component: <ApiResourceAction {...props} /> },
    { path: "/crm-service/action", component: <ActionSystem {...props} /> },
    { path: "/crm-service/resource", component: <Resource {...props} /> },
    { path: "/crm-service/priority-matrix", component: <PriorityMatrix {...props} /> },
    { path: "/crm-service/user-admin", component: <UserAdmin {...props} /> },
    { path: "/crm-service/schedule", component: <CrmLocationCalendar {...props} /> },
    { path: "/crm-service/employee", component: <CrmMdEmployee {...props} /> },

    { path: "crm-service-order/service-order", component: <CrmServiceServiceOder {...props} /> },
    { path: "crm-service-order/service-order/infor/:p", component: <CrmServiceServiceOderInfor {...props} /> },
    { path: "crm-service-order/service-order/costs/:p", component: <CrmServiceServiceOrderCost {...props} /> },
    { path: "crm-service-order/service-order/material/:p", component: <CrmServiceServiceOrderMaterial {...props} /> },
    { path: "crm-service-order/service-order/human/:p", component: <CrmServiceServiceOrderHuman {...props} /> },
    { path: "crm-service-order/service-order/customer-confirmation/:p", component: <CrmServiceServiceOrderConfirmation {...props} /> },
    { path: "crm-service-order/service-order/activate/:p", component: <CrmServiceServiceOrderActivate {...props} /> },
    
]

export { Routes };

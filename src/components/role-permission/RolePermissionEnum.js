import CommonFunction from '@lib/common';

const RolePermissionEnum = {
    applicationConfig: [
        {
            code: 'system',
            name: CommonFunction.t("application.system"),
            application: "system",
            menu: "menu"
        },
        {
            code: 'work-group',
            name: CommonFunction.t("application.work-group"),
            application: "work-group",
            menu: "menu,sub-menu"
        },
        {
            code: 'project',
            name: CommonFunction.t("application.project"),
            application: "project-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'ticket',
            name: CommonFunction.t("application.ticket"),
            application: "ticket-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'administrative',
            name: CommonFunction.t("application.administrative"),
            application: "administrative-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'hcm',
            name: CommonFunction.t("application.hcm"),
            application: "hcm-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'erp',
            name: CommonFunction.t("application.erp"),
            application: "erp",
            menu: "menu,sub-menu"
        },
        {
            code: 'bsc',
            name: CommonFunction.t("application.bsc"),
            application: "bsc-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'eoffice-service',
            name: CommonFunction.t("application.eoffice-service"),
            application: "eoffice-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'crm-service',
            name: CommonFunction.t("application.crm-service"),
            application: "crm-service",
            menu: "menu,sub-menu"
        },
        {
            code: 'crm-service-service',
            name: CommonFunction.t("application.crm-service-service"),
            application: "crm-service-service",
            menu: "menu,sub-menu"
        }
    ],
    dataScope: [
        { code: "owner", name: CommonFunction.t("group-user-role.data-scope.owner") },
        { code: "recursive", name: CommonFunction.t("group-user-role.data-scope.recursive") },
        { code: "direct", name: CommonFunction.t("group-user-role.data-scope.direct") },
        { code: "direct_recursive", name: CommonFunction.t("group-user-role.data-scope.direct_recursive") },
    ]
}

export default RolePermissionEnum;

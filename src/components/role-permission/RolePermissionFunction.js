import GroupApi from "services/GroupService";
import CustomerApi from "services/erp/CustomerService";

const RolePermissionFunction = {

    /**
     * load group for role permission by application
     * @param {*} application
     * @returns
     */
    loadGroups: (application, refType, refId, refObject) => {
        switch (application) {
            case "project-service":
                return GroupApi.get({
                    type: "project,phase",
                    rootGroupId: refObject && refObject.groupId ? refObject.groupId : -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
                break;
            case "work-group":
                return GroupApi.get({
                    type: "org,work-group",
                    rootGroupId: refObject && refObject.groupId ? refObject.groupId : -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
            case "system":
                return GroupApi.get({
                    type: "org",
                    rootGroupId: -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
                break;
            case "bsc-service":
                return GroupApi.get({
                    type: "org",
                    rootGroupId: -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
                break;
            case "hcm-service":
                return GroupApi.get({
                    type: "org",
                    rootGroupId: -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
                break;
            case "ticket-service":
                return CustomerApi.search({ page: 0, size: 999 });
                break;
            case "crm-service-service":
                return GroupApi.get({
                    type: "crm.org",
                    rootGroupId: -1,
                    status: 1,
                    page: 0,
                    rows: 999
                });
                break;
            default:
                return null;
                break;
        }
    }
}

export default RolePermissionFunction;

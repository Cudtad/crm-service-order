import React, { useEffect, useRef, useState } from 'react';

import RolePermission from 'components/role-permission/RolePermission';

export default function SystemRolePermission(props) {
    return (<>
        <RolePermission
            applications={["system", "work-group", "project-service", "ticket-service", "hcm-service", "bsc-service","booking-service", "erp", "eoffice-service",
            "crm-service", "crm-service-service"]}
        ></RolePermission>
    </>);
}

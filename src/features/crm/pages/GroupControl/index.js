import React, { useEffect, useRef, useState } from 'react';
import GroupControlPermission from '../../../../components/group-control/GroupControlPermission';

export default function SystemRolePermission(props) {
    return (<>
        <GroupControlPermission
            applications={["crm-service-service"]}
            refType="crm-product"
        ></GroupControlPermission>
    </>);
}

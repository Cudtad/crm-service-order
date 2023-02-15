import CommonFunction from '@lib/common';
import GroupUserRole from 'components/role-permission/GroupUserRole';
import React, { useEffect, useRef, useState } from 'react';


export default function SystemUserRoleGroup(props) {
    const t = CommonFunction.t;

    return (
        <GroupUserRole
            application="system"
            groupType="crm.org"
            groupTypeName={t("group.group-type.org")}
        ></GroupUserRole>
    )
}

import CommonFunction from '@lib/common';
                    import React from 'react';

import XHorizontalMenu from 'components/x-horizontal-menu/XHorizontalMenu';

export default function TicketDictionaryMenu(props) {
    const t = CommonFunction.t;
    const { selected } = props;

    return (
        <XHorizontalMenu
            menu={[
                { label: t("ticket.category"), code: "ticket.category", to: "#/crm-service/ticket/category" },
                // { label: t("ticket.location"), code: "ticket.location", to: "#/ticket/location" },
                // { label: t("ticket.sla"), code: "ticket.sla", to: "#/ticket/sla" },
                { label: t("ticket.resource"), code: "ticket.resource", to: "#/crm-service/ticket/resource" }
            ]}
            selected={selected || "ticket.category"}
        ></XHorizontalMenu>
    );
}



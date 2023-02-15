import CommonFunction from '@lib/common';
                    import React from 'react';

import XHorizontalMenu from 'components/x-horizontal-menu/XHorizontalMenu';

export default function TicketSettingsMenu(props) {
    const t = CommonFunction.t;
    const { selected } = props;

    return (
        <XHorizontalMenu
            menu={[
                { label: t("ticket.settings.custom-field"), code: "ticket.settings.custom-field", to: "#/crm-service/settings/custom-field" },
                { label: t("ticket.settings.rule"), code: "ticket.settings.rule", to: "#/crm-service/settings/rule" },
                { label: t("ticket.settings.notice"), code: "ticket.settings.notice", to: "#/crm-service/settings/notice" },
                { label: t("ticket.settings.state"), code: "ticket.settings.state", to: "#/crm-service/settings/state" }
            ]}
            selected={selected || "ticket.category"}
        ></XHorizontalMenu>
    );
}



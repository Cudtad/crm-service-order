import CommonFunction from '@lib/common';
                    import React from 'react';

import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import TicketEnumeration from '../../ticket-common/TicketEnumeration';
import CustomFieldSettings from '../../../../components/custom-field/CustomFieldSettings';
import TicketSettingsMenu from '../../components/TicketSettingsMenu';

export default function TicketSettingsCustomField() {
    const t = CommonFunction.t;

    return (<>
        <XLayout className="pt-1 pl-2 pb-2 pr-2">
            <XLayout_Top>
                <TicketSettingsMenu selected="ticket.settings.custom-field"></TicketSettingsMenu>
            </XLayout_Top>
            <XLayout_Center>
                <CustomFieldSettings
                    application="crm-service-service"
                    entity="ticket"
                    customFieldListWidth="500px"
                    entityTypes={[{
                        code: TicketEnumeration.type.ticket,
                        name: TicketEnumeration.ui.ticket.name,
                        icon: `${TicketEnumeration.ui.ticket.icon} fs-20 ml-1`
                    }, {
                        code: TicketEnumeration.type.change,
                        name: TicketEnumeration.ui.change.name,
                        icon: `${TicketEnumeration.ui.change.icon} fs-20 ml-1`
                    }, {
                        code: TicketEnumeration.type.problem,
                        name: TicketEnumeration.ui.problem.name,
                        icon: `${TicketEnumeration.ui.problem.icon} fs-20 ml-1`
                    }]}
                ></CustomFieldSettings>
            </XLayout_Center>
        </XLayout>
    </>);
}

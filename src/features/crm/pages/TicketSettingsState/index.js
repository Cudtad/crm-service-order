import CommonFunction from '@lib/common';
                    import React, {useEffect, useState} from 'react';

import {XLayout, XLayout_Center, XLayout_Top} from '@ui-lib/x-layout/XLayout';
import TicketSettingsMenu from '../../components/TicketSettingsMenu';
import TicketEnumeration from '../../ticket-common/TicketEnumeration';
import NoticeConfigApi from "services/config/NoticeConfigApi";
// import "../scss/TicketSettingsNotice.scss"
import StateMatrix from "components/state/StateMatrix";
import ProjectApi from "services/ProjectService";
import {TabPanel, TabView} from "primereact/tabview";

export default function TicketSettingsState() {
    const t = CommonFunction.t;

    const application = "crm-service-service";
    const entity = "ticket"
    const entityTypes = [{
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
    }];
    const [notices, setNotices] = useState([]);
    const [projectId, setProjectId] = useState(0);
    const [projects, setProjects] = useState([]);

    const defaultErrors = {
        title: "",
        locale: "",
        action: "",
        channel: "",
        content: "",
    }
    const [errors, setErrors] = useState(defaultErrors);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProjects();
        loadStateConfig(entityTypes && entityTypes.length > 0 ? entityTypes[0].code : "");
    }, []);

    const loadStateConfig = (type) => {
        setLoading(true);

        NoticeConfigApi.getByEntityType(application, `${entity}.${type}`).then(data => {
            if (data) {
                setNotices(data);
                setLoading(false);
            }
        })
    }

    /**
     * load requests created by user
     */
    const loadProjects = () => {
        setLoading(true);
        let _lazy = {
            first: 0,
            rows: 999,
            page: 0
        };
        ProjectApi.get(_lazy).then(res => {
            if (res && res.content && res.content.length > 0) {
                setProjects(res.content);
            } else {
                setProjects([])
            }
            setLoading(false);
        })
    }
    useEffect(() => {
        // console.log('error', errors)
    }, [errors])

    const checkPermission = (action) => {
        return true;
    }

    return (<>
        <XLayout className="pt-1 pl-2 pb-2 pr-2">
            <XLayout_Top>
                <TicketSettingsMenu selected="ticket.settings.state"></TicketSettingsMenu>
            </XLayout_Top>
            <XLayout_Center>
                <TabView>
                    <TabPanel header={t('ticket.ticket')}>
                        <StateMatrix
                            checkPermission={checkPermission}
                            application="crm-service-service"
                            codes={['ticket.TICKET']}
                            customFieldListWidth="600px"
                            name={`ticket.TICKET`}
                            stateTemplateMenu={[
                                {code: 'INIT', name: t("ticket.state.ticket.INIT"), score: 7, color: "#f51515"},
                                {code: 'RESPONSE', name: t("ticket.state.ticket.RESPONSE"), score: 7, color: "#f51515"},
                                {code: 'IN_PROGRESS', name: t("ticket.state.ticket.IN_PROGRESS"), score: 5, color: "#f8ff76"},
                                {code: 'PENDING', name: t("ticket.state.ticket.PENDING"), score: 4, color: "#ffd15e"},
                                {code: 'CANCELED', name: t("ticket.state.ticket.CANCELED"), score: 3, color: "#ffd15e"},
                                {code: 'SOLVED', name: t("ticket.state.ticket.SOLVED"), score: 2, color: "#ffd15e"},
                                {code: 'COMPLETED', name: t("ticket.state.ticket.COMPLETED"), score: 1, color: "#ffd15e"},
                                {code: 'EVALUTION', name: t("ticket.state.ticket.EVALUTION"), score: 6, color: "#ea821a"},
                                {code: 'ACCEPTED', name: t("ticket.state.ticket.ACCEPTED"), score: 6, color: "#ea821a"},
                                {code: 'REPROCESS', name: t("ticket.state.ticket.REPROCESS"), score: 1, color: "#ffd15e"},
                                {code: 'REOPEN', name: t("ticket.state.ticket.REOPEN"), score: 7, color: "#ea821a"},
                                {code: 'CLOSED', name: t("ticket.state.ticket.CLOSED"), score: 3, color: "#ffd15e"},
                            ]}
                        ></StateMatrix>
                    </TabPanel>
                    <TabPanel header={t('change.state')}>
                        <StateMatrix
                            checkPermission={checkPermission}
                            application="crm-service-service"
                            codes={['ticket.CHANGE']}
                            customFieldListWidth="600px"
                            name={`ticket.CHANGE`}
                            stateTemplateMenu={[
                                {code: 'INIT', name: t("ticket.state.ticket.INIT"), score: 7, color: "#f51515"},
                                {code: 'ACCEPTED', name: t("ticket.state.ticket.ACCEPTED"), score: 6, color: "#ea821a"},
                                {code: 'EVALUTION', name: t("ticket.state.ticket.EVALUTION"), score: 6, color: "#ea821a"},
                                {code: 'PENDING', name: t("ticket.state.ticket.PENDING"), score: 4, color: "#ffd15e"},
                                {code: 'IN_PROGRESS', name: t("ticket.state.ticket.IN_PROGRESS"), score: 5, color: "#f8ff76"},
                                {code: 'COMPLETED', name: t("ticket.state.ticket.COMPLETED"), score: 1, color: "#ffd15e"},
                                {code: 'SOLVED', name: t("ticket.state.ticket.SOLVED"), score: 2, color: "#ffd15e"},
                                {code: 'RESPONSE', name: t("ticket.state.ticket.RESPONSE"), score: 7, color: "#f51515"},
                                {code: 'REOPEN', name: t("ticket.state.ticket.REOPEN"), score: 7, color: "#f51515"},
                                {code: 'CANCELED', name: t("ticket.state.ticket.CANCELED"), score: 3, color: "#ffd15e"},
                                {code: 'CLOSED', name: t("ticket.state.ticket.CLOSED"), score: 3, color: "#ffd15e"},
                            ]}
                        ></StateMatrix>
                    </TabPanel>
                    <TabPanel header={t('problem.state')}>
                        <StateMatrix
                            checkPermission={checkPermission}
                            application="crm-service-service"
                            codes={['ticket.PROBLEM']}
                            customFieldListWidth="600px"
                            name={`ticket.PROBLEM`}
                            stateTemplateMenu={[
                                {code: 'INIT', name: t("ticket.state.ticket.INIT"), score: 7, color: "#f51515"},
                                {code: 'ACCEPTED', name: t("ticket.state.ticket.ACCEPTED"), score: 6, color: "#ea821a"},
                                {code: 'EVALUTION', name: t("ticket.state.ticket.EVALUTION"), score: 6, color: "#ea821a"},
                                {code: 'PENDING', name: t("ticket.state.ticket.PENDING"), score: 4, color: "#ffd15e"},
                                {code: 'IN_PROGRESS', name: t("ticket.state.ticket.IN_PROGRESS"), score: 5, color: "#f8ff76"},
                                // {code: 'RESPONSE', name: t("ticket.state.ticket.RESPONSE"), score: 7, color: "#f51515"},
                                {code: 'SOLVED', name: t("ticket.state.ticket.SOLVED"), score: 2, color: "#ffd15e"},
                                {code: 'REOPEN', name: t("ticket.state.ticket.REOPEN"), score: 7, color: "#ea821a"},
                                {code: 'COMPLETED', name: t("ticket.state.ticket.COMPLETED"), score: 1, color: "#ffd15e"},
                                {code: 'CANCELED', name: t("ticket.state.ticket.CANCELED"), score: 3, color: "#ffd15e"},
                                {code: 'CLOSED', name: t("ticket.state.ticket.CLOSED"), score: 3, color: "#ffd15e"},
                            ]}
                        ></StateMatrix>
                    </TabPanel>
                    <TabPanel header={t('task.matrix')}>
                        <StateMatrix
                            checkPermission={checkPermission}
                            application="crm-service-service"
                            codes={['ticket.TASK']}
                            customFieldListWidth="600px"
                            name={`ticket.TASK`}
                            stateTemplateMenu={[
                                {code: 'INIT', name: t("ticket.state.ticket.INIT"), score: 7, color: "#f51515"},
                                {code: 'RESPONSE', name: t("ticket.state.ticket.RESPONSE"), score: 7, color: "#f51515"},
                                {code: 'IN_PROGRESS', name: t("ticket.state.ticket.IN_PROGRESS"), score: 5, color: "#f8ff76"},
                                {code: 'PENDING', name: t("ticket.state.ticket.PENDING"), score: 4, color: "#ffd15e"},
                                {code: 'CANCELED', name: t("ticket.state.ticket.CANCELED"), score: 3, color: "#ffd15e"},
                                {code: 'SOLVED', name: t("ticket.state.ticket.SOLVED"), score: 2, color: "#ffd15e"},
                                {code: 'COMPLETED', name: t("ticket.state.ticket.COMPLETED"), score: 1, color: "#ffd15e"},
                                {code: 'EVALUTION', name: t("ticket.state.ticket.EVALUTION"), score: 6, color: "#ea821a"},
                                {code: 'ACCEPTED', name: t("ticket.state.ticket.ACCEPTED"), score: 6, color: "#ea821a"},

                                {code: 'REVIEWING', name: t("ticket.state.ticket.REVIEWING"), score: 6, color: "#c94831"},
                                {code: 'DEFERRED', name: t("ticket.state.ticket.DEFERRED"), score: 2, color: "#ffd15e"},
                                {code: 'REOPEN', name: t("ticket.state.ticket.REOPEN"), score: 1, color: "#ffd15e"},
                                {code: 'REPROCESS', name: t("ticket.state.ticket.REPROCESS"), score: 1, color: "#ffd15e"},
                                {code: 'CLOSED', name: t("ticket.state.ticket.CLOSED"), score: 3, color: "#ffd15e"},
                            ]}
                        ></StateMatrix>
                    </TabPanel>
                </TabView>
            </XLayout_Center>
        </XLayout>
    </>);
}

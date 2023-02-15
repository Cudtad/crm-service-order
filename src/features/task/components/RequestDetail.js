import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Bpmn from 'components/bpmn/Bpmn';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import CommonFunction from '@lib/common';

import _ from 'lodash';
import RequestApi from 'services/RequestApi';
import { Base64 } from 'js-base64';
import { TabPanel, TabView } from 'primereact/tabview';
import History from 'components/history/History';
import HistoryTask from "../../../components/history/HistoryTask";
import { XLayout, XLayout_Center } from '@ui-lib/x-layout/XLayout';

function RequestDetail(props, ref) {
    const t = CommonFunction.t;
    const defaultRequest = {
        name: "..."
    }

    const defaultHistory = {
        data: [],
        more: false,
        page: 0,
        size: 10,
        total: 0
    }

    const [show, setShow] = useState(false);
    const [request, setRequest] = useState(defaultRequest);
    const [history, setHistory] = useState(defaultHistory);
    const refBpmn = useRef(null);

    useImperativeHandle(ref, () => ({
        /**
         * reset password
         */
        init: (_request) => {
            setShow(true);

            RequestApi.get(_request.id).then(res => {
                if (res) {
                    setRequest(res);
                    if (res.workFlow && res.workFlow.xmlFile) {
                        CommonFunction.waitFor((_) => refBpmn.current).then(() => {

                            // build task to hightlight
                            let _task = [];
                            if (res.requestTasks) {

                                // order
                                _task = _.sortBy(res.requestTasks, [function (o) {
                                    return new Date(o.createDate);
                                }]);

                                // map task for bpmn
                                _task = res.requestTasks.map(m => ({ code: m.activity ? m.activity.bpmnCode : "", state: m.state }));

                            }

                            // if request finish, add end event tag
                            switch (res.state) {
                                case "DONE":
                                    _task.push({
                                        state: "COMPLETED",
                                        code: res.activityCode
                                    })
                                    break;
                                case "FAIL":
                                    _task.push({
                                        state: "CANCELED",
                                        code: res.activityCode
                                    })
                                    break;
                                default:
                                    break;
                            }

                            // show bpmn
                            refBpmn.current.applyData("view-process", Base64.decode(res.workFlow.xmlFile), _task);
                        });
                    }
                }
            });

            loadHistory(true, _request);
        },
    }))

    /**
     * load history
     * @param {*} firstPage
     */
    const loadHistory = async (firstPage, _request) => {
        let payload = { page: firstPage ? 0 : history.page + 1, size: defaultHistory.size };
        _request = _request ? _request : request;
        let res = await RequestApi.getHistory(_request.id, payload);
        if (res) {
            let _history = _.cloneDeep(history);
            if (firstPage) {
                _history.data = [];
            }
            _history.page = res.page;
            _history.total = res.total;
            _history.more = (res.page + 1) * res.pageSize < res.total; // more if it's not last page
            let mappedHistory = res.content.map(m => ({
                time: new Date(m.actionDate),
                user: m.actionUser,
                action: t(`request.history.action.${m.action}`),
                oldValue: m.oldValue,
                newValue: m.newValue
            }));
            _history.data = [..._history.data, ...mappedHistory];
            setHistory(_history);
        }
    }

    /**
     * hide window detail
     */
    const cancel = () => {
        setShow(false);
    }

    return (
        <Dialog
            header={request.name}
            visible={show}
            modal
            contentClassName="over"
            className="wd-1024-768 wd-requets-detail"
            // maximized={true}
            // footer={
            //     <>
            //         <Button label={t('common.close')} icon="bx bx-x" className="p-button-primary" onClick={cancel} />
            //     </>
            // }
            onHide={cancel}
        >
            <XLayout>
                <XLayout_Center className="pb-2">
                    <TabView renderActiveOnly={false}>
                        <TabPanel header={t("request.process")} leftIcon="bx bx-trip" contentClassName="w-full h-full position-relative">
                            <div className="request-detail-bpmn-legend flex align-items-center border-all">
                                <div className="bpmn-legend complete"></div>
                                <span className="small mr-1">{t("task.state.COMPLETED")}</span>
                                <div className="bpmn-legend cancel"></div>
                                <span className="small mr-1">{t("task.state.CANCELED")}</span>
                                <div className="bpmn-legend pending"></div>
                                <span className="small mr-1">{t("task.state.PENDING")}</span>
                                <div className="bpmn-legend in-progress"></div>
                                <span className="small">{t("task.state.IN_PROGRESS")}</span>
                            </div>
                            <Bpmn ref={refBpmn} />
                        </TabPanel>
                        <TabPanel header={t("button.history.task")} leftIcon="bx bx-history" contentClassName="w-full h-full">
                            <HistoryTask data={request.requestTasks} />
                        </TabPanel>
                        <TabPanel header={t("button.history")} leftIcon="bx bx-history" contentClassName="w-full h-full">
                            <History data={history.data} more={history.more} loadMore={loadHistory} />
                        </TabPanel>
                    </TabView>
                </XLayout_Center>
            </XLayout>

        </Dialog>

    );
};

RequestDetail = forwardRef(RequestDetail);

export default RequestDetail;

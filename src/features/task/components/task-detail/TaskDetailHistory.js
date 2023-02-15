import CommonFunction from '@lib/common';
                    import React, {useState} from "react";
import _ from "lodash";

import {Button} from "primereact/button";
import EmptyDataCompact from "@xdp/ui-lib/dist/components/empty-data/EmptyDataCompact";
import TaskService from "services/TaskService";
import History from 'components/history/History';


export const TaskDetailHistory = (props) => {
    const defaultHistory = {
        data: null,
        more: false,
        page: 0,
        size: 5,
        total: 0
    }

    const t = CommonFunction.t;
    const { taskId } = props;
    const [history, setHistory] = useState(defaultHistory);

    /**
     * load history
     * @param {*} firstPage
     */
    const loadHistory = async (firstPage) => {
        let payload = { page: firstPage ? 0 : history.page + 1, size: defaultHistory.size };
        TaskService.getHistory(taskId, payload).then(res => {

            let _history = _.cloneDeep(history);
            if (firstPage) {
                _history.data = [];
            }
            _history.page = res.page;
            _history.total = res.total;
            _history.more = (res.page + 1) * res.pageSize < res.total; // more if it's not last page

            // mapping histories
            let mappedHistory = [];

            res.content.forEach(el => {
                let his = {
                    time: new Date(el.actionDate),
                    user: el.actionUser,
                    action: t(`history.${el.action}`),

                }

                switch (el.dataType) {
                    case 'DATE':
                        his.type = "datetime";
                        his.oldValue = el.oldDate;
                        his.newValue = el.newDate;
                        break;
                    case 'USER':
                        his.type = "chip";
                        his.oldValue = (el.oldValue && el.oldUser) && [{ avatar: el.oldUser.avatar, name: el.oldUser.fullName }];
                        his.newValue = (el.newValue && el.newUser) && [{ avatar: el.newUser.avatar, name: el.newUser.fullName }];
                        break;
                    case 'LIST_USER':
                        his.type = "chip";
                        his.oldValue = el.oldValue && el.oldUsers.map(m => ({ avatar: m.avatar, name: m.fullName }));
                        his.newValue = el.newValue && el.newUsers.map(m => ({ avatar: m.avatar, name: m.fullName }));
                        break;
                    default:
                        his.type = "string";
                        his.oldValue = prepareValue(el.oldValue);
                        his.newValue = prepareValue(el.newValue);
                        break;
                }

                mappedhistory(his);
            });

            _history.data = [..._history.data, ...mappedHistory];
            setHistory(_history);
        });
    }

    /**
     * prepare value
     * @param {*} value
     */
    const prepareValue = (value) => {
        if (Array.isArray(value)) {
            value = value.join(", ");
        } else {
            value = value ? value.toString() : "";
        }
        return value;
    }

    return (
        <React.Fragment>
            {!history.data &&
                <div>
                    <Button
                        label={t("task.history.view")}
                        className="p-button p-button-primary"
                        icon="bx bx-history"
                        onClick={() => loadHistory(true)}
                    />
                </div>
            }

            {history.data && history.data.length === 0 &&
                <EmptyDataCompact message={t("task.history.empty")} />
            }

            {history.data && history.data.length > 0 &&
                <History className="p-0" data={history.data} more={history.more} loadMore={loadHistory} />
            }
        </React.Fragment>
    );
}

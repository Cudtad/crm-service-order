import React, { useRef, useState } from "react";
import _ from "lodash";
import "./styles.scss";
import TaskBaseApi from "services/TaskBaseApi";
import CommonFunction from '@lib/common';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import { UserInfo } from "@ui-lib/user-info/UserInfo";

/**
 * props:
 *      taskId,
 *      application,
 *      type // task 's type
 * @param {*} props 
 * @returns 
 */
export const Ticket_History = (props) => {

    const t = CommonFunction.t;
    const { taskId, getHistoriesFn } = props;
    const [histories, setHistories] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const refParameters = useRef({
        data: null,
        more: false,
        page: 0,
        size: 5,
        total: 0
    });
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{4}$/;

    /**
     * load history
     * @param {*} firstPage
     */
    const loadHistory = async (firstPage) => {
        setLoading(true);
        let payload = { page: firstPage ? 0 : refParameters.current.page + 1, size: refParameters.current.size };

        (getHistoriesFn || TaskBaseApi.getHistories)(taskId, payload).then(res => {
            if (res) {
                let _parameters = _.cloneDeep(refParameters.current);
                _parameters.total = res.total;
                _parameters.page = res.page;
                _parameters.data = (_parameters.data || []).concat(res.content);
                _parameters.more = _parameters.data.length < _parameters.total;

                refParameters.current = _parameters;
                
                setLoadMore(_parameters.more);
                setHistories(_parameters.data);
            }
            setLoading(false);
        })
    }

    /**
     * render changes
     * @param {*} change 
     */
    const renderChanges = (change, changeIndex) => {
        switch (change.key) {
            case "involves":
                return (
                    <div key={changeIndex} className="history-detail-row">
                        <div>{t("task.involve")}</div>
                        <div>{renderInvolveChange("old", change.old)}</div>
                        <div>{renderInvolveChange("new", change.new)}</div>
                    </div>
                )
                break;
            default:
                return (
                    <div key={changeIndex} className="history-detail-row">
                        <div>{renderChangeKey(change.key)}</div>
                        <div>{renderChangeValue(change.key, "old", change.old)}</div>
                        <div>{renderChangeValue(change.key, "new", change.new)}</div>
                    </div>
                )
                break;
        }
    }

    /**
     * render involve change
     * @param {*} type 
     * @param {*} value 
     */
    const renderInvolveChange = (type, value) => {
        if (value && Array.isArray(value) && value.length) {
            return (<dl className="history-involve-list">
                {value.map((involves, involvesIndex) => (<>
                    <dt key={involvesIndex}>{t(`ticket.involve.${involves.involveType}.${involves.role}`)}</dt>
                    {involves.involveIds && involves.involveIds.map((involve, involveIndex) => (
                        <dd key={involveIndex}>
                            <XAvatar
                                src={CommonFunction.getImageUrl(involve.avatar, involve.fullName)}
                                label={() => involve.fullName}
                            ></XAvatar>
                        </dd>
                    ))}
                </>))}
            </dl>)
        }
    }


    /**
     * render change value
     */
    const renderChangeValue = (key, type, value) => {
        switch (key) {
            case "CHANGE_STATE":
                return t(`task.state.${value}`);
                break;
            case "analysis":
                console.log(value);
                return (<div className="history-involve-list">
                    {value.map((type, content) => (
                        <div>{type.type + ": " + (type.content === undefined ? "" : type.content.replace(/<[^>]+>/g, ''))}</div>
                    ))}
                </div>);
                break;
            case "solution":
            case "description":
                if (value !== undefined) {
                    value = value.replace(/<[^>]+>/g, '').replace('&nbsp;', ' ');
                }
                return value;
                break;
            default:
                if (value instanceof Date || (typeof value === "string" && iso8601Regex.exec(value.toString()))) {
                    value = CommonFunction.formatDateTime(value);
                }
                return value;
                break;
        }
    }



    /**
     * render change key
     * @param {*} key
                * @returns
                */
    const renderChangeKey = (key) => {
        switch (key) {
            default:
                return t(`ticket.history.key.${key}`);
                break;
        }
    }

    return (
        <React.Fragment>
            {!histories && !loading &&
                <div className="link-button" onClick={() => loadHistory(true)}>
                    <span className="text-grey-9">{t("task.history.view")}</span>
                </div>
            }

            {histories && histories.length > 0 && histories.map((history, index) => (
                <div key={index} className="history-item">

                    <div className="event-timeline-dot"><i className="bx bx-right-arrow-circle"></i></div>
                    <div className="history-info">
                        {history.createBy &&
                            <>
                                <UserInfo id={history.createBy.id} />
                                <span className="history-time ml-2">- {CommonFunction.formatDateTime(history.createDate)}</span>
                                <span className="history-action ml-2">- {t(`task.history.action.${history.action}`)}</span>
                            </>
                        }
                    </div>
                    {history.histories && history.histories.length > 0 &&
                        <div className="history-detail">
                            <div className="history-detail-row history-detail-header">
                                <div></div>
                                <div>{t("task.history.old-value")}</div>
                                <div>{t("task.history.new-value")}</div>
                            </div>

                            {history.histories.map((change, changeIndex) => (<>
                                {renderChanges(change, changeIndex)}
                            </>))}

                        </div>
                    }

                </div>
            ))}

            {loadMore && !loading &&
                <div className="history-load-more" onClick={() => loadHistory(false)}>
                    <span>{t("history.load-more")}</span>
                </div>
            }

            {loading &&
                <div className="history-loading">
                    <i className="bx bx-loader bx-spin"></i>
                    <span>{t("common.loading")}</span>
                </div>
            }
        </React.Fragment>
    );
}

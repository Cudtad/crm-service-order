import React, {useState} from 'react';
import PropTypes from 'prop-types';
import './scss/History.scss'
import EmptyDataCompact from "@ngdox/ui-lib/dist/components/empty-data/EmptyDataCompact";
import CommonFunction from '@lib/common';

import classNames from 'classnames';
import {Chip} from 'primereact/chip';

HistoryTask.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        time: PropTypes.instanceOf(Date),
        user: PropTypes.object,
        action: PropTypes.string,
        oldValue: PropTypes.any,
        newValue: PropTypes.any,
        type: PropTypes.oneOf(["string", "date", "datetime", "number", "chip"])
    })),
    more: PropTypes.bool,
    className: PropTypes.string
};

HistoryTask.defaultProps = {
    data: [],
    more: false
}

function HistoryTask(props) {
    const t = CommonFunction.t;
    const { data, more, className, loadMore } = props;
    const [loading, setLoading] = useState(false);
    let _className = className ? `history-component-container ${className}` : "history-component-container";

    /**
     * load more
     */
    const loadHistory = () => {
        if (loadMore) {
            setLoading(true);
            loadMore().then(() => {
                setLoading(false);
            })
        }
    }

    /**
     * render value by type
     */
    const renderValueByType = (type, value) => {

        switch (type) {
            case "date":
                return <div className="small">{CommonFunction.formatDate(value)}</div>
                break;
            case "datetime":
                return <div className="small">{CommonFunction.formatDateTime(value)}</div>
                break;
            case "chip":
                return <div className="">
                    {value.map((item, index) => (
                        <Chip
                            key={index}
                            label={item.name}
                            image={CommonFunction.getImageUrl(item.avatar, item.name)}
                            className="tiny p-1" />

                    ))}
                </div>
                break;
            default:
                return <div className="small" dangerouslySetInnerHTML={{ __html: CommonFunction.removeScriptTags(value) }}></div>
                break;
        }
    }

    return (
        <div className={_className} >
            {/* empty */}
            {(!data || data.length === 0) &&
                <EmptyDataCompact />
            }

            {/* histories */}
            {data && data.length > 0 && data.map((history, index) => (
                <div key={index} className="history-item pr-2">
                    <div className="event-timeline-dot text-primary"><i className="bx bx-right-arrow-circle fs-18"></i></div>
                    {/*<img className="history-avatar mr-2 border-shadow" src={CommonFunction.getImageUrl(history.requestedByUser.avatar)} />*/}
                    <div className="flex flex-column history-detail">
                        <span className="bold-and-color pb-1">{history.activity.name}</span>
                        <div className="flex align-items-center">
                            <i className={classNames({
                                "small mr-2 ml-1": true,
                                "bx bx-sad over-due": history.deadline < (history.closedOn ? history.closedOn : new Date()) ,
                                "bx bx-happy in-progress": history.deadline > (history.closedOn ? history.closedOn : new Date())
                            })}
                            ></i>
                            <span  className="small mr-2 ml-1">{CommonFunction.formatDateTime(history.startDate)}</span>
                            <span className="small mr-2 ml-1">{CommonFunction.formatDateTime(history.closedOn)}</span>
                            {history.deadline &&
                                <>
                                    (<span className="small mr-2 ml-1">
                                        {CommonFunction.formatDateTime(history.deadline)}
                                    </span>)
                                </>
                            }

                        </div>
                        <div className="flex mt-1 align-items-center">
                            <img className="history-avatar mr-2 border-shadow" src={CommonFunction.getImageUrl(history.requestedByUser.avatar)} />
                            <span className="small">{history.requestedByUser.fullName}</span>
                            <i className="bx bx-right-arrow-alt font-size-16 text-success align-middle fs-16 ml-2 mr-1"></i>
                            <img className="history-avatar mr-2 border-shadow" src={CommonFunction.getImageUrl(history.responsibleUser.avatar)} />
                            <span className="small">{history.responsibleUser.fullName}</span>
                        </div>
                        <div className="flex mt-1 align-items-center">
                            <i className="bx bxs-quote-left small text-grey fs-16 font-size-5 mr-2 ml-1" ></i>
                            <span className="small">{history.comment}</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* load more */}
            {more &&
                <div
                    className="flex align-items-center justify-content-center link-button text-primary pb-2 pt-2"
                    onClick={loadHistory}
                >
                    <i className={classNames({
                        "bx fs-18 align-middle mr-2": true,
                        "bx-loader bx-spin": loading,
                        "bx bx-chevron-down": !loading
                    })}></i>
                    <span>{t("common.load-more")}</span>
                </div>
            }

        </div>
    );

}

export default HistoryTask;

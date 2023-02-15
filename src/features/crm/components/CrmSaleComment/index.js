import React, { useEffect, useRef, useState } from 'react';
import CommonFunction from '@lib/common';

import _ from "lodash";
import "./styles.scss"
import { Card } from 'primereact/card';
import CrmTitleIcon from '../CrmTitleIcon';
import Task_Comments from "@ui-lib/x-task/Task_Comments"
import { XLayout_Title } from '@ui-lib/x-layout/XLayout'

const entityApplication = "crm-service"
const entityRefType = "sale"

export default function CrmSaleComment(props) {
    const t = CommonFunction.t;
    const { id, className, permissionCode, type, footer } = props;
    const refCommentHistories = useRef(null)

    const renderHeader = () => {
        return <CrmTitleIcon
            icon="bx bx-chat"
            iconBgColor="#2196F3"
            title={t("crm-service.comment")}
            items={[]}
        />
    }


    return (<>
        <div className={`p-card p-card-component overflow-hidden ${className ? className : ``}`}>
            <div className='p-card-header'>
                {renderHeader()}
            </div>
            <div className='p-card-body'>
                <div className='p-card-content py-0'>
                    <XLayout_Title className="task-block-title">
                        <i className="bx bx-chat"></i>
                        {t("crm-service.comment-title")}
                    </XLayout_Title>

                    <div className="task-block-content crm-sale-comment">
                        <Task_Comments
                            application={entityApplication}
                            refType={entityRefType}
                            ref={refCommentHistories}
                            refId={id}
                            type={type}
                            user={{
                                id: window.app_context.user.id,
                                name: window.app_context.user.fullName,
                                avatar: CommonFunction.getImageUrl(window.app_context.user.avatar, window.app_context.user.fullName)
                            }}
                        ></Task_Comments>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

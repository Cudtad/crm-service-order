import CommonFunction from "@lib/common";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import "./styles.scss";
import { Button } from "primereact/button";
import CrmTitleIcon from "../CrmTitleIcon";
import Task_Attachment from "../../../../components/task/components/Task_Attachment_v2";

import { getPermistion } from "../../utils";
import { PREVIEW_NUMBER } from "../../utils/constants";

function CrmAttachment(props, ref) {
    const t = CommonFunction.t;

    const {
        applicationService,
        entityRefType,
        UUID,
        readOnly,
        className,
        footer,
        permissionCode,
        hide,
    } = props;

    const refAttachments = useRef();

    const [permission, setPermission] = useState();

    const [showAll, setShowAll] = useState(false);

    const [attachs, setAttachs] = useState([]);

    const onShowMore = () => {
        setShowAll(!showAll);
        refAttachments.current.showMore(!showAll);
    };

    const renderHeader = () => {
        return (
            <CrmTitleIcon
                icon="bx bx-receipt"
                iconBgColor="rgba(184, 116, 26, .6)"
                title={t("crm-service-order.attachment-infomation")}
                items={[
                    {
                        label: t("common.create"),
                        command: () => {
                            refAttachments.current.create();
                        },
                        disabled: readOnly,
                    },
                ]}
            />
        );
    };

    const renderFooter = () => {
        return (
            <div
                className={`flex align-items-center justify-content-center px-3 py-1 border-top-1 border-gray-400`}
            >
                <Button
                    label={showAll ? t("crm.view-less") : t("action.see-more")}
                    className="p-button-link p-button-sm"
                    onClick={onShowMore}
                />
            </div>
        );
    };

    useEffect(() => {
        setPermission(getPermistion(window.app_context.user, permissionCode));
    }, []);

    const onLoadAttachs = (atts) => {
        setAttachs(atts);
    };

    return (
        <>
            <div
                className={`p-card p-card-component overflow-hidden ${
                    className ? className : ``
                }`}
            >
                {hide ? (
                    ""
                ) : (
                    <div className="p-card-header">{renderHeader()}</div>
                )}

                <div
                    className={`p-card-body ${!attachs.length ? `hidden` : ``}`}
                >
                    <div className="p-card-content py-0 px-1 crm-task-attachment">
                        <Task_Attachment
                            {...props}
                            mode={readOnly === true ? "view" : ""}
                            ref={refAttachments}
                            application={applicationService}
                            refType={entityRefType}
                            taskId={UUID}
                            size="small"
                            permission={permission}
                            onLoadAttachs={onLoadAttachs}
                        />
                    </div>
                </div>

                <div
                    className={`p-card-footer ${
                        attachs.length <= PREVIEW_NUMBER ? `hidden` : ``
                    }`}
                >
                    {renderFooter()}
                </div>
            </div>
            {!hide ? (
                ""
            ) : (
                <div className="w-auto">
                    <Button
                        className="p-button-text text-sm w-auto pl-1"
                        icon="bx bx-plus text-green text-lg"
                        tooltip={t("crm-service-order.info-confirmation.add")}
                        tooltipOptions={{
                            position: "bottom",
                        }}
                        onClick={() => refAttachments.current.create()}
                        label={t("crm-service-order.info-confirmation.add")}
                    />
                </div>
            )}
        </>
    );
}

CrmAttachment = forwardRef(CrmAttachment);

export default CrmAttachment;

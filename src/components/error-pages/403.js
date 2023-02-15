import CommonFunction from '@lib/common';
                    import { XLayout, XLayout_Center, XLayout_Row, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import React from 'react';



export default function Error403(props) {
    const t = CommonFunction.t;
    const { backUrl } = props;
    return (
        <XLayout className="p-2">
            <XLayout_Top>
                <XLayout_Title className="fs-30 flex align-items-center justify-content-center">
                    4<i className="bx bx-buoy bx-spin fs-28 text-primary mx-1"></i>3
                </XLayout_Title>
                <XLayout_Title className="fs-20 p-text-center">
                    {t("you-do-not-have-permission")}
                </XLayout_Title>
            </XLayout_Top>
            <XLayout_Center className="overflow-hidden">
                <img src="/assets/images/error-img.352b9ab6.png" style={{ width: '100%', height: '100%', objectFit: "contain" }} />
            </XLayout_Center>
        </XLayout>
    )
}

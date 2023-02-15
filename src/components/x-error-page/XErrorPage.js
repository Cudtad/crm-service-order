import CommonFunction from '@lib/common';
                    import React, { forwardRef, useEffect } from 'react';
import "./scss/XErrorPage.scss";

/**
 * config everythings like jodit
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XErrorPage(props, ref) {
    const { error } = props;
    const t = CommonFunction.t;

    useEffect(() => {
        console.error(error);
    }, [error])

    return (
        <div className="x-error-page">
            <div className="error-text-emoji">ʅ(°_°)ʃ</div>
            <div className="error-message">{t("common.something-goes-wrong")}</div>
        </div>
    )
}

XErrorPage = forwardRef(XErrorPage);

export default XErrorPage;

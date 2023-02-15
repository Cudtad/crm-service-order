import React, { useEffect, useRef, useState } from 'react';
import CommonFunction from '@lib/common';

import _ from "lodash";
import "./styles.scss"
import { Card } from 'primereact/card';
import CrmTitleIcon from '../CrmTitleIcon';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

export default function CrmCardReadMore(props) {
    const t = CommonFunction.t;
    const { className, path, callBack } = props;
    const history = useNavigate()

    const onPage = () => {
        if (path) {
            history(path)
        } else if (callBack) {
            callBack()
        }
    }

    return (<div className={`flex align-items-center justify-content-center px-3 py-1 border-top-1 border-gray-400 ${className ? className : ``}`}>
        <Button
            label={t("crm.view-all")}
            className="p-button-link p-button-sm"
            onClick={onPage}
        />
    </div>)
}

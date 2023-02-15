import CommonFunction from '@lib/common';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import _ from "lodash"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { MODE } from "../../utils/constants"
import "./styles.scss"

function CrmCreateDialog(props, ref) {
    const t = CommonFunction.t;

    const { onSubmit, onShow, title, permission, viewOnly } = props

    const [showDetail, setShowDetail] = useState(false)

    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
        create: () => {
            setShowDetail(true)
        },

        edit: async () => {
            setShowDetail(true)
        },

        close: () => {
            setShowDetail(false)
        },

        setLoading: (flg) => {
            setLoading(flg)
        }

    }))

    const cancel = () => {
        setShowDetail(false)
    }

    const submitProject = () => {
        if (onSubmit) {
            onSubmit()
        }
    }

    return (
        <Dialog
            header={() => <div className='text-center text-2xl py-1'>{title}</div>}
            visible={showDetail}
            modal
            contentClassName="over"
            className="p-fluid fluid crm-detail"
            footer={
                <>
                    <Button label={t('common.cancel')} className="p-button-text" onClick={cancel} />
                    <Button
                        disabled={!(permission?.update || permission?.create) || viewOnly}
                        label={t('common.save')} loading={loading} icon="bx bxs-save" className="primary" onClick={submitProject} />
                </>
            }
            onHide={cancel}
            onShow={onShow}
        >
            <div className='p-2'>
                {props.children}
            </div>
        </Dialog>
    )
}

CrmCreateDialog = forwardRef(CrmCreateDialog)
export default CrmCreateDialog
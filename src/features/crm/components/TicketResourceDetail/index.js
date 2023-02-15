import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import CommonFunction from '@lib/common';

import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { InputText } from "primereact/inputtext";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import _ from "lodash";
import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import Enumeration from '@lib/enum';
import { InputTextarea } from "primereact/inputtextarea";
import CrmResourceApi from "services/CrmResourceApi";
import {Checkbox} from "primereact/checkbox";

function TicketResourceDetail(props, ref) {
    const t = CommonFunction.t;
    const { data, permission, setLoading, cancel, reload } = props;

    const [show, setShow] = useState(false);

    const [readOnly, setReadOnly] = useState(false);

    const refEditMode = useRef(null);

    const [ticketResource, setTicketResource] = useState(null);

    const emptyDetail = {
        id: null,
        name: "",
        description: "",
        type: null,
        parentId: null,
        status: true
    };

    const defaultErrors = {
        name: "",
    }
    const [errors, setErrors] = useState(defaultErrors);

    useEffect(() => {
        if (data) {
            edit(data);
            setReadOnly(!permission?.update);
        } else {
            create();
            setReadOnly(false);
        }
    }, [data]);


    // Các hàm extend để bên ngoài gọi vào
    useImperativeHandle(ref, () => ({
        submitProject: () => {
            submitProject()
        }
    }))

    /**
     * create
     */
    const create = () => {
        setErrors(defaultErrors);

        refEditMode.current = Enumeration.crud.create;

        // gán giá trị mặc định cho object
        setTicketResource(emptyDetail);
    }

    /**
     * update task
     */
    const edit = (_data) => {
        refEditMode.current = Enumeration.crud.update;
        setErrors(defaultErrors);

        // prepare _data
        _data.parentId = _data.parentId === 0 ? null : _data.parentId;
        _data.status = _data.status ? true : false

        setTicketResource(_data);
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _ticketResource = _.cloneDeep(ticketResource);
        _ticketResource[prop] = val;
        validate([prop], _ticketResource);
        setTicketResource(_ticketResource);
    }

    /**
     * validate
     * @param {*} props // nêu truyền vào 1 mảng rỗng hoặc ko truyền gì thì sẽ validate hết các props
     * @param {*} _ticketResource nếu truyền vào thì validate theo cái truyền vào nếu không validate theo state
     * @returns object { isValid, errors }
     */
    const validate = async (props, _ticketResource) => {
        _ticketResource = _ticketResource || _.cloneDeep(ticketResource);
        let result = { ...errors }, isValid = true, _errors = [];

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case "name":
                    result.name = _ticketResource.name.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set lại state errors để hiển thị lỗi
        setErrors(result);

        // combine errors
        for (const property in result) {
            if (!CommonFunction.isEmpty(result[property])) {
                isValid = false;
                _errors.push(result[property]);
            }
        }
        return { isValid: isValid, errors: _errors };
    };

    /**
     * submit
     * @param {*} _ticketResource
     */
    const submitProject = async () => {
        let _ticketResource = _.cloneDeep(ticketResource)
        let editMode = refEditMode.current,
            res = null;

        let _validate = await validate([], _ticketResource);

        if (_validate.isValid) {
            setLoading(true);

            // prepare data
            _ticketResource.parentId = _ticketResource.parentId || 0;
            _ticketResource.status = _ticketResource.status ? 1 : 0
            // submit
            switch (editMode) {
                case Enumeration.crud.create:
                    // create 
                    res = await CrmResourceApi.create(_ticketResource);

                    break;
                case Enumeration.crud.update:
                    // update 
                    res = await CrmResourceApi.update(_ticketResource);
                    break;
                default:
                    break;
            }

            if (res) {

                if (reload) {
                    reload(res);
                }

                if (cancel) {
                    cancel();
                }

                CommonFunction.toastSuccess(t("common.save-success"));
            }

            setLoading(false);
        } else {
            CommonFunction.toastWarning(_validate.errors);
        }
    }

    /**
     * render errors
     * @param {*} prop 
     */
    const renderErrors = (prop) => {
        if (errors[prop]) {
            return <small className="p-invalid">{errors[prop]}</small>
        } else {
            return <></>
        }
    }

    if (!ticketResource) {
        return <></>
    }



    return (
        <XLayout>
            <XLayout_Center className="p-2">
                <div className="p-fluid fluid  formgrid grid p-0">
                    <div className="col-12">
                        <span className="p-float-label">
                            <InputText
                                value={ticketResource.name}
                                onChange={(e) => applyChange('name', e.target.value)}
                                disabled={readOnly}
                            />
                            <label className="require">{t("ticket.location.name")}</label>
                            {renderErrors("name")}
                        </span>
                    </div>
                    <div className="col-12">
                        <span className="p-float-label">
                            <InputTextarea
                                value={ticketResource.description}
                                style={{ height: "100px" }}
                                onChange={(e) => applyChange('description', e.target.value)}
                                disabled={readOnly}
                            />
                            <label>{t("ticket.location.description")}</label>
                        </span>
                    </div>
                    <div className="col-12">
                        <div className="p-field-checkbox mt-2">
                            <Checkbox
                                inputId="status"
                                checked={ticketResource.status}
                                onChange={(e) => applyChange('status', e.checked)}
                            />
                            <label htmlFor="status" className="ml-2">{t(`status.active`)}</label>
                        </div>
                    </div>

                </div>
            </XLayout_Center>
        </XLayout >
    )
}

TicketResourceDetail = forwardRef(TicketResourceDetail);

export default TicketResourceDetail;

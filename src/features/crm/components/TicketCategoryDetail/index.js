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
import { Dropdown } from "primereact/dropdown";
import CrmCategoryApi from "services/CrmCategoryApi";
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';

function TicketCategoryDetail(props, ref) {
    const t = CommonFunction.t;
    const { data, categories, products, permission, setLoading, cancel, reload } = props;

    const refEditMode = useRef(null);

    const [readOnly, setReadOnly] = useState(false);

    const [ticketCategory, setTicketCategory] = useState(null);

    const emptyDetail = {
        id: null,
        name: "",
        description: "",
        type: null,
        parentId: null,
        productId: null
    };

    const defaultErrors = {
        name: ""
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
        setTicketCategory(emptyDetail);
    }

    /**
     * update task
     */
    const edit = (data) => {

        refEditMode.current = Enumeration.crud.update;
        setErrors(defaultErrors);

        // prepare data
        data.parentId = data.parentId === 0 ? null : data.parentId;

        setTicketCategory(data);
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _ticketCategory = _.cloneDeep(ticketCategory);
        _ticketCategory[prop] = val;
        validate([prop], _ticketCategory);
        setTicketCategory(_ticketCategory);
    }

    /**
     * validate
     * @param {*} props // nêu truyền vào 1 mảng rỗng hoặc ko truyền gì thì sẽ validate hết các props
     * @param {*} _ticketCategory nếu truyền vào thì validate theo cái truyền vào nếu không validate theo state
     * @returns object { isValid, errors }
     */
    const validate = async (props, _ticketCategory) => {
        _ticketCategory = _ticketCategory || _.cloneDeep(ticketCategory);
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
                    result.name = _ticketCategory.name ? null : `${t("ticket.category.name")} ${t("message.cant-be-empty")}`;
                case "type":
                    result.type = _ticketCategory.type ? null : `${t("ticket.category.type")} ${t("message.cant-be-empty")}`;
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
     * @param {*} _ticketCategory
     */
    const submitProject = async () => {
        let _ticketCategory = _.cloneDeep(ticketCategory)
        let editMode = refEditMode.current,
            res = null;

        let _validate = await validate([], _ticketCategory);

        if (_validate.isValid) {
            setLoading(true);

            // prepare data
            _ticketCategory.parentId = _ticketCategory.parentId || 0;

            // submit
            switch (editMode) {
                case Enumeration.crud.create:
                    // create 
                    res = await CrmCategoryApi.create(_ticketCategory);

                    break;
                case Enumeration.crud.update:
                    // update 
                    res = await CrmCategoryApi.update(_ticketCategory);
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

    if (!ticketCategory) {
        return <></>
    }

    return (
        <XLayout>

            <XLayout_Center className="p-2">
                <div className="p-fluid fluid  formgrid grid p-0">
                    <div className="col-6">
                        <span className="p-float-label require">
                            <InputText
                                value={ticketCategory.name}
                                onChange={(e) => applyChange('name', e.target.value)}
                                disabled={readOnly}
                            />
                            <label className="require">{t("ticket.category.name")}</label>
                            {renderErrors("name")}
                        </span>
                    </div>
                    <div className="col-6">
                        <span className="p-float-label">
                            <XDropdownTree
                                value={ticketCategory.parentId}
                                options={categories}
                                optionLabel="name"
                                optionValue="id"
                                filter
                                showClear
                                filterBy="name"
                                onChange={(e) => applyChange('parentId', e.value)}
                                disabled={readOnly}
                            ></XDropdownTree>
                            <label>{t("ticket.category.parent")}</label>
                        </span>
                    </div>
                    <div className="col-12">
                        <span className="p-float-label">
                            <InputTextarea
                                value={ticketCategory.description}
                                style={{ height: "100px" }}
                                onChange={(e) => applyChange('description', e.target.value)}
                                disabled={readOnly}
                            />
                            <label>{t("ticket.category.description")}</label>
                        </span>
                    </div>
                    <div className="col-6">
                        <span className="p-float-label">
                            <Dropdown
                                value={ticketCategory.type}
                                options={[
                                    { id: "1", value: "TICKET", name: t("TICKET") },
                                    { id: "2", value: "PROBLEM", name: t("PROBLEM") },
                                    { id: "3", value: "CHANGE", name: t("CHANGE") }
                                ]}
                                optionLabel="name"
                                optionValue="value"
                                filter
                                showClear
                                filterBy="name"
                                onChange={(e) => applyChange('type', e.value)}
                                disabled={readOnly}
                            />
                            <label className="require">{t("ticket.category.type")}</label>
                            {renderErrors("type")}
                        </span>
                    </div>
                    <div className="col-6">
                        <span className="p-float-label">
                            <Dropdown
                                value={ticketCategory.productId}
                                options={products}
                                optionLabel="productName"
                                optionValue="id"
                                filter
                                showClear
                                filterBy="productName"
                                onChange={(e) => applyChange('productId', e.value)}
                                disabled={readOnly}
                            />
                            <label>{t("ticket.category.product")}</label>
                        </span>
                    </div>

                </div>
            </XLayout_Center>
        </XLayout >
    )
}

TicketCategoryDetail = forwardRef(TicketCategoryDetail);

export default TicketCategoryDetail;

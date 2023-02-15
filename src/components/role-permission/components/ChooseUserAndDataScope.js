import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import CommonFunction from '@lib/common';

import _ from 'lodash';
import { UserAutoComplete } from '@ui-lib/x-autocomplete/UserAutoComplete';
import { Dropdown } from 'primereact/dropdown';

/**
 * props
 *      roles: [] // all roles can selected
 *      afterSubmit: ({users: [], roles: []}) // function after submit
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function ChooseUserAndDataScope(props, ref) {
    const { dataScope, afterSubmit } = props;
    const t = CommonFunction.t;

    const [show, setShow] = useState(false);
    const [selected, setSelected] = useState({ users: [], scope: "owner" });
    const defaultValidate = { users: null, roles: null };
    const [validate, setValidate] = useState(defaultValidate);


    useImperativeHandle(ref, () => ({
        /**
         * choose
         */
        choose: () => {
            setValidate(_.cloneDeep(defaultValidate));
            setSelected({ users: [], scope: "owner" });
            setShow(true);
        },
    }));

    /**
     * hide window detail
     */
    const hide = () => {
        setShow(false);
    };

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        let _selected = _.cloneDeep(selected);
        switch (prop) {
            default:
                _selected[prop] = val;
                break;
        }

        setSelected(_selected);
        performValidate([prop], _selected);
    };

    /**
     * submit workflow
     */
    const submit = async () => {
        // validate
        let [isValid, errors] = performValidate([], selected);

        if (isValid) {
            if (afterSubmit && typeof afterSubmit === "function") {
                afterSubmit(_.cloneDeep(selected));
                hide();
            }
        } else {
            CommonFunction.toastWarning(errors);
        }
    };

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props, _selected) => {
        let result = { ...validate }, isValid = true, errors = [];

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'users':
                    result[prop] = _selected[prop] && _selected[prop].length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                errors.push(result[property]);
                isValid = false;
            }
        }

        return [isValid, _.uniq(errors)];
    }

    /**
    * render involve errors
    * @param {*} prop
    */
    const renderErrors = (prop) => {
        if (validate[prop]) {
            return <small className="p-invalid">{validate[prop]}</small>
        } else {
            return <></>
        }
    }

    if (show) {

        return (
            <Dialog
                header={t("group-user-role.add-user")}
                visible={show}
                modal
                style={{ width: "600px" }}
                footer={
                    <>
                        <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={hide} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} />
                    </>
                }
                onHide={hide}
            >
                <div className="p-fluid fluid  formgrid grid px-2">
                    <div className="col-12">
                        <span className="p-float-label">
                            <UserAutoComplete
                                value={selected.users}
                                multiple
                                excludeUserIds={selected && selected.users ? selected.users.map(m => m.id) : []}
                                onChange={(value) => applyChange('users', value)}
                            />
                            <label>{t('group-user-role.user')}</label>
                            {renderErrors("users")}
                        </span>
                    </div>
                    <div className="col-12">
                        <span className="p-float-label">
                            <Dropdown
                                options={dataScope}
                                value={selected.scope}
                                optionLabel="name"
                                optionValue="code"
                                onChange={(e) => applyChange("scope", e.value)}
                                filter
                            ></Dropdown>
                            <label>{t('group-user-role.data-scope')}</label>
                        </span>
                    </div>
                </div>
            </Dialog>

        );
    } else {
        return <></>
    }
};

ChooseUserAndDataScope = forwardRef(ChooseUserAndDataScope);

export default ChooseUserAndDataScope;

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import CommonFunction from '@lib/common';

import { InputText } from 'primereact/inputtext';
import _ from 'lodash';
import PermissionApi from "services/PermissionService";
import { OrgAC } from "../../../components/autocomplete/OrgAC";
import { Checkbox } from "primereact/checkbox";
import GroupApi from "services/GroupService";
import Enumeration from '@lib/enum';

/**
 * props
 *      type: "org" // type of group.Eg: org, project
 *      afterSubmit: (mode, group) => {} // function after submit
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function GroupDetail(props, ref) {
    const { type, afterSubmit, multipleLevel } = props;

    // default validate object
    let defaultValidate = {
        code: null,
        name: null
    }

    const t = CommonFunction.t;

    const refEditMode = useRef(null);
    const [show, setShow] = useState(false);
    const [group, setGroup] = useState(null);
    const [groupValidate, setGroupValidate] = useState(defaultValidate);
    const [rootGroup, setRootGroup] = useState(null);
    const [title, setTitle] = useState("");
    const [isMultipleLevel, setIsMultipleLevel] = useState(false);

    useEffect(() => {
        setIsMultipleLevel(typeof multipleLevel === 'undefined' ? true : multipleLevel);
    }, [multipleLevel])

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: (_group) => {
            refEditMode.current = Enumeration.crud.create;
            let _newGroup = Object.assign({
                code: "",
                name: "",
                parentId: 0,
                type: type,
                status: true
            }, _group || {});
            setGroup(_newGroup);
            setGroupValidate(_.cloneDeep(defaultValidate));
            setTitle(t("common.dialog.title.create").format(t("entity.group.name").toLowerCase()));
            setShow(true);
        },

        /**
         * update
         */
        update: (_group) => {
            refEditMode.current = Enumeration.crud.update;
            // get group
            setGroup(_group);
            setGroupValidate(_.cloneDeep(defaultValidate));
            setTitle(t("common.dialog.title.update").format(t("entity.group.name").toLowerCase()));
            setShow(true);
        },

        /**
         * delete
         * @param {*} _group
         */
        delete: (id) => {

        }
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
        let _group = _.cloneDeep(group);
        switch (prop) {
            default:
                _group[prop] = val;
                break;
        }

        setGroup(_group);
        performValidate([prop], _group);
    };

    /**
     * submit group
     */
    const submit = async () => {
        // validate
        let [isValid, errors] = performValidate([], group);

        if (isValid) {
            let res = null;
            switch (refEditMode.current) {
                case Enumeration.crud.create:
                    res = await GroupApi.create(group);
                    break;
                case Enumeration.crud.update:
                    res = await GroupApi.update(group);
                    break;
                default:
                    break;
            }

            if (res) {
                if (afterSubmit && typeof afterSubmit === "function") {
                    await afterSubmit(refEditMode.current, res)
                }
                CommonFunction.toastSuccess(t("common.save-success"));
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
    const performValidate = (props, group) => {
        let result = { ...groupValidate }, isValid = true, errors = [];

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'code':
                    result[prop] = group.code && group.code.length > 0 ? null : `${t('entry.code')} ${t('message.cant-be-empty')}`;
                    break;
                case 'name':
                    result[prop] = group.name && group.name.length > 0 ? null : `${t('entry.name')} ${t('message.cant-be-empty')}`;
                    break;
                default:
                    break;
            }
        });

        // set state
        setGroupValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                errors.push(result[property]);
                isValid = false;
            }
        }

        return [isValid, _.uniq(errors)];
    }

    if (show && group) {

        return (
            <Dialog
                header={title}
                visible={show}
                modal
                style={{ width: "400px" }}
                footer={
                    <>
                        <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={hide} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} />
                    </>
                }
                onHide={hide}
            >
                <div className="p-fluid fluid  formgrid grid p-2">

                    <div className="col-12">
                        <span className="p-float-label">
                            <InputText id="code" value={group.code} autoFocus
                                onChange={(e) => applyChange('code', e.target.value)}
                                className={classNames({ 'p-invalid': groupValidate.code })} />
                            <label htmlFor="code" className="require">{t('entry.code')}</label>
                        </span>
                        {groupValidate.code && <small className="p-invalid">{groupValidate.code}</small>}
                    </div>

                    <div className="col-12">
                        <span className="p-float-label">
                            <InputText id="name" value={group.name}
                                onChange={(e) => applyChange('name', e.target.value)}
                                className={classNames({ 'p-invalid': groupValidate.name })} />
                            <label htmlFor="name" className="require">{t('entry.name')}</label>
                        </span>
                        {groupValidate.name && <small className="p-invalid">{groupValidate.name}</small>}
                    </div>
                    {isMultipleLevel && <div className="col-12">
                        <span className="p-float-label">
                            <OrgAC id="parent"
                                   rootGroupId={props.rootGroupId ? props.rootGroupId : null}
                                   value={group.parents}
                                   groupType={group.type ? group.type : props.type}
                                   onChange={(e) => applyChange('parents', e.value)}
                                   className={classNames({'p-invalid': groupValidate.parent})}
                            />
                            <label htmlFor="parent">{t('entry.parent')}</label>
                        </span>
                        {groupValidate.parent && <small className="p-invalid">{groupValidate.parent}</small>}
                    </div>}

                    <div className="col-12" >
                        <div className="p-field-radiobutton my-1">
                            <Checkbox
                                inputId="status"
                                name="status"
                                checked={group.status}
                                onChange={(e) => applyChange('status', e.checked)}
                            ></Checkbox>
                            <label htmlFor="status">{t('status.active')}</label>
                        </div>
                    </div>
                </div>
            </Dialog>

        );
    } else {
        return <></>
    }
};

GroupDetail = forwardRef(GroupDetail);

export default GroupDetail;

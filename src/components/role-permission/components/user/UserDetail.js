import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';


import classNames from 'classnames';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";

import _ from "lodash";
import CommonFunction from '@lib/common';
import { AccountApi } from "services/AccountApi";
import CertificateTable from "./CertificateTable";
import CertificateApi from "services/CertificateService";
import UserApi from "services/UserService";
import Enumeration from '@lib/enum';
import { XLayout, XLayout_Center, XLayout_Title } from '@ui-lib/x-layout/XLayout';
import { CalendarN } from 'components/calendar/CalendarN';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';

function UserDetail(props, ref) {
    const { afterSubmit } = props;
    const t = CommonFunction.t;

    // default validate object
    let emptyUser = {
        birthDate: null,
        username: "",
        password: "",
        re_password: "",
        email: "",
        signatureText: "",
        firstName: "",
        lastName: "",
        middleName: "",
        status: true,
        activeCert: false,
        certs: []
    };

    // default validate object
    let emptyValidate = {
        email: null,
        firstName: null,
        lastName: null,
        password: null,
        re_password: null
    };

    const refEditMode = useRef(null);

    const [show, setShow] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [userValidate, setUserValidate] = useState(emptyValidate);

    const refAgentTable = useRef();
    const refCertificateTable = useRef();

    /**
     * bind categories from master form
     */
    useEffect(() => {
    }, []);

    useImperativeHandle(ref, () => ({
        /**
         * add org
         */
        create: (_user) => {
            create(_user);
        },
        /**
         * edit org
         */
        update: (_user) => {
            update(_user);
        }
    }));

    /**
     * create
     */
    const create = (_user) => {
        refEditMode.current = Enumeration.crud.create;
        let newUser = {
            ...emptyUser,
            ..._user
        };
        newUser.companyId = localStorage.getItem("cid");
        setUser(newUser);
        setUserValidate(emptyValidate);
        setShow(true);
    }

    /**
     * update
     */
    const update = (_user) => {
        refEditMode.current = Enumeration.crud.update;
        setUser(_user);
        setUserValidate(emptyValidate);
        setShow(true);
    }

    /**
     * rebinding user
     * @param {Array} arr
     */
    const rebindUser = async (arr) => {
        return await Promise.all(arr.map(async (obj) => {
            const certs = await CertificateApi.getByUser({ id: obj.id, companyId: props.companyId });
            const index = CommonFunction.findArrayIndex(certs, 'status', 1)[0];
            return {
                ...obj,
                certs: certs,
                activeCert: index > -1 ? true : false
            };
        }));
    };

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const checkEmail = async (val) => {
        let valid = true, message = "";

        if (val) {
            // check email pattern
            if (!(/.+\@.+\..+/gm.test(val))) {
                valid = false;
                message = t("user.validate.email-wrong-pattern");
            }

            // check email exist or not
            if (valid) {
                let _res = await UserApi.getByUsername(val);
                if (_res) {
                    if (refEditMode.current === Enumeration.crud.create && _res.id) {
                        valid = false;
                        message = t("user.validate.email-exist");
                    } else if (refEditMode.current !== Enumeration.update && _res.id !== user.id) {
                        valid = false;
                        message = t("user.validate.email-exist");
                    }
                }
            }
        }

        setUserValidate({ ...userValidate, email: message });
        return [valid, message];
    }
    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        let _user = { ...user, [prop]: (val || null) };
        setUser(_user);
        performValidate([prop], _user);
    };

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (props, user) => {
        let result = { ...userValidate }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case "email":
                    result[prop] = user.email && user.email.length > 0 ? null : `${t('user.email')} ${t('message.cant-be-empty')}`;
                    break;
                case "firstName":
                    result[prop] = user.firstName && user.firstName.length > 0 ? null : `${t('user.first-name')} ${t('message.cant-be-empty')}`;
                    break;
                case "lastName":
                    result[prop] = user.lastName && user.lastName.length > 0 ? null : `${t('user.last-name')} ${t('message.cant-be-empty')}`;
                    break;
                case "password":
                    result[prop] = user.password && user.password.length > 0 ? null : `${t('user.password')} ${t('message.cant-be-empty')}`;
                    break;
                case "re_password":
                    if (user.re_password.trim().length === 0) {
                        result[prop] = `${t('user.re_password')} ${t('message.cant-be-empty')}`;
                    } else {
                        result[prop] = user.password === user.re_password ? null : `${t('user.password')} ${t('user.validate.re-password-wrong')}`;
                    }
                    break;
                default:
                    break;
            }
        });

        // set state
        setUserValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    /**
     * submit workflow
     */
    const submit = async () => {
        // validate
        let isValid = performValidate([], user);

        if (isValid) {
            try {
                let _user = _.cloneDeep(user);
                let res = null;
                switch (refEditMode.current) {
                    case Enumeration.crud.create:
                        res = await AccountApi.createUser(_user);
                        break;
                    case Enumeration.crud.update:
                        res = await AccountApi.updateUser(_user)
                        break;
                    default:
                        break;
                }

                if (res) {
                    if (afterSubmit && typeof afterSubmit === "function") {
                        afterSubmit(refEditMode.current, res);
                    }
                    CommonFunction.toastSuccess(t("common.save-success"));
                    cancel();
                }
            } catch (e) {
                CommonFunction.toastError(e);
            }
        }
    };

    /**
     * hide window detail
     */
    const cancel = () => {
        setShow(false);
    };

    const createCertificate = () => {
        AccountApi.createCertUser({
            userId: user.id,
            companyId: user.companyId,
            username: user.username,
        }).then(data => {
            setUser({
                ...user,
                activeCert: true,
                certs: data
            })
        }).catch(error => {
            CommonFunction.toastError(error);
        }).finally(() => {
            CommonFunction.toastSuccess(`${t('certificate.create')} ${t('common.success').toLowerCase()}`)
        });
    };

    if (show) {
        return (
            <Dialog
                header={`[${refEditMode.current === Enumeration.create ? t('common.create') : t('common.update')}] ${t("common.user")}`}
                visible={show}
                modal
                className="wd-800-600"
                footer={
                    <>
                        <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={() => cancel()} />
                        {refEditMode.current === Enumeration.crud.update && !user.activeCert && ((user.certs && user.certs.length < 1) || !user.certs) && <Button label={t("certificate.create")} icon="fas fa-signature" className="primary" onClick={createCertificate} />}
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={() => submit(false)} />
                    </>
                }
                onHide={cancel}
            >
                <XLayout>
                    <XLayout_Center>
                        <div className="p-fluid fluid  formgrid grid">
                            <div className="col-12">
                                <XLayout_Title className="p-0">{t("user.title-account-info")}</XLayout_Title>
                            </div>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <InputText id="email" value={user.email}
                                        onChange={(e) => applyChange('email', e.target.value)}
                                        onBlur={(e) => checkEmail(e.target.value)}
                                        disabled={refEditMode.current === Enumeration.crud.update}
                                        className={classNames({ 'p-invalid': userValidate.email })} />
                                    <label htmlFor="email" className="require">{t('user.email')}</label>
                                </span>
                                {userValidate.email && <small className="p-invalid">{userValidate.email}</small>}
                            </div>
                            {refEditMode.current === Enumeration.crud.create && <>
                                <div className="col-6">
                                    <span className="p-float-label">
                                        <Password
                                            id="password" value={user.password}
                                            toggleMask
                                            feedback={true}
                                            onChange={(e) => applyChange('password', e.target.value)}
                                            className={classNames({ 'p-invalid': userValidate.password })}
                                        ></Password>
                                        <label htmlFor="password" className="require">{t('user.password')}</label>
                                    </span>
                                    {userValidate.password && <small className="p-invalid">{userValidate.password}</small>}
                                </div>
                                <div className="col-6">
                                    <span className="p-float-label">
                                        <Password
                                            id="re_password"
                                            value={user.re_password}
                                            toggleMask
                                            feedback={true}
                                            onChange={(e) => applyChange('re_password', e.target.value)}
                                            className={classNames({ 'p-invalid': userValidate.re_password })}
                                        ></Password>
                                        <label htmlFor="re_password" className="require">{t('user.re_password')}</label>
                                        {userValidate.re_password && <small className="p-invalid">{userValidate.re_password}</small>}
                                    </span>
                                </div>
                            </>}
                            <div className="col-12">
                                <div className="p-field-radiobutton my-1">
                                    <Checkbox
                                        inputId="status"
                                        name="category"
                                        onChange={(e) => applyChange('status', e.checked)}
                                        checked={user.status}
                                    />
                                    <label htmlFor="status">{t('status.active')}</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <XLayout_Title className="p-0">{t("user.title-user-info")}</XLayout_Title>
                            </div>
                            <div className="col-4">
                                <span className="p-float-label">
                                    <InputText id="lastName" value={user.lastName}
                                        onChange={(e) => applyChange('lastName', e.target.value)}
                                        className={classNames({ 'p-invalid': userValidate.lastName })} />
                                    <label htmlFor="lastName" className="require">{t('user.last-name')}</label>
                                </span>
                                {userValidate.lastName && <small className="p-invalid">{userValidate.lastName}</small>}
                            </div>

                            <div className="col-4">
                                <span className="p-float-label">
                                    <InputText id="middleName" value={user.middleName}
                                        onChange={(e) => applyChange('middleName', e.target.value)} />
                                    <label htmlFor="middleName">{t('user.middle-name')}</label>
                                </span>
                            </div>

                            <div className="col-4">
                                <span className="p-float-label">
                                    <InputText id="firstName" value={user.firstName}
                                        onChange={(e) => applyChange('firstName', e.target.value)}
                                        className={classNames({ 'p-invalid': userValidate.firstName })} />
                                    <label htmlFor="firstName" className="require">{t('user.first-name')}</label>
                                </span>
                                {userValidate.firstName && <small className="p-invalid">{userValidate.firstName}</small>}
                            </div>

                            <div className="col-4">
                                <XCalendar
                                    value={user.birthDate ? new Date(user.birthDate) : null}
                                    label={t('user.birth-date')}
                                    // showDate={false}
                                    // showTime={true}
                                    // showSecond={true}
                                    onChange={(value) => applyChange('birthDate', value)}
                                ></XCalendar>
                            </div>

                            <div className="col-12">
                                <XLayout_Title className="p-0">{t("user.title-signature")}</XLayout_Title>
                            </div>
                            <div className="col-12">
                                <span className="p-float-label">
                                    <InputText id="signatureText" value={user.signatureText}
                                        onChange={(e) => applyChange('signatureText', e.target.value)}
                                        className={classNames({ 'p-invalid': userValidate.signatureText })} />
                                    <label htmlFor="signatureText">{t('user.signature-text')}</label>
                                </span>
                            </div>


                            {user.certs.length > 0 && <div className="col-12">
                                <CertificateTable ref={refCertificateTable} type="user"
                                    onSubmit={props.onSubmit}
                                    onChange={(e) => applyChange('certs', e)}
                                    certificates={user.certs}
                                />
                            </div>}
                        </div>
                    </XLayout_Center>
                </XLayout>
            </Dialog >
        );
    } else {
        return <></>
    }
};

UserDetail = forwardRef(UserDetail);

export default UserDetail;

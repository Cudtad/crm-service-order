import classNames from 'classnames';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import XErrorPage from '@ui-lib/x-error-page/XErrorPage';
import { REGEX_CODE, REGEX_EMAIL, REGEX_NAME, REGEX_PHONE } from 'features/crm/utils/constants';
import CommonFunction from '@lib/common';
import Enumeration from '@lib/enum';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { CrmDistrictApi } from 'services/CrmDistrictService';
import { CrmProvinceApi } from 'services/CrmProvinceService';
import { CrmAccountUserApi } from 'services/CrmAccountUser';
import { CrmUserAutoComplete as UserAutoComplete } from '../CrmUserAutoComplete';
import XDropdownTree_Crm from '../../../../components/x-dropdown-tree-crm/XDropdownTree_Crm';

/**
 * props
 *      dictionary: {employee_title: []}
 *      organization: []
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function CrmMdEmployeeCreateInfo(props, ref) {
    const { languages, countriesTimeZone, users, countries, employeeContracts, organization, employeesTitle, config, employee, permission, viewOnly } = props;

    const t = CommonFunction.t;

    const emptyDetail = {
        id: null,
        employeeCode: "",
        employeeLastName: "",
        employeeMiddleName: "",
        employeeFirstName: "",
        employeePhone: "",
        employeeEmail: "",
        userId: null,
        organizationId: null,
        employeeTitleId: null,
        employeeContractId: null,
        employeeCountryId: null,
        employeeProvinceId: null,
        employeeDistrictId: null,
        employeePostalCode: "",
        employeeStreet: "",
        employeeCountryTimeZoneId: null,
        employeeLanguageId: null,
    }

    const emptyValidate = {
        employeeCode: null,
        employeeLastName: null,
        employeeMiddleName: null,
        employeeFirstName: null,
        employeePhone: null,
        employeeEmail: null,
        userId: null,
        organizationId: null,
        employeeTitleId: null,
        employeeContractId: null,
        employeeCountryId: null,
        employeeProvinceId: null,
        employeeDistrictId: null,
        // employeePostalCode: null,
        // employeeStreet: null,
        employeeCountryTimeZoneId: null,
        employeeLanguageId: null,
    }

    const [detail, setDetail] = useState(emptyDetail)

    const [readOnly, setReadOnly] = useState(false)

    const [districts, setDistricts] = useState([])

    const [provinces, setProvinces] = useState([])

    const [validate, setValidate] = useState(emptyValidate)

    useEffect(() => {
        initData(employee)
    }, [employee, permission, viewOnly])

    const initData = (val) => {
        if (val && val.id) {
            if (val.userId) {
                CrmAccountUserApi.getById(val.userId).then(user => {
                    if (user) {
                        setDetail({
                            ...emptyDetail,
                            ...val,
                            userId: [user]
                        })
                        setValidate(emptyValidate)
                    } else {
                        setDetail({
                            ...emptyDetail,
                            ...val,
                            userId: null
                        })
                        setValidate(emptyValidate)
                    }
                })
            } else {
                setDetail({
                    ...emptyDetail,
                    ...val,
                    userId: null
                })
                setValidate(emptyValidate)
            }

            if (val.employeeCountryId) {
                loadProvinces(val.employeeCountryId)
            } else {
                setProvinces([])
            }
            if (val.employeeProvinceId) {
                loadDistricts(val.employeeProvinceId)
            } else {
                setDistricts([])
            }

            setReadOnly(!permission?.update || viewOnly)

        } else {
            setDetail(emptyDetail)
            setValidate(emptyValidate)
            setProvinces([])
            setDistricts([])
            setReadOnly(false)
        }
    }

    // const [errors, setErrors] = useState(defaultErrors);

    useImperativeHandle(ref, () => ({
        get: () => {
            let _validate = _.cloneDeep(validate)
            let _detail = _.cloneDeep(detail)

            return {
                validate: performValidate([], _detail),
                detail: _detail
            }
        },
        update: (_employee) => {
            
        },
        reset: () => {
            initData(employee)
        },
    }))

    /**
     * load Districts
     */
    const loadDistricts = (id) => {
        CrmDistrictApi.get({
            provinceId: id
        }).then((res) => {
            if (res) {
                setDistricts(res)
            } else {
                setDistricts([])
            }
        })
    }

    /**
     * load Provinces
     */
    const loadProvinces = (id) => {
        CrmProvinceApi.get({
            countryId: id
        }).then((res) => {
            if (res) {
                setProvinces(res)
            } else {
                setProvinces([])
            }
        })
    }

    /**
     * apply change
     */
    const applyServiceChange = (prop, value) => {
        let _detail = _.cloneDeep(detail);

        _detail[prop] = value;
        switch (prop) {
            case "employeeCountryId":
                _detail["employeeProvinceId"] = null
                _detail["employeeDistrictId"] = null
                break;
            case "employeeProvinceId":
                _detail["employeeDistrictId"] = null
                break;
            case "userId":
                if (value && value[0] && value[0].email && !detail["employeeEmail"]) {
                    _detail["employeeEmail"] = value[0].email
                }
            break;
            default:
                break;
        }
        setDetail(_detail);
        performValidate([prop], _detail)

        if (config.onChange) {
            config.onChange("employee_create_info", prop, value, _detail);
        }
    }

    /**
     * validate
     * @param {*} _detail
     * @param {*} prop
     */
    const performValidate = (prop, _currentDetail) => {

        let result = _.cloneDeep(validate)//, isValid = true
        let _detail = _currentDetail ? _currentDetail : detail
        // validate all props
        if (prop.length === 0) {
            for (const property in result) {
                prop.push(property)
            }
        }

        prop.forEach(p => {

            switch (p) {
                case "employeeCode":
                    result[p] = _detail.employeeCode ? null : `${t('crm.employee.code')} ${t('message.cant-be-empty')}`
                    if (!result[prop] && !REGEX_CODE.test(_detail.employeeCode)) {
                        result[prop] = `${t('crm.employee.code')} ${t('crm.require.code')}`
                    }
                    break;
                case "employeeLastName":
                    result[p] = null
                    if (_detail.employeeLastName && !REGEX_NAME.test(_detail.employeeLastName)) {
                        result[prop] = `${t('crm.employee.last-name')} ${t('crm.require.name')}`
                    }
                    break;
                case "employeeMiddleName":
                    result[p] = null
                    if (_detail.employeeMiddleName && !REGEX_NAME.test(_detail.employeeMiddleName)) {
                        result[prop] = `${t('crm.employee.middle-name')} ${t('crm.require.name')}`
                    }
                    break;
                case "employeeFirstName":
                    result[p] = _detail.employeeFirstName ? null : `${t('crm.employee.first-name')} ${t('message.cant-be-empty')}`
                    if (!result[prop] && !REGEX_NAME.test(_detail.employeeFirstName)) {
                        result[prop] = `${t('crm.employee.first-name')} ${t('crm.require.name')}`
                    }
                    break;
                case "employeePhone":
                    result[prop] = null
                    if (_detail.employeePhone && !REGEX_PHONE.test(_detail.employeePhone)) {
                        result[prop] = `${t('crm.employee.phone')} ${t('crm.require.email')}`
                    }
                    break;
                case "employeeEmail":
                    result[prop] = null
                    if (_detail.employeeEmail && !REGEX_EMAIL.test(_detail.employeeEmail)) {
                        result[prop] = `${t('crm.require.email')}`
                    }

                    break;
                case "organizationId":
                    result[p] = _detail.organizationId ? null : `${t('crm.employee.organization')} ${t('message.cant-be-empty')}`
                    break
                case "employeeTitleId":
                    result[p] = _detail.employeeTitleId ? null : `${t('crm.employee.employee-title')} ${t('message.cant-be-empty')}`
                    break
                default:
                    break;
            }
        });

        setValidate(result)

        // check if object has error
        // for (const property in result) {
        //     if (result[property]) {
        //         isValid = false
        //         break
        //     }
        // }

        return result
    }
    // /**
    //  * render error
    //  * @param {*} prop
    //  */
    // const renderError = (prop) => {
    //     if (errors[prop]) {
    //         return <small className="p-invalid">{errors[prop]}</small>
    //     } else {
    //         return <></>
    //     }
    // }

    const handleChangeCode = (e) => {
        applyServiceChange('employeeCode', e.target.value)
    }

    const handleChangeLastName = (e) => {
        applyServiceChange('employeeLastName', e.target.value)
    }

    const handleChangeMiddleName = (e) => {
        applyServiceChange('employeeMiddleName', e.target.value)
    }

    const handleChangeFirstName = (e) => {
        applyServiceChange('employeeFirstName', e.target.value)
    }

    const handleChangePhone = (e) => {
        applyServiceChange('employeePhone', e.target.value)
    }

    const handleChangeEmail = (e) => {
        applyServiceChange('employeeEmail', e.target.value)
    }

    const handleChangeUserId = (e) => {
        applyServiceChange('userId', e.value)
    }

    const handleChangeOrganization = (e) => {
        applyServiceChange('organizationId', e.value)
    }

    const handleChangeEmployeeTitle = (e) => {
        applyServiceChange('employeeTitleId', e.value)
    }

    const handleChangeEmployeeContract = (e) => {
        applyServiceChange('employeeContractId', e.value)
    }

    const handleChangeCountry = (e) => {
        applyServiceChange('employeeCountryId', e.value)
        loadProvinces(e.value)
    }

    const handleChangeProvince = (e) => {
        applyServiceChange('employeeProvinceId', e.value)
        loadDistricts(e.value)
    }

    const handleChangeDistrict = (e) => {
        applyServiceChange('employeeDistrictId', e.value)
    }

    const handleChangePostalCode = (e) => {
        applyServiceChange('employeePostalCode', e.target.value)
    }

    const handleChangeStreet = (e) => {
        applyServiceChange('employeeStreet', e.target.value)
    }

    const handleChangeCountryTimeZone = (e) => {
        applyServiceChange('employeeCountryTimeZoneId', e.value)
    }

    const handleChangeLanguage = (e) => {
        applyServiceChange('employeeLanguageId', e.value)
    }

    const renderTimeZoneTemplate = (item) => {
        if (item) {
            return <span key={item.id}>{`${item.countryTimeZoneText} - ${item.countryTimeZoneName}`}</span>
        }
        return <>&nbsp;</>
    }

    try {
        let style = config && config.style ? config.style : {};
        let className = config && config.className ? config.className : "";
        return (
            <div className={`grid  formgrid p-fluid fluid  ${className}`} style={style}>
                <div className="col-12">
                    <span className="p-float-label">
                        <InputText
                            id="product-code"
                            value={detail.employeeCode}
                            disabled={readOnly}
                            onChange={handleChangeCode} />
                        <label htmlFor="product-code" className="require">{t('crm.employee.code')}</label>
                    </span>
                     {validate.employeeCode && <small className="p-invalid">{validate.employeeCode}</small>}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <InputText
                            id="product-last-name"
                            value={detail.employeeLastName}
                            disabled={readOnly}
                            onChange={handleChangeLastName} />
                        <label htmlFor="product-last-name" >{t('crm.employee.last-name')}</label>
                    </span>
                    {validate.employeeLastName && <small className="p-invalid">{validate.employeeLastName}</small>}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <InputText
                            id="product-middle-name"
                            value={detail.employeeMiddleName}
                            disabled={readOnly}
                            onChange={handleChangeMiddleName} />
                        <label htmlFor="product-middle-name" >{t('crm.employee.middle-name')}</label>
                    </span>
                    {validate.employeeMiddleName && <small className="p-invalid">{validate.employeeMiddleName}</small>}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <InputText
                            id="product-name"
                            value={detail.employeeFirstName}
                            disabled={readOnly}
                            onChange={handleChangeFirstName} />
                        <label htmlFor="product-name" className="require">{t('crm.employee.first-name')}</label>
                    </span>
                     {validate.employeeFirstName && <small className="p-invalid">{validate.employeeFirstName}</small>}
                </div>
                <div className="col-6">
                    <span className="p-float-label">
                        <InputText
                            id="product-phone"
                            value={detail.employeePhone}
                            disabled={readOnly}
                            onChange={handleChangePhone} />
                        <label htmlFor="product-phone" >{t('crm.employee.phone')}</label>
                    </span>
                    {validate.employeePhone && <small className="p-invalid">{validate.employeePhone}</small>}
                </div>
                <div className="col-6">
                    <span className="p-float-label">
                        <InputText
                            id="product-email"
                            value={detail.employeeEmail}
                            disabled={readOnly}
                            onChange={handleChangeEmail} />
                        <label htmlFor="product-email" >{t('crm.employee.email')}</label>
                    </span>
                    {validate.employeeEmail && <small className="p-invalid">{validate.employeeEmail}</small>}
                </div>


                <div className="col-6">
                    <span className="p-float-label">
                        <UserAutoComplete
                            id="product-user"
                            users={users}
                            value={detail.userId}
                            onChange={handleChangeUserId}
                            disabled={readOnly || detail?.totalUsed}
                        />
                        <label htmlFor="product-user" >{t('crm.employee.user-id')}</label>
                    </span>
                    {/* {validate.userId && <small className="p-invalid">{validate.userId}</small>} */}
                </div>

                <div className="col-6">
                    <span className="p-float-label">
                        <XDropdownTree_Crm
                            value={detail.organizationId}
                            options={organization}
                            optionLabel="OrganizationName"
                            optionValue="id"
                            treeConfig={{
                                idProp: "id",
                                parentIdProp: "parentOrganizationId"
                            }}
                            filter
                            filterBy="OrganizationName"
                            onChange={handleChangeOrganization}
                            disabled={readOnly}
                        />
                        <label className="require">{t("crm.employee.organization")}</label>
                    </span>
                    {validate.organizationId && <small className="p-invalid">{validate.organizationId}</small>}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={employeesTitle}
                            optionLabel="employeeTitleName"
                            optionValue="id"
                            filter
                            filterBy="employeeTitleName"
                            value={detail.employeeTitleId}
                            // className={classNames({ "p-invalid": errors.employeeTitleId })}
                            onChange={handleChangeEmployeeTitle}
                            disabled={readOnly}
                        ></Dropdown>
                        <label className="require">{t("crm.employee.employee-title")}</label>
                    </span>
                     {validate.employeeTitleId && <small className="p-invalid">{validate.employeeTitleId}</small>}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={employeeContracts}
                            optionLabel="employeeContractName"
                            optionValue="id"
                            filter
                            filterBy="employeeContractName"
                            value={detail.employeeContractId}
                            onChange={handleChangeEmployeeContract}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.employee-contract")}</label>
                    </span>
                    {/* {validate.employeeContractId && <small className="p-invalid">{validate.employeeContractId}</small>} */}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={countries}
                            optionLabel="countryName"
                            optionValue="id"
                            filter
                            filterBy="countryName"
                            value={detail.employeeCountryId}
                            onChange={handleChangeCountry}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.country")}</label>
                    </span>
                    {/* {validate.employeeCountryId && <small className="p-invalid">{validate.employeeCountryId}</small>} */}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={provinces}
                            optionLabel="provinceName"
                            optionValue="id"
                            filter
                            filterBy="provinceName"
                            value={detail.employeeProvinceId}
                            onChange={handleChangeProvince}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.province")}</label>
                    </span>
                    {/* {validate.employeeProvinceId && <small className="p-invalid">{validate.employeeProvinceId}</small>} */}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={districts}
                            optionLabel="districtName"
                            optionValue="id"
                            filter
                            filterBy="districtName"
                            value={detail.employeeDistrictId}
                            onChange={handleChangeDistrict}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.district")}</label>
                    </span>
                    {/* {validate.employeeDistrictId && <small className="p-invalid">{validate.employeeDistrictId}</small>} */}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <InputText
                            id="product-postal-code"
                            value={detail.employeePostalCode}
                            disabled={readOnly}
                            onChange={handleChangePostalCode} />
                        <label htmlFor="product-postal-code">{t('crm.employee.postal-code')}</label>
                    </span>
                    {/* {validate.employeePostalCode && <small className="p-invalid">{validate.employeePostalCode}</small>} */}
                </div>
                <div className="col-4">
                    <span className="p-float-label">
                        <InputText
                            id="product-street"
                            value={detail.employeeStreet}
                            disabled={readOnly}
                            onChange={handleChangeStreet} />
                        <label htmlFor="product-street">{t('crm.employee.street')}</label>
                    </span>
                    {/* {/* {validate.employeeStreet && <small className="p-invalid">{validate.employeeStreet}</small>} */}
                </div>

                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={countriesTimeZone}
                            optionLabel="countryTimeZoneName"
                            optionValue="id"
                            itemTemplate={renderTimeZoneTemplate}
                            valueTemplate={renderTimeZoneTemplate}
                            filter
                            filterBy="countryTimeZoneName"
                            value={detail.employeeCountryTimeZoneId}
                            onChange={handleChangeCountryTimeZone}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.country-time-zone")}</label>
                    </span>
                    {/* {/* {validate.employeeCountryTimeZoneId && <small className="p-invalid">{validate.employeeCountryTimeZoneId}</small>} */}
                </div>

                <div className="col-4">
                    <span className="p-float-label">
                        <Dropdown
                            options={languages}
                            optionLabel="languageName"
                            optionValue="id"
                            filter
                            filterBy="languageName"
                            value={detail.employeeLanguageId}
                            onChange={handleChangeLanguage}
                            disabled={readOnly}
                        ></Dropdown>
                        <label>{t("crm.employee.language")}</label>
                    </span>
                    {/* {/* {validate.employeeLanguageId && <small className="p-invalid">{validate.employeeLanguageId}</small>} */}
                </div>


            </div>
        );
    } catch (error) {
        return <XErrorPage error={error}></XErrorPage>
    }

};

CrmMdEmployeeCreateInfo = forwardRef(CrmMdEmployeeCreateInfo);

export default CrmMdEmployeeCreateInfo;

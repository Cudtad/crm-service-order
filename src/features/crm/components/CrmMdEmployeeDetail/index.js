/* eslint-disable react/jsx-pascal-case */
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import XAvatarSelector from "components/x-avatar-delete/XAvatarSelector";
import XErrorPage from '@ui-lib/x-error-page/XErrorPage';
import { XLayout_Row } from '@ui-lib/x-layout/XLayout';
import CommonFunction from '@lib/common';
import Enumeration from '@lib/enum';
import _ from "lodash";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { CrmCountryApi } from "services/CrmCountryService";
import { CrmCountryTimeZoneApi } from "services/CrmCountryTimeZoneService";
import { CrmEmployeeContractApi } from "services/CrmEmployeeContractService";
import { CrmEmployeeApi } from "services/CrmEmployeeService";
import { CrmEmployeeTitleApi } from "services/CrmEmployeeTitleService";
import { CrmLanguageApi } from "services/CrmLanguageService";
import { CrmOrganizationApi } from "services/CrmOrganizationService";
import { CrmAccountUserApi } from "services/CrmAccountUser";
// import DictionaryApi from "services/DictionaryService";
// import { HcmEmployeeApi } from "services/hcm/HcmEmployeeService";
// import { HcmOrganizationApi } from "services/hcm/HcmOrganizationService";

import CrmMdEmployeeCreateInfo from "../CrmMdEmployeeCreateInfo";
import "./styles.scss"
import XPerson_Detail_Crm from '../../../../components/x-person-crm/XPerson_Detail_Crm';

/**
 * props
 *      dialog: true, // use dialog or not, default true
 *      createConfig: { modules: ["person"], modulesDefinition: { person: {renderer: () => {}, title: "", icon: "" } } } // config for create
 *      updateConfig: { modules: ["person"], modulesDefinition: { person: {renderer: () => {}, title: "", icon: "" } } } // config for update
 *      afterSubmit: (mode, group) => {} // function after submit on default submit function
 *      afterCancelCreate: () => {} // function after cancel create
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function CrmMdEmployeeDetail(props, ref) {
    const { afterCancelCreate, afterSubmit, permission, permissionAdmin } = props

    const t = CommonFunction.t;
    const refDetail = useRef(null)
    const refDetail_EmployeeInfo = useRef(null)
    const [dictionary, setDictionary] = useState({})
    const [organization, setOrganization] = useState([])
    const refDataChanged = useRef(false)
    const refXAvatarSelector = useRef(null)
    const [employee, setEmployee] = useState(null)

    const [employeesTitle, setEmployeesTitle] = useState([])

    const [employeeContracts, setEmployeeContracts] = useState([])

    const [countries, setCountries] = useState([])

    const [languages, setLanguages] = useState([])

    const [countriesTimeZone, setCountriesTimeZone] = useState([])

    const [users, setUsers] = useState([])

    const [isAdmin, setIsAdmin] = useState(false)

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: () => {
            refDataChanged.current = false
            refDetail.current.create()
            setIsAdmin(false)
        },

        /**
         * update
         */
        update: (_employee) => {
            refDataChanged.current = false
            setEmployee(_employee)
            setIsAdmin(_employee.isAdmin == 1)
            refDetail.current.update(_employee)
        },

        /**
         * delete
         * @param {*} _group
         */
        delete: (id) => { },

        /**
         * check data changed
         * @returns
         */
        checkChange: () => {
            return refDataChanged.current
        },

        reset: () => {
            refDetail_EmployeeInfo.current.reset()
        },

        hide: () => {
            refDetail.current.hide()
        }
    }));

    useEffect(() => {
        loadOrganization()
        loadEmployeesTitle()
        loadEmployeeContracts()
        loadCountries()
        loadTimeZone()
        loadLanguages()
        loadUsers()
    }, [])

    /**
     * load organization
     */
    const loadOrganization = () => {
        CrmOrganizationApi.getAll({
            status: 1
        }).then((res) => {
            if (res) {
                setOrganization(res)
            } else {
                setOrganization([])
            }
        })
    }

    /**
     * load employee title
     */
    const loadEmployeesTitle = () => {
        CrmEmployeeTitleApi.get().then((res) => {
            if (res) {
                setEmployeesTitle(res)
            } else {
                setEmployeesTitle([])
            }
        })
    }

    /**
     * load employee contract
     */
    const loadEmployeeContracts = () => {
        CrmEmployeeContractApi.get().then((res) => {
            if (res) {
                setEmployeeContracts(res)
            } else {
                setEmployeeContracts([])
            }
        })
    }

    /**
     * load employee contract
     */
    const loadCountries = () => {
        CrmCountryApi.get().then((res) => {
            if (res) {
                setCountries(res)
            } else {
                setCountries([])
            }
        })
    }

    /**
     * load employee contract
     */
    const loadTimeZone = () => {
        CrmCountryTimeZoneApi.get().then((res) => {
            if (res) {
                setCountriesTimeZone(res)
            } else {
                setCountriesTimeZone([])
            }
        })
    }

    /**
     * load employee contract
     */
    const loadLanguages = () => {
        CrmLanguageApi.get().then((res) => {
            if (res) {
                setLanguages(res)
            } else {
                setLanguages([])
            }
        })
    }

    /**
     * load employee contract
     */
    const loadUsers = () => {
        CrmAccountUserApi.get({
            size: 99999
        }).then((res) => {
            if (res && res.content) {
                setUsers(res.content)
            } else {
                setUsers([])
            }
        })
    }

    /**
     * on components change data
     */
    const onChange = (component, prop, value, employee) => {
        // mark data has changed
        if (!refDataChanged.current) refDataChanged.current = true;
    };

    /**
     * submit
     * @param {*} _employee person from xperson_detail
     */
    const submit = (mode) => {
        // get result from compnents
        let _employeeResult = refDetail_EmployeeInfo.current.get();

        // combine errors
        let _errorFlg = false
        Object.entries(_employeeResult.validate).forEach(([key, value]) => {
            if (value) {
                _errorFlg = true
            }
        })
        if (_errorFlg) {

        } else {
            const userId = _employeeResult.detail.userId && _employeeResult.detail.userId.length ? _employeeResult.detail.userId[0].id : null
            const username = _employeeResult.detail.userId && _employeeResult.detail.userId.length ? _employeeResult.detail.userId[0].username : null
            if (mode == Enumeration.crud.create) {
                CrmEmployeeApi.create({
                    ..._employeeResult.detail,
                    userId,
                    username,
                    isAdmin: isAdmin ? 1 : 0
                }).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.save-success"))
                        if (afterSubmit) {
                            afterSubmit(mode, res)
                        }
                        refDataChanged.current = false
                        setEmployee(res)
                    }

                })

            } else {
                CrmEmployeeApi.update({
                    ..._employeeResult.detail,
                    userId,
                    username,
                    isAdmin: isAdmin ? 1 : 0
                }, _employeeResult.detail.id).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.save-success"))
                        if (afterSubmit) {
                            afterSubmit(mode, res);
                        }
                        // refDataChanged.current = false
                        setEmployee(res)
                    }
                })
            }
        }
    };

    /**
     * active
     */
    const handleActive = () => {
        let _employeeResult = refDetail_EmployeeInfo.current.get()

        if (_employeeResult.detail.isActive) {
            if (!employee?.totalUsed) {
                changeActive(_employeeResult.detail.id)
            } else {
                CommonFunction.toastError(t("crm.employee.close-false-in-use"))
            }
        } else {
            changeActive(_employeeResult.detail.id)
        }
    }

    const changeActive = (id) => {
        CrmEmployeeApi.updateActive(id).then(res => {
            if (res) {
                CommonFunction.toastSuccess(t("common.save-success"))
                if (afterSubmit) {
                    afterSubmit(Enumeration.crud.update, res);
                }
                setEmployee(res)
            }
            refDataChanged.current = false
        })
    }

    /**
     * delete
     */
    const handleDelete = () => {

        CommonFunction.showConfirm(`${t("crm.employee.delete-confirm").replace(`{0}`, `${employee.employeeLastName ? `${employee.employeeLastName} ` : ``}${employee.employeeMiddleName ? `${employee.employeeMiddleName} ` : ``}${employee.employeeFirstName ? `${employee.employeeFirstName}` : ``}`)}`, t("button.confirm"),
            () => {
                let _employeeResult = refDetail_EmployeeInfo.current.get()
                if (!employee?.totalUsed) {
                    CrmEmployeeApi.delete(_employeeResult.detail.id).then(res => {
                        if (res) {
                            CommonFunction.toastSuccess(t("common.save-success"))
                            if (afterSubmit) {
                                afterSubmit(Enumeration.crud.delete, null);
                            }
                            refDetail.current.hide()
                        }
                        refDataChanged.current = false
                    })
                } else {
                    CommonFunction.toastError(t("crm.employee.delete-false-in-use"))
                }
            })
    }


    /**
     * permission
     */
    const handlePermission = (val) => {
        setIsAdmin(val)
    }


    /**
     * render global info
     * @param {*} _employee
     */
    const renderGlobalInfo = () => {
        if (employee) {
            let _empPosition = [employee.employeeTitleName, employee.employeeContractName].filter((f) => f).join(" - ");
            return (
                <div className="employee-global-detail">
                    <XAvatar
                        className="employee-avatar"
                        avatar={CommonFunction.getImageUrl(employee.employeeAvatarId, `${employee.employeeLastName ? `${employee.employeeLastName} ` : ``}${employee.employeeMiddleName ? `${employee.employeeMiddleName} ` : ``}${employee.employeeFirstName ? `${employee.employeeFirstName}` : ``}`, 42, 42)}
                        name={`${employee.employeeLastName ? `${employee.employeeLastName} ` : ``}${employee.employeeMiddleName ? `${employee.employeeMiddleName} ` : ``}${employee.employeeFirstName ? `${employee.employeeFirstName}` : ``}`}
                        size="42px"
                    />
                    <div className="avatar-selection" onClick={onChangeAvatar}>
                        <span className="bx bxs-camera"></span>
                    </div>
                    <div className="employee-col">
                        <XLayout_Row>
                            <span className="employee-name">{`${employee.employeeLastName ? `${employee.employeeLastName} ` : ``}${employee.employeeMiddleName ? `${employee.employeeMiddleName} ` : ``}${employee.employeeFirstName ? `${employee.employeeFirstName}` : ``}`}</span>
                            <span className="employee-number">({employee.employeeCode})</span>
                        </XLayout_Row>
                        <XLayout_Row>
                            <span className="employee-position">{_empPosition}</span>
                        </XLayout_Row>
                    </div>
                </div>
            );
        } else {
            return <></>;
        }
    };

    /**
     * on submit
     */
    const onSubmit = (_module, res) => {
        refDataChanged.current = false;
        switch (_module) {
            case "personal_info":
                submit(Enumeration.crud.update)
                break;
            default:
                break;
        }
    };

    /**
     * on active
     */
    const onActive = (_module, res) => {
        refDataChanged.current = false;
        switch (_module) {
            case "personal_info":
                handleActive()
                break;
            default:
                break;
        }
    };

    /**
     * on delete
     */
    const onDelete = (_module, res) => {
        refDataChanged.current = false;
        switch (_module) {
            case "personal_info":
                handleDelete(Enumeration.crud.delete)
                break;
            default:
                break;
        }
    };

    /**
     * on Permission
     */
    const onPermission = (_module, res, val) => {
        refDataChanged.current = false;
        switch (_module) {
            case "personal_info":
                handlePermission(val)
                break;
            default:
                break;
        }
    };

    /**
     * renderer employee info
     * @param {*} _employee
     * @returns
     */
    const renderer_EmployeeInfo = (_employee) => {
        return (
            <CrmMdEmployeeCreateInfo
                ref={refDetail_EmployeeInfo}
                dictionary={dictionary}
                organization={organization}
                employeesTitle={employeesTitle}
                employeeContracts={employeeContracts}
                countries={countries}
                languages={languages}
                countriesTimeZone={countriesTimeZone}
                users={users}
                employee={_employee}
                permission={permission}
                viewOnly={!employee?.isActive}
                config={{
                    onChange: onChange,
                    style: { maxWidth: "100%" },
                }}
            ></CrmMdEmployeeCreateInfo>
        );
    };

    /**
     * after submit avatar
     * @param {*} avatarId
     */
    const afterSubmitAvatar = (avatarId) => {

        if (avatarId) {
            CrmEmployeeApi.updateAvatar({ avatarId }, employee.id).then((res) => {
                if (res) {
                    let _employee = _.cloneDeep(employee)
                    _employee.employeeAvatarId = avatarId
                    setEmployee(_employee)
                    if (afterSubmit) {
                        afterSubmit(Enumeration.crud.update, res)
                    }
                    CommonFunction.toastSuccess(t("common.save-success"))
                }
            })
        }
    }

    const onChangeAvatar = () => {
        refXAvatarSelector.current.change('crm-service', 'employee', employee.id, employee.employeeAvatarId)
    }

    try {
        return (
            <>
                <XPerson_Detail_Crm
                    ref={refDetail}
                    createConfig={{
                        modules: ["employee"],
                        modulesDefinition: {
                            // person: {
                            //     config: {
                            //         onChange: onChange,
                            //         style: { maxWidth: "100%" },
                            //     },
                            // },

                            employee: {
                                title: t("crm.employee.employee-info"),
                                renderer: () => (
                                    <CrmMdEmployeeCreateInfo
                                        ref={refDetail_EmployeeInfo}
                                        dictionary={dictionary}
                                        organization={organization}
                                        employeesTitle={employeesTitle}
                                        employeeContracts={employeeContracts}
                                        countries={countries}
                                        languages={languages}
                                        countriesTimeZone={countriesTimeZone}
                                        users={users}
                                        permission={permission}
                                        viewOnly={!employee?.isActive}
                                        config={{
                                            onChange: onChange,
                                            style: { maxWidth: "100%" },
                                        }}
                                    ></CrmMdEmployeeCreateInfo>
                                ),
                            },
                        },
                    }}
                    updateConfig={{
                        globalInfo: renderGlobalInfo,
                        modules: [
                            !permission ? null : "personal_info"
                        ],
                        modulesDefinition: {
                            personal_info: {
                                title: t("crm.employee.employee-info"),
                                renderer: renderer_EmployeeInfo,
                                config: {
                                    onChange: onChange,
                                    onSubmit: onSubmit,
                                    onActive: onActive,
                                    onDelete: onDelete,
                                    onPermission: onPermission,
                                    permission: permission,
                                    permissionAdmin: permissionAdmin,
                                    isActive: employee?.isActive,
                                    isAdmin: isAdmin
                                }
                            },
                        },
                    }}
                    afterCancelCreate={afterCancelCreate}
                    onSubmit={submit}
                ></XPerson_Detail_Crm>
                {/*x-person-detail-tabs*/}
                <XAvatarSelector ref={refXAvatarSelector} afterSubmit={afterSubmitAvatar} />
            </>);
    } catch (error) {
        return <XErrorPage error={error}></XErrorPage>;
    }
}

CrmMdEmployeeDetail = forwardRef(CrmMdEmployeeDetail);

export default CrmMdEmployeeDetail;

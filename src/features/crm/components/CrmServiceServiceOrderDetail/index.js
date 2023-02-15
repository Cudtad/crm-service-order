import { XLayout, XLayout_Center, XLayout_Top } from "@ui-lib/x-layout/XLayout";
import CommonFunction from "@lib/common";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import _ from "lodash";
import "./styles.scss";

import { CrmAccountTypeApi } from "services/crm/CrmAccountTypeService";
import { CrmDocumentTypeApi } from "services/crm/CrmDocumentTypeService";
import { CrmAccountApi } from "services/crm/CrmAccountService";
import { CrmEmployeeApi } from "services/CrmEmployeeService";
import { useNavigate } from "react-router-dom";
import { UserAutoComplete } from "../UserAutoComplete";
import { Dropdown } from "primereact/dropdown";
import { XCalendar } from "@ui-lib/x-calendar/XCalendar";
import { InputTextarea } from "primereact/inputtextarea";
import CrmFieldPreviewValue from "../CrmFieldPreviewValue";
import moment from "moment";
import { formatNum, makeRandomId } from "../../utils";
import CrmConfirmDialog from "../../components/CrmConfirmDialog";
import {
    MODE,
    REGEX_NAME,
    REGEX_NAME_SPECIAL,
    REGEX_PHONE,
    REGEX_ACCOUNT_NAME,
} from "../../utils/constants";
import CrmPanel from "../CrmPanel";
import CrmFieldEdittingValue from "../CrmFieldEdittingValue";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { CrmSaleLeadStageApi } from "services/crm/CrmSaleLeadStageService";
import { CrmAccountContactApi } from "services/crm/CrmAccountContactService";
import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import { CrmMdCurrencyExchangeRateApi } from "services/crm/CrmCurrencyExchangeRateService";
import { CrmAccountRelationTypeApi } from "services/crm/CrmAccountRelationTypeService";
import { CrmContactApi } from "services/crm/CrmContactService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
function CrmServiceServiceOderDetail(props, ref) {
    const t = CommonFunction.t;

    const {
        employeeId,
        leadStageId,
        setLoading,
        className,
        readOnly,
        cancel,
        reload,
        data,
        permission,
        setPreview,
        preview,
    } = props;

    const emptyDetail = {
        accountId: null,
        serviceOrderName: "",
        currencyExchangeRateId: null,
        closeDate: null,
        serviceOrderStageId: null,
        serviceOrderNote: "",
    };

    const emptyValidate = {
        accountId: null,
        serviceOrderName: null,
        currencyExchangeRateId: null,
        serviceOrderStageId: null,
        closeDate: null,

        // leadStageId: null,
        ownerEmployeeId: null,
    };

    const emptyAccountDetail = {
        id: null,
        accountName: "",
        accountTypeId: null,
        accountPhone: "",
        accountEmail: "",
    };

    const emptyAccountValidate = {
        accountName: null,
        accountTypeId: null,
        accountPhone: null,
    };

    const emptyContactDetail = {
        id: null,
        contactName: "",
        contactPhone: "",
        contactTitle: "",
        accountRelationTypeId: null,
    };

    const emptyContactValidate = {
        contactName: null,
        contactPhone: null,
        accountRelationTypeId: null,
    };

    const emptyItem = [
        {
            index: 1,
            rowIndex: "0",
            id: null,
            serial: "398RKHSJDG",
            name: "Điện thoại Iphone 14 ProMax 512GB - Hàng chính hãng",
            code: "82735NSDBS",
            startDate: "12/12/2022",
            endDate: "12/12/2024",
            timeDate: "2 năm",
            endDateCompany: "12/12/2023",
            timeDateCompany: "1 năm",
            stage: "Còn hạn",
        },
        {
            index: 2,
            rowIndex: "0",
            id: null,
            serial: "836JHGCS",
            name: "Tai nghe Airpod 2 - Hàng chính hãng",
            code: "82735NSDBS",
            startDate: "12/12/2021",
            endDate: "12/12/2022",
            timeDate: "1 năm",
            endDateCompany: "12/12/2022",
            timeDateCompany: "1 năm",
            stage: "Hết hạn",
        },
        {
            index: 3,
            rowIndex: "0",
            id: null,
            serial: "4872637HSD",
            name: "Iphone 12 64GB ",
            code: "",
            startDate: "",
            endDate: "",
            timeDate: "",
            endDateCompany: "",
            timeDateCompany: "",
            stage: "Chưa bảo hành",
        },
    ];

    const [detail, setDetail] = useState(emptyDetail);

    const [validate, setValidate] = useState(emptyValidate);

    const [detailAccount, setDetailAccount] = useState(emptyAccountDetail);

    const [accountValidate, setAccountValidate] =
        useState(emptyAccountValidate);

    const [detailContact, setDetailContact] = useState(emptyContactDetail);

    const [contactValidate, setContactValidate] =
        useState(emptyContactValidate);

    const [accountTypes, setAccountTypes] = useState([]);

    const [accounts, setAccounts] = useState([]);

    const [contacts, setContacts] = useState([]);

    const [items, setItems] = useState(emptyItem);

    const [isAccountCreate, setIsAccountCreate] = useState(false);

    const [isContactCreate, setIsContactCreate] = useState(false);

    const [currencyExchangeRates, setCurrencyExchangeRates] = useState([]);

    const [serviceOrderStage, setServiceOderStage] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [documentType, setDocumentType] = useState([]);

    const [relatedTypes, setRelatedTypes] = useState([]);

    const [contactAll, setContactAll] = useState([]);

    const [showContact, setShowContact] = useState(false);

    const [mode, setMode] = useState(MODE.CREATE);

    const history = useNavigate();

    useImperativeHandle(ref, () => ({
        submitProject: () => {
            submitProject();
        },
    }));

    /**
     * onetime
     */
    useEffect(() => {
        loadAccountTypes();
        loadAccounts();
        loadEmployees();
        loadCurrencyExchangeRates();
        loadServiceOrderStage();
        loadRelatedTypes();
        loadContactAll();
        loadItems();
    }, []);
    /**
     * many times
     */

    const loadServiceOrderStage = () => {
        CrmServiceServiceOrderStageApi.get().then((res) => {
            if (res) {
                setServiceOderStage(res);
            }
        });
    };

    const loadContactAll = (id) => {
        CrmContactApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                let _contactAll = [];
                res.map((o) => {
                    _contactAll.push({
                        id: o.id,
                        fullName: o.contactName ? o.contactName : ``,
                    });
                });
                setContactAll(_contactAll);
            } else {
                setContactAll([]);
            }
        });
    };

    const loadRelatedTypes = () => {
        CrmAccountRelationTypeApi.get().then((res) => {
            if (res) {
                setRelatedTypes(res);
            } else {
                setRelatedTypes([]);
            }
        });
    };

    const loadDocumentType = (id) => {
        CrmDocumentTypeApi.get(id).then((res) => {
            if (res) {
                setDocumentType(res);
            }
        });
    };

    const loadItems = () => {
        // CrmServiceServiceOrderMaterialApi.getItems(serviceOrderId).then(res => {
        //     if (res) {
        //         setItems(res.map((o, i)=> ({
        //             ...o,
        //             discountPerMaterial: (o.discountPerMaterial ?? 0) * 100,
        //             vatPerMaterial: (o.vatPerMaterial ?? 0) * 100,
        //             materialUnitName: o.materialUnitName ?? "",
        //             warehouse: o.warehouse ?? "",
        //             materialStock: o.materialStock ?? 0,
        //             rowIndex: makeRandomId(5),
        //             index: i + 1
        //         })))
        //     } else {
        //         setItems([{
        //             ...emptyItem,
        //             rowIndex: makeRandomId(5)
        //         }])
        //     }
        // })
        // setItems([
        //     {
        //         ...emptyItem,
        //         rowIndex: makeRandomId(5),
        //     },
        // ]);
    };

    const loadCurrencyExchangeRates = () => {
        CrmMdCurrencyExchangeRateApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                setCurrencyExchangeRates(res);
            } else {
                setCurrencyExchangeRates([]);
            }
        });
    };

    const submitProject = async () => {
        let isValid = performValidate([]);
        let isValidAccount = performAccountValidate([]);
        let isValidContact = performContactValidate([]);
        if (isValid && isValidAccount && isValidContact) {
            let _service = { ...detail, ...detailAccount, ...detailContact };
            let _mode = _.cloneDeep(mode);
            if (_mode !== MODE.UPDATE && _service.id && _service.id > 0) {
                _mode = MODE.UPDATE;
                setMode(MODE.UPDATE);
            }

            try {
                switch (_mode) {
                    case MODE.CREATE:
                        setLoading(true);
                        await CrmServiceServiceOrderApi.create({
                            ..._service,
                            accountId: _service.accountId?.[0]?.id,
                            contactId: _service.contactId?.[0]?.id,
                            ownerEmployeeId: _service.ownerEmployeeId[0].id,
                        })
                            .then((_data) => {
                                if (_data) {
                                    if (reload) {
                                        reload();
                                    }

                                    if (setPreview) {
                                        setPreview(true);
                                    }

                                    if (cancel) {
                                        cancel();
                                    }
                                    CommonFunction.toastSuccess(
                                        t("common.save-success")
                                    );
                                }
                                setLoading(false);
                            })
                            .catch((error) => {
                                CommonFunction.toastError(error);
                                setLoading(false);
                            });
                        break;
                    case MODE.UPDATE:
                        setLoading(true);
                        await CrmServiceServiceOrderApi.update(
                            {
                                ..._service,
                                accountId: _service.accountId[0].id,
                                ownerEmployeeId: _service.ownerEmployeeId[0].id,
                                contactId: _service.contactId?.[0]?.id,
                            },
                            _service.id
                        )
                            .then((_data) => {
                                if (_data) {
                                    if (reload) {
                                        reload();
                                    }

                                    if (setPreview) {
                                        setPreview(true);
                                    }

                                    if (cancel) {
                                        cancel();
                                    }
                                    CommonFunction.toastSuccess(
                                        t("common.save-success")
                                    );
                                }
                                setLoading(false);
                            })
                            .catch((error) => {
                                CommonFunction.toastError(error);
                                setLoading(false);
                            });
                        break;
                    default:
                        break;
                }
            } catch (error) {}
        }
    };
    /**
     * load requests created by user
     */

    /**
     * load Account type
     */
    const loadAccountTypes = () => {
        CrmAccountTypeApi.get().then((res) => {
            if (res) {
                setAccountTypes(res);
            } else {
                setAccountTypes([]);
            }
        });
    };

    /**
     * load all Account
     */
    const loadAccounts = () => {
        CrmAccountApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                let _accountAll = [];
                res.map((o) => {
                    _accountAll.push({
                        id: o.id,
                        fullName: o.accountName ? o.accountName : "",
                    });
                });
                setAccounts(_accountAll);
            } else {
                setAccounts([]);
            }
        });
    };

    // Dialog end
    const performValidate = (props, _currentDetail) => {
        let result = _.cloneDeep(validate),
            isValid = true;
        let _detail = _currentDetail ? _currentDetail : detail;
        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach((prop) => {
            switch (prop) {
                case "accountId":
                    result[prop] =
                        isAccountCreate ||
                        (!isAccountCreate &&
                            _detail.accountId &&
                            _detail.accountId.length)
                            ? null
                            : `${t("crm-service.account.account")} ${t(
                                  "message.cant-be-empty"
                              )}`;
                    break;

                case "serviceOrderName":
                    result[prop] = _detail.serviceOrderName
                        ? null
                        : `${t("crm-service.require.account.detail.name")} ${t(
                              "message.cant-be-empty"
                          )}`;
                    if (
                        !result[prop] &&
                        !REGEX_NAME_SPECIAL.test(_detail.serviceOrderName)
                    ) {
                        result[prop] = `${t(
                            "crm-service.require.account.detail.name"
                        )} ${t("crm.require.name-special")}`;
                    }
                    break;

                case "currencyExchangeRateId":
                    result[prop] = _detail.currencyExchangeRateId
                        ? null
                        : `${t(
                              "crm-service.service-order.detail.currency-exchange-rate"
                          )} ${t("message.cant-be-empty")}`;
                    break;

                case "ownerEmployeeId":
                    result[prop] =
                        _detail.ownerEmployeeId &&
                        _detail.ownerEmployeeId.length
                            ? null
                            : `${t(
                                  "crm-service.service-order.responsible"
                              )} ${t("message.cant-be-empty")}`;
                    break;

                case "serviceOrderStageId":
                    result[prop] = _detail.serviceOrderStageId
                        ? null
                        : `${t("crm-service.service-order.stage")} ${t(
                              "message.cant-be-empty"
                          )}`;
                    break;
                default:
                    break;
            }
        });

        setValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    const applyServiceChange = async (prop, val) => {
        try {
            let _detailServiceOrder = _.cloneDeep(detail);
            let _detailContact = _.cloneDeep(detailContact);
            let _detailAccount = _.cloneDeep(detailAccount);

            _detailServiceOrder[prop] = val;

            setDetailAccount(_detailAccount);
            setDetailContact(_detailContact);
            setDetail(_detailServiceOrder);
            performValidate([prop], _detailServiceOrder);
        } catch {}
    };

    const performAccountValidate = (props, _currentDetail) => {
        let isValid = true;
        if (isAccountCreate) {
            let result = _.cloneDeep(accountValidate);
            let _detail = _currentDetail ? _currentDetail : detailAccount;
            // validate all props
            if (props.length === 0) {
                for (const property in result) {
                    props.push(property);
                }
            }

            // validate props
            props.forEach((prop) => {
                switch (prop) {
                    case "accountName":
                        result[prop] =
                            _detail.accountName?.length > 0
                                ? null
                                : `${t("crm-service.account.name")} ${t(
                                      "message.cant-be-empty"
                                  )}`;
                        if (
                            !result[prop] &&
                            !REGEX_ACCOUNT_NAME.test(_detail.accountName)
                        ) {
                            result[prop] = `${t(
                                "crm-service.account.name"
                            )} ${t("crm-service.require.account.name")}`;
                        }
                        break;

                    case "accountPhone":
                        result[prop] =
                            _detail.accountPhone?.length > 0
                                ? null
                                : `${t("crm-service.account.phone")} ${t(
                                      "message.cant-be-empty"
                                  )}`;
                        if (
                            !result[prop] &&
                            !REGEX_PHONE.test(_detail.accountPhone)
                        ) {
                            result[prop] = `${t(
                                "crm-service.account.phone"
                            )} ${t("crm.require.phone")}`;
                        }
                        break;

                    case "accountTypeId":
                        result[prop] = _detail.accountTypeId
                            ? null
                            : `${t("crm-service.account.type")} ${t(
                                  "message.cant-be-empty"
                              )}`;
                        break;
                    default:
                        break;
                }
            });

            setAccountValidate(result);

            // check if object has error
            for (const property in result) {
                if (result[property]) {
                    isValid = false;
                    break;
                }
            }
        } else {
            setAccountValidate(emptyAccountValidate);
        }

        return isValid;
    };

    const applyServiceAccountChange = (prop, val) => {
        let _detail = _.cloneDeep(detailAccount);
        let _detailContact = _.cloneDeep(detailContact);
        let _detailServiceOrder = _.cloneDeep(detail);
        switch (prop) {
            case "accountTypeId":
                _detail.documentTypeId = null;
                _detail.documentNumber = "";
                if (val === 1) {
                    setShowContact(false);
                } else {
                    setIsContactCreate(true);
                    setShowContact(true);
                }
                break;
        }
        _detail[prop] = val;
        setDetail(_detailServiceOrder);
        setDetailContact(_detailContact);
        setDetailAccount(_detail);
        performAccountValidate([prop], _detail);
    };

    const handleChangeAccountName = (e) => {
        applyServiceAccountChange("accountName", e.target.value);
    };

    const handleChangeAccountPhone = (e) => {
        applyServiceAccountChange("accountPhone", e.target.value);
    };

    const handleChangeAccountType = (e) => {
        applyServiceAccountChange("accountTypeId", e.value);
        loadDocumentType(e.value);
    };

    const handleChangeDocumentType = (e) => {
        applyServiceAccountChange("documentTypeId", e.value);
    };

    const handleChangeDocumentNumber = (e) => {
        applyServiceAccountChange("documentNumber", e.target.value);
    };

    const handleChangeAccountEmail = (e) => {
        applyServiceAccountChange("accountEmail", e.target.value);
    };

    const handleChangeContact = (e) => {
        applyServiceChange("contactId", e.value);
    };

    const handleChangeCurrencyExchangeRate = (e) => {
        applyServiceChange("currencyExchangeRateId", e.value);
    };

    const handleChangeEmployeeId = (e) => {
        applyServiceChange("ownerEmployeeId", e.value);
    };

    const handleChangeAppointmentLocation = (e) => {
        applyServiceChange("appointmentLocation", e.target.value);
    };

    const handleChangeAppointmentTime = (value) => {
        applyServiceChange("appointmentTime", value);
    };

    const edit = async (data) => {
        let _account = null;
        let employee = null;
        let _contact = null;
        if (data.accountId) {
            _account = await CrmAccountApi.getById(data.accountId);
        }

        if (data.contactId) {
            _contact = await CrmContactApi.getById(data.contactId);
        }

        if (data.ownerEmployeeId) {
            employee = await CrmEmployeeApi.getById(data.ownerEmployeeId);
        }

        setMode(MODE.UPDATE);
        setValidate(emptyValidate);
        setDetailAccount({
            accountTypeId: _account?.accountTypeId,
            accountPhone: _account?.accountPhone,
            accountEmail: _account?.accountEmail,
            documentNumber: _account?.documentNumber,
            documentTypeId: _account?.documentTypeId,
        });

        setDetailContact({
            contactName: _contact?.contactName,
            contactPhone: _contact?.contactPhone,
            contactTitle: _contact?.contactTitle,
            accountRelationTypeId: _contact?.accountRelationTypeId,
        });

        setDetail({
            ...data,
            //---------------------------
            accountId: _account
                ? [
                      {
                          id: _account.id,
                          fullName: _account.accountName,
                      },
                  ]
                : null,
            contactId: _contact
                ? [
                      {
                          id: _contact.id,
                          fullName: _contact.contactName,
                      },
                  ]
                : null,
            ownerEmployeeId: employee
                ? [
                      {
                          id: employee.id,
                          fullName: `${
                              employee.employeeLastName
                                  ? employee.employeeLastName
                                  : ""
                          }${
                              employee.employeeMiddleName
                                  ? ` ${employee.employeeMiddleName}`
                                  : ``
                          }${
                              employee.employeeFirstName
                                  ? ` ${employee.employeeFirstName}`
                                  : ``
                          }`,
                      },
                  ]
                : null,
        });
    };

    const create = () => {
        setDetail(emptyDetail);
        setMode(MODE.CREATE);
        setValidate(emptyValidate);
    };

    useEffect(() => {
        setLoading(false);
        if (data) {
            edit(data);
        } else {
            create();
        }
    }, [data]);

    const performContactValidate = (props, _currentDetail) => {
        let isValid = true;
        if (isContactCreate && showContact) {
            let result = _.cloneDeep(contactValidate);
            let _detail = _currentDetail ? _currentDetail : detailContact;
            // validate all props
            if (props.length === 0) {
                for (const property in result) {
                    props.push(property);
                }
            }

            // validate props
            props.forEach((prop) => {
                switch (prop) {
                    case "contactName":
                        result[prop] =
                            _detail.contactName.length > 0
                                ? null
                                : `${t("crm.contact.name")} ${t(
                                      "message.cant-be-empty"
                                  )}`;
                        if (
                            !result[prop] &&
                            !REGEX_NAME.test(_detail.contactName)
                        ) {
                            result[prop] = `${t("crm.contact.name")} ${t(
                                "crm.require.name"
                            )}`;
                        }
                        break;
                    case "contactPhone":
                        result[prop] = _detail.contactPhone
                            ? null
                            : `${t("crm.contact.phone")} ${t(
                                  "message.cant-be-empty"
                              )}`;
                        if (
                            _detail.contactPhone &&
                            !REGEX_PHONE.test(_detail.contactPhone)
                        ) {
                            result[prop] = `${t("crm.contact.phone")} ${t(
                                "crm.require.phone"
                            )}`;
                        }
                        break;
                    // case 'contactTitle':
                    //     result[prop] = _detail.contactTitle ? null : `${t('crm.contact.position')} ${t('message.cant-be-empty')}`
                    //     break
                    case "accountRelationTypeId":
                        result[prop] = _detail.accountRelationTypeId
                            ? null
                            : `${t("crm-sale.lead-to-opp.relation")} ${t(
                                  "message.cant-be-empty"
                              )}`;
                        break;

                    default:
                        break;
                }
            });

            setContactValidate(result);

            // check if object has error
            for (const property in result) {
                if (result[property]) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    };

    const handleChangeAccount = (e) => {
        applyServiceChange("accountId", e.value);
    };

    const loadEmployees = () => {
        CrmEmployeeApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                const _employeeAll = [];
                res.map((o) => {
                    _employeeAll.push({
                        id: o.id,
                        fullName: `${
                            o.employeeLastName ? o.employeeLastName : ""
                        }${
                            o.employeeMiddleName
                                ? ` ${o.employeeMiddleName}`
                                : ``
                        }${
                            o.employeeFirstName ? ` ${o.employeeFirstName}` : ``
                        }`,
                    });
                });
                setEmployees(_employeeAll);

                if (employeeId) {
                    const ownerEmployeeId = _employeeAll.find(
                        (o) => o.id === ownerEmployeeId
                    );
                    setDetail({
                        ...detail,
                        ownerEmployeeId: [ownerEmployeeId],
                        leadStageId: leadStageId,
                    });
                }
            } else {
                setEmployees([]);
            }
        });
    };

    const handleChangeName = (e) => {
        applyServiceChange("serviceOrderName", e.target.value);
    };

    const handleChangeServiceOrderStageId = (e) => {
        applyServiceChange("serviceOrderStageId", e.value);
    };

    const handleChangeOtherProduct = (e) => {
        applyServiceChange("otherProduct", e.target.value);
    };

    const handleChangeOrderNote = (e) => {
        applyServiceChange("serviceOrderNote", e.target.value);
    };

    const handleChangeRelationType = (e) => {
        applyServiceChange("accountRelationTypeId", e.value);
    };

    const renderFooter = () => {
        return (
            <div className={`p-fluid fluid formgrid grid mt-4`}>
                <div className="col-6 px-3 py-1">
                    {detail.createUser ? (
                        <CrmFieldPreviewValue
                            label={t(
                                "crm-service.service-order.detail.create-by"
                            )}
                            users={[
                                {
                                    id: detail.createUser.id,
                                    fullName: detail.createUser.fullName,
                                },
                            ]}
                            subDescription={
                                detail.createDate
                                    ? `, ${moment(detail.createDate).format(
                                          "H:mm DD/MM/YYYY"
                                      )}`
                                    : ``
                            }
                            readOnly={true}
                        />
                    ) : null}
                </div>
                <div className="col-6 px-3 py-1">
                    {detail.updateUser ? (
                        <CrmFieldPreviewValue
                            label={t(
                                "crm-service.service-order.detail.edit-by"
                            )}
                            users={[
                                {
                                    id: detail.updateUser.id,
                                    fullName: detail.updateUser.fullName,
                                },
                            ]}
                            subDescription={
                                detail.modifiedDate
                                    ? `, ${moment(detail.modifiedDate).format(
                                          "H:mm DD/MM/YYYY"
                                      )}`
                                    : ``
                            }
                            readOnly={true}
                        />
                    ) : null}
                </div>
            </div>
        );
    };

    const onForcusField = (field) => {
        if (setPreview) {
            setPreview(false);
        }
    };

    const onChangeIsAccountCreate = (flg) => () => {
        setIsAccountCreate(flg);
        setShowContact(false);
        setDetailAccount(emptyAccountDetail);
        setDetailContact(emptyContactDetail);
    };

    const onChangeIsContactCreate = (flg) => () => {
        setIsContactCreate(flg);
    };

    const handleChangeContactName = (e) => {
        applyServiceContactChange("contactName", e.target.value);
    };

    const handleChangeContactPhone = (e) => {
        applyServiceContactChange("contactPhone", e.target.value);
    };

    const handleChangeContactTitle = (e) => {
        applyServiceContactChange("contactTitle", e.target.value);
    };

    const handleChangeContactRelationType = (e) => {
        applyServiceContactChange("accountRelationTypeId", e.value);
    };

    const applyServiceContactChange = (prop, val) => {
        let _detail = _.cloneDeep(detailContact);

        _detail[prop] = val;

        setDetailContact(_detail);
        performContactValidate([prop], _detail);
    };

    const renderColumnText = (name, isValid, disabled, unit) => (rowData) => {
        // const paied = _.filter(paymentInfo, { paymentScheduleId: rowData.id })
        return (
            <div className="p-fluid fluid formgrid grid field-content">
                <InputText
                    value={`${rowData[name]}${unit ?? ""}`}
                    onChange={(e) =>
                        applyServiceItemsChange(
                            rowData.rowIndex,
                            name,
                            e.target.value
                        )
                    }
                    disabled={!permission?.update || disabled || preview}
                />
                {isValid &&
                    validate["items"] &&
                    validate["items"][rowData.rowIndex] &&
                    validate["items"][rowData.rowIndex][name] && (
                        <small className="p-invalid">
                            {validate["items"][rowData.rowIndex][name]}
                        </small>
                    )}
            </div>
        );
    };

    const renderColumnNumber = (name, isValid, disabled) => (rowData) => {
        // const paied = _.filter(paymentInfo, { paymentScheduleId: rowData.id })
        return (
            <div className="p-fluid fluid formgrid grid field-content">
                <InputNumber
                    value={rowData[name]}
                    disabled={!permission?.update || disabled || preview}
                    onChange={(e) =>
                        applyServiceItemsChange(rowData.rowIndex, name, e.value)
                    }
                    min={0}
                />
                {isValid &&
                    validate["items"] &&
                    validate["items"][rowData.rowIndex] &&
                    validate["items"][rowData.rowIndex][name] && (
                        <small className="p-invalid">
                            {validate["items"][rowData.rowIndex][name]}
                        </small>
                    )}
            </div>
        );
    };

    const renderColumnEnd = (rowData) => {
        return (
            <Button
                disabled={!permission?.delete || preview}
                icon="bx bx-trash text-red"
                className="p-button-rounded p-button-text ml-1"
                tooltip={t("common.delete")}
                tooltipOptions={{ position: "top" }}
                onClick={handleRemoveItem(rowData)}
            />
        );
    };

    const handleAddItem = () => {
        let _items = _.cloneDeep(items);
        _items.push({
            ...emptyItem,
            rowIndex: makeRandomId(5),
        });

        setItems(_items);
    };

    const handleAddProdcutOrther = () => {};

    const handleRemoveItem = (rowData) => () => {
        const content = `${t(
            "crm-service-order.service-order-material.remove-confirm"
        ).replace(`{0}`, "")}`.split("?");
        CrmConfirmDialog({
            message: (
                <>
                    <span>{content[0]}?</span>
                    <br />
                    <span>{content[1]}</span>
                </>
            ),
            header: t("crm-service-order.service-order-material.remove"),
            accept: () => {
                // if (rowData.id) {
                //     CrmServiceServiceOrderMaterialItemApi.delete(rowData.id)
                //         .then((data) => {
                //             if (data) {
                //                 reload();
                //                 CommonFunction.toastSuccess(t("common.save-success"));
                //             }
                //         })
                //         .catch((error) => CommonFunction.toastError(error))
                // } else {
                //     let _items = _.cloneDeep(items)
                //     _.remove(_items, { rowIndex: rowData.rowIndex })
                //     setItems(_items)
                //     performValidate(["items"], detail, _items)
                // }
                let _items = _.cloneDeep(items);
                _.remove(_items, { rowIndex: rowData.rowIndex });
                setItems(_items);
                performValidate(["items"], detail, _items);
            },
        });
    };

    const renderNumerical = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.index}</span>
            </div>
        );
    };

    const renderColumn2 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.serial}</span>
            </div>
        );
    };
    const renderColumn3 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.name}</span>
            </div>
        );
    };
    const renderColumn4 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.code}</span>
            </div>
        );
    };
    const renderColumn5 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.startDate}</span>
            </div>
        );
    };
    const renderColumn6 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.timeDate}</span>
            </div>
        );
    };
    const renderColumn7 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.endDate}</span>
            </div>
        );
    };
    const renderColumn8 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.timeDateCompany}</span>
            </div>
        );
    };
    const renderColumn9 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.endDateCompany}</span>
            </div>
        );
    };
    const renderColumn10 = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.stage}</span>
            </div>
        );
    };

    // const renderColumn1 = (rowData) => {
    //     return (
    //         <div className="field-content">
    //             <Dropdown
    //                 options={materials}
    //                 optionLabel="materialName"
    //                 optionValue="id"
    //                 filter
    //                 filterBy="materialName"
    //                 value={rowData["materialPriceId"]}
    //                 onChange={(e) => applyServiceItemsChange(rowData.rowIndex, "materialPriceId", e.value)}
    //                 disabled={!permission?.update || preview}
    //             />
    //             {validate["items"] && validate["items"][rowData.rowIndex] && validate["items"][rowData.rowIndex]["materialPriceId"] && (
    //                 <small className="p-invalid">
    //                     {validate["items"][rowData.rowIndex]["materialPriceId"]}
    //                 </small>
    //             )}
    //         </div>
    //     );
    // }

    const listContact = contactAll;

    const priviewServiceOrderAccountType = _.find(accountTypes, {
        id: detailAccount.accountTypeId,
    });
    const priviewServiceOrderStage = _.find(serviceOrderStage, {
        id: detail.serviceOrderStageId,
    });

    const priviewCurrencyExchangeRates = _.find(currencyExchangeRates, {
        id: detail.currencyExchangeRateId,
    });

    const priviewDocumentType = _.find(documentType, {
        id: detail.documentTypeId,
    });

    return (
        <>
            <div
                className={`p-fluid fluid formgrid grid service-order-detail ${
                    preview ? `hidden` : ``
                }`}
            >
                <div className="col-12">
                    {data ? (
                        ""
                    ) : (
                        <>
                            <CrmPanel
                                className="mb-2"
                                title={t(
                                    "crm-service.service-order.account-infomation"
                                )}
                                collapsed={false}
                            >
                                <div className={`px-2 pt-2`}>
                                    <div className="flex align-items-center justify-content-center py-2">
                                        <div className="field-checkbox flex-1 mb-0 pl-3">
                                            <Checkbox
                                                inputId="is-account-create"
                                                onChange={onChangeIsAccountCreate(
                                                    true
                                                )}
                                                checked={isAccountCreate}
                                            />
                                            <label htmlFor="is-account-create">
                                                {t(
                                                    "crm-service.service-order.account-create"
                                                )}
                                            </label>
                                        </div>
                                        <div className="w-5rem text-center">
                                            <span>
                                                {t(
                                                    "crm-service.service-order.or"
                                                )}
                                            </span>
                                        </div>
                                        <div className="field-checkbox flex-1 mb-0 pl-3">
                                            <Checkbox
                                                inputId="is-account-create1"
                                                onChange={onChangeIsAccountCreate(
                                                    false
                                                )}
                                                checked={!isAccountCreate}
                                            />
                                            <label htmlFor="is-account-create1">
                                                {t(
                                                    "crm-service.service-order.account-select"
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex py-2">
                                        <div className="flex-1">
                                            <div
                                                className={`p-card p-card-component`}
                                            >
                                                <div className="p-card-body px-0">
                                                    <div className="px-3">
                                                        <div className="field mb-3">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label
                                                                        htmlFor="product-account-type"
                                                                        className="require"
                                                                    >
                                                                        {t(
                                                                            "crm-service.account.type"
                                                                        )}
                                                                    </label>
                                                                </div>

                                                                <Dropdown
                                                                    id="product-account-type"
                                                                    options={
                                                                        accountTypes
                                                                    }
                                                                    optionLabel="accountTypeName"
                                                                    optionValue="id"
                                                                    filter
                                                                    filterBy="accountTypeName"
                                                                    value={
                                                                        detailAccount.accountTypeId
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountType
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                />
                                                            </span>
                                                            {accountValidate.accountTypeId && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        accountValidate.accountTypeId
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>

                                                        <div className="field mb-3">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label
                                                                        htmlFor="account-name"
                                                                        className="require"
                                                                    >
                                                                        {t(
                                                                            "crm-service.account.account"
                                                                        )}
                                                                    </label>
                                                                </div>

                                                                <InputText
                                                                    id="account-name"
                                                                    value={
                                                                        detailAccount.accountName
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountName
                                                                    }
                                                                />
                                                            </span>
                                                            {accountValidate.accountName && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        accountValidate.accountName
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="field mb-3">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label
                                                                        htmlFor="account-phone"
                                                                        className="require"
                                                                    >
                                                                        {t(
                                                                            "crm-service.account.phone"
                                                                        )}
                                                                    </label>
                                                                </div>

                                                                <InputText
                                                                    id="account-phone"
                                                                    value={
                                                                        detailAccount.accountPhone
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountPhone
                                                                    }
                                                                />
                                                            </span>
                                                            {accountValidate.accountPhone && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        accountValidate.accountPhone
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>

                                                        <div className="field mb-3">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label htmlFor="product-document-type">
                                                                        {t(
                                                                            "crm-service.document.type"
                                                                        )}
                                                                    </label>
                                                                </div>

                                                                <Dropdown
                                                                    id="product-document-type"
                                                                    options={
                                                                        documentType
                                                                    }
                                                                    optionLabel="documentTypeName"
                                                                    optionValue="id"
                                                                    filter
                                                                    filterBy="documentTypeName"
                                                                    value={
                                                                        detailAccount.documentTypeId
                                                                    }
                                                                    onChange={
                                                                        handleChangeDocumentType
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                />
                                                            </span>
                                                        </div>

                                                        <div className="field">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label htmlFor="document-number">
                                                                        {t(
                                                                            "crm-service.document.number"
                                                                        )}
                                                                    </label>
                                                                </div>

                                                                <InputText
                                                                    id="document-number"
                                                                    value={
                                                                        detailAccount.documentNumber
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeDocumentNumber
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-5rem text-center">
                                            <div className="sale-lead-to-opp-spacing bg-gray-300 h-full inline-block"></div>
                                        </div>
                                        {/* ------------------------ */}
                                        <div className="flex-1">
                                            <div
                                                className={`p-card p-card-component`}
                                            >
                                                <div className="p-card-body px-0">
                                                    <div className="px-3">
                                                        <div className="field">
                                                            <span>
                                                                <div className="mb-2">
                                                                    <label
                                                                        htmlFor="product-account-select"
                                                                        className="require"
                                                                    >
                                                                        {t(
                                                                            "crm-service.account.account"
                                                                        )}
                                                                    </label>
                                                                </div>
                                                                <UserAutoComplete
                                                                    id="product-account-select"
                                                                    users={
                                                                        accounts
                                                                    }
                                                                    value={
                                                                        detail.accountId
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccount
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        isAccountCreate
                                                                    }
                                                                />
                                                            </span>
                                                            {validate.accountId && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        validate.accountId
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CrmPanel>

                            {showContact ? (
                                <CrmPanel
                                    className="mb-2"
                                    title={t(
                                        "crm-sale.lead-to-opp.contact-infomation"
                                    )}
                                    collapsed={false}
                                >
                                    <div className={`px-2 pt-2`}>
                                        <div className="flex align-items-center justify-content-center py-2">
                                            <div className="field-checkbox flex-1 mb-0 pl-3">
                                                <Checkbox
                                                    inputId="is-contact-create"
                                                    onChange={onChangeIsContactCreate(
                                                        true
                                                    )}
                                                    checked={isContactCreate}
                                                />
                                                <label htmlFor="is-contact-create">
                                                    {t(
                                                        "crm-sale.lead-to-opp.contact-create"
                                                    )}
                                                </label>
                                            </div>
                                            <div className="w-5rem text-center">
                                                <span>
                                                    {t(
                                                        "crm-sale.lead-to-opp.or"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="field-checkbox flex-1 mb-0 pl-3">
                                                <Checkbox
                                                    inputId="is-contact-create1"
                                                    onChange={onChangeIsContactCreate(
                                                        false
                                                    )}
                                                    checked={!isContactCreate}
                                                />
                                                <label htmlFor="is-contact-create1">
                                                    {t(
                                                        "crm-sale.lead-to-opp.contact-select"
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex py-2">
                                            <div className="flex-1">
                                                <div
                                                    className={`p-card p-card-component`}
                                                >
                                                    <div className="p-card-body px-0">
                                                        <div className="px-3">
                                                            <div className="field mb-3">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label
                                                                            htmlFor="account-name"
                                                                            className="require"
                                                                        >
                                                                            {t(
                                                                                "crm.contact.name"
                                                                            )}
                                                                        </label>
                                                                    </div>

                                                                    <InputText
                                                                        id="account-name"
                                                                        value={
                                                                            detailContact.contactName
                                                                        }
                                                                        disabled={
                                                                            readOnly ||
                                                                            !isContactCreate
                                                                        }
                                                                        onChange={
                                                                            handleChangeContactName
                                                                        }
                                                                    />
                                                                </span>
                                                                {contactValidate.contactName && (
                                                                    <small className="p-invalid">
                                                                        {
                                                                            contactValidate.contactName
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <div className="field mb-3">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label
                                                                            htmlFor="contact-phone"
                                                                            className="require"
                                                                        >
                                                                            {t(
                                                                                "crm.contact.phone"
                                                                            )}
                                                                        </label>
                                                                    </div>

                                                                    <InputText
                                                                        id="contact-phone"
                                                                        value={
                                                                            detailContact.contactPhone
                                                                        }
                                                                        disabled={
                                                                            readOnly ||
                                                                            !isContactCreate
                                                                        }
                                                                        onChange={
                                                                            handleChangeContactPhone
                                                                        }
                                                                    />
                                                                </span>
                                                                {contactValidate.contactPhone && (
                                                                    <small className="p-invalid">
                                                                        {
                                                                            contactValidate.contactPhone
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <div className="field mb-3">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label htmlFor="contact-title">
                                                                            {t(
                                                                                "crm.contact.position"
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                    <InputText
                                                                        id="contact-title"
                                                                        value={
                                                                            detailContact.contactTitle
                                                                        }
                                                                        disabled={
                                                                            readOnly ||
                                                                            !isContactCreate
                                                                        }
                                                                        onChange={
                                                                            handleChangeContactTitle
                                                                        }
                                                                    />
                                                                </span>
                                                                {/* {contactValidate.contactTitle && <small className="p-invalid">{contactValidate.contactTitle}</small>} */}
                                                            </div>
                                                            <div className="field mb-3">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label
                                                                            htmlFor="new-contact-relation-type"
                                                                            className="require"
                                                                        >
                                                                            {t(
                                                                                "crm-sale.lead-to-opp.relation"
                                                                            )}
                                                                        </label>
                                                                    </div>

                                                                    <Dropdown
                                                                        id="new-contact-relation-type"
                                                                        options={
                                                                            relatedTypes
                                                                        }
                                                                        optionLabel="accountRelationTypeName"
                                                                        optionValue="id"
                                                                        filter
                                                                        filterBy="accountRelationTypeName"
                                                                        value={
                                                                            detailContact.accountRelationTypeId
                                                                        }
                                                                        onChange={
                                                                            handleChangeContactRelationType
                                                                        }
                                                                        disabled={
                                                                            readOnly ||
                                                                            !isContactCreate
                                                                        }
                                                                    />
                                                                </span>
                                                                {contactValidate.accountRelationTypeId && (
                                                                    <small className="p-invalid">
                                                                        {
                                                                            contactValidate.accountRelationTypeId
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-5rem text-center">
                                                <div className="sale-lead-to-opp-spacing bg-gray-300 h-full inline-block"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div
                                                    className={`p-card p-card-component`}
                                                >
                                                    <div className="p-card-body px-0">
                                                        <div className="px-3">
                                                            <div className="field mb-3">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label
                                                                            htmlFor="product-contact"
                                                                            className="require"
                                                                        >
                                                                            {t(
                                                                                "crm-sale.lead-to-opp.contact"
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                    <UserAutoComplete
                                                                        id="product-contact"
                                                                        users={
                                                                            listContact
                                                                        }
                                                                        value={
                                                                            detail.contactId
                                                                        }
                                                                        onChange={
                                                                            handleChangeContact
                                                                        }
                                                                        disabled={
                                                                            readOnly ||
                                                                            isContactCreate
                                                                        }
                                                                    />
                                                                </span>
                                                                {validate.contactId && (
                                                                    <small className="p-invalid">
                                                                        {
                                                                            validate.contactId
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <div className="field">
                                                                <span>
                                                                    <div className="mb-2">
                                                                        <label
                                                                            htmlFor="contact-relation-type"
                                                                            className="require"
                                                                        >
                                                                            {t(
                                                                                "crm-sale.lead-to-opp.relation"
                                                                            )}
                                                                        </label>
                                                                    </div>

                                                                    <Dropdown
                                                                        id="contact-relation-type"
                                                                        options={
                                                                            relatedTypes
                                                                        }
                                                                        optionLabel="accountRelationTypeName"
                                                                        optionValue="id"
                                                                        filter
                                                                        filterBy="opportunityStageName"
                                                                        value={
                                                                            detail.accountRelationTypeId
                                                                        }
                                                                        onChange={
                                                                            handleChangeRelationType
                                                                        }
                                                                        // disabled={readOnly || !detail.contactId || !detail.contactId.length || isContactCreate || !isAccountCreate}
                                                                        disabled={
                                                                            readOnly ||
                                                                            isContactCreate
                                                                        }
                                                                    />
                                                                </span>
                                                                {validate.accountRelationTypeId && (
                                                                    <small className="p-invalid">
                                                                        {
                                                                            validate.accountRelationTypeId
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CrmPanel>
                            ) : null}
                        </>
                    )}

                    {data ? (
                        <>
                            <CrmPanel
                                className="mb-2"
                                title={t(
                                    "crm-service.service-order.account-infomation"
                                )}
                                collapsed={false}
                            >
                                <div className={`pt-3 px-2`}>
                                    <div className={`p-card p-card-component`}>
                                        <div className="p-card-body px-3">
                                            {/* <div className='px-3'>
                                </div> */}
                                            <div
                                                className={`p-fluid fluid formgrid grid`}
                                            >
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.account.account"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <UserAutoComplete
                                                                    id="product-account-select"
                                                                    users={
                                                                        accounts
                                                                    }
                                                                    value={
                                                                        detail.accountId
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccount
                                                                    }
                                                                    disabled={
                                                                        true
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.account.type"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <Dropdown
                                                                    id="product-account-type"
                                                                    options={
                                                                        accountTypes
                                                                    }
                                                                    optionLabel="accountTypeName"
                                                                    optionValue="id"
                                                                    filter
                                                                    filterBy="accountTypeName"
                                                                    value={
                                                                        detailAccount.accountTypeId
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountType
                                                                    }
                                                                    disabled={
                                                                        true
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.account.phone"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <InputText
                                                                    id="account-phone"
                                                                    value={
                                                                        detailAccount.accountPhone
                                                                    }
                                                                    disabled={
                                                                        true
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountPhone
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.account.email"
                                                        )}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <InputText
                                                                    id="account-mail"
                                                                    value={
                                                                        detailAccount.accountEmail
                                                                    }
                                                                    disabled={
                                                                        true
                                                                    }
                                                                    onChange={
                                                                        handleChangeAccountEmail
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.document.type"
                                                        )}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <Dropdown
                                                                    id="product-document-type"
                                                                    options={
                                                                        documentType
                                                                    }
                                                                    optionLabel="documentTypeName"
                                                                    optionValue="id"
                                                                    filter
                                                                    filterBy="documentTypeName"
                                                                    value={
                                                                        detailAccount.documentTypeId
                                                                    }
                                                                    onChange={
                                                                        handleChangeDocumentType
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-service.document.number"
                                                        )}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <InputText
                                                                    id="document-number"
                                                                    value={
                                                                        detailAccount.documentNumber
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isAccountCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeDocumentNumber
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CrmPanel>
                        </>
                    ) : (
                        ""
                    )}

                    {data && data.contactId ? (
                        <>
                            <CrmPanel
                                className="mb-2"
                                title={t(
                                    "crm-service.service-order.service-order-infomation-contact"
                                )}
                                collapsed={false}
                            >
                                <div className={`pt-3 px-2`}>
                                    <div className={`p-card p-card-component`}>
                                        <div className="p-card-body px-3">
                                            <div
                                                className={`p-fluid fluid formgrid grid`}
                                            >
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm.contact.name"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <UserAutoComplete
                                                                    id="product-contact"
                                                                    users={
                                                                        listContact
                                                                    }
                                                                    value={
                                                                        detail.contactId
                                                                    }
                                                                    onChange={
                                                                        handleChangeContact
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        isContactCreate
                                                                    }
                                                                />
                                                            </span>
                                                            {contactValidate.contactName && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        contactValidate.contactName
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm.contact.phone"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <InputText
                                                                    id="contact-phone"
                                                                    value={
                                                                        detailContact.contactPhone
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isContactCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeContactPhone
                                                                    }
                                                                />
                                                            </span>
                                                            {contactValidate.contactPhone && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        contactValidate.contactPhone
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm.contact.position"
                                                        )}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <InputText
                                                                    id="contact-title"
                                                                    value={
                                                                        detailContact.contactTitle
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isContactCreate
                                                                    }
                                                                    onChange={
                                                                        handleChangeContactTitle
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                                <div className="col-6 px-3 py-1">
                                                    <CrmFieldEdittingValue
                                                        label={t(
                                                            "crm-sale.lead-to-opp.relation"
                                                        )}
                                                        require={true}
                                                    >
                                                        <div className="field">
                                                            <span>
                                                                <Dropdown
                                                                    id="new-contact-relation-type"
                                                                    options={
                                                                        relatedTypes
                                                                    }
                                                                    optionLabel="accountRelationTypeName"
                                                                    optionValue="id"
                                                                    filter
                                                                    filterBy="accountRelationTypeName"
                                                                    value={
                                                                        detailContact.accountRelationTypeId
                                                                    }
                                                                    onChange={
                                                                        handleChangeContactRelationType
                                                                    }
                                                                    disabled={
                                                                        readOnly ||
                                                                        !isContactCreate
                                                                    }
                                                                />
                                                            </span>
                                                            {validate.accountRelationTypeId && (
                                                                <small className="p-invalid">
                                                                    {
                                                                        validate.accountRelationTypeId
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </CrmFieldEdittingValue>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CrmPanel>
                        </>
                    ) : (
                        ""
                    )}

                    <CrmPanel
                        className="mb-2"
                        title={t(
                            "crm-service.service-order.service-order-infomation"
                        )}
                        collapsed={false}
                    >
                        <div className={`pt-3 px-2`}>
                            <div className={`p-card p-card-component`}>
                                <div className="p-card-body px-3">
                                    {/* <div className='px-3'>
                                </div> */}
                                    <div
                                        className={`p-fluid fluid formgrid grid`}
                                    >
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.name"
                                                )}
                                                require={true}
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={
                                                            detail.serviceOrderName
                                                        }
                                                        disabled={readOnly}
                                                        onChange={
                                                            handleChangeName
                                                        }
                                                    />
                                                </div>{" "}
                                                {validate.serviceOrderName && (
                                                    <small className="p-invalid">
                                                        {
                                                            validate.serviceOrderName
                                                        }
                                                    </small>
                                                )}
                                            </CrmFieldEdittingValue>
                                        </div>

                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.stage"
                                                )}
                                                require={true}
                                            >
                                                <div className="field">
                                                    <Dropdown
                                                        id="product-currency"
                                                        options={
                                                            serviceOrderStage
                                                        }
                                                        optionLabel="serviceOrderStageName"
                                                        optionValue="id"
                                                        filter
                                                        filterBy="serviceOrderStageName"
                                                        value={
                                                            detail.serviceOrderStageId
                                                        }
                                                        onChange={
                                                            handleChangeServiceOrderStageId
                                                        }
                                                        disabled={readOnly}
                                                    />
                                                </div>{" "}
                                                {validate.serviceOrderStageId && (
                                                    <small className="p-invalid">
                                                        {
                                                            validate.serviceOrderStageId
                                                        }
                                                    </small>
                                                )}
                                            </CrmFieldEdittingValue>
                                        </div>

                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.detail.currency-exchange-rate"
                                                )}
                                                require={true}
                                            >
                                                <div className="field">
                                                    <Dropdown
                                                        id="product-currency"
                                                        options={
                                                            currencyExchangeRates
                                                        }
                                                        optionLabel="currencyName"
                                                        optionValue="id"
                                                        filter
                                                        filterBy="currencyName"
                                                        value={
                                                            detail.currencyExchangeRateId
                                                        }
                                                        onChange={
                                                            handleChangeCurrencyExchangeRate
                                                        }
                                                        disabled={readOnly}
                                                    />
                                                </div>{" "}
                                                {validate.currencyExchangeRateId && (
                                                    <small className="p-invalid">
                                                        {
                                                            validate.currencyExchangeRateId
                                                        }
                                                    </small>
                                                )}
                                            </CrmFieldEdittingValue>
                                        </div>

                                        {/* <div className="col-6 mb-3">
                                        <span className="">
                                            <div className="mb-2">
                                                <label htmlFor="product-close-date" className="require">{t('crm-sale.opportunity.detail.close-date')}</label>
                                            </div>
                                            <XCalendar
                                                // label={t("crm-sale.opportunity.detail.close-date")}
                                                value={detail.closeDate}
                                                onChange={handleChangeCloseDate}
                                                require
                                                disabled={readOnly}
                                            />
                                        </span>
                                        {validate.closeDate && <small className="p-invalid">{validate.closeDate}</small>}
                                    </div> */}
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.require.detail.appointment.location"
                                                )}
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={
                                                            detail.appointmentLocation
                                                        }
                                                        disabled={readOnly}
                                                        onChange={
                                                            handleChangeAppointmentLocation
                                                        }
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.responsible"
                                                )}
                                                require={true}
                                            >
                                                <div className="field">
                                                    <UserAutoComplete
                                                        id="product-responsible"
                                                        users={employees}
                                                        value={
                                                            detail?.ownerEmployeeId
                                                        }
                                                        onChange={
                                                            handleChangeEmployeeId
                                                        }
                                                        disabled={readOnly}
                                                    />
                                                </div>{" "}
                                                {validate.ownerEmployeeId && (
                                                    <small className="p-invalid">
                                                        {
                                                            validate.ownerEmployeeId
                                                        }
                                                    </small>
                                                )}
                                            </CrmFieldEdittingValue>
                                        </div>

                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.appointment-day"
                                                )}
                                            >
                                                <div className="field">
                                                    <XCalendar
                                                        showTime
                                                        value={
                                                            detail.appointmentTime
                                                        }
                                                        onChange={
                                                            handleChangeAppointmentTime
                                                        }
                                                        disabled={readOnly}
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-12 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.description"
                                                )}
                                            >
                                                <div className="field">
                                                    <InputTextarea
                                                        disabled={readOnly}
                                                        id="service-order-description"
                                                        onChange={
                                                            handleChangeOrderNote
                                                        }
                                                        value={
                                                            detail.serviceOrderNote
                                                        }
                                                        rows={6}
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CrmPanel>

                    <CrmPanel
                        className="mb-2"
                        title={t(
                            "crm-service.service-order.product-infomation"
                        )}
                        collapsed={false}
                    >
                        <div className={`pt-3 px-2`}>
                            <div className={`p-card p-card-component`}>
                                <div className="p-card-body px-3">
                                    {/* <div className='px-3'>
                                </div> */}
                                    <div
                                        className={`p-fluid fluid formgrid grid`}
                                    >
                                        <div className="col-12 px-3 py-1">
                                            <DataTable
                                                value={items}
                                                dataKey="rowIndex"
                                                className="p-datatable-gridlines crm-service-service-order-table-material crm-table"
                                                emptyMessage={t(
                                                    "common.no-record-found"
                                                )}
                                                resizableColumns
                                                columnResizeMode="expand"
                                                showGridlines
                                                responsiveLayout="scroll"
                                                scrollable
                                                scrollDirection="both"
                                                scrollHeight="flex"
                                                lazy
                                            >
                                                <Column
                                                    header={""}
                                                    className="col-table-stt flex justify-content-center align-items-center"
                                                    body={renderNumerical}
                                                />
                                                {/* <Column
                                                    field={t("crm-service-order.service-order-material.product")}
                                                    header={(_) => (
                                                        <div>
                                                            {t("crm-service-order.service-order-material.product")}
                                                            <span className="text-red-400 ">
                                                                *
                                                            </span>
                                                        </div>
                                                    )}
                                                    className="col-table-0"
                                                    body={renderColumn1}
                                                /> */}
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.serial"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.serial"
                                                    )}
                                                    className="col-table-1"
                                                    body={renderColumn2}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.prodcut-name"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.prodcut-name"
                                                    )}
                                                    className="col-table-2"
                                                    body={renderColumn3}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.security-code"
                                                    )}
                                                    header={(_) => (
                                                        <div>
                                                            {t(
                                                                "crm-service-order.service-order.security-code"
                                                            )}
                                                            <span className="text-red-400 ">
                                                                *
                                                            </span>
                                                        </div>
                                                    )}
                                                    className="col-table-3"
                                                    body={renderColumn4}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.start-date-security"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.start-date-security"
                                                    )}
                                                    className="col-table-4"
                                                    body={renderColumn5}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.time-security"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.time-security"
                                                    )}
                                                    className="col-table-5"
                                                    body={renderColumn6}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.end-date-security"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.end-date-security"
                                                    )}
                                                    className="col-table-5"
                                                    body={renderColumn7}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.time-security-company"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.time-security-company"
                                                    )}
                                                    className="col-table-6"
                                                    body={renderColumn8}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.end-date-security-company"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.end-date-security-company"
                                                    )}
                                                    className="col-table-7"
                                                    body={renderColumn9}
                                                />
                                                <Column
                                                    field={t(
                                                        "crm-service-order.service-order.stage"
                                                    )}
                                                    header={t(
                                                        "crm-service-order.service-order.stage"
                                                    )}
                                                    className="col-table-8"
                                                    body={renderColumn10}
                                                />

                                                <Column
                                                    columnKey="action"
                                                    className="col-table-end"
                                                    frozen
                                                    alignFrozen="right"
                                                    body={renderColumnEnd}
                                                />
                                            </DataTable>
                                            <div className="w-auto mt-2">
                                                <Button
                                                    className="p-button-text text-sm w-auto pl-1"
                                                    icon="bx bx-plus text-green text-lg"
                                                    tooltip={t(
                                                        "crm-service-order.service-order.add-product"
                                                    )}
                                                    tooltipOptions={{
                                                        position: "bottom",
                                                    }}
                                                    onClick={handleAddItem}
                                                    label={t(
                                                        "crm-service-order.service-order.add-product"
                                                    )}
                                                    disabled={
                                                        !permission?.update ||
                                                        preview
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6 px-3 py-1 mt-4">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.other-product"
                                                )}
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value="Điện thoại Samsung S7"
                                                        disabled={readOnly}
                                                        onChange={
                                                            handleChangeOtherProduct
                                                        }
                                                    />
                                                </div>{" "}
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value="Máy tính DELL"
                                                        disabled={readOnly}
                                                        onChange={
                                                            handleChangeOtherProduct
                                                        }
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1 mt-4"></div>
                                        <div className="col-6 px-3 py-1">
                                            <div className="w-auto mt-2">
                                                <Button
                                                    className="p-button-text text-sm w-auto pl-1"
                                                    icon="bx bx-plus text-green text-lg"
                                                    tooltip={t(
                                                        "crm-service-order.service-order.add-product-orther"
                                                    )}
                                                    tooltipOptions={{
                                                        position: "bottom",
                                                    }}
                                                    onClick={
                                                        handleAddProdcutOrther
                                                    }
                                                    label={t(
                                                        "crm-service-order.service-order.add-product-orther"
                                                    )}
                                                    disabled={
                                                        !permission?.update ||
                                                        preview
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CrmPanel>

                    <CrmPanel
                        className="mb-2"
                        title={t("crm-service.service-order.infomation")}
                        collapsed={false}
                    >
                        <div className={`pt-3 px-2`}>
                            <div className={`p-card p-card-component`}>
                                <div className="p-card-body px-3">
                                    <div
                                        className={`p-fluid fluid formgrid grid`}
                                    >
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.total-material"
                                                )}
                                  
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={`${formatNum(
                                                            1026000
                                                        )} VND`}
                                                        disabled
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.total-discountSo"
                                                )}
                                        
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={`${formatNum(
                                                            950000
                                                        )} VND`}
                                                        disabled
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.total-service"
                                                )}
                                  
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={`${formatNum(
                                                            30000
                                                        )} VND`}
                                                        disabled
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                            
                                        </div>

                                        <div className="col-6 px-3 py-1">
                                        
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.total-vatSo"
                                                )}
                                  
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={`${formatNum(
                                                            76000
                                                        )} VND`}
                                                        disabled
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1">
                                           
                                            <CrmFieldEdittingValue
                                                label={t(
                                                    "crm-service.service-order.total"
                                                )}
    
                                            >
                                                <div className="field">
                                                    <InputText
                                                        id="product-opp-name"
                                                        value={`${formatNum(
                                                            1056000
                                                        )} VND`}
                                                        disabled
                                                    />
                                                </div>{" "}
                                            </CrmFieldEdittingValue>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CrmPanel>
                    {renderFooter()}
                </div>
            </div>

            <div
                className={`${className ? className : ``} ${
                    preview ? `` : `hidden`
                }`}
            >
                <CrmPanel
                    className="mb-2"
                    title={t("crm-service.service-order.account-infomation")}
                    collapsed={false}
                >
                    <div className={`pt-3 px-2`}>
                        <div className={`p-card p-card-component`}>
                            <div className="p-card-body px-3">
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.account.account"
                                            )}
                                            users={detail.accountId}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.account.type"
                                            )}
                                            value={
                                                priviewServiceOrderAccountType?.accountTypeName
                                            }
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.account.phone"
                                            )}
                                            value={detailAccount.accountPhone}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.account.email"
                                            )}
                                            value={detailAccount.accountEmail}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>

                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.document.type"
                                            )}
                                            value={
                                                priviewDocumentType?.documentTypeName
                                            }
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.document.number"
                                            )}
                                            value={detailAccount.documentNumber}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CrmPanel>
                {data?.contactId ? (
                    <>
                        <CrmPanel
                            className="mb-2"
                            title={t(
                                "crm-service.service-order.service-order-infomation-contact"
                            )}
                            collapsed={false}
                        >
                            <div className={`pt-3 px-2`}>
                                <div className={`p-card p-card-component`}>
                                    <div className="p-card-body px-3">
                                        <div
                                            className={`p-fluid fluid formgrid grid`}
                                        >
                                            <div className="col-6 px-3 py-1">
                                                <CrmFieldPreviewValue
                                                    label={t(
                                                        "crm.contact.name"
                                                    )}
                                                    users={detail.contactId}
                                                    readOnly={
                                                        !permission?.update
                                                    }
                                                    callBack={onForcusField}
                                                />
                                            </div>
                                            <div className="col-6 px-3 py-1">
                                                <CrmFieldPreviewValue
                                                    label={t(
                                                        "crm.contact.phone"
                                                    )}
                                                    value={
                                                        detailContact.contactPhone
                                                    }
                                                    readOnly={
                                                        !permission?.update
                                                    }
                                                    callBack={onForcusField}
                                                />
                                            </div>
                                            <div className="col-6 px-3 py-1">
                                                <CrmFieldPreviewValue
                                                    label={t(
                                                        "crm.contact.position"
                                                    )}
                                                    value={
                                                        detailContact.contactTitle
                                                    }
                                                    readOnly={
                                                        !permission?.update
                                                    }
                                                    callBack={onForcusField}
                                                />
                                            </div>
                                            <div className="col-6 px-3 py-1">
                                                <CrmFieldPreviewValue
                                                    label={t(
                                                        "crm-sale.lead-to-opp.relation"
                                                    )}
                                                    value={
                                                        _.find(relatedTypes, {
                                                            id: detailContact.accountRelationTypeId,
                                                        })
                                                            ?.accountRelationTypeName
                                                    }
                                                    readOnly={
                                                        !permission?.update
                                                    }
                                                    callBack={onForcusField}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CrmPanel>
                    </>
                ) : (
                    ""
                )}
                <CrmPanel
                    className="mb-2"
                    title={t(
                        "crm-service.service-order.service-order-infomation"
                    )}
                    collapsed={false}
                >
                    <div className={`pt-3 px-2`}>
                        <div className={`p-card p-card-component`}>
                            <div className="p-card-body px-3">
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.name"
                                            )}
                                            value={detail.serviceOrderName}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.stage"
                                            )}
                                            value={
                                                priviewServiceOrderStage?.serviceOrderStageName
                                            }
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.detail.currency-exchange-rate"
                                            )}
                                            value={
                                                priviewCurrencyExchangeRates?.currencyName
                                            }
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.require.detail.appointment.location"
                                            )}
                                            value={detail.appointmentLocation}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.responsible"
                                            )}
                                            users={detail?.ownerEmployeeId}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>

                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.appointment-day"
                                            )}
                                            value={
                                                detail.appointmentTime
                                                    ? moment(
                                                          detail.appointmentTime
                                                      ).format(
                                                          "YYYY-MM-DDTHH:mm:ssZZ"
                                                      )
                                                    : ""
                                            }
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-12 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.description"
                                            )}
                                            value={detail.serviceOrderNote}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CrmPanel>
                <CrmPanel
                    className="mb-2"
                    title={t("crm-service.service-order.product-infomation")}
                    collapsed={false}
                >
                    <div className={`pt-3 px-2`}>
                        <div className={`p-card p-card-component`}>
                            <div className="p-card-body px-3">
                                {/* <div className='px-3'>
                                </div> */}
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-12 px-3 py-1">
                                        <DataTable
                                            value={items}
                                            dataKey="rowIndex"
                                            className="p-datatable-gridlines crm-service-service-order-table-material crm-table"
                                            emptyMessage={t(
                                                "common.no-record-found"
                                            )}
                                            resizableColumns
                                            columnResizeMode="expand"
                                            showGridlines
                                            responsiveLayout="scroll"
                                            scrollable
                                            scrollDirection="both"
                                            scrollHeight="flex"
                                            lazy
                                        >
                                            <Column
                                                header={""}
                                                className="col-table-stt flex justify-content-center align-items-center"
                                                body={renderNumerical}
                                            />
                                            {/* <Column
                                                    field={t("crm-service-order.service-order-material.product")}
                                                    header={(_) => (
                                                        <div>
                                                            {t("crm-service-order.service-order-material.product")}
                                                            <span className="text-red-400 ">
                                                                *
                                                            </span>
                                                        </div>
                                                    )}
                                                    className="col-table-0"
                                                    body={renderColumn1}
                                                /> */}
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.serial"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.serial"
                                                )}
                                                className="col-table-1"
                                                body={renderColumn2}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.prodcut-name"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.prodcut-name"
                                                )}
                                                className="col-table-2"
                                                body={renderColumn3}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.security-code"
                                                )}
                                                header={(_) => (
                                                    <div>
                                                        {t(
                                                            "crm-service-order.service-order.security-code"
                                                        )}
                                                        <span className="text-red-400 ">
                                                            *
                                                        </span>
                                                    </div>
                                                )}
                                                className="col-table-3"
                                                body={renderColumn4}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.start-date-security"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.start-date-security"
                                                )}
                                                className="col-table-4"
                                                body={renderColumn5}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.time-security"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.time-security"
                                                )}
                                                className="col-table-5"
                                                body={renderColumn6}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.end-date-security"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.end-date-security"
                                                )}
                                                className="col-table-5"
                                                body={renderColumn7}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.time-security-company"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.time-security-company"
                                                )}
                                                className="col-table-6"
                                                body={renderColumn8}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.end-date-security-company"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.end-date-security-company"
                                                )}
                                                className="col-table-7"
                                                body={renderColumn9}
                                            />
                                            <Column
                                                field={t(
                                                    "crm-service-order.service-order.stage"
                                                )}
                                                header={t(
                                                    "crm-service-order.service-order.stage"
                                                )}
                                                className="col-table-8"
                                                body={renderColumn10}
                                            />

                                            <Column
                                                columnKey="action"
                                                className="col-table-end"
                                                frozen
                                                alignFrozen="right"
                                                body={renderColumnEnd}
                                            />
                                        </DataTable>
                                    </div>

                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.other-product"
                                            )}
                                            value="Điện thoại Samsung S7"
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1"></div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            value="Máy tính DELL"
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CrmPanel>
                <CrmPanel
                    className="mb-2"
                    title={t("crm-service.service-order.infomation")}
                    collapsed={false}
                >
                    <div className={`pt-3 px-2`}>
                        <div className={`p-card p-card-component`}>
                            <div className="p-card-body px-3">
                                <div className={`p-fluid fluid formgrid grid`}>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.total-material"
                                            )}
                                            // value={detail.totalMaterial}
                                            value={`${formatNum(1026000)} VND`}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.total-discountSo"
                                            )}
                                            // value={detail.totalDiscountSo}
                                            value={`${formatNum(950000)} VND`}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.total-service"
                                            )}
                                            // value={detail.totalService}
                                            value={`${formatNum(30000)} VND`}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>

                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.total-vatSo"
                                            )}
                                            // value={detail.totalVatSo}
                                            value={`${formatNum(760000)} VND`}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                    <div className="col-6 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order.total"
                                            )}
                                            // value={
                                            //     detail.totalMaterial +
                                            //     detail.totalService
                                            // }
                                            value={`${formatNum(1056000)} VND`}
                                            readOnly={!permission?.update}
                                            callBack={onForcusField}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CrmPanel>
                {renderFooter()}
            </div>
        </>
    );
}

CrmServiceServiceOderDetail = forwardRef(CrmServiceServiceOderDetail);
export default CrmServiceServiceOderDetail;

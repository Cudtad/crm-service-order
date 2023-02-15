import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import CommonFunction from "@lib/common";
import XToolbar from "components/x-toolbar/XToolbar";
import { InputText } from "primereact/inputtext";
import LoadingBar from "components/loading/LoadingBar";
import { CrmMdActivityApi } from "services/crm/CrmMdActivityService";
import TaskBaseApi from "services/TaskBaseApi";
import _ from "lodash";
import {
    XLayout,
    XLayout_Center,
    XLayout_Title,
    XLayout_Top,
} from "@ui-lib/x-layout/XLayout";
import Enumeration from "@lib/enum";
import { UserAutoComplete } from "features/crm/components/UserAutoComplete";
import "./scss/TaskBaseDetail.scss";
import { OverlayPanel } from "primereact/overlaypanel";
import Task_State from "./components/Task_State";
import classNames from "classnames";
import XEditor from "components/x-editor/XEditor";
import { XCalendar } from "@ui-lib/x-calendar/XCalendar";
import { Dropdown } from "primereact/dropdown";
import {
    ACTIVITY_TYPE,
    TASK_OBJECT_TYPE,
    REGEX_FLOAT,
} from "features/crm/utils/constants";
// import { CrmAccountApi } from "services/crm/CrmAccountService";
// import { CrmSaleLeadApi } from "services/crm/CrmSaleLeadService";
// import { CrmSaleOpportunityApi } from "services/crm/CrmSaleOpportunityService";
// import { CrmSaleQuoteApi } from "services/crm/CrmSaleQuoteService";
// import { CrmSaleContractApi } from "services/crm/CrmSaleContractService";
// import { CrmSaleOrderApi } from "services/crm/CrmSaleOrderService";
import moment from "moment";
import { ACCOUNT_OBJECT, REGEX_EMAIL, REGEX_INT, REGEX_PHONE } from "../../features/crm/utils/constants";
// import { CrmAccountContactApi } from "services/crm/CrmAccountContactService";
// import { CrmContactApi } from "../../services/crm/CrmContactService";
import CrmFieldEdittingValue from "../../features/crm/components/CrmFieldEdittingValue";
import Task_Attachment from "./components/Task_Attachment";
import { useParams } from "react-router-dom";

/**
 * props:
 *      entityName: "" // entity's name
 *      defautData: () => ( { task: {}, involves: [] } ): function return default task object
 *      toolbar: { left: () => (<></>), center: () => (<></>), right: () => (<></>) } : custom toolbar
 *      dialog: true, // render dialog or not, default true
 *
 *      modules: [{ "base_info", "checklist", "attachment", "sub_task", "comment", "history"  }] // modules config
 *      modulesDefinition: {
 *          entity_info: {
 *              title: "" // module title
 *              icon: "" // module icon
 *              renderer: async () => (<></>) // define custom modules
 *          }
 *      }
 *
 *      allowSign: false // allow sign attachment, default - false
 *
 *      beforeChange: async (type, prop, newValue, oldValue, currentObject) => { return true; } : before change data, return boolean, if false, change will not be applied
 *      afterChange: async (type, newObject) => {} : after change
 *
 *      beforeSubmit: async (editMode, task) => { return [true, task]; }: before submit data, return boolean, if false, change will not be applied, return allow submit and task
 *      afterSubmit: async (editMode, responseAfterSubmit) => {}: aftersubmit response submit
 * @param {*} props
 * @param {*} ref
 * @returns
 */

export const TASK_OBJECT_TYPE_CONGIG = [
    // {
    //     name: "ACCOUNT_OBJECT",
    //     fieldId: "accountId",
    //     fieldName: "accountName",
    //     api: CrmAccountApi,
    //     id: TASK_OBJECT_TYPE.ACCOUNT_OBJECT,
    //     path: "#/crm/crm/account/information/",
    // },
    // {
    //     name: "LEAD_OBJECT",
    //     fieldId: "leadId",
    //     fieldName: "leadName",
    //     api: CrmSaleLeadApi,
    //     id: TASK_OBJECT_TYPE.LEAD_OBJECT,
    //     path: "#/crm/crm/lead/infor/",
    // },
    // {
    //     name: "OPP_OBJECT",
    //     fieldId: "opportunityId",
    //     fieldName: "opportunityName",
    //     api: CrmSaleOpportunityApi,
    //     id: TASK_OBJECT_TYPE.OPP_OBJECT,
    //     path: "#/crm/crm/opportunity/info/",
    // },
    // {
    //     name: "QUOTE_OBJECT",
    //     fieldId: "quoteId",
    //     fieldName: "quoteName",
    //     api: CrmSaleQuoteApi,
    //     id: TASK_OBJECT_TYPE.QUOTE_OBJECT,
    //     path: "#/crm/crm/quote/info/",
    // },
    // {
    //     name: "CONTRACT_OBJECT",
    //     fieldId: "contractId",
    //     fieldName: "contractNumber",
    //     api: CrmSaleContractApi,
    //     id: TASK_OBJECT_TYPE.CONTRACT_OBJECT,
    //     path: "#/crm/crm/contract/infor/",
    // },
    // {
    //     name: "ORDER_OBJECT",
    //     fieldId: "orderId",
    //     fieldName: "orderNumber",
    //     api: CrmSaleOrderApi,
    //     id: TASK_OBJECT_TYPE.ORDER_OBJECT,
    //     path: "#/crm/crm/order/info/",
    // },
];
const defaultErrors = {
    task: {},
    involves: {},
};

const defaultErrorsTask = {
    task: {
        name: "",
        priorityId: null,
        objectTypeId: null,
        objectTypeValue: null,
        startDate: null,
        deadline: null,
        closed_on: null,
    },
    involves: {
        RESPONSIBLE: "",
    },
};

const defaultErrorsPhone = {
    task: {
        name: "",
        priorityId: null,
        objectTypeId: null,
        objectTypeValue: null,
        startDate: null,
        duration: null,
        durationUnitId: null,
        deadline: null,
        phoneNumber: null,
        closed_on: null,
    },
    involves: {
        RESPONSIBLE: "",
    },
};

const defaultErrorsEmail = {
    task: {
        name: "",
        priorityId: null,
        objectTypeId: null,
        objectTypeValue: null,
        startDate: null,
        deadline: null,
        closed_on: null,
        involvedPeople: null
    },
    involves: {
        RESPONSIBLE: "",
    },
};

const defaultErrorsAppointment = {
    task: {
        name: "",
        priorityId: null,
        objectTypeId: null,
        objectTypeValue: null,
        startDate: null,
        duration: null,
        durationUnitId: null,
        deadline: null,
        closed_on: null,
    },
    involves: {
        RESPONSIBLE: "",
    },
};

function TaskBaseCrmDetail(props, ref) {
    const t = CommonFunction.t;
    const {
        priorities,
        employees,
        data,
        taskTypes,
        durationUnits,
        entityName,
        application,
        refType,
        toolbar,
        onHide,
        afterSubmit,
        modules,
        modulesDefinition,
        dialog,
        disableToolbar,
        className,
        readOnly,
        mode,
        cancel,
        disableFooterToolbar,
        accountId,
        objectTypeId
    } = props;

    const entityApplication = application || "crm-service";
    const entityRefType = refType || "activity";
    const entityModules = modules || ["base_info", "attachment"];

    // const [validate, setValidate] = useState(emptyValidate);

    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);

    const refDescription = useRef(null);

    const refChangeStageMenu = useRef(null);

    const refEditMode = useRef(null);

    const [errors, setErrors] = useState(defaultErrors);
    const refBasicInfoErrors = useRef([]); // contains all error message

    const emptyDetail = {
        startDate: new Date(),
    };

    // task and task's components state
    const [task, setTask] = useState(emptyDetail);

    const [involves, setInvolves] = useState(null);

    const [employeeAll, setEmployeeAll] = useState([]);

    const [contactAll, setContactAll] = useState([]);

    const [objectTypes, setObjectTypes] = useState([]);

    const [objectTypeValues, setObjectTypeValues] = useState([]);

    const [listContact, setListContact] = useState([]);

    const refTodo = useRef(null);
    const refAttachments = useRef(null);
    const [accountContactActivity, setAccountContactActivity] = useState([]);

    useEffect(() => {
        const _objectTypes = [];
        TASK_OBJECT_TYPE_CONGIG.map((o) => {
            _objectTypes.push({
                id: o.id,
                name: t(`crm.task-base.detail.${o.name}`),
            });
        });
        setObjectTypes(_objectTypes);
    }, []);

    useEffect(() => {
        const _employeeAll = [];
        employees.map((o) => {
            if (data || (!data && o.userId)) {
                _employeeAll.push({
                    id: o.id,
                    fullName: `${o.employeeLastName ? o.employeeLastName : ""}${o.employeeMiddleName ? ` ${o.employeeMiddleName}` : ``
                        }${o.employeeFirstName ? ` ${o.employeeFirstName}` : ``}`,
                    userId: o.userId,
                });
            }
        });

        setEmployeeAll(_employeeAll);
    }, [employees]);

    useEffect(() => {
        setLoading(false);
        setErrors(defaultErrors);
        if (data && data?.task?.id) {
            update(data);
        } else {
            create(data);
        }
    }, [data]);

    useEffect(() => {
        if (accountId) {
            loadAccountContactActivity();
        }
    }, [accountId]);

    const loadAccountContactActivity = () => {
        CrmAccountApi.getContactId(accountId).then((res) => {
            if (res) {
                setAccountContactActivity(res);
            } else {
                setAccountContactActivity([]);
            }
        });
    };

    useImperativeHandle(ref, () => ({
        /**
         * show dialog
         */
        show: () => {
            setShow(true);
        },

        /**
         * hide dialog
         */
        hide: () => {
            setShow(false);
            if (refAttachments.current) {
                refAttachments.current.reload();
            }
        },
        reloadAttachment: () => {
            if (refAttachments.current) {
                refAttachments.current.reload();
            }
        },

        /**
         * get task
         */
        get: async () => {
            return await combineTaskInfos();
        },

        /**
         * set task
         */
        set: () => { },

        /**
         * get edit mode
         * @returns
         */
        getEditMode: () => {
            return refEditMode.current;
        },

        /**
         * set loading
         * @param {*} loading
         */
        setLoading: (loading) => {
            setLoading(loading || false);
        },

        /**
         * validate
         * @returns
         */
        validate: () => {
            return prepareTaskBeforeSubmit();
        },

        /**
         * submit modules
         * @param {*} _task
         * @returns
         */
        submitModules: async (_task) => {
            return await submitModules(_task);
        },
    }));

    /**
     * prepare involve
     * @param {*} _involves
     * @returns
     */
    const prepareInvolve = (_involves, _task) => {
        let _involvesObject = {};
        if (_involves && _involves.length > 0) {
            _involves.forEach((involve) => {
                let _involveIds = [];
                involve.involveIds?.map((o) => {
                    const _em = _.find(employees, { userId: o.id });
                    if (_em) {
                        _involveIds.push({
                            id: _em.id,
                            userId: _em.userId,
                            fullName: `${_em.employeeLastName
                                ? `${_em.employeeLastName} `
                                : ``
                                }${_em.employeeMiddleName
                                    ? `${_em.employeeMiddleName} `
                                    : ``
                                }${_em.employeeFirstName
                                    ? _em.employeeFirstName
                                    : ``
                                }`,
                        });
                    }
                });

                _involvesObject[involve.role] = {
                    ...involve,
                    involveIds: _involveIds.length ? _involveIds : null,
                };
            });
        }

        return _involvesObject;
    };

    /**
     * create
     */
    const create = async (data) => {
        if (data?.task) {
            data.task.startDate = new Date();
            data.task.priorityId = 4
        }
        initError(data?.task);
        refEditMode.current = Enumeration.crud.create;
        // set states
        prepareTask(data?.task);
        setInvolves(prepareInvolve(data?.involves, data?.task));
    };

    const initError = (_task) => {
        switch (_task?.activityTypeId) {
            case ACTIVITY_TYPE.TASK_OBJECT:
                setErrors(defaultErrorsTask);
                break;
            case ACTIVITY_TYPE.PHONE_CALL_OBJECT:
                setErrors(defaultErrorsPhone);
                break;
            case ACTIVITY_TYPE.EMAIL_OBJECT:
                setErrors(defaultErrorsEmail);
                break;
            case ACTIVITY_TYPE.APPOINTMENT_OBJECT:
                setErrors(defaultErrorsAppointment);
                break;
            default:
                setErrors(defaultErrors);
                break;
        }
    };

    const prepareTask = async (_task) => {
        if (_task) {
            // let contactId = null
            // if (_task.contactId) {
            //     contactId = await CrmContactApi.getById(_task.contactId).catch(() => {
            //     })
            // }
            // _task.contactId = contactId ? [{
            //     id: contactId.id,
            //     fullName: contactId.contactName
            // }] : []
            const objectType = _.find(TASK_OBJECT_TYPE_CONGIG, {
                id: _task.objectTypeId,
            });
            if (objectType) {
                _task.objectTypeValue = parseInt(_task[objectType.fieldId]);
                loadObjectTypeValues(_task.objectTypeId);
                if (_task.objectTypeValue) {
                    getObjectContacts(
                        _task.objectTypeId,
                        _task.objectTypeValue
                    );
                }
            }
        }
        setTask(_task);
    };

    const getObjectContacts = (_objectTypeId, _objectTypeValue) => {
        if (_objectTypeId && _objectTypeValue) {
            // switch (_objectTypeId) {
            //     case TASK_OBJECT_TYPE.ACCOUNT_OBJECT:
            //         getContactByAccountId(_objectTypeValue);
            //         break;
            //     case TASK_OBJECT_TYPE.LEAD_OBJECT:
            //         setContactAll([]);
            //         break;
            //     case TASK_OBJECT_TYPE.OPP_OBJECT:
            //         getContactByOppId(_objectTypeValue);
            //         break;
            //     case TASK_OBJECT_TYPE.QUOTE_OBJECT:
            //         getContactByQuoteId(_objectTypeValue);
            //         break;
            //     case TASK_OBJECT_TYPE.CONTRACT_OBJECT:
            //         getContactByContractId(_objectTypeValue);
            //         break;
            //     case TASK_OBJECT_TYPE.ORDER_OBJECT:
            //         getContactByOrderId(_objectTypeValue);
            //         break;
            // }
        } else {
            setContactAll([]);
        }
    };

    // const getContactByAccountId = (id) => {
    //     CrmAccountContactApi.getRelatedAccount(id, { objectTypeId: ACCOUNT_OBJECT.CONTACT }).then((res) => {
    //         if (res) {
    //             setListContact(res);
    //             let _contactAll = [];
    //             res.map((o) => {
    //                 _contactAll.push({
    //                     id: o.contactId,
    //                     fullName: o.contactName ? o.contactName : ``,
    //                 });
    //             });
    //             setContactAll(_contactAll);
    //         } else {
    //             setContactAll([]);
    //         }
    //     });
    // };

    // const getContactByOppId = (id) => {
    //     CrmSaleOpportunityApi.getById(id).then((res) => {
    //         if (res && res.accountId) {
    //             getContactByAccountId(res.accountId);
    //         } else {
    //             setContactAll([]);
    //         }
    //     });
    // };

    // const getContactByQuoteId = (id) => {
    //     CrmSaleQuoteApi.getById(id).then((res) => {
    //         if (res && res.opportunityId) {
    //             getContactByOppId(res.opportunityId);
    //         } else {
    //             setContactAll([]);
    //         }
    //     });
    // };

    // const getContactByContractId = (id) => {
    //     CrmSaleContractApi.getById(id).then((res) => {
    //         if (res && res.accountId) {
    //             getContactByAccountId(res.accountId);
    //         } else {
    //             setContactAll([]);
    //         }
    //     });
    // };

    // const getContactByOrderId = (id) => {
    //     CrmSaleOrderApi.getById(id).then((res) => {
    //         if (res && res.contractId) {
    //             getContactByContractId(res.contractId);
    //         } else {
    //             setContactAll([]);
    //         }
    //     });
    // };

    /**
     * update task
     */
    const update = (_data) => {
        _data = _data || _.cloneDeep(data);
        initError(_data?.task);
        refEditMode.current = Enumeration.crud.update;
        prepareTask(_data?.task);
        setInvolves(prepareInvolve(_data?.involves, _data?.task));
    };

    /**
     * validate
     * @param {*} props
     * @param {*} _task
     * @returns
     */
    const validateBasicInfo = async (props, _task) => {
        _task = _.cloneDeep(_task) || _.cloneDeep(task);
        let result = { ...errors },
            isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result.task) {
                props.push(property);
            }
        }

        console.log({
            _task
        });
        // validate props
        props.forEach((prop) => {
            switch (prop) {
                case "name":
                    result.task.name = _task.name
                        ? null
                        : `${t("crm.task-base.detail.subject")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    break;
                case "priorityId":
                    result.task.priorityId = _task.priorityId
                        ? null
                        : `${t("crm.task-base.detail.priority")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    break;
                case "objectTypeId":
                    result.task.objectTypeId = _task.objectTypeId
                        ? null
                        : `${t("crm.task-base.detail.object-type")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    break;
                case "objectTypeValue":
                    result.task.objectTypeValue = _task.objectTypeValue
                        ? null
                        : `${t("crm.task-base.detail.object-type-value")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    break;
                case "duration":
                    result.task.duration = _task.duration
                        ? null
                        : `${t("crm.task-base.detail.duration")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    if (
                        !result.task.duration &&
                        !REGEX_INT.test(_task.duration)
                    ) {
                        result.task.duration = `${t(
                            "crm.task-base.detail.duration"
                        )} ${t("crm.require.illegal")}`;
                    }
                    break;
                case "durationUnitId":
                    result.task.durationUnitId = _task.durationUnitId
                        ? null
                        : `${t("crm.task-base.detail.duration-unit")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    break;
                case "startDate":
                    result.task.startDate = _task.startDate
                        ? null
                        : `${t("crm.task-base.detail.start-date")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    if (_task.startDate && _task.deadline) {
                        if (
                            moment(_task.startDate).diff(
                                moment(_task.deadline),
                                "seconds"
                            ) >= 0
                        ) {
                            result.task.deadline = t(
                                "crm.task-base.detail.cant-be-before-expiration-date"
                            );
                        }
                    }
                    break;
                case "deadline":
                    result.task.deadline = _task.deadline
                        ? null
                        : `${t("crm.task-base.detail.deadline")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    if (_task.startDate && _task.deadline) {
                        if (
                            moment(_task.startDate).diff(
                                moment(_task.deadline),
                                "seconds"
                            ) >= 0
                        ) {
                            result.task.deadline = t(
                                "crm.task-base.detail.cant-be-before-expiration-date"
                            );
                        }
                    }
                    break;
                // case "closed_on":
                //     result.task.closed_on = _task.closed_on ? null : `${t('crm.task-base.detail.due-date')} ${t('message.cant-be-empty')}`
                //     if (_task.startDate && _task.closed_on) {
                //         if (moment(_task.startDate).diff(moment(_task.closed_on), "seconds") >= 0) {
                //             result.task.closed_on = t("crm.task-base.detail.cant-be-before-expiration-date")
                //         }
                //     }
                //     break;
                case "phoneNumber":
                    result.task.phoneNumber = _task.phoneNumber
                        ? null
                        : `${t("crm.task-base.detail.phone")} ${t(
                            "message.cant-be-empty"
                        )}`;
                    if (
                        _task.phoneNumber &&
                        !REGEX_PHONE.test(_task.phoneNumber)
                    ) {
                        result.task.phoneNumber = `${t(
                            "crm.task-base.detail.phone"
                        )} ${t("crm.require.phone")}`;
                    }
                    break;

                case "involvedPeople":
                    if (_task.activityTypeId === ACTIVITY_TYPE.EMAIL_OBJECT) {
                        result.task.involvedPeople = _task.involvedPeople
                            ? null
                            : `${t("crm.task-base.detail.email-involved-people")} ${t(
                                "message.cant-be-empty"
                            )}`;
                        if (
                            _task.involvedPeople &&
                            !REGEX_EMAIL.test(_task.involvedPeople)
                        ) {
                            result.task.involvedPeople = `${t(
                                "crm.task-base.detail.email-involved-people"
                            )} ${t("crm.require.phone")}`;
                        }
                        break;

                    } else result.task.involvedPeople = null
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let basicInfoErrors = [];
        for (const property in result.task) {
            if (!CommonFunction.isEmpty(result.task[property])) {
                isValid = false;
                basicInfoErrors.push(result.task[property]);
            }
        }
        refBasicInfoErrors.current = basicInfoErrors;

        return isValid;
    };

    /**
     * apply involve changes
     * @param {string} prop
     * @param {*} val
     */
    const applyInvolvesChange = async (involveType, val) => {
        let _involves = _.cloneDeep(involves);
        if (!_involves[involveType]) {
            _involves[involveType] = {
                involveIds: [],
                involveType: "user",
                role: involveType
            }
        }
        _involves[involveType].involveIds = val;
        validateInvolves([involveType], _involves);
        setInvolves(_involves);
    };

    /**
     * validate
     * @param {*} involveTypes
     * @param {*} _involves
     * @returns
     */
    const validateInvolves = (involveTypes, _involves) => {
        _involves = _involves || _.cloneDeep(involves);
        let result = { ...errors },
            isValid = true,
            _allErrors = [];

        // validate all props
        if (involveTypes.length === 0) {
            for (const property in result.involves) {
                involveTypes.push(property);
            }
        }

        // validate props
        involveTypes.forEach((involveType) => {
            switch (involveType) {
                case "REQUESTER":
                    const _err = _involves.REQUESTER
                        .involveIds?.length
                        ? null
                        : `${t(`crm.task-base.detail.involve-REQUESTER`)} ${t(
                            "message.cant-be-empty"
                        )}`
                    result.involves.REQUESTER = _err
                    if (_err) {
                        _allErrors.push(_err)
                    }

                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        for (const property in result.task) {
            if (!CommonFunction.isEmpty(result.task[property])) {
                isValid = false;
                break;
            }
        }

        return [isValid, _allErrors];
    };

    /**
     * combine all state into task
     */
    const combineTaskInfos = async () => {
        let [_task, isValid, errors] = await prepareTaskBeforeSubmit();

        return {
            editMode: refEditMode.current,
            isValid: isValid,
            errors: errors,
            task: _task,
        };
    };

    /**
     * submit task
     * @param {*} _task
     */
    const submit = async (_task, callback) => {
        _task = _task || {
            task: _.cloneDeep(task),
        };
        let isValid = true,
            res = null,
            allErrors = null,
            editMode = refEditMode.current;

        // prepare data before submit
        [_task, isValid, allErrors] = await prepareTaskBeforeSubmit(_task);
        let [isInvolveValid, involveErrors] = validateInvolves([]);
        if (!isInvolveValid) {
            allErrors = allErrors.concat(involveErrors);
        }

        if (isValid && isInvolveValid) {
            setLoading(true);

            let _involves = [];
            for (const involveType in involves) {
                _involves.push({
                    ...involves[involveType],
                    involveIds: involves[involveType].involveIds
                        ? involves[involveType].involveIds?.map((m) => m.userId)
                        : [],
                });
            }
            const objectType = _.find(TASK_OBJECT_TYPE_CONGIG, {
                id: _task.task.objectTypeId,
            });
            if (objectType) {
                _task.task[objectType.fieldId] = _task.task.objectTypeValue;
            }

            let contactId = _task.task.contactId;

            // if(moduleName === 'activity'){
            //     contactId = _task.task.contactId
            // }else
            //     contactId = _task.task.contactId && _task.task.contactId.length ? _task.task.contactId[0].id : null

            switch (editMode) {
                case Enumeration.crud.create:
                    // create task
                    res = await CrmMdActivityApi.create({
                        task: {
                            ..._task.task,
                            contactId: contactId,
                        },
                        involves: _involves,
                        checklists: [],
                    });
                    if (res) {
                        // create success, change mode to update
                        refEditMode.current = Enumeration.crud.update;
                    }
                    break;
                case Enumeration.crud.update:
                    // update task
                    res = await CrmMdActivityApi.update(
                        {
                            task: {
                                ..._task.task,
                                contactId: contactId,
                            },
                            involves: _involves,
                            checklists: [],
                        },
                        _task.task.id
                    );
                    break;
                default:
                    break;
            }
            // submit modules
            let submitModulesResult = true;
            if (res) {
                submitModulesResult = await submitModules(res);
            }

            if (res && submitModulesResult) {
                // callback
                if (callback && typeof callback === "function") {
                    res = await callback(res);
                } else {
                    update(res);
                    onHideDialog();
                    if (cancel) {
                        cancel();
                    }
                }

                // call event
                if (afterSubmit && typeof afterSubmit === "function") {
                    await afterSubmit(editMode, res);
                }

                // get new task and change mode to update
                // update(res);

                CommonFunction.toastSuccess(t("common.save-success"));
            }
            // }
            setLoading(false);
        } else {
            CommonFunction.toastWarning(allErrors);
        }
    };

    /**
     * submit modules: attachments
     */
    const submitModules = async (_task) => {
        let success = true,
            reloadModules = [];

        for (let i = 0; i < entityModules.length; i++) {
            const _module = entityModules[i];

            if (_module === "attachment") {
                let attachmentSubmitResult = await submitAttachments(_task);
                success = attachmentSubmitResult;
                reloadModules.push(_module);
            }
        }

        // reload module data
        if (success && reloadModules.length > 0) {
            for (let i = 0; i < reloadModules.length; i++) {
                switch (reloadModules[i]) {
                    case "attachment":
                        refAttachments.current.reload();
                        break;
                    default:
                        break;
                }
            }
        }

        return success;
    };

    /**
     * submit attachments
     * @param {*} _task
     */
    const submitAttachments = async (_task) => {
        let _attachment = refAttachments.current.get();
        let refId = _task.task.id,
            application = entityApplication,
            refType = entityRefType,
            changedData = _attachment.changedData;

        // submit attachments
        let success = true;
        try {
            await Promise.all(
                (function* () {
                    for (let _attachment of changedData) {
                        yield new Promise((resolve, reject) => {
                            let _file = _attachment.file;
                            let _data = {
                                application: application,
                                refType: refType,
                                refId: refId,
                                name: _attachment.name,
                                versionNo: _attachment.versionNo,
                                description: _attachment.description,
                                businessType: _attachment.businessType,
                            };

                            switch (_attachment.state) {
                                case Enumeration.crud.create:
                                    TaskBaseApi.createAttachments(
                                        null,
                                        _file ? _file.fileContent : null,
                                        _data
                                    ).then((res) => {
                                        if (!res) {
                                            success = false;
                                        }
                                        resolve("");
                                    });
                                    break;
                                case Enumeration.crud.update:
                                    TaskBaseApi.updateAttachments(
                                        null,
                                        _attachment.id,
                                        _file.id ? null : _file.fileContent,
                                        _data
                                    ).then((res) => {
                                        if (!res) {
                                            success = false;
                                        }
                                        resolve("");
                                    });
                                    break;
                                case Enumeration.crud.delete:
                                    TaskBaseApi.deleteAttachments(
                                        null,
                                        _attachment.id,
                                        _file.id ? null : _file.fileContent,
                                        _data
                                    ).then((res) => {
                                        if (!res) {
                                            success = false;
                                        }
                                        resolve("");
                                    });
                                    break;
                                default:
                                    resolve("");
                                    break;
                            }
                        });
                    }
                })()
            );
        } catch (error) {
            CommonFunction.toastError();
            success = false;
        }

        return success;
    };

    /**
     * prepare task before submit
     * @param {*} _task
     */
    const prepareTaskBeforeSubmit = async (_task) => {
        let isValid = true,
            allErrors = [];

        _task = _.cloneDeep(_task) || { task: _.cloneDeep(task) };

        // prepare others module
        for (let i = 0; i < entityModules.length; i++) {
            let module = entityModules[i],
                moduleErrors = [];

            if (module === "base_info") {
                [moduleErrors, _task] = await prepareBaseInfo(_task);
            } else if (module === "checklist") {
                [moduleErrors, _task] = prepareCheckList(_task);
            } else if (module === "attachment") {
                [moduleErrors, _task] = prepareAttachment(_task);
            }

            if (moduleErrors && moduleErrors.length > 0) {
                isValid = false;
                allErrors = allErrors.concat([...moduleErrors]);
            }
        }

        return [_task, isValid, allErrors];
    };

    /**
     * validate basic info
     */
    const prepareBaseInfo = async (_task) => {
        // validate to get errors
        await validateBasicInfo([], _task.task);

        // prepare task
        ["companyId", "responsibleId", "groupId"].forEach((editProps) => {
            if (
                _task.task[editProps] &&
                typeof _task.task[editProps] === "object" &&
                _task.task[editProps].id
            ) {
                _task.task[editProps] = _task.task[editProps].id;
            }
        });

        // delete unneccesary properties
        ["createBy", "updateBy"].forEach((p) => {
            if (_task.task.hasOwnProperty(p)) delete _task.task[p];
        });

        // prepare involves
        if (involves && Object.keys(involves).length) {
            let _involves = [];
            for (const involveType in involves) {
                _involves.push({
                    ...involves[involveType],
                    involveIds: involves[involveType].involveIds
                        ? involves[involveType].involveIds?.map((m) => m.id)
                        : [],
                });
            }
            _task.involves = _involves;
        }

        return [refBasicInfoErrors.current, _task];
    };

    /**
     * validate check list
     */
    const prepareCheckList = (_task) => {
        let _checklists = refTodo.current.get();
        if (_checklists.valid) {
            _task.checklists = _checklists.data;
        }

        return [_checklists.errors, _task];
    };

    /**
     * validate check list
     */
    const prepareAttachment = (_task) => {
        let _attachments = refAttachments.current.get();
        return [_attachments.errors, _task];
    };

    /**
     * change state
     * @param {*} state
     */
    const changeState = (state) => {
        // submit before change state
        submit(null, async (_task) => {
            // after submit success, call change state
            let res = await CrmMdActivityApi.changeState(_task.task.id, state);

            refChangeStageMenu.current.hide();
            update({
                ..._task,
                task: res.task,
            });
            return res;
        });
    };

    const applyServiceChange = (prop, val) => {
        let _task = _.cloneDeep(task);
        switch (prop) {
            case "objectTypeId":
                _task["objectTypeValue"] = null;
                _task["contactId"] = null;
                break;
            case "objectTypeValue":
                _task["contactId"] = null;
                break;
        }
        _task[prop] = val;
        validateBasicInfo([prop], _task);
        setTask(_task);
    };

    const handleChangeName = (e) => {
        applyServiceChange("name", e.target.value);
    };

    const handleChangePriority = (e) => {
        applyServiceChange("priorityId", e.value);
    };

    const handleChangeTaskType = (e) => {
        applyServiceChange("taskTypeId", e.value);
    };

    const handleChangeTo = (e) => {
        applyServiceChange("contactId", e.value);
    };
    const handleChangeResponsible = (role) => (e) => {
        applyInvolvesChange(role, e.value);
    };

    const handleChangeStartDate = (value) => {
        applyServiceChange("startDate", value);
    };

    const handleChangePhoneNumber = (e) => {
        applyServiceChange("phoneNumber", e.target.value);
    };

    const handleChangeDeadline = (value) => {
        if (!task.deadline && value) {
            const deadline = new Date(value);
            if (deadline.getHours() == 0 && deadline.getMinutes() == 0) {
                value = moment(value).add(23, "h").add(59, "m").toDate();
            }
        }
        applyServiceChange("deadline", value);
    };

    const handleChangeClosedOn = (value) => {
        applyServiceChange("closed_on", value);
    };

    const handleChangeDescription = (value) => {
        applyServiceChange("description", value);
    };

    const handleChangeDurationUnit = (e) => {
        applyServiceChange("durationUnitId", e.value);
    };

    const handleChangeDuration = (e) => {
        applyServiceChange("duration", e.target.value);
    };

    const handleChangeInvolvedPeople = (e) => {
        applyServiceChange("involvedPeople", e.target.value);
    };

    const handleChangObjectType = (e) => {
        applyServiceChange("objectTypeId", e.value);
        loadObjectTypeValues(e.value);
    };

    const handleChangObjectTypeValue = (e) => {
        applyServiceChange("objectTypeValue", e.value);
        getObjectContacts(task.objectTypeId, e.value);
    };
    const handleChangValue = (e) => {
        applyServiceChange("contactId", e.value);
    };

    const loadObjectTypeValues = (id) => {
        const _objectVal = _.find(TASK_OBJECT_TYPE_CONGIG, { id });
        if (_objectVal) {
            _objectVal.api
                .getAll({
                    status: 1,
                })
                .then((res) => {
                    if (res) {
                        let _vals = res.map((o) => {
                            return {
                                id: o.id,
                                name:
                                    id === TASK_OBJECT_TYPE.CONTRACT_OBJECT
                                        ? `${o[_objectVal.fieldName]} - ${o["contractNumberInput"] || ""
                                        }`
                                        : o[_objectVal.fieldName],
                            };
                        });
                        setObjectTypeValues(_vals);
                    } else {
                        setObjectTypeValues([]);
                    }
                });
        }
    };

    /**
     * render base task info
     * @returns
     */
    const renderBaseInfo = () => {
        return (
            <>
                <div className="">
                    <div className="p-fluid fluid formgrid grid p-m-0">
                        {refEditMode.current !== Enumeration.crud.create && (
                            <>
                                <div className="col-6 px-3 py-1">
                                    <CrmFieldEdittingValue
                                        label={t("task.state")}
                                    >
                                        <div className="field">
                                            <span className="">
                                                <Task_State
                                                    state={task.state}
                                                    className="border-all"
                                                >
                                                    {t(
                                                        `task.state.${task.state}`
                                                    )}
                                                </Task_State>
                                            </span>
                                        </div>
                                    </CrmFieldEdittingValue>
                                </div>
                                <div className="col-6 px-3 py-1"></div>
                            </>
                        )}
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.subject")}
                                require={true}
                            >
                                <div className="field">
                                    <span className="">
                                        <InputText
                                            value={task.name}
                                            onChange={handleChangeName}
                                        />
                                    </span>
                                    {errors.task["name"] && (
                                        <small className="p-invalid">
                                            {errors.task["name"]}
                                        </small>
                                    )}
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.priority")}
                                require={true}
                            >
                                <div className="field">
                                    <span className="">
                                        <Dropdown
                                            id="product-priority"
                                            options={priorities}
                                            optionLabel="priorityName"
                                            optionValue="id"
                                            filter
                                            filterBy="priorityName"
                                            value={task.priorityId}
                                            onChange={handleChangePriority}
                                            disabled={readOnly}
                                        />
                                    </span>
                                    {errors.task["priorityId"] && (
                                        <small className="p-invalid">
                                            {errors.task["priorityId"]}
                                        </small>
                                    )}
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.object-type")}
                                require={true}
                            >
                                <div className="field">
                                    <span className="">
                                        <Dropdown
                                            id="product-object-type"
                                            options={objectTypes}
                                            optionLabel="name"
                                            optionValue="id"
                                            filter
                                            filterBy="name"
                                            value={task.objectTypeId}
                                            onChange={handleChangObjectType}
                                            disabled={readOnly || objectTypeId}
                                        />
                                    </span>
                                    {errors.task["objectTypeId"] && (
                                        <small className="p-invalid">
                                            {errors.task["objectTypeId"]}
                                        </small>
                                    )}
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t(
                                    "crm.task-base.detail.object-type-value"
                                )}
                                require={true}
                            >
                                <div className="field">

                                    <span className="">
                                        <Dropdown
                                            id="product-object-type-value"
                                            options={objectTypeValues}
                                            optionLabel="name"
                                            optionValue="id"
                                            filter
                                            filterBy="name"
                                            value={task.objectTypeValue}
                                            onChange={
                                                handleChangObjectTypeValue
                                            }
                                            disabled={
                                                readOnly ||
                                                !task.objectTypeId || objectTypeId
                                            }
                                        // disabled={true}
                                        />
                                    </span>
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.start-date")}
                                require={true}
                            >
                                <div className="field">
                                    {/*<span className="">*/}
                                    {/*    <XCalendar*/}
                                    {/*        showTime*/}
                                    {/*        value={task.startDate}*/}
                                    {/*        onChange={handleChangeStartDate}*/}
                                    {/*        require*/}
                                    {/*    />*/}
                                    {/*</span>*/}
                                    <span className="">
                                        <XCalendar
                                            showTime
                                            value={task.startDate}
                                            onChange={handleChangeStartDate}
                                        />
                                    </span>
                                    {errors.task["startDate"] && (
                                        <small className="p-invalid">
                                            {errors.task["startDate"]}
                                        </small>
                                    )}
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.deadline")}
                                require={true}
                            >
                                <div className="field">
                                    <span className="">
                                        <XCalendar
                                            showTime
                                            value={task.deadline}
                                            onChange={handleChangeDeadline}
                                            require
                                        />
                                    </span>
                                    {errors.task["deadline"] && (
                                        <small className="p-invalid">
                                            {errors.task["deadline"]}
                                        </small>
                                    )}
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm.task-base.detail.due-date")}
                            >
                                <div className="field">
                                    <span className="">
                                        <XCalendar
                                            showTime
                                            value={task.closedOn}
                                            onChange={handleChangeClosedOn}
                                            disabled={true}
                                        />
                                    </span>
                                </div>
                            </CrmFieldEdittingValue>
                        </div>
                        {task?.activityTypeId == ACTIVITY_TYPE.TASK_OBJECT
                            ? renderAdditonTaskInfo()
                            : task?.activityTypeId ==
                                ACTIVITY_TYPE.PHONE_CALL_OBJECT
                                ? renderAdditonPhoneCallInfo()
                                : task?.activityTypeId == ACTIVITY_TYPE.EMAIL_OBJECT
                                    ? renderAdditonEmailInfo()
                                    : task?.activityTypeId ==
                                        ACTIVITY_TYPE.APPOINTMENT_OBJECT
                                        ? renderAdditonAppointmentInfo()
                                        : null}

                        <div className="col-12 px-3 py-1">
                            <Task_Attachment
                                mode={readOnly === true ? "view" : ""}
                                ref={refAttachments}
                                application={entityApplication}
                                refType={entityRefType}
                                taskId={task?.id}
                                allowSign={false}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const renderInvolves = (key) => {
        const _involve = involves[key] ?? {
            role: key,
            involveIds: [],
        };
        return (
            <div className="col-6 px-3 py-1">
                <CrmFieldEdittingValue
                    label={t(`crm.task-base.detail.involve-${_involve.role}`)}
                    require={_involve.role == "REQUESTER"}
                >
                    <div className="field">
                        <span className="">
                            <UserAutoComplete
                                id={`product-involve-${_involve.role}`}
                                users={employeeAll}
                                value={_involve.involveIds}
                                onChange={handleChangeResponsible(
                                    _involve.role
                                )}
                                disabled={readOnly}
                                multiple={
                                    _involve.role == "ASSIGNEE" ||
                                    _involve.role == "RESPONSIBLE"
                                }
                            />
                        </span>
                        {errors.involves[_involve.role] && (
                            <small className="p-invalid">
                                {errors.involves[_involve.role]}
                            </small>
                        )}
                    </div>
                </CrmFieldEdittingValue>
            </div>
        );
    };

    const renderDescription = () => {
        return (
            <div className="col-12 px-3 py-1">
                <CrmFieldEdittingValue
                    label={t("crm.task-base.detail.description")}
                >
                    <div className="field">
                        <span className="">
                            <XEditor
                                ref={refDescription}
                                value={task.description}
                                onBlur={handleChangeDescription} // preferred to use only this option to update the content for performance reasons
                                config={{
                                    // placeholder: t("crm.task-base.detail.description"),
                                    buttons: [
                                        "bold",
                                        "strikethrough",
                                        "underline",
                                        "italic",
                                        "|",
                                        "superscript",
                                        "subscript",
                                        "|",
                                        "ul",
                                        "ol",
                                        "|",
                                        "indent",
                                        "outdent",
                                        "|",
                                        "align",
                                        "font",
                                        "fontsize",
                                        "paragraph",
                                        "|",
                                        "image",
                                        "table",
                                        "link",
                                        "|",
                                    ],
                                    useSearch: false,
                                    spellcheck: false,
                                    showCharsCounter: false,
                                    showWordsCounter: false,
                                    showXPathInStatusbar: false,
                                    height: "auto",
                                    minHeight: 40,
                                    maxHeight: 400,
                                    language:
                                        CommonFunction.getCurrentLanguage(),
                                }}
                            ></XEditor>
                        </span>
                    </div>
                </CrmFieldEdittingValue>
            </div>
        );
    };

    /**
     * render base task info
     * @returns
     */
    const renderAdditonTaskInfo = () => {
        return (
            <>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.task-types")}
                    >
                        <div className="field">
                            <span className="">
                                <Dropdown
                                    id="product-task-types"
                                    options={taskTypes}
                                    optionLabel="taskTypeName"
                                    optionValue="id"
                                    filter
                                    filterBy="taskTypeName"
                                    value={task.taskTypeId}
                                    onChange={handleChangeTaskType}
                                    disabled={readOnly}
                                />
                            </span>
                            {errors.task["taskTypeId"] && (
                                <small className="p-invalid">
                                    {errors.task["taskTypeId"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                {renderInvolves(`REQUESTER`)}

                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue label={t("crm.task-base.detail.to")}>
                        <div className="field">
                            {task.objectTypeId === 2 ||
                                task.objectTypeId === 4 ||
                                task.objectTypeId === 5 ||
                                task.objectTypeId === 6 ||
                                task.objectTypeId === 7 ? (
                                <Dropdown
                                    id="product-object-type-value"
                                    options={listContact}
                                    optionLabel="contactName"
                                    optionValue="contactId"
                                    filter
                                    filterBy="contactName"
                                    value={task.contactId}
                                    onChange={handleChangValue}
                                    disabled={
                                        readOnly || !task.objectTypeId
                                    }
                                // disabled={true}
                                />
                            ) : (
                                <Dropdown
                                    id="product-object-type-value"
                                    options={accountContactActivity}
                                    optionLabel="contactName"
                                    optionValue="contactId"
                                    filter
                                    filterBy="contactName"
                                    value={task.contactId}
                                    onChange={handleChangValue}
                                    disabled={readOnly || task.objectTypeId}
                                // disabled={true}
                                />
                            )}
                            {errors.task["contactId"] && (
                                <small className="p-invalid">
                                    {errors.task["contactId"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                {renderInvolves(`RESPONSIBLE`)}
                {renderDescription()}
            </>
        );
    };

    /**
     * render base task info
     * @returns
     */
    const renderAdditonPhoneCallInfo = () => {
        return (
            <>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.phone")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <InputText
                                    id="product-phone"
                                    value={task.phoneNumber}
                                    onChange={handleChangePhoneNumber}
                                />
                            </span>
                            {errors.task["phoneNumber"] && (
                                <small className="p-invalid">
                                    {errors.task["phoneNumber"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.involved-people")}
                    >
                        <div className="field">
                            <span className="">
                                <InputText
                                    id="product-involved-people"
                                    value={task.involvedPeople}
                                    onChange={handleChangeInvolvedPeople}
                                />
                            </span>
                            {errors.task["involvedPeople"] && (
                                <small className="p-invalid">
                                    {errors.task["involvedPeople"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.duration")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <InputText
                                    id="product-duration"
                                    value={task.duration}
                                    onChange={handleChangeDuration}
                                />
                            </span>
                            {errors.task["duration"] && (
                                <small className="p-invalid">
                                    {errors.task["duration"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                {renderInvolves(`REQUESTER`)}
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.duration-unit")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <Dropdown
                                    id="product-duration-unit"
                                    options={durationUnits}
                                    optionLabel="durationUnitName"
                                    optionValue="id"
                                    filter
                                    filterBy="durationUnitName"
                                    value={task.durationUnitId}
                                    onChange={handleChangeDurationUnit}
                                    disabled={readOnly}
                                />
                            </span>
                            {errors.task["durationUnitId"] && (
                                <small className="p-invalid">
                                    {errors.task["durationUnitId"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>

                {renderInvolves(`RESPONSIBLE`)}
                {renderDescription()}
            </>
        );
    };

    /**
     * render base task info
     * @returns
     */
    const renderAdditonEmailInfo = () => {
        return (
            <>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.email-involved-people")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <InputText
                                    id="product-involved-people"
                                    value={task.involvedPeople}
                                    onChange={handleChangeInvolvedPeople}
                                />
                            </span>
                            {errors.task["involvedPeople"] && (
                                <small className="p-invalid">
                                    {errors.task["involvedPeople"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                {renderInvolves(`REQUESTER`)}
                {renderInvolves(`RESPONSIBLE`)}
                {renderDescription()}
            </>
        );
    };

    /**
     * render base task info
     * @returns
     */
    const renderAdditonAppointmentInfo = () => {
        return (
            <>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.duration")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <InputText
                                    id="product-duration"
                                    value={task.duration}
                                    onChange={handleChangeDuration}
                                />
                            </span>
                            {errors.task["duration"] && (
                                <small className="p-invalid">
                                    {errors.task["duration"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue label={t("crm.task-base.detail.to")}>
                        <div className="field">
                            <span className="">
                                <Dropdown
                                    id="product-object-type-value"
                                    options={contactAll}
                                    optionLabel="fullName"
                                    optionValue="id"
                                    filter
                                    filterBy="fullName"
                                    value={task.contactId}
                                    onChange={handleChangValue}
                                    disabled={
                                        readOnly ||
                                        task.objectTypeId ==
                                        TASK_OBJECT_TYPE.LEAD_OBJECT
                                    }
                                // disabled={true}
                                />

                                {/* <UserAutoComplete
                                id="product-to"
                                users={contactAll}
                                value={task.contactId}
                                onChange={handleChangeTo}
                                disabled={readOnly || task.objectTypeId == TASK_OBJECT_TYPE.LEAD_OBJECT}
                            /> */}
                            </span>
                            {errors.task["contactId"] && (
                                <small className="p-invalid">
                                    {errors.task["contactId"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                <div className="col-6 px-3 py-1">
                    <CrmFieldEdittingValue
                        label={t("crm.task-base.detail.duration-unit")}
                        require={true}
                    >
                        <div className="field">
                            <span className="">
                                <Dropdown
                                    id="product-duration-unit"
                                    options={durationUnits}
                                    optionLabel="durationUnitName"
                                    optionValue="id"
                                    filter
                                    filterBy="durationUnitName"
                                    value={task.durationUnitId}
                                    onChange={handleChangeDurationUnit}
                                    disabled={readOnly}
                                />
                            </span>
                            {errors.task["durationUnitId"] && (
                                <small className="p-invalid">
                                    {errors.task["durationUnitId"]}
                                </small>
                            )}
                        </div>
                    </CrmFieldEdittingValue>
                </div>
                {renderInvolves(`REQUESTER`)}
                {renderInvolves(`ASSIGNEE`)}
                {renderInvolves(`RESPONSIBLE`)}
                {renderDescription()}
            </>
        );
    };

    /**
     * render custom module
     */
    const renderCustomModule = (module, index) => {
        // check valid module config
        let hasTitle = module.icon || module.title;
        if (
            module.renderer &&
            typeof module.renderer === "function" &&
            module.visible !== false
        ) {
            return (
                <>
                    {hasTitle && (
                        <XLayout_Title
                            className={classNames({
                                "task-block-title": true,
                                "p-mt-0": index === 0,
                            })}
                        >
                            <i
                                className={module.icon || "bx bxs-component"}
                            ></i>
                            {module.title || "..."}
                        </XLayout_Title>
                    )}
                    <div
                        className={classNames({
                            "task-block-content": hasTitle,
                        })}
                    >
                        {module.renderer()}
                    </div>
                </>
            );
        }

        return <></>;
    };

    const onSave = () => {
        submit();
    };

    /**
     * return content
     * @returns
     */
    const renderContent = () => {
        return (
            <>
                <XLayout>
                    {!disableToolbar && task.id && (
                        <XLayout_Top className="task-base-x-toolbar">
                            <XToolbar
                                left={
                                    toolbar &&
                                        toolbar.left &&
                                        typeof toolbar.left === "function"
                                        ? toolbar.left
                                        : () => (
                                            <>
                                                {refEditMode.current !==
                                                    Enumeration.crud.create &&
                                                    task["next-states"] &&
                                                    task["next-states"]
                                                        .length > 0 && (
                                                        <>
                                                            <div className="x-toolbar-separator"></div>
                                                            <Button
                                                                label={t(
                                                                    "task.change.state"
                                                                )}
                                                                icon="bx bx-transfer-alt"
                                                                onClick={(
                                                                    e
                                                                ) =>
                                                                    refChangeStageMenu.current.toggle(
                                                                        e
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                    )}
                                            </>
                                        )
                                }
                                center={
                                    toolbar &&
                                    toolbar.center &&
                                    typeof toolbar.center === "function" &&
                                    toolbar.center
                                }
                                right={
                                    toolbar &&
                                    toolbar.right &&
                                    typeof toolbar.right === "function" &&
                                    toolbar.right
                                }
                            ></XToolbar>
                        </XLayout_Top>
                    )}

                    <XLayout_Center className="task-blocks">
                        {disableToolbar &&
                            refEditMode.current !== Enumeration.crud.create &&
                            task["next-states"] &&
                            task["next-states"].length > 0 && (
                                <>
                                    <Button
                                        label={t("task.change.state")}
                                        icon="bx bx-transfer-alt"
                                        className="w-auto p-button-text mx-2"
                                        onClick={(e) =>
                                            refChangeStageMenu.current.toggle(e)
                                        }
                                    />
                                </>
                            )}

                        {entityModules.map((module, index) => (
                            <div
                                key={index}
                                className={`task-block module_${module}`}
                            >
                                {module === "base_info" && renderBaseInfo()}

                                {modulesDefinition &&
                                    modulesDefinition[module] &&
                                    renderCustomModule(
                                        modulesDefinition[module],
                                        index
                                    )}
                            </div>
                        ))}
                        {!disableFooterToolbar && (
                            <div className="flex justify-content-end align-items-center pb-3 px-2">
                                <Button
                                    onClick={cancel}
                                    label={t("common.cancel")}
                                    className="p-button-raised p-button-info p-button-text w-5rem mr-2 p-2"
                                />
                                <Button
                                    label={t("common.save")}
                                    loading={loading}
                                    icon="bx bxs-save "
                                    className="primary w-6rem"
                                    onClick={onSave}
                                />
                            </div>
                        )}
                    </XLayout_Center>
                </XLayout>

                <OverlayPanel ref={refChangeStageMenu} className="x-menu">
                    {task &&
                        task["next-states"] &&
                        task["next-states"].map((s, index) => (
                            <div
                                key={index}
                                className="x-menu-button"
                                onClick={() => changeState(s)}
                            >
                                <i className={Enumeration.task.ui[s].icon}></i>
                                <span>{t(`task.state.${s}`)}</span>
                            </div>
                        ))}
                </OverlayPanel>
            </>
        );
    };
    const header = () => {
        if (refEditMode.current == Enumeration.crud.create) {
            return (
                <div className="text-center text-2xl py-1">
                    {task?.activityTypeId == ACTIVITY_TYPE.TASK_OBJECT
                        ? t("crm.task-base.detail.sale-task.create")
                        : task?.activityTypeId ==
                            ACTIVITY_TYPE.PHONE_CALL_OBJECT
                            ? t("crm.task-base.detail.sale-phone-call.create")
                            : task?.activityTypeId == ACTIVITY_TYPE.EMAIL_OBJECT
                                ? t("crm.task-base.detail.sale-email.create")
                                : task?.activityTypeId ==
                                    ACTIVITY_TYPE.APPOINTMENT_OBJECT
                                    ? t("crm.task-base.detail.sale-appointment.create")
                                    : null}
                </div>
            );
        } else {
            return (
                <div className="text-center text-2xl py-1">
                    {task?.activityTypeId == ACTIVITY_TYPE.TASK_OBJECT
                        ? t("crm.task-base.detail.sale-task.update")
                        : task?.activityTypeId ==
                            ACTIVITY_TYPE.PHONE_CALL_OBJECT
                            ? t("crm.task-base.detail.sale-phone-call.update")
                            : task?.activityTypeId == ACTIVITY_TYPE.EMAIL_OBJECT
                                ? t("crm.task-base.detail.sale-email.update")
                                : task?.activityTypeId ==
                                    ACTIVITY_TYPE.APPOINTMENT_OBJECT
                                    ? t("crm.task-base.detail.sale-appointment.update")
                                    : null}
                </div>
            );
        }
    };

    const onHideDialog = () => {
        if (onHide && typeof onHide === "function") {
            onHide(() => {
                setShow(false);
            });
        } else {
            setShow(false);
        }
    };

    if (!task) {
        return <></>;
    } else if (dialog === false) {
        return renderContent();
    } else {
        return (
            <Dialog
                header={header}
                visible={show}
                modal
                contentClassName="over"
                className="p-fluid fluid crm-task-crm-detail"
                footer={
                    <>
                        <Button
                            label={t("common.cancel")}
                            className="p-button-text"
                            onClick={onHideDialog}
                        />
                        <Button
                            disabled={readOnly}
                            label={t("common.save")}
                            loading={loading}
                            icon="bx bxs-save"
                            className="primary"
                            onClick={onSave}
                        />
                    </>
                }
                onHide={onHideDialog}
            >
                <LoadingBar loading={loading} />
                {renderContent()}
            </Dialog>
        );
    }
}

TaskBaseCrmDetail = forwardRef(TaskBaseCrmDetail);

export default TaskBaseCrmDetail;

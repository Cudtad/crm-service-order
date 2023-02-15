import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import CommonFunction from '@lib/common';
import Enumeration from '@lib/enum';
import _ from 'lodash';
// import "features/task/scss/TaskBaseList.scss";
import "./scss/RuleActionSettings.scss";
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
// import "features/task/scss/TaskBaseList.scss";
import { TabPanel, TabView } from 'primereact/tabview';
import RuleActionApi from 'services/config/RuleActionApi';
import { MultiSelect } from 'primereact/multiselect';
import ConditionBuilder from './components/ConditionBuilder';
import FieldEntityApi from 'services/config/FieldEntityApi';
import ActionBuilder from './components/ActionBuilder';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

/**
 * props
 *      application: "" // application name
 *      entity: "" // entity name
 *      entityTypes: [{code:"", name: "", icon:""}, {code:"", name: "", icon: ""}] // array of entity types
 *      dialog: false // show in dialog or not, default false
 *      dialogHeader: "" // dialog's header
 *      ruleListWidth: "350px", // width of list, default 350px
 *      defaultRole: {}, // object default role
 *      customizeFields: async (_fields) => { return [
 *          {...field,
 *            renderer: (item) => (
 *                   <InputText
 *                       className="dense w-full"
 *                       onChange={(e) => {
 *                           CommonFunction.debounce(null, item.applyValue, e.target.value);
 *                       }}
 *                   />
 *               ),
 *             allowCondition: true, // allow choose in condition, default true
 *             allowAction: true, // allow choose in action, default true
 *       }] } // customize fields, if field has custom renderer, add renderer function, call item.applyValue for apply new value
 *       customizeDetail: async (detail) => { return detail } // customize detail after get from db
 *       beforeSubmit: async (conditions, actions, payload) => { return payload } // event before submit
 *       beforeConditionRenderer: () => <></>,
 *       afterConditionRenderer: () => <></>,
 *       beforeActionRenderer: () => <></>,
 *       afterActionRenderer: () => <></>
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function RuleActionSettings(props, ref) {
    const t = CommonFunction.t;
    const {
        application, entity, entityId, entityTypes, dialog, dialogHeader, ruleListWidth, defaultRole, customizeFields, customizeDetail, beforeSubmit,
        beforeConditionRenderer, afterConditionRenderer, beforeActionRenderer, afterActionRenderer
    } = props;
    const [selectedEntityType, setSelectedEntityType] = useState(entityTypes && entityTypes.length > 0 ? entityTypes[0] : null);
    const [loadingRules, setLoadingRules] = useState(false);
    const [loadingRuleDetail, setLoadingRuleDetail] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);
    const [impactingRule, setImpactingRule] = useState(null);
    const refEditMode = useRef(null);
    const [rules, setRules] = useState([]);
    const emptyFilter = { keyword: null };
    const [filterCondition, setFilterCondition] = useState(emptyFilter);
    const [show, setShow] = useState(false);
    const defaultErrors = {
        name: "",
        event: ""
    }
    const [errors, setErrors] = useState(defaultErrors);
    const refCurrentTypeFields = useRef(null);
    const refConditions = useRef(null);
    const refActions = useRef(null);
    const [conditionConfig, setConditionConfig] = useState(null);
    const [actionConfig, setActionConfig] = useState(null);

    useEffect(() => {
        loadRulesByType(entityTypes && entityTypes.length > 0 ? entityTypes[0].code : "");
    }, [])

    /**
     * load Fields by entity
     * @param {*} entityName
     */
    const loadRulesByType = async (type) => {
        setLoadingRules(true);

        // load rules
        let _rulesResponse = await RuleActionApi.getByEntityType(application, entity, type);
        if (_rulesResponse) {
            _rulesResponse = _.sortBy(_rulesResponse, ["name"]);
            setRules(_rulesResponse);
        }

        // load fields by type
        let _fieldsResponse = await FieldEntityApi.getConfigFields(application, entity, type);
        if (_fieldsResponse) {

            // default assign type
            _fieldsResponse.forEach(_field => {
                _field.allowCondition = true;
                _field.allowAction = true;

                _field.fieldId = _field.id;
                _field.fieldName = _field.code;
                _field.fieldType = _field.type;
                _field.fieldCode = _field.code;
                _field.fieldLabel = _field.name;

                ["id", "name", "type", "code"].forEach(p => delete _field[p]);

                // default list method for real field
                if (_field.customize === false && _field.fieldType === "LIST_SINGLE" && !_field.listMethod) {
                    _field.listMethod = "METHOD_ARRAY";
                }

                if (!_field.filterType) {
                    _field.filterType = _field.customize ? "CUSTOM_FIELD" : "FIELD";
                }

            });

            // customize field
            if (customizeFields && typeof customizeFields === "function") {
                _fieldsResponse = await customizeFields(_fieldsResponse, selectedEntityType.code);
            }
            refCurrentTypeFields.current = _fieldsResponse;
        }

        setLoadingRules(false);
    };

    /**
     * cancel submit
     */
    const cancel = () => {
        setShow(false)
    }

    /**
     * submit
     */
    const submit = async () => {
        let _conditions = refConditions.current.get();
        let _actions = refActions.current.get();

        let errors = [];

        // valid rule
        let [ruleValid, ruleErrors] = await validate([]);
        if (ruleErrors && ruleErrors.length > 0) {
            errors = [...ruleErrors];
        }

        // valid conditions
        if (!_conditions.conditions || _conditions.conditions.length === 0) {
            errors.push(t("rule-action.condition-empty"));
        } else if (!_conditions.isValid) {
            errors.push(t("rule-action.condition-not-valid"));
        }

        // valid actions
        if (!_actions.actions || _actions.actions.length === 0) {
            errors.push(t("rule-action.action-empty"));
        } else if (!_actions.isValid) {
            errors.push(t("rule-action.action-not-valid"));
        }

        if (errors.length > 0) {
            CommonFunction.toastWarning(errors);
        } else {
            // prepare config actions
            let _assign = { task: {}, fields: [] };
            _actions.actions.forEach(_action => {
                if (_action.customField && _action.customField.customize === true) {
                    _assign.fields.push({
                        fieldId: _action.customField.fieldId,
                        fieldCode: _action.customField.fieldCode,
                        values: _action.values,
                        displayValues: _action.displayValues
                    })
                } else if (_action.fieldId && _action.fieldId > 0) {
                    _assign.task[_action.customField.fieldCode] = ["LIST_MULTI"].indexOf(_action.customField.fieldType) > -1 ? _action.values : _action.values[0];
                }
            });

            let _impactingRule = _.cloneDeep(impactingRule);
            let payload = {
                id: _impactingRule.id,
                name: _impactingRule.name,
                event: _impactingRule.event.join(","),
                application: application,
                entity: entity,
                entityId: entityId ? entityId : 0,
                entityType: selectedEntityType.code
            }
            payload.conditions = _conditions.conditions;
            payload.actions = _actions.actions;
            payload.actionConfigs = [
                { assign: _assign }
            ];

            // prepare data before submit
            if (beforeSubmit && typeof beforeSubmit === "function") {
                payload = beforeSubmit(_conditions, _actions, payload);
                if (!payload) {
                    return;
                }
            }

            // remove actions unnecessary props for reduce db size
            payload.actions.forEach(_action => {
                ["customField", "_arrayIndex", "_parentPath", "_path", "valid", "id"].forEach(key => {
                    if (Object.hasOwnProperty.call(_action, key)) {
                        delete _action[key];
                    }
                })
            })

            // submit
            let res = null;
            switch (refEditMode.current) {
                case Enumeration.crud.create:
                    res = await RuleActionApi.create(payload);
                    if (res) {
                        let _rules = _.cloneDeep(rules);
                        _rules.unshift(res);
                        setRules(_rules);
                    }
                    break;
                case Enumeration.crud.update:
                    res = await RuleActionApi.update(payload);
                    break;
                default:
                    break;
            }

            if (res) {
                updateRuleAction(res.id);
                CommonFunction.toastSuccess(t("common.save-success"));
            }

        }
    }

    /**
     * on filter change
     * @param {*} key
     * @param {*} val
     */
    const onFilterChange = (change) => {
        // apply filter condition values
        let _filterCondition = { ...filterCondition, [change.key]: change.val };
        setFilterCondition(_filterCondition);
    }

    /**
     * change entity type
     */
    const changeEntityType = (type) => {
        setSelectedEntityType(type);
        setImpactingRule(null);
        setSelectedRule(null);
        loadRulesByType(type.code);
    }

    /**
     * create rule action
     */
    const createRuleAction = () => {
        refEditMode.current = Enumeration.crud.create;
        let _defaultRule = defaultRole || {
            application: application,
            entity: entity,
            entityType: selectedEntityType,
            name: "",
            conditions: [],
            expression: "",
            event: [],
            actionConfigs: []
        }
        setErrors(_.cloneDeep(defaultErrors));

        // condition config
        let _conditionConfig = {
            conditions: [],
            fields: _.cloneDeep(refCurrentTypeFields.current).filter(f => f.allowCondition === true)
        }
        setConditionConfig(_conditionConfig);

        if (customizeDetail && typeof customizeDetail === "function") {
            customizeDetail(
                {
                    actionConfigs: [
                        {
                            calculate: {
                                response: [],
                                resolve: []
                            }
                        }
                    ]
                }
            );
        }

        // action config
        let _actionConfig = {
            actions: [],
            fields: _.cloneDeep(refCurrentTypeFields.current).filter(f => f.allowAction === true)
        }
        setActionConfig(_actionConfig);

        setImpactingRule(_defaultRule);
        setSelectedRule(null);
    }


    /**
     * update rule action
     */
    const updateRuleAction = (id) => {
        setLoadingRuleDetail(true);
        setSelectedRule(id);

        // load rule
        RuleActionApi.get(id).then(async (res) => {
            if (res) {
                // prepare event
                res.event = res.event.replaceAll(" ", "").split(",");

                if (customizeDetail && typeof customizeDetail === "function") {
                    res = await customizeDetail(res);
                }

                // prepare condition config
                // -----------------------------------------
                let _conditionConfig = {
                    conditions: res.conditions,
                    fields: _.cloneDeep(refCurrentTypeFields.current).filter(f => f.allowCondition === true)
                }
                setConditionConfig(_conditionConfig);

                // preapre action config
                // -----------------------------------------
                let _actions = [];
                const _currentTypeFields = _.cloneDeep(refCurrentTypeFields.current);
                res.actions.forEach(_action => {
                    let _field = _currentTypeFields.find(f => f.fieldId === _action.fieldId); // find by id
                    if (!_field) {
                        _field = _currentTypeFields.find(f => f.fieldCode === _action.fieldCode); // find by code for custom config fields like involves,...
                    }

                    if (_field) {
                        _actions.push({
                            ..._action,
                            fieldId: _field.fieldId,
                            fieldName: _field.fieldName,
                            fieldCode: _field.fieldCode,
                            customField: _field,
                            valid: true,
                            id: CommonFunction.getIdNumber()
                        })
                    }
                });

                let _actionConfig = {
                    actions: _actions,
                    fields: _.cloneDeep(refCurrentTypeFields.current).filter(f => f.allowAction === true)
                }
                setActionConfig(_actionConfig);

                // set states
                // -----------------------------------------
                refEditMode.current = Enumeration.crud.update;
                setErrors(_.cloneDeep(defaultErrors));
                setImpactingRule(res);
                setLoadingRuleDetail(false);
            }
        })
    }

    /**
     * prepare value for action builder
     */
    const prepareValueForActionBuilder = (_field, value) => {
        let v = value;
        switch (_field.fieldType) {
            case "DATE":
            case "DATE_TIME":
                v = new Date(value);
                break;
            default:
                break;
        }
        return Array.isArray(v) ? v : [v]
    }

    /**
     * delete rule action
     */
    const deleteRuleAction = (rule) => {
        CommonFunction.showConfirm(t("confirm.delete.message").format(rule.name), t("confirm.delete.title"), () => {
            RuleActionApi.delete(rule.id).then(res => {
                if (res) {
                    let _rules = _.cloneDeep(rules);

                    // find rule index
                    let index = -1;
                    for (let i = 0; i < _rules.length; i++) {
                        if (_rules[i].id === rule.id) {
                            index = i;
                            break;
                        }
                    }

                    // remove from list
                    if (index > -1) {
                        _rules = [
                            ..._rules.slice(0, index),
                            ..._rules.slice(index + 1)
                        ];
                        setRules(_rules);

                        // remove active rule
                        setSelectedRule(null);
                        setImpactingRule(null);
                    }
                    CommonFunction.toastSuccess(t("common.delete-success"));
                }
            })
        })
    }


    /**
         * apply creating/editing service prop on input change
         * @param {string} prop
         * @param {*} val
         */
    const applyChange = async (prop, val) => {
        let rule = _.cloneDeep(impactingRule);

        rule[prop] = val;
        validate([prop], rule);
        setImpactingRule(rule);
    }

    /**
     * validate ticket
     * @param {*} props
     * @param {*} rule
     * @returns
     */
    const validate = async (props, rule) => {
        rule = rule || _.cloneDeep(impactingRule);
        let result = { ...errors }, isValid = true;

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
                    result.name = rule.name.length > 0 ? null : t("validate.required");
                    break;
                case "event":
                    result.event = rule.event && rule.event.length > 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let allErrors = []
        for (const property in result) {
            if (!CommonFunction.isEmpty(result[property])) {
                isValid = false;
                allErrors.push(result[property]);
            }
        }

        return [isValid, _.uniq(allErrors)];
    };

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

    const renderForm = () => {
        return (<>

            <XLayout className="rule-action-settings">

                {/* entity types */}
                {entityTypes && entityTypes.length > 0 &&
                    <XLayout_Top>
                        <TabView className="tab-menu mb-2">
                            {entityTypes.map((type, index) => (
                                // <TabPanel key={index} header={t(type.name)} leftIcon={type.icon} onClick={(e) => changeEntityType(type)} />
                                <TabPanel key={index} header={(
                                    <div className="rule-action-tab-item" onClick={() => changeEntityType(type)}>
                                        <span>{t(type.name)}</span>
                                    </div>
                                )} />
                            ))}
                        </TabView>
                    </XLayout_Top>
                }

                <XLayout_Center className="tab-menu-container px-2 pb-2">
                    <XLayout>
                        {/* custom fields */}
                        <XLayout_Left style={{ width: ruleListWidth || "350px" }} className="position-relative">
                            <LoadingBar loading={loadingRules} />
                            <XLayout>
                                <XLayout_Top className="mb-1">
                                    <XToolbar className="mb-2" left={() => (
                                        <Button
                                            icon="bx bx-git-branch create"
                                            label={t("rule-action.create")}
                                            onClick={createRuleAction}
                                        ></Button>
                                    )}></XToolbar>
                                    {/* <span className="w-full mb-2">
                                        <InputText
                                            className="w-full"
                                            placeholder={t("common.search")}
                                            onInput={(e) => CommonFunction.debounce(null, onFilterChange, { key: "keyword", val: e.target.value })} />
                                    </span> */}

                                </XLayout_Top>
                                <XLayout_Center className="rule-action-list">
                                    {
                                        rules.length === 0 &&
                                        <div className="flex w-full h-full align-items-center justify-content-center flex-column">
                                            <i className="bx bx-info-circle fs-40 text-grey-5"></i>
                                            <span className="mb-3 mt-1 fs-18 text-grey-7">{t("rule-action.empty")}</span>
                                            <Button
                                                icon="bx bx-git-branch"
                                                className="primary"
                                                label={t("rule-action.create")}
                                                onClick={createRuleAction}
                                            ></Button>

                                        </div>
                                    }
                                    {rules.length > 0 &&
                                        <XLayout_Box className="h-full p-0">
                                            <DataTable
                                                value={rules}
                                                selectionMode='single'
                                                selection={selectedRule}
                                                dataKey='id'
                                                showGridlines
                                                scrollable
                                                scrollHeight='flex'
                                                onSelectionChange={e => {
                                                    if (e.value && e.value.id) {
                                                        updateRuleAction(e.value.id)
                                                    }
                                                    setSelectedRule(e.value);
                                                }}
                                                filterDisplay="row"
                                            >
                                                <Column
                                                    header={t("rule-action.condition")}
                                                    filter
                                                    filterMatchMode="contains"
                                                    showFilterMenu={false}
                                                    showClearButton={false}
                                                    
                                                    field='name'
                                                ></Column>
                                                <Column
                                                    style={{ flex: "0 0 40px" }}
                                                    bodyClassName='p-0 flex justify-content-center align-items-center'
                                                    body={(rule) => (
                                                        <Button
                                                            icon='bx bx-trash-alt text-grey'
                                                            className="p-button-rounded p-button-text"
                                                            tooltip={t('common.delete')}
                                                            tooltipOptions={{ position: 'bottom' }}
                                                            onClick={() => deleteRuleAction(rule)}
                                                        />
                                                    )}
                                                ></Column>
                                            </DataTable>
                                            {/* <ListBox
                                                value={selectedRule}
                                                onChange={(e) => { if (e.value) updateRuleAction(e.value) }}
                                                options={rules}
                                                optionLabel="name"
                                                optionValue="id"
                                                filterBy="name"
                                                
                                                filter
                                                className='border-none show-grid-lines'
                                                itemTemplate={(option) => (
                                                    <React.Fragment>
                                                        <div className="rule-action-list-item">

                                                            <div className="item-info">
                                                                <span>{option.name}</span>
                                                            </div>

                                                            <div className="item-action">
                                                                <Button
                                                                    icon='bx bx-pencil text-grey'
                                                                    className="p-button-rounded p-button-text"
                                                                    tooltip={t('common.update')}
                                                                    tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                                    onClick={() => updateRuleAction(option.id)}
                                                                />

                                                                <Button
                                                                    icon='bx bx-trash-alt text-grey'
                                                                    className="p-button-rounded p-button-text"
                                                                    tooltip={t('common.delete')}
                                                                    tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                                    onClick={() => deleteRuleAction(option)}
                                                                />
                                                            </div>

                                                        </div>
                                                    </React.Fragment>
                                                )} /> */}
                                        </XLayout_Box>
                                    }
                                </XLayout_Center>
                            </XLayout>

                        </XLayout_Left>

                        {/* layout */}
                        <XLayout_Center className="position-relative">
                            <LoadingBar loading={loadingRuleDetail} />

                            {!impactingRule &&
                                <div className="rule-action-not-selected">
                                    <i className="bx bx-info-circle fs-40 text-grey-5"></i>
                                    <span className="mt-2 fs-18 text-grey-7">{t("rule-action.not-selected")}</span>
                                </div>
                            }

                            {impactingRule &&
                                <XLayout className="pl-2 position-relative">
                                    <LoadingBar loading={loadingRuleDetail}></LoadingBar>

                                    <XLayout_Top className="mb-1">
                                        <XToolbar left={() => (<>
                                            <Button icon="bx bxs-save" label={t('common.save')} onClick={submit}></Button>
                                        </>)}></XToolbar>

                                    </XLayout_Top>
                                    <XLayout_Center>
                                        {/* {JSON.stringify(impactingRule)} */}
                                        <div className="p-fluid fluid  formgrid grid p-0">
                                            <div className="col-12">
                                                <span className="p-float-label">
                                                    <InputText
                                                        
                                                        value={impactingRule.name}
                                                        onChange={(e) => applyChange("name", e.target.value)}
                                                    ></InputText>
                                                    <label className="require">{t("rule-action.name")}</label>
                                                    {renderErrors("name")}
                                                </span>
                                            </div>
                                            <div className="col-12">
                                                <span className="p-float-label">
                                                    <MultiSelect
                                                        value={impactingRule.event}
                                                        options={[
                                                            { code: "create_update", name: t("rule-action.event.create_update") },
                                                            { code: "create", name: t("rule-action.event.create") },
                                                            { code: "update", name: t("rule-action.event.update") },
                                                            { code: "change_state", name: t("rule-action.event.change_state") },
                                                        ]}
                                                        onChange={(e) => applyChange("event", e.value)}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        display="chip"
                                                    />
                                                    <label className="require">{t("rule-action.condition-event")}</label>
                                                    {renderErrors("event")}
                                                </span>
                                            </div>
                                        </div>

                                        <XLayout_Title>{t("rule-action.condition")}</XLayout_Title>

                                        {beforeConditionRenderer && typeof beforeConditionRenderer === "function" && beforeConditionRenderer()}

                                        <ConditionBuilder
                                            ref={refConditions}
                                            config={conditionConfig}
                                        ></ConditionBuilder>

                                        {afterConditionRenderer && typeof afterConditionRenderer === "function" && afterConditionRenderer()}

                                        {beforeActionRenderer && typeof beforeActionRenderer === "function" && beforeActionRenderer()}

                                        <XLayout_Title>{t("rule-action.assign")}</XLayout_Title>
                                        <XLayout_Box className="pl-0">
                                            <ActionBuilder
                                                ref={refActions}
                                                config={actionConfig}
                                            ></ActionBuilder>
                                        </XLayout_Box>

                                        {afterActionRenderer && typeof afterActionRenderer === "function" && afterActionRenderer()}

                                    </XLayout_Center>
                                </XLayout>
                            }

                        </XLayout_Center>
                    </XLayout>
                </XLayout_Center>
            </XLayout>
        </>)
    }

    return (
        <>
            {dialog &&
                <Dialog
                    header={dialogHeader}
                    visible={show}
                    className="wd-1024-768"
                    onHide={cancel}
                    footer={
                        <>
                            <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={cancel} />
                            <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} />
                        </>
                    }
                >
                    {renderForm()}
                </Dialog>
            }
            {!dialog && renderForm()}

        </>
    )
}

RuleActionSettings = forwardRef(RuleActionSettings);

export default RuleActionSettings;

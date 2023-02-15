import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import * as _ from 'lodash';

import './scss/ActionBuilder.scss';
import CommonFunction from '@lib/common';
import classNames from 'classnames';
import {Dropdown} from 'primereact/dropdown';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import {MultiSelect} from 'primereact/multiselect';
import {Calendar} from 'primereact/calendar';
import Enumeration from '@lib/enum';
import XAutoComplete from 'components/autocomplete/XAutoComplete';
import SystemEventApi from 'services/SystemEventApi';
import DynamicOutbounceDataTemplate from 'components/autocomplete/DynamicOutbounceDataTemplate';

/**
 * props
 *      id: null // in case use multiple conditions in 1 form
 *      config: {
 *          fields: [{...field,
 *              renderer: {
 *                  action: (item) => (<InputText onChange={(e) => { CommonFunction.debounce(null, item.applyValue, e.target.value); }} />)
 *              }  // fields from config/fields, use custom renderer by renderer property, use item.apply to apply new value
 *          }]
 *          actions: [] // current actions
 *       }
 *      afterActionChange: asyn () => {} // event after action change
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function ActionBuilder(props, ref) {

    const t = CommonFunction.t;

    const { id, config, afterActionChange } = props;

    const [actions, setActions] = useState([]);
    const [fieldsOptions, setFieldsOptions] = useState({});

    const actionBuilderId = useRef(CommonFunction.getIdNumber());

    const COMPONENT_STYLE = {
        CUSTOM_FIELD: { width: "300px", maxWidth: "300px", minWidth: "300px" },
        OPERATOR: { width: "120px", maxWidth: "120px", minWidth: "120px" },
        CONDITION_SINGLE: { flex: "1 1 auto", width: "0", maxWidth: "100%" },
        CONDITION_DOUBLE: { flex: "1 1 auto", width: "0", maxWidth: "50%" }
    }

    const BOOLEAN_OPTIONS = [
        { name: t("condition-builder.boolean.true"), value: "true" },
        { name: t("condition-builder.boolean.false"), value: "false" },
    ]

    useEffect(() => {
        if (config) {
            // prepare condition
            if (config.actions && Array.isArray(config.actions) && config.actions.length > 0) {
                let _actions = _.cloneDeep(config.actions)
                _actions = CommonFunction.buildObjectPath(_actions);
                setActions(_actions);
            } else {
                if (actions.length > 0) {
                    setActions([]);
                }
            }

            // prepare fields
            if (config.fields && Array.isArray(config.fields) && config.fields.length > 0) {
                prepareFields(config.fields);
            }
        }
    }, [config]);

    useImperativeHandle(ref, () => ({

        /**
         * return actions
         * @returns
         */
        get: () => {
            return {
                isValid: isValidAction(),
                actions: _.cloneDeep(actions)
            }
        }
    }));

    /**
     * prepare fields data
     */
    const prepareFields = async (_fields) => {

        // cache fields options
        let _fieldOptions = {};
        _fields.forEach(el => {
            if (el.fieldType === "LIST_SINGLE" || el.fieldType === "LIST_MULTI") {
                _fieldOptions[el.fieldId] = el.listItems || [];
            }
        });
        setFieldsOptions(_fieldOptions);
    }

    /**
     * get new condition
     */
    const getNewAction = () => {
        return {
            id: CommonFunction.getIdNumber(),
            fieldId: null,
            fieldName: null,
            fieldLabel: null,
            fieldCode: null,
            fieldType: null,
            values: [],
            valid: true
        };
    }



    /**
     * add condition
     * @param {*} item
     */
    const createAction = () => {
        let _actions = _.cloneDeep(actions);
        _actions.push(getNewAction());
        _actions = CommonFunction.buildObjectPath(_actions);
        setActions(_actions);
    }

    /**
     * remove condition
     * @param {*} item
     */
    const removeAction = (index) => {
        let _actions = _.cloneDeep(actions);
        _actions = [
            ..._actions.slice(0, index),
            ..._actions.slice(index + 1)
        ];
        setActions(_actions);
    }

    /**
    * check condition is valid by get p-invalid class
    */
    const isValidAction = () => {
        let isValid = true;
        let container = document.getElementById(`rule-action-actions-${actionBuilderId.current}`);
        if (container) {
            isValid = container.querySelectorAll(".p-invalid").length === 0;
        }
        return isValid;
    }

    //#endregion

    //#region Events

    /**
     * custom field change
     * @param {*} val
     * @param {*} item
     */
    const changeAction = (prop, val, item, index) => {
        let _actions = _.cloneDeep(actions);

        let _change = {}
        switch (prop) {
            case "fieldId":
                let find = _.filter(config.fields, { fieldId: val });
                if (find.length > 0) {
                    let cf = find[0];
                    _change = {
                        [prop]: val,
                        fieldName: cf.fieldName,
                        fieldLabel: cf.fieldLabel,
                        fieldCode: cf.fieldCode,
                        fieldType: cf.fieldType,
                        values: [],
                        customField: cf
                    }
                }
                break;
            case "values":
                // get values by custom field type
                let values = getValuesWhenConditionChange(item.fieldType, val);
                _change = {
                    [prop]: values
                }

                // save display values for list type
                if (item.fieldType === Enumeration.customfield_datatype.LIST_MULTI
                    || item.fieldType === Enumeration.customfield_datatype.LIST_SINGLE) {
                    let options = fieldsOptions[item.fieldId] || [];
                    _change.displayValues = [];
                    if (options.length > 0) {
                        values.forEach(v => {
                            // find selected records
                            let f = options.find((f) => f.key === v);
                            if (f) {
                                _change.displayValues.push(f);
                            }
                        })
                    }
                }

                break;
            default:
                if (prop.startsWith("values-")) {
                    let idx = prop.split("-")[1];
                    _change = { [prop]: item.values }
                    _change[prop][idx] = val;
                }
                break;
        }

        // apply change
        if (_change) {
            for (const key in _change) {
                _actions[index][key] = _change[key];
            }
            setActions(_actions);
        }
    }

    /**
     * get codition value by field type after change
     */
    const getValuesWhenConditionChange = (fieldType, val) => {
        let r = [];
        if (
            (fieldType === "STRING")
            || (fieldType === "LONG")
            || (fieldType === "DOUBLE")
            || (fieldType === "DATE")
            || (fieldType === "DATE_TIME")
            || (fieldType === "BOOLEAN")
            || (fieldType === "LIST_SINGLE")
        ) {
            // text field
            r.push(val);
        } else if (fieldType === "LIST_MULTI") {
            // chips
            r = [...val];
        }

        return r;
    }

    /**
     * change condition on auto complete
     * @param {*} val
     * @param {*} item
     */
    const changeAutoCompleteCondition = (value, params) => {
        let _change = {};

        // get values by custom field type
        _change = {
            values: value
        }

        let _conditions = _.cloneDeep(actions);
        // applyConditionValue(_conditions, params.id, _change);
        setActions(_conditions);
    }

    /**
     * get outbounce data for auto complete
     * @param {*} paging
     * @param {*} param
     */
    const getOutbounceData = async (paging, params) => {
        let result = null
        let res = await SystemEventApi.get(params.customField.configId, paging);
        if (res && res.content && res.content.length > 0) {
            result = {
                data: res.content,
                page: res.page,
                size: res.pageSize,
                total: res.total
            }
        }
        return result;
    }

    //#endregion

    //#region renderer

    /**
         * render field editor
         * @param {*} item
         * @returns
         */
    const renderFieldEditor = (item, index) => {
        if (item.customField && item.customField.renderer && item.customField.renderer.action && typeof item.customField.renderer.action === "function") {
            // item has renderer function
            item.applyValue = (val) => {
                console.log("apply value", val);
                // prepare value
                let _val = null;
                if (val) {
                    _val = Array.isArray(val) ? val : [val]
                }

                // apply value
                let _actions = _.cloneDeep(actions);

                CommonFunction.setValueByPath(_actions, `${item._path}.values`, _val);
                setActions(_actions);
            }
            return (<>{item.customField.renderer.action(item)}</>);
        } else if (item.fieldType === "STRING") {
            return (<>
                <InputText
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    value={item.values[0]}
                    onChange={(e) => changeAction("values", e.target.value, item, index)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            </>);
        } else if (item.fieldType === "LONG") {
            return (<>
                <InputNumber
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    value={item.values[0]}
                    placeholder={t("condition-builder.input-text.empty")}
                    onValueChange={(e) => changeAction("values", e.value, item, index)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            </>)
        }
        else if (item.fieldType === "DOUBLE") {
            return (<>
                <InputNumber
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    value={item.values[0]}
                    mode="decimal"
                    minFractionDigits={1}
                    maxFractionDigits={20}
                    placeholder={t("condition-builder.input-text.empty")}
                    onValueChange={(e) => changeAction("values", e.value, item, index)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            </>)
        }
        else if (item.fieldType === "DATE" || item.fieldType === "DATE_TIME") {
            return (<>
                <Calendar
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    locale={CommonFunction.getCurrentLanguage()}
                    showTime={item.fieldType === "DATE_TIME"}
                    value={getDateValue(item.values[0])}
                    onChange={(e) => changeAction("values", e.value, item, index)}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            </>)
        }
        else if (item.fieldType === "BOOLEAN") {
            return (<>
                <Dropdown
                    value={item.values[0]}
                    onChange={(e) => changeAction("values", e.value, item, index)}
                    options={BOOLEAN_OPTIONS}
                    optionLabel="name"
                    optionValue="value"
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            </>)
        }
        else if (item.fieldType === "LIST_SINGLE" && item.customField && item.customField.listMethod === "METHOD_ARRAY") {
            return (<>
                <Dropdown
                    value={item.values[0]}
                    onChange={(e) => changeAction("values", e.value, item, index)}
                    options={fieldsOptions[item.fieldId] ? fieldsOptions[item.fieldId] : []}
                    optionLabel="value"
                    optionValue="key"
                    display="chip"
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            </>)
        }
        else if (item.fieldType === "LIST_MULTI" && item.customField && item.customField.listMethod === "METHOD_ARRAY") {
            return (<>
                <MultiSelect
                    value={item.values}
                    onChange={(e) => changeAction("values", e.value, item, index)}
                    options={fieldsOptions[item.fieldId] ? fieldsOptions[item.fieldId] : []}
                    optionLabel="value"
                    optionValue="key"
                    display="chip"
                    className={classNames({ "dense": true, "p-invalid": item.values.length === 0 })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            </>)
        } else if (item.customField && item.customField.listMethod === "METHOD_CONFIG") {
            // choose 1 - paging => auto complete
            // choose many - paging => auto compelete
            return (
                <XAutoComplete
                    params={item}
                    multiple
                    completeMethod={getOutbounceData}
                    value={item.values}
                    onChange={changeAutoCompleteCondition}
                    className={classNames({ "dynamic-form-auto-complete no-label": true, "p-invalid": item.values.length === 0 })}
                    itemTemplate={DynamicOutbounceDataTemplate.getItemTemplate(item.customField.configDataType)}
                    selectedItemTemplate={DynamicOutbounceDataTemplate.getSelecteditemtemplate(item.customField.configDataType)}
                />
            )
        }

        return <></>
    }

    /**
     * get date value
     */
    const getDateValue = (value) => {
        let returnValue = null;
        if (value) {
            if (value instanceof Date) {
                returnValue = value
            } else {
                returnValue = new Date(value);
            }
        }
        return returnValue;
    }

    //#endregion

    if (!config) {
        return <></>
    }


    if (actions && actions.length > 0) {
        return (
            <div className="rule-action-actions" id={`rule-action-actions-${actionBuilderId.current}`}>
                {actions.map((item, index) => (
                    <div key={index} className="action-row">
                        <div className="row-action">
                            <div className="action-buttons" onClick={createAction}>
                                <i className='bx bx-plus text-green-9 fs-24'></i>
                            </div>
                            {actions.length > 1 &&
                                <div className="action-buttons" onClick={() => removeAction(index)}>
                                    <i className='bx bx-x text-red-9'></i>
                                </div>
                            }
                        </div>
                        <div className="row-field">
                            <Dropdown
                                filter
                                filterBy="fieldLabel"
                                value={item.fieldId}
                                options={config.fields}
                                onChange={(e) => changeAction("fieldId", e.value, item, index)}
                                optionLabel="fieldLabel"
                                optionValue="fieldId"
                                className={classNames({ "dense": true, "p-invalid": !item.fieldId })}
                                style={COMPONENT_STYLE.CUSTOM_FIELD}
                                placeholder={t("condition-builder.choose-custom-field")} />
                        </div>
                        <div className="row-value">
                            {renderFieldEditor(item, index)}
                        </div>
                    </div>
                ))}
            </div>

        );
    } else {
        return (
            <div className="flex align-items-center pointer" onClick={createAction}>
                <i className='bx bx-plus text-green-9 mr-1'></i>
                <span>{t("condition-builder.create-action")}</span>
            </div>
        )
    }


};

ActionBuilder = forwardRef(ActionBuilder);

export default ActionBuilder;

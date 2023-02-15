import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import './scss/ConditionBuilder.scss';
import CommonFunction from '@lib/common';
import classNames from 'classnames';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Chips } from 'primereact/chips';
import { InputNumber } from 'primereact/inputnumber';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
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
 *                  condition: (item) => (<InputText onChange={(e) => { CommonFunction.debounce(null, item.applyValue, e.target.value); }} />)
 *              } // fields from config/fields, use custom renderer by renderer property, use item.apply to apply new value
 *          }]
 *          conditions: [] // current conditions
 *       }
 *      afterConditionChange: asyn () => {} // event after condition change
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function ConditionBuilder(props, ref) {

    const t = CommonFunction.t;

    const { id, config, afterConditionChange } = props;

    const [conditions, setConditions] = useState([]);
    const [activeIndex, setActiveIndex] = useState([]);
    const [previewConditions, setPreviewConditions] = useState("");
    const [isEmpty, setIsEmpty] = useState(true);
    const [fieldsOptions, setFieldsOptions] = useState({});
    const filterBuilderId = useRef(CommonFunction.getIdNumber());
    const refFieldObject = useRef({});

    const GROUP_LOGIC_CONDITIONS = [
        { name: t('condition-builder.condition.And'), value: 'AND' },
        { name: t('condition-builder.condition.Or'), value: 'OR' },
        { name: t('condition-builder.condition.AndNot'), value: 'AND NOT' },
        { name: t('condition-builder.condition.OrNot'), value: 'OR NOT' }
    ];

    const LOGIC_CONDITIONS = [
        { name: t('condition-builder.condition.And'), value: 'AND' },
        { name: t('condition-builder.condition.Or'), value: 'OR' }
    ];

    const COMPONENT_STYLE = {
        CUSTOM_FIELD: { width: "300px", maxWidth: "300px", minWidth: "300px" },
        OPERATOR: { width: "120px", maxWidth: "120px", minWidth: "120px" },
        CONDITION_SINGLE: { flex: "1 1 auto", width: "0", maxWidth: "100%" },
        CONDITION_DOUBLE: { flex: "1 1 auto", width: "0", maxWidth: "50%" }
    }

    const CONDITION_OPERATORS = {
        STRING: [
            { name: t('condition-builder.condition.string.like'), value: 'LIKE' },
            { name: t('condition-builder.condition.string.equal'), value: '=' },
            { name: t('condition-builder.condition.string.in'), value: 'IN' }
        ],
        LONG: [
            { name: t('condition-builder.condition.number.equal'), value: '=' },
            { name: t('condition-builder.condition.number.greater-than'), value: '>' },
            { name: t('condition-builder.condition.number.less-than'), value: '<' },
            { name: t('condition-builder.condition.number.greater-than-or-equal-to'), value: '>=' },
            { name: t('condition-builder.condition.number.less-than-or-equal-to'), value: '<=' },
            { name: t('condition-builder.condition.number.in'), value: 'IN' },
            { name: t('condition-builder.condition.number.between'), value: 'BETWEEN' },
        ],
        DOUBLE: [
            { name: t('condition-builder.condition.number.equal'), value: '=' },
            { name: t('condition-builder.condition.number.greater-than'), value: '>' },
            { name: t('condition-builder.condition.number.less-than'), value: '<' },
            { name: t('condition-builder.condition.number.greater-than-or-equal-to'), value: '>=' },
            { name: t('condition-builder.condition.number.less-than-or-equal-to'), value: '<=' },
            { name: t('condition-builder.condition.number.in'), value: 'IN' },
            { name: t('condition-builder.condition.number.between'), value: 'BETWEEN' },
        ],
        DATE: [
            { name: t('condition-builder.condition.date.equal'), value: '=' },
            { name: t('condition-builder.condition.date.greater-than'), value: '>' },
            { name: t('condition-builder.condition.date.less-than'), value: '<' },
            { name: t('condition-builder.condition.date.greater-than-or-equal-to'), value: '>=' },
            { name: t('condition-builder.condition.date.less-than-or-equal-to'), value: '<=' },
            { name: t('condition-builder.condition.date.between'), value: 'BETWEEN' },
        ],
        DATE_TIME: [
            { name: t('condition-builder.condition.date.equal'), value: '=' },
            { name: t('condition-builder.condition.date.greater-than'), value: '>' },
            { name: t('condition-builder.condition.date.less-than'), value: '<' },
            { name: t('condition-builder.condition.date.greater-than-or-equal-to'), value: '>=' },
            { name: t('condition-builder.condition.date.less-than-or-equal-to'), value: '<=' },
            { name: t('condition-builder.condition.date.between'), value: 'BETWEEN' },
        ],
        BOOLEAN: [
            { name: t('condition-builder.condition.boolean.equal'), value: '=' },
        ],
        LIST_SINGLE: [
            { name: t('condition-builder.condition.list-single.equal'), value: '=' },
            { name: t('condition-builder.condition.list-single.in'), value: 'IN' },
        ],
        LIST_MULTI: [
            { name: t('condition-builder.condition.list-multi.contain'), value: 'CONTAIN' },
        ]
    }

    const BOOLEAN_OPTIONS = [
        { name: t("condition-builder.boolean.true"), value: "true" },
        { name: t("condition-builder.boolean.false"), value: "false" },
    ]

    const emptyCondition = [];

    useEffect(() => {
        if (config) {
            // prepare condition
            if (config.conditions && Array.isArray(config.conditions) && config.conditions.length > 0) {
                let _conditions = config.conditions ? _.clone(config.conditions) : [];
                _conditions = CommonFunction.buildObjectPath(_conditions);
                setConditions(_conditions);
            } else {
                if (conditions.length > 0) {
                    setConditions([]);
                }
            }

            // prepare fields
            if (config.fields && Array.isArray(config.fields) && config.fields.length > 0) {
                prepareFields(config.fields);
            }
        }
    }, [config]);

    useEffect(() => {
        renderPreviewConditions();
    }, [conditions])

    useImperativeHandle(ref, () => ({

        /**
         * return conditions
         * @returns
         */
        get: () => {
            return {
                isValid: isValidCondition(),
                conditions: _.cloneDeep(conditions)
            };

        }
    }));

    /**
     * prepare fields data
     */
    const prepareFields = async (_fields) => {

        // cache fields options
        let _fieldOptions = {};
        let _fieldObject = {};
        _fields.forEach(el => {
            if (el.fieldType === "LIST_SINGLE" || el.fieldType === "LIST_MULTI") {
                _fieldOptions[el.fieldId] = el.listItems || [];
            }

            _fieldObject[el.fieldId] = _.cloneDeep(el);

        });
        refFieldObject.current = _fieldObject;
        setFieldsOptions(_fieldOptions);
    }

    /**
     * get new condition
     */
    const getNewCondition = () => {
        return {
            id: CommonFunction.getIdNumber(),
            logicOperator: "AND",
            conditionType: "RULE",
            filterType: "CUSTOM_FIELD",
            fieldId: null,
            fieldName: null,
            fieldLabel: null,
            fieldType: null,
            operator: null,
            values: [],
            valid: true
        };
    }

    /**
     * get new group
     */
    const getNewGroup = () => {
        return {
            id: CommonFunction.getIdNumber(),
            logicOperator: "AND",
            conditionType: "GROUP",
            children: [{ ...getNewCondition(), logicOperator: null }]
        };
    }

    /**
     * apply condition value
     * @param {*} id
     * @param {*} val
     */
    const applyConditionValue = (condition, id, val) => {
        var found = false;
        if (!found) {
            if (Array.isArray(condition)) {
                condition.forEach((i) => {
                    found = applyConditionValue(i, id, val);
                })
            } else {
                if (condition.id === id) {
                    found = true;
                    for (const [key, value] of Object.entries(val)) {
                        condition[key] = value;
                    }
                } else {
                    if (condition.children) {
                        applyConditionValue(condition.children, id, val);
                    }
                }
            }
        }

        return found;
    }

    /**
     * add condition
     * @param {*} item
     */
    const addCondition = (impactCondition) => {
        let _conditions = _.cloneDeep(conditions);
        let conditionIndex = impactCondition._arrayIndex;
        let _group = CommonFunction.getValueByPath(_conditions, impactCondition._parentPath);
        if (_group && Array.isArray(_group) && _group.length > 0) {
            // add to exists group
            _group = [
                ..._group.slice(0, conditionIndex + 1),
                getNewCondition(),
                ..._group.slice(conditionIndex + 1)
            ];
            CommonFunction.setValueByPath(_conditions, impactCondition._parentPath, _group);
        }

        _conditions = CommonFunction.buildObjectPath(_conditions);
        setConditions(_conditions);
    }

    /**
     * remove condition
     * @param {*} item
     */
    const removeCondition = (impactCondition) => {
        let _conditions = _.cloneDeep(conditions);
        let conditionIndex = impactCondition._arrayIndex;

        let _group = CommonFunction.getValueByPath(_conditions, impactCondition._parentPath);
        if (_group && Array.isArray(_group) && _group.length > 0) {
            // remove item from group
            _group = [
                ..._group.slice(0, conditionIndex),
                ..._group.slice(conditionIndex + 1)
            ];
            CommonFunction.setValueByPath(_conditions, impactCondition._parentPath, _group);
        }

        _conditions = CommonFunction.buildObjectPath(_conditions);
        setConditions(_conditions);
    }

    /**
     * remove group condition
     * @param {*} id
     * @param {*} index
     * @param {*} path
     * @param {*} c
     */
    const removeGroupCondition = (impactCondition) => {
        let _conditions = _.cloneDeep(conditions);
        if (CommonFunction.isEmpty(impactCondition._parentPath)) {
            // remove root group
            _conditions = [
                ..._conditions.slice(0, impactCondition._arrayIndex),
                ..._conditions.slice(impactCondition._arrayIndex + 1)
            ];
        } else {
            let _group = CommonFunction.getValueByPath(_conditions, impactCondition._parentPath);
            _group = [
                ..._group.slice(0, impactCondition._arrayIndex),
                ..._group.slice(impactCondition._arrayIndex + 1)
            ];
            CommonFunction.setValueByPath(_conditions, impactCondition._parentPath, _group);
        }

        _conditions = CommonFunction.buildObjectPath(_conditions);
        setConditions(_conditions);
    }

    /**
     * add group condition
     * @param {*} id
     */
    const addGroupCondition = (impactCondition) => {

        let _conditions = _.cloneDeep(conditions);
        if (impactCondition._path) {
            let _group = CommonFunction.getValueByPath(_conditions, impactCondition._path);
            _group.push(getNewGroup());
            CommonFunction.setValueByPath(_conditions, impactCondition._path, _group);
        } else {
            // add group to root
            _conditions.push(getNewGroup());
        }

        _conditions = CommonFunction.buildObjectPath(_conditions);
        setConditions(_conditions);
    }

    /**
     * init condition from nothing
     */
    const initCondition = () => {
        let _conditions = [{ ...getNewGroup(), logicOperator: null }];
        _conditions = CommonFunction.buildObjectPath(_conditions);
        setConditions(_conditions);
    }

    /**
     * render condition operator for preview
     * @returns
     */
    const renderPreviewConditions = () => {

        let emptyConditionPreview = `
        <div class="flex align-items-center">
            <span class="bx bx-info-circle fs-22 text-grey"></span>
            <span class="text-grey-7 bold ml-1 mt-1">${t("condition-builder.empty-condition")}</span>
        </div>`;

        let isValid = true;

        if (conditions && conditions.length > 0) {

            /**
             * render operators
             * @param {*} _opt
             * @param {*} index
             * @returns
             */
            const renderOperator = (_opt, index) => {

                // operator
                let operatorName = (_opt.fieldType && _opt.operator)
                    ? _.find(CONDITION_OPERATORS[_opt.fieldType], function (x) {
                        return x.value === _opt.operator
                    }).name.toLowerCase()
                    : "";

                // values
                let values = "";
                switch (_opt.fieldType) {
                    case "BOOLEAN":
                        values = _opt.values.length > 0 ? _.find(BOOLEAN_OPTIONS, function (x) {
                            return x.value === _opt.values[0]
                        }).name.toLowerCase() : "";
                        break;
                    case "DATE":
                    case "DATE_TIME":
                        let dateNames = [];
                        _opt.values.forEach(el => {
                            if (el) {
                                dateNames.push(_opt.fieldType === "DATE" ? CommonFunction.formatDate(el) : CommonFunction.formatDateTime(el));
                            }
                        });
                        values = dateNames.length > 0 ? dateNames.join(", ") : "";
                        if (dateNames.length > 1) {
                            values = `[ ${values} ]`;
                        }
                        break;
                    case "LIST_MULTI":
                    case "LIST_SINGLE":
                        if (fieldsOptions[_opt.fieldId] && fieldsOptions[_opt.fieldId].length > 0 && _opt.values.length > 0) {
                            let arrayValues = [];
                            _opt.values.forEach(selected => {
                                let _found = fieldsOptions[_opt.fieldId].find((f) => f.key === selected);
                                if (_found) {
                                    arrayValues.push(_found.value);
                                }
                            });
                            values = `[ ${arrayValues.join(", ")} ]`;
                        } else if (_opt.displayValues && Array.isArray(_opt.displayValues) && _opt.displayValues.length > 0) {
                            values = `[ ${_opt.displayValues.map(m => m.value).join(", ")} ]`;
                        } else {
                            values = "[ ]"
                        }

                        break;
                    default:
                        values = _opt.values.length > 0 ? _opt.values.join(', ') : "";
                        if (_opt.values.length > 1) {
                            values = `[ ${values} ]`;
                        }
                        break;
                }

                // logic operator
                let logicOperatorName = index > 0 ? _.find(LOGIC_CONDITIONS, function (x) {
                    return x.value === _opt.logicOperator
                }).name.toLowerCase() : ''

                // get custom field name
                let _fieldLabel = "";
                if (_opt.fieldId) {
                    // let _foundCustomField = config.fields.find((f) => f.fieldId === _opt.fieldId);
                    let _foundField = refFieldObject.current[_opt.fieldId];
                    if (_foundField) {
                        _fieldLabel = _foundField.fieldLabel;
                    }
                }

                return `
                    <span class="logic-operator-name">${logicOperatorName}</span>
                    <span>${_fieldLabel}</span>
                    <span class="bold-and-color">${operatorName}</span>
                    <span>${values}</span>
                `;
            }

            /**
             * render group
             * @param {*} group
             * @param {*} level
             * @returns
             */
            const renderGroup = (group, level) => {
                var op = '';
                group.forEach((element, index) => {
                    if (element.children) {
                        // logic operator
                        let logicOperator = _.find(GROUP_LOGIC_CONDITIONS, function (x) {
                            return x.value === element.logicOperator
                        });
                        let logicOperatorName = logicOperator ? logicOperator.name.toLowerCase() : "";

                        let bracketId = CommonFunction.getIdNumber();
                        let bracketEvent = `onmouseover="showFilterBuilderBracketGroup(${bracketId})" onmouseout="hideFilterBuilderBracketGroup(${bracketId})"`;

                        op += `
                            <span class="logic-operator-name">${logicOperatorName}</span>
                            <span class='condition-group-bracket level-${level} fb-bracket-id-${bracketId}' ${bracketEvent}>(</span>
                            ${renderGroup(element.children, level + 1)}
                            <span class='condition-group-bracket level-${level} fb-bracket-id-${bracketId}' ${bracketEvent}>)</span>
                        `;

                    } else {
                        op += renderOperator(element, index);
                    }
                });
                return op;
            }

            // start rendering
            let operatorString = renderGroup(conditions, 0).trim();
            let previewHtml = operatorString.replace(/(<([^>]+)>)/ig, '').trim();
            if (CommonFunction.isEmpty(previewHtml)) {
                operatorString = emptyConditionPreview;
                setActiveIndex([0]);
            }
            setPreviewConditions(operatorString);
            setIsEmpty(CommonFunction.isEmpty(previewHtml));

            // add global bracket hover event
            if (!window.showFilterBuilderBracketGroup) {
                window.showFilterBuilderBracketGroup = (id) => {
                    let bracklets = document.getElementsByClassName(`fb-bracket-id-${id}`);
                    for (var i = 0; i < bracklets.length; i++)
                        bracklets.item(i).classList.add("bracket-hover");
                }
            }

            if (!window.hideFilterBuilderBracketGroup) {
                window.hideFilterBuilderBracketGroup = (id) => {
                    let bracklets = document.getElementsByClassName(`fb-bracket-id-${id}`);
                    for (var i = 0; i < bracklets.length; i++)
                        bracklets.item(i).classList.remove("bracket-hover");
                }
            }


            // valid conditions
            isValid = isValidCondition();

            // call callback function if neccessary
            if (afterConditionChange && typeof afterConditionChange === "function") {
                afterConditionChange(id, previewHtml ? _.cloneDeep(conditions) : [], isValid);
            }
        } else {
            // empty condition
            setPreviewConditions(emptyConditionPreview);
            setActiveIndex([0]);

            // call back for save
            if (afterConditionChange && typeof afterConditionChange === "function") {
                afterConditionChange(id, [], true);
            }

            setIsEmpty(true);
        }

        // check error
        let container = document.getElementById(`filter-builder-accordion-${filterBuilderId.current}`);
        if (container) {
            if (isValid) {
                container.classList.remove("condition-invalid");
            } else {
                container.classList.add("condition-invalid");
            }
        }
    }

    /**
     * check condition is valid by get p-invalid class
     */
    const isValidCondition = () => {
        let isValid = true;
        let container = document.getElementById(`filter-builder-condition-${filterBuilderId.current}`);
        if (container) {
            isValid = container.querySelectorAll(".p-invalid").length === 0;
        }
        return isValid;
    }
    //#endregion

    //#region Events

    /**
     * logic operator change
     * @param {*} val
     * @param {*} item
     */
    const logicOperatorChange = (val, item) => {
        let _conditions = _.cloneDeep(conditions);
        applyConditionValue(_conditions, item.id, { logicOperator: val });
        setConditions(_conditions);
    }

    /**
     * custom field change
     * @param {*} val
     * @param {*} item
     */
    const changeCondition = (prop, val, item) => {
        let _change = {}
        switch (prop) {
            case "fieldId":
                let find = _.filter(config.fields, { fieldId: val });
                if (find.length > 0) {
                    let cf = find[0];

                    // apply change customfield
                    
                    _change = {
                        [prop]: val,
                        fieldName: cf.fieldName,
                        fieldLabel: cf.fieldLabel,
                        fieldType: cf.fieldType,
                        filterType: cf.filterType,
                        operator: getDefaultOperatorByType(find[0].fieldType),
                        values: [],
                        customField: cf,
                        displayValues: []
                    }
                }
                break;
            case "operator":
                _change = {
                    [prop]: val
                }

                // remove values if operator is equal
                if (val === "=" && item.values && item.values.length > 1) {
                    _change.values = [item.values[0]];
                }

                break;
            case "values":
                // get values by custom field type
                let values = getValuesWhenConditionChange(item.fieldType, item.operator, val);
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

        let _conditions = _.cloneDeep(conditions);
        applyConditionValue(_conditions, item.id, _change);
        setConditions(_conditions);
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

        // save display values for list type
        // if (item.fieldType === Enumeration.customfield_datatype.LIST_MULTI
        //     || item.fieldType === Enumeration.customfield_datatype.LIST_SINGLE) {
        //     let options = customFieldsChoices[item.fieldId] || [];
        //     _change.displayValues = [];
        //     if (options.length > 0) {
        //         values.forEach(v => {
        //             // find selected records
        //             let f = options.find((f) => f.key === v);
        //             if (f) {
        //                 _change.displayValues.push(f);
        //             }
        //         })
        //     }
        // }
        let _conditions = _.cloneDeep(conditions);
        applyConditionValue(_conditions, params.id, _change);
        setConditions(_conditions);
    }

    /**
     * get codition value by field type after change
     */
    const getValuesWhenConditionChange = (fieldType, operator, val) => {
        let r = [];
        if (
            (fieldType === "STRING" && ["LIKE", "="].indexOf(operator) > -1)
            || (fieldType === "LONG" && ["=", ">", "<", ">=", "<="].indexOf(operator) > -1)
            || (fieldType === "DOUBLE" && ["=", ">", "<", ">=", "<="].indexOf(operator) > -1)
            || (fieldType === "DATE" && ["=", ">", "<", ">=", "<="].indexOf(operator) > -1)
            || (fieldType === "DATE_TIME" && ["=", ">", "<", ">=", "<="].indexOf(operator) > -1)
            || (fieldType === "BOOLEAN")
            || (fieldType === "LIST_SINGLE" && operator === "=")
        ) {
            // text field
            r.push(val);
        } else if (
            (fieldType === "STRING" && ["IN"].indexOf(operator) > -1)
            || (fieldType === "LIST_SINGLE" && ["IN"].indexOf(operator) > -1)
            || (fieldType === "LIST_MULTI")
        ) {
            // chips
            r = [...val];
        } else if (
            (fieldType === "DOUBLE" && operator === "IN")
        ) {
            // chips for double
            if (val.length > 0) {
                const doubleRegex = /^[1-9]\d*((\.|\,)\d+)?$/gm;
                let hasDoubleError = false;
                val.forEach(el => {
                    if (el.match(doubleRegex)) {
                        r.push(el.replace(",", "."));
                    } else {
                        hasDoubleError = true;
                    }
                });
                if (hasDoubleError) {
                    CommonFunction.toastWarning(t("condition-builder.error.double-error"))
                }
            }
        } else if (
            (fieldType === "LONG" && operator === "IN")
        ) {
            // chips for long
            const longRegex = /^[1-9]\d*$/gm;
            let hasLongError = false;
            val.forEach(el => {
                if (el.match(longRegex)) {
                    r.push(el);
                } else {
                    hasLongError = true;
                }
            });

            if (hasLongError) {
                CommonFunction.toastWarning(t("condition-builder.error.long-error"))
            }
        }

        return r;
    }

    /**
     * get default operator by type
     * @param {*} type
     */
    const getDefaultOperatorByType = (type) => {
        let r = null;
        switch (type) {
            case "STRING":
                r = "LIKE";
                break;
            case "LONG":
            case "DOUBLE":
            case "DATE":
            case "DATE_TIME":
            case "BOOLEAN":
            case "LIST_SINGLE":
                r = "="
                break;
            case "LIST_MULTI":
                r = "CONTAIN";
                break;
            default:
                break;
        }
        return r;
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

    /**
     * render field editor
     * @param {*} item
     * @returns
     */
    const renderFieldEditor = (item) => {
        // let _field = config.fields.find(f => f.fieldId === item.fieldId);
        let _field = refFieldObject.current[item.fieldId];

        if (_field && _field.renderer && typeof _field.renderer.condition === "function") {
            // item has renderer function
            item.applyValue = (val, displayVal) => {

                console.log("apply value", val);
                // prepare value
                let _val = null;
                if (val) {
                    _val = Array.isArray(val) ? val : [val]
                }
                let _displayVal = null;
                if (displayVal) {
                    _displayVal = Array.isArray(displayVal) ? displayVal : [displayVal];
                }

                // apply value
                let _conditions = _.cloneDeep(conditions);
                CommonFunction.setValueByPath(_conditions, `${item._path}.values`, _val);
                CommonFunction.setValueByPath(_conditions, `${item._path}.displayValues`, _displayVal);
                setConditions(_conditions);
            }

            return (<>{_field.renderer.condition(item)}</>);
        } else if (item.fieldType === "STRING" && ["LIKE", "="].indexOf(item.operator) > -1) {
            // editor: text field
            return (
                <InputText
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    value={item.values[0]}
                    onChange={(e) => changeCondition("values", e.target.value, item)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (item.fieldType === "STRING" && ["IN"].indexOf(item.operator) > -1) {
            // editor: chips
            return (
                <Chips
                    className={classNames({ "dense": true, "p-invalid": item.values.length === 0 })}
                    value={item.values}
                    placeholder={item.values.length === 0 && t("condition-builder.chips.empty")}
                    onChange={(e) => changeCondition("values", e.target.value, item)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (item.fieldType === "LONG" && ["=", ">", "<", ">=", "<="].indexOf(item.operator) > -1) {
            // editor: number - long
            return (
                <InputNumber
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    value={item.values[0]}
                    placeholder={t("condition-builder.input-text.empty")}
                    onValueChange={(e) => changeCondition("values", e.value, item)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (item.fieldType === "DOUBLE" && ["=", ">", "<", ">=", "<="].indexOf(item.operator) > -1) {
            // editor: number - double
            return (
                <InputNumber
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    value={item.values[0]}
                    mode="decimal"
                    minFractionDigits={1}
                    maxFractionDigits={20}
                    placeholder={t("condition-builder.input-text.empty")}
                    onValueChange={(e) => changeCondition("values", e.value, item)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (["DOUBLE", "LONG"].indexOf(item.fieldType) > -1 && ["IN"].indexOf(item.operator) > -1) {
            // editor: number - in
            return (
                <Chips
                    className={classNames({ "dense": true, "p-invalid": item.values.length === 0 })}
                    value={item.values}
                    placeholder={item.values.length === 0 && t("condition-builder.chips.empty")}
                    onChange={(e) => changeCondition("values", e.target.value, item)}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (item.fieldType === "LONG" && ["BETWEEN"].indexOf(item.operator) > -1) {
            //editor: number - long - between
            return (
                <>
                    <InputNumber
                        className={classNames({ "dense mr-1": true, "p-invalid": !item.values[0] })}
                        value={item.values[0]}
                        placeholder={t("condition-builder.input-text.empty")}
                        onValueChange={(e) => changeCondition("values-0", e.value, item)}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE} />
                    <InputNumber
                        className={classNames({ "dense": true, "p-invalid": !item.values[1] })}
                        value={item.values[1]}
                        placeholder={t("condition-builder.input-text.empty")}
                        onValueChange={(e) => changeCondition("values-1", e.value, item)}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE} />
                </>
            )
        } else if (item.fieldType === "DOUBLE" && ["BETWEEN"].indexOf(item.operator) > -1) {
            //editor: number - double - between
            return (
                <>
                    <InputNumber
                        className={classNames({ "dense mr-1": true, "p-invalid": !item.values[0] })}
                        value={item.values[0]}
                        mode="decimal"
                        minFractionDigits={1}
                        maxFractionDigits={20}
                        placeholder={t("condition-builder.input-text.empty")}
                        onValueChange={(e) => changeCondition("values-0", e.value, item)}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE} />
                    <InputNumber
                        className={classNames({ "dense": true, "p-invalid": !item.values[1] })}
                        value={item.values[1]}
                        mode="decimal"
                        minFractionDigits={1}
                        maxFractionDigits={20}
                        placeholder={t("condition-builder.input-text.empty")}
                        onValueChange={(e) => changeCondition("values-1", e.value, item)}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE} />
                </>
            )
        } else if (["DATE", "DATE_TIME"].indexOf(item.fieldType) > -1 && ["=", ">", "<", ">=", "<="].indexOf(item.operator) > -1) {
            // editor: date - datetime
            return (
                <Calendar
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    locale={CommonFunction.getCurrentLanguage()}
                    showTime={item.fieldType === "DATE_TIME"}
                    value={getDateValue(item.values[0])}
                    onChange={(e) => changeCondition("values", e.value, item)}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            )
        } else if (["DATE", "DATE_TIME"].indexOf(item.fieldType) > -1 && ["BETWEEN"].indexOf(item.operator) > -1) {
            // editor: date - datetime -between
            return (
                <>
                    <Calendar
                        className={classNames({ "dense mr-1": true, "p-invalid": !item.values[0] })}
                        locale={CommonFunction.getCurrentLanguage()}
                        showTime={item.fieldType === "DATE_TIME"}
                        value={getDateValue(item.values[0])}
                        onChange={(e) => changeCondition("values-0", e.value, item)}
                        placeholder={t("condition-builder.input-text.empty")}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE}
                    />
                    <Calendar
                        className={classNames({ "dense": true, "p-invalid": !item.values[1] })}
                        locale={CommonFunction.getCurrentLanguage()}
                        showTime={item.fieldType === "DATE_TIME"}
                        value={getDateValue(item.values[1])}
                        onChange={(e) => changeCondition("values-1", e.value, item)}
                        placeholder={t("condition-builder.input-text.empty")}
                        style={COMPONENT_STYLE.CONDITION_DOUBLE}
                    />
                </>
            )
        } else if (item.fieldType === "BOOLEAN") {
            // editor: boolean
            return (
                <Dropdown
                    value={item.values[0]}
                    onChange={(e) => changeCondition("values", e.value, item)}
                    options={BOOLEAN_OPTIONS}
                    optionLabel="name"
                    optionValue="value"
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE} />
            )
        } else if (_field && _field.listMethod === "METHOD_ARRAY" && item.fieldType === "LIST_SINGLE" && item.operator === "=") {
            //editor: list-single - single
            return (
                <Dropdown
                    value={item.values[0]}
                    onChange={(e) => changeCondition("values", e.value, item)}
                    options={fieldsOptions[item.fieldId] ? fieldsOptions[item.fieldId] : []}
                    optionLabel="value"
                    optionValue="key"
                    display="chip"
                    className={classNames({ "dense": true, "p-invalid": !item.values[0] })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            )
        } else if (_field && _field.listMethod === "METHOD_ARRAY" &&
            ((item.fieldType === "LIST_SINGLE" && item.operator === "IN") || (item.fieldType === "LIST_MULTI"))) {
            // editor: list-single - multi, list-multi
            return (
                <MultiSelect
                    value={item.values}
                    onChange={(e) => changeCondition("values", e.value, item)}
                    options={fieldsOptions[item.fieldId] ? fieldsOptions[item.fieldId] : []}
                    optionLabel="value"
                    optionValue="key"
                    display="chip"
                    className={classNames({ "dense": true, "p-invalid": item.values.length === 0 })}
                    placeholder={t("condition-builder.input-text.empty")}
                    style={COMPONENT_STYLE.CONDITION_SINGLE}
                />
            )
        } else if (_field && _field.listMethod === "METHOD_CONFIG") {
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

    //#region renderer

    /**
     * render condition
     * @param {*} condition
     * @returns
     */
    const renderCondition = (condition) => {
        if (condition && condition.length > 0) {
            return (
                <>
                    {condition.map((item, index) => (
                        <React.Fragment key={index}>
                            {/* render group condition */}
                            {item.children &&
                                <div className={classNames({ "filter-group mb-1 flex align-items-start": true, "p-0": condition.length <= 1 })}>
                                    {/* if condition has multigroup, add space to first group */}
                                    {index === 0 && condition.length > 1 &&
                                        <>
                                            <div className="filter-buttons filter-buttons-empty" />
                                            <div className="filter-condition-selector mr-1" />
                                        </>
                                    }

                                    {/* group logic operator */}
                                    {item.logicOperator &&
                                        <>
                                            <div
                                                className="filter-buttons group-buttons filter-buttons-remove-condition"
                                                onClick={() => removeGroupCondition(item)} title={t("condition-builder.remove-condition")}
                                            >
                                                <i className='bx bx-x text-red-9'></i>
                                            </div>
                                            <Dropdown
                                                optionLabel="name"
                                                className="filter-condition-selector"
                                                value={item.logicOperator}
                                                options={GROUP_LOGIC_CONDITIONS}
                                                onChange={(e) => logicOperatorChange(e.value, item)}
                                            />
                                        </>
                                    }
                                    <div className="group-condition-container w-full">
                                        {renderCondition(item.children)}
                                    </div>
                                </div>
                            }

                            {/* render condition */}
                            {!item.children &&
                                <div className="flex align-items-center mb-1">
                                    <div className="filter-buttons filter-buttons-add-condition" onClick={() => addCondition(item)} title={t("condition-builder.add-condition")}>
                                        <i className='bx bx-plus text-green-9'></i>
                                    </div>
                                    {index === 0 && condition.length <= 1 ? <div className="filter-buttons filter-buttons-empty"><i className='bx bx-x text-red-9'></i></div> :
                                        <div className="filter-buttons filter-buttons-remove-condition" onClick={() => removeCondition(item)} title={t("condition-builder.remove-condition")}>
                                            <i className='bx bx-x text-red-9'></i>
                                        </div>
                                    }

                                    {/* logic */}
                                    {item.logicOperator && index > 0 &&
                                        <Dropdown
                                            optionLabel="name"
                                            optionValue="value"
                                            className="filter-condition-selector"
                                            value={item.logicOperator}
                                            options={LOGIC_CONDITIONS}
                                            onChange={(e) => logicOperatorChange(e.value, item)}
                                        />

                                    }

                                    {/* add space if multi condition */}
                                    {!item.logicOperator && condition.length > 1 && <div className="filter-condition-selector" />}

                                    {/* custom field */}
                                    <Dropdown
                                        filter
                                        filterBy="fieldLabel"
                                        value={item.fieldId}
                                        options={config.fields}
                                        onChange={(e) => changeCondition("fieldId", e.value, item)}
                                        optionLabel="fieldLabel"
                                        optionValue="fieldId"
                                        className={classNames({ "dense": true, "p-invalid": !item.fieldId })}
                                        style={COMPONENT_STYLE.CUSTOM_FIELD}
                                        placeholder={t("condition-builder.choose-custom-field")} />

                                    {/* operator */}
                                    {item.fieldType &&
                                        <Dropdown
                                            optionLabel="name"
                                            optionValue="value"
                                            value={item.operator}
                                            options={CONDITION_OPERATORS[item.fieldType]}
                                            onChange={(e) => changeCondition("operator", e.value, item)}
                                            className={classNames({ "dense mr-1 ml-1 p-dropdown-operator": true, "p-invalid": !item.operator })}
                                            style={COMPONENT_STYLE.OPERATOR}
                                            placeholder={t("condition-builder.choose-operator")} />
                                    }

                                    {renderFieldEditor(item)}

                                </div>
                            }
                            {/* add group */}
                            {index === condition.length - 1 &&
                                <div className="flex add-group mt-1">
                                    <div className="filter-buttons flex align-items-center filter-buttons-add-group" onClick={() => addGroupCondition(condition)} title={t('condition-builder.add-group')}>
                                        <i className='bx bx-list-plus text-green-9'></i>
                                        <span>{t('condition-builder.add-group')}</span>
                                    </div>
                                </div>
                            }
                        </React.Fragment>
                    ))}
                </>
            )
        } else {
            return (
                <div className="flex align-items-center init-condition-container" onClick={initCondition}>
                    <i className='bx bx-plus text-green-9 mr-1'></i>
                    <span>{t('condition-builder.add-condition')}</span>
                </div>
            )
        }
    }

    if (!config) {
        return <></>
    }

    return (
        <>
            {/* <div className="text-green">{JSON.stringify(conditions)}</div>
            <div className="text-red"> {expression}</div> */}
            <div className={`condition-builder ${props.className ? props.className : ""}`}>
                <Accordion multiple
                    id={`filter-builder-accordion-${filterBuilderId.current}`}
                    className="filter-builder-accordion" activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                >
                    <AccordionTab
                        className="filter-builder-accordion-tab"
                        header={<p className="filter-builder-condition-preview" dangerouslySetInnerHTML={{ __html: previewConditions }} />}
                    >
                        <div id={`filter-builder-condition-${filterBuilderId.current}`} className={classNames({ "condition-builder": true })}>
                            {renderCondition(conditions)}
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
        </>

    );
};

ConditionBuilder = forwardRef(ConditionBuilder);

export default ConditionBuilder;

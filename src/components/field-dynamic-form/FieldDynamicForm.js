import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './scss/FieldDynamicForm.scss'
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import CommonFunction from '@lib/common';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import moment from 'moment';
import Enumeration from '@lib/enum';
import { AutoComplete } from 'primereact/autocomplete';
import SystemEventApi from 'services/SystemEventApi';
import _, { values } from 'lodash';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';

/**
 * imperative handel:
 *      get: return {valid, customFields, data}
 * props
 *      additionReturnInfo: ["fieldType"] // addition info when return by get function
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function FieldDynamicForm(props, ref) {
    const t = CommonFunction.t;
    const { className, style, fieldsConfig, fieldsData, disabled, additionReturnInfo } = props;
    const refCurrentFieldsConfig = useRef(null);
    const [preparedCustomFields, setPreparedCustomFields] = useState([]);
    const [data, setData] = useState({});
    const [validate, setValidate] = useState({});
    const [outbounceData, setOutbounceData] = useState({}); // list array 's data
    const refOutbounceDataLoadingState = useRef({});
    const outbounceLoadSize = 5;
    const refCacheFieldsConfig = useRef();
    const refCustomFieldValidConfig = useRef({});

    useImperativeHandle(ref, () => ({
        /**
         * init with fieldsConfig
         * @param {*} _fieldsConfig 
         */
        init: (_fieldsConfig) => {
            refCurrentFieldsConfig.current = _fieldsConfig;
            prepareFieldsConfig();
        },

        /**
         * get
         */
        get: () => {

            // prepare data
            let _preparedData = [];
            preparedCustomFields.forEach(customField => {
                let value = data[customField.fieldId];
                let d = {
                    fieldId: customField.fieldId,
                    fieldCode: customField.fieldCode,
                    values: [],
                    outbouncePayload: customField.outbouncePayload
                }
                if (!CommonFunction.isEmpty(value)) {
                    switch (customField.fieldType) {
                        case Enumeration.customfield_datatype.STRING:
                        case Enumeration.customfield_datatype.LONG:
                        case Enumeration.customfield_datatype.DOUBLE:
                        case Enumeration.customfield_datatype.BOOLEAN:
                            d.values = [value];
                            break;
                        case Enumeration.customfield_datatype.DATE:
                        case Enumeration.customfield_datatype.DATE_TIME:
                            d.values = [moment(value).format('YYYY-MM-DDTHH:mm:ssZZ')];
                            break;
                        case Enumeration.customfield_datatype.LIST_SINGLE:
                            if (customField.listMethod && customField.listMethod === "METHOD_CONFIG") {
                                if (customField.configResponseType === "all") {
                                    // outbounce data and get all data
                                    d.values = [value];
                                    d.displayValues = getCustomFieldDisplayValues(outbounceData[customField.fieldId], d.values);
                                } else {
                                    // outbounce data and get paging data
                                    d.values = value && value.length > 0 ? [value[0].key] : null;
                                    d.displayValues = _.cloneDeep(value);
                                }
                            } else {
                                // inbounce data
                                d.values = [value];
                                d.displayValues = getCustomFieldDisplayValues(customField.listItems, d.values);
                            }
                            break;
                        case Enumeration.customfield_datatype.LIST_MULTI:
                            if (customField.listMethod && customField.listMethod === "METHOD_CONFIG") {
                                if (customField.configResponseType === "all") {
                                    // outbounce data and get all data
                                    d.values = value;
                                    d.displayValues = getCustomFieldDisplayValues(outbounceData[customField.fieldId], d.values);
                                } else {
                                    // outbounce data and get paging data
                                    d.values = value && value.length > 0 ? value.map(m => (m.key)) : null;
                                    d.displayValues = _.cloneDeep(value);
                                }
                            } else {
                                // inbounce data
                                d.values = value;
                                d.displayValues = getCustomFieldDisplayValues(customField.listItems, d.values);
                            }
                            break;
                        default:
                            break;
                    }
                }

                if (additionReturnInfo && Array.isArray(additionReturnInfo) && additionReturnInfo.length > 0) {
                    additionReturnInfo.forEach(p => {
                        switch (p) {
                            case "fieldType":
                                d[p] = customField[p];
                                break;
                            default:
                                break;
                        }
                    })
                }

                _preparedData.push(d);
            });

            let [valid, errors] = performValidate([], data, true)
            let result = {
                valid: valid,
                errors: errors,
                customFields: refCurrentFieldsConfig.current,
                data: _preparedData
            }

            return result;
        },

        /**
         * changed: [{id: fieldId, value: change value}]
         * @param {*} changed 
         */
        applyValue: (changed) => {
            let _data = _.cloneDeep(data);
            changed.forEach(el => {
                _data[el.id] = el.value;
            });

            setData(_data);
        }

    }));

    /**
     * get custom field display values
     * @param {*} data
     * @param {*} values
     */
    const getCustomFieldDisplayValues = (data, values) => {
        let displayValues = [];
        values.forEach(value => {
            let found = data.find((f) => f.key === value);
            if (found) {
                displayValues.push(found);
            }
        })
        return displayValues;
    }

    /**
     * customfields props change
     */
    useEffect(() => {
        if (fieldsConfig) {
            let jsonConfigs = JSON.stringify(fieldsConfig);
            if (refCacheFieldsConfig.current && jsonConfigs === refCacheFieldsConfig.current) {
                // same configs, do not need to re-render
                return;
            } else {
                refCacheFieldsConfig.current = jsonConfigs;
                refCurrentFieldsConfig.current = _.cloneDeep(fieldsConfig);
                prepareFieldsConfig()
            }
        }
    }, [fieldsConfig])

    /**
     * prepare fields config
     */
    const prepareFieldsConfig = () => {
        let _fieldsConfig = refCurrentFieldsConfig.current;
        let _preparedCustomFields = [];
        let _preparedData = {};
        let _outbounceData = {};
        let _outbounceDataLoadingState = {};
        let _fieldsData = fieldsData && Array.isArray(fieldsData) && fieldsData.length > 0 ? fieldsData : null;
        let _customFieldValidConfig = {};

        _fieldsConfig.forEach(c => {

            // tooltip
            c.tooltip = c.description || "";

            // apply data if exist
            if (_fieldsData) {
                let found = _fieldsData.find(f => f.fieldId === c.fieldId);
                if (found) {
                    c.values = found.values;
                    c.displayValues = found.displayValues;
                }
            }

            // add props to data
            switch (c.fieldType) {
                case Enumeration.customfield_datatype.STRING:
                    _preparedData[c.fieldId] = "";
                    break;
                default:
                    _preparedData[c.fieldId] = null;
                    break;
            }

            // apply props data on task
            if (c.values && c.values.length > 0) {
                let appliedValue = _preparedData[c.fieldId];

                switch (c.fieldType) {
                    case Enumeration.customfield_datatype.STRING:
                        appliedValue = c.values && c.values.length > 0 ? c.values[0] : "";
                        break;
                    case Enumeration.customfield_datatype.LONG:
                    case Enumeration.customfield_datatype.DOUBLE:
                        appliedValue = c.values && c.values.length > 0 ? c.values[0] : null;
                        break;
                    case Enumeration.customfield_datatype.DATE:
                    case Enumeration.customfield_datatype.DATE_TIME:
                        appliedValue = c.values && c.values.length > 0 ? c.values[0] : null;
                        break;
                    case Enumeration.customfield_datatype.BOOLEAN:
                        appliedValue = null;
                        if (c.values && c.values.length > 0) {
                            if (c.values[0] && typeof c.values[0] === "boolean") {
                                appliedValue = c.values[0];
                            } else {
                                if (c.values[0].toLowerCase() === "true") {
                                    appliedValue = true;
                                } else if (c.values[0].toLowerCase() === "false") {
                                    appliedValue = false;
                                }
                            }
                        }
                        break;
                    case Enumeration.customfield_datatype.LIST_SINGLE:
                        if (c.listMethod && c.listMethod === "METHOD_CONFIG") {
                            if (c.configResponseType === "all") {
                                // outbounce data and get all data
                                appliedValue = c.values && c.values.length > 0 ? c.values[0] : null;
                            } else {
                                // outbounce data and get paging data
                                appliedValue = c.displayValues;
                            }
                        } else {
                            // inbounce data
                            appliedValue = c.values[0];
                        }
                        break;
                    case Enumeration.customfield_datatype.LIST_MULTI:
                        if (c.listMethod && c.listMethod === "METHOD_CONFIG") {
                            if (c.configResponseType === "all") {
                                // outbounce data and get all data
                                appliedValue = c.values && c.values.length > 0 ? c.values : null;
                            } else {
                                // outbounce data and get paging data
                                appliedValue = c.displayValues;
                            }
                        } else {
                            // inbounce data
                            appliedValue = c.values;
                        }
                        break;
                    default:
                        break;
                }

                _preparedData[c.fieldId] = appliedValue;

            }

            // prepare outbounce data
            if (c.listMethod && c.listMethod === "METHOD_CONFIG") {
                _outbounceData[c.fieldId] = [];
                _outbounceDataLoadingState[c.fieldId] = {
                    data: [],
                    count: 0,
                    length: 0
                };
            }

            // add validate if required
            if (c.require) {
                _customFieldValidConfig[c.fieldId] = { type: c.fieldType, name: c.fieldName, require: true };
            }

            // customfield valid config
            if (c.validConfig && typeof c.validConfig === "object" && Object.keys(c.validConfig).length > 0) {
                if (!_customFieldValidConfig[c.fieldId]) {
                    _customFieldValidConfig[c.fieldId] = { type: c.fieldType, name: c.fieldName };
                }
                _customFieldValidConfig[c.fieldId].valid = { ...c.validConfig };

                // build valid tooltip
                let validTooltip = [];
                for (const key in c.validConfig || {}) {
                    if (c.validConfig[key]) {
                        validTooltip.push(
                            t(`customfield.valid-config.${key}.validate`).format(c.validConfig[key].toString())
                        );
                    }
                }
                validTooltip = validTooltip.join(", ");

                if (CommonFunction.isEmpty(c.tooltip)) {
                    c.tooltip = validTooltip;
                } else {
                    c.tooltip += " (" + validTooltip + ")";
                }
            }

            // add id to custom field for render
            _preparedCustomFields.push(
                {
                    ...c,
                    renderId: `${c.fieldType}_${CommonFunction.getIdNumber()}`,
                    readOnly: disabled ? true : c.readOnly
                }
            )
        });

        setPreparedCustomFields(_preparedCustomFields);
        setOutbounceData(_outbounceData);
        refOutbounceDataLoadingState.current = _.cloneDeep(_outbounceData);
        refCustomFieldValidConfig.current = _customFieldValidConfig;

        // get outbounce static data
        // apply data when outbounce data loaded
        getOutbounceStaticData(_fieldsConfig, _preparedData);
    }

    /**
     * get outbounce static data
     */
    const getOutbounceStaticData = (_customFields, _data) => {
        let allData = {};

        _customFields = _.cloneDeep(_customFields).filter(f => f.listMethod === "METHOD_CONFIG" && f.configResponseType === "all");
        if (_customFields && _customFields.length > 0) {
            setTimeout(() => {

                Promise.all((function* () {
                    for (let _customField of _customFields) {
                        yield new Promise(resolve => {
                            allData[_customField.fieldId] = [];

                            SystemEventApi.get(_customField.configId, _customField.outbouncePayload || {}).then(res => {
                                if (res) {

                                    let data = [];
                                    if (Array.isArray(res) && res.length > 0) {
                                        data = res;
                                    } else if (res.content && res.content.length > 0) {
                                        data = res.content;
                                    }

                                    if (data.length > 0) {

                                        // prepare key
                                        data.forEach(el => {
                                            el.key = el.key.toString();
                                        });

                                        // prepare display config
                                        data = prepareOutbounceDataDisplay(_customField.displayConfig, data);

                                    }

                                    allData[_customField.fieldId] = data;
                                    // allData[_customField.fieldId] = res.content.map(m => ({ ...m, key: m.key.toString() }));
                                }
                                resolve("");
                            })
                        })
                    }
                })()).then(() => {
                    // bind data
                    let _outbounceData = _.cloneDeep(outbounceData);

                    for (const key in allData) {
                        _outbounceData[key] = allData[key];
                    }

                    setOutbounceData(_outbounceData);

                    setData(_data);
                })

            }, 0);
        } else {
            setData(_data);
        }


    }

    /**
     * prepare outbouce data display
     */
    const prepareOutbounceDataDisplay = (displayConfig, records) => {
        try {

            // prepare type
            if (displayConfig.type) {
                switch (displayConfig.type) {
                    case "tree":
                        records = prepareOutbounceDataDisplay_tree(displayConfig, records);
                        break;
                    default:
                        break;
                }
            }

            if (records && records.length > 0) {

                // prepare display config
                if (displayConfig && typeof displayConfig === "object" && Object.keys(displayConfig).length > 0) {

                    // prepare display column
                    if (displayConfig.columns && Array.isArray(displayConfig.columns) && displayConfig.columns.length > 0) {
                        let filterFields = [];
                        let displayColumns = [];
                        let headerRow = _.cloneDeep(records[0]);

                        displayConfig.columns.forEach(cfg => {
                            if (cfg.field) {
                                if (cfg.filter) {
                                    filterFields.push(cfg.field);
                                }

                                if (!cfg.hidden) {
                                    displayColumns.push({
                                        field: cfg.field,
                                        width: cfg.width || "100px"
                                    });
                                    headerRow[cfg.field] = cfg.labelLocale ? t(cfg.labelLocale) : (cfg.label || cfg.field || "");
                                }
                            }
                        });

                        // if not exist filter fields, filter by value
                        if (filterFields.length === 0) filterFields = ["value"];

                        let headerFilter = ""; // combine all columns filter to always show header

                        records.forEach(rec => {
                            // apply filter key
                            if (CommonFunction.isEmpty(rec.filter)) {
                                rec.filter = "";
                            } else {
                                rec.filter += "/";
                            }
                            filterFields.forEach(f => rec.filter += (rec[f] ? rec[f].toString() : "") + "/");

                            headerFilter += rec.filter + "/"; // combine all columns filter to always show header

                            // apply display, only display as grid if number of columns > 1
                            rec.displayConfig = displayColumns.length > 0 ? displayColumns : null;
                        });

                        if (displayColumns.length > 0) {
                            headerRow.key = CommonFunction.getIdNumber().toString();
                            headerRow.isHeader = true;
                            headerRow.displayConfig = displayConfig.columns;
                            headerRow.filter = headerFilter;
                            records.unshift(headerRow);
                        }
                    }
                }

                // prepare default filter
                records.forEach(el => {
                    if (CommonFunction.isEmpty(el.filter)) {
                        el.filter = el.value;
                    }
                });
            }
        } catch (error) {
            console.log("FieldDynamicForm getOutbounceStaticData prepare display config", error);
        } finally {
            return records;
        }
    }

    /**
     * prepare outbouce data display tree type
     * typeConfig: {id: "", parentId: ""}
     */
    const prepareOutbounceDataDisplay_tree = (displayConfig, records) => {
        try {
            if (displayConfig && displayConfig.typeConfig) {
                let id = displayConfig.typeConfig.id,
                    parentId = displayConfig.typeConfig.parentId,
                    label = displayConfig.typeConfig.label;
                if (!CommonFunction.isEmpty(id) && !CommonFunction.isEmpty(parentId) && !CommonFunction.isEmpty(label)) {
                    records = _.orderBy(records, [label]);

                    // map data index
                    let map = {}, leveledNode = {}, childrenMap = {};
                    records.forEach((rec, index) => {
                        map[rec.key] = index;

                        rec._treePath = `000000${index}`.slice(-6);
                        rec._treeParents = [];
                        // find root node
                        if (!rec[parentId] || CommonFunction.isEmpty(rec[parentId])) {
                            rec._treeLevel = 1;
                            leveledNode[rec[id]] = 1; // leveled node level
                            rec._pathName = rec[label];
                        } else {
                            if (!childrenMap[rec[parentId]]) {
                                childrenMap[rec[parentId]] = {};
                            }
                            childrenMap[rec[parentId]][rec[id]] = index;
                        }
                    });

                    // calculate filter, level
                    let loopCount = 0;
                    while (loopCount < 10 && Object.keys(childrenMap).length > 0) {
                        [...Object.keys(childrenMap)].forEach(parentNodeId => {
                            if (leveledNode[parentNodeId]) { // if parent node is leveled
                                let childrenLevel = leveledNode[parentNodeId] + 1;

                                Object.keys(childrenMap[parentNodeId]).forEach(childrenNodeId => {
                                    if (map[childrenNodeId] || map[childrenNodeId] === 0) {
                                        records[map[childrenNodeId]]._treeLevel = childrenLevel;
                                        leveledNode[childrenNodeId] = childrenLevel;

                                        if (map[parentNodeId] || map[parentNodeId] === 0) {
                                            records[map[childrenNodeId]]._treePath = records[map[parentNodeId]]._treePath + "_" + records[map[childrenNodeId]]._treePath;
                                            records[map[childrenNodeId]]._treeParents = [...records[map[parentNodeId]]._treeParents, parentNodeId];
                                            records[map[childrenNodeId]]._pathName = records[map[parentNodeId]]._pathName + " / " + records[map[childrenNodeId]][label];
                                        }
                                    }
                                })

                                delete childrenMap[parentNodeId];
                            }
                        });

                        loopCount += 1;
                    }

                    records = _.orderBy(records, ["_treePath"]);

                    // buiding filter
                    map = {};
                    records.forEach((rec, index) => {
                        map[rec[id]] = index;
                        rec.filter = (rec.filter ? rec.filter + "/" : "") + rec[label];
                    })

                    for (let i = 0; i < records.length; i++) {
                        const rec = records[i];
                        for (let i = 0; i < rec._treeParents.length; i++) {
                            const parentId = rec._treeParents[i];
                            records[map[parentId]].filter += "/" + rec[label];
                        }
                    }

                }
            }
        } catch (error) {
            console.log("FieldDynamicForm prepareOutbounceDataDisplay_tree", error);
        }
        finally {
            return records;
        }
    }

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        var _data = { ...data, [prop]: (val === undefined ? null : val) }
        setData(_data);
        if (props.applyChange && typeof props.applyChange === "function") {
            props.applyChange(prop, val)
        }
        performValidate([prop], _data);
    }

    /**
     * apply auto complete change
     * @param {*} prop
     * @param {*} val
     * @param {*} multi
     */
    const applyAutoCompleteChange = (prop, val, multi) => {
        let appliedVal = val;
        if (val.length === 0) {
            appliedVal = null;
        }
        if (!multi && val.length > 1) {
            appliedVal = appliedVal.splice(appliedVal.length - 1, 1);
        }

        var _data = { ...data, [prop]: appliedVal };
        setData(_data);
        if (props.applyChange && typeof props.applyChange === "function") {
            props.applyChange(prop, appliedVal)
        }
        performValidate([prop], _data);
    }

    /**
     * validate service
     * @param {Array} _props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (_props, _data, _errorsWithFieldName) => {
        var result = { ...validate }, isValid = true, errors = [], _props = _props || [];

        // validate all props
        if (_props.length === 0) {
            _props = [...Object.keys(refCustomFieldValidConfig.current)];
        }

        // validate props
        _props.forEach(prop => {

            result[prop] = null; // reset validate result

            let _value = _data[prop];

            // validate customfield by valid config

            if (refCustomFieldValidConfig.current && refCustomFieldValidConfig.current[prop]) {
                let cfg = refCustomFieldValidConfig.current[prop];

                if (CommonFunction.isEmpty(_value)) {
                    // if value is empty
                    if (cfg.require) {
                        result[prop] = t("validate.required");
                    }
                } else {
                    if (cfg.valid) {

                        // if value is not empty
                        // check by type
                        switch (cfg.type) {
                            case Enumeration.customfield_datatype.STRING:
                                if (cfg.valid.minLength) {
                                    if (_value.length < cfg.valid.minLength) {
                                        result[prop] = t("validate.min-length").format(cfg.valid.minLength);
                                    }
                                }

                                if (!result[prop] && cfg.valid.maxLength) {
                                    if (_value.length > cfg.valid.maxLength) {
                                        result[prop] = t("validate.max-length").format(cfg.valid.maxLength);
                                    }
                                }
                                break;
                            case Enumeration.customfield_datatype.LONG:
                            case Enumeration.customfield_datatype.DOUBLE:
                                if (!CommonFunction.isEmpty(cfg.valid.greaterThan)) {
                                    if (_value <= cfg.valid.greaterThan) {
                                        result[prop] = t("customfield.valid-config.greaterThan.validate").format(cfg.valid.greaterThan);
                                    }
                                }
                                if (!result[prop] && !CommonFunction.isEmpty(cfg.valid.greaterThanOrEqualTo)) {
                                    if (_value < cfg.valid.greaterThanOrEqualTo) {
                                        result[prop] = t("customfield.valid-config.greaterThanOrEqualTo.validate").format(cfg.valid.greaterThanOrEqualTo);
                                    }
                                }
                                if (!result[prop] && !CommonFunction.isEmpty(cfg.valid.lessThan)) {
                                    if (_value >= cfg.valid.lessThan) {
                                        result[prop] = t("customfield.valid-config.lessThan.validate").format(cfg.valid.lessThan);
                                    }
                                }
                                if (!result[prop] && !CommonFunction.isEmpty(cfg.valid.lessThanOrEqualTo)) {
                                    if (_value > cfg.valid.lessThanOrEqualTo) {
                                        result[prop] = t("customfield.valid-config.lessThanOrEqualTo.validate").format(cfg.valid.lessThanOrEqualTo);
                                    }
                                }
                                break;
                            default:
                                break;
                        }

                        // check by regex
                        if (!result[prop] && !CommonFunction.isEmpty(cfg.valid.regex)) {
                            const re = new RegExp(cfg.valid.regex);
                            if (!_value.toString().match(re)) {
                                result[prop] = t("customfield.valid-config.regex.validate").format(cfg.valid.regex);
                            }
                        }
                    }
                }
            }
        });

        // set state
        setValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                if (_errorsWithFieldName && refCustomFieldValidConfig.current[property]) {
                    errors.push(`${refCustomFieldValidConfig.current[property].name}: ${result[property]}`);
                } else {
                    errors.push(result[property]);
                }
            }
        }

        return [isValid, errors];
    }

    /**
     * get config method control
     * @param {*} customFields
     */
    const getConfigMethodControl = (customField) => {
        if (customField.fieldType === "LIST_SINGLE" && customField.configResponseType === "all") {
            // choose 1 - load all => dropdown
            return getConfigMethodControl_dropdown(customField);
        } else if (customField.fieldType === "LIST_MULTI" && customField.configResponseType === "all") {
            // choose many - load all => multi select
            return getConfigMethodControl_multiselect(customField);
        } else if (["LIST_SINGLE", "LIST_MULTI"].indexOf(customField.fieldType) > -1 && customField.configResponseType === "paging") {
            // choose 1 - paging => auto complete
            // choose many - paging => auto compelete
            return getConfigMethodControl_autocomplete(customField);
        }
    }

    /**
     * get config method control
     *      choose 1 - load all => dropdown
     * @param {*} customField
     */
    const getConfigMethodControl_dropdown = (customField) => {
        // return component
        return (
            <Dropdown
                id={customField.renderId}
                value={data[customField.fieldId]}
                options={outbounceData[customField.fieldId]}
                onChange={(e) => applyChange(customField.fieldId, e.value)}
                optionLabel="value"
                optionValue="key"
                panelClassName={classNames({
                    "dynamic-combobox-grid-panel": customField.displayConfig && customField.displayConfig.columns && Array.isArray(customField.displayConfig.columns) && customField.displayConfig.columns.length > 0
                })}
                disabled={customField.readOnly}
                filter
                filterBy='filter'
                itemTemplate={renderDropdownGridByDisplayConfig}
                showClear
                optionDisabled="isHeader"
                
                tooltip={customField.tooltip}
            />
        );
    }

    /**
     * render dropdown grid by display config
     * @param {*} rec 
     */
    const renderDropdownGridByDisplayConfig = (rec) => {
        if (rec.displayConfig) {
            return (
                <>
                    {rec.displayConfig.map((col, index) => (
                        <div
                            key={index}
                            className={classNames({
                                'combobox-grid-column': true,
                                'combobox-grid-header': rec.isHeader,
                                [`combobox-tree-branch level-${rec._treeLevel}`]: index === 0 && rec._treeLevel
                            })} style={{ width: col.width }}
                            title={rec._pathName || ""}>
                            {rec[col.field]}
                        </div>
                    ))}
                </>
            )
        } else {
            return rec.value
        }
    }

    /**
     * get config method control
     *      choose many - load all => multi select
     * @param {*} customField
     */
    const getConfigMethodControl_multiselect = (customField) => {
        // return component
        return (
            <MultiSelect
                id={customField.renderId}
                value={data[customField.fieldId]}
                options={outbounceData[customField.fieldId]}
                onChange={(e) => applyChange(customField.fieldId, e.value)}
                optionLabel="value"
                optionValue="key"
                display="chip"
                filter
                disabled={customField.readOnly}
                panelClassName={classNames({
                    "dynamic-combobox-grid-panel": customField.displayConfig && customField.displayConfig.columns && Array.isArray(customField.displayConfig.columns) && customField.displayConfig.columns.length > 0
                })}
                filterBy='filter'
                itemTemplate={renderDropdownGridByDisplayConfig}
                showClear
                optionDisabled="isHeader"
                
                className={classNames({
                    "multi-select-loading": !outbounceData[customField.fieldId]
                })}
                tooltip={customField.tooltip}
            />
        )
    }

    /**
     * get config method control
     *      choose 1 - paging => auto complele
     *      choose many - paging => auto complele
     * @param {*} customField
     */
    const getConfigMethodControl_autocomplete = (customField) => {
        return (
            <AutoComplete
                autoHighlight
                disabled={customField.disabled}
                id={customField.renderId}
                value={data[customField.fieldId]}
                field="name"
                suggestions={outbounceData[customField.fieldId]}
                completeMethod={(e) => filterOutbounceData(e, customField)}
                onChange={(e) => applyAutoCompleteChange(customField.fieldId, e.value, customField.fieldType === "LIST_MULTI")}
                multiple
                panelClassName={`p-autocomplete-for-customfield-${customField.fieldId}`}
                delay={100}
                dropdown
                selectedItemTemplate={(item) => {
                    switch (customField.configDataType) {
                        case "user":
                            return getConfigMethodControl_selecteditemtemplate_user(item);
                        default:
                            return <div>{item.value}</div>
                    }
                }}
                itemTemplate={(item) => {
                    switch (customField.configDataType) {
                        case "user":
                            return getConfigMethodControl_itemtemplate_user(item);
                        default:
                            return <div>{item.value}</div>
                    }
                }}
                tooltip={customField.tooltip}
            />
        );
    }

    /**
     * filter outbounce data
     * @param {*} e
     * @param {*} customField
     */
    const filterOutbounceData = (e, customField) => {
        let query = e.query.trim().toLowerCase();
        SystemEventApi.get(customField.configId, { page: 0, size: outbounceLoadSize, search: query }).then(res => {
            if (res) {
                // apply data
                let _outbounceData = _.cloneDeep(outbounceData);
                let _outbounceDataLoadingState = _.cloneDeep(refOutbounceDataLoadingState.current);

                if (res.content && res.content.length > 0) {
                    _outbounceData[customField.fieldId] = _.cloneDeep(res.content);
                    _outbounceDataLoadingState[customField.fieldId] = {
                        data: res.content,
                        count: res.content.length,
                        total: res.total,
                        query: query,
                        page: 0,
                        loading: false
                    };
                } else {
                    _outbounceData[customField.fieldId] = [];
                    _outbounceDataLoadingState[customField.fieldId] = {
                        data: [],
                        count: 0,
                        total: 0
                    };
                }

                setOutbounceData(_outbounceData);
                refOutbounceDataLoadingState.current = _outbounceDataLoadingState;

                // check if data has more, apply scroll event to load
                setTimeout(() => {
                    let els = document.getElementsByClassName(`p-autocomplete-for-customfield-${customField.fieldId}`); // find element
                    if (els && els.length > 0) {
                        let el = els[0];
                        if (_outbounceDataLoadingState[customField.fieldId].count < _outbounceDataLoadingState[customField.fieldId].total) {
                            el.addEventListener("scroll", loadMoreOutbounceData);
                        } else {
                            el.removeEventListener("scroll", loadMoreOutbounceData);
                        }
                    }
                }, 100);
            }
        })
    }

    /**
     * load more outbounce data
     */
    const loadMoreOutbounceData = (e) => {
        // check if element scroll to the end
        CommonFunction.debounce(50, () => {
            let el = e.target;

            if (el.scrollTop + el.clientHeight > el.scrollHeight - 30) {
                // get element id via class list
                for (let i = 0; i < el.classList.length; i++) {
                    const cls = el.classList[i];
                    if (cls.startsWith("p-autocomplete-for-customfield-")) {
                        let customFieldId = parseInt(cls.replace("p-autocomplete-for-customfield-", ""));
                        let customField = _.find(refCurrentFieldsConfig.current, { fieldId: customFieldId });
                        if (!refOutbounceDataLoadingState.current[customField.fieldId].loading) {
                            // mark data is loading
                            refOutbounceDataLoadingState.current[customField.fieldId].loading = true;

                            // load data
                            let _outbounceDataLoadingState = _.cloneDeep(refOutbounceDataLoadingState.current);
                            SystemEventApi.get(customField.configId,
                                {
                                    page: _outbounceDataLoadingState[customField.fieldId].page + 1,
                                    size: outbounceLoadSize,
                                    search: _outbounceDataLoadingState[customField.fieldId].query
                                }
                            ).then(res => {
                                if (res) {
                                    if (res.content && res.content.length > 0) {

                                        // append more data
                                        _outbounceDataLoadingState[customField.fieldId].data = [
                                            ..._outbounceDataLoadingState[customField.fieldId].data,
                                            ...res.content
                                        ];

                                        // set lazy param
                                        _outbounceDataLoadingState[customField.fieldId].total = res.total;
                                        _outbounceDataLoadingState[customField.fieldId].count = _outbounceDataLoadingState[customField.fieldId].data.length;
                                        _outbounceDataLoadingState[customField.fieldId].page = res.page;

                                        let _outbounceData = _.cloneDeep(outbounceData);
                                        _outbounceData[customField.fieldId] = _.clone(_outbounceDataLoadingState[customField.fieldId].data);
                                        setOutbounceData(_outbounceData);
                                    }
                                }
                                // set loading false
                                _outbounceDataLoadingState[customField.fieldId].loading = false;
                                refOutbounceDataLoadingState.current = _outbounceDataLoadingState;

                                // remove event if all data loaded
                                if (_outbounceDataLoadingState[customField.fieldId].count >= _outbounceDataLoadingState[customField.fieldId].total) {
                                    let els = document.getElementsByClassName(`p-autocomplete-for-customfield-${customField.fieldId}`); // find element
                                    if (els && els.length > 0) {
                                        let el = els[0];
                                        el.removeEventListener("scroll", loadMoreOutbounceData);
                                    }
                                }
                            })
                        }
                        break;
                    }
                }
            }
        })

    }

    /**
     * render auto complete item template for user
     * @param {*} item
     * @returns
     */
    const getConfigMethodControl_itemtemplate_user = (item) => {
        return (
            <div className="flex align-items-stretch">
                <img className="autocomplete-user-avatar" src={CommonFunction.getImageUrl(item.avatar, item.value)} />
                <div className={classNames({ "pt-1": true, "p-text-line-through": item.status === 1 })}>
                    <div className="bold-and-color">{item.value}</div>
                    <div className="text-grey mt-1">{t("org") + " : "} {item.orgs && item.orgs.map(m => m.name).join(", ")}</div>
                </div>
            </div>
        )
    }

    /**
     * render auto complete selected item template for user
     * @param {*} item
     * @returns
     */
    const getConfigMethodControl_selecteditemtemplate_user = (item) => {
        return (
            <div className="flex align-items-center">
                <img className="autocomplete-user-avatar" src={CommonFunction.getImageUrl(item.avatar, item.value)} />
                <div>{item.value}</div>
            </div>
        )
    }

    if (refCurrentFieldsConfig.current && Array.isArray(refCurrentFieldsConfig.current) && refCurrentFieldsConfig.current.length > 0) {
        return (
            <div
                className={`grid formgrid p-fluid fluid  ${className ? className : ""}`}
                style={style}
            >
                {preparedCustomFields.map((customField, index) => (
                    <div
                        key={index}
                        className={classNames({
                            "col-3": customField.layout === "1/4",
                            "col-4": customField.layout === "1/3",
                            "col-6": customField.layout === "1/2",
                            "col-12": customField.layout === "1"
                        })}
                    >
                        {/* STRING */}
                        {customField.fieldType === "STRING" &&
                            <>
                                <span className="p-float-label">
                                    <InputText
                                        id={customField.renderId}
                                        value={data[customField.fieldId] || ""}
                                        disabled={customField.readOnly}
                                        onChange={(e) => applyChange(customField.fieldId, e.target.value)}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* LONG */}
                        {customField.fieldType === "LONG" &&
                            <>
                                <span className="p-float-label">
                                    <InputNumber
                                        id={customField.renderId}
                                        value={data[customField.fieldId]}
                                        onChange={(e) => applyChange(customField.fieldId, e.value)}
                                        disabled={customField.readOnly}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* DOUBLE */}
                        {customField.fieldType === "DOUBLE" &&
                            <>
                                <span className="p-float-label">
                                    <InputNumber
                                        id={customField.renderId}
                                        mode="decimal"
                                        minFractionDigits={1}
                                        maxFractionDigits={20}
                                        value={data[customField.fieldId]}
                                        onChange={(e) => {
                                            applyChange(customField.fieldId, e.value)
                                        }}
                                        disabled={customField.readOnly}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* DATE */}
                        {["DATE", "DATE_TIME"].indexOf(customField.fieldType) > -1 &&
                            <>
                                <XCalendar
                                    label={customField.localeName || customField.fieldName}
                                    require={customField.require ? true : false}
                                    showDate
                                    showTime={customField.fieldType === "DATE_TIME"}
                                    value={data[customField.fieldId]}
                                    onChange={(e) => applyChange(customField.fieldId, e)}
                                    disabled={customField.readOnly}
                                    tooltip={customField.tooltip}
                                />
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* BOOLEAN */}
                        {customField.fieldType === "BOOLEAN" &&
                            <>
                                <div className="p-field-checkbox">
                                    <TriStateCheckbox
                                        inputId={customField.renderId}
                                        value={data[customField.fieldId]}
                                        onChange={e => applyChange(customField.fieldId, e.value)}
                                        disabled={customField.readOnly}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </div>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* LIST_SINGLE METHOD_ARRAY*/}
                        {customField.fieldType === "LIST_SINGLE" && customField.listMethod === "METHOD_ARRAY" &&
                            <>
                                <span className="p-float-label">
                                    <Dropdown
                                        id={customField.renderId}
                                        value={data[customField.fieldId]}
                                        options={customField.listItems}
                                        onChange={(e) => applyChange(customField.fieldId, e.value)}
                                        optionLabel="value"
                                        optionValue="key"
                                        showClear
                                        disabled={customField.readOnly}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* LIST_MULTI METHOD_ARRAY*/}
                        {customField.fieldType === "LIST_MULTI" && customField.listMethod === "METHOD_ARRAY" &&
                            <>
                                <span className={classNames({
                                    "p-float-label": true,
                                    "require": customField.require
                                })}>
                                    <MultiSelect
                                        id={customField.renderId}
                                        value={data[customField.fieldId]}
                                        options={customField.listItems}
                                        onChange={(e) => applyChange(customField.fieldId, e.value)}
                                        optionLabel="value"
                                        optionValue="key"
                                        display="chip"
                                        disabled={customField.readOnly}
                                        tooltip={customField.tooltip}
                                    />
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                        {/* METHOD_ARRAY*/}
                        {customField.listMethod && customField.listMethod === "METHOD_CONFIG" &&
                            <>
                                <span className="p-float-label">
                                    {getConfigMethodControl(customField)}
                                    <label htmlFor={customField.renderId} className={classNames({ "require": customField.require })}>{customField.localeName || customField.fieldName}</label>
                                </span>
                                {validate[customField.fieldId] && <small className="p-invalid">{validate[customField.fieldId]}</small>}
                            </>
                        }

                    </div>
                ))
                }
            </div>
        );
    } else {
        return <></>
    }
}

FieldDynamicForm = forwardRef(FieldDynamicForm);

export default FieldDynamicForm;

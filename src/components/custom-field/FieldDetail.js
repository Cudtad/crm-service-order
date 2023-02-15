import { Dialog } from 'primereact/dialog';
import { useTranslation } from 'react-i18next';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import Enumeration from '@lib/enum';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import WorkflowApi from "services/WorkflowApi";
import CommonFunction from '@lib/common';
import { Dropdown } from 'primereact/dropdown';
import _ from "lodash";
import EmptyDataCompact from "@ngdox/ui-lib/dist/components/empty-data/EmptyDataCompact";
import { ReactSortable } from "react-sortablejs";
import CustomFieldConfigApi from 'services/CustomFieldConfigService';
import classNames from 'classnames';
import "features/task/scss/TaskBaseList.scss";

/**
 * props:
 *      dialog: true // default true, if not use dialog, set dialog: false
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function FieldDetail(props, ref) {
    const t = CommonFunction.t;
    const { dialog } = props;

    // default cf
    let emptyCustomField = {
        type: "",
        code: "",
        name: "",
        description: "",
        listMethod: null,
        listItems: null,
        status: true,
        workflowId: null
    }

    // default validate object
    let emptyCustomFieldValidate = {
        type: null,
        code: null,
        name: null,
        listItems: null,
        configId: null
    }

    const type = [
        { name: t("custom-field.data-type.string"), code: 'STRING' },
        { name: t("custom-field.data-type.long"), code: 'LONG' },
        { name: t("custom-field.data-type.double"), code: 'DOUBLE' },
        { name: t("custom-field.data-type.date"), code: 'DATE' },
        { name: t("custom-field.data-type.datetime"), code: 'DATE_TIME' },
        { name: t("custom-field.data-type.boolean"), code: 'BOOLEAN' },
        { name: t("custom-field.data-type.list-single"), code: 'LIST_SINGLE' },
        { name: t("custom-field.data-type.list-multi"), code: 'LIST_MULTI' },
    ];

    const method = [
        { name: t("custom-field.method.array"), code: 'METHOD_ARRAY' },
        { name: t("custom-field.method.config"), code: 'METHOD_CONFIG' },
    ]


    const [show, setShow] = useState(false);
    const [mode, setMode] = useState(Enumeration.crud.none);
    const [customField, setCustomField] = useState(emptyCustomField);
    const [customFieldValidate, setCustomFieldValidate] = useState(emptyCustomFieldValidate);
    const [customfieldConfigList, setCustomFieldConfigList] = useState([]);
    const [id, setId] = useState(null);
    const [entityType, setEntityType] = useState(null);

    useImperativeHandle(ref, () => ({
        init: async (_mode, _type, _id, _customField) => {

            setMode(_mode);
            switch (_mode) {
                case Enumeration.crud.update:
                    let data = await WorkflowApi.getCustomField(_customField.id);
                    setCustomField({
                        ...data,
                        status: data.status === 1 ? true : false,
                        type: type.find(_type => _type.code === data.type),
                        listMethod: method.find(_method => _method.code === data.listMethod),
                        entity: _type,
                        entityId: _id
                    });
                    break;
                default:
                    setCustomField({ ...emptyCustomField, entity: _type, entityId: _id });
                    break;
            }
            setEntityType(_type);
            setId(_id);
            setCustomFieldValidate(emptyCustomFieldValidate);

            // get custom field config
            CustomFieldConfigApi.getAll().then(res => {
                if (res) {
                    setCustomFieldConfigList(res);
                }
            })

            setShow(true);
        }
    }));

    /**
     * hide detail
     */
    const hideDetail = () => {
        setShow(false);
    };

    /**
     * submit
     */
    const submit = async () => {
        // validate
        let isValid = performValidate([]);

        // valid custom field list item
        if (isValid) {
            if (customField.listMethod && customField.listMethod.code == 'METHOD_ARRAY') {
                if (!customField.listItems || customField.listItems.length === 0) {
                    isValid = false;
                    CommonFunction.toastWarning(t("workflow.custom-field.empty-value-list"));
                }
            }
        }

        // submit
        if (isValid) {
            // call api
            try {
                let _customField = {
                    ...customField,
                    type: customField.type.code,
                    listMethod: customField.listMethod ? customField.listMethod.code : customField.listMethod,
                    configId: customField.configId,
                    entity: entityType,
                    entityId: id
                };

                let result = null;

                switch (mode) {
                    case Enumeration.crud.create:
                        result = await WorkflowApi.createField(_customField);
                        break;
                    case Enumeration.crud.update:
                        result = await WorkflowApi.updateField(_customField);
                        break;
                    default:
                        break;
                }
                if (result) {
                    props["after-submit"](mode, result);
                    hideDetail();
                    CommonFunction.toastSuccess(t("common.save-success"));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    /**
     * validate service
     * @param {Array} _props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (_props) => {
        let result = { ...customFieldValidate }, isValid = true;

        // validate all props
        if (_props.length === 0) {
            for (const property in result) {
                _props.push(property);
            }
        }

        // validate props
        _props.forEach(prop => {
            switch (prop) {
                case 'type':
                    result[prop] = customField.type ? null : `${t('custom-field.type')} ${t('message.cant-be-empty')}`;
                    break;
                case 'code':
                    if (customField.code.length > 0) {
                        let currentId = mode === Enumeration.crud.create ? -1 : customField.id;
                        result[prop] = CommonFunction.isExist(props.customFields.filter(o => o.id !== currentId), 'code', customField) ? `${t('custom-field.code')} ${t('message.has-exist')}` : null;
                    } else {
                        result[prop] = customField.code.length > 0 ? null : `${t('custom-field.code')} ${t('message.cant-be-empty')}`;
                    }
                    break;
                case 'name':
                    result[prop] = customField.name.length > 0 ? null : `${t('custom-field.name')} ${t('message.cant-be-empty')}`;
                    break;
                case 'configId':
                    if (customField.listMethod && customField.listMethod.code === "METHOD_CONFIG") {
                        result[prop] = customField.configId ? null : t('validate.required');
                    }
                    break;
                case 'listItems':
                    if (!customField.listItems) break;
                    const listItems = _.cloneDeep(customField.listItems);
                    const listNews = listItems.filter(o => o.isNew);
                    const listOlds = _.difference(listItems, listNews);
                    if (listNews && listNews.length > 0) {
                        listNews.forEach(item => {
                            if (CommonFunction.isExist(listOlds, 'value', item)) {
                                result[prop] = `${t('field.value')} ${t('message.is-duplicate')}`;
                            } else {
                                result[prop] = null;
                            }
                        });
                    } else {
                        result[prop] = null;
                    }
                    break;
                default:
                    break;
            }
        });

        // set state
        setCustomFieldValidate(result);

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
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        switch (prop) {
            case "type":
                if (val.code !== 'LIST_SINGLE' || val.code !== 'LIST_MULTI') customField.listMethod = null;
                break;
            case "name":
                customField.code = generateKey(val);
                performValidate(["code"]);
                break;
            default:
                break;
        }
        setCustomField({ ...customField, [prop]: val });
    };

    /**
     * add value list
     * @param {*} index
     */
    const addValueList = (index) => {
        index = index === null ? 0 : index;
        let _customField = _.cloneDeep(customField);
        if (CommonFunction.isEmpty(_customField.listItems)) {
            _customField.listItems = []
        }

        _customField.listItems = [
            ..._customField.listItems.slice(0, index + 1),
            {
                key: "",
                value: ""
            },
            ..._customField.listItems.slice(index + 1)
        ]

        setCustomField(_customField);
    }

    /**
     * add value list
     * @param {*} index
     */
    const removeValueList = (index) => {
        let _customField = _.cloneDeep(customField);
        _customField.listItems = [
            ..._customField.listItems.slice(0, index),
            ..._customField.listItems.slice(index + 1)
        ];
        setCustomField(_customField);
    }

    /**
     * set value list
     * @param {*} index
     */
    const setValueList = (index, prop, value) => {
        let _customField = _.cloneDeep(customField);

        // prepare key
        if (prop === "value") {
            // check if old key is auto generated key
            let oldGeneratedKey = generateKey(_customField.listItems[index].value);
            let oldKey = _customField.listItems[index].key;
            if (oldGeneratedKey === oldKey) {
                // if old key is auto generated key, set new key
                _customField.listItems[index].key = generateKey(value);
            }
        } else {
            // if change key, standalize key
            value = generateKey(value);
        }

        // apply change
        _customField.listItems[index][prop] = value;

        setCustomField(_customField);
    }

    /**
     * generate key
     * remove vietnamese charater
     * remove double space
     * replace space to _
     * @param {*} value
     * @returns
     */
    const generateKey = (value) => {
        return CommonFunction.removeAccentVietnamese(value).replace(/\s\s+/g, ' ').trim().replaceAll(" ", "_");
    }

    /**
     * set actions event after sort
     */
    const afterSortEvents = (e, sortable, store) => {
        let oldIndex = e.oldIndex, newIndex = e.newIndex;
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            let _customField = _.cloneDeep(customField);

            // move item in array
            CommonFunction.arrayMove(_customField.listItems, oldIndex, newIndex);

            // set state
            setCustomField(_customField);
        }
    }

    const renderForm = () => {
        return (<>
            <div className="formgrid grid">
                <div className="p-field p-col">
                    <span className="p-float-label">
                        <InputText id="name" value={customField.name}
                            onChange={(e) => applyChange('name', e.target.value)}
                            onBlur={(e) => performValidate(["name"])}
                            className={classNames({ "dense": true, 'p-invalid': customFieldValidate.name })} />
                        <label htmlFor="name">{t('custom-field.name')}</label>
                    </span>
                    {customFieldValidate.name && <small className="p-invalid">{customFieldValidate.name}</small>}
                </div>
                <div className="p-field p-col">
                    <span className="p-float-label">
                        <InputText id="code"
                            value={customField.code}
                            onChange={(e) => applyChange('code', e.target.value)}
                            onBlur={(e) => performValidate(["code"])}
                            className={classNames({ "dense": true, 'p-invalid': customFieldValidate.code })}
                        />
                        <label htmlFor="code">{t('custom-field.code')}</label>
                    </span>
                    {customFieldValidate.code && <small className="p-invalid">{customFieldValidate.code}</small>}
                </div>
            </div>

            <div className="p-field">
                <span className="p-float-label">
                    <InputText id="description" value={customField.description}
                        
                        onChange={(e) => applyChange('description', e.target.value)} />
                    <label htmlFor="description">{t('custom-field.description')}</label>
                </span>
            </div>

            <div className="p-field">
                <span className="p-float-label">
                    <Dropdown value={customField.type} options={type} optionLabel="name"
                        onChange={(e) => applyChange('type', e.value)}
                        className={classNames({ "dense": true, 'p-invalid': customFieldValidate.type })}
                        disabled={customField.id ? true : false}
                    />
                    <label htmlFor="name">{t('custom-field.type')}</label>
                </span>
                {customFieldValidate.type && <small className="p-invalid">{customFieldValidate.type}</small>}
            </div>

            {(customField.type.code == 'LIST_SINGLE' || customField.type.code == 'LIST_MULTI') && (
                <div className="p-field">
                    <span className="p-float-label">
                        <Dropdown value={customField.listMethod} options={method} optionLabel="name"
                            onChange={(e) => applyChange('listMethod', e.value)}
                            onBlur={(e) => performValidate(["listMethod"])}
                            className={classNames({ "dense": true, 'p-invalid': customFieldValidate.listMethod })}
                        />
                        <label htmlFor="name">{t('custom-field.method')}</label>
                    </span>
                    {customFieldValidate.listMethod && <small className="p-invalid">{customFieldValidate.listMethod}</small>}
                </div>
            )}

            {(customField.listMethod && customField.listMethod.code == 'METHOD_CONFIG') && (
                <div className="p-field">
                    <span className="p-float-label">
                        <Dropdown
                            value={customField.configId}
                            options={customfieldConfigList}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => applyChange('configId', e.value)}
                            className={classNames({ "dense": true, 'p-invalid': customFieldValidate.configId })}
                            filter
                        />
                        {customFieldValidate.configId && <small className="p-invalid">{customFieldValidate.configId}</small>}
                    </span>
                </div>
            )}
            
            {(customField.listMethod && customField.listMethod.code == 'METHOD_ARRAY') &&
                <>
                    {(!customField.listItems || customField.listItems.length === 0) &&
                        <EmptyDataCompact message={t("workflow.custom-field.empty-value-list")}>
                            <Button
                                className="p-button-success p-button-tiny ml-2 width-fit-content"
                                label={t("workflow.custom-field.add-value-list")}
                                icon="bx bx-plus"
                                onClick={addValueList}
                            ></Button>
                        </EmptyDataCompact>
                    }

                    {customField.listItems && customField.listItems.length > 0 &&
                        <>
                            <div className="flex align-items-center">
                                <i className='bx bx-menu text-transparent'></i>
                                <i className='bx bx-plus text-transparent'></i>
                                <i className='bx bx-x text-transparent'></i>
                                <div className="w-full bold-and-color ml-1">{t("workflow.custom-field.value-list-value")}</div>
                                <div className="w-full bold-and-color ml-1">{t("workflow.custom-field.value-list-key")}</div>
                            </div>
                            <ReactSortable
                                animation="500"
                                list={customField.listItems}
                                setList={() => { }}
                                onEnd={(evt, sortable, store) => {
                                    afterSortEvents(evt, sortable, store);
                                }}
                                className="w-full">
                                {customField.listItems.map((listItem, index) => (
                                    <div key={index} className="flex align-items-center mb-1">
                                        <i className='bx bx-menu text-grey-7 pointer' title={t("common.point-and-order")}></i>
                                        <i className='bx bx-plus text-green-9 pointer' onClick={() => addValueList(index)}></i>
                                        <i className='bx bx-x text-red-9 pointer' onClick={() => removeValueList(index)}></i>
                                        <InputText
                                            className="dense ml-1"
                                            value={listItem.value}
                                            onChange={(e) => setValueList(index, "value", e.target.value)} />
                                        <InputText
                                            className="dense ml-1"
                                            value={listItem.key}
                                            onChange={(e) => setValueList(index, "key", e.target.value)} />
                                    </div>

                                ))}
                            </ReactSortable>
                        </>
                    }
                </>
            }
        </>)
    }

    if (dialog === false) {
        return renderForm();
    } else {
        return (
            <Dialog
                header={mode === Enumeration.crud.create ? t('custom-field.create') : t('custom-field.update')}
                visible={show}
                modal
                className="p-fluid fluid  wd-800-600"
                contentClassName="overflow-auto"
                footer={
                    <>
                        <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={hideDetail} />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} />
                    </>
                }
                onHide={hideDetail}
            >
                {renderForm()}
            </Dialog>

        )
    }
}

FieldDetail = forwardRef(FieldDetail);

export default FieldDetail;



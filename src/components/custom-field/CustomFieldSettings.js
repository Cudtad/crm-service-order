import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import CommonFunction from '@lib/common';
import { ListBox } from 'primereact/listbox';
import classNames from 'classnames';
import { ReactSortable } from "react-sortablejs";
import { Menu } from 'primereact/menu';
import CustomFieldSettingsDetail from './CustomFieldSettingsDetail';
import Enumeration from '@lib/enum';
import _ from 'lodash';
import { Tooltip } from 'primereact/tooltip';
// import "features/task/scss/TaskBaseList.scss";
import "./scss/CustomFieldSettings.scss";
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import FieldEntityApi from 'services/config/FieldEntityApi';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
// import "features/task/scss/TaskBaseList.scss";
import { TabPanel, TabView } from 'primereact/tabview';
import FieldDictionary from 'components/field-dictionary/FieldDicionary';

/**
 * props
 *      application: "" // application name
 *      entity: "" // entity name
 *      entityTypes: [{code:"", name: "", icon:"", id: null}, {code:"", name: "", icon: "", id: null}] // array of entity types, if id is not null, use id for get custom fields
 *      dialog: false // show in dialog or not, default false
 *      dialogHeader: "" // dialog's header
 *      entityTypesListWidth: 350 // entity types's list width - default 350
 *      customFieldsListWidth: 350 // custom fields's list width - default 350
 *      afterSubmit: () => {} function after submit
 *      allowConfigLayout: true // allow config layout, default true
 *      allowAddField: true // allow add field, default true
 *      isAdmin: false // only use on company id = 0 and config real field
 *      forceDisable: [] // regex array, if customfield code match regex, custom field will not be delete or change properties
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function CustomFieldSettings(props, ref) {

    const {
        application, entity, entityTypes, dialog, dialogHeader, customFieldListWidth, entityId, afterSubmit, checkPermission,
        allowConfigLayout, allowAddField, isAdmin, forceDisable } = props;
    const [selectedEntityType, setSelectedEntityType] = useState(entityTypes && entityTypes.length > 0 ? entityTypes[0] : null);
    const [loadingFields, setLoadingFields] = useState(false);
    const [loadingGrantedFields, setLoadingGrantedFields] = useState(false);
    const refFieldDictionary = useRef();

    const [selectedActivityCustomField, setSelectedActivityCustomField] = useState({ index: -1, layout: "1" });

    const t = CommonFunction.t;
    const [customFields, setCustomFields] = useState([]);
    const [grantedFields, setGrantedFields] = useState([]);
    const [show, setShow] = useState(false);
    const layoutMenu = useRef(null);
    const refCustomFieldDetai = useRef(null);
    const [showDictionary, setShowDictionary] = useState(false);
    const refConfig = useRef({
        application: application,
        entity: entity,
        entityId: entityId,
        entityTypes: entityTypes,
        customize: null
    })
    const refForceDisableFields = useRef({});

    useEffect(() => {
        if (!dialog) {
            loadFieldsByEntity();
            loadFieldsByEntityType(refConfig.current && refConfig.current.entityTypes && refConfig.current.entityTypes.length > 0 ? refConfig.current.entityTypes[0] : null);
        }
    }, [])

    useImperativeHandle(ref, () => ({
        init: (_application, _entity, _entityId, _entityTypes, _customize) => {
            refConfig.current = {
                application: _application,
                entity: _entity,
                entityId: _entityId,
                entityTypes: _entityTypes || entityTypes,
                customize: _customize !== undefined && _customize !== null ? _customize : null
            }
            loadFieldsByEntity();
            let _selectedEntity = refConfig.current && refConfig.current.entityTypes && refConfig.current.entityTypes.length > 0 ? refConfig.current.entityTypes[0] : null;
            loadFieldsByEntityType(_selectedEntity);
            setSelectedEntityType(_selectedEntity);
            if (dialog) {
                setTimeout(() => {
                    setShow(true);
                }, 200);
            }
        },
    }));

    /**
     * load Fields by entity
     * @param {*} entityName
     */
    const loadFieldsByEntity = () => {
        setLoadingFields(true);
        FieldEntityApi.getByEntity(refConfig.current.application, refConfig.current.entity, refConfig.current.entityId).then(res => {
            if (res) {

                // check disable 
                let _forceDisableFields = {};
                if (forceDisable && forceDisable.length > 0) {
                    try {
                        res.forEach(el => {
                            for (let i = 0; i < forceDisable.length; i++) {
                                if (el.code.match(forceDisable[i])) _forceDisableFields[el.code] = 1;
                            }
                        })
                    } catch (error) {
                        console.error("CustomFieldSettings loadFieldsByEntity forcedisable", error);
                    }
                }
                refForceDisableFields.current = _forceDisableFields;

                setCustomFields(_.sortBy(res, ['name']));
                setLoadingFields(false);
            }
        })
    };

    /**
     * load fields by entity type
     * @param {*} type
     */
    const loadFieldsByEntityType = (type) => {
        setLoadingGrantedFields(true);
        let code = type && type.code ? `.${type.code}` : "";
        FieldEntityApi.getByEntityType(refConfig.current.application, `${refConfig.current.entity}${code}`, type && type.id ? type.id : refConfig.current.entityId).then(res => {
            setGrantedFields(res);
            setLoadingGrantedFields(false);
        })
    }

    /**
     * cancel submit
     */
    const cancel = () => {
        setShow(false)
    }

    /**
     * submit
     */
    const submit = () => {
        if (checkPermission && typeof checkPermission === "function") {
            let valid = checkPermission('update')
            if (!valid) {
                CommonFunction.toastError(t("common.you-do-not-have-permission"));
                return;
            }
        }
        let _grantedFields = [...grantedFields];

        // set order index
        _grantedFields.forEach((el, idx) => {
            el.orderIndex = idx;
        });

        let _entityId = 0;
        if (selectedEntityType && selectedEntityType.id) {
            _entityId = selectedEntityType.id;
        } else if (refConfig.current && refConfig.current.entityId) {
            _entityId = refConfig.current.entityId;
        } else if (entityId) {
            _entityId = entityId;
        }

        FieldEntityApi.grant({
            application: refConfig.current.application || application,
            entityId: _entityId,
            entity: (refConfig.current.entity || entity) + (selectedEntityType ? `.${selectedEntityType.code}` : ""),
            grantFields: _grantedFields
        }).then(res => {
            if (res) {
                if (afterSubmit && typeof afterSubmit === "function") {
                    afterSubmit(res);
                }
                CommonFunction.toastSuccess(t("common.save-success"));
            }
        })
    }

    /**
     * add custom field to list
     */
    const addCustomField = (option) => {
        let _dup = grantedFields.find(o => o.fieldId === option.id)
        if (_dup) {
            CommonFunction.toastWarning(t("workflow.duplicate-custom-field"))
        } else {
            let _activityCustomFields = [...grantedFields, {
                fieldId: option.id,
                fieldName: option.name,
                fieldCode: option.code,
                fieldType: option.type,
                localeName: option.localeName,
                require: false,
                readOnly: false,
                layout: "1",
                orderIndex: grantedFields.length + 1
            }];
            setGrantedFields(_activityCustomFields);
        }
    }

    /**
     * edit custom field
     * @param {*} option
     */
    const updateCustomField = (option) => {
        refCustomFieldDetai.current.update(option.id);
    }

    /**
     * delete custom field
     * @param {*} option
     */
    const deleteCustomField = (option) => {
        let msg = t("workflow.delete-customfield").format(option.name);
        CommonFunction.showConfirm(msg, t('common.delete'), () => {
            FieldEntityApi.delete(option.id).then(res => {
                if (res) {

                    // remove in list
                    let index = -1;
                    for (let i = 0; i < customFields.length; i++) {
                        if (customFields[i].id === option.id) {
                            index = i;
                            break;
                        }
                        ;
                    }
                    let _customFields = [
                        ...customFields.slice(0, index),
                        ...customFields.slice(index + 1)
                    ];
                    setCustomFields(_customFields);

                    // remove in form
                    let formFoundIndex = -1;
                    for (let i = 0; i < grantedFields.length; i++) {
                        if (grantedFields[i].fieldId === option.id) {
                            formFoundIndex = i;
                            break;
                        }
                        ;
                    }
                    if (formFoundIndex > -1) {
                        let _activityCustomFields = [
                            ...grantedFields.slice(0, formFoundIndex),
                            ...grantedFields.slice(formFoundIndex + 1)
                        ];
                        setGrantedFields(_activityCustomFields);
                    }

                    CommonFunction.toastSuccess(t("common.deleted"));
                }
            });
        })
    }

    /**
     * add custom field to list
     */
    const removeCustomField = (index) => {
        let _activityCustomFields = [
            ...grantedFields.slice(0, index),
            ...grantedFields.slice(index + 1)
        ];
        setGrantedFields(_activityCustomFields);
    }

    /**
     * change field settings
     */
    const changeFieldSetting = (prop, index, val) => {
        let _activityCustomFields = [...grantedFields];
        switch (prop) {
            case "require":
            case "readOnly":
                _activityCustomFields[index][prop] = !_activityCustomFields[index][prop];
                break;
            default:
                _activityCustomFields[index][prop] = val;
                break;
        }
        setGrantedFields(_activityCustomFields);
    }

    /**
     * add custom field
     */
    const createCustomField = () => {
        refCustomFieldDetai.current.create({
            application: refConfig.current.application || application,
            entity: refConfig.current.entity || entity,
            entityId: refConfig.current.entityId || entityId
        });
    }

    /**
     * after submit workflow custom field
     * @param {*} _mode
     * @param {*} _customField
     */
    const afterSubmitCustomField = (_mode, _customField) => {
        var _customFields = [...customFields];
        switch (_mode) {
            case Enumeration.crud.create:

                // add custom field to list
                _customFields.push(_customField);

                // add custom field to form
                addCustomField(_customField);

                // state
                setCustomFields(_customFields);

                break;
            case Enumeration.crud.update:
                // update custom field in list
                for (let i = 0; i < _customFields.length; i++) {
                    const el = _customFields[i];
                    if (el.id === _customField.id) {
                        _customFields[i] = { ..._customField };
                        break;
                    }
                }

                // update custom field in form
                let _grantedFields = [...grantedFields];
                for (let i = 0; i < _grantedFields.length; i++) {
                    const el = _grantedFields[i];
                    if (el.fieldId === _customField.id) {
                        _grantedFields[i] = {
                            ...el,
                            fieldName: _customField.name,
                            fieldCode: _customField.code,
                            fieldType: _customField.type,
                            localeName: _customFields.localeName
                        };
                        break;
                    }
                }

                // state
                setCustomFields(_customFields);
                setGrantedFields(_grantedFields);

                break;
            default:
                break;
        }
    }

    /**
     *
     * @param {*} dictionaries
     */
    const afterSubmitDictionary = (changed) => {
        let _fields = _.cloneDeep(customFields);
        let _grantedFields = _.cloneDeep(grantedFields);

        // update locale name
        changed.forEach(change => {
            for (let i = 0; i < _fields.length; i++) {
                if (_fields[i].id === change.id) {
                    _fields[i].localeName = change.localeName;
                    break;
                }
            }

            for (let i = 0; i < _grantedFields.length; i++) {
                if (_grantedFields[i].fieldId === change.id) {
                    _grantedFields[i].localeName = change.localeName;
                    break;
                }
            }


        })

        setCustomFields(_fields);
        setGrantedFields(_grantedFields);
    }

    /**
     * change selected cativity custom field
     * @param {*} event
     * @param {*} index
     */
    const changeSelectedActivityCustomField = (event, index) => {

        setSelectedActivityCustomField({
            index: index,
            layout: grantedFields[index].layout
        });

        layoutMenu.current.toggle(event);
    }

    /**
     * change entity type
     */
    const changeEntityType = (type) => {
        setSelectedEntityType(type);
        loadFieldsByEntityType(type);
    }

    /**
     * localize
     */
    const localize = () => {
        setShowDictionary(true);
        CommonFunction.waitFor(() => refFieldDictionary.current).then(() => {
            
            refFieldDictionary.current.init(refConfig.current.application, refConfig.current.entity, refConfig.current.entityId, refConfig.current.customize);
        })
    }

    const renderForm = () => {
        return (<>

            <XLayout className="custom-field-settings">

                {/* custom fields */}
                <XLayout_Left style={{ width: customFieldListWidth || "350px", borderColor: "var(--material-grey-5)" }} className="pr-2 position-relative">
                    <LoadingBar loading={loadingFields} />
                    <XLayout>
                        <XLayout_Top className="mb-2">
                            <XToolbar left={() => (<>
                                {allowAddField !== false &&
                                    <Button
                                        icon="bx bx-rename create"
                                        label={t("custom-field.create")}
                                        onClick={createCustomField}
                                    ></Button>
                                }
                                <Button
                                    icon="bx bx-globe"
                                    label={t("custom-field.localize")}
                                    onClick={localize}
                                ></Button>
                            </>)}
                            ></XToolbar>

                        </XLayout_Top>

                        <XLayout_Center className="entity-field-list">
                            {customFields.length === 0 &&
                                <XLayout_Box className="flex flex-column h-full align-items-center justify-content-center">
                                    <i className="bx bx-info-circle fs-40 text-grey-5"></i>
                                    <span className="mb-3 mt-1 fs-18 text-grey-7">{t("custom-field.empty")}.</span>
                                    <Button
                                        icon="bx bx-rename"
                                        label={t("custom-field.create")}
                                        onClick={createCustomField}
                                    ></Button>
                                </XLayout_Box>
                            }

                            {customFields.length > 0 &&
                                <XLayout_Box className="h-full p-0">
                                    <ListBox
                                        options={customFields}
                                        optionLabel="name"
                                        filterBy="name"
                                        
                                        filter
                                        className="border-none overflow-auto h-full"
                                        itemTemplate={(option) => (
                                            <React.Fragment>
                                                <div className="entity-field-list-item">
                                                    <div className="item-icon">
                                                        {option.type === "BOOLEAN" && <i className="far fa-check-square"></i>}
                                                        {option.type === "LIST_SINGLE" && <i className="fas fa-list-ul"></i>}
                                                        {option.type === "LIST_MULTI" && <i className="far fa-tasks"></i>}
                                                        {option.type === "DATE" && <i className="far fa-calendar"></i>}
                                                        {option.type === "DATE_TIME" && <i className="far fa-clock"></i>}
                                                        {option.type === "STRING" && <i className="fas fa-font"></i>}
                                                        {option.type === "LONG" && <div className="custom-field-type-number">123</div>}
                                                        {option.type === "DOUBLE" && <div className="custom-field-type-number">0.5</div>}
                                                    </div>

                                                    <div className="item-info">
                                                        <div >
                                                            {CommonFunction.isEmpty(option.localeName)
                                                                ? <span className="bold">{option.name}</span>
                                                                : <>
                                                                    <span className="bold">{option.localeName}</span>
                                                                    <i className="text-grey ml-1">({option.name})</i>
                                                                </>
                                                            }

                                                        </div>
                                                        <i><small>
                                                            {option.type === "BOOLEAN" && t("datatype.boolean")}
                                                            {option.type === "LIST_SINGLE" && t("datatype.list-single")}
                                                            {option.type === "LIST_MULTI" && t("datatype.list-multi")}
                                                            {option.type === "DATE" && t("datatype.date")}
                                                            {option.type === "DATE_TIME" && t("datatype.datetime")}
                                                            {option.type === "STRING" && t("datatype.string")}
                                                            {option.type === "LONG" && t("datatype.long")}
                                                            {option.type === "DOUBLE" && t("datatype.double")}
                                                            {option.description &&
                                                                <span>&nbsp;- {option.description}</span>
                                                            }
                                                        </small></i>

                                                    </div>

                                                    <div className="item-action">
                                                        {allowConfigLayout !== false &&
                                                            <Button
                                                                icon='bx bx-list-plus text-green'
                                                                className="p-button-rounded p-button-text"
                                                                tooltip={t('custom-field.grant')}
                                                                tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                                onClick={() => addCustomField(option)}
                                                            />
                                                        }

                                                        <Button
                                                            icon='bx bx-pencil text-grey'
                                                            className="p-button-rounded p-button-text"
                                                            tooltip={t('common.update')}
                                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                            onClick={() => updateCustomField(option)}
                                                            disabled={isAdmin ? false : (!option.customize || option.notAllowConfig)}
                                                        />

                                                        <Button
                                                            icon='bx bx-trash-alt text-grey'
                                                            className="p-button-rounded p-button-text"
                                                            tooltip={t('common.delete')}
                                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                            onClick={() => deleteCustomField(option)}
                                                            disabled={!option.customize || option.notAllowConfig}
                                                        />
                                                    </div>

                                                </div>
                                            </React.Fragment>
                                        )}
                                    ></ListBox>
                                </XLayout_Box>
                            }
                        </XLayout_Center>
                    </XLayout>

                </XLayout_Left>

                {/* layout */}
                {allowConfigLayout !== false &&
                    <XLayout_Center className="position-relative">

                        <LoadingBar loading={loadingGrantedFields} />

                        <XLayout>
                            {entityTypes && entityTypes.length > 0 &&
                                <XLayout_Top className="position-relative">

                                    <TabView className="tab-menu">
                                        {entityTypes.map((type, index) => (
                                            // <TabPanel key={index} header={t(type.name)} leftIcon={type.icon} onClick={(e) => changeEntityType(type)} />
                                            <TabPanel key={index} header={(
                                                <div className="custom-field-tab-item" onClick={() => changeEntityType(type)}>
                                                    <span>{t(type.name)}</span>
                                                </div>
                                            )} />
                                        ))}
                                    </TabView>

                                </XLayout_Top>
                            }

                            <XLayout_Center className="tab-menu-container">

                                {grantedFields && <>
                                    <XLayout>

                                        <XLayout_Top className="mb-2">
                                            <XToolbar left={() => (<>
                                                <Button icon="bx bxs-save" label={t('common.save')} onClick={submit}></Button>
                                            </>)}></XToolbar>
                                        </XLayout_Top>

                                        {(grantedFields.length === 0) &&
                                            <XLayout_Center>
                                                <XLayout_Box className="flex flex-column h-full align-items-center justify-content-center">
                                                    <span className="mt-2 big text-grey-7">{t("custom-field.empty-grant")}</span>
                                                </XLayout_Box>
                                            </XLayout_Center>
                                        }

                                        {grantedFields.length > 0 && <>
                                            <XLayout_Center>
                                                <ReactSortable
                                                    animation="500"
                                                    list={grantedFields}
                                                    setList={setGrantedFields}
                                                    className="granted-fields-orderable">
                                                    {grantedFields.map((field, index) => (
                                                        <div
                                                            key={index}
                                                            className={classNames({
                                                                "granted-fields-item": true,
                                                                "flex-100": field.layout === "1",
                                                                "flex-50": field.layout === "1/2",
                                                                "flex-33": field.layout === "1/3",
                                                                "flex-25": field.layout === "1/4"
                                                            })}
                                                        >
                                                            <div className="granted-fields-item-inner">
                                                                <div className="custom-field-name flex align-items-center">
                                                                    {field.fieldType === "BOOLEAN" && <i className="far fa-check-square" title={t("datatype.boolean")}></i>}
                                                                    {field.fieldType === "LIST_SINGLE" && <i className="fas fa-list-ul" title={t("datatype.list-single")}></i>}
                                                                    {field.fieldType === "LIST_MULTI" && <i className="far fa-tasks" title={t("datatype.list-multi")}></i>}
                                                                    {field.fieldType === "DATE" && <i className="far fa-calendar" title={t("datatype.date")}></i>}
                                                                    {field.fieldType === "DATE_TIME" && <i className="far fa-clock" title={t("datatype.datetime")}></i>}
                                                                    {field.fieldType === "STRING" && <i className="fas fa-font" title={t("datatype.string")}></i>}
                                                                    {field.fieldType === "LONG" && <div className="custom-field-type-number" title={t("datatype.long")}>123</div>}
                                                                    {field.fieldType === "DOUBLE" && <div className="custom-field-type-number" title={t("datatype.double")}>0.5</div>}
                                                                    <div className="field-name w-full bold ml-2" title={field.localeName || field.fieldName}>
                                                                        {field.localeName || field.fieldName}
                                                                    </div>
                                                                    <Tooltip target=".delete-custom-field" content={t('common.delete')} position="bottom" />
                                                                    <div
                                                                        className={classNames({
                                                                            "delete-custom-field": true,
                                                                            "p-disabled": refForceDisableFields.current[field.fieldCode]
                                                                        })}
                                                                        onClick={() => {
                                                                            if (!refForceDisableFields.current[field.fieldCode])
                                                                                removeCustomField(index)
                                                                        }}
                                                                    >

                                                                        <i className=" bx bx-trash-alt"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="custom-field-config border-top mt-1 pt-1">
                                                                    <Tooltip target=".config-field-config-item-require" content={t("workflow.custom-field.require.description")} position="bottom" />
                                                                    <div
                                                                        className={classNames({
                                                                            "config-field-config-item config-field-config-item-require": true,
                                                                            "p-disabled": refForceDisableFields.current[field.fieldCode]
                                                                        })}
                                                                        onClick={() => {
                                                                            if (!refForceDisableFields.current[field.fieldCode])
                                                                                changeFieldSetting("require", index)
                                                                        }}
                                                                    >
                                                                        <i className={classNames({ "fab fa-diaspora": true, "enable": field.require })}></i>
                                                                        {(field.layout === "1" || field.layout === "1/2") &&
                                                                            <div className="config-field-config-item-text">{t("workflow.custom-field.require")}</div>
                                                                        }
                                                                    </div>

                                                                    <Tooltip target=".config-field-config-item-readOnly" content={t("workflow.custom-field.readOnly.description")} position="bottom" />
                                                                    <div
                                                                        className={classNames({
                                                                            "config-field-config-item config-field-config-item-readOnly": true,
                                                                            "p-disabled": refForceDisableFields.current[field.fieldCode]
                                                                        })}
                                                                        onClick={() => {
                                                                            if (!refForceDisableFields.current[field.fieldCode])
                                                                                changeFieldSetting("readOnly", index)
                                                                        }}
                                                                    >
                                                                        <i className={classNames({ "far fa-eye": true, "enable": field.readOnly })}></i>
                                                                        {(field.layout === "1" || field.layout === "1/2") &&
                                                                            <div className="config-field-config-item-text">
                                                                                {t("workflow.custom-field.readOnly")}
                                                                            </div>
                                                                        }
                                                                    </div>

                                                                    <Tooltip target=".config-field-config-item-layout" content={t("workflow.custom-field.layout.description")} position="bottom" />

                                                                    <div
                                                                        className="config-field-config-item config-field-config-item-layout"
                                                                        onClick={(event) => changeSelectedActivityCustomField(event, index)}
                                                                    >
                                                                        <i className="far fa-columns"></i>
                                                                        <div className="config-field-config-item-text">
                                                                            {field.layout} {(field.layout === "1" || field.layout === "1/2") && t("workflow.custom-field.width")}
                                                                        </div>
                                                                    </div>
                                                                    <Menu
                                                                        id="more-buttons"
                                                                        ref={layoutMenu}
                                                                        popup
                                                                        model={[
                                                                            {
                                                                                label: t("workflow.custom-field.width.1"),
                                                                                icon: `bx icon-biggest ${selectedActivityCustomField.layout === "1" ? "bx-radio-circle-marked text-main-color" : "bx bx-radio-circle"}`,
                                                                                command: () => {
                                                                                    changeFieldSetting("layout", selectedActivityCustomField.index, "1")
                                                                                }
                                                                            }, {
                                                                                label: t("workflow.custom-field.width.1/2"),
                                                                                icon: `bx icon-biggest ${selectedActivityCustomField.layout === "1/2" ? "bx-radio-circle-marked text-main-color" : "bx bx-radio-circle"}`,
                                                                                command: () => {
                                                                                    changeFieldSetting("layout", selectedActivityCustomField.index, "1/2")
                                                                                }
                                                                            },
                                                                            {
                                                                                label: t("workflow.custom-field.width.1/3"),
                                                                                icon: `bx icon-biggest ${selectedActivityCustomField.layout === "1/3" ? "bx-radio-circle-marked text-main-color" : "bx bx-radio-circle"}`,
                                                                                command: () => {
                                                                                    changeFieldSetting("layout", selectedActivityCustomField.index, "1/3")
                                                                                }
                                                                            },
                                                                            {
                                                                                label: t("workflow.custom-field.width.1/4"),
                                                                                icon: `bx icon-biggest ${selectedActivityCustomField.layout === "1/4" ? "bx-radio-circle-marked text-main-color" : "bx bx-radio-circle"}`,
                                                                                command: () => {
                                                                                    changeFieldSetting("layout", selectedActivityCustomField.index, "1/4")
                                                                                }
                                                                            }
                                                                        ]} />
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </ReactSortable>
                                            </XLayout_Center>
                                        </>}
                                    </XLayout>
                                </>}
                            </XLayout_Center>
                        </XLayout>

                    </XLayout_Center>
                }

                {allowConfigLayout === false &&
                    <XLayout_Center>
                        <XLayout_Box className="h-full flex flex-column align-items-center justify-content-center">
                            <i className='bx bx-message-alt-x fs-30 text-grey mb-2' ></i>
                            <span className='text-grey'>Not allow config layout</span>
                        </XLayout_Box>
                    </XLayout_Center>
                }
            </XLayout>
        </>)
    }

    return (
        <>
            {dialog &&
                <Dialog
                    header={dialogHeader}
                    visible={show}
                    className="wd-16-9"
                    onHide={cancel}
                    maximizable
                >
                    <XLayout>
                        <XLayout_Center className="pb-2">
                            {renderForm()}
                        </XLayout_Center>
                    </XLayout>
                </Dialog>
            }
            {!dialog && renderForm()}

            <CustomFieldSettingsDetail checkPermission={checkPermission} ref={refCustomFieldDetai} customFields={customFields} entityId={refConfig.current.entityId} after-submit={afterSubmitCustomField} />

            <Dialog
                visible={showDictionary}
                header={t("custom-field.localize")}
                modal
                className="wd-16-9"
                onHide={() => { setShowDictionary(false) }}
                contentClassName="pt-0"
            >
                <FieldDictionary ref={refFieldDictionary} application={application} entity={entity} afterSubmit={afterSubmitDictionary}></FieldDictionary>
            </Dialog>
        </>
    )
}

CustomFieldSettings = forwardRef(CustomFieldSettings);

export default CustomFieldSettings;

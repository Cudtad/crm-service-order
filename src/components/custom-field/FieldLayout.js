import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import WorkflowApi from 'services/WorkflowApi';

import {Button} from 'primereact/button';
import "./scss/FieldLayout.scss"
import {InputText} from 'primereact/inputtext';
import CommonFunction from '@lib/common';
import {ListBox} from 'primereact/listbox';
import {ReactSortable} from "react-sortablejs";
import {Menu} from 'primereact/menu';
import EmptyData from "@ngdox/ui-lib/dist/components/empty-data/EmptyData";
import Enumeration from '@lib/enum';
import _ from 'lodash';
import {Tooltip} from 'primereact/tooltip';
import FieldDetail from "./FieldDetail";
import classNames from 'classnames';

function FieldLayout(props, ref) {

    const emptyFilter = { keyword: null };
    const [selectedActivityCustomField, setSelectedActivityCustomField] = useState({ index: -1, layout: "1" });

    const t = CommonFunction.t;
    const { entity, entityId, checkPermission } = props;
    const [activity, setActivity] = useState(null);
    const [allActivities, setAllActivities] = useState([]);
    const [canCopyFromOtherActivities, setCanCopyFromOtherActivities] = useState(false);
    const [customFields, setCustomFields] = useState([]);
    const [rawFields, setRawFields] = useState([]);
    const [allFields, setAllFields] = useState([]);
    const [selectedCustomFields, setSelectedCustomFields] = useState(null);
    const [filterCondition, setFilterCondition] = useState(emptyFilter);
    const [cloneActivityButtonMenu, setCloneActivityButtonMenu] = useState([]);
    const [cloneButtonItems, setCloneButtonItems] = useState([]);
    const [show, setShow] = useState(false);
    const layoutMenu = useRef(null);
    const refCustomFieldDetai = useRef(null);

    const [type, setType] = useState(null);
    const [id, setId] = useState(null)

    useImperativeHandle(ref, () => ({
        init: (_type, _id) => {
            // setActivity(act);
            setAllActivities(allActivities);

            // load list field of data
            loadFieldList(_type, _id);
            setType(_type);
            setId(_id);
            // load layout
            getFieldLayout(_type, _id);

            setShow(true);
        }
    }));

    useEffect(() => {
        if (entity && entityId) {
            loadFieldList(entity, entityId);
            getFieldLayout(entity, entityId);
            setType(entity);
            setId(entityId);
        }
    }, [])
    /**
     * load workflow custom fields
     */
    const loadFieldList = (_type, _id) => {
        WorkflowApi.getFields(_type, _id).then(res => {
            setCustomFields(res);
        });
    }

    /**
     * get workflow custom field
     * @param {*} activityId
     * @param {*} workflowId
     */
    const getFieldLayout = (_type, _id) => {


        setAllFields([]);
        setRawFields([]);

        WorkflowApi.getFieldLayout(_type, _id).then(res => {
            let data = _.sortBy(res, [function (o) {
                return o.orderIndex;
            }]);
            setAllFields(_.cloneDeep(data));
            setRawFields(_.cloneDeep(data));
        });
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
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        let _allFields = [...allFields];

        // set order index
        _allFields.forEach((el, idx) => {
            el.orderIndex = idx;
        });

        // submit
        let _payload = {
            type: type,
            id: id,
            selectedFields: []
        }

        let diff = CommonFunction.compareArrays(rawFields, _allFields, "id");

        diff.create.forEach(el => {
            el.action = "ADD";
            _payload.selectedFields.push(el);
        });

        diff.update.forEach(el => {
            el.action = "UPDATE";
            _payload.selectedFields.push(el);
        });

        diff.delete.forEach(el => {
            el.action = "DELETE";
            _payload.selectedFields.push(el);
        });

        // console.log(_payload);

        if (_payload.selectedFields.length > 0) {
            WorkflowApi.grantLayout(_payload).then(res => {
                CommonFunction.toastSuccess(t("common.save-success"));
                // props["reload-workflow-custom-fields"]();
                setShow(false);
            });
        } else {
            setShow(false);
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
     * add custom field to list
     */
    const addCustomField = (option) => {
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        let _dup = allFields.find(o => o.fieldId === option.id)
        if (_dup) {
            CommonFunction.toastWarning(t("workflow.duplicate-custom-field"))
        } else {
            let _allFields = [...allFields, {
                fieldId: option.id,
                fieldName: option.name,
                fieldCode: option.code,
                fieldType: option.type,
                require: false,
                readOnly: false,
                layout: "1",
                orderIndex: allFields.length + 1
            }];
            setAllFields(_allFields);
        }
    }

    /**
     * edit custom field
     * @param {*} option
     */
    const editCustomField = (option) => {
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        refCustomFieldDetai.current.init(Enumeration.crud.update, type, id, option);
    }

    /**
     * delete custom field
     * @param {*} option
     */
    const deleteCustomField = (option) => {
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        let msg = t("workflow.delete-customfield").format(option.name);
        CommonFunction.showConfirm(msg, t('common.delete'), () => {
            WorkflowApi.deleteField(option.id).then(res => {
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
                    for (let i = 0; i < allFields.length; i++) {
                        if (allFields[i].fieldId === option.id) {
                            formFoundIndex = i;
                            break;
                        }
                        ;
                    }
                    if (formFoundIndex > -1) {
                        let _allFields = [
                            ...allFields.slice(0, formFoundIndex),
                            ...allFields.slice(formFoundIndex + 1)
                        ];
                        setAllFields(_allFields);
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
        let _allFields = [
            ...allFields.slice(0, index),
            ...allFields.slice(index + 1)
        ];
        setAllFields(_allFields);
    }

    /**
     * change field settings
     */
    const changeFieldSetting = (prop, index, val) => {
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        let _allFields = [...allFields];
        switch (prop) {
            case "require":
            case "readOnly":
                _allFields[index][prop] = !_allFields[index][prop];
                break;
            default:
                _allFields[index][prop] = val;
                break;
        }
        setAllFields(_allFields);
    }

    /**
     * add custom field
     */
    const addWorkflowCustomField = () => {
        if(checkPermission){
            if(!checkPermission()){
                return;
            }
        }
        refCustomFieldDetai.current.init(Enumeration.crud.create, type, id);
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
                let _allFields = [...allFields];
                for (let i = 0; i < _allFields.length; i++) {
                    const el = _allFields[i];
                    if (el.fieldId === _customField.id) {
                        _allFields[i] = {
                            ...el,
                            fieldName: _customField.name,
                            fieldCode: _customField.code,
                            fieldType: _customField.type
                        };
                        break;
                    }
                }

                // state
                setCustomFields(_customFields);
                setAllFields(_allFields);

                break;
            default:
                break;
        }
    }

    /**
     * change selected cativity custom field
     * @param {*} event
     * @param {*} index
     */
    const changeSelectedActivityCustomField = (event, index) => {

        setSelectedActivityCustomField({
            index: index,
            layout: allFields[index].layout
        });

        layoutMenu.current.toggle(event);
    }

    return (
        <React.Fragment>
            {/*<Dialog*/}
            {/*    header={activity ? (activity.activityId === 0 ? t("workflow.custom-field.init-activity") : (activity.name ? activity.name : "...")) : "..."}*/}
            {/*    visible={show}*/}
            {/*    className="wd-1024-768"*/}
            {/*    onHide={cancel}*/}
            {/*    footer={*/}
            {/* */}
            {/*    }*/}
            {/*>*/}
            <div className="p-2 flex w-full h-full">
                <div className="activity-custom-field-left-panel flex flex-column mr-2">
                    <span className="p-input-icon-left w-full mb-2">
                        <Button
                            label={t("workflow.add-customfield")}
                            icon="bx bx-plus" className="p-button-success mb-2"
                            style={{ width: 'fit-content' }}
                            onClick={addWorkflowCustomField}
                        />
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-button-success ml-4 mb-2"
                            style={{ width: 'fit-content', textAlign: 'right' }}
                            onClick={submit} />
                    </span>

                    <span className="p-input-icon-left w-full mb-2">
                        <i className="bx bx-search-alt " />
                        <InputText
                            className="w-full"
                            placeholder={t("common.search")}
                            onInput={(e) => CommonFunction.debounce(null, onFilterChange, { key: "keyword", val: e.target.value })} />
                    </span>
                    {
                        customFields.length === 0 &&
                        <EmptyData className="border-all" size={50} message={t("workflow.empty-customfield")}>
                            <Button
                                className="ml-2 p-button-success p-button-tiny"
                                label={t('common.create')}
                                icon="bx bx-plus"
                                style={{ width: 'fit-content' }}
                                onClick={addWorkflowCustomField}
                            />
                        </EmptyData>
                    }
                    {customFields.length > 0 &&
                        <ListBox
                            value={selectedCustomFields}
                            options={customFields.filter(f => (!filterCondition.keyword || f.name.indexOf(filterCondition.keyword) > -1))}
                            onChange={(e) => setSelectedCustomFields(e.value)}
                            optionLabel="name"
                            className="activity-custom-field-list overflow-auto h-full"
                            itemTemplate={(option) => (
                                <React.Fragment>
                                    <div className="activity-custom-field-actions">
                                        <Button
                                            icon='bx bx-plus'
                                            className="p-button-link"
                                            style={{ width: '40px', height: '40px' }}
                                            tooltip={t('common.create')}
                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                            onClick={() => addCustomField(option)}
                                        />

                                        <Button
                                            icon='bx bx-pencil'
                                            className="p-button-link"
                                            style={{ width: '40px', height: '40px' }}
                                            tooltip={t('common.update')}
                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                            onClick={() => editCustomField(option)}
                                        />

                                        <Button
                                            icon='bx bx-trash-alt'
                                            className="p-button-link"
                                            style={{ width: '40px', height: '40px' }}
                                            tooltip={t('common.delete')}
                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                            onClick={() => deleteCustomField(option)}
                                        />
                                    </div>
                                    <div className="activity-custom-field-list-item flex align-items-center">
                                        {option.type === "BOOLEAN" && <i className="far fa-check-square"></i>}
                                        {option.type === "LIST_SINGLE" && <i className="fas fa-list-ul"></i>}
                                        {option.type === "LIST_MULTI" && <i className="far fa-tasks"></i>}
                                        {option.type === "DATE" && <i className="far fa-calendar"></i>}
                                        {option.type === "DATE_TIME" && <i className="far fa-clock"></i>}
                                        {option.type === "STRING" && <i className="fas fa-font"></i>}
                                        {option.type === "LONG" && <div className="custom-field-type-number">123</div>}
                                        {option.type === "DOUBLE" && <div className="custom-field-type-number">0.5</div>}

                                        <div className="flex flex-column ml-2-5">
                                            <span className="bold">{option.name}</span>
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
                                    </div>
                                </React.Fragment>
                            )} />
                    }
                </div>
                <div className="flex w-full h-full border-all overflow-auto p-1">
                    <ReactSortable
                        animation="500"
                        list={allFields}
                        setList={setAllFields}
                        className="activity-custom-field-sortable w-full">
                        {allFields.map((field, index) => (
                            <div
                                key={index}
                                className={classNames({
                                    "activity-custom-field-item": true,
                                    "flex-100": field.layout === "1",
                                    "flex-50": field.layout === "1/2",
                                    "flex-33": field.layout === "1/3",
                                    "flex-25": field.layout === "1/4"
                                })}
                            >
                                <div className="custom-field-selected ">
                                    <div className="custom-field-name flex align-items-center">
                                        {field.fieldType === "BOOLEAN" && <i className="far fa-check-square" title={t("datatype.boolean")}></i>}
                                        {field.fieldType === "LIST_SINGLE" && <i className="fas fa-list-ul" title={t("datatype.list-single")}></i>}
                                        {field.fieldType === "LIST_MULTI" && <i className="far fa-tasks" title={t("datatype.list-multi")}></i>}
                                        {field.fieldType === "DATE" && <i className="far fa-calendar" title={t("datatype.date")}></i>}
                                        {field.fieldType === "DATE_TIME" && <i className="far fa-clock" title={t("datatype.datetime")}></i>}
                                        {field.fieldType === "STRING" && <i className="fas fa-font" title={t("datatype.string")}></i>}
                                        {field.fieldType === "LONG" && <div className="custom-field-type-number" title={t("datatype.long")}>123</div>}
                                        {field.fieldType === "DOUBLE" && <div className="custom-field-type-number" title={t("datatype.double")}>0.5</div>}
                                        <div className="field-name w-full bold ml-2" title={field.fieldName}>
                                            {field.fieldName}
                                        </div>
                                        {/*<Tooltip target=".delete-custom-field" content={t('common.delete')} position="bottom"/>*/}
                                        {/*<div className="delete-custom-field" onClick={() => removeCustomField(index)}>*/}
                                        {/*    <i className=" bx bx-trash-alt"></i>*/}
                                        {/*</div>*/}
                                    </div>
                                    <div className="custom-field-config border-top mt-1 pt-1">
                                        <Tooltip target=".config-field-config-item-require" content={t("workflow.custom-field.require.description")} position="bottom" />
                                        <div
                                            className="config-field-config-item config-field-config-item-require"
                                            onClick={() => changeFieldSetting("require", index)}
                                        >
                                            <i className={classNames({ "fab fa-diaspora": true, "enable": field.require })}></i>
                                            {(field.layout === "1" || field.layout === "1/2") &&
                                                <div className="config-field-config-item-text">{t("workflow.custom-field.require")}</div>
                                            }
                                        </div>

                                        <Tooltip target=".config-field-config-item-readOnly" content={t("workflow.custom-field.readOnly.description")} position="bottom" />
                                        <div
                                            className="config-field-config-item config-field-config-item-readOnly"
                                            onClick={() => changeFieldSetting("readOnly", index)}
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
                                                    icon: selectedActivityCustomField.layout === "1" ? "bx bx-radio-circle-marked" : "bx bx-radio-circle",
                                                    command: () => {
                                                        changeFieldSetting("layout", selectedActivityCustomField.index, "1")
                                                    }
                                                }, {
                                                    label: t("workflow.custom-field.width.1/2"),
                                                    icon: selectedActivityCustomField.layout === "1/2" ? "bx bx-radio-circle-marked" : "bx bx-radio-circle",
                                                    command: () => {
                                                        changeFieldSetting("layout", selectedActivityCustomField.index, "1/2")
                                                    }
                                                },
                                                {
                                                    label: t("workflow.custom-field.width.1/3"),
                                                    icon: selectedActivityCustomField.layout === "1/3" ? "bx bx-radio-circle-marked" : "bx bx-radio-circle",
                                                    command: () => {
                                                        changeFieldSetting("layout", selectedActivityCustomField.index, "1/3")
                                                    }
                                                },
                                                {
                                                    label: t("workflow.custom-field.width.1/4"),
                                                    icon: selectedActivityCustomField.layout === "1/4" ? "bx bx-radio-circle-marked" : "bx bx-radio-circle",
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
                </div>

            </div>


            {/*</Dialog>*/}

            <FieldDetail ref={refCustomFieldDetai} customFields={customFields} after-submit={afterSubmitCustomField} />
        </React.Fragment>
    )
}

FieldLayout = forwardRef(FieldLayout);

export default FieldLayout;

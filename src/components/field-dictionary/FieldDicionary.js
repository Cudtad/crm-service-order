import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommonFunction from '@lib/common';
import FieldEntityApi from 'services/config/FieldEntityApi';
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { InputText } from 'primereact/inputtext';
import _ from "lodash";
import "./scss/FieldDictionary.scss"
import Enumeration from '@lib/enum';

/**
 * props
 *      application: "",
 *      entity: ""
 *      afterSubmit: (changed) => {}
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function FieldDictionary(props, ref) {
    const t = CommonFunction.t;

    const { application, entity, entityId, afterSubmit } = props;
    const refConfig = useRef({
        application: application,
        entity: entity,
        entityId: entityId,
        customize: null
    })

    const locales = Enumeration.locales;

    const [locale, setLocale] = useState(CommonFunction.getCurrentLanguage());
    const [localeName, setLocaleName] = useState(locales.find(f => (f.id === CommonFunction.getCurrentLanguage())).name);

    const [fields, setFields] = useState([]);
    const refFieldsRaw = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (application && entity) {
            loadFields(CommonFunction.getCurrentLanguage());
        }
    }, []);

    useImperativeHandle(ref, () => ({
        init: (_application, _entity, _entityId, _customize) => {
            refConfig.current.application = _application;
            refConfig.current.entity = _entity;
            refConfig.current.entityId = _entityId;
            refConfig.current.customize = _customize;
            loadFields(CommonFunction.getCurrentLanguage());
        }
    }));

    /**
     * load fields - only custom fields
     * @param {*} _locale 
     */
    const loadFields = (_locale) => {
        setLoading(true);

        FieldEntityApi.getFieldDictionaries(
            refConfig.current.application,
            refConfig.current.entity,
            refConfig.current.entityId,
            _locale,
            refConfig.current.customize !== undefined && refConfig.current.customize !== null ? refConfig.current.customize : true
        ).then(res => {
            if (res) {
                let fieldsRaw = {};
                res = _.sortBy(res, ["name"]);

                res.forEach((el, index) => {
                    el.localeName = el.localeName || "";
                    el.localeCode = el.localeCode || "";

                    fieldsRaw[el.id] = {
                        localeName: el.localeName,
                        localeCode: el.localeCode
                    }
                    el.index = index;
                });

                refFieldsRaw.current = fieldsRaw;
                setFields(res);
                setLoading(false);
            }
        });
    }

    /**
     * submit
     */
    const submit = () => {
        // check change with raw
        let raw = refFieldsRaw.current, changed = [], errors = [];
        let fieldChange = true;
        fields.forEach(field => {
            fieldChange = true;

            // standardlize name
            field.localeName = field.localeName.trim();

            // valid: always has both code and name
            if (!CommonFunction.isEmpty(field.localeName) || !CommonFunction.isEmpty(field.localeCode)) {
                if (CommonFunction.isEmpty(field.localeName)) errors.push(t("field-dictionary.name-empty"));
                if (CommonFunction.isEmpty(field.localeCode)) errors.push(t("field-dictionary.code-empty"));
            }

            // check change
            if (raw[field.id] && raw[field.id].localeCode === field.localeCode && raw[field.id].localeName === field.localeName) {
                fieldChange = false;
            }

            if (fieldChange) {
                let status = CommonFunction.isEmpty(field.localeName) && CommonFunction.isEmpty(field.localeCode) ? 0 : 1;
                changed.push({
                    id: field.id,
                    customize: field.customize,
                    localeCode: status === 1 ? field.localeCode : "del",
                    localeName: status === 1 ? field.localeName : "del",
                    status: status
                })
            }
        })

        errors = _.uniq(errors);
        if (errors.length > 0) {
            CommonFunction.toastWarning(errors);
        } else {
            // submit
            if (changed && changed.length > 0) {
                FieldEntityApi.updateFieldDictionaries({
                    locale: locale,
                    dictionaries: changed
                }).then(res => {
                    if (res) {
                        loadFields(locale);
                        if (afterSubmit && typeof afterSubmit === "function") {
                            afterSubmit(changed);
                        }
                        CommonFunction.toastSuccess(t("common.save-success"));
                    }
                })
            } else {
                CommonFunction.toastInfo(t("common.no-data-changed"));
            }
        }


    }

    /**
     * apply when row edit
     * @param {*} prop 
     * @param {*} row 
     * @param {*} value 
     */
    const applyChange = (row, prop, value) => {
        let _fields = _.cloneDeep(fields);

        switch (prop) {
            case "localeName":
                _fields[row.index].localeCode = CommonFunction.removeAccentVietnamese(value).replace(/\s\s+/g, ' ').replaceAll(" ", "_").replaceAll("__", "_");
                break;
            case "localeCode":
                value = CommonFunction.removeAccentVietnamese(value).replace(/\s\s+/g, ' ').replaceAll(" ", "_").replaceAll("__", "_");
                break;
            default:
                break;
        }


        _fields[row.index][prop] = value;
        setFields(_fields);
    }

    return (
        <XLayout className="p-2">
            <XLayout_Top>
                <XToolbar
                    className="p-0 mb-2"
                    left={() => (<>
                        <Button label={t('common.save')} icon="bx bxs-save" className="p-2" onClick={submit} disabled={!fields || fields.length === 0}></Button>
                    </>)}
                    right={() => (<>
                        <Dropdown
                            className="mr-2"
                            value={locale}
                            options={locales}
                            onChange={(e) => {
                                setLocale(e.value);
                                setLocaleName(locales.find(f => f.id === e.value).name);
                                loadFields(e.value);
                            }}
                            valueTemplate={(item) => (`${t("common.language")}: ${item.name}`)}
                            optionValue="id"
                            optionLabel="name"
                        ></Dropdown>
                    </>)}
                ></XToolbar>
            </XLayout_Top>
            <XLayout_Center className="p-0">
                <XLayout_Box className="h-full p-0 position-relative">
                    <DataTable
                        value={fields}
                        // editMode="cell"
                        scrollable
                        showGridlines
                        className="p-datatable-inline-edit"
                        scrollDirection='vertical'
                        scrollHeight='flex'
                        loading={loading}
                        emptyMessage={t("common.empty-data")}
                        headerColumnGroup={
                            <ColumnGroup>
                                <Row>
                                    <Column header={t("field-dictionary.default")} colSpan={2} />
                                    <Column header={localeName} colSpan={2} />
                                </Row>
                                <Row>
                                    <Column header={t("common.name")} />
                                    <Column header={t("common.code")} />
                                    <Column header={t("common.name")} />
                                    <Column header={t("common.code")} />
                                </Row>
                            </ColumnGroup>
                        }
                    >
                        <Column
                            field="name"
                            bodyClassName="p-datatable-inline-edit-readonly-column"
                            body={(d) => <div className='p-2'>{d.name}</div>}
                        ></Column>
                        <Column
                            field="code"
                            bodyClassName="p-datatable-inline-edit-readonly-column"
                            body={(d) => <div className='p-2'>{d.code}</div>}
                        ></Column>
                        <Column
                            field="localeName"
                            body={(d) =>
                                <InputText value={d.localeName} onChange={(e) => applyChange(d, "localeName", e.target.value)}></InputText>
                            }

                        ></Column>
                        <Column
                            field="localeCode"
                            body={(d) =>
                                <InputText value={d.localeCode} onChange={(e) => applyChange(d, "localeCode", e.target.value)}></InputText>
                            }
                        ></Column>
                    </DataTable>
                </XLayout_Box>
            </XLayout_Center>
        </XLayout >
    )
};

FieldDictionary = forwardRef(FieldDictionary);

export default FieldDictionary;

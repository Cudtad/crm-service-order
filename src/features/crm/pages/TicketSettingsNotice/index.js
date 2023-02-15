import React, { useEffect, useRef, useState } from 'react';

import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import TicketSettingsMenu from '../../components/TicketSettingsMenu';
import TicketEnumeration from '../../ticket-common/TicketEnumeration';
import { InputText } from 'primereact/inputtext';
import CommonFunction from '@lib/common';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { TabPanel, TabView } from "primereact/tabview";
import classNames from "classnames";
import NoticeConfigApi from "services/config/NoticeConfigApi";
import Enumeration from '@lib/enum';
import XEditor from '@ui-lib/x-editor/XEditor';

import FieldEntityApi from "services/config/FieldEntityApi";
import "./styles.scss"
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';
import CrmLocationApi from "services/CrmLocationApi";
import CrmCategoryApi from "services/CrmCategoryApi";
import PageHeader from "components/page-header/PageHeader";

export default function TicketSettingsRuleAction() {
    const t = CommonFunction.t;

    const application = "crm-service-service";
    const entity = "ticket"
    const noticeListWidth = '400px';

    const statuses = [
        {
            code: 1,
            name: t("boolean.status.1")
        },
        {
            code: 0,
            name: t("boolean.status.0")
        }
    ];

    const channelEnum = [
        {
            code: 'web',
            name: 'notification.channel.web',
            icon: 'web-notify'
        },
        {
            code: 'email',
            name: 'notification.channel.email',
            icon: 'email-notify'
        },
        {
            code: 'sms',
            name: 'notification.channel.sms',
            icon: 'sms-notify'
        }
    ];

    const localeEnum = [
        {
            code: "vi",
            name: "notification.locale.vietnamese"
        },
        {
            code: "en",
            name: "notification.locale.english"
        }
    ];

    const actionEnum = [
        { code: "create", name: t("notice.event.create") },
        { code: "delete", name: t("notice.event.delete") },
        { code: "change_state", name: t("notice.event.change_state") },
        { code: "change_responsible_id", name: t("notice.event.change_responsible") },
        { code: "change_deadline", name: t("notice.event.change_deadline") },
        { code: "change_requested_by", name: t("notice.event.change_requester") },
        { code: "change_assignee", name: t("notice.event.change_assignee") },
    ];

    const entityTypes = [{
        code: TicketEnumeration.type.ticket,
        name: TicketEnumeration.ui.ticket.name,
        icon: `${TicketEnumeration.ui.ticket.icon} fs-20 ml-1`
    }, {
        code: TicketEnumeration.type.change,
        name: TicketEnumeration.ui.change.name,
        icon: `${TicketEnumeration.ui.change.icon} fs-20 ml-1`
    }, {
        code: TicketEnumeration.type.problem,
        name: TicketEnumeration.ui.problem.name,
        icon: `${TicketEnumeration.ui.problem.icon} fs-20 ml-1`
    }];
    const [selectedEntityType, setSelectedEntityType] = useState(entityTypes && entityTypes.length > 0 ? entityTypes[0] : null);

    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState([]);

    const [customFields, setCustomFields] = useState(null);

    const [impactingNotice, setImpactingNotice] = useState(null);

    const emptyFilter = { keyword: null };
    const [filterCondition, setFilterCondition] = useState(emptyFilter);

    const defaultErrors = {
        title: "",
        locale: "",
        action: "",
        channel: "",
        content: "",
    }
    const [errors, setErrors] = useState(defaultErrors);

    const [loading, setLoading] = useState(false);
    const [loadingNoticeDetail, setLoadingNoticeDetail] = useState(false);

    const refEditMode = useRef(null);
    const refTemplate = useRef(null);

    useEffect(() => {
        loadNoticesByType(entityTypes && entityTypes.length > 0 ? entityTypes[0].code : "");
    }, []);

    const loadNoticesByType = (type) => {
        setLoading(true);

        NoticeConfigApi.getByEntityType(application, `${entity}.${type}`).then(data => {
            if (data) {
                let sortData = _.sortBy(data, [function (o) { return o.title; }])
                setNotices(sortData);
                setLoading(false);
            }
        })
    }

    /**
     * load Fields by entity
     * @param {*} entityName
     */
    const loadFieldsByEntity = (locale) => {
        // await FieldEntityApi.getConfigFields(application, entity, type);
        FieldEntityApi.getConfigFields(application, entity, null, null, locale).then(async res => {
            if (res) {
                let _fields = _.cloneDeep(res);

                // default assign type
                _fields.forEach(_field => {
                    _field.allowCondition = true;
                    _field.allowAction = true;

                    _field.fieldId = _field.id;
                    _field.fieldName = _field.code;
                    _field.fieldType = _field.type;
                    _field.fieldCode = _field.code;
                    _field.fieldLabel = _field.name;

                    // default list method for real field
                    if (_field.customize === false && _field.fieldType === "LIST_SINGLE" && !_field.listMethod) {
                        _field.listMethod = "METHOD_ARRAY";
                    }

                    if (!_field.filterType) {
                        _field.filterType = _field.customize ? "CUSTOM_FIELD" : "FIELD";
                    }

                });

                _fields = await customizeFields(_fields, selectedEntityType.code)

                setCustomFields(_.cloneDeep(_fields).filter(f => f.allowCondition === true));
            }
        })
    };

    /**
     * customize fields: add custom render
     * @param {*} _fields
     * @returns
     */
    const customizeFields = async (_fields, type) => {
        // load locations
        let locations = [];
        let locationResponse = await CrmLocationApi.list({
            size: 9999,
            page: 0
        });
        if (locationResponse) locations = locationResponse.content.map(m => ({ ...m, key: m.id, value: m.name }));

        // load categories
        let categories = [];
        let categoryResponse = await CrmCategoryApi.list({
            size: 9999,
            page: 0
        });
        if (categoryResponse) categories = categoryResponse.content.map(m => ({ ...m, key: m.id, value: m.name }));

        _fields.forEach(_field => {

            // Lọc những field ko dùng trong condition và action
            switch (_field.fieldCode) {
                case "description":
                case "create_by":
                case "update_date":
                case "update_by":
                case "status":
                case "version":
                case "activity_id":
                case "closed_on":
                case "group_id":
                case "group_type":
                case "important":
                case "parent_id":
                case "responsible_id":
                case "start_date":
                case "temp":
                case "workflow_id":
                    _field.allowCondition = false;
                    _field.allowAction = false;
                    break;
                case "create_date":
                    _field.allowCondition = false;
                    _field.allowAction = true;
                    _field.fieldCode = "resolved_sla";
                    _field.fieldName = t("ticket.resolved_sla");
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    break;
                case "modified_date":
                    _field.fieldCode = "response_sla";
                    _field.fieldName = t("ticket.response_sla");
                    _field.allowCondition = false;
                    _field.allowAction = true;
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    break;
                case "state":
                    _field.allowAction = false;
                    break;
                default:
                    break;
            }

            // renderer cho những field cần custom cách hiển thị
            switch (_field.fieldCode) {
                case "state":
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    if (type === TicketEnumeration.type.ticket) {
                        _field.listItems = TicketEnumeration.dropdown.state.ticket.map(m => ({ key: m.id, value: m.name }));
                    } else if (type === TicketEnumeration.type.problem) {
                        _field.listItems = TicketEnumeration.dropdown.state.problem.map(m => ({ key: m.id, value: m.name }));
                    } else if (type === TicketEnumeration.type.change) {
                        _field.listItems = TicketEnumeration.dropdown.state.change.map(m => ({ key: m.id, value: m.name }));
                    }
                    break;
                case "urgency":
                    _field.listItems = TicketEnumeration.dropdown.urgency.options.map(m => ({ key: m.id, value: m.name }));
                    break;
                case "impact":
                    _field.listItems = TicketEnumeration.dropdown.impact.options.map(m => ({ key: m.id, value: m.name }));
                    break;
                case "priority":
                    _field.listItems = TicketEnumeration.dropdown.priority.options.map(m => ({ key: m.id, value: m.name }));
                    break;
                case "location_id":
                    _field.listItems = locations;
                    _field.fieldCode = "locationId";
                    _field.fieldName = t("ticket.location");
                    _field.renderer = {
                        condition: (item) => {
                            let multiple = item.operator !== "=";
                            return (
                                <XDropdownTree
                                    multiple={multiple}
                                    value={item.values ? (multiple ? item.values : item.values[0]) : null}
                                    options={locations}
                                    className="w-full"
                                    optionLabel="name"
                                    optionValue="id"
                                    filterBy="name"
                                    onChange={(e) => item.applyValue(e.value)}
                                ></XDropdownTree>
                            )
                        },
                        action: (item) => {
                            return (
                                <XDropdownTree
                                    value={item.values ? item.values[0] : null}
                                    options={locations}
                                    className="w-full"
                                    optionLabel="name"
                                    optionValue="id"
                                    filterBy="name"
                                    onChange={(e) => item.applyValue(e.value)}
                                ></XDropdownTree>
                            )
                        }
                    }
                    break;
                case "category_id":
                    _field.listItems = categories;
                    _field.fieldCode = "categoryId";
                    _field.fieldName = t("ticket.category");
                    _field.renderer = {
                        condition: (item) => {
                            let multiple = item.operator !== "=";
                            return (
                                <XDropdownTree
                                    multiple={multiple}
                                    value={item.values ? (multiple ? item.values : item.values[0]) : null}
                                    options={categories}
                                    className="w-full"
                                    optionLabel="name"
                                    optionValue="id"
                                    filterBy="name"
                                    onChange={(e) => item.applyValue(e.value)}
                                ></XDropdownTree>
                            )
                        },
                        action: (item) => {
                            return (
                                <XDropdownTree
                                    value={item.values ? item.values[0] : null}
                                    options={categories}
                                    className="w-full"
                                    optionLabel="name"
                                    optionValue="id"
                                    filterBy="name"
                                    onChange={(e) => item.applyValue(e.value)}
                                ></XDropdownTree>
                            )
                        }
                    }
                    break;
                default:
                    break;
            }
        });

        return _fields;
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

        setImpactingNotice(null);
        setSelectedNotice(null);
        loadNoticesByType(type.code);
    }

    useEffect(() => {

    }, [errors])

    const createNotice = () => {
        refEditMode.current = Enumeration.crud.create;
        let _defaultNotice = {
            application: application,
            code: `${entity}.${selectedEntityType.code}`,
            action: null,
            channel: null,
            title: "",
            content: null,
            locale: null,
            status: true
        }
        loadFieldsByEntity("vi");
        setErrors(_.cloneDeep(defaultErrors));

        setImpactingNotice(_defaultNotice);
        setSelectedNotice(null);
    }

    const updateNotice = (id) => {
        setLoadingNoticeDetail(true);
        setSelectedNotice(id);

        NoticeConfigApi.get(id).then((res) => {
            if (res) {
                // set states
                // -----------------------------------------
                refEditMode.current = Enumeration.crud.update;
                setErrors(_.cloneDeep(defaultErrors));

                setImpactingNotice({
                    ...res,
                    locale: localeEnum.find(locale => locale.code === res.locale),
                    action: actionEnum.find(action => action.code === res.action),
                    channel: channelEnum.find(channel => channel.code === res.channel)
                });
                loadFieldsByEntity(res.locale);
                setLoadingNoticeDetail(false);
            }
        });
    }

    const deleteNotice = (notice) => {
        CommonFunction.showConfirm(t("confirm.delete.message").format(notice.title), t("confirm.delete.title"), () => {
            NoticeConfigApi.delete(notice.id).then(res => {
                if (res) {
                    let _notices = _.cloneDeep(notices);

                    // find rule index
                    let index = -1;
                    for (let i = 0; i < _notices.length; i++) {
                        if (_notices[i].id === notice.id) {
                            index = i;
                            break;
                        }
                    }

                    // remove from list
                    if (index > -1) {
                        _notices = [
                            ..._notices.slice(0, index),
                            ..._notices.slice(index + 1)
                        ];
                        setNotices(_notices);

                        // remove active rule
                        setSelectedNotice(null);

                        setImpactingNotice(null);
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
    const applyChange = (prop, val) => {
        let notice = _.cloneDeep(impactingNotice);

        switch (prop) {
            case "locale":
                loadFieldsByEntity(val.code);
                break;
            default:
                break;
        }

        notice[prop] = val;

        validate([prop], notice);

        setImpactingNotice(notice);
    }

    /**
     * validate ticket
     * @param {*} props
     * @param {*} rule
     * @returns
     */
    const validate = (props, notice) => {
        notice = notice || _.cloneDeep(impactingNotice);

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
                case 'title':
                    result[prop] = notice.title && notice.title.length > 0 ? null : t("validate.required");
                    break;
                case 'locale':
                    result[prop] = notice.locale ? null : t("validate.required");
                    break;
                case 'action':
                    result[prop] = notice.action ? null : t("validate.required");
                    break;
                case 'channel':
                    result[prop] = notice.channel ? null : t("validate.required");
                    break;
                case 'content':
                    result[prop] = notice.content ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let allErrors = [];

        for (const property in result) {
            if (!CommonFunction.isEmpty(result[property])) {
                isValid = false;
                allErrors.push(result[property]);
            }
        }

        return [isValid, _.uniq(allErrors)];
    };

    /**
     * submit
     */
    const submit = async () => {
        let errors = [];

        // valid rule
        let [noticeValid, noticeErrors] = validate([]);
        if (noticeErrors && noticeErrors.length > 0) {
            errors = [...noticeErrors];
        }
        if (errors.length > 0) {
            CommonFunction.toastWarning(errors);
        } else {
            let _impactingNotice = _.cloneDeep(impactingNotice);

            let payload = {
                application: _impactingNotice.application,
                code: _impactingNotice.code,
                id: _impactingNotice.id,
                title: _impactingNotice.title,
                action: _impactingNotice.action.code,
                channel: _impactingNotice.channel.code,
                content: _impactingNotice.content,
                locale: _impactingNotice.locale.code,
                status: _impactingNotice.status ? 1 : 0
            }

            // submit
            let res = null;

            switch (refEditMode.current) {
                case Enumeration.crud.create:
                    res = await NoticeConfigApi.create(payload);
                    if (res) {
                        let _notices = _.cloneDeep(notices);

                        _notices.unshift({
                            ...res,
                            locale: localeEnum.find(locale => locale.code === res.locale),
                            action: actionEnum.find(action => action.code === res.action),
                            channel: channelEnum.find(channel => channel.code === res.channel)
                        });

                        setNotices(_notices);
                    }
                    break;
                case Enumeration.crud.update:
                    res = await NoticeConfigApi.update(payload);
                    break;
                default:
                    break;
            }

            if (res) {
                updateNotice(res.id);
                CommonFunction.toastSuccess(t("common.save-success"));
            }
        }
    }

    const copyCustomField = (customField) => {
        if (!CommonFunction.isEmpty(customField.localeName)) {
            CommonFunction.copyToClipboard('${' + customField.localeCode + '}');
        } else {
            CommonFunction.copyToClipboard('${' + customField.code + '}');
        }
    }

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

    return (<>
        <XLayout className="pt-1 pl-2 pb-2 pr-2">
            <XLayout_Top>
                <TicketSettingsMenu selected="ticket.settings.notice"></TicketSettingsMenu>
                {/*<PageHeader title={t('project.setting.notice')} breadcrumb={[t('menu.project-category'), t('project.setting.notice')]} />*/}
            </XLayout_Top>
            <XLayout_Center>
                <XLayout className="ticket-setting-notice">
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

                    <XLayout_Left style={{ width: noticeListWidth || "350px", borderColor: "var(--material-grey-5)" }} className="border-right pr-2 position-relative">
                        <LoadingBar loading={loading} />
                        <XLayout>
                            <XLayout_Top className="mb-1">
                                <XToolbar className="mb-2" left={() => (
                                    <Button
                                        icon="bx bx-bell create"
                                        label={t("notice.create")}
                                        onClick={createNotice}
                                    ></Button>
                                )}></XToolbar>
                                {/* <span className="w-full mb-2">
                                    <InputText
                                        className="w-full"
                                        placeholder={t("common.search")}
                                        onInput={(e) => CommonFunction.debounce(null, onFilterChange, { key: "keyword", val: e.target.value })}
                                    />
                                </span> */}

                            </XLayout_Top>
                            <XLayout_Center className="rule-action-list">
                                {
                                    notices.length === 0 &&
                                    <div className="flex w-full h-full align-items-center justify-content-center flex-column">
                                        <i className="bx bx-info-circle fs-40 text-grey-5"></i>
                                        <span className="mb-3 mt-1 fs-18 text-grey-7">{t("notice.empty")}</span>
                                        <Button
                                            icon="bx bx bx-bell"
                                            className="primary"
                                            label={t("notice.create")}
                                            onClick={createNotice}
                                        ></Button>

                                    </div>
                                }
                                {notices.length > 0 &&
                                    <ListBox
                                        value={selectedNotice}
                                        onChange={(e) => { if (e.value) updateNotice(e.value) }}
                                        options={notices}
                                        optionLabel="name"
                                        optionValue="id"
                                        filterBy="title"

                                        filter
                                        itemTemplate={(option) => (
                                            <React.Fragment>
                                                <div className="rule-action-list-item">

                                                    <div className="item-info">
                                                        <span>{option.title}</span>
                                                    </div>

                                                    <div className="item-action">
                                                        <Button
                                                            icon='bx bx-pencil text-grey'
                                                            className="p-button-rounded p-button-text"
                                                            tooltip={t('common.update')}
                                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                            onClick={() => updateNotice(option.id)}
                                                        />

                                                        <Button
                                                            icon='bx bx-trash-alt text-grey'
                                                            className="p-button-rounded p-button-text"
                                                            tooltip={t('common.delete')}
                                                            tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                                                            onClick={() => deleteNotice(option)}
                                                        />
                                                    </div>

                                                </div>
                                            </React.Fragment>
                                        )} />
                                }
                            </XLayout_Center>
                        </XLayout>

                    </XLayout_Left>

                    {/* layout */}
                    <XLayout_Center className="position-relative">
                        <LoadingBar loading={loadingNoticeDetail} />

                        {!impactingNotice &&
                            <div className="rule-action-not-selected">
                                <i className="bx bx-info-circle fs-40 text-grey-5"></i>
                                <span className="mt-2 fs-18 text-grey-7">{t("notice.not-selected")}</span>
                            </div>
                        }

                        {impactingNotice &&
                            <XLayout className="pl-2 position-relative">
                                <LoadingBar loading={loadingNoticeDetail}></LoadingBar>

                                <XLayout_Top className="mb-1">
                                    <XToolbar left={() => (<>
                                        <Button icon="bx bxs-save" label={t('common.save')} onClick={submit}></Button>
                                    </>)}></XToolbar>

                                </XLayout_Top>
                                <XLayout_Center className="pt-2">
                                    {/*{JSON.stringify(impactingNotice)}*/}
                                    <div className="p-fluid fluid  formgrid grid p-0">
                                        <div className="col-12 pl-0 pr-1">
                                            <span className="p-float-label">
                                                <InputText

                                                    value={impactingNotice.title}
                                                    onChange={(e) => applyChange("title", e.target.value)}
                                                ></InputText>
                                                <label className="require">{t("notification.title")}</label>
                                                {renderErrors("title")}
                                            </span>
                                        </div>
                                        <div className="col-12 pr-0 pl-1">
                                            <span className="p-float-label">
                                                <Dropdown value={impactingNotice.channel}
                                                    options={channelEnum}
                                                    onChange={(e) => applyChange('channel', e.value)}
                                                    optionLabel={(option) => t(option.name)}

                                                    valueTemplate={(option, props) => {
                                                        if (option) {
                                                            return (
                                                                <>
                                                                    <i className={classNames([option.icon, 'mr-1'])}></i>{t(option.name)}
                                                                </>
                                                            );
                                                        }
                                                        return 'empty';
                                                    }}
                                                    itemTemplate={(option) => {
                                                        return (
                                                            <>
                                                                <i className={classNames([option.icon, 'mr-1'])}></i>{t(option.name)}
                                                            </>
                                                        );
                                                    }}
                                                />
                                                <label className="require">{t('notification.channel')}</label>
                                                {renderErrors("channel")}
                                            </span>
                                        </div>
                                        <div className="col-12 pl-0 pr-1">
                                            <span className="p-float-label">
                                                <Dropdown value={impactingNotice.locale}
                                                    options={localeEnum}
                                                    onChange={(e) => applyChange('locale', e.value)}
                                                    optionLabel={(option) => t(option.name)}

                                                />
                                                <label className="require">{t('notification.locale')}</label>
                                                {renderErrors("locale")}
                                            </span>
                                        </div>
                                        <div className="col-12 pr-0 pl-1">
                                            <span className="p-float-label">
                                                <Dropdown value={impactingNotice.action}
                                                    options={actionEnum}
                                                    onChange={(e) => applyChange('action', e.value)}
                                                    optionLabel={(option) => t(option.name)}

                                                />
                                                <label className="require">{t('notification.action')}</label>
                                                {renderErrors("action")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-fluid fluid  formgrid grid p-0">
                                        <div className="col-12 pl-0 pr-1">
                                            <XLayout_Title>{t("notification.content")}</XLayout_Title>
                                            <XEditor
                                                ref={refTemplate}
                                                value={impactingNotice.content}
                                                onBlur={newContent => applyChange('content', newContent)} // preferred to use only this option to update the content for performance reasons
                                                config={{
                                                    placeholder: t("newsfeed.content"),
                                                    buttons: [
                                                        'bold',
                                                        'strikethrough',
                                                        'underline',
                                                        'italic', '|',
                                                        'superscript', 'subscript', '|',
                                                        'ul', 'ol', '|',
                                                        'indent', 'outdent', '|',
                                                        'align', 'font', 'fontsize', 'paragraph', '|',
                                                        'image', 'table', 'link', '|',
                                                    ],
                                                    useSearch: false,
                                                    spellcheck: false,
                                                    showCharsCounter: false,
                                                    showWordsCounter: false,
                                                    showXPathInStatusbar: false,
                                                    askBeforePasteHTML: false,
                                                    askBeforePasteFromWord: false,
                                                    height: 'calc(100vh - 340px)',
                                                    minHeight: 200,
                                                    style: {
                                                        fontFamily: "SF Pro Text",
                                                    },
                                                    language: CommonFunction.getCurrentLanguage(),
                                                }}
                                            ></XEditor>
                                            {/* <Xediter id="content"
                                                style={{height: 'calc(100vh - 340px)'}}
                                                value={impactingNotice.content}
                                                onTextChange={(e) => applyChange('content', e.htmlValue)}
                                        /> */}
                                            {renderErrors("content")}
                                        </div>
                                        <div className="entity-field-list col-12 pl-1 pr-0">
                                            <XLayout_Title>{t("notification.custom-field")}</XLayout_Title>
                                            {customFields && customFields.length > 0 &&
                                                <ListBox
                                                    options={customFields.filter(f => (!filterCondition.keyword || f.name.indexOf(filterCondition.keyword) > -1))}
                                                    optionLabel="name"
                                                    itemTemplate={(option) => (
                                                        <React.Fragment>
                                                            <div className="entity-field-list-item" onClick={(e) => copyCustomField(option)}>
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
                                                                            ? <>
                                                                                <span className="bold">{option.name}</span>
                                                                                <i className="text-grey ml-1">({option.code})</i>
                                                                            </>
                                                                            : <>
                                                                                <span className="bold">{option.localeName}</span>
                                                                                <i className="text-grey ml-1">({option.localeCode})</i>
                                                                            </>
                                                                        }

                                                                    </div>
                                                                    {/*<i><small>*/}
                                                                    {/*    {option.type === "BOOLEAN" && t("datatype.boolean")}*/}
                                                                    {/*    {option.type === "LIST_SINGLE" && t("datatype.list-single")}*/}
                                                                    {/*    {option.type === "LIST_MULTI" && t("datatype.list-multi")}*/}
                                                                    {/*    {option.type === "DATE" && t("datatype.date")}*/}
                                                                    {/*    {option.type === "DATE_TIME" && t("datatype.datetime")}*/}
                                                                    {/*    {option.type === "STRING" && t("datatype.string")}*/}
                                                                    {/*    {option.type === "LONG" && t("datatype.long")}*/}
                                                                    {/*    {option.type === "DOUBLE" && t("datatype.double")}*/}
                                                                    {/*    {option.description &&*/}
                                                                    {/*    <span>&nbsp;- {option.description}</span>*/}
                                                                    {/*    }*/}
                                                                    {/*</small></i>*/}

                                                                </div>

                                                                {/*<div className="item-action">*/}
                                                                {/*    <Button*/}
                                                                {/*        icon='bx bx-copy fs-18 text-green'*/}
                                                                {/*        className="p-button-rounded p-button-text"*/}
                                                                {/*        tooltip={t('button.copy')}*/}
                                                                {/*        tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}*/}
                                                                {/*        onClick={() => copyCustomField(option)}*/}
                                                                {/*    />*/}
                                                                {/*</div>*/}

                                                            </div>
                                                        </React.Fragment>
                                                    )} />
                                            }
                                        </div>
                                    </div>
                                </XLayout_Center>
                            </XLayout>
                        }

                    </XLayout_Center>
                </XLayout>
            </XLayout_Center>
        </XLayout>
    </>);
}

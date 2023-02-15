import React, { useEffect, useState } from 'react';

import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import TicketSettingsMenu from '../../components/TicketSettingsMenu';
import TicketEnumeration from '../../ticket-common/TicketEnumeration';
import RuleActionSettings from 'components/rule-action/RuleActionSettings';
import CommonFunction from '@lib/common';
import _ from 'lodash';
import { GroupAutoComplete } from 'components/autocomplete/GroupAutoComplete';
import { UserAutoComplete } from '@ui-lib/x-autocomplete/UserAutoComplete';
import { Dropdown } from 'primereact/dropdown';
import CrmLocationApi from 'services/CrmLocationApi';
import CrmSlaApi from 'services/CrmSlaApi';
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';
import { InputNumber } from "primereact/inputnumber";
import ProjectEntryApi from 'services/ProjectEntryService';
import RoleApi from '../../../../services/RoleService';
import { MultiSelect } from 'primereact/multiselect';
import './styles.scss'
import CrmCategoryApi from '../../../../services/CrmCategoryApi';

const roleApplication = `crm-service-service`
const roleType = `crm-service-service`
const roleRefType = `crm-product`

export default function TicketSettingsRuleAction() {
    const t = CommonFunction.t;
    const [resolvedSla, setResolvedSla] = useState(null);
    const [responseSla, setResponseSla] = useState(null);

    const [responseAction, setResponseAction] = useState([]);
    const [resolveAction, setResolveAction] = useState([]);

    const [slas, setSlas] = useState([]);

    useEffect(() => {
        // load sla
        CrmSlaApi.list(0, 9999).then(res => {
            if (res) setSlas(res.content);
        });
    }, [])

    const applyChangeSLA = (prop, val) => {
        // let _values = _.cloneDeep(item.values)
        // switch (prop){
        //     case "duration":
        //         _values[0] = val;
        //         break;
        //     case "unit":
        //         _values[1] = val;
        //         break;
        //     default:break;
        // }
        // item.applyValue(_values);
        // debugger
        let _resolve = _.cloneDeep(resolveAction);
        let _response = _.cloneDeep(responseAction);
        switch (prop) {
            case "resolveDuration":
                _resolve[0] = val;
                if (val) {
                    if (!_resolve[1]) {
                        _resolve[1] = "days"
                    }
                } else {
                    _resolve[1] = ""
                }
                break;
            case "resolveUnit":
                _resolve[1] = val;
                break;
            case "responseDuration":
                _response[0] = val;
                if (val) {
                    if (!_response[1]) {
                        _response[1] = "days"
                    }
                } else {
                    _response[1] = ""
                }
                break;
            case "responseUnit":
                _response[1] = val;
                break;
            default: break;
        }
        setResponseAction(_response)
        setResolveAction(_resolve)
    }
    /**
     * customize fields: add custom render
     * @param {*} _fields
     * @returns
     */
    const customizeFields = async (_fields, type) => {

        let roles = await RoleApi.getByApplicationAndType(roleApplication, roleType, roleRefType, null).catch(() => { })
        if (roles) {
            roles.forEach(el => {
                el.roleSet = el.roleSet || "";
            });
            roles = _.sortBy(roles, ["roleSet", "name"]);
        }
        // load locations
        let locations = [];
        let locationResponse = await CrmLocationApi.list({ page: 0, size: 9999 });
        if (locationResponse) locations = locationResponse.content.map(m => ({ ...m, key: m.id, value: m.name }));

        // load categories
        let categories = [];
        let params = {
            size: 9999,
            page: 0
        }
        let categoryResponse = await CrmCategoryApi.list(params);
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
                    _field.fieldLabel = t("ticket.resolved_sla");
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    break;
                case "modified_date":
                    _field.fieldCode = "response_sla";
                    _field.fieldLabel = t("ticket.response_sla");
                    _field.allowCondition = false;
                    _field.allowAction = true;
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    break;
                case "state":
                    _field.fieldLabel = t("ticket.state");
                    _field.allowAction = false;
                    break;
                case "subtype":
                    _field.allowCondition = true;
                    _field.allowAction = true;
                    _field.fieldLabel = t("ticket.subtype");
                    break;
                default:
                    if (!_field.customize) {
                        _field.fieldLabel = t('ticket.field.' + _field.fieldCode);
                    }
                    break;
            }

            // renderer cho những field cần custom cách hiển thị
            switch (_field.fieldCode) {
                case "state":
                    _field.fieldType = "LIST_SINGLE";
                    _field.listMethod = "METHOD_ARRAY";
                    if (type === TicketEnumeration.type.ticket) {
                        _field.listItems = TicketEnumeration.dropdown.state.ticket.map(m => ({ key: m.code, value: m.name }));
                    } else if (type === TicketEnumeration.type.problem) {
                        _field.listItems = TicketEnumeration.dropdown.state.problem.map(m => ({ key: m.code, value: m.name }));
                    } else if (type === TicketEnumeration.type.change) {
                        _field.listItems = TicketEnumeration.dropdown.state.change.map(m => ({ key: m.code, value: m.name }));
                    }
                    break;
                case "urgency":
                    _field.listItems = TicketEnumeration.dropdown.urgency.options.map(m => ({ key: m.code, value: m.name }));
                    break;
                case "impact":
                    _field.listItems = TicketEnumeration.dropdown.impact.options.map(m => ({ key: m.code, value: m.name }));
                    break;
                case "priority":
                    _field.listItems = TicketEnumeration.dropdown.priority.options.map(m => ({ key: m.code, value: m.name }));
                    break;
                case "location_id":
                    _field.listItems = locations;
                    _field.fieldCode = "locationId";
                    _field.fieldLabel = t("ticket.location");
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
                    _field.fieldLabel = t("ticket.category");
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
                case "subtype":
                    _field.listItems = TicketEnumeration.dropdown.subtype.options;
                    _field.fieldCode = "subtype";
                    _field.fieldLabel = t("ticket.subtype");
                    _field.renderer = {
                        condition: (item) => {
                            let multiple = item.operator !== "=";
                            return (
                                <XDropdownTree
                                    multiple={multiple}
                                    value={item.values ? (multiple ? item.values : item.values[0]) : null}
                                    options={TicketEnumeration.dropdown.subtype.options}
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
                                    options={TicketEnumeration.dropdown.subtype.options}
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
        // Bổ sung thêm các component involve
        // thêm nhóm xử lý
        _fields.push({
            allowAction: true,
            allowCondition: true,
            fieldCode: "involve_assignGroup",
            filterType: "ROLE", // involve phải có filter type là ROLE, field thực là FIELD, field ảo là CUSTOM_FIELD
            fieldId: -100001, // đặt id < 0 với các field tự thêm
            fieldName: "ASSIGNGROUP",
            fieldLabel: t("ticket.assigngroup"),
            fieldType: "LIST_SINGLE",
            status: 1,
            renderer: {
                condition: (item) => {
                    let multiple = item.operator !== "=";
                    return (
                        <MultiSelect
                            optionLabel="name"
                            optionValue="roleId"
                            display="chip"
                            value={item.displayValues}
                            selectionLimit={multiple ? null : 1}
                            options={roles}
                            onChange={(e) => {
                                item.applyValue(
                                    e.value, // value
                                    e.value // display value
                                );
                            }}
                        />
                    )
                },
                action: (item) => (<>
                    <MultiSelect
                        optionLabel="name"
                        optionValue="roleId"
                        display="chip"
                        value={item.values}
                        options={roles}
                        onChange={(e) => item.applyValue(e.value)}
                    />
                </>)
            }
        })

        // thêm người xử lý
        _fields.push({
            allowAction: true,
            allowCondition: true,
            fieldCode: "involve_assignUser",
            filterType: "ROLE",
            fieldId: -100002, // đặt id < 0 với các field tự thêm
            fieldName: "ASSIGNEE",
            fieldLabel: t("ticket.assignuser"),
            fieldType: "LIST_SINGLE",
            status: 1,
            renderer: {
                condition: (item) => {
                    let multiple = item.operator !== "=";
                    return (
                        <UserAutoComplete
                            multiple={multiple}
                            className="w-full"
                            groupType={'org'}
                            value={item.displayValues}
                            onChange={(value) => {
                                // Khi thay đổi giá trị, set lại value và display value
                                let _value = null, _displayValue = null;
                                if (value && value.length > 0) {
                                    _value = multiple ? value.map(m => m.id) : value[0].id;
                                    _displayValue = value.map(m => ({ ...m, key: m.id, value: m.name })); // map lại key, value để hiển thị ở preview condition
                                    _displayValue = multiple ? _displayValue : [_displayValue[0]]
                                }

                                item.applyValue(
                                    _value, // value
                                    _displayValue // display value
                                );
                            }}
                        />
                    )
                },
                action: (item) => (<>
                    <UserAutoComplete
                        multiple
                        className="w-full"
                        groupType={'org'}
                        value={item.values}
                        onChange={(value) => {
                            item.applyValue(value);
                        }}
                    />
                </>)
            }
        })

        // _fields.push({
        //     allowAction: true,
        //     allowCondition: false,
        //     fieldCode: "calculateDeadline",
        //     filterType: "ROLE",
        //     fieldId: -100003, // đặt id < 0 với các field tự thêm
        //     fieldName: "ACTION",
        //     fieldLabel: t("ticket.calculateDeadline"),
        //     fieldType: "LIST_SINGLE",
        //     status: 1,
        //     renderer: {
        //         action: (item) => (
        //         <div className="flex">
        //             <InputNumber value={item.values[0]} onChange={(e) => applyChangeSLA('duration', item, e.value)}/>
        //             <Dropdown value={item.values[1]}
        //                     options={[
        //                         {code: 'minute', name: t('ticket.sla.minutes')},
        //                         {code: 'hour', name: t('common.hour')},
        //                         {code: 'day', name: t('common.day')},
        //                     ]}
        //                       optionLabel="name" optionValue="code"
        //                       onChange={(e) => applyChangeSLA('unit', item, e.value)} />
        //         </div>)
        //     }
        // })
        //
        // _fields.push({
        //     allowAction: true,
        //     allowCondition: false,
        //     fieldCode: "calculateResponseDeadline",
        //     filterType: "ROLE",
        //     fieldId: -100004, // đặt id < 0 với các field tự thêm
        //     fieldName: "ACTION",
        //     fieldLabel: t("ticket.calculateResponseDeadline"),
        //     fieldType: "LIST_SINGLE",
        //     status: 1,
        //     renderer: {
        //         action: (item) => (
        //             <div className="flex">
        //                 <InputNumber value={item.values[0]} onChange={(e) => applyChangeSLA('duration', item, e.value)}/>
        //                 <Dropdown value={item.values[1]}
        //                           options={[
        //                               {code: 'minute', name: t('common.minute')},
        //                               {code: 'hour', name: t('common.hour')},
        //                               {code: 'day', name: t('common.day')},
        //                           ]}
        //                           optionLabel="name" optionValue="code"
        //                           onChange={(e) => applyChangeSLA('unit', item, e.value)} />
        //             </div>)
        //     }
        // })
        return _fields;
    }

    /**
     * customize detail
     * @param {*} detail
     * @returns
     */
    const customizeDetail = async (detail) => {
        // gán lại state cho sla sau khi load data từ db
        if (detail.actionConfigs) {
            detail.actionConfigs.forEach(ac => {
                if (ac.estimateDeadline !== undefined && ac.estimateDeadline !== null && ac.estimateDeadline.task) {
                    setResolvedSla(ac.estimateDeadline.task.deadline || null);
                    setResponseSla(ac.estimateDeadline.task.responseDeadline || null);
                }
                if (ac.calculate !== undefined && ac.calculate !== null && ac.calculate) {
                    if (ac.calculate.response) {
                        setResponseAction(ac.calculate.response)
                    }
                    if (ac.calculate.resolve) {
                        setResolveAction(ac.calculate.resolve)
                    }
                }
            });

        }
        return detail;
    }

    /**
     * prepare assign before submit
     * @param {*} data { conditions: [], actions: [], payload: []}
     */
    const beforeSubmit = (conditions, actions, payload) => {
        // xử lý involve trước khi submit
        let _involves = [];

        actions.actions.forEach(action => {
            switch (action.fieldCode) {
                case "involve_assignGroup":
                    _involves.push({
                        involveType: "group",
                        involveIds: action.values.map(m => m.id),
                        role: "ASSIGNEE"
                    })
                    break;
                case "involve_assignUser":
                    _involves.push({
                        involveType: "user",
                        involveIds: action.values.map(m => m.id),
                        role: "ASSIGNEE"
                    })
                    break;
                default:
                    break;
            }
        });

        payload.actionConfigs.forEach(el => {
            if (el.assign && typeof el.assign === "object") {
                el.assign.involves = _involves;
            }
        })

        // sla
        payload.actionConfigs.push({
            estimateDeadline: {
                task: {
                    deadline: resolvedSla,
                    responseDeadline: responseSla
                }
            },
            calculate: {
                response: responseAction,
                resolve: resolveAction
            }
        });

        return payload;
    }

    /**
     * sla action
     */
    const slaRenderer = () => {
        return (<>
            <XLayout_Title>{t("ticket.action.setting")}</XLayout_Title>
            <XLayout_Center>
                <div className="flex">
                    <div className="p-field flex mr-4" >
                        <span className="p-float-label mr-2">
                            <InputNumber id="resolveDuration" value={resolveAction[0]} onChange={(e) => applyChangeSLA('resolveDuration', e.value)} />
                            <label htmlFor="resolveDuration" >{t('ticket.resolved_sla')}</label>
                        </span>
                        <span className="p-float-label">
                            <Dropdown id="resolveUnit" style={{ width: '120px' }}
                                value={resolveAction[1]}
                                disabled={!resolveAction[0]}
                                options={[
                                    { code: 'minutes', name: t('ticket.sla.minutes') },
                                    { code: 'hours', name: t('common.hour') },
                                    { code: 'days', name: t('common.day') },
                                ]}
                                optionLabel="name" optionValue="code"
                                onChange={(e) => applyChangeSLA('resolveUnit', e.value)} />
                            <label htmlFor="resolveUnit" >{t('ticket.resolved_unit')}</label>
                        </span>
                    </div>
                    <div className="flex p-field">
                        <span className="p-float-label mr-2">
                            <InputNumber id="responseDuration" value={responseAction[0]} onChange={(e) => applyChangeSLA('responseDuration', e.value)} />
                            <label htmlFor="responseDuration" >{t('ticket.response_sla')}</label>
                        </span>
                        <span className="p-float-label">
                            <Dropdown id="responseUnit" value={responseAction[1]} style={{ width: '120px' }}
                                disabled={!responseAction[0]}
                                options={[
                                    { code: 'minutes', name: t('ticket.sla.minutes') },
                                    { code: 'hours', name: t('common.hour') },
                                    { code: 'days', name: t('common.day') },
                                ]}
                                optionLabel="name" optionValue="code"
                                onChange={(e) => applyChangeSLA('responseUnit', e.value)} />
                            <label htmlFor="responseUnit">{t('ticket.resolved_unit')}</label>
                        </span>
                    </div>
                </div>
            </XLayout_Center>
        </>)
    }

    return (<>
        <XLayout className="pt-1 pl-2 pb-2 pr-2 crm-ticket-setting-rule-action">
            <XLayout_Top>
                <TicketSettingsMenu selected="ticket.settings.rule"></TicketSettingsMenu>
            </XLayout_Top>
            <XLayout_Center>
                <RuleActionSettings
                    application="crm-service-service"
                    entity="ticket"
                    ruleListWidth="400px"
                    entityTypes={[{
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
                    }]}
                    customizeFields={customizeFields}
                    customizeDetail={customizeDetail}
                    beforeSubmit={beforeSubmit}
                    afterActionRenderer={slaRenderer}
                ></RuleActionSettings>
            </XLayout_Center>
        </XLayout>
    </>);
}

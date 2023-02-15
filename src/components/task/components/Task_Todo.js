import {XLayout_Box} from '@ui-lib/x-layout/XLayout';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import './scss/Task_Todo.scss'

import {Button} from 'primereact/button';
import {Panel} from 'primereact/panel';
import _ from 'lodash';
import {InputText} from 'primereact/inputtext';
import {ReactSortable} from "react-sortablejs";
import CommonFunction from '@lib/common';
import classNames from 'classnames';
import {Menu} from 'primereact/menu';
import {Calendar} from 'primereact/calendar';

function Todo(props, ref) {
    const t = CommonFunction.t;
    const { data, className } = props;
    const [checkList, setCheckList] = useState(null);
    const refGroupMenu = useRef(null);
    const refItemMenu = useRef(null);
    const refMenuImpactItem = useRef(null);

    useImperativeHandle(ref, () => ({
        /**
         * get data
         */
        get: () => {
            let _checkList = _.cloneDeep(_checkList);
            let errors = [];
            _checkList.forEach(group => {
                if (CommonFunction.isEmpty(group.name)) {
                    errors.push(t("task.todo.error.group.name.empty"));
                }
                group.checkItems.forEach(item => {
                    if (CommonFunction.isEmpty(item.name)) {
                        errors.push(t("task.todo.error.item.name.empty"));
                    }
                });
            });

            if (errors.length > 0) {
                errors = _.uniq(errors, (e) => e); // remove duplicate errors
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                data: _checkList
            };
        },

        /**
         * set data
         */
        set: (_data) => {
            prepareCheckList(_data);
        }
    }))

    useEffect(() => {
        prepareCheckList([
            {
                "checkGroupId": 2115,
                "name": "Hạng mục việc 1",
                "checkItems": [
                    {
                        "checkItemId": 2116,
                        "name": "123",
                        "participantIds": [],
                        "observerIds": [],
                        "participantUsers": [],
                        "observerUsers": [],
                        "isImportant": false,
                        "isComplete": true
                    },
                    {
                        "checkItemId": 2116,
                        "name": "234",
                        "participantIds": [],
                        "observerIds": [],
                        "participantUsers": [],
                        "observerUsers": [],
                        "isImportant": false,
                        "isComplete": false
                    }
                ]
            }
        ])
    }, [])

    useEffect(() => {
        if (data) {
            prepareCheckList(data);
        }
    }, [data])

    /**
     * prepare checklist
     * @param {*} _data
     */
    const prepareCheckList = (_data) => {
        let _checkList = _.cloneDeep(_data);

        _checkList.forEach(group => {
            group.checkItems = group.checkItems || [];
            group.done = 0;
            group.total = group.checkItems.length;
            group.isComplete = group.isComplete === true ? true : false;
            group.isDeleted = false;
            group.showCheckedItem = true;

            group.checkItems.forEach(item => {
                item.isDeleted = false;
                item.isComplete = item.isComplete === true ? true : false;
                if (item.isComplete) group.done += 1;
            });
        });

        setCheckList(_checkList);
    }

    /**
     * add check list
     */
    const addCheckList = () => {
        let _checkList = _.cloneDeep(checkList);
        _checkList.push({
            checkGroupId: -1 * CommonFunction.getIdNumber(),
            name: "",
            done: 0,
            total: 0,
            checkItems: [
            ]
        })
        setCheckList(_checkList);
    }

    /**
     * add check list item
     */
    const addCheckListItem = (groupIndex) => {
        let _checkList = _.cloneDeep(checkList);
        _checkList[groupIndex].checkItems.push({
            checkItemId: -1 * CommonFunction.getIdNumber(),
            name: "",
            isComplete: false
        });
        _checkList[groupIndex].total += 1;
        setCheckList(_checkList);
    }

    /**
     * update check list group
     */
    const updateCheckListGroup = (index, prop, value) => {
        let _checkList = _.cloneDeep(checkList);
        _checkList[index][prop] = value;
        setCheckList(_checkList);
    }

    /**
     * update check list group
     */
    const updateCheckListItem = (groupIndex, itemIndex, prop, value) => {
        let _checkList = _.cloneDeep(checkList);

        switch (prop) {
            case "isComplete":
                _checkList[groupIndex].done += (value ? 1 : -1);
                break;
            default:
                break;
        }

        _checkList[groupIndex].checkItems[itemIndex][prop] = value;

        setCheckList(_checkList);
    }

    /**
     * set actions event after sort
     */
    const afterSortEvents = (e, sortable, store, groupIndex) => {
        let oldIndex = e.oldIndex, newIndex = e.newIndex;
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            let _checkList = _.cloneDeep(checkList);

            // move item in array
            CommonFunction.arrayMove(_checkList[groupIndex].checkItems, oldIndex, newIndex);

            // set state
            setCheckList(_checkList);
        }
    }

    /**
     * delete group
     */
    const deleteGroup = () => {
        if (refMenuImpactItem.current
            && !CommonFunction.isEmpty(refMenuImpactItem.current.groupIndex)
            && CommonFunction.isEmpty(refMenuImpactItem.current.itemIndex)) {
            let _checkList = _.cloneDeep(checkList);
            _checkList[refMenuImpactItem.current.groupIndex].isDeleted = true;
            setCheckList(_checkList);
        }
    }

    /**
     * delete group
     */
    const deleteItem = () => {
        if (refMenuImpactItem.current
            && !CommonFunction.isEmpty(refMenuImpactItem.current.groupIndex)
            && !CommonFunction.isEmpty(refMenuImpactItem.current.itemIndex)) {
            let _checkList = _.cloneDeep(checkList);
            _checkList[refMenuImpactItem.current.groupIndex].checkItems[refMenuImpactItem.current.itemIndex].isDeleted = true;
            _checkList[refMenuImpactItem.current.groupIndex].total -= 1;
            setCheckList(_checkList);
        }
    }

    return (<div className="task-todo-container">
        <Menu
            popup
            ref={refGroupMenu}
            id="group_popup_menu"
            model={[{
                label: t('common.delete'),
                icon: 'bx bx-trash',
                command: () => { deleteGroup() }
            }]}
        />
        <Menu
            popup
            ref={refItemMenu}
            id="item_popup_menu"
            model={[{
                label: t('common.delete'),
                icon: 'bx bx-trash',
                command: () => { deleteItem() }
            }]}
        />
        {checkList && Array.isArray(checkList) && checkList.length > 0 &&
            <div className={`task-todo ${className || ""}`}>
                <ReactSortable
                    animation="500"
                    list={checkList}
                    setList={setCheckList}
                    className="w-full">
                    {checkList.map((checkListGroup, groupIndex) => checkListGroup.isDeleted === true ? <></> : (
                        <React.Fragment key={groupIndex}>
                            <XLayout_Box className="task-todo-box">
                                <Panel
                                    className="task-todo-group"
                                    collapsed={checkListGroup.done > 0}
                                    toggleable
                                    headerTemplate={(options) => {
                                        const toggleIcon = options.collapsed ? 'bx bx-caret-right' : 'bx bx-caret-down';
                                        return (
                                            <div className="task-todo-header">
                                                <div className="flex align-items-center width-fit-content">
                                                    <i className={`${toggleIcon} fs-18 text-grey-7 mr-1 pointer`} onClick={options.onTogglerClick}></i>
                                                    <i className={classNames({
                                                        'bx fs-20 task-todo-check': true,
                                                        'bx-circle text-grey-7': checkListGroup.isComplete !== true,
                                                        'bxs-check-circle text-green-7 task-todo-done-animation': checkListGroup.isComplete === true
                                                    })} onClick={(e) => updateCheckListGroup(groupIndex, "isComplete", !checkListGroup.isComplete)}></i>
                                                    <div className={classNames({ "task-todo-input-wrapper": true, "completed": checkListGroup.isComplete === true })}>
                                                        <InputText
                                                            className="dense task-todo-input"
                                                            placeholder={t("task.todo.group.empty")}
                                                            value={checkListGroup.name}
                                                            onChange={(e) => updateCheckListGroup(groupIndex, "name", e.target.value)} />
                                                        <div className="task-todo-input-fake-text">{checkListGroup.name || t("task.todo.group.empty")}</div>
                                                    </div>
                                                    <div className="text-grey task-todo-group-count ml-1 pointer" onClick={options.onTogglerClick}>{checkListGroup.done}/{checkListGroup.total}</div>
                                                </div>
                                                <div className="task-todo-action">
                                                    {/* toggle show checked item */}
                                                    {checkListGroup.done > 0 &&
                                                        <Button
                                                            icon={checkListGroup.showCheckedItem === true ? 'bx bx-hide' : 'bx bx-show-alt'}
                                                            className="p-button-rounded p-button-text text-grey-7"
                                                            onClick={(e) => updateCheckListGroup(groupIndex, "showCheckedItem", !checkListGroup.showCheckedItem)}
                                                            tooltip={checkListGroup.showCheckedItem === true ? t("task.todo.action.hide-checked-item") : t("task.todo.action.show-checked-item")}
                                                            tooltipOptions={{ position: "bottom" }}
                                                        />
                                                    }
                                                    {/* open menu item */}
                                                    <Button
                                                        icon="bx bx-dots-vertical-rounded"
                                                        className="p-button-rounded p-button-text text-grey-7"
                                                        onClick={(e) => {
                                                            refMenuImpactItem.current = { groupIndex: groupIndex };
                                                            refGroupMenu.current.toggle(e);
                                                        }}
                                                        aria-controls="group_popup_menu"
                                                        aria-haspopup
                                                    />
                                                </div>

                                            </div>)
                                    }} >
                                    {checkListGroup.checkItems &&
                                        <ReactSortable
                                            animation="500"
                                            list={checkListGroup.checkItems}
                                            setList={() => { }}
                                            onEnd={(evt, sortable, store) => {
                                                afterSortEvents(evt, sortable, store, groupIndex);
                                            }}
                                            className="w-full">
                                            {checkListGroup.checkItems.map((checkListItem, itemIndex) =>
                                                (
                                                    checkListItem.isDeleted === true || // hide deleted item
                                                    (checkListGroup.showCheckedItem !== true && checkListItem.isComplete === true) // hide checked item if not show checked item
                                                )
                                                    ? <></> : (
                                                        <div className="task-todo-item" key={itemIndex}>
                                                            <div className="task-todo-item-info">
                                                                <i className={classNames({
                                                                    'bx fs-20 task-todo-check': true,
                                                                    'bx-circle text-grey-7': checkListItem.isComplete !== true,
                                                                    'bxs-check-circle text-green-7 task-todo-done-animation': checkListItem.isComplete === true
                                                                })} onClick={(e) => updateCheckListItem(groupIndex, itemIndex, "isComplete", !checkListItem.isComplete)}></i>
                                                                <div className={classNames({ "task-todo-input-wrapper": true, "completed": checkListItem.isComplete === true })}>
                                                                    <InputText className="dense task-todo-input for-item" placeholder={t("task.todo.item.empty")} value={checkListItem.name} onChange={(e) => updateCheckListItem(groupIndex, itemIndex, "name", e.target.value)} />
                                                                    {/* fake text for auto size input */}
                                                                    {checkListItem.name || t("task.todo.item.empty")}
                                                                </div>
                                                            </div>
                                                            <div className="task-todo-action">
                                                                {/* deadline */}
                                                                <Button
                                                                    icon="bx bx-dots-vertical-rounded"
                                                                    className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                                    onClick={(e) => {
                                                                        refMenuImpactItem.current = { groupIndex: groupIndex, itemIndex: itemIndex };
                                                                        refItemMenu.current.toggle(e);
                                                                    }}
                                                                    aria-controls="item_popup_menu"
                                                                    aria-haspopup
                                                                />
                                                                <Calendar className="calendar-icon-only" showIcon style={{ width: 30 }} />
                                                                {/* assign */}
                                                                {/* menu */}
                                                                <Button
                                                                    icon="bx bx-dots-vertical-rounded"
                                                                    className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                                    onClick={(e) => {
                                                                        refMenuImpactItem.current = { groupIndex: groupIndex, itemIndex: itemIndex };
                                                                        refItemMenu.current.toggle(e);
                                                                    }}
                                                                    aria-controls="item_popup_menu"
                                                                    aria-haspopup
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                        </ReactSortable>
                                    }
                                    <div className="task-todo-add-link-button for-item" onClick={() => addCheckListItem(groupIndex)}>{t("task.todo.item.add")}</div>
                                </Panel>
                            </XLayout_Box>
                        </React.Fragment>
                    ))}
                </ReactSortable>
            </div>
        }
        <div className="task-todo-add-link-button" onClick={addCheckList}>{t("task.todo.add")}</div>
    </div>);
}

Todo = forwardRef(Todo);

export default Todo;

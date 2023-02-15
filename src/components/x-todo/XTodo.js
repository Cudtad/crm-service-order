import { XLayout, XLayout_Bottom, XLayout_Box, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './scss/XTodo.scss'

import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import _ from 'lodash';
import { InputText } from 'primereact/inputtext';
import { ReactSortable } from "react-sortablejs";
import CommonFunction from '@lib/common';
import classNames from 'classnames';
import { Menu } from 'primereact/menu';
import { Calendar } from 'primereact/calendar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dropdown } from 'primereact/dropdown';

/**
 * build to do list
 *      data : [{
 *                  id: any,
 *                  name: string,
 *                  completed: boolean - default false,
 *                  showChecked: boolean - default true,
 *                  items: [{
 *                      id: id,
 *                      name: name,
 *                      content: content as react content,
 *                      completed: boolean - default false,
 *                      deadline: date,
 *                      assign: [{
 *                          avatar: image url,
 *                          id: user id,
 *                          name: user name or description for tooltip
 *                      }]
 *                  }]
 *             }],
 *      allowDeadline: boolean - default false,
 *      allowDeadlineTime: boolean - default false,
 *      allowAssign: boolean - default false,
 *      allowAddGroup, allowEditGroup, allowDeleteGroup: boolean - default false,
 *      allowAddItem, allowEditItem, allowDeleteItem: boolean - default false,
 *      itemTemplate: (item) => (<div>{item.xyz}</div>) - item template, default null
 *      allowChangeItemName: boolean - default true
 *      onChange: (event, groupIndex, itemIndex, newValue, oldValue, newTodoObject, oldTodoObject, description) => {} - function will be trigger when data changed
 *      assignQueryFn: async ({ page: page, size: size, search: search }) => {return [{id: id, fullName: fullName, avatar: avatar image url}]} - async paging function to get assign data
 *
 *      imperative handle function:
 *          get(): return current todo array
 *          set(data): set current todo array with data
 *
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XTodo(props, ref) {
    const t = CommonFunction.t;
    const {
        data, className,
        allowDeadline, allowDeadlineTime, allowAssign, allowAddGroup, allowAddItem, allowEditGroup, allowEditItem, allowDeleteGroup, allowDeleteItem,
        onChange, assignQueryFn, itemTemplate
    } = props;
    const [checkList, setCheckList] = useState(null);
    const refGroupMenu = useRef(null);
    const refGroupMenuItem = useRef(null);
    const refItemMenu = useRef(null);
    const refMenuImpactItem = useRef(null);
    const refDeadlinePanel = useRef(null);
    const refAssignPanel = useRef(null);
    const handleOnChange = useRef(onChange && typeof onChange === "function");
    const [deadLineSelected, setDeadlineSelected] = useState(null);
    const refMustApplyDeadline = useRef(false); // flag for must apply deadline value
    const assignLoadingState = useRef({
        data: [],
        count: 0,
        total: 0,
        query: "",
        page: 0,
        loading: false
    });
    const [assignSuggetions, setAssignSuggestions] = useState([]);
    const [selectedAssign, setSelectedAssign] = useState([]);
    const assignSuggetionsPanel = "x-todo-assign-suggetions-panel";
    const pageSize = 25;
    const blankImage = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

    const stateEnum = {
        create: "create",
        update: "update",
        delete: "delete"
    }

    useImperativeHandle(ref, () => ({
        /**
         * get data
         * @returns
         */
        get: () => {
            let _checkList = _.cloneDeep(checkList);
            if(!_checkList){
                return {
                    valid: true,
                    errors: null,
                    data: []
                };
            }
            let errors = [];
            _checkList.forEach((group, groupIndex) => {
                // set position
                group.position = groupIndex;

                if (CommonFunction.isEmpty(group.name)) {
                    errors.push(t("task.todo.error.group.name.empty"));
                }
                group.items.forEach((item, itemIndex) => {
                    // set item position
                    item.position = itemIndex;

                    // preapre involves
                    item.involves = [];
                    if (item.assign && item.assign.length) {
                        item.involves = [{
                            role: "PARTICIPANT",
                            involveType: "user",
                            involveIds: item.assign.map(m => m.id)
                        }]
                    }

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
            group.items = group.items || [];
            group.done = 0;
            group.total = group.items.length;
            group.completed = group.completed === true ? true : false;
            group.state = "";
            group.showChecked = true;

            group.items.forEach(item => {
                item.state = "";
                item.completed = item.completed === true ? true : false;
                if (item.completed) group.done += 1;
                item.assign = [];
                if (item.involves && item.involves.length > 0 && item.involves[0].involveIds && item.involves[0].involveIds.length) {
                    item.assign = [...item.involves[0].involveIds];
                    item.assign.forEach(el => {
                        el.avatar = CommonFunction.getImageUrl(el.avatar, el.fullName);
                    });
                }
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
            id: null,
            type: "group",
            parentId: 0,
            name: "",
            important: false,
            completed: false,
            status: 1,
            done: 0,
            total: 0,
            items: [
            ]
        })
        setCheckList(_checkList);
        debugger
    }

    /**
     * add check list item
     */
    const addCheckListItem = (groupIndex) => {
        let _checkList = _.cloneDeep(checkList);
        _checkList[groupIndex].items.push({
            id: null,
            type: "item",
            name: "",
            deadline: null,
            parentId: _checkList[groupIndex].id,
            important: false,
            completed: false,
            status: 1,
            involves: []
        });

        _checkList[groupIndex].total += 1;
        setCheckList(_checkList);
        debugger
    }

    /**
     * update check list group
     */
    const updateCheckListGroup = (index, prop, value) => {
        let _checkList = _.cloneDeep(checkList);
        _checkList[index][prop] = value;
        _checkList[index].state = stateEnum.update;
        setCheckList(_checkList);
    }

    /**
     * update check list group
     */
    const updateCheckListItem = (groupIndex, itemIndex, prop, value) => {
        let _checkList = _.cloneDeep(checkList);

        switch (prop) {
            case "completed":
                _checkList[groupIndex].done += (value ? 1 : -1);
                break;
            default:
                break;
        }

        _checkList[groupIndex].items[itemIndex][prop] = value;
        _checkList[groupIndex].items[itemIndex].state = stateEnum.update;

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
            CommonFunction.arrayMove(_checkList[groupIndex].items, oldIndex, newIndex);

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
            _checkList[refMenuImpactItem.current.groupIndex].state = stateEnum.delete;
            _checkList[refMenuImpactItem.current.groupIndex].status = 0;
            setCheckList(_checkList);
            refGroupMenu.current.hide();
        }
    }

    /**
     * delete group
     */
    const deleteItem = () => {
        if (refMenuImpactItem.current
            && !CommonFunction.isEmpty(refMenuImpactItem.current.groupIndex)
            && !CommonFunction.isEmpty(refMenuImpactItem.current.itemIndex)) {

            let _checkList = _.cloneDeep(checkList),
                groupIndex = refMenuImpactItem.current.groupIndex,
                itemIndex = refMenuImpactItem.current.itemIndex;

            _checkList[groupIndex].items[itemIndex].state = stateEnum.delete;
            _checkList[groupIndex].items[itemIndex].status = 0;
            _checkList[groupIndex].total -= 1;
            _checkList[groupIndex].state = stateEnum.update;

            if (handleOnChange.current) {
                handleChanges(
                    "delete item", // event
                    groupIndex, // group index
                    itemIndex, // item index
                    null, // new value
                    _.cloneDeep(checkList[groupIndex].items[itemIndex]), // old value
                    _.cloneDeep(_checkList), // new todo object
                    _.cloneDeep(checkList), // old todo object

                )
            }

            setCheckList(_checkList);
            refItemMenu.current.hide();
        }
    }

    /**
     * handle changes and notify to outside
     */
    const handleChanges = (event, groupIndex, itemIndex, newValue, oldValue, newTodoObject, oldTodoObject, description) => {
        if (onChange && typeof onChange === "function") {
            onChange(event, groupIndex, itemIndex, newValue, oldValue, newTodoObject, oldTodoObject, description);
        }
    }

    /**
     * apply deadline
     */
    const applyDeadline = () => {
        if (refMustApplyDeadline.current
            && refMenuImpactItem.current
            && !CommonFunction.isEmpty(refMenuImpactItem.current.groupIndex)
            && !CommonFunction.isEmpty(refMenuImpactItem.current.itemIndex)) {
            updateCheckListItem(refMenuImpactItem.current.groupIndex, refMenuImpactItem.current.itemIndex, "deadline", deadLineSelected);
        }

        refMustApplyDeadline.current = false;
    }

    /**
     * on dead line click
     * @param {*} e
     */
    const onDeadlineClick = (e, groupIndex, itemIndex, checkListItem) => {
        refMenuImpactItem.current = { groupIndex: groupIndex, itemIndex: itemIndex };
        setDeadlineSelected(checkListItem.deadline ? new Date(checkListItem.deadline) : new Date());
        refDeadlinePanel.current.toggle(e);
    }

    /**
     * on assign click
     */
    const onAssignClick = (e, groupIndex, itemIndex, checkListItem) => {
        refMenuImpactItem.current = { groupIndex: groupIndex, itemIndex: itemIndex };
        setSelectedAssign(checkListItem.assign || []);
        refAssignPanel.current.toggle(e);
    }

    /**
     * search assign
     */
    const queryAssign = (query) => {
        if (assignQueryFn && typeof assignQueryFn === "function" && !CommonFunction.isEmpty(query)) {
            assignQueryFn({ page: 0, size: pageSize, search: query }).then(res => {
                if (res) {
                    // apply loading state
                    let _assignloadingState = {
                        data: res.data,
                        count: res.data.length,
                        total: res.total,
                        query: query,
                        page: 0,
                        loading: false
                    }

                    // apply data
                    assignLoadingState.current = _assignloadingState;
                    setAssignSuggestions(res.data);

                    // check if data has more, apply scroll event to load
                    setTimeout(() => {
                        let els = document.getElementsByClassName(assignSuggetionsPanel); // find element
                        if (els && els.length > 0) {
                            let el = els[0];
                            if (_assignloadingState.count < _assignloadingState.total) {
                                el.addEventListener("scroll", loadMoreAssignData);
                            } else {
                                el.removeEventListener("scroll", loadMoreAssignData);
                            }
                        }
                    }, 100);
                } else {
                    setAssignSuggestions([]);
                    assignLoadingState.current = {
                        count: 0,
                        total: 0
                    }
                }
            })
        } else {
            setAssignSuggestions([]);
        }
    }

    /**
     * load more data
     */
    const loadMoreAssignData = (e) => {
        // check if element scroll to the end
        CommonFunction.debounce(50, () => {
            let el = e.target;

            if (el.scrollTop + el.clientHeight > el.scrollHeight - 30) {
                if (!assignLoadingState.current.loading) {
                    assignLoadingState.current.loading = true;
                    let _assignLoadingState = _.cloneDeep(assignLoadingState.current);
                    assignQueryFn({ page: _assignLoadingState.page + 1, size: pageSize, search: _assignLoadingState.query }).then(res => {
                        if (res) {
                            if (res.data && res.data.length > 0) {
                                // append more data
                                _assignLoadingState.data = [
                                    ..._assignLoadingState.data,
                                    ...res.data
                                ];
                            }

                            // set lazy param
                            _assignLoadingState.total = res.total;
                            _assignLoadingState.count = _assignLoadingState.data.length;
                            _assignLoadingState.page = res.page;

                            // set suggesstions
                            setAssignSuggestions(_assignLoadingState.data);
                        }

                        // set loading false
                        _assignLoadingState.loading = false;
                        assignLoadingState.current = _assignLoadingState;

                        // remove event if all data loaded
                        if (_assignLoadingState.count >= _assignLoadingState.total) {
                            let els = document.getElementsByClassName(assignSuggetionsPanel); // find element
                            if (els && els.length > 0) {
                                let el = els[0];
                                el.removeEventListener("scroll", loadMoreAssignData);
                            }
                        }

                    });
                }
            }
        })
    }

    /**
     * append assign user
     * @param {*} user
     */
    const appendAssignUser = (user) => {
        let _assigned = selectedAssign.find(f => f.id === user.id);
        if (!_assigned) {
            setSelectedAssign([...selectedAssign, user]);
        }
    }

    /**
     * remove assign user
     * @param {*} index
     */
    const removeAssignUser = (index) => {
        setSelectedAssign([
            ...selectedAssign.slice(0, index),
            ...selectedAssign.slice(index + 1)
        ])
    }

    const applyAssign = (selected) => {
        if (refMenuImpactItem.current
            && !CommonFunction.isEmpty(refMenuImpactItem.current.groupIndex)
            && !CommonFunction.isEmpty(refMenuImpactItem.current.itemIndex)) {
            updateCheckListItem(refMenuImpactItem.current.groupIndex, refMenuImpactItem.current.itemIndex, "assign", selected && selected.length > 0 ? selected : null);
        }
    }

    return (<div className="x-todo-container">
        {/* menu for groups */}
        <OverlayPanel ref={refGroupMenu} className="x-menu">
            {allowDeleteGroup &&
                <div className="x-menu-button" onClick={() => deleteGroup()}>
                    <i className='bx bx-trash'></i>
                    <span>{t('common.delete')}</span>
                </div>
            }
        </OverlayPanel>

        {/* menu for items */}
        <OverlayPanel ref={refItemMenu} className="x-menu">
            {allowDeleteItem &&
                <div className="x-menu-button" onClick={() => deleteItem()}>
                    <i className='bx bx-trash'></i>
                    <span>{t('common.delete')}</span>
                </div>
            }
        </OverlayPanel>

        {/* deadline panel */}
        {allowDeadline &&
            <OverlayPanel ref={refDeadlinePanel} className="x-todo-deadline-panel" onHide={applyDeadline}>
                <Calendar
                    id="x-todo-deadline-calendar"
                    inline
                    showTime
                    value={new Date(deadLineSelected)}
                    locale={CommonFunction.getCurrentLanguage()}
                    onChange={(e) => {
                        refMustApplyDeadline.current = true;
                        setDeadlineSelected(e.value);
                    }}
                    showButtonBar
                    monthNavigator
                    monthNavigatorTemplate={(e) => (
                        <Dropdown
                            className="x-todo-calendar-month-navigator"
                            value={e.value}
                            filter
                            options={e.options}
                            onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1 }} />
                    )}
                    yearNavigator
                    yearNavigatorTemplate={(e) => (
                        <Dropdown
                            className="x-todo-calendar-year-navigator"
                            value={e.value}
                            filter
                            options={e.options}
                            onChange={(event) => e.onChange(event.originalEvent, event.value)}
                            style={{ lineHeight: 1 }}
                        />
                    )}
                    yearRange={"1970:3000"}
                />
            </OverlayPanel>
        }

        {/* deadline panel */}
        {allowAssign &&
            <OverlayPanel ref={refAssignPanel} className="x-todo-assign-panel"
                onShow={() => {
                    // focus search text box
                    let el = document.getElementById("x-todo-assign-search-input-text");
                    if (el) el.focus();
                }}
                onHide={() => {
                    applyAssign(_.cloneDeep(selectedAssign));
                    setAssignSuggestions([]);
                    setSelectedAssign([])
                    let el = document.getElementById("x-todo-assign-search-input-text");
                    if (el) el.value = "";
                }}>
                <XLayout>
                    <XLayout_Top>
                        <InputText
                            id="x-todo-assign-search-input-text"
                            placeholder={t("task.todo.assign.search")}
                            className="x-todo-assign-search"
                            onChange={(e) => CommonFunction.debounce((null), () => { queryAssign(e.target.value); })}
                        />
                        <XLayout_Title>{t("task.todo.assign.search-result")}</XLayout_Title>
                    </XLayout_Top>
                    <XLayout_Center id={assignSuggetionsPanel} className="overflow-hidden">
                        <XLayout_Box className="x-todo-assign-suggesstion-box">
                            {assignSuggetions && assignSuggetions.length > 0 && assignSuggetions.map((assignSuggetion, index) => (
                                <div key={index} className="x-todo-assign-user">
                                    <div className="x-todo-assign-user-info">
                                        {assignSuggetion.avatar && <img className="x-todo-assign-user-avatar" src={assignSuggetion.avatar}></img>}
                                        <span className="pointer" onClick={() => appendAssignUser(assignSuggetion)}>{assignSuggetion.fullName}</span>
                                    </div>
                                    <i className="bx bx-plus pointer fs-20 text-green" onClick={() => appendAssignUser(assignSuggetion)} />
                                </div>
                            ))}
                        </XLayout_Box>
                    </XLayout_Center>
                    {selectedAssign && selectedAssign.length > 0 &&
                        <XLayout_Bottom className="x-todo-assign-selected-panel" className="overflow-hidden">
                            <XLayout_Title>{t("task.todo.assign.selected")}</XLayout_Title>
                            <XLayout_Box className="x-todo-assign-selected-box">
                                {selectedAssign.map((selectedUser, index) => (
                                    <div key={index} className="x-todo-assign-user">
                                        <div className="x-todo-assign-user-info">
                                            {selectedUser.avatar && <img className="x-todo-assign-user-avatar" src={selectedUser.avatar}></img>}
                                            <span className="pointer" onClick={() => removeAssignUser(index)}>{selectedUser.fullName}</span>
                                        </div>
                                        <i className="bx bx-x pointer fs-20 text-red" onClick={() => removeAssignUser(index)} />
                                    </div>
                                ))}
                            </XLayout_Box>
                        </XLayout_Bottom>
                    }
                </XLayout>
            </OverlayPanel>
        }

        {
            checkList && Array.isArray(checkList) && checkList.length > 0 &&
            <div className={`x-todo ${className || ""}`}>
                <ReactSortable
                    animation="500"
                    list={checkList}
                    setList={setCheckList}
                    className="w-full">
                    {checkList.map((checkListGroup, groupIndex) => checkListGroup.state === stateEnum.delete ? <></> : (
                        <React.Fragment key={groupIndex}>
                            <XLayout_Box className="x-todo-box">
                                <Panel
                                    className="x-todo-group"
                                    collapsed={checkListGroup.done > 0}
                                    toggleable
                                    headerTemplate={(options) => {
                                        const toggleIcon = options.collapsed ? 'bx bx-caret-right' : 'bx bx-caret-down';
                                        return (
                                            <div className="x-todo-header">
                                                <div className="flex align-items-center width-fit-content">
                                                    <i className={`${toggleIcon} fs-18 text-grey-7 mr-1 pointer`} onClick={options.onTogglerClick}></i>
                                                    <i className={classNames({
                                                        'bx fs-20 x-todo-check': true,
                                                        'bx-circle text-grey-7': checkListGroup.completed !== true,
                                                        'bxs-check-circle text-green-7 x-todo-done-animation': checkListGroup.completed === true
                                                    })} onClick={(e) => updateCheckListGroup(groupIndex, "completed", !checkListGroup.completed)}></i>
                                                    <div className={classNames({ "x-todo-input-wrapper": true, "completed": checkListGroup.completed === true })}>
                                                        <InputText
                                                            className="dense x-todo-input"
                                                            placeholder={t("task.todo.group.empty")}
                                                            value={checkListGroup.name}
                                                            onChange={(e) => updateCheckListGroup(groupIndex, "name", e.target.value)} />
                                                        {checkListGroup.name || t("task.todo.group.empty")}
                                                    </div>
                                                    <div className="text-grey x-todo-group-count ml-1 pointer" onClick={options.onTogglerClick}>{checkListGroup.done}/{checkListGroup.total}</div>
                                                </div>
                                                <div className="x-todo-action">
                                                    {/* toggle show checked item */}
                                                    {checkListGroup.done > 0 &&
                                                        <Button
                                                            icon={checkListGroup.showChecked === true ? 'bx bx-hide' : 'bx bx-show-alt'}
                                                            className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                            onClick={(e) => updateCheckListGroup(groupIndex, "showChecked", !checkListGroup.showChecked)}
                                                            tooltip={checkListGroup.showChecked === true ? t("task.todo.action.hide-checked-item") : t("task.todo.action.show-checked-item")}
                                                            tooltipOptions={{ position: "bottom" }}
                                                        />
                                                    }
                                                    {/* open menu item */}
                                                    {allowEditGroup &&
                                                        <Button
                                                            icon="bx bx-dots-vertical-rounded"
                                                            className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                            onClick={(e) => {
                                                                refMenuImpactItem.current = { groupIndex: groupIndex };
                                                                refGroupMenu.current.toggle(e);
                                                            }}
                                                        />
                                                    }
                                                </div>

                                            </div>)
                                    }} >
                                    {checkListGroup.items &&
                                        <ReactSortable
                                            animation="500"
                                            list={checkListGroup.items}
                                            setList={() => { }}
                                            onEnd={(evt, sortable, store) => {
                                                afterSortEvents(evt, sortable, store, groupIndex);
                                            }}
                                            className="w-full">
                                            {checkListGroup.items.map((checkListItem, itemIndex) =>
                                                (
                                                    checkListItem.state === stateEnum.delete || // hide deleted item
                                                    (checkListGroup.showChecked !== true && checkListItem.completed === true) // hide checked item if not show checked item
                                                )
                                                    ? <React.Fragment key={itemIndex}></React.Fragment> : (
                                                        <div className="x-todo-item" key={itemIndex}>



                                                            <div className="x-todo-item-info">
                                                                <i className={classNames({
                                                                    'bx fs-20 x-todo-check': true,
                                                                    'bx-circle text-grey-7': checkListItem.completed !== true,
                                                                    'bxs-check-circle text-green-7 x-todo-done-animation': checkListItem.completed === true
                                                                })} onClick={(e) => updateCheckListItem(groupIndex, itemIndex, "completed", !checkListItem.completed)}></i>
                                                                {/* custom item tempalte */}
                                                                {itemTemplate && typeof itemTemplate === "function" && itemTemplate(checkListItem)}
                                                                {/* default item template */}
                                                                {!(itemTemplate && typeof itemTemplate === "function") &&
                                                                    <div className={classNames({ "x-todo-input-wrapper": true, "completed": checkListItem.completed === true })}>
                                                                        <InputText className="dense x-todo-input for-item" placeholder={t("task.todo.item.empty")} value={checkListItem.name} onChange={(e) => updateCheckListItem(groupIndex, itemIndex, "name", e.target.value)} />
                                                                        {/* fake text for auto size input */}
                                                                        {checkListItem.name || t("task.todo.item.empty")}
                                                                    </div>
                                                                }

                                                            </div>
                                                            <div className="x-todo-action">

                                                                {/* assign */}
                                                                {allowAssign && <>
                                                                    {checkListItem.assign && checkListItem.assign.length > 0 &&
                                                                        <div
                                                                            className="x-todo-assign-assigned"
                                                                            onClick={(e) => onAssignClick(e, groupIndex, itemIndex, checkListItem)}
                                                                            title={t("task.todo.button.assign")}
                                                                        >
                                                                            {checkListItem.assign.map((assign, assignIndex) => (
                                                                                <img key={assignIndex} src={assign.avatar || blankImage} title={assign.fullName}></img>
                                                                            ))}
                                                                        </div>
                                                                    }

                                                                    {!(checkListItem.assign && checkListItem.assign.length > 0) &&
                                                                        <Button
                                                                            icon="bx bx-user"
                                                                            className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                                            onClick={(e) => onAssignClick(e, groupIndex, itemIndex, checkListItem)}
                                                                            tooltip={t("task.todo.button.assign")}
                                                                            tooltipOptions={{ position: "bottom" }}
                                                                        />
                                                                    }
                                                                </>}

                                                                {/* deadline */}
                                                                {allowDeadline && <>
                                                                    <Button
                                                                        icon="bx bx-time-five"
                                                                        className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                                        onClick={(e) => onDeadlineClick(e, groupIndex, itemIndex, checkListItem)}
                                                                        tooltip={t("task.todo.button.deadline")}
                                                                        tooltipOptions={{ position: "bottom" }}
                                                                    />
                                                                    {checkListItem.deadline &&
                                                                        <span className="pointer x-todo-deadline-text" onClick={(e) => onDeadlineClick(e, groupIndex, itemIndex, checkListItem)}>
                                                                            {allowDeadlineTime ? CommonFunction.formatDateTime(checkListItem.deadline) : CommonFunction.formatDate(checkListItem.deadline)}
                                                                        </span>
                                                                    }
                                                                </>}

                                                                {/* menu */}
                                                                {allowDeleteItem &&
                                                                    <Button
                                                                        icon="bx bx-dots-vertical-rounded"
                                                                        className="p-button-rounded p-button-text text-grey-7 ml-1"
                                                                        onClick={(e) => {
                                                                            refMenuImpactItem.current = { groupIndex: groupIndex, itemIndex: itemIndex };
                                                                            refItemMenu.current.toggle(e);
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                        </div>
                                                    ))}
                                        </ReactSortable>
                                    }
                                    {allowAddItem &&
                                        <div className="x-todo-add-link-button for-item" onClick={() => addCheckListItem(groupIndex)}>{t("task.todo.item.add")}</div>
                                    }
                                </Panel>
                            </XLayout_Box>
                        </React.Fragment>
                    ))}
                </ReactSortable>
            </div>
        }
        {
            allowAddGroup &&
            <div className="x-todo-add-link-button" onClick={addCheckList}>{t("task.todo.add")}</div>
        }
    </div>);
}

XTodo = forwardRef(XTodo);

export default XTodo;

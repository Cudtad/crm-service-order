import CommonFunction from '@lib/common';
                    import React, {useEffect, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import _ from "lodash";
import './scss/TaskCheckList.scss'
import {UserAC} from "../../../components/autocomplete/UserAC";

import {Checkbox} from "primereact/checkbox";

export const TaskCheckList = (props) => {
    const t = CommonFunction.t;
    const [items, setItems] = useState(props.value ? props.value : []);
    const [checkList, setCheckList] = useState(props.checkList ? props.checkList : "");
    const [checkItemRowIndex, setCheckItemRowIndex] = useState(0);
    const postRef = useRef();
    const m = {
        ADD: 'ADD',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    }

    let emptyCheckItem = {
        checkItemRowIndex: 0,
        checkItemId: 0,
        name: "",
        isImportant: false,
        isComplete: false,
        participantIds: [],
        participantUsers: [],
        observerIds: [],
        observerUsers: [],
        action: "ADD"
    }

    const dataTableFuncMap = {
        items: setItems
    };

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        let _checkItemRowIndex = checkItemRowIndex;
        items.map((_item) => {
            _checkItemRowIndex = _checkItemRowIndex + 1;
            _item.checkItemRowIndex = _checkItemRowIndex;
            if (_item.checkItemId === 0) {
                _item.action = m.ADD;
            } else {
                _item.action = m.UPDATE;
            }
        })
        setCheckItemRowIndex(_checkItemRowIndex);
    }
    const onRowEditInit = (event) => {
        console.log('onRowEditInit', event)
    };

    const onRowEditCancel = (event) => {
        setItems([...items].filter(item => item !== items[event.index]));
    };

    const applyItemChange = (_item, prop, val) => {
        let _items = [...items]

        if (_item) {
            let _index = _item.checkItemRowIndex;

            switch (prop) {
                case "isComplete":
                    _.find(_items, {'checkItemRowIndex': _index}).isComplete = val;
                    break;
                case "participantUsers":
                    _.find(_items, {'checkItemRowIndex': _index}).participantIds = val.map(m => m.id);
                    _.find(_items, {'checkItemRowIndex': _index}).participantUsers = val;
                    break;
                case "name":
                    _.find(_items, {'checkItemRowIndex': _index}).name = val;
                    break;
                default:
                    break;
            }
            setItems(_items);
        } else {
            console.log('gooooo', prop)
            setCheckList(prevState => ({...prevState, name: val}));
        }

        let _checkList = checkList;
        _checkList.checkItems = _items;

        props.onChange(_checkList)
    }


    const changeMentionValue = (editorState, _item, _index, jsonValue, textValue) => {
        let _items = [...items]
        if (_item) {
            let _index = _item.checkItemRowIndex;
            // _.find(_items, {'checkItemRowIndex': _index}).name = _.find(_items, {'checkItemRowIndex': _index}).name + newValue;
            _.find(_items, {'checkItemRowIndex': _index}).name = JSON.stringify(jsonValue);
        }
        setItems(_items);
        let _checkList = checkList;
        _checkList.checkItems = _items;
        console.log(JSON.stringify(jsonValue));
        props.onChange(_checkList)
    }

    const inputTextEditor = (prop, index) => {
        return (<>
                {/*<DraftEditor*/}
                {/*    id={index}*/}
                {/*    object={prop}*/}
                {/*    value={prop.name}*/}
                {/*    // initValue={prop.name}*/}
                {/*    onChangeValue = {changeMentionValue}*/}
                {/*/>*/}
                <InputText id={"name" + index} value={prop.name}
                           disabled={props.disabled} 
                           onChange={(e) => applyItemChange(prop, 'name', e.target.value)}/>
            </>
        );
    };

    const userParticipantAC = (prop) => {
        return (
            <UserAC id="participantUsers" value={prop.participantUsers}
                    className="input-list-users" disabled={props.disabled}
                    onChange={(e) => applyItemChange(prop, 'participantUsers', e.value)}/>
        );
    };

    const addRow = (e) => {
        // Generate new key of new item
        let _emptyCheckItem = emptyCheckItem;
        setCheckItemRowIndex(prevState => (prevState + 1));
        _emptyCheckItem.checkItemRowIndex = checkItemRowIndex + 1;

        setItems([...items, _emptyCheckItem]);
    }

    const deleteRow = (_removedItem) => {
        let _items = [...items];
        let _index = _removedItem.checkItemRowIndex;

        if (_removedItem.checkItemId != 0) {
            _.find(_items, {'checkItemRowIndex': _index}).action = m.DELETE;
        } else {
            _.remove(_items, function (obj) {
                return obj.checkItemRowIndex === _removedItem.checkItemRowIndex;
            })
        }

        let _checkList = checkList;
        _checkList.checkItems = _items;

        setItems(_items);

        // Pass new value into Parent Component through Event onChange
        props.onChange(_checkList)
    }

    return (
        <React.Fragment key={checkList.checkListRowIndex}>
            <div className={`grid task-check-list toogle-${props.disabled}`}>
                <div className="col-12 pt-3">
                    <InputText className="check-group-input" type="text" style={{width: '300px', fontsize: 'bold'}} value={checkList.name} onChange={(e) => applyItemChange(null, 'checkListName', e.target.value)}/>
                </div>
                <div className="col-12">
                    {

                        items.map((_item, index) => {
                            if (_item.action && _item.action != m.DELETE)
                                return (
                                    <React.Fragment key={index}>
                                        {/*<InputText value={_item.name} onChange={(e) => applyItemChange(_item, 'name', e.target.value)} />*/}

                                        <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                <Checkbox onChange={(e) => applyItemChange(_item, 'isComplete', e.checked)}
                                          checked={_item.isComplete} disabled={props.disabled}/>
                                          </span>
                                            <span className="p-inputgroup-addon input-list-name">
                                {inputTextEditor(_item, _item.checkItemRowIndex + "-" + _item.checkItemId)}
                                </span>
                                            <span className="p-inputgroup-addon input-list-user">
                                {userParticipantAC(_item)}
                                </span>
                                            <span className="p-inputgroup-addon button-remove">
                                    <Button icon="bx bx-x"
                                            className=" p-button-rounded p-button-danger p-button-text"
                                            disabled={props.disabled}
                                            onClick={(e) => deleteRow(_item)}/>
                                </span>
                                            <span className="p-inputgroup-addon button-add">

                                        <Button icon="bx bx-plus"
                                                className="p-button-rounded p-button-text"
                                                disabled={props.disabled} onClick={addRow}/>

                                </span>
                                        </div>
                                    </React.Fragment>
                                )
                        })
                    }
                </div>
            </div>
            {/*<div className="grid">*/}
            {/*    <div className="col-11"></div>*/}
            {/*    <div className="col-1">*/}
            {/*        <Button icon="bx bx-plus" className="p-button-rounded p-button-text"*/}
            {/*                disabled={props.disabled} onClick={addRow} />*/}
            {/*    </div>*/}
            {/*</div>*/}
        </React.Fragment>
    );
}

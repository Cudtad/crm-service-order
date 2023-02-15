import React, {forwardRef, useEffect, useState} from 'react';

import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import CommonFunction from '@lib/common';
import _ from 'lodash';
// import "features/task/scss/TaskBaseList.scss";
import "./scss/StateMatrix.scss";
import StateEntityApi from "services/config/StateEntityApi";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import {MultiSelect} from 'primereact/multiselect';
import {Checkbox} from 'primereact/checkbox';
import {XLayout, XLayout_Bottom, XLayout_Center, XLayout_Top} from '@ui-lib/x-layout/XLayout';

/**
 * props
 *      application: "" // application name
 *      entity: "" // entity name
 *      entityTypes: [{code:"", name: "", icon:""}, {code:"", name: "", icon: ""}] // array of entity types
 *      dialog: false // show in dialog or not, default false
 *      dialogHeader: "" // dialog's header
 *      entityTypesListWidth: 350 // entity types's list width - default 350
 *      customFieldsListWidth: 350 // custom fields's list width - default 350
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function StateMatrix(props, ref) {
    const t = CommonFunction.t;
    const type = 'state';
    const { application, codes, stateTemplateMenu, dialog, dialogHeader ,name, checkPermission} = props;
    const defaultStateMatrix = {
        id: 0,
        type: type,
        code: null,
        name: null,
        application: application,
        config: {},
        status: 1
    }

    const [stateMatrix, setStateMatrix] = useState([]);
    const [usingState, setUsingState] =  useState([]);
    const [show, setShow] = useState(false);
    const [directData, setDirectData] = useState(true);
    const [currentId, setCurrentId] = useState(0);
    const [storeObjectRemove, setStoreObjectRemove] = useState({});

    useEffect(() => {
        loadStateConfig().then(res => {
            if(res && res.id){
                setStateMatrix(res.config);
                setUsingState(res.config.states);
            }else{
                buildDefaultFullMenu();
            }
        })
    }, [codes])

    /**
     * load Fields by entity
     * @param {*} entityName
     */
    const buildDefaultFullMenu = () => {
        let _usingState = stateTemplateMenu.map(m => m.code);

        let _config = _.cloneDeep(defaultStateMatrix);
        _config.config.states = _usingState;
        stateTemplateMenu.map(function(mFrom){
            let _stateTo = {
                to: _usingState,
                event: {}
            }
            _config.config[mFrom] = _stateTo;
        })
        setStateMatrix(_config.config);
        setUsingState(stateTemplateMenu.map(m => m.code));
    }
    /**
     * load Fields by entity
     * @param {*} entityName
     */
    const loadStateConfig = async () => {
        let resoult;
        for(let i = 0; i < codes.length; i++){
            let _stateMatrix = await StateEntityApi.getByCodeType(application, 'state', codes[i], {
                Authorization: `Bearer ${window.app_context.keycloak.token}`,
                cid: localStorage.getItem("cid"),
            });
            if(_stateMatrix && _stateMatrix.id){
                if(_stateMatrix.code == codes[0]){
                    setDirectData(true);
                    setCurrentId(_stateMatrix.id);
                    // duoc hieu la da co dư lieu trong data base => khi update minh update theo ID duoc
                } else {
                    setDirectData(false);
                }
                resoult = _stateMatrix;
                break;
            }
            setDirectData(false);
            _stateMatrix = await StateEntityApi.getByCodeType(application, 'state', codes[i], {
                Authorization: `Bearer ${window.app_context.keycloak.token}`,
                cid: 0,
            });
            if(_stateMatrix && _stateMatrix.id){
                resoult = _stateMatrix;
                break;
            }
        }
        return resoult
    };

    /**
     * cancel submit
     */
    const cancel = () => {
        setShow(false)
    }

    const per = (action) => {
        if(checkPermission  && typeof checkPermission === "function"){
            return checkPermission(action)
        }
        return true;
    }
    /**
     * submit
     */
    const submit = async () => {
        if(!per('update')){
            CommonFunction.toastError(t("common.you-do-not-have-permission"));
            return;
        }

        let _stateMatrix = _.cloneDeep(stateMatrix)
        _stateMatrix.states = _.cloneDeep(usingState)
        usingState.map(using => {
            if(!_stateMatrix[using] || !_stateMatrix[using].to){
                _stateMatrix[using] = {};
                _stateMatrix[using].to = []
            }
        })
        let _payload = {
            application: application,
            code: codes[0],
            name: name,
            status:1,
            type: type,
            config: _stateMatrix
        }

        if(!directData) {
            // create
            _payload.id = 0;
            await StateEntityApi.create(_payload).then((data) => {
                if(data) {
                    setCurrentId(data.id)
                    setDirectData(true);
                    CommonFunction.toastSuccess(t("common.save-success"));
                } else {
                    CommonFunction.toastError(t('common.save-un-success'));
                }
            });
        } else {
            // update
            _payload.id = currentId;
            await StateEntityApi.update(_payload).then((data) => {
                if(data) {
                    CommonFunction.toastSuccess(t("common.save-success"));
                } else {
                    CommonFunction.toastError(t('common.save-un-success'));
                }
            });
        }
    }

    const applyChangeStates = (value) => {
        let _usingState = _.cloneDeep(usingState);
        let _stateMatrix = _.cloneDeep(stateMatrix);
        let _remove = _.difference(_usingState,value); //doi tuong xoa
        if(_remove && _remove.length > 0){
            if(_remove) {
                let _hasInit = false
                _remove.forEach((_itemState) => {
                    if(_itemState === "INIT") {
                        _hasInit =  true;
                    }
                })
                if(_hasInit) {
                    CommonFunction.toastError(t("confirm.default-init-state"))
                    return;
                }
            }

            _remove.forEach((toBeRemove) => {
                let objRemove = _.cloneDeep(_stateMatrix[toBeRemove]);
                let _storeObjectRemove = _.cloneDeep(storeObjectRemove);
                _storeObjectRemove[toBeRemove] = objRemove;
                setStoreObjectRemove(_storeObjectRemove);
                delete _stateMatrix[toBeRemove]; // xoa from
                for (const property in _stateMatrix) {
                    if(_stateMatrix[property] && _stateMatrix[property] && _stateMatrix[property].to && _stateMatrix[property].to.length>0) {
                        let _stateMetrix = _.cloneDeep(_stateMatrix[property].to);
                        _stateMatrix[property].to = _.remove(_stateMetrix,function(hello) {return (hello !== toBeRemove)});
                    }
                }
            })
        } else {
            let _add =  _.difference(value,_usingState);
            let _storeObjectRemove = _.cloneDeep(storeObjectRemove);
            if(_add && _add.length>0){
                _add.forEach((_addState) => {
                    // let menuItem = _.find(stateTemplateMenu,{code:_addState});
                    // if(menuItem) {_usingState.splice(stateTemplateMenu.length - menuItem.score,0,menuItem.code);}
                    if(_storeObjectRemove[_addState]) {
                        _storeObjectRemove[_addState].to = [];
                        _stateMatrix[_addState] = _storeObjectRemove[_addState]
                    } else {
                        _stateMatrix[_addState] = {to:[]}
                    }
                })
            }
        }
        setStateMatrix(_stateMatrix);
        setUsingState(value);

    }


    const setCheckedState = (check,parent,child) => {
        let _stateMatrix = _.cloneDeep(stateMatrix);
        if(check) {
            if(_stateMatrix[parent]) {
                if(_stateMatrix[parent].to) {
                    _stateMatrix[parent].to.push(child)
                } else {
                    _stateMatrix[parent]= {to:[child]}
                }
            } else {
                _stateMatrix[parent] = {to:[child]}
            }
        } else {
            let _data = _.cloneDeep(_stateMatrix[parent].to)
            _stateMatrix[parent].to = _.remove(_data,function(e) {return (e !== child)})
        }
        setStateMatrix(_stateMatrix);
    }

    const renderForm = () => {
        return (
            <XLayout>
                <XLayout_Top>
                    <XToolbar
                        className="mb-2"
                        left={() => (<>
                            <Button label={t('common.save')} icon="bx bxs-save"
                            disabled={!per('update')}
                            className="p-button-text " onClick={submit} />
                            <MultiSelect id="type" value={usingState}
                                selectItemsLabel={"{0}iheleleeos"}
                                options={stateTemplateMenu}
                                optionLabel="name"
                                optionValue="code"
                                disabled={!per('update')}
                                // display="chip"
                                placeholder={t("common.state")}
                                style={{ border: "none", boxShadow: "none" }}
                                onChange={(e) => applyChangeStates(e.value)}
                                className='dense'/>
                        </>)}
                    >
                    </XToolbar>
                </XLayout_Top>
                <XLayout_Center className="issue-impact-matrix">
                <div className="p-shadow-1 flex" style={{width:"fit-content"}}>
                    <div className="flex flex-column">
                        <div className="impact-tag mb-2-5 border-bottom border-right " style={{width:"150px"}}>
                        </div>
                        {stateTemplateMenu.map((_state, happenIndex) => {
                            let _currentState = _.find(usingState,function(e){return(e === _state.code)})
                            if(_currentState) {
                                return (
                                    <div key={`header_${happenIndex}`} className="impact-tag mr-2-5 pr-3 border-right p-text-right" style={{width:"150px"}}>
                                        {t(`ticket.state.ticket.${_currentState}`)}
                                    </div>
                                )
                            }
                        })}
                        <div className="impact-tag p-text-right pt-2 pr-3 border-top border-right" style={{width:"150px"}} >
                            <span><b>{t("common.state.origin")}</b></span>
                        </div>
                    </div>
                    {stateTemplateMenu && stateTemplateMenu.length > 0 && stateTemplateMenu.map((_state, happenIndex) =>{
                            let _currentState = _.find(usingState,function(e){return(e === _state.code)})
                            if(_currentState){
                            return (
                                <>
                                    <div key={"hpi_" + happenIndex} className="flex flex-column" >

                                        <div key={`ind_label_${happenIndex}`} className="mb-2-5 border-bottom impact-tag flex align-items-center justify-content-center" style={{textAlign: 'center'}}>
                                            {t(`ticket.state.ticket.${_currentState}`)}
                                        </div>
                                        {stateTemplateMenu.map((stateTemplate, stateIndex) => {
                                            let _valueState = _.find(usingState,function(e){return(e === stateTemplate.code)})
                                            if(_valueState) {
                                                let _resoult = false;
                                                if(stateMatrix && stateMatrix[_valueState]) {
                                                    let _data = stateMatrix[_valueState]
                                                    if(_data && _data.to && _data.to.length > 0) {
                                                        _data.to.map((e) => {
                                                            if(e == _currentState) {
                                                                _resoult = true
                                                            }
                                                        })
                                                    }
                                                }
                                                return (
                                                    <React.Fragment key={`impact-column-${stateIndex}`}>
                                                        <div key={"imp_impact-column_" + stateIndex } className="impact-tag" style={{textAlign: 'center'}}>
                                                            <Checkbox onChange={e => setCheckedState(e.checked,_valueState,_currentState)} disabled={_valueState === _currentState} checked={_resoult}></Checkbox>
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                            }
                                        )}
                                    </div>
                                </>
                            )
                        }

                    }
                   )}
                    <div className="flex flex-column">
                        <div className="impact-tag pl-3 p-text-left border-left border-bottom flex align-items-center" style={{width:"150px"}}>
                            <span><b>{t("common.state.destination")}</b></span>
                        </div>
                    </div>
                </div>

                </XLayout_Center>
                <XLayout_Bottom>
                <div className="flex mt-2-5 ml-2-5">
                    {usingState.map((color, impactIndex) => (
                        <>
                            <div key={"impC_" + impactIndex} className="impact-tag" style={{textAlign: 'center'}}>
                                <i>{color.name}</i>
                            </div>
                        </>
                    ))}
                </div>

                </XLayout_Bottom>
            </XLayout>
        );

    }

    return (
        <>
            {dialog &&
                <Dialog
                    header={dialogHeader}
                    visible={show}
                    className="wd-1024-768"
                    onHide={cancel}
                    footer={
                        <>
                            <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text text-muted" onClick={cancel} />
                            <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submit} />
                        </>
                    }
                >
                    {renderForm()}
                </Dialog>
            }
            {!dialog && renderForm()}
        </>
    )
}

StateMatrix = forwardRef(StateMatrix);

export default StateMatrix;

import React, { useEffect, useRef, useState } from 'react';

import { XLayout, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import CommonFunction from '@lib/common';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import MatrixUtil from "../System/MatrixUtil";
import { ColorPicker } from "primereact/colorpicker";

import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import './styles.scss'

export default function CrmMatrixPrioritySetting(props) {
    const t = CommonFunction.t;
    const { updatePermission, getApi, updateApi, className } = props;
    const issuePrioritiesMenuItems = [
        { code: 'CRITICAL', name: t('priority-critical'), score: 7, color: "#f22515" },
        { code: 'VERY_HIGH', name: t('priority-very-high'), score: 6, color: "#f51515" },
        { code: 'HIGH', name: t('priority-high'), score: 5, color: "#c94831" },
        { code: 'MEDIUM', name: t('priority-medium'), score: 4, color: "#ea821a" },
        { code: 'LOW', name: t('priority-low'), score: 3, color: "#f8ff76" },
        { code: 'VERY_LOW', name: t('priority-very-low'), score: 2, color: "#ffd15e" },
        { code: 'UNAFFECT', name: t('priority-unaffect'), score: 1, color: "#fdd15e" }
    ];
    const [severityMatrix, setSeverityMatrix] = useState([]);
    const [colorMatrix, setColorMatrix] = useState(issuePrioritiesMenuItems);
    const [menuMatrix, setMenuMatrix] = useState(issuePrioritiesMenuItems);
    const [usingPriority, setUsingPriority] = useState([]);

    useEffect(() => {
            getApi().then(res => {
                if (res && res.config && res.config.matrixSeverity) {
                    let _matrixConfig = res.config.matrixSeverity;
                    if (_matrixConfig.colorMatrix) {
                        let _colorMatrix = _matrixConfig.colorMatrix;
                        _colorMatrix.map(function (m) {
                            let _meta = _.find(issuePrioritiesMenuItems, { 'code': m.code });
                            if (_meta) {
                                m.name = _meta.name
                            }
                        })
                        setColorMatrix(_colorMatrix)
                        setMenuMatrix(_colorMatrix)
                        setUsingPriority(_colorMatrix.map(m => m.code));
                    }
                    if (_matrixConfig.matrix) {
                        setSeverityMatrix(_matrixConfig.matrix)
                    }
                } else {
                    let _data = MatrixUtil.buildDefaultSeverityMatrix([...issuePrioritiesMenuItems]);
                    setColorMatrix([...issuePrioritiesMenuItems]);
                    setMenuMatrix([...issuePrioritiesMenuItems])
                    setUsingPriority([...issuePrioritiesMenuItems].map(m => m.code));

                    if (_data) {
                        setSeverityMatrix(_data);
                    }
                }
            })
        // } else {
        //     let _data = MatrixUtil.buildDefaultSeverityMatrix([...issuePrioritiesMenuItems]);
        //     setColorMatrix([...issuePrioritiesMenuItems]);
        //     setMenuMatrix([...issuePrioritiesMenuItems])
        //     setUsingPriority([...issuePrioritiesMenuItems].map(m => m.code));

        //     if (_data) {
        //         setSeverityMatrix(_data);
        //     }
        // }
    }, []);

    const changeSeverityMatrixCode = (happenCode, impactCode, newCode) => {
        let _severityMatrix = _.cloneDeep(severityMatrix);
        let _dataIndex = _.findIndex(_severityMatrix, { 'happen': happenCode, 'impact': impactCode });
        if (_dataIndex > -1) {
            _severityMatrix[_dataIndex].severity.code = newCode;
            _severityMatrix[_dataIndex].severity.color = MatrixUtil.getColorMatrix(newCode, colorMatrix)
        }
        setSeverityMatrix(_severityMatrix);
    }
    const rebuildSeverityMatrixColor = (_colorMaxtrix) => {

        let _matrix = _colorMaxtrix ? _colorMaxtrix : colorMatrix;
        let _severityMatrix = _.cloneDeep(severityMatrix);
        _matrix.forEach(function (happen, happenIndex) {
            _matrix.forEach(function (impact, impactIndex) {
                let _dataIndex = _.findIndex(severityMatrix, { 'happen': happen.code, 'impact': impact.code });

                if (_dataIndex > -1) {
                    let _findNewColor = _.find(_matrix, { 'code': _severityMatrix[_dataIndex].severity.code });
                    if (_findNewColor) {
                        _severityMatrix[_dataIndex].severity.color = _findNewColor.color;
                    }
                }
            })
        })
        setSeverityMatrix(_severityMatrix);
    }

    const changeColorMatrix = (code, e) => {
        let _colorMatrix = _.cloneDeep(colorMatrix);
        let indexfind = _.findIndex(_colorMatrix, { code: code });
        if (indexfind > -1) {
            _colorMatrix[indexfind].color = '#' + e.value;
        }
        setColorMatrix(_colorMatrix);
        rebuildSeverityMatrixColor(_colorMatrix);
    }
    const applyChangePriority = (value) => {
        let _usingPriority = _.cloneDeep(usingPriority);
        let _colorMatrix = _.cloneDeep(colorMatrix);
        let _severityMatrix = _.cloneDeep(severityMatrix);

        let _remove = _.difference(_usingPriority, value); //[] doi tuong xoa
        if (_remove && _remove.length > 0) {
            _remove.forEach((toBeRemove) => {
                _colorMatrix.map((_color, index) => {
                    if (_color.code == toBeRemove) {
                        _colorMatrix.splice(index, 1)
                    }
                });

                _severityMatrix = _severityMatrix.filter((_severity) => {
                    return (_severity.happen !== toBeRemove)
                });
                _severityMatrix = _severityMatrix.filter((_severity) => {
                    return (_severity.impact !== toBeRemove)
                });

                _severityMatrix.map((_itemServerity) => {
                    if (_itemServerity.severity.code == toBeRemove) {
                        let _newServity = _.find(menuMatrix, { code: _itemServerity.happen })
                        if (_newServity) {
                            _itemServerity.severity.code = _newServity.code;
                            _itemServerity.severity.color = _newServity.color;
                        }
                    }
                })

            })
        } else {
            let _add = _.difference(value, _usingPriority); //[] doi tuong them
            if (_add && _add.length > 0) {
                _add.forEach((_addState) => {
                    let menuItem = _.find(issuePrioritiesMenuItems, { code: _addState });

                    _colorMatrix.forEach((_impact) => {
                        _severityMatrix.push(
                            {
                                happen: _addState, impact: _impact.code,
                                severity: {
                                    code: menuItem.code,
                                    color: menuItem.color
                                }
                            }
                        );
                        _severityMatrix.push(
                            {
                                happen: _impact.code, impact: _addState,
                                severity: {
                                    code: menuItem.code,
                                    color: menuItem.color
                                }
                            }
                        );

                    })
                    _severityMatrix.push({
                        happen: _addState, impact: _addState,
                        severity: {
                            code: menuItem.code,
                            color: menuItem.color
                        }
                    })

                    if (menuItem) {
                        _colorMatrix.push(menuItem)
                    }
                })
            }

        }
        setColorMatrix(_colorMatrix)
        setMenuMatrix(_colorMatrix)
        setSeverityMatrix(_severityMatrix);
        setUsingPriority(value);
    }

    const submit = async () => {
        if (!updatePermission) {
            CommonFunction.toastError(t("common.you-do-not-have-permission"));
            return;
        }

        try {
            let payload = {
                matrixSeverity: {
                    colorMatrix: colorMatrix,
                    matrix: severityMatrix
                }
            }
            updateApi(payload).then(res => {
                if (res) {
                    CommonFunction.toastSuccess(t('save.successful'));
                } else {
                    CommonFunction.toastError(t('common.save-un-success'));
                }
            })
        } catch (error) {
            CommonFunction.toastError(error);
        }

    }
    return (<>
        <XLayout className="pt-1 pl-2 pb-2 pr-2 crm-matrix">
            <XLayout_Center>
                <XToolbar
                    className="mb-2"
                    left={() => (<>
                        <Button label={t('common.save')}
                            disabled={(!updatePermission)}
                            icon="bx bxs-save" className="p-button-text " onClick={submit} />
                        <MultiSelect id="type" value={usingPriority}
                            options={issuePrioritiesMenuItems}
                            optionLabel="name"
                            optionValue="code"
                            disabled={(!updatePermission)}
                            placeholder={t("risk.happenRate")}
                            style={{ border: "none", boxShadow: "none" }}
                            onChange={(e) => applyChangePriority(e.value)}
                            className='dense' />
                    </>)}

                >
                </XToolbar>
                <div
                    className={`p-card p-card-component overflow-hidden ${className ? className : ``}`}
                >
                    <div className="p-card-body px-0">
                        <div className="px-3">


                            <div className="flex flex-column priority-impact-matrix" >
                                <div className="p-shadow-1 flex " style={{ width: "fit-content" }}>
                                    <div className="flex flex-column">
                                        <div className="impact-tag mb-2-5 border-bottom border-right" style={{ width: "150px" }}>
                                        </div>
                                        {issuePrioritiesMenuItems && issuePrioritiesMenuItems.map((happen, happenIndex) => {
                                            let _currentHappen = _.find(severityMatrix, function (e) { return (e.happen === happen.code) })
                                            if (_currentHappen) {
                                                return (
                                                    <div key={`header_${happenIndex}`} className="impact-tag mr-2-5 pr-3 border-right p-text-right"
                                                        style={{ textAlign: 'right', width: "150px" }}>
                                                        {happen.name}
                                                    </div>
                                                )
                                            }
                                        })}
                                        <div className="impact-tag p-text-right pt-2 pr-3 border-top border-right" style={{ textAlign: 'right', width: "150px" }}>
                                            <span><b>{t("risk.happenRate")}</b></span>
                                        </div>
                                    </div>
                                    {issuePrioritiesMenuItems && issuePrioritiesMenuItems.map((happen, happenIndex) => {
                                        let _currentHappen = _.find(severityMatrix, function (e) { return (e.happen === happen.code) })
                                        if (_currentHappen) {
                                            return (
                                                <React.Fragment key={"happen_" + happenIndex}>
                                                    <div key={"hpi_" + happenIndex} className="flex flex-column" >
                                                        <div className="mb-2-5 border-bottom impact-tag flex align-items-center justify-content-center" style={{ textAlign: 'center' }}>
                                                            {happen.name}
                                                        </div>
                                                        {issuePrioritiesMenuItems.map((impact, impactIndex) => {
                                                            let _itemServerity = _.find(severityMatrix, function (e) { return ((e.happen === impact.code) && (e.impact === happen.code)) })
                                                            if (_itemServerity) {
                                                                return (
                                                                    <React.Fragment key={"frg_" + impactIndex}>

                                                                        <div key={"imp_" + impactIndex + "_" + happenIndex} className="impact-tag"
                                                                            style={{ backgroundColor: _itemServerity.severity.color }}>
                                                                            <Dropdown style={{
                                                                                backgroundColor: _itemServerity.severity.color
                                                                                , border: 'none'
                                                                            }}
                                                                                id={`priority_${impactIndex + "_" + happenIndex}`}
                                                                                options={menuMatrix}
                                                                                onChange={(e) => changeSeverityMatrixCode(_itemServerity.happen, _itemServerity.impact, e.value)}
                                                                                value={_itemServerity.severity.code}
                                                                                optionLabel="name" optionValue="code"
                                                                                display="chip" />
                                                                        </div>
                                                                    </React.Fragment>
                                                                )
                                                            }
                                                        })}
                                                    </div>
                                                </React.Fragment>
                                            )
                                        }

                                    }
                                    )}
                                    <div className="impact-tag pl-3 p-text-left border-left border-bottom flex align-items-center" style={{ textAlign: 'left', width: "150px" }}>
                                        <span><b>{t("risk.impactRate")}</b></span>
                                    </div>
                                </div>
                                <div className="flex ml-2 mt-3">
                                    {issuePrioritiesMenuItems.map((impact, impactIndex) => {
                                        let _color = _.find(colorMatrix, function (e) { return (e.code === impact.code) })
                                        if (_color) {
                                            return (
                                                <React.Fragment key={"impIndex_" + impactIndex}>
                                                    <div key={"impC_" + impactIndex} className="impact-tag" style={{ textAlign: 'center' }}>
                                                        <i className="mr-1">{_color.name}</i>
                                                        <ColorPicker id={`color_${impactIndex}`}
                                                            value={_color.color} onChange={(e) => changeColorMatrix(_color.code, e)}></ColorPicker>
                                                    </div>
                                                </React.Fragment>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </XLayout_Center>
        </XLayout>
    </>);
}

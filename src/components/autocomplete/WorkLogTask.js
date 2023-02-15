import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react";
import _ from "lodash";

import WorkLogTaskService from "services/WorkLogTaskService";

import { Button } from "primereact/button";
import CommonFunction from '@lib/common';
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import moment from "moment";
import { Dialog } from "primereact/dialog";
import { XLayout, XLayout_Center } from '@ui-lib/x-layout/XLayout';
import { XCalendar } from '@ui-lib/x-calendar/XCalendar';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import DisplayUtil from "../util/DisplayUtil";
// import TaskUtil from "features/task/components/util/TaskUtil";
import classNames from "classnames";
import "./scss/WorkLogTask.scss";
import TaskUtil from "../util/TaskUtil";

function WorkLogTask(props, ref) {
    const t = CommonFunction.t;
    const { user } = props;
    const { task, projectId, application, rootType, rootId, taskEntity, setReadOnlyResponsibleUser } = props;
    const c = {
        COMPLETED: "COMPLETED",
        DONE: "DONE",
        CANCELED: "CANCELED",
    };
    const emptyCheckItem = {
        application: application,
        rootType: rootType,
        rootId: rootId,
        taskEntity: taskEntity,
        id: 0,
        taskId: task.id,
        project: task.project,
        groupId: task.groupId,
        name: "",
        workHour: 0,
        otHour: 0,
        startOTTime: "",
        endOTTime: "",
        workDate: "",
        action: "ADD",
        userId: CommonFunction.objectToKey(task.responsibleId),
        projectId: projectId ? projectId : 0,
        changerWorklog: true,
        ot: false,
    };
    let validateEmpty = {
        name: null,
        workDate: null,
        workHour: null,
        otHour: null,
        moreThan24h: null,
    };
    let emptyTotalHour = {
        totalHour: 0,
        otHourLogged: 0,
        otHour: 0,
        totalRemain: 0,
        totalRemainOtHour: 0,
        workDate: "",
    };
    const [items, setItems] = useState([]);
    const [totalHour, setTotalHour] = useState(0);
    const [messValidates, setmessValidates] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [listUseDate, setlistUseDate] = useState([]);
    const [sumTotalHour, setsumTotalHour] = useState(emptyTotalHour);
    const [currentResponsibleUser, setCurrentResponsibleUser] = useState(null);
    const [readOnly, setReadOnly] = useState(null);
    const [checkedShowMore, setCheckedShowMore] = useState(true);

    useEffect(() => {
        let _responsibleUser = task.responsible ? task.responsible : task.responsibleId;
        setCurrentResponsibleUser(_responsibleUser);
        let _checkResponsible = TaskUtil.checkIsResponsibleForTask(_responsibleUser, window.app_context.user);
        setReadOnly(!_checkResponsible);
    }, [task]);

    useEffect(() => {
        loadItems();
    }, []);

    /**
     * changer read only
     */
    useEffect(() => {
        if (typeof setReadOnlyResponsibleUser === "function") {
            if (items && items.length > 0) {
                setReadOnlyResponsibleUser(true);
            } else {
                setReadOnlyResponsibleUser(false);
            }
        }
    }, [items]);

    const loadItems = (_task) => {
        _task = _task ? _task : task;

        if (_task && _task.id) {
            WorkLogTaskService.getById(_task.id ? _task.id : 0).then((data) => {
                if (!CommonFunction.isEmpty(data)) {
                    let _totalHour = 0;
                    let _validates = [];

                    data.map((item) => {
                        item.ot = false;
                        item.changerWorklog = false;
                        item.workDate = new Date(item.workDate);
                        if (item.startOTTime) {
                            item.startOTTime = new Date(item.startOTTime);
                        }
                        if (item.endOTTime) {
                            item.endOTTime = new Date(item.endOTTime);
                        }
                        _totalHour += Number(item.workHour) || 0;
                        if (item.otHour) {
                            item.ot = true;
                            _totalHour += Number(item.otHour) || 0;
                        }
                        // valid
                        _validates.push(validateEmpty);
                    });
                    data = _.orderBy(data, ["workDate"], ["asc"]);
                    setmessValidates(_validates);

                    setItems(data);
                    setTotalHour(_totalHour.toFixed(2));
                } else {
                    setItems([]);
                    setTotalHour(0);
                }
            });
        }
    };
    useImperativeHandle(ref, () => ({
        loadItems: (_task) => {
            loadItems(_task);
        },
        getWorklogTasks: () => {
            return items;
        },
    }));

    const bindData = (_result, index) => {
        let _items = _.cloneDeep(items);
        let _item = _items[index];
        _item.id = _result.id;
        _item.action = _result.action;
        _item.changerWorklog = false;

        if (_item.otHour) {
            _item.ot = true;
        }

        let _totalHour = 0;
        if (_items && _items.length > 0) {
            _items.map((item) => {
                if (item.id > 0) {
                    _totalHour += item.workHour;
                    if (item.otHour) {
                        _totalHour += Number(item.otHour);
                    }
                }
            });
        }
        setItems(_items);
        setTotalHour(_totalHour.toFixed(2));
    };
    const applyItemChange = (prop, val, index) => {
        let _items = _.cloneDeep(items);
        let _item = _items[index];
        _item.changerWorklog = true;
        if (_item) {
            switch (prop) {
                case "workDate":
                    if (val) {
                        if (_item.startOTTime) {
                            let _startOTTime = new Date(_item.startOTTime);
                            _item.startOTTime = new Date(_startOTTime.setFullYear(val.getFullYear(), val.getMonth(), val.getDate()));
                        }
                        if (_item.endOTTime) {
                            let _endOTTime = new Date(_item.endOTTime);
                            _item.endOTTime = new Date(_endOTTime.setFullYear(val.getFullYear(), val.getMonth(), val.getDate()));
                        }
                    } else {
                        _item.otHour = 0;
                        _item.startOTTime = "";
                        _item.endOTTime = "";
                    }
                    break;
                case "name":
                    break;
                case "workHour":
                    // if (!Number(val)) val = 0
                    console.log("workHour", val);
                    break;
                case "startOTTime":
                    if (val && _item.workDate) {
                        val.setFullYear(new Date(_item.workDate).getFullYear(), new Date(_item.workDate).getMonth(), new Date(_item.workDate).getDate());
                    }
                    if (val && _item.endOTTime) {
                        let _startHour = val.getHours();
                        let _startMinutes = val.getMinutes();
                        let _endHour = new Date(_item.endOTTime).getHours();
                        let _endMinutes = new Date(_item.endOTTime).getMinutes();
                        let _countHours = _endHour - _startHour + (_endMinutes - _startMinutes) / 60;
                        _item.otHour = _countHours.toFixed(2);
                    } else {
                        _item.otHour = 0;
                    }
                    break;
                case "endOTTime":
                    if (val && _item.workDate) {
                        val.setFullYear(new Date(_item.workDate).getFullYear(), new Date(_item.workDate).getMonth(), new Date(_item.workDate).getDate());
                    }
                    if (val && _item.startOTTime) {
                        let _endHour = val.getHours();
                        let _endMinutes = val.getMinutes();
                        let _startHour = new Date(_item.startOTTime).getHours();
                        let _startMinutes = new Date(_item.startOTTime).getMinutes();
                        let _countHours = _endHour - _startHour + (_endMinutes - _startMinutes) / 60;
                        _item.otHour = _countHours.toFixed(2);
                    } else {
                        _item.otHour = 0;
                    }
                    break;
                default:
                    break;
            }
            _item[prop] = val;
            setItems(_items);
        }
    };

    const addRow = () => {
        // Generate new key of new item
        let _items = _.cloneDeep(items);
        let _emptyCheckItem = _.cloneDeep(emptyCheckItem);
        let _validates = _.cloneDeep(messValidates);
        _validates.unshift({ ...validateEmpty });
        _items.unshift(_emptyCheckItem);
        setItems(_items);
        setmessValidates(_validates);
    };

    const copyRow = (index) => {
        let _items = _.cloneDeep(items);
        let _objCopy = _.cloneDeep(_items[index]);

        _objCopy.id = 0;
        _objCopy.changerWorklog = true;
        let _validates = _.cloneDeep(messValidates);
        _validates.splice(index + 1, 0, { ...validateEmpty });
        _items.splice(index + 1, 0, _objCopy);
        setItems(_items);
        setmessValidates(_validates);
    };
    const deleteRow = (index) => {
        let _items = _.cloneDeep(items);
        let _validates = _.cloneDeep(messValidates);
        let _currentObj = _items[index];
        CommonFunction.showConfirm(t("worklog.delete-row"), t("button.confirm"), () => {
            if (_currentObj && _currentObj.id > 0) {
                WorkLogTaskService.delete(_currentObj.id).then((data) => {
                    if (data) {
                        CommonFunction.toastSuccess(t("common.save-success"));
                    } else {
                        CommonFunction.toastError(t("common.save-un-success"));
                    }
                });
            }
            _validates.splice(index, 1);
            _items.splice(index, 1);
            let _totalHour = 0;
            if (_items && _items.length > 0) {
                _items.map((item) => {
                    if (item.id > 0) {
                        _totalHour += item.workHour;
                        if (item.otHour) {
                            _totalHour += Number(item.otHour);
                        }
                    }
                });
            }
            setTotalHour(_totalHour);
            setmessValidates(_validates);
            setItems(_items);
        });
    };
    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const performValidate = (curent, props, indexValid) => {
        let _validates = _.cloneDeep(messValidates);
        let result = _.cloneDeep(_validates[indexValid]);

        let isValid = true;
        let _current = _.cloneDeep(curent);
        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }
        // validate props
        props.forEach((prop) => {
            switch (prop) {
                case "workDate":
                    result[prop] = _current.workDate == null || _current.workDate === "" ? `${t("worklog.valid.date")} ${t("message.cant-be-empty")}` : null;
                    if (!result[prop] && CommonFunction.compareDate(_current.workDate, new Date()) > 0) {
                        result[prop] = t("message.cant-log-future-time");
                    }
                    if (task.project && task.project.startDate && task.project.endDate) {
                        let dateLog = new Date(_current.workDate).getTime();
                        let prStartDate = new Date(task.project.startDate).getTime();
                        let prEndDate = new Date(task.project.endDate).getTime();
                        if (task.project && (dateLog > prEndDate || dateLog < prStartDate)) {
                            result[prop] = t("message.cant-log-outside-project-time");
                        }
                    }
                    break;
                case "workHour":
                    result[prop] = _current.workHour == null ? `${t("worklog.valid.hour")} ${t("message.cant-be-empty")}` : null;
                    break;
                case "otHour":
                    result[prop] = _current.otHour && Number(_current.otHour) < 0 ? `${t("ot.otHour")} ${t("message.must-greater-than-0-or-equal-0")}` : null;
                    break;
                case "name":
                    result[prop] = _current.name == "" || _current.name == null ? `${t("worklog.valid.name")} ${t("message.cant-be-empty")}` : null;
                    break;
                default:
                    break;
            }
        });
        if (_current.workHour && _current.otHour) {
            let _totalHour = Number(_current.workHour) + Number(_current.otHour);
            result["moreThan24h"] = _totalHour > 24 ? t("worklog.more-than-24h") : null;
        } else {
            result["moreThan24h"] = null;
        }

        // set state
        _validates[indexValid] = result;
        setmessValidates(_validates);
        // check if object has error
        for (const property in result) {
            if (result[property]) {
                CommonFunction.toastError(result[property]);
                isValid = false;
                break;
            }
        }

        return isValid;
    };
    const saveRow = (index) => {
        let _items = _.cloneDeep(items);
        // khi submit save thì disabel
        setReadOnly(true);
        let _item = _items[index];
        let isValid = performValidate(_item, [], index);
        if (isValid) {
            WorkLogTaskService.create(_item).then((data) => {
                if (data) {
                    // sau khi chạy và có data thì enable lại
                    setReadOnly(false);
                    bindData(data, index);
                    CommonFunction.toastSuccess(t("common.save-success"));
                }
            });
        }
    };

    const viewDateWorklog = (_item) => {
        if (_item.workDate) {
            let date = CommonFunction.formatDate(_item.workDate, "YYYY/MM/DD");
            WorkLogTaskService.getByWorkLogOfDate(date, 0, CommonFunction.objectToKey(task.responsibleId))
                .then((_listWorklog) => {
                    if (!CommonFunction.isEmpty(_listWorklog)) {
                        if (_listWorklog && _listWorklog.length > 0) {
                            _listWorklog.map((_item) => {
                                _item.projectId = _item.projectId ? _item.projectId : _item.projectid;
                                _item.taskName = _item.taskName ? _item.taskName : _item.task_name;
                            });
                        }
                        let _sumTotalHour = _.cloneDeep(emptyTotalHour);
                        let _data = _.cloneDeep(_listWorklog);
                        let newData = _.uniqBy(_data, "projectId");
                        newData = _.sortBy(newData, function (m) {
                            return m.projectId;
                        });
                        newData.map((item) => {
                            let _children = _.filter(_listWorklog, { projectId: item.projectId });
                            item.childs = _children;
                            item.totalHour =
                                _.sumBy(_children, function (c) {
                                    return c.totalHour || 0;
                                }) || 0;
                            item.otHour =
                                _.sumBy(_children, function (c) {
                                    return c.otHour || 0;
                                }) || 0;
                            item.otHourLogged =
                                _.sumBy(_children, function (c) {
                                    return c.otHourLogged || 0;
                                }) || 0;
                            _sumTotalHour.workDate = moment(new Date(item.workDate)).format("DD/MM/YYYY");
                            _sumTotalHour.totalHour += item.totalHour;
                            _sumTotalHour.otHour += item.otHour;
                            _sumTotalHour.otHourLogged += item.otHourLogged;
                        });
                        _sumTotalHour.totalRemain = (24 - _sumTotalHour.totalHour).toFixed(2);
                        _sumTotalHour.totalRemainOtHour = (_sumTotalHour.otHour - _sumTotalHour.otHourLogged).toFixed(2);

                        setsumTotalHour(_sumTotalHour);
                        setlistUseDate(newData);
                    } else {
                        setsumTotalHour(emptyTotalHour);
                        setlistUseDate([]);
                        setTotalHour(0);
                    }
                })
                .finally(() => {
                    setShowDetail(true);
                });
        }
    };

    /**
     * validate service
     * @param {Array} props [] = validate all, ['a','b'] = validate prop a & b
     */
    const getInvalidMessage = (index, prop) => {
        if (messValidates && messValidates[index]) {
            return messValidates[index][prop];
        }
        return null;
    };

    const getResponsibleUser = () => {
        let _user = task && task.responsibleUser && task.responsibleUser.id ? task.responsibleUser : null;
        if (!_user) {
            _user = task && task.responsibleId && task.responsibleId.id ? task.responsibleId : null;
        }
        if (_user) {
            return <>{DisplayUtil.displayChipUser(_user)}</>;
        } else {
            return <></>;
        }
    };

    const changerOtHour = (index) => {
        let _items = _.cloneDeep(items);
        _items[index].ot = !_items[index].ot;
        setItems(_items);
    };

    return (
        <>
            <div className="flex mb-2 mt-3 align-items-center" id="task-navigator-todo">
                <i className="bx bx-timer task-icon"></i>
                <div className="task-content-header">
                    {t("common.worklogtask")} {totalHour} {t("common.totalWorklogHour")}
                </div>
            </div>
            <div className="task-content-container p-fluid fluid  worklog-task-content">
                <XToolbar
                    className="p-0 mb-2"
                    left={() => (
                        <div className="p-2">
                            <Button icon="bx bx-plus" disabled={readOnly} label={t("worklog.add")} onClick={addRow} />
                        </div>
                    )}
                    // right={() => (
                    //     <div className="p-2">
                    //         <ToggleButton onLabel={t("worklog.show-more")} offLabel={t("worklog.hide")} onIcon="pi pi-angle-down" offIcon="pi pi-angle-up" checked={checkedShowMore} onChange={(e) => setCheckedShowMore(e.value)} />
                    //     </div>
                    // )}
                ></XToolbar>
                <div
                    className={classNames({
                        "show-more-content-worklog": checkedShowMore,
                    })}
                >
                    {items &&
                        items.length > 0 &&
                        items.map((_item, index) => (
                            <React.Fragment key={`item_${index}`}>
                                <div className={`p-shadow-1 pt-3 px-2 mb-2 ${_item.changerWorklog && "bg-brown-2"}`}>
                                    <div className="grid">
                                        <div className="pt-1-5 pb-1-5 col-5">
                                            <span className="p-float-label">
                                                <InputText value={_item.name} id={`woklogName_${index}`}  onChange={(e) => applyItemChange("name", e.target.value, index)} />
                                                <label htmlFor={`woklogName_${index}`} className="require">
                                                    {t("common.woklogName")}
                                                </label>
                                            </span>
                                            {getInvalidMessage(index, "name") && <small className="p-invalid">{getInvalidMessage(index, "name")}</small>}
                                        </div>
                                        <div className=" pt-1-5 pb-1-5 col-3">
                                            <span className="p-float-label  input-list-user">
                                                <XCalendar require showDate label={t("common.worklogDate")}  value={_item.workDate} onChange={(e) => applyItemChange("workDate", e, index)} />
                                            </span>
                                            {getInvalidMessage(index, "workDate") && <small className="p-invalid">{getInvalidMessage(index, "workDate")}</small>}
                                        </div>
                                        <div className=" pt-1-5 pb-1-5 col-2">
                                            <span className="p-float-label input-list-name">
                                                <InputNumber  inputId={`workHour_${index}`} value={_item.workHour} min={0} max={24} onValueChange={(e) => applyItemChange("workHour", e.value, index)} mode="decimal" minFractionDigits={1} maxFractionDigits={2} />
                                                <label htmlFor={`workHour_${index}`}>{t("common.woklogHour")}</label>
                                            </span>
                                            {getInvalidMessage(index, "workHour") && <small className="p-invalid">{getInvalidMessage(index, "workHour")}</small>}
                                        </div>
                                        <div className=" pt-1-5 pb-1-5 col-2">
                                            <div className="flex">
                                                <span className="p-float-label button-add button_label" style={{ float: "left" }}>
                                                    <Button icon="pi pi-angle-double-down" tooltip={t("worklog.ot")} className="p-button-rounded p-button-text" onClick={() => changerOtHour(index)} />
                                                </span>
                                                <span className="p-float-label button-add button_label" style={{ float: "left" }}>
                                                    <Button icon="pi pi-check" tooltip={t("worklog.save")} disabled={readOnly} className="p-button-rounded p-button-text" onClick={() => saveRow(index)} />
                                                </span>
                                                <span className="p-float-label button-add button_label" style={{ float: "left" }}>
                                                    <Button icon="pi pi-plus" tooltip={t("worklog.add-row")} disabled={readOnly} className="p-button-rounded p-button-text" onClick={() => copyRow(index)} />
                                                </span>
                                                <span className="p-float-label button-add button_label" style={{ float: "left" }}>
                                                    <Button icon="pi pi-eye" tooltip={t("worklog.date-detail")} className="p-button-rounded p-button-text" onClick={() => viewDateWorklog(_item)} />
                                                </span>
                                                <span className="p-float-label button-remove button_label" style={{ float: "left" }}>
                                                    <Button icon="pi pi-times" tooltip={t("worklog.delete-row")} disabled={readOnly} className="p-button-rounded p-button-text" onClick={(e) => deleteRow(index)} />
                                                </span>
                                            </div>
                                        </div>
                                        {_item.ot && (
                                            <>
                                                <div className=" pt-1-5 pb-1-5 col-5">
                                                    <span className="p-float-label input-list-name">
                                                        <XCalendar label={t("ot.startOTTime")} id={`startOTTime_${index}`} value={_item.startOTTime} showTime={true} showDate={false}  onChange={(e) => applyItemChange("startOTTime", e, index)} />
                                                    </span>
                                                </div>
                                                <div className=" pt-1-5 pb-1-5 col-3">
                                                    <span className="p-float-label input-list-name">
                                                        <XCalendar id={`endOTTime_${index}`} label={t("ot.endOTTime")} value={_item.endOTTime} showTime={true} showDate={false}  onChange={(e) => applyItemChange("endOTTime", e, index)} />
                                                    </span>
                                                </div>

                                                <div className=" pt-1-5 pb-1-5 col-4">
                                                    <span className="p-float-label input-list-name">
                                                        <InputNumber  value={Number(_item.otHour || 0)} max={24} disabled mode="decimal" minFractionDigits={1} maxFractionDigits={2} inputId={`otHour_${index}`} />
                                                        <label htmlFor={`otHour_${index}`}>{t("ot.otHour")}</label>
                                                    </span>
                                                    {getInvalidMessage(index, "otHour") && <small className="p-invalid">{getInvalidMessage(index, "otHour")}</small>}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                </div>
                {/*<ToggleButton onLabel={t("worklog.show-more")} offLabel={t("worklog.hide")} onIcon="pi pi-angle-down" offIcon="pi pi-angle-up" checked={checkedShowMore} onChange={(e) => setCheckedShowMore(e.value)} />*/}
                <div className="show-more-checker-label" onClick={(e) => setCheckedShowMore(!checkedShowMore)}>
                    <i
                        className={classNames({
                            pointer: true,
                            "bx bx-chevrons-down": checkedShowMore,
                            "bx bx-chevrons-up": !checkedShowMore,
                        })}
                    ></i>
                    <label className="bold pointer">{checkedShowMore ? t("view.more") : t("worklog.hide")}</label>
                </div>

                <Dialog modal header={t("worklog.date-detail")} style={{ width: "60vw" }} visible={showDetail} onHide={() => setShowDetail(false)}>
                    <XLayout>
                        <XLayout_Center>
                            <div className="grid" style={{ borderBottom: "1px solid #dddbd6" }}>
                                <div className="col-6">
                                    <div className="flex justify-content-between align-items-stretch">
                                        <div>{getResponsibleUser()}</div>
                                        <div>
                                            <label style={{ fontWeight: "550" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                                <small> {`${t("worklog.task")}  ${sumTotalHour.workDate && t("worklog.date") + " " + sumTotalHour.workDate}`}</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {t("worklog.hour")}{" "}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {t("worklog.actual-ot-hour")}{" "}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {t("worklog.plan-ot-hour")}{" "}
                                    </label>
                                </div>
                            </div>
                            {listUseDate &&
                                listUseDate.length > 0 &&
                                listUseDate.map((_item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <div className="grid mt-2" style={{ borderBottom: "1px solid #dddbd6" }}>
                                                <div className="col-6">
                                                    <label style={{ fontWeight: "550" }} className={"p-inputtext-sm line-clamp-1 mb-2 w-full"}>
                                                        {" "}
                                                        {CommonFunction.isEmpty(_item.projectName) ? t("personal-task") : t("group.type.project") + ": " + _item.projectName}{" "}
                                                    </label>
                                                    {_item.childs.map((_itemChild, indexChild) => {
                                                        return (
                                                            <React.Fragment key={indexChild}>
                                                                <div className="flex">
                                                                    <i className="bx bx-task mr-2" />
                                                                    <label title={_itemChild.taskName} className={`p-inputtext-sm  w-full line-clamp-1 name-task-${indexChild}`}>
                                                                        {" "}
                                                                        {_itemChild.taskName}{" "}
                                                                    </label>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                                <div className="col-2">
                                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                                        {(_item.totalHour || 0).toFixed(2) + t("worklog.HourView")}
                                                    </label>
                                                    {_item.childs.map((_itemChild, indexChild) => {
                                                        return (
                                                            <React.Fragment key={indexChild}>
                                                                <label style={{ textAlign: "center" }} className={"p-inputtext-sm p-d-block w-full"}>
                                                                    {(_itemChild.totalHour || 0).toFixed(2) + t("worklog.HourView")}
                                                                </label>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                                <div className="col-2">
                                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                                        {(_item.otHourLogged || 0).toFixed(2) + t("worklog.HourView")}
                                                    </label>
                                                    {_item.childs.map((_itemChild, indexChild) => {
                                                        return (
                                                            <React.Fragment key={indexChild}>
                                                                <label style={{ textAlign: "center" }} className={"p-inputtext-sm p-d-block w-full"}>
                                                                    {(_itemChild.otHourLogged || 0).toFixed(2) + t("worklog.HourView")}
                                                                </label>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                                <div className="col-2">
                                                    <label style={{ fontWeight: "550", textAlign: "center" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                                        {(_item.otHour || 0).toFixed(2) + t("worklog.HourView")}
                                                    </label>
                                                    {_item.childs.map((_itemChild, indexChild) => {
                                                        return (
                                                            <React.Fragment key={indexChild}>
                                                                <label style={{ textAlign: "center" }} className={"p-inputtext-sm p-d-block w-full"}>
                                                                    {(_itemChild.otHour || 0).toFixed(2) + t("worklog.HourView")}
                                                                </label>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            <hr></hr>
                            <div className="grid">
                                <div className="col-6">
                                    <label style={{ fontWeight: "550", marginLeft: "10px", color: "rgb(213, 7, 7)" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {t("worklog.totalHour")}{" "}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center", color: "rgb(213, 7, 7)" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {(sumTotalHour.totalHour || 0).toFixed(2) + t("worklog.HourView")}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center", color: "rgb(213, 7, 7)" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {(sumTotalHour.otHourLogged || 0).toFixed(2) + t("worklog.HourView")}
                                    </label>
                                </div>
                            </div>
                            <div className="grid">
                                <div className="col-6">
                                    <label style={{ fontWeight: "550", marginLeft: "10px", color: "green" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {t("worklog.remain")}{" "}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center", color: "green" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {sumTotalHour.totalRemain + t("worklog.HourView")}{" "}
                                    </label>
                                </div>
                                <div className="col-2">
                                    <label style={{ fontWeight: "550", textAlign: "center", color: "green" }} className={"p-inputtext-sm p-d-block mb-2 w-full"}>
                                        {" "}
                                        {(sumTotalHour.totalRemainOtHour || 0) + t("worklog.HourView")}{" "}
                                    </label>
                                </div>
                            </div>
                        </XLayout_Center>
                    </XLayout>
                </Dialog>
            </div>
        </>
    );
}
WorkLogTask = forwardRef(WorkLogTask);
export default WorkLogTask;

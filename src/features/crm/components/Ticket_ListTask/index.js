import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import classNames from "classnames";
import { Button } from "primereact/button";
import _ from "lodash";
import CommonFunction from "@lib/common";
import { Chip } from "primereact/chip";
import { Tooltip } from "primereact/tooltip";
import LoadingBar from "@ui-lib/loading-bar/LoadingBar";

import EmptyDataCompact from "@ngdox/ui-lib/dist/components/empty-data/EmptyDataCompact";
import RequestApi from "services/RequestApi";
import XToolbar from "@ui-lib/x-toolbar/XToolbar";
import DisplayUtil from "components/util/DisplayUtil";
import Ticket_ListTask_Detail from "features/crm/components/Ticket_ListTask_Detail";
// import TicketEnumeration from "../ticket-common/TicketEnumeration";
import TicketApi from "services/TicketApi";
import TaskUtil from "components/util/TaskUtil";
import Enumeration from "@lib/enum";
import TicketEnumeration from "../../ticket-common/TicketEnumeration";

function Ticket_ListTask(props, ref) {
  const t = CommonFunction.t;
  const { user } = props;
  const {
    groups,
    filterByObj,
    categories,
    resources,
    afterSubmit,
    rootGroupId,
    projectId,
    parent,
  } = props;

  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [rootGroupId, setRootGroupId] = useState(null);
  // const [groups, setGroups] = useState(null);
  const [entity, setEntity] = useState(null);
  const [entityId, setEntityId] = useState(null);
  // const refInitRequestDialog = useRef();
  // const refRequestDetail = useRef();
  const refTaskDetail = useRef();

  // const menuButtonAdd = [{
  //     label: t("request.create"),
  //     icon: 'bx bx-copy',
  //     command: (e) => {
  //         createRequest();
  //     }
  // }]
  const [lazy, setLazy] = useState({
    page: 0,
    size: 25,
    affect: {
      keyword: "",
      groupId: -1,
      listBy: null,
      parentId: 0,
      rootKey: "",
      rootType: "",
    },
    condition: {
      groupId: -1,
      conditions: [
        {
          logicOperator: "",
          conditionType: "GROUP",
          filterType: "ROLE",
          children: [],
        },
      ],
    },
  });

  /**
   * load something
   */
  useEffect(() => {
    // let _groups = []
    // _groups.push({id: project.groupId, name: project.name, code: project.code, projectId: project.id, phaseId: 0});

    // if (phases && phases.length > 0) {
    //     phases.forEach((_phase) => {
    //         _groups.push({id: _phase.groupId, name: _phase.name, code: _phase.code, projectId: project.id, phaseId: _phase.id});
    //     });
    // }
    // setGroups(_groups);
    loadLazyData(lazy);
  }, []);

  useImperativeHandle(ref, () => ({
    /**
     * add
     */
    show: (_listBy, parentInfo, attribute) => {
      // setRootGroupId(attribute.rootGroupId) // for user in same group
      // setGroups(attribute.groups) // for task group id
      setEntity(attribute.entity); // for custom field
      setEntityId(attribute.entityId);
    },
    /**
     * edit
     */
    edit: (_obj) => {},

    reload: () => {
      loadLazyData(lazy);
    },
  }));

  /**
   * get role condition
   * @returns
   */
  const bindCondition = (_lazy) => {
    let conditions = [];

    // filter by group
    let _groupRoleCondition = {
      logicOperator: "",
      conditionType: "GROUP",
      filterType: "ROLE",
      children: [
        {
          logicOperator: "",
          conditionType: "RULE",
          filterType: "ROLE",
          fieldName: null,
          values: [window.app_context.keycloak.tokenParsed.sub],
        },
      ],
    };

    _groupRoleCondition.children = [];

    if (_groupRoleCondition.children.length > 0) {
      _groupRoleCondition.children[0].logicOperator = "";
    }

    // filter by keywork
    if (!CommonFunction.isEmpty(_lazy.affect.keyword)) {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "name",
        operator: "LIKE",
        values: [_lazy.affect.keyword],
      });
    }

    if (_lazy.affect.listBy && _lazy.affect.listBy === "PARENT") {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "LONG",
        fieldName: "parent_id",
        operator: "=",
        values: [_lazy.affect.parentId],
      });
    }

    if (_lazy.affect.listBy && _lazy.affect.listBy === "ROOT") {
      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "root_type",
        operator: "=",
        values: [_lazy.affect.rootType],
      });

      conditions.push({
        logicOperator: "AND",
        conditionType: "RULE",
        filterType: "FIELD",
        fieldType: "STRING",
        fieldName: "root_key",
        operator: "=",
        values: [_lazy.affect.rootKey],
      });
    }

    if (conditions.length > 0) {
      conditions[0].logicOperator = "";
    }

    return conditions;
  };

  const loadLazyData = async (_lazy) => {
    setLoading(true);
    _lazy = _lazy ? _lazy : _.cloneDeep(lazy);
    _lazy.affect.listBy = filterByObj.listBy;
    if (
      _lazy.affect.listBy === "ROOT" &&
      filterByObj.rootKey &&
      filterByObj.rootType
    ) {
      _lazy.affect.rootType = filterByObj.rootType;
      _lazy.affect.rootKey = filterByObj.rootKey;
    } else if (_lazy.affect.listBy === "PARENT" && filterByObj.parentId) {
      _lazy.affect.parentId = filterByObj.parentId;
    }
    _lazy.condition.conditions = bindCondition(_lazy);
    _lazy.body = {};
    _lazy.body.conditions = _lazy.condition.conditions;
    _lazy.body.checkPermission = false;
    // console.log("hellooo",_lazy)
    TicketApi.list(_lazy).then((res) => {
      if (res) {
        _lazy.page = res.page;
        _lazy.size = res.pageSize;
        _lazy.total = res.total;
        _lazy.from = res.page * res.pageSize + 1;
        _lazy.to = Math.min(res.page * res.pageSize + res.pageSize, res.total);
        _lazy.last = (res.page + 1) * res.pageSize >= res.total;
        _lazy.first = res.page === 0;

        // prepare data
        let _data = res.content;
        _data.map((o) => {
          if (o.type === "REQUEST") {
            RequestApi.get(o.id).then((requestRes) => {
              o = _.cloneDeep(requestRes);
            });
          }
        });
        // state
        setLazy(_lazy);
        setTasks(_data);
      }

      setLoading(false);
    });
  };

  /**
   * next page
   */
  const nextPage = () => {
    let _lazy = _.cloneDeep(lazy);

    _lazy.page = lazy.page + 1;
    loadLazyData(_lazy);
  };

  /**
   * previous page
   */
  const previousPage = () => {
    let _lazy = _.cloneDeep(lazy);

    _lazy.page = lazy.page - 1;
    loadLazyData(_lazy);
  };

  /**
   * refesh
   */
  const refresh = () => {
    let _lazy = _.cloneDeep(lazy);
    _lazy.page = 0;
    loadLazyData(_lazy);
  };
  /**
   * create task
   */
  const createTask = () => {
    // if (!ProjectUtil.per(window.app_context.user
    //     , ProjectUtil.const_RA().project_issue.code
    //     , ProjectUtil.const_RA().project_issue.action.create_task
    //     , project.groupId)) {
    //     CommonFunction.toastWarning(t('you-dont-have-permission-to-do-this-action-please-contact-pm-or-administrator'));
    //     return
    // }
    refTaskDetail.current.create(TicketEnumeration.type.task);
  };
  /**
   * create task
   */
  // const createRequest = () => {
  //     // refInitRequestDialog.current.open();
  // }
  /**
   * edit task
   * @param {*} selected
   * @param {*} mode
   */
  const editTask = async (selected) => {
    refTaskDetail.current.update(selected);
  };
  /**
   * on task submitted
   */
  const onTaskSubmitted = (_task, _mode) => {
    if (_task && _task.task && _task.task.id) {
      TicketApi.get(_task.task.id).then((_impactedTask) => {
        if (_impactedTask) {
          try {
            let _tasks = _.cloneDeep(tasks);
            if (!_tasks) {
              _tasks = [];
            }
            if (_mode === Enumeration.crud.create) {
              _tasks.unshift(_impactedTask);
            } else if (_mode === Enumeration.crud.update) {
              let _index = _.findIndex(_tasks, function (e) {
                return e.task.id == _impactedTask.task.id;
              });
              _tasks[_index].task = _impactedTask.task;
            }
            setTasks(_tasks);
          } catch (error) {
            console.log("on task submitted error", error);
          }
          if (props.onTaskSubmitted) {
            props.onTaskSubmitted(_impactedTask.task, _mode);
          }
        }
      });
    }
  };

  /**
   * view workflow process
   * @param {*} request
   */
  const viewWorkflowProcess = (task) => {
    // if (task.type === 'REQUEST') {
    //     refRequestDetail.current.init({id: task.id});
    // } else {
    //     refRequestDetail.current.init({id: task.parentId});
    // }
  };

  return (
    <div className="page-container overflow-hidden project-management-tab-container position-relative w-full">
      <div className="flex w-full h-full task-page-container overflow-hidden">
        <div className="position-relative w-full border-all">
          <LoadingBar loading={loading} top={46} />
          <XToolbar
            className="p-0 mb-2 x-toolbar-zIndex-none"
            left={() => (
              <div className="task-toolbar-tools flex p-2">
                <Button
                  label={t("task.create")}
                  icon="bx bx-plus"
                  className="p-button-success"
                  // disabled={!CommonFunction.per(window.app_context.user, "task", "ADD", project.groupId)}
                  // model={menuButtonAdd}
                  style={{ width: "fit-content" }}
                  onClick={() => createTask()}
                />
                <Button
                  icon="bx bx-refresh"
                  className="p-button-rounded p-button-text p-button-secondary"
                  onClick={refresh}
                  tooltip={t("button.refresh")}
                  tooltipOptions={{
                    position: "bottom",
                    mouseTrack: true,
                    mouseTrackTop: 15,
                  }}
                />
              </div>
            )}
            right={() => (
              <div>
                <div className="task-toolbar-paging flex align-items-center">
                  <span>{lazy.from}</span>
                  <span className="mr-1 ml-1">-</span>
                  <span>{lazy.to}</span>
                  <span className="mr-1 ml-1">/</span>
                  <span>{lazy.total}</span>
                  <Button
                    icon="bx bx-chevron-left"
                    className="p-button-rounded p-button-text p-button-secondary ml-2"
                    onClick={previousPage}
                    disabled={lazy.first}
                    tooltip={t("button.newer")}
                    tooltipOptions={{
                      position: "bottom",
                      mouseTrack: true,
                      mouseTrackTop: 15,
                    }}
                  />

                  <Button
                    icon="bx bx-chevron-right"
                    className="p-button-rounded p-button-text p-button-secondary"
                    onClick={nextPage}
                    disabled={lazy.last}
                    tooltip={t("button.older")}
                    tooltipOptions={{
                      position: "bottom",
                      mouseTrack: true,
                      mouseTrackTop: 15,
                    }}
                  />
                </div>
              </div>
            )}
          />
          {/* Real data display */}
          <div
            id="task-group-container"
            className="flex flex-column w-full h-full overflow-auto task-items-container"
          >
            {tasks && tasks.length === 0 && (
              <EmptyDataCompact message={t("task.empty-task")} />
            )}

            {tasks &&
              tasks.length > 0 &&
              tasks.map((taskResponse, index) => {
                let task = taskResponse.task;
                return (
                  <React.Fragment key={index}>
                    {task.showGroup && (
                      <div
                        className="x-group mb-0 pt-2 pl-2"
                        id={`task-group-index-${task.groupId}`}
                      >
                        <span>{task.groupName}</span>
                      </div>
                    )}

                    <div className="border-bottom flex task-item-container">
                      <div className="task-item-actions">
                        {/* <i className='bx bx-dots-vertical-rounded link-button text-grey-8' onClick={(e) => handleRequestMenu(e, request)}></i> */}
                        {/* {task.workFlow &&
                                                <>
                                                    <Tooltip target=".request-item-action-view-process" content={t("request.view-process")} position="bottom"/>
                                                    <i className='bx bx-git-branch link-button text-grey-7 small request-item-action-view-process' onClick={() => viewWorkflowProcess(task)}></i>
                                                </>
                                                } */}
                        {task.type !== "REQUEST" && (
                          <>
                            <Tooltip
                              target=".request-item-action-edit"
                              content={t("task.update")}
                              position="bottom"
                            />
                            <i
                              className="bx bx-pencil link-button text-grey-7 small request-item-action-edit"
                              onClick={() => editTask(task.id)}
                            ></i>
                          </>
                        )}
                      </div>

                      <div className="flex align-items-center p-1">
                        <div className="flex flex-column">
                          <div className="flex align-items-center">
                            {task.type === "TASK" && (
                              <>
                                <Tooltip
                                  target={`.user-task-state.${task.state}`}
                                  content={t(
                                    `request.task.state.${task.state}`
                                  )}
                                  position="bottom"
                                />
                                <i
                                  className={classNames({
                                    "user-task-state task-list-quick-action bx": true,
                                    "PENDING bx-pause text-grey-7":
                                      task.state === "PENDING",
                                    "IN_PROGRESS bx-play text-teal":
                                      task.state === "IN_PROGRESS",
                                    "DEFERRED bx-stopwatch text-orange-9":
                                      task.state === "DEFERRED",
                                    "CANCELED bx-x text-red-9":
                                      task.state === "CANCELED",
                                    "COMPLETED bx-check text-green":
                                      task.state === "COMPLETED",
                                    "REVIEWING bx-help text-purple":
                                      task.state === "REVIEWING",
                                  })}
                                />

                                <Tooltip
                                  target={`.user-important-task`}
                                  content={t(`task.important`)}
                                  position="bottom"
                                />
                                <i
                                  className={classNames({
                                    "user-important-task task-list-quick-action ml-1 mr-2": true,
                                    "bx bx-tag-alt text-grey-7":
                                      !task.important,
                                    "bx bxs-tag-alt text-yellow-9":
                                      task.important,
                                  })}
                                />

                                <span
                                  onClick={() => editTask(task.id)}
                                  className="bold-and-color link-button mr-2"
                                >
                                  {task.name}
                                </span>
                              </>
                            )}
                            {task.type === "REQUEST" && (
                              <span className="bold-and-color mr-2">
                                {task.name}
                              </span>
                            )}
                          </div>
                          <div className="task-workflow-info flex align-items-center mb-1">
                            <div className="bx bx-user h-full text-grey-6 mr-1"></div>
                            <span className="text-grey-8 mr-1">
                              {t("task.list.request-by")}
                            </span>
                            {task.requestedByUser
                              ? DisplayUtil.displayChipUser(
                                  task.requestedByUser
                                )
                              : task.requestedBy &&
                                DisplayUtil.displayChipUser(task.requestedBy)}
                            <i className="bx bx-right-arrow-alt text-primary mr-1 ml-1"></i>
                            {task.responsibleUser
                              ? DisplayUtil.displayChipUser(
                                  task.responsibleUser
                                )
                              : DisplayUtil.displayChipUser(task.responsibleId)}
                            {task.deadline && (
                              <div className="ml-2 flex">
                                <span className="bx bx-timer text-grey-6"></span>
                                <span className="task-page-task-deadline ml-1 text-grey-8">
                                  {`${t("task.due")}: `}
                                </span>
                                <div
                                  className={classNames({
                                    "task-page-task-deadline": true,
                                    "text-red": task.isOverDue,
                                    "text-grey-8": !task.isOverDue,
                                  })}
                                >
                                  {CommonFunction.formatDateTime(task.deadline)}
                                  {TaskUtil.getDueDisplay(task)}
                                </div>
                              </div>
                            )}

                            {(task.state === "CANCELED" ||
                              task.state === "COMPLETED") &&
                              task.closedOn && (
                                <div className="ml-2">
                                  <span className="bx bx-calendar-check text-grey-6"></span>
                                  <span className="task-page-task-deadline ml-1 text-grey-8">
                                    {`${t("task.close")}: `}
                                  </span>
                                  <span
                                    className={classNames({
                                      "task-page-task-deadline ml-1": true,
                                      "text-grey-8": !task.deadline,
                                      "text-red":
                                        task.deadline &&
                                        task.isCompleteOverDue === true,
                                      "text-green":
                                        task.deadline &&
                                        task.isCompleteOverDue === false,
                                    })}
                                  >
                                    {CommonFunction.formatDateTime(
                                      task.closedOn
                                    )}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* workflow info */}
                          {(task.workFlow || task.activity) && (
                            <div
                              className="task-workflow-info task-view-process link-button mb-1"
                              onClick={() => viewWorkflowProcess(task)}
                            >
                              <Tooltip
                                target=".task-view-process"
                                content={t("request.view-process")}
                                position="bottom"
                              />

                              {task.workFlow && (
                                <>
                                  <span className="bx bx-git-branch mr-1 text-grey-6"></span>
                                  <span className="mr-1 text-grey-8">
                                    {task.workFlow.name}
                                  </span>
                                </>
                              )}
                              {task.activity && (
                                <>
                                  <span className="bx bx-radio-circle-marked mr-1 text-grey-6"></span>
                                  <span className="mr-1 text-grey-8">
                                    {task.activity.name}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {/*REQUEST TASKS INFOR*/}
                          <div className="pending-task-container mt-1">
                            {task.type === "REQUEST" &&
                              task.pendingTasks &&
                              task.pendingTasks.map((requestTask, index) => (
                                <div
                                  key={index}
                                  className="pending-task-item flex align-items-center width-fit-content mb-1"
                                >
                                  <div
                                    className={`flex align-items-center pending-task-name-${requestTask.id}`}
                                  >
                                    <Tooltip
                                      target={`.pending-task-name-${requestTask.id}`}
                                      content={t(
                                        `request.task.state.${requestTask.state}`
                                      )}
                                      position="bottom"
                                    />
                                    {requestTask.state === "PENDING" && (
                                      <i className="bx bx-pause text-grey-6 ml-1"></i>
                                    )}
                                    {requestTask.state === "IN_PROGRESS" && (
                                      <i className="bx bx-play text-green ml-1" />
                                    )}
                                    {requestTask.state === "DEFERRED" && (
                                      <i className="bx bx-stop text-red-9 ml-1" />
                                    )}
                                    <span>{requestTask.name}</span>
                                  </div>
                                  {requestTask.responsibleUser && (
                                    <div
                                      className={`flex align-items-center pending-task-responsible-${requestTask.id}`}
                                    >
                                      <Tooltip
                                        target={`.pending-task-responsible-${requestTask.id}`}
                                        content={`${t(
                                          "request.responsible"
                                        )}: ${
                                          requestTask.responsibleUser.fullName
                                        }`}
                                        position="bottom"
                                      />
                                      <Chip
                                        label={
                                          requestTask.responsibleUser.fullName
                                        }
                                        image={
                                          requestTask.responsibleUser.avatar
                                            ? `${process.env.REACT_APP_API_URL}storage/file/preview/${requestTask.responsibleUser.avatar}`
                                            : `https://ui-avatars.com/api/?background=random&name=${requestTask.responsibleUser.fullName}`
                                        }
                                        className="tiny ml-2"
                                      />
                                    </div>
                                  )}
                                  {requestTask.deadline && (
                                    <div className="ml-2 flex">
                                      <span className="bx bx-timer text-grey-6"></span>
                                      <span className="task-page-task-deadline ml-1 text-grey-8">
                                        {`${t("task.due")}: `}
                                      </span>
                                      <div
                                        className={classNames({
                                          "task-page-task-deadline": true,
                                          "text-red": requestTask.isOverDue,
                                          "text-grey-8": !requestTask.isOverDue,
                                        })}
                                      >
                                        {CommonFunction.formatDateTime(
                                          requestTask.deadline
                                        )}
                                        {/* {TaskUtil.getDueDisplay(requestTask)} */}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      </div>
      <Ticket_ListTask_Detail
        ref={refTaskDetail}
        filterByObj={filterByObj}
        groups={groups}
        projectId={projectId}
        rootGroupId={rootGroupId}
        categories={categories}
        resources={resources}
        parent={parent}
        afterSubmit={afterSubmit}
        onSubmitTask={onTaskSubmitted}
      />
    </div>
  );
}

Ticket_ListTask = forwardRef(Ticket_ListTask);

export default Ticket_ListTask;

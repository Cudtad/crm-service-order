import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import _ from "lodash";
import { SplitButton } from "primereact/splitbutton";
import { Timeline } from "primereact/timeline";
import CommonFunction from "@lib/common";
import { Button } from "primereact/button";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';

function HistoriesActivity({
  tasks,
  setTasks,
  updateTask,
  permission,
  handleSeeMore,
  paging,
}, ref) {
  const t = CommonFunction.t;

  useImperativeHandle(ref, () => ({
    showAll: () => {
      setTasks((tasks) =>
        tasks.map((t) =>
        ({
          ...t,
          isOpen: true,
        })
        )
      )
    }
  }))

  const getTextDay = (task) => {
    if (task.deadline) {
      if (new Date(task.deadline).getTime() - new Date().getTime() < 0)
        return (
          <span className="mr-2 text-pink-400 font-semibold crm-text-12">
            {new Date(task.deadline).toLocaleDateString()}{" "}
          </span>
        );
    }
    return (
      <span className="mr-2  crm-text-12">
        {new Date(task.deadline || task.startDate).toLocaleDateString()}{" "}
      </span>
    );
  };

  const renderUser = (user) => {
    return <div className="ml-2" key={user.id}>
      <XAvatar
        className="employee-avatar"
        avatar={CommonFunction.getImageUrl(null, user.fullName, 15, 15)}
        name={user.fullName}
        label={() => <span>{user.fullName}</span>}
        size="15px"
      />
    </div>
  }

  const renderContent = (item) => {
    const items = [
      {
        label: t("common.update"),
        icon: "bx bx-pencil",
        disabled: !permission?.update_task,
        command: updateTask(item),
      },
      {
        label: t("common.delete"),
        disabled: !permission?.delete,
        icon: "bx bx-trash text-red",
        //   command: (e) => {
        //     deleteAccount(rowData);
        //   },
      },
    ];

    return (
      <div className="flex w-full">
        <div className="w-full">
          <p className="link-button m-0 mb-2">
            {item.task.name}{" "}
            <span className="border-round-sm border-1  text-500 px-1 mr-2">
              {t(`task.state.sort.${item.task.state}`)}
            </span>
          </p>
          {!item.isOpen ? (
            <span className="crm-text-13">
              {t("crm-sale.activity.priority")}: {item.task.priorityName}
            </span>
          ) : (
            <>
              <p className="crm-text-13">
                {" "}
                {t("crm-sale.activity.priority")}: {item.task.priorityName}
              </p>
              <div className="flex">
                {" "}
                <span className="crm-text-13">
                  {t("common.responsible")} :
                </span>{" "}
                <div>
                  {item.task.responsible.map(renderUser)}
                </div>
              </div>
              <p className="flex align-items-center">
                <span className="crm-text-13">
                  {" "}
                  {t("action.description")} :
                </span>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: item.task.description }}
                  className="crm-text-13"
                ></span>
              </p>
            </>
          )}
        </div>
        <div className="flex w-full justify-content-end align-items-baseline">
          {getTextDay(item.task)}
          <SplitButton
            dropdownIcon="bx bxs-down-arrow text-xs"
            className="p-button-info"
            buttonClassName="hidden"
            tooltip={t("action.detail")}
            tooltipOptions={{ position: "top" }}
            menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 menu-dropdown-button"
            model={items}
          />
        </div>
      </div>
    );
  };

  const renderOpposite = (item) => {
    const className = item.isOpen
      ? "bx bx-chevron-down"
      : "bx bx-chevron-right";
    return (
      <i
        className={`${className} text-3xl font-bold`}
        onClick={() => {
          setTasks((tasks) =>
            tasks.map((t) =>
              t.task.id === item.task.id
                ? {
                  ...t,
                  isOpen: !t.isOpen,
                }
                : t
            )
          );
        }}
      ></i>
    );
  };

  const renderMarker = (item) => {
    const marker = {
      1: <i className="bx bx-task text-3xl color-task"></i>,
      2: <i className="bx bx-phone text-3xl color-phone"></i>,
      3: <i className="bx bx-envelope text-3xl color-email"></i>,
      4: <i className="bx bxs-calendar-plus text-3xl color-calendar"></i>,
    };
    return marker[item.task.activityTypeId];
  };

  const isShowSeeMore =
    (paging.page + 1) * paging.size < paging.total ? true : false;

  return (
    <div className="card mt-3">
      <Timeline
        className="crm-timeline"
        align="left"
        value={tasks}
        opposite={renderOpposite}
        content={renderContent}
        marker={renderMarker}
      />
      { }
      {isShowSeeMore && (
        <div className="mt-4 text-center">
          <Button
            onClick={handleSeeMore}
            label="Xem thêm"
            className="p-button p-component p-button-sm w-8rem py-2"
          />
        </div>
      )}
    </div>
  );
};

HistoriesActivity = forwardRef(HistoriesActivity)
export default HistoriesActivity

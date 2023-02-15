import React from "react";
import { Tooltip } from "primereact/tooltip";
import CommonFunction from "@lib/common";

export const renderHourglass = (date) => {
  const t = CommonFunction.t;
  if (!date) return "";
  const _date = new Date(date).getTime();
  const now = new Date(new Date().setHours(0,0,0,0)).getTime()

  const _distance = _date - now;
    const id = CommonFunction.uuid()

  if (_distance > 86400000) {
    return "";
  }
  if (_distance >= 0 && _distance < 86400000) {
    return (
      <span className="crm-hourglass">
        <Tooltip target={`.knob-${id}`} content={t("task.due.due")} />
        <i className={`due bx bx-hourglass knob-${id}`}></i>
      </span>
    );
  }
  if (_date - now < 0) {
    return (
      <span className="crm-hourglass">
        <Tooltip target={`.knob-${id}`} content={t("task.due.overdue")} />
        <i className={`overdue bx bxs-hourglass-bottom knob-${id}`}></i>
      </span>
    );
  }
};

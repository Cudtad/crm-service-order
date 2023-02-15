import { confirmDialog } from "primereact/confirmdialog";
import React from "react";
import CommonFunction from "@lib/common";

const CrmConfirmDialog = ({ message, accept, header, acceptLabel,reject }) => {
  const t = CommonFunction.t;
  return confirmDialog({
    className: "crm-confirm-dialog crm-dialog",
    message,
    header,
    icon: "pi pi-exclamation-triangle",
    acceptClassName: "link-button text-white",
    rejectClassName: "",
    acceptLabel: acceptLabel || t("action.delete"),
    rejectLabel: t("action.cancel"),
    accept,
    reject,
  });
};

export default CrmConfirmDialog;

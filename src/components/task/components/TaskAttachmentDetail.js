import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import _ from "lodash";
import classNames from "classnames";
import CommonFunction from "@lib/common";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import "./scss/Task_Attachment.scss";
import Enumeration from "@lib/enum";
import TaskBaseApi from "services/TaskBaseApi";

import CrmFieldEdittingValue from "../../../features/crm/components/CrmFieldEdittingValue";
import CrmXFileUpload from "../../x-fileupload/CrmXFileUpload";

function TaskAttachmentDetail(props, ref) {
  const emptyValidate = {
    file: null,
    name: null,
    versionNo: null,
  };

  const {
    taskId,
    application,
    refType,
    attachmentSelectced,
    disableInformation,
    maxFileSize,
    invalidFileSizeMessageDetail,
    cancel,
    setLoading,
    reload,
  } = props;

  const t = CommonFunction.t;

  const [validate, setValidate] = useState(emptyValidate);

  const [attachment, setAttachment] = useState();

  useEffect(() => {
    setAttachment(attachmentSelectced);
  }, [attachmentSelectced]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      submit();
    },
  }));

  const submit = () => {
    let isValid = performValidate([]);
    if (isValid) {
      if (taskId) {
        setLoading(true);
        let _attachment = _.cloneDeep(attachment);
        let refId = taskId;
        let _file = _attachment.file;
        let _data = {
          application: application,
          refType: refType,
          refId: refId,
          name: _attachment.name,
          versionNo: _attachment.versionNo,
          description: _attachment.description,
          businessType: _attachment.businessType,
        };

        switch (_attachment.state) {
          case Enumeration.crud.create:
            TaskBaseApi.createAttachments(
              null,
              _file ? _file.fileContent : null,
              _data
            )
              .then((res) => {
                if (res) {
                  if (cancel) {
                    cancel();
                  }
                  if (reload) {
                    reload('create');
                  }
                  CommonFunction.toastSuccess(t("common.save-success"));
                } else {
                  CommonFunction.toastError();
                }
                setLoading(false);
              })
              .catch((error) => {
                CommonFunction.toastError(error);
                setLoading(false);
              });
            break;
          case Enumeration.crud.update:
            TaskBaseApi.updateAttachments(
              null,
              _attachment.id,
              _file.id ? null : _file.fileContent,
              _data
            )
              .then((res) => {
                if (res) {
                  if (cancel) {
                    cancel();
                  }
                  if (reload) {
                    reload('update');
                  }
                  CommonFunction.toastSuccess(t("common.save-success"));
                } else {
                  CommonFunction.toastError();
                }
                setLoading(false);
              })
              .catch((error) => {
                CommonFunction.toastError(error);
                setLoading(false);
              });
            break;

          default:
            break;
        }
      } else {
        CommonFunction.toastError();
      }
    }
  };

  const applyChange = (prop, val) => {
    let _detail = _.cloneDeep(attachment);

    _detail[prop] = val;

    setAttachment(_detail);
    performValidate([prop], _detail);
  };

  const onFileSelect = (e) => {
    if (e.files && e.files.length > 0) {
      if (e.files[0].size > 0) {
        let _attachment = _.cloneDeep(attachment);
        let _attachmentFile = _attachment.file;
        _attachmentFile.id = null; // set file's id null to mark upload
        _attachmentFile.fileContent = e.files[0];
        _attachmentFile.name = e.files[0].name;
        _attachmentFile.signedUsers = []; // remove signed user
        _attachmentFile.fileChanged = true;

        _attachment.name = e.files[0].name;
        _attachment.versionNo = "0.0.0";
        setAttachment(_attachment);
      } else {
        CommonFunction.toastWarning(
          t("task-base.attachment.file-empty-content")
        );
      }
    }
  };

  const performValidate = (props, _currentDetail) => {
    let result = _.cloneDeep(validate),
      isValid = true;
    let _detail = _currentDetail ? _currentDetail : attachment;
    // validate all props
    if (props.length === 0) {
      for (const property in result) {
        props.push(property);
      }
    }

    // validate props
    props.forEach((prop) => {
      switch (prop) {
        case "file":
          result[prop] = _detail?.file?.name
            ? null
            : `${t("task.attachment.file")} ${t("message.cant-be-empty")}`;
          break;

        case "name":
          result[prop] = _detail?.name
            ? null
            : `${t("task.attachment.file.name")} ${t("message.cant-be-empty")}`;
          break;

        case "versionNo":
          result[prop] = _detail?.versionNo
            ? null
            : `${t("task.attachment.file.version")} ${t(
              "message.cant-be-empty"
            )}`;
          break;

        default:
          break;
      }
    });

    setValidate(result);

    // check if object has error
    for (const property in result) {
      if (result[property]) {
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  const handleChangeVersionNo = (e) => {
    applyChange("versionNo", e.target.value);
  };

  const handleChangeName = (e) => {
    applyChange("name", e.target.value);
  };

  const handleChangeDescription = (e) => {
    applyChange("description", e.target.value);
  };

  return (
    <div className="">
      <div className=""></div>
      <div className="">
        <div className="p-fluid fluid formgrid grid p-0">
          <div className={`p-field col-12 task-attachment-file-upload`}>
            <CrmFieldEdittingValue
              label={t("task.attachment.file")}
              require={true}
            >
              <div className="field">
                <div className="flex align-items-center">
                  <InputText
                    className={classNames({
                      "x-file-upload-field": true,
                    })}
                    value={attachment?.file?.name}
                    disabled
                    onChange={(e) => { }}
                  />
                  <CrmXFileUpload
                    type="in-field"
                    chooseOptions={{
                      // icon: "bx bx-cloud-upload",
                      label: t("button.choose-file"),
                    }}
                    onSelect={(e) => onFileSelect(e)}
                    maxFileSize={maxFileSize}
                    invalidFileSizeMessageDetail={invalidFileSizeMessageDetail}
                    accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .7z"
                  />
                </div>
                {validate.file && (
                  <small className="p-invalid">{validate.file}</small>
                )}
              </div>
            </CrmFieldEdittingValue>
          </div>

          {!disableInformation && (
            <>
              <div className="col-6">
                <CrmFieldEdittingValue
                  label={t("task.attachment.file.name")}
                  require={true}
                >
                  <div className="field">
                    <div>
                      <InputText
                        value={attachment?.name}
                        placeholder={t("task.attachment.file.name")}
                        onChange={handleChangeName}
                      />
                    </div>
                    {validate.name && (
                      <small className="p-invalid">{validate.name}</small>
                    )}
                  </div>
                </CrmFieldEdittingValue>
              </div>
              <div className="col-6">
                <CrmFieldEdittingValue
                  label={t("task.attachment.file.version")}
                  require={true}
                >
                  <div className="field">
                    <div>
                      <InputText
                        value={attachment?.versionNo}
                        placeholder={t("task.attachment.file.version")}
                        onChange={handleChangeVersionNo}
                      />
                    </div>
                    {validate.versionNo && (
                      <small className="p-invalid">{validate.versionNo}</small>
                    )}
                  </div>
                </CrmFieldEdittingValue>
              </div>

              <div className={"col-12"}>
                <CrmFieldEdittingValue
                  label={t("task.attachment.file.description")}
                >
                  <InputTextarea
                    value={attachment?.description}
                    placeholder={t("task.attachment.file.description")}
                    onChange={handleChangeDescription}
                    rows={6}
                  ></InputTextarea>
                </CrmFieldEdittingValue>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

TaskAttachmentDetail = forwardRef(TaskAttachmentDetail);
export default TaskAttachmentDetail;

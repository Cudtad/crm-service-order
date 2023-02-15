import "./scss/Task_Attachment.scss";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import Enumeration from "@lib/enum";
import CommonFunction from "@lib/common";
import LoadingBar from "@ui-lib/loading-bar/LoadingBar";
import { XLayout, XLayout_Center } from "@ui-lib/x-layout/XLayout";
import TaskBaseApi from "services/TaskBaseApi";

import CrmCreateDialog from "features/crm/components/CrmCreateDialog";
import TaskAttachmentDetail from "./TaskAttachmentDetail";
import { SplitButton } from "primereact/splitbutton";
import XFilePreview from "@ui-lib/x-filepreview/XFilePreview";
import { PREVIEW_NUMBER } from "../../../features/crm/utils/constants";
import { formatSize } from "../../../features/crm/utils";
import moment from "moment";
import CrmConfirmDialog from "../../../features/crm/components/CrmConfirmDialog";

function Task_Attachment(props, ref) {
  const {
    taskId,
    allowSign,
    types,
    application,
    refType,
    mode,
    noAdd,
    disableInformation,
    maxFileSize,
    invalidFileSizeMessageDetail,
    addMessage,
    permission,
    onLoadAttachs,
  } = props;

  const t = CommonFunction.t;
  const refFilePreview = useRef(null);
  const [attachments, setAttachments] = useState(null);
  const [printAttachments, setPrintAttachments] = useState(null);

  const refCreateAttachmentMenu = useRef(null);
  const deletedAttachments = useRef([]);
  const [loading, setLoading] = useState(false);
  const [attachmentSelectced, setAttachmentSelected] = useState();

  const [showAll, setShowAll] = useState(false);

  const isSigning = useRef(false);
  const refTaskDetailAttachmentDetail = useRef(null);

  const refDetail = useRef();
  const refDialog = useRef();

  useImperativeHandle(ref, () => ({
    create: () => {
      create();
    },

    showMore: (_showAll) => {
      setShowAll(_showAll);
      setPrintAttachments(getPrintAttachments(attachments, _showAll));
    },
    /**
     * get attachments
     */
    get: () => {
      let _attachments = _.cloneDeep(attachments);
      let changedData = [];

      // get changed data
      _attachments.forEach((_group) => {
        if (_group.attachments && _group.attachments.length > 0) {
          _group.attachments.forEach((_attachment) => {
            if (_attachment.state) {
              changedData.push(_.cloneDeep(_attachment));
            }
          });
        }
      });

      // get deleted data
      if (deletedAttachments.current && deletedAttachments.current.length > 0) {
        changedData = changedData.concat(
          deletedAttachments.current.map((m) => ({
            ...m,
            state: Enumeration.crud.delete,
          }))
        );
      }

      let result = Object.assign(
        {
          valid: true,
          errors: [],
          attachments: _.cloneDeep(attachments),
          changedData: changedData,
        },
        validAttachments()
      );

      return result;
    },

    /**
     * set
     * @param {*} _attachments
     */
    set: (_attachments) => {
      setAttachments(_attachments);
      setPrintAttachments(getPrintAttachments(_attachments, showAll));
    },

    /**
     * submit
     * @param {*} documents
     */
    submit: (callback) => {
      let validation = validAttachments();
      if (validation.valid) {
        let _attachments = _.cloneDeep(_attachments);
        let _submitList = [];

        // create and update attachments
        _attachments.forEach((group) => {
          group.attachments.forEach((_attachment) => {
            _submitList.push(_attachment);
          });
        });

        // delete attachments
        let _deletedAttachments = _.cloneDeep(deletedAttachments);
        _deletedAttachments.forEach((_attachment) => {
          _attachment.state = Enumeration.crud.delete;
          _submitList.push(_attachment);
        });

        try {
          Promise.all(
            (function* () {
              for (let _attachment of _submitList) {
                yield new Promise((resolve) => {
                  switch (_attachment.state) {
                    case Enumeration.crud.create:
                      break;
                    case Enumeration.crud.update:
                      break;
                    default:
                      resolve("");
                      break;
                  }
                });
              }
            })()
          ).then(() => {
            if (callback) callback();
          });
        } catch (error) {
          CommonFunction.toastError();
        }
      } else {
        CommonFunction.toastWarning(
          `<ul><li>${validation.errors
            .map((m) => t(`task.attachment.${m}`))
            .join("</li><li>")}</li></ul`
        );
      }
    },

    /**
     * reload data
     */
    reload: () => {
      loadAttachments();
    },
  }));

  /**
   * load attachments
   */
  useEffect(() => {
    // prepare default attachment
    loadAttachments();
  }, [taskId]);

  const prepareAttachments = () => {
    let _attachments = types || [
      {
        group: "addition",
        name: t("attachment.type.addition"),
        editable: true,
        businessTypes: null,
      },
    ];

    _attachments.forEach((_group) => {
      _group.attachments = [];

      // convert business type to groupcode.businesstype
      if (
        _group.businessTypes &&
        Array.isArray(_group.businessTypes) &&
        _group.businessTypes.length > 0
      ) {
        _group.businessTypes.forEach((_type) => {
          _type.code = `${_group.group}.${_type}`;
        });
      }
    });

    return _attachments;
  };

  /**
   * load attachments
   */
  const loadAttachments = (type) => {
    if (taskId) {
      setLoading(true);
      TaskBaseApi.getAttachments(taskId, application, refType).then((res) => {
        if (res) {
          if (onLoadAttachs) {
            onLoadAttachs(res && res.length ? res : []);
          }
          // prepare document types
          let _attachments = prepareAttachments();

          _attachments.forEach((_group) => {
            // arrange attachments to group
            if (res && Array.isArray(res) && res.length > 0) {
              if (_group.businessTypes && Array.isArray(_group.businessTypes)) {
                _group.businessTypes.forEach((_type) => {
                  res.forEach((file) => {
                    if (file.file.businessType === _type.code) {
                      _group.attachments.push(file);
                    }
                  });
                });
              } else {
                res.forEach((file) => {
                  if (CommonFunction.isEmpty(file.file.businessType)) {
                    _group.attachments.push(file);
                  }
                });
              }
            }
          });

          setAttachments(_attachments);
          setPrintAttachments(getPrintAttachments(_attachments, showAll));
          setLoading(false);
        }
      });
    } else {
      // default if taskid not define - create mode
      const pr = prepareAttachments();
      setAttachments(pr);
      setPrintAttachments(getPrintAttachments(pr, showAll));
    }
  };

  const getPrintAttachments = (_attachments, _showAll) => {
    let num = !_showAll ? PREVIEW_NUMBER : 0;
    if (num) {
      let _printAttachments = [];
      _attachments.forEach((_group) => {
        // arrange attachments to group
        let arr = [];
        if (num) {
          _group.attachments.map((attach) => {
            if (num) {
              arr.push(attach);
              num--;
            }
          });
          _printAttachments.push({
            ..._group,
            attachments: arr,
          });
        }
      });
      return _printAttachments;
    }
    return _attachments;
  };

  /**
   *
   */
  const validAttachments = () => {
    let valid = true,
      errors = [];
    // check is signing
    if (isSigning.current) {
      errors.push(t("task-base.file-signing"));
      valid = false;
    }

    // check file is impacting
    if (isImpactingDocuments()) {
      errors.push(t("task-base.file-impacting"));
      valid = false;
    }
    return { valid: valid, errors: errors };
  };

  /**
   * check file impacting
   */
  const isImpactingDocuments = () => {
    let isImpacting = false;
    attachments
      .filter((f) => f.attachments.length > 0)
      .forEach((el) => {
        for (let i = 0; i < el.attachments.length; i++) {
          if (el.attachments[i].impact) {
            isImpacting = true;
            break;
          }
        }
      });

    return isImpacting;
  };

  /**
   * add file
   */
  const create = () => {
    const group = attachments[0];
    setAttachmentSelected({
      id: null,
      businessType:
        group.businessTypes && group.businessTypes.length > 0
          ? group.businessTypes[0].code
          : null,
      name: "",
      description: "",
      versionNo: "",
      impact: true,
      state: Enumeration.crud.create,
      file: {
        name: "",
      },
    });
    refDialog.current.edit();
  };

  /**
   * update attachment
   * @param {*} groupIndex
   * @param {*} attachmentIndex
   */
  const update = (groupIndex, attachmentIndex) => {
    if (!isProcessing()) {
      let _attachments = _.cloneDeep(attachments);
      let _attachment = _attachments[groupIndex].attachments[attachmentIndex];
      //   _attachment.raw = _.cloneDeep(_attachment);
      //   _attachment.impact = true;
      //   setAttachments(_attachments);
      _attachment.groupIndex = groupIndex;
      _attachment.attachmentIndex = attachmentIndex;
      _attachment.state = Enumeration.crud.update;
      setAttachmentSelected(_attachment);
      refDialog.current.edit();
    }
  };

  /**
   * delete file
   * @param {*} file
   * @param {*} attachmentIndex
   */
  const remove = (groupIndex, attachmentIndex) => {
    if (!isProcessing()) {
      let _attachment = attachments[groupIndex].attachments[attachmentIndex];
      if (_attachment) {
        let _file = _attachment.file;
        let _data = {
          application: application,
          refType: refType,
          refId: taskId,
          name: _attachment.name,
          versionNo: _attachment.versionNo,
          description: _attachment.description,
          businessType: _attachment.businessType,
        };

        CrmConfirmDialog({
          message: `${t("task.attchment.remove-confirm")}`,
          header: t("task.attchment.delete"),
          accept: () => {
            setLoading(true);
            TaskBaseApi.deleteAttachments(
              null,
              _attachment.id,
              _file.id ? null : _file.fileContent,
              _data
            )
              .then((res) => {
                if (res) {
                  CommonFunction.toastSuccess(t("common.save-success"));
                  loadAttachments();
                } else {
                  CommonFunction.toastError();
                }
                setLoading(false);
              })
              .catch((e) => {
                CommonFunction.toastError();
                setLoading(false);
              });
          },
        });
      }
    }
  };

  /**
   * check files is processing
   * @returns
   */
  const isProcessing = () => {
    if (loading) {
      CommonFunction.toastWarning(t("task.attachment.file-processing"));
    }
    return loading;
  };

  /**
   * preview file
   * @param {*} attachment
   */
  const previewFile = (attachment) => () => {
    refFilePreview.current.show(
      [
        {
          refId: attachment.id,
          id: attachment.file.id,
          name: attachment.file.name,
        },
      ],
      0
    );
  };

  const getRowButtonRender = (attachment, groupIndex, attachmentIndex) => {
    const items = [
      {
        label: t("button.download"),
        disabled: !attachment.file && !attachment.file.id,
        command: () => CommonFunction.downloadFile(attachment.file.id),
      },
      {
        label: t("common.update"),
        disabled: mode === "view" ? true : false,
        command: () => update(groupIndex, attachmentIndex),
      },
      {
        label: t("common.delete"),
        disabled: mode === "view" ? true : false,
        command: () => remove(groupIndex, attachmentIndex),
      },
    ];

    return (
      <SplitButton
        dropdownIcon="bx bxs-down-arrow text-xs"
        className="p-button-info"
        buttonClassName="hidden"
        menuClassName="crm-splitbutton-menu"
        menuButtonClassName="border-round-md p-button-sm p-button-outlined text-color-secondary bg-white p-0 menu-dropdown-button"
        model={items}
      />
    );
  };

  const onShow = (groupIndex, attachmentIndex) => () => {
    let _attachments = _.cloneDeep(attachments);
    _attachments[groupIndex].attachments[attachmentIndex]["isOpen"] =
      !_attachments[groupIndex].attachments[attachmentIndex]["isOpen"];
    setAttachments(_attachments);
    setPrintAttachments(getPrintAttachments(_attachments, showAll));
  };

  /**
   * render attachment
   */
  const renderAttachment = (attachment, attachmentIndex, group, groupIndex) => {
    const className = attachment.isOpen
      ? "bx bx-chevron-down"
      : "bx bx-chevron-right";

    return (
      <div key={attachmentIndex} className="mt-2">
        <div className="task-attachment-content flex relative">
          <div className="flex mr-1">
            <i
              className={`${className} text-3xl font-bold `}
              onClick={onShow(groupIndex, attachmentIndex)}
            ></i>
            <img
              className="file-icon  h-2rem"
              src={CommonFunction.getFileIcons(attachment.file.name)}
            />
          </div>
          <div>
            <span
              className="link-button crm-text-13 cursor-pointer"
              onClick={previewFile(attachment)}
            >
              {attachment.name}
            </span>
            <br />
            <span className="crm-text-12">
              {t("task.attachment.file.version")}: {attachment.versionNo}{" "}
              <span className="text-xl font-bold">·</span>{" "}
              {moment(attachment.file.createDate).format("DD/MM/YYYY")}{" "}
              <span className="text-xl font-bold">·</span>{" "}
              {formatSize(attachment.file.length)}
            </span>
            <br />
            {attachment.isOpen && (
              <>
                {" "}
                <span className="crm-text-12">
                  {t("task.attachment.file.name")}: {attachment.file.name}
                </span>
                <br />
                <span className="crm-text-12">
                  {t("task.attachment.file.creator")}:{" "}
                  {attachment.updateBy ? attachment.updateBy.fullName : ""}
                </span>
                <br />
                <span className="crm-text-12">
                  {t("task.attachment.file.description")}:{" "}
                  {attachment.description}
                </span>
              </>
            )}
          </div>
          <div className="absolute top-0 btn-action">
            {getRowButtonRender(attachment, groupIndex, attachmentIndex)}
          </div>
        </div>
      </div>
    );
  };

  const onDialogSave = () => {
    refDetail.current.submit();
  };

  const onCloseDialog = () => {
    refDialog.current.close();
  };

  const setLoadingSave = (flg) => {
    refDialog.current.setLoading(flg);
  };

  const renderGroup = (group, groupIndex) => {
    return (
      <React.Fragment key={groupIndex}>
        {attachments.length > 1 && (
          <div className="task-attachment-group">
            <i className="bx bxs-folder-open"></i>
            {group.name}
          </div>
        )}
        {group.attachments.map((attachment, attachmentIndex) =>
          renderAttachment(attachment, attachmentIndex, group, groupIndex)
        )}
      </React.Fragment>
    );
  };

  if (!attachments || attachments.length === 0) {
    return <></>;
  }

  return (
    <>
      <XLayout className="task-attachment position-relative">
        {/* <XLayout_Top>{toolbarRenderer()}</XLayout_Top> */}
        {(() => {
          let _attachments = printAttachments.filter(
            (f) => f.attachments.length > 0
          );
          if (_attachments.length > 0) {
            return (
              <XLayout_Center className="task-attachment-detail position-relative">
                <LoadingBar loading={loading} top={0} />
                {_attachments.map(renderGroup)}
              </XLayout_Center>
            );
          }
          return <></>;
        })()}
      </XLayout>

      <CrmCreateDialog
        ref={refDialog}
        title={
          attachmentSelectced && attachmentSelectced.id
            ? t(`task.attchment.edit`)
            : t(`task.attchment.add`)
        }
        permission={permission}
        onSubmit={onDialogSave}
      >
        <TaskAttachmentDetail
          ref={refDetail}
          taskId={taskId}
          application={application}
          refType={refType}
          disableInformation={disableInformation}
          attachmentSelectced={attachmentSelectced}
          maxFileSize={maxFileSize}
          invalidFileSizeMessageDetail={invalidFileSizeMessageDetail}
          // setAttachmentSelected={setAttachmentSelected}
          setLoading={setLoadingSave}
          cancel={onCloseDialog}
          reload={loadAttachments}
        />
      </CrmCreateDialog>

      <XFilePreview ref={refFilePreview} allowHistory={true}></XFilePreview>
    </>
  );
}

Task_Attachment = forwardRef(Task_Attachment);

export default Task_Attachment;

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import _ from "lodash";

import { Button } from "primereact/button";
import TaskService from "services/TaskService";
import History from "components/history/History";
import "./scss/Task_History.scss";
import TaskBaseApi from "services/TaskBaseApi";
import CommonFunction from "@lib/common";
import { XAvatar } from "@ui-lib/x-avatar/XAvatar";
import { getStickyHeaderDates } from "@fullcalendar/react";
import TicketApi from "services/ticket/TicketApi";
import XCommentHistories from "components/x-comments/XCommentHistories";
import XComments from "components/x-comments/XComments";
import UserApi from "services/UserService";
import { UserPopover } from "components/popovers/user-popover/UserPopover";
import { ZIndexUtils } from "primereact/utils";
import index from "diagram-js-minimap";

/**
 * props:
 *      application: application,
 *      refType: reftype,
 *      refId: refId // reference id,
 *      containerId: commpent's container,
 *      user: { id: id, fullName: fullName, avatar: avatar url}
 *      getHistoriesFn: async (refId, { page: 0, size: 10 }) => { return {page: 0, size: 10, total: 100, data: [...]} },
 *      autoLoad // auto load first comment, default true
 *      allowFileTypes: ["image", "document"] // allow upload file, set [] if don't use upload, default ["image", "document"]
 * @param {*} props
 * @returns
 */
function Task_Comments(props, ref) {
  const t = CommonFunction.t;
  const {
    application,
    refType,
    type,
    refId,
    containerId,
    user,
    getHistoriesFn,
    autoLoad,
    allowFileTypes,
    configuration,
    callback,
  } = props;
  const refCommentHistories = useRef();

  useImperativeHandle(ref, () => ({
    /**
     * get histories
     */
    get: () => {
      refCommentHistories.current.get();
    },

    add: (comment) => {
      refCommentHistories.current.add(comment);
    },
  }));

  /**
   * 1 time execute
   */
  useEffect(() => {
    if (autoLoad !== false) {
      refCommentHistories.current.get();
    }
  }, []);

  const renderCommentInput = () => {
    return (
      <XComments
        containerId={containerId}
        sender={{
          id: user.id,
          name: user.fullName,
          avatar: user.avatar,
        }}
        allowFileTypes={allowFileTypes || ["image", "document"]}
        allowEmoji
        mentionTypes={[
          {
            trigger: "@",
            data: async (paging) => {
              let res = await UserApi.search({
                filter: paging.search.toLowerCase(),
              });
              return {
                page: res.page,
                size: res.pageSize,
                total: res.total,
                data: res.content.map((user) => ({
                  ...user,
                  display: user.fullName,
                })),
              };
            },
            renderSuggestion: (suggestion) => {
              return (
                <>
                  <img
                    className="suggestion-avatar"
                    src={CommonFunction.getImageUrl(
                      suggestion.avatar,
                      suggestion.display
                    )}
                  />
                  <span className="suggestion-name ml-2">
                    {suggestion.display}
                  </span>
                </>
              );
            },
          },
        ]}
        submit={async (params) => {
          let commentId = CommonFunction.uuid();

          // submit attachments
          if (params.attachments && params.attachments.length > 0) {
            await Promise.all(
              (function* () {
                for (let _attachment of params.attachments) {
                  yield new Promise((resolve) => {
                    TaskBaseApi.createAttachments(null, _attachment.file, {
                      application: "comm-service",
                      refType: "comments",
                      refId: commentId,
                    }).then((res) => {
                      _attachment.id = res[0].file.id;
                      _attachment.name = res[0].file.name;
                      resolve("");
                    });
                  });
                }
              })()
            ).then(() => {
              // all files uploaded
            });
          }

          // submit comment
          let _comment = {
            id: commentId,
            application: application,
            refType: refType,
            type: type,
            refId: refId,
            content: params.output ? params.output.value : " ",
          };
          if (params.attachments) {
            _comment.attachments = params.attachments.map((m) => ({
              id: m.id,
              name: m.name,
            }));
          }
          let res = await TaskBaseApi.createComment(_comment);

          if (res) {
            refCommentHistories.current.add(res);

            if (callback && typeof callback === "function") {
              callback();
            }
          }

          return res ? true : false;
        }}
      ></XComments>
    );
  };

  return (
    <>
      {renderCommentInput()}
      <XCommentHistories
        ref={refCommentHistories}
        configuration={configuration}
        callback={callback}
        refId={refId}
        application={application}
        refType={refType}
        type={type}
        senderRenderer={{
          name: (sender) => (
            <UserPopover
              user={sender}
              title={() => (
                <span className="x-comment-owner">{sender.fullName}</span>
              )}
            />
          ),
        }}
        mentions={[
          {
            trigger: "@",
            renderer: (mentionPart) => (
              <UserPopover
                user={{ id: mentionPart.id, fullName: mentionPart.value }}
                title={() => (
                  <span className="x-comment-comment-mention">
                    {mentionPart.value}
                  </span>
                )}
              />
            ),
          },
        ]}
        getHistoriesFn={
          getHistoriesFn ||
          async function (refId, params) {
            let res = await TaskBaseApi.getComments(
              refId,
              application,
              refType,
              params.page,
              params.size
            );

            if (res) {
              return {
                page: res.page,
                size: res.pageSize,
                total: res.total,
                data: res.content,
              };
            } else {
              return null;
            }
          }
        }
      ></XCommentHistories>
    </>
  );
}
Task_Comments = forwardRef(Task_Comments);
export default Task_Comments;

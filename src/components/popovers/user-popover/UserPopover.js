import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import XPopover from '@ui-lib/x-popover/XPopover'
import CommonFunction from '@lib/common';
import React, { useEffect, useState } from "react";

import TaskBaseApi from "services/TaskBaseApi";
import "./scss/UserPopover.scss";

/**
 * props:
 *      user : {
 *          id: "", //user's id,
 *          fullName: "", // user's full name
 *      },
 *      title: () => (<></>), async function return rendered title
 * @param {*} props 
 * @returns 
 */
export const UserPopover = (props) => {
    const t = CommonFunction.t;
    const { user, title } = props;

    /**
     * render title
     * @returns 
     */
    const renderTitle = () => {
        if (title && typeof title === "function") {
            return title(user);
        } else {
            return (<>{user.fullName}</>)
        }
    }

    if (user) {
        return (
            <XPopover
                span
                width={400}
                className="x-comment-owner"
                title={renderTitle}
                delay={400}
                content={async () => {
                    let res = await TaskBaseApi.getUserInfo([user.id]);
                    if (res && res.length > 0) {
                        let userInfo = res[0];
                        return (
                            <div className="x-comment-user-info">
                                <XAvatar
                                    size="54px"
                                    src={CommonFunction.getImageUrl(userInfo.avatar, user.fullName)}
                                ></XAvatar>
                                <div className="x-comment-user-info-container">
                                    <div className="x-comment-user-info-name">
                                        {user.fullName}
                                    </div>
                                    <div>
                                        <span className="text-grey-7">{t("common.email")}: </span>
                                        <span className="bold">{userInfo.email}</span>
                                    </div>
                                    {userInfo.groups && userInfo.groups.length > 0 && <>
                                        <div>
                                            <span className="text-grey-7">{t("group.type.org")}: </span>
                                        </div>
                                        <ul className="user-department-list">
                                            {userInfo.groups.map((group, index) => (
                                                <li key={index}>
                                                    <div>{group.name}</div>
                                                    <i className="tiny text-grey-7">{group.pathName}</i>
                                                </li>
                                            ))}
                                        </ul>
                                    </>}
                                </div>
                            </div>
                        )
                    } else {
                        return <span>{user.fullName}</span>
                    }
                }}
            ></XPopover>
        )
    } else {
        return (<></>)
    }
}

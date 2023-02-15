import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import CommonFunction from '@lib/common';
import ChooseUsers from "../../../../components/role-permission/components/ChooseUsers";
import { UserInfo } from '@ui-lib/user-info/UserInfo';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { CrmUserAdminApi } from "../../../../services/CrmUserAdminService";
import UserApi from "../../../../services/UserService";

export default function UserAdmin(props) {

    const t = CommonFunction.t;

    const [roleUsers, setRoleUsers] = useState([]);

    const refChooseUser = useRef(null);

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        CrmUserAdminApi.getAll({
            status: 1
        }).then(res => {
            if (res) {
                UserApi.getUserInfo(res.map(o => o.userId)).then(resUser => {
                    res = res.map(o => {
                        const _user = _.find(resUser, {id: o.userId})
                        return {
                            ...o,
                            fullName: _user?.fullName
                        }
                    })
                    setRoleUsers(res)
                })
            }
        })
    }

    /**
     * add users to role
     */
    const addUsersToRole = () => {
        refChooseUser.current.choose();
    }

    /**
     * remove role user
     * @param {*} _user
     */
    const removeRoleUser = (_user) => {
        CommonFunction.showConfirm(t("crm-sale.user-admin.delete-confirm").format(_user.fullName), t("button.confirm"), () => {
            CrmUserAdminApi.delete(_user.id).then(res => {
                CommonFunction.toastSuccess(t("common.save-success"));
                let _roleUsers = _.cloneDeep(roleUsers)
                _.remove(_roleUsers, {id: _user.id})
                setRoleUsers(_roleUsers)
            })
        });
    }

    /**
     * after choose user
     */
    const afterChooseUsers = (selected) => {
        if (selected.users.length) {
            let _roleUsers = _.cloneDeep(roleUsers);

            // find duplicated
            let selectedIds = selected.users.map(m => m.id);
            let existed = _roleUsers.map(m => m.userId);
            let addIds = selectedIds.filter(x => !existed.includes(x));
            if (addIds.indexOf(selected.users[0].id) > -1) {
                CrmUserAdminApi.create({
                    uid: selected.users[0].id,
                    username: selected.users[0].username
                }).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.save-success"));
                        _roleUsers.push({
                            ...res,
                            userId: res.uid,
                            fullName: selected.users[0].fullName
                        });
                        setRoleUsers(_roleUsers)
                    }
                })
            } else {
                CommonFunction.toastError(t("common.user-is-an-admin"));
            }
        }
    }

    return <>
        <XLayout className="px-2">
            <XLayout_Top className="mb-2">
                <XToolbar left={() => (<>
                    <Button
                        label={t("crm-sale.user-admin.add-user")}
                        icon="bx bx-user-plus"
                        onClick={() => addUsersToRole()}
                    ></Button>
                </>)}></XToolbar>
            </XLayout_Top>
            <XLayout_Center>
                <XLayout_Box className="h-full p-0">
                    <DataTable
                        value={roleUsers}
                        className="border-none"
                        showGridlines
                        scrollable
                        scrollDirection='both'
                        scrollHeight='flex'
                        dataKey="userId"
                        filterDisplay="row"
                        rowHover
                    >
                        <Column
                            header={t("crm-sale.user-admin.user")}
                            field="fullName"
                            filter
                            filterMatchMode="contains"
                            showFilterMenu={false}
                            showClearButton={false}

                            body={(u) => (
                                <div className="width-fit-content">
                                    <UserInfo id={u.userId}></UserInfo>
                                </div>
                            )}
                            style={{ flex: '1 0 300px' }}
                        ></Column>
                        <Column
                            bodyClassName='p-0 flex align-items-center border-all'
                            body={(u) => (
                                <Button
                                    className="p-button-rounded p-button-text"
                                    icon="bx bx-trash text-grey"
                                    tooltip={t('common.delete')}
                                    onClick={() => removeRoleUser(u)}
                                ></Button>
                            )}
                            style={{ flex: '0 0 150px' }}
                        ></Column>
                    </DataTable>
                </XLayout_Box>
            </XLayout_Center>
        </XLayout>
        <ChooseUsers ref={refChooseUser} afterSubmit={afterChooseUsers} multiple={false}></ChooseUsers>
    </>

}
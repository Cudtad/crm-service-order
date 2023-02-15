import React, { useEffect, useRef, useState ,forwardRef} from "react";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Row, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import CommonFunction from '@lib/common';
import _ from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { TreeTable } from "primereact/treetable";

import RoleApi from "services/RoleService";
import { TabPanel, TabView } from "primereact/tabview";
import GroupApi from "services/GroupService";
import GroupDetail from "./components/GroupDetail";
import { Dropdown } from "primereact/dropdown";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import { UserAutoComplete } from '@ui-lib/x-autocomplete/UserAutoComplete';
import { Checkbox } from "primereact/checkbox";
import RolePermissionEnum from "./RolePermissionEnum";
import UserDetail from "./components/user/UserDetail";
import ChooseUsers from "./components/ChooseUsers";
import Enumeration from '@lib/enum';

/**
 * props
 *      application: "system" // applications for config role, "system" for main menu
 *      groupType: "" // get group by type
 *      groupTypeName: "" // group type name for display header
 *      groupGetFn: async () => { return groups } // function to get group, if null, automatic get group by groupType
 *      roleGetFn: async () => { return roles } // function to get role, if null, auto matic get by application
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function GroupUserRole(props, ref) {
    const { application, groupType, groupGetFn, groupTypeName, roleGetFn } = props;
    const t = CommonFunction.t;
    const [groups, setGroups] = useState([]);
    const refAllGroups = useRef([]);
    const [groupsFilter, setGroupsFilter] = useState(null);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const refGroupDetail = useRef(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [usersInGroup, setUsersInGroup] = useState([]);
    const refRawUsersInGroup = useRef({});
    const refChooseUsers = useRef(null);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const refAllRoles = useRef([]);
    const refRawUserRoles = useRef({});
    const [loadingUserRoles, setLoadingUserRoles] = useState(false);
    const [loadingUserDataScope, setLoadingUserDataScope] = useState(false);
    const refUserChangedData = useRef({ roles: false, dataScope: false });
    const [userGroupsDataScope, setUserGroupsDataScope] = useState([]);
    const [userGroupsDataScopeFilter, setUserGroupsDataScopeFilter] = useState([]);
    const refRawUserGroupsDataScope = useRef({});
    const refUserGroupsDataScopeChanged = useRef({});
    const refUserDetail = useRef(null);

    useEffect(() => {
        // load groups
        loadGroups();

        // load roles
        loadRoles();
    }, [])

    /**
     * load groups
     */
    const loadGroups = () => {
        setLoadingGroups(true);

        if (groupGetFn && typeof groupGetFn === "function") {
            groupGetFn().then(res => {
                if (res) {
                    let _sorted = _.sortBy(res, ["name"]);
                    refAllGroups.current = _.cloneDeep(_sorted);
                    let _groups = CommonFunction.listToTree(_sorted, "id", "parentId", "children");
                    _groups = CommonFunction.buildObjectPath(_groups);
                    setGroups(_groups);
                };
                setLoadingGroups(false);
            })
        } else {
            GroupApi.get({
                type: groupType,
                rootGroupId: -1,
                status: 1,
                page: 0,
                rows: 999
            }).then(res => {
                if (res) {
                    res.content.forEach(_group => {
                        _group.parentId = _group.parentId && _group.parentId > 0 ? _group.parentId : null;
                        _group.key = _group.id;
                        _group.data = { filterKey: _group.name };
                    });
                    let _sorted = _.sortBy(res.content, ["name"]);
                    refAllGroups.current = _.cloneDeep(_sorted);
                    let _groups = CommonFunction.listToTree(_sorted, "id", "parentId", "children");
                    _groups = CommonFunction.buildObjectPath(_groups);
                    setGroups(_groups);
                } else {
                    refAllGroups.current = [];
                    setGroups([]);
                }
                setLoadingGroups(false);
            });
        }
    }

    /**
     * load roles
     */
    const loadRoles = () => {
        if (roleGetFn && typeof roleGetFn === "function") {
            groupGetFn().then(res => {
                if (res) {
                    refAllRoles.current = res;
                };
            })
        } else {
            RoleApi.getByApplicationAndType(application, application).then(res => {
                if (res) {
                    refAllRoles.current = res;
                }
            });
        }
    }

    /**
     * create group
     */
    const createGroup = (parentId) => {
        refGroupDetail.current.create(parentId ? { parentId: parentId } : null);
    }

    /**
     * after submit group
     */
    const afterSubmitGroup = () => {
        setTimeout(() => {
            loadGroups();
        }, 500);
    }

    /**
     * on selected value
     * @param {*} value 
     */
    const onGroupSelected = (value) => {
        editUserInGroup(value);
        setSelectedGroup(value);
    }

    /**
     * edit User in group
     * @param {*} groupId 
     */
    const editUserInGroup = (groupId) => {
        RoleApi.getGroupUsers(groupId).then(res => {
            if (res) {
                refRawUsersInGroup.current = res.map(m => m.id);
                setUsersInGroup(res);
            }
        })
    }

    /**
     * add users and role to group
     * @param {*} value 
     */
    const addUsersToGroup = (value) => {
        refChooseUsers.current.choose();
    }

    /**
     * add users and role to group
     * @param {*} value 
     */
    const addNewUser = () => {
        refUserDetail.current.create();
    }

    /**
     * after choose user and role
     * @param {*} _selected 
     */
    const afterChooseUsers = (_selected) => {
        let _userInGroup = _.cloneDeep(usersInGroup);

        for (let i = 0; i < _selected.users.length; i++) {
            const el = _selected.users[i];
            let _user = _userInGroup.find(f => f.id === el.id);
            if (!_user) {
                _userInGroup.push(el);
            }
        }

        setUsersInGroup(_userInGroup);
    }

    /**
     * after submit user
     * @param {*} _mode 
     * @param {*} _user 
     */
    const afterSubmitUser = (_mode, _user) => {
        debugger
        let _userInGroup = _.cloneDeep(usersInGroup);

        switch (_mode) {
            case Enumeration.crud.create:
                _userInGroup.push(_user);
                setUsersInGroup(_userInGroup);
                break;
            case Enumeration.crud.update:
                break;
            default:
                break;
        }
    }

    /**
     * apply change
     */
    const applyChange = (_user, prop, value) => {
        let _userInGroup = _.cloneDeep(usersInGroup);

        for (let i = 0; i < _userInGroup.length; i++) {
            if (_userInGroup[i].id === _user.id) {
                _userInGroup[i][prop] = value;
                break;
            }
        }

        setUsersInGroup(_userInGroup);
    }

    /**
     * remove user in group
     * @param {*} _user 
     */
    const removeUserInGroup = (_user) => {
        let _userInGroup = _.cloneDeep(usersInGroup);
        _.remove(_userInGroup, { id: _user.id });
        setUsersInGroup(_userInGroup);
    }

    /**
     * submit user in group
     */
    const submitUsersInGroup = () => {
        let changed = [],
            oldData = refRawUsersInGroup.current || [];

        // get new data
        usersInGroup.forEach(u => {
            if (oldData.indexOf(u.id) === -1) {
                changed.push({
                    userId: u.id,
                    status: 1
                });
            }
        });

        // get deleted
        let newData = usersInGroup.map(m => m.id);
        let deleted = oldData.filter(f => newData.indexOf(f) === -1);
        if (deleted && deleted.length > 0) {
            deleted.forEach(uid => {
                changed.push({
                    userId: uid,
                    status: 0
                });
            });
        }

        // grant
        RoleApi.grantGroupUsers(selectedGroup, changed).then(res => {
            if (res) {
                onGroupSelected(selectedGroup);
                CommonFunction.toastSuccess(t("common.save-success"));
            }
        })
    }

    /**
     * change selected user
     */
    const changeSelectedUser = (_user) => {
        refUserChangedData.current = { roles: false, dataScope: false };
        setSelectedUser(_user);

        if (_user && _user.length > 0) {



            // get user roles

            setLoadingUserRoles(true);
            RoleApi.getUserRoles(_user[0].id).then(res => {
                if (res) {
                    // cache raw roles
                    let _rawUserRoles = {};
                    res.forEach(_role => {
                        _rawUserRoles[_role.id] = true;
                    });

                    // prepare selected user roles
                    let _roles = _.cloneDeep(refAllRoles.current);
                    _roles.forEach(_role => {
                        if (_rawUserRoles[_role.roleId]) {
                            _role.selected = true;
                        } else {
                            _role.selected = false;
                        }
                    });

                    refRawUserRoles.current = _rawUserRoles;
                    setRoles(_roles);
                    setLoadingUserRoles(false);
                }
            })

            // get user data scope
            setLoadingUserDataScope(true);
            RoleApi.getUserGroups(_user[0].id).then(res => {
                if (res) {
                    // cache raw groups
                    let _rawUserGroupsDataScope = {};
                    res.forEach(_group => {
                        _rawUserGroupsDataScope[_group.id] = _group.dataScope || "owner";
                    });

                    // prepare selected
                    let _groups = _.cloneDeep(refAllGroups.current);
                    _groups.forEach(_group => {
                        if (_rawUserGroupsDataScope[_group.id]) {
                            _group.dataScope = _rawUserGroupsDataScope[_group.id];
                        }
                    });

                    // build tree
                    _groups = CommonFunction.listToTree(_groups, "id", "parentId", "children");
                    _groups = CommonFunction.buildObjectPath(_groups);

                    refRawUserGroupsDataScope.current = _rawUserGroupsDataScope;
                    refUserGroupsDataScopeChanged.current = {};
                    setUserGroupsDataScope(_groups);
                    setLoadingUserDataScope(false)
                }
            })
        }

    }

    /**
     * save user permission
     */
    const submitUserPermission = async () => {
        // check data changed
        if (!refUserChangedData.current.roles && !refUserChangedData.current.dataScope) {
            CommonFunction.toastInfo(t("common.no-data-changed"));
            return;
        }

        let success = true;

        // update roles
        if (refUserChangedData.current.roles) {
            let oldRoles = refRawUserRoles.current;
            let newRoles = {};
            roles.forEach(_role => {
                if (_role.selected) {
                    newRoles[_role.roleId] = true;
                }
            });

            let changed = [];
            // added role
            for (const key in newRoles) {
                if (!Object.hasOwnProperty.call(oldRoles, key)) {
                    changed.push({ roleId: key, status: 1 })
                }
            }

            // deleted role
            for (const key in oldRoles) {
                if (!Object.hasOwnProperty.call(newRoles, key)) {
                    changed.push({ roleId: key, status: 0 })
                }
            }

            let roleResponse = await RoleApi.grantUserRoles(selectedUser[0].id, changed);
            success = roleResponse ? true : false;
        }

        // update data scope
        if (refUserChangedData.current.dataScope) {
            let oldScope = refRawUserGroupsDataScope.current;
            let newScope = refUserGroupsDataScopeChanged.current;

            // detech changed
            let changed = [];
            for (const key in newScope) {
                if (newScope[key] === "_delete") {
                    if (oldScope[key]) {
                        changed.push({ groupId: key, dataScope: oldScope[key], status: 0 });
                    }
                } else {
                    changed.push({ groupId: key, dataScope: newScope[key], status: 1 })
                }
            }

            let scopeResponse = await RoleApi.grantUserGroups(selectedUser[0].id, changed);
            success = scopeResponse ? true : false;
        }

        if (success) {
            changeSelectedUser(selectedUser);
            CommonFunction.toastSuccess(t("common.save-success"));
        }
    }

    /**
     * on user role selected change 
     * @param {*} checked 
     */
    const onUserRolesChange = (_role, checked) => {
        let _roles = _.cloneDeep(roles);
        let impactRole = _roles.find(f => f.roleId === _role.roleId);
        if (impactRole) {
            impactRole.selected = checked;
        }
        refUserChangedData.current.roles = true;
        setRoles(_roles);
    }

    /**
     * apply user group data scope
     * @param {*} _menu 
     * @param {*} value 
     */
    const applyUserGroupDataScope = (_menu, value) => {
        let _userGroupsDataScope = _.cloneDeep(userGroupsDataScope);
        refUserChangedData.current.dataScope = true;
        CommonFunction.setValueByPath(_userGroupsDataScope, `${_menu._path}.dataScope`, value);

        // cache change
        refUserGroupsDataScopeChanged.current[_menu.id] = value ? value : "_delete";

        setUserGroupsDataScope(_userGroupsDataScope);
    }

    return (<>
        {/* Main layout */}
        <XLayout>
            <XLayout_Center className="p-2">
                <TabView className="p-tabview-stretch">
                    <TabPanel header={t("group-user-role.by-group")}>
                        <XLayout left="450px" className="pt-2">
                            <XLayout_Left>
                                <XLayout>
                                    <XLayout_Top className="mb-2">
                                        <XToolbar left={() => (<>
                                            <Button
                                                label={`${t('common.create')} ${groupTypeName.toLowerCase()}`}
                                                icon="bx bx-plus text-green"
                                                onClick={() => createGroup()}
                                            ></Button>
                                        </>)}></XToolbar>
                                    </XLayout_Top>
                                    <XLayout_Center className="position-relative">
                                        <LoadingBar loading={loadingGroups}></LoadingBar>
                                        <XLayout_Box className="h-full overflow-auto p-0">
                                            <TreeTable
                                                value={groups}
                                                globalFilter={groupsFilter}
                                                filterKey="filterKey"
                                                showGridlines
                                                selectionMode="single"
                                                selectionKeys={selectedGroup}
                                                onSelectionChange={(e) => onGroupSelected(e.value)}
                                                scrollable
                                            >
                                                <Column
                                                    header={groupTypeName}
                                                    field="filterKey"
                                                    filterMatchMode="contains"
                                                    body={(m) => (<>
                                                        <span title={`${m.code} - ${m.name}`}>{m.name}</span>
                                                    </>)}
                                                    expander
                                                    filter
                                                    
                                                    style={{ flex: "1 0 200px" }}
                                                ></Column>
                                                <Column
                                                    className="p-0"
                                                    body={(m) => (<div className="flex justify-content-center align-items-center">
                                                        <Button
                                                            className="p-button-rounded p-button-text"
                                                            icon="bx bx-dots-vertical-rounded text-grey"
                                                            onClick={() => removeUserInGroup(m)}
                                                        ></Button>
                                                    </div>)}
                                                    style={{ flex: "0 0 50px" }}
                                                ></Column>
                                            </TreeTable>
                                        </XLayout_Box>
                                    </XLayout_Center>
                                </XLayout>
                            </XLayout_Left>
                            <XLayout_Center className="ml-2">
                                {!selectedGroup &&
                                    <div className="h-full w-full flex align-items-center justify-content-center flex-column">
                                        <i className="bx bx-info-circle fs-30 text-grey"></i>
                                        <span className="my-2">{t("group-user-role.select-menu").format(groupTypeName.toLowerCase())}</span>
                                    </div>
                                }
                                {selectedGroup &&
                                    <XLayout>
                                        <XLayout_Top className="mb-2">
                                            <XToolbar left={() => (<>
                                                <Button
                                                    label={t('common.save')}
                                                    icon="bx bxs-save"
                                                    onClick={() => submitUsersInGroup()}
                                                ></Button>
                                                <div className="x-toolbar-separator"></div>
                                                <Button
                                                    label={t("group-user-role.add-user")}
                                                    icon="bx bx-user-plus"
                                                    onClick={() => addNewUser()}
                                                ></Button>
                                                <Button
                                                    label={t("group-user-role.add-user-exist")}
                                                    icon="bx bx-user-plus"
                                                    onClick={() => addUsersToGroup()}
                                                ></Button>
                                            </>)}></XToolbar>
                                        </XLayout_Top>
                                        <XLayout_Center>
                                            <XLayout_Box className="h-full p-0">
                                                <DataTable
                                                    value={usersInGroup}
                                                    className="border-none"
                                                    showGridlines
                                                    scrollable
                                                    scrollDirection='both'
                                                    scrollHeight='flex'
                                                    dataKey="userId"
                                                    filterDisplay="row"
                                                >
                                                    <Column
                                                        header={t("group-user-role.user")}
                                                        field="name"
                                                        filter
                                                        
                                                        filterMatchMode="contains"
                                                        showFilterMenu={false}
                                                        showClearButton={false}
                                                        style={{ flex: '1 0 350px' }}
                                                        body={(m) => (
                                                            <XAvatar
                                                                name={m.fullName} avatar={m.avatar} 
                                                                label={() => (m.fullName)}
                                                            ></XAvatar>
                                                        )}
                                                    ></Column>
                                                    <Column
                                                        header={t("user.email")}
                                                        field="username"
                                                        filterMatchMode="contains"
                                                        filter
                                                        
                                                        showFilterMenu={false}
                                                        showClearButton={false}
                                                        style={{ flex: '1 0 300px' }}
                                                    ></Column>
                                                    <Column
                                                        bodyClassName='p-0 flex justify-content-center align-items-center border-all'
                                                        body={(m) => (
                                                            <Button
                                                                className="p-button-rounded p-button-text"
                                                                icon="bx bx-trash text-grey"
                                                                onClick={() => removeUserInGroup(m)}
                                                            ></Button>)}
                                                        style={{ flex: '0 0 50px' }}
                                                    ></Column>
                                                </DataTable>
                                            </XLayout_Box>
                                        </XLayout_Center>
                                    </XLayout>
                                }
                            </XLayout_Center>
                        </XLayout>
                    </TabPanel>
                    <TabPanel header={t("group-user-role.by-user")}>
                        <XLayout className="pt-2">
                            <XLayout_Top>
                                <XLayout_Row>
                                    <span className="mr-1">{t("group-user-role.user")}</span>
                                    <UserAutoComplete
                                        style={{ width: "400px" }}
                                        value={selectedUser}
                                        placeholder={selectedUser && selectedUser.length > 0 ? "" : t("group-user-role.select-user")}
                                        onChange={(value) => changeSelectedUser(value)}
                                    />
                                </XLayout_Row>
                                {selectedUser && selectedUser.length > 0 &&
                                    <XToolbar
                                        className="mt-1"
                                        left={() => (<>
                                            <Button
                                                label={t('common.save')}
                                                icon="bx bxs-save"
                                                onClick={submitUserPermission}
                                            ></Button>
                                        </>)}></XToolbar>
                                }
                            </XLayout_Top>
                            <XLayout_Center>
                                {(!selectedUser || selectedUser.length === 0) &&
                                    <div className="h-full w-full flex align-items-center justify-content-center flex-column">
                                        <i className="bx bx-info-circle fs-30 text-grey"></i>
                                        <span className="my-2">{t("group-user-role.not-select-user")}</span>
                                    </div>
                                }
                                {selectedUser && selectedUser.length > 0 &&
                                    <XLayout left="400px">
                                        <XLayout_Left>
                                            <XLayout>
                                                <XLayout_Top>
                                                    <XLayout_Title>{t("group-user-role.role")}</XLayout_Title>
                                                </XLayout_Top>
                                                <XLayout_Center className="position-relative">
                                                    <LoadingBar loading={loadingUserDataScope} />
                                                    <XLayout_Box className="h-full p-0">
                                                        <DataTable
                                                            value={roles}
                                                            style={{ width: "100%" }}
                                                            className="border-none"
                                                            showGridlines
                                                            scrollable
                                                            dataKey="roleId"
                                                            filterDisplay="row"
                                                        >
                                                            <Column
                                                                style={{ flex: "0 0 40px" }}
                                                                bodyClassName="flex align-items-center justify-content-center"
                                                                body={(m) => (
                                                                    <Checkbox
                                                                        checked={m.selected}
                                                                        onChange={e => onUserRolesChange(m, e.checked)}
                                                                    />
                                                                )}
                                                            ></Column>
                                                            <Column
                                                                header={t("common.code")}
                                                                field="code"
                                                                filter
                                                                
                                                                style={{ flex: "0 0 100px" }}
                                                                filterMatchMode="contains"
                                                                showFilterMenu={false}
                                                                showClearButton={false}
                                                            ></Column>
                                                            <Column
                                                                header={t("common.name")}
                                                                field="name"
                                                                filter
                                                                
                                                                style={{ flex: "1 0 200px" }}
                                                                filterMatchMode="contains"
                                                                showFilterMenu={false}
                                                                showClearButton={false}
                                                            ></Column>
                                                        </DataTable>
                                                    </XLayout_Box>
                                                </XLayout_Center>
                                            </XLayout>
                                        </XLayout_Left>
                                        <XLayout_Center className="ml-2">
                                            <XLayout>
                                                <XLayout_Top>
                                                    <XLayout_Title>{t("group-user-role.data-scope")}</XLayout_Title>
                                                </XLayout_Top>
                                                <XLayout_Center className="position-relative">
                                                    <LoadingBar loading={loadingUserDataScope} />
                                                    <XLayout_Box className="h-full p-0">
                                                        <TreeTable
                                                            value={userGroupsDataScope}
                                                            globalFilter={userGroupsDataScopeFilter}
                                                            filterKey="filterKey"
                                                            showGridlines
                                                            scrollable
                                                            resizableColumns
                                                        >
                                                            <Column
                                                                header={groupTypeName}
                                                                field="filterKey"
                                                                filterMatchMode="contains"
                                                                body={(m) => (<>
                                                                    <span title={`${m.code} - ${m.name}`}>{m.name}</span>
                                                                </>)}
                                                                expander
                                                                filter
                                                                
                                                                style={{ flex: "0 0 400px" }}
                                                            ></Column>
                                                            <Column
                                                                className="p-0"
                                                                body={(m) => (
                                                                    <Dropdown
                                                                        options={RolePermissionEnum.dataScope}
                                                                        value={m.dataScope}
                                                                        optionLabel="name"
                                                                        optionValue="code"
                                                                        onChange={(e) => applyUserGroupDataScope(m, e.value)}
                                                                        filter
                                                                        showClear
                                                                        className="inline-grid"
                                                                    ></Dropdown>
                                                                )}
                                                                style={{ flex: "1 0 250px" }}
                                                            ></Column>
                                                        </TreeTable>
                                                    </XLayout_Box>
                                                </XLayout_Center>
                                            </XLayout>
                                        </XLayout_Center>
                                    </XLayout>
                                }
                            </XLayout_Center>
                        </XLayout>
                    </TabPanel>
                </TabView>
            </XLayout_Center>
        </XLayout>

        {/* Dialogs */}
        <GroupDetail ref={refGroupDetail} type={groupType} afterSubmit={afterSubmitGroup}></GroupDetail>
        <ChooseUsers ref={refChooseUsers} afterSubmit={afterChooseUsers}></ChooseUsers>
        <UserDetail ref={refUserDetail} afterSubmit={afterSubmitUser}></UserDetail>
    </>)

}

GroupUserRole = forwardRef(GroupUserRole);

export default GroupUserRole;

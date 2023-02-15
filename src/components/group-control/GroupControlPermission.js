import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import CommonFunction from '@lib/common';
import Enumeration from '@lib/enum';
import _ from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { TreeTable } from "primereact/treetable";

import RoleApi from "services/RoleService";
import RolePermissionEnum from "./RolePermissionEnum";
import { TabPanel, TabView } from "primereact/tabview";
import ChooseUsers from "./components/ChooseUsers";
import { Dropdown } from "primereact/dropdown";
import classNames from 'classnames';
import RolePermissionFunction from "./RolePermissionFunction";
import { UserInfo } from '@ui-lib/user-info/UserInfo';
import { Checkbox } from "primereact/checkbox";
import { Toolbar } from 'primereact/toolbar';
import { CrmProductApi } from "../../services/CrmProductService";
import XDropdownTree from '@ui-lib/x-dropdown-tree/XDropdownTree';
import CrmCategoryApi from "../../services/CrmCategoryApi";
import { CrmServiceRoleExtendedApi } from "../../services/CrmServiceRoleExtendedService";

/**
 * props
 *      applications: ["system", "project", "crm", "hrm", ...] // applications for config role, "system" for main menu
 * @param {*} props
 * @param {*} ref
 * @returns
 */
const noneProduct = {
    id: 0,
    productName: `None`
}
const noneCategory = {
    id: 0,
    name: `None`
}

function GroupControlPermission(props, ref) {
    const t = CommonFunction.t;
    const { applications, type, refType, refId, refObject, afterSubmit, afterSubmitUser, onChangeUser } = props;
    const [roles, setRoles] = useState([]);
    const [role, setRole] = useState(null);
    // const [roleGroups, setRoleGroups] = useState([]);
    // const [rolePolicyData, setRolePolicyData] = useState([]);
    // const refAllRoleGroups = useRef([]);
    // const refAllRolePolicyData = useRef([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [application, setApplication] = useState(applications && applications.indexOf("system") > -1 ? "system" : applications[0])
    const defaultErrors = {
        code: "",
        name: "",
        productId: ""
    }
    const [errors, setErrors] = useState(defaultErrors);
    // const [menu, setMenu] = useState([]);
    // const [menuFilter, setMenuFilter] = useState(null);
    // const [groupsFilter, setGroupsFilter] = useState(null);
    // const [dataFilter, setDataFilter] = useState(null);
    const [loadingRole, setLoadingRole] = useState(false);
    const [loadingSubmitData, setLoadingSubmitData] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);
    // const [loadingRoleGroups, setLoadingRoleGroups] = useState(true);
    // const [loadingRolePolicyData, setLoadingRolePolicyData] = useState(false);
    // const refMenu = useRef(null);
    const refEditMode = useRef(null);
    // const refApplicationConfig = useRef(null);
    // const refRawMenu = useRef(null);
    const refGrantedMenuActions = useRef({}); // cache for submit, avoid recursive
    const refChooseUser = useRef(null);
    const [roleUsers, setRoleUsers] = useState([]);
    const refDataChanged = useRef(null);
    const refRawData = useRef(null);
    const refHasPolicy = useRef(false);
    const refPolicyComponent = useRef(null);
    // const [roleSets, setRoleSets] = useState([]);
    const refRawRoleGroups = useRef({});
    const refRoleGroupsChanged = useRef({});
    const refRolePolicyDataChanged = useRef({});


    const [products, setProducts] = useState([noneProduct]);

    const [categories, setCategories] = useState([noneCategory]);

    useEffect(() => {
        loadRolesAndMenuByApplication();
        // loadGroups();
        loadProducts()
        // loadCategories()
    }, [])

    /**
     * load Products
     */
    const loadProducts = () => {
        CrmProductApi.getAll({
            status: 1
        }).then((res) => {
            if (res) {
                setProducts([noneProduct, ...res])
            } else {
                setProducts([noneProduct])
            }
        })
    }

    const loadCategories = async (productId) => {
        let _lazy = {
            // first: 0,
            // rows: 9999,
            // page: 0,
            // status: { code: 1 },
            // productId
            size: 9999,
            page: 0
        };
        await CrmCategoryApi.list(_lazy).then((data) => {
            if (!CommonFunction.isEmpty(data)) {
                setCategories([
                    noneCategory,
                    ...data.content
                ])
            } else {
                setCategories([noneCategory])
            }
        });
    };

    useImperativeHandle(ref, () => ({
        /**
         * loadRolesAndMenuByApplication
         */
        loadRolesAndMenuByApplication: () => {
            loadRolesAndMenuByApplication();
        },

        // /**
        //  * loadGroups
        //  */
        // loadGroups: () => {
        //     loadGroups();
        // },
    }))

    /**
     * load roles and menu by application
     * @param {*} _application
     */
    const loadRolesAndMenuByApplication = (_application, _type = type) => {
        _application = _application || application;
        _type = _type || _application;
        // load roles by application
        RoleApi.getByApplicationAndType(_application, _type, refType, refId).then(res => {
            if (res) {
                res.forEach(el => {
                    el.roleSet = el.roleSet || "";
                });
                res = _.sortBy(res, ["roleSet", "name"]);
                // combine role sets
                // buildRoleSets(res);
                setRoles(res);
                setRole(null);
                setSelectedRole(null);
                setLoadingRoles(false);
            }
        });

        // get menu by application
        // let applicationConfig = RolePermissionEnum.applicationConfig.find(f => f.application === _application);
        // refApplicationConfig.current = applicationConfig;

        // if (applicationConfig) {
        //     RoleApi.getRoleMenuActions(
        //         0,
        //         applicationConfig.application === "system" ? "" : applicationConfig.application,
        //         applicationConfig.menu
        //     ).then(res => {
        //         if (res) {
        //             res = prepareRoleMenuActions(res);
        //             refMenu.current = res;
        //         }
        //     });
        // }
    }

    // /**
    //  * load groups
    //  */
    // const loadGroups = (_application) => {
    //     _application = _application || application;
    //     setLoadingRoleGroups(true);

    //     let _promise = RolePermissionFunction.loadGroups(_application, refType, refId, refObject);
    //     if (_promise) {
    //         _promise.then(res => {
    //             switch (_application) {
    //                 case "ticket-service":
    //                     buildRolePolicyData(res);
    //                     break;
    //                 default:
    //                     buildRoleGroup(res);
    //                     break;
    //             }
    //             setLoadingRoleGroups(false);
    //         });
    //     } else {
    //         setRoleGroups(null);
    //         setRolePolicyData(null);
    //     }
    // }

    // const buildRolePolicyData = (res) => {
    //     if (res) {
    //         let data = res.content || res;
    //         data = data.map(element => {
    //             return { ...element, key: element.id, refId: element.id, filterKey: `[${element.code}] ${element.name}` }
    //         });

    //         let _sorted = _.sortBy(data, ["name"]);
    //         refAllRolePolicyData.current = _.cloneDeep(_sorted);
    //         setRolePolicyData(_sorted);
    //     } else {
    //         refAllRolePolicyData.current = null;
    //         setRolePolicyData(null);
    //     }
    // }

    // const buildRoleGroup = (res) => {
    //     if (res) {
    //         let data = res.content || res;
    //         data.forEach(_group => {
    //             _group.parentId = _group.parentId && _group.parentId > 0 ? _group.parentId : null;
    //             _group.key = _group.id;
    //             _group.data = { filterKey: _group.name };
    //         });

    //         // build tree
    //         let _sorted = _.sortBy(data, ["name"]);
    //         refAllRoleGroups.current = _.cloneDeep(_sorted);
    //         // let _groups = CommonFunction.listToTree(_sorted, "id", "parentId", "children");
    //         let _groups = CommonFunction.listToTreeIgnoreParent(_sorted, "id", "parentId", "children");
    //         _groups = CommonFunction.buildObjectPath(_groups);
    //         setRoleGroups(_groups);
    //     } else {
    //         refAllRoleGroups.current = null;
    //         setRoleGroups(null);
    //     }
    // }

    // /**
    //  * build role set
    //  * @param {*} newSet
    //  */
    // const buildRoleSets = (_roles) => {
    //     _roles = _roles || _.cloneDeep(roles);
    //     let _roleSets = [];
    //     _roles.forEach(el => {
    //         if (el.roleSet) {
    //             _roleSets.push(el.roleSet);
    //         }
    //     });
    //     setRoleSets(_.uniq(_roleSets));
    // }

    /**
     * prepare role menu actions
     */
    // const prepareRoleMenuActions = (_menu) => {
    //     let _grantedMenuActions = {};
    //     // prepare resource action
    //     for (let i = 0; i < _menu.length; i++) {
    //         const el = _menu[i];
    //         el.index = i;
    //         el.menuActionsList = el.menuActions.map(m => ({
    //             ...m,
    //             localName: t(`menu-action.${m.menuCode}.${m.actionCode}`),
    //             name: t(`${m.actionCode}`)
    //         }));

    //         el.menuActions = el.menuActions.filter(f => f.status === 1).map(m => m.actionCode);
    //         if (el.menuActions.length > 0) {
    //             _grantedMenuActions[el.code] = _.cloneDeep(el.menuActions);
    //         }
    //     }

    //     // build tree
    //     let _sort = _.sortBy(_menu, "sortOrder");
    //     _sort.forEach(m => {
    //         m.key = m.id;
    //         m.isMenu = m.url ? true : false;
    //         m.data = { filterKey: t(m.name) };
    //     })
    //     refRawMenu.current = _.cloneDeep(_sort);
    //     _menu = CommonFunction.listToTree(_sort, "code", "parentCode", "children");
    //     _menu = CommonFunction.buildObjectPath(_menu);

    //     refGrantedMenuActions.current = _grantedMenuActions;
    //     return _menu;
    // }

    /**
     * create role
     */
    const createRole = () => {
        setErrors(_.cloneDeep(defaultErrors));
        refEditMode.current = Enumeration.crud.create;
        refDataChanged.current = { role: true, permission: true, user: true, roleGroups: true };
        setRole({
            id: null,
            application: application,
            type: application,
            refType: refType || null,
            refId: refId || null,
            name: "",
            code: "",
            description: "",
            roleSet: "",
            productId: 0,
            categoryId: 0,
        });
        refRoleGroupsChanged.current = {};
        refRolePolicyDataChanged.current = {};
        // setMenu(_.cloneDeep(refMenu.current));
        setRoleUsers([]);
        switch (application) {
            case "crm-service-service":
                // loadGroups(application);
                break;
            default:
                break;
        }
    }

    /**
     * edit role
     */
    const editRole = (_role, isCopy) => {
        let id = _role.roleId, rawData = { user: [] };
        setLoadingRole(true);
        // get role
        RoleApi.getById(id).then(res => {
            if (res) {
                CrmServiceRoleExtendedApi.getById(id).then(extend => {
                    if (extend) {
                        if (extend.productId) {
                            loadCategories(extend.productId)
                        }

                        refDataChanged.current = { role: false, permission: false, user: false, roleGroups: false };
                        refEditMode.current = Enumeration.crud.update;

                        // copy mode
                        if (isCopy === true) {
                            refDataChanged.current = { role: true, permission: true, user: true, roleGroups: true };
                            refEditMode.current = Enumeration.crud.create;
                            res = {
                                id: null,
                                application: application,
                                type: application,
                                name: `${res.name} - ${t("button.copy")}`,
                                code: `${res.code} - ${t("button.copy")}`,
                                description: res.description,
                                roleSet: res.roleSet,
                                policy: res.policy,
                                refType: res.refType || null,
                                refId: res.refId || null
                            }
                        }

                        // set state

                        setErrors(_.cloneDeep(defaultErrors));
                        setSelectedRole({
                            ..._role,
                            productId: extend.productId ? extend.productId : 0,
                            categoryId: extend.categoryId ? extend.categoryId : 0
                        });
                        setRole({
                            ...res,
                            productId: extend.productId ? extend.productId : 0,
                            categoryId: extend.categoryId ? extend.categoryId : 0
                        });
                        setLoadingRole(false);
                    }
                })
            }
        })

        // get role menu action
        // if (refApplicationConfig.current) {
        //     RoleApi.getRoleMenuActions(
        //         id,
        //         refApplicationConfig.current.application === "system" ? "" : refApplicationConfig.current.application,
        //         refApplicationConfig.current.menu
        //     ).then(res => {
        //         if (res) {
        //             res = prepareRoleMenuActions(res);
        //             setMenu(res);
        //         }
        //     })
        // }

        // get user in roles
        RoleApi.getRoleUsers(id).then(res => {
            if (res) {
                rawData.user = res.map(m => m.id);
                res.forEach(el => {
                    el.filterKey = el.fullName.toLowerCase();
                });
                setRoleUsers(res);
            }
        })
        // switch (application) {

        //     default:
        //         // get role group
        //         setLoadingRoleGroups(true);
        //         RoleApi.getRoleGroups(id).then(res => {
        //             if (res) {
        //                 // cache raw groups
        //                 let _rawRoleGroup = {};
        //                 res.forEach(_group => {
        //                     _rawRoleGroup[_group.id] = _group.dataScope || "owner";
        //                 });

        //                 // prepare selected
        //                 let _groups = _.cloneDeep(refAllRoleGroups.current);
        //                 _groups.forEach(_group => {
        //                     if (_rawRoleGroup[_group.id]) {
        //                         _group.dataScope = _rawRoleGroup[_group.id];
        //                     }
        //                 });

        //                 // build tree
        //                 // _groups = CommonFunction.listToTree(_groups, "id", "parentId", "children");
        //                 _groups = CommonFunction.listToTreeIgnoreParent(_groups, "id", "parentId", "children");
        //                 _groups = CommonFunction.buildObjectPath(_groups);

        //                 refRawRoleGroups.current = _rawRoleGroup;
        //                 refRoleGroupsChanged.current = {};
        //                 setRoleGroups(_groups);
        //                 setLoadingRoleGroups(false)
        //             }
        //         })
        //         break;
        // }

        refRawData.current = rawData;
    }

    /**
     * apply creating/editing prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = async (prop, val) => {
        let _role = _.cloneDeep(role);

        if (prop === "name") {
            let _code = generateKey(_role.name || "");
            if (CommonFunction.isEmpty(_role.code) || _role.code === _code) {
                _role.code = generateKey(val || "");
            }
        }

        switch (prop) {
            case 'productId':
                if (val) {
                    loadCategories(val)
                    _role['categoryId'] = 0
                } else {
                    _role['categoryId'] = 0
                }
                break
        }

        _role[prop] = val;
        validateRole([prop], _role);
        refDataChanged.current.role = true;
        setRole(_role);
    }

    /**
     * generate key
     * remove vietnamese charater
     * remove double space
     * replace space to _
     * @param {*} value
     * @returns
     */
    const generateKey = (value) => {
        return CommonFunction.removeAccentVietnamese(value).replace(/\s\s+/g, ' ').trim().replaceAll(" ", "_");
    }

    /**
     * validate ticket
     * @param {*} props
     * @param {*} _role
     * @returns
     */
    const validateRole = async (props, _role) => {
        _role = _role || _.cloneDeep(role);
        let result = { ...errors }, isValid = true;

        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }

        // validate props
        props.forEach(prop => {
            switch (prop) {
                case "code":
                case "name":
                    result[prop] = CommonFunction.isEmpty(_role[prop]) ? t("validate.required") : null;
                    break;
                case "productId":
                    result[prop] = _role.productId || _role.productId == 0 ? null : t("validate.required");
                    break;
                default:
                    break;
            }
        });

        // set state
        setErrors(result);

        // set is valid
        let allErrors = []
        for (const property in result) {
            if (!CommonFunction.isEmpty(result[property])) {
                isValid = false;
                allErrors.push(result[property]);
            }
        }

        return [isValid, _.uniq(allErrors)];
    };

    /**
     * render errors
     * @param {*} prop
     */
    const renderErrors = (prop) => {
        if (errors[prop]) {
            return <small className="p-invalid">{errors[prop]}</small>
        } else {
            return <></>
        }
    }

    /**
     * submit
     */
    const submit = async () => {
        const valid = await validateRole([], role)
        console.log(valid)
        if (!valid[0]) {
            return
        }
        setLoadingSubmitData(true);
        let success = true,
            _role = _.cloneDeep(role),
            _roles = _.cloneDeep(roles),
            roleResponse = null,
            dataChanged = refDataChanged.current,
            serviceRoleExtendedResponse = null;

        // check change
        // ------------------------------------------------
        // check must submit policy
        let _newPolicy = null, mustSubmitPolicy = false;
        if (refHasPolicy.current) {
            _newPolicy = refPolicyComponent.current.getPolicy();
            if (_newPolicy && _newPolicy.valid) {
                if (refEditMode.current === Enumeration.crud.create) {
                    if (Object.keys(_newPolicy.policy).length > 0) {
                        mustSubmitPolicy = true;
                    }
                } else {
                    let _oldPolicy = JSON.stringify(_role.policy || {});
                    if (JSON.stringify(_newPolicy.policy) !== _oldPolicy) {
                        mustSubmitPolicy = true;
                    }
                }
            }
        }

        dataChanged.policy = mustSubmitPolicy;
        if (!dataChanged.role && !dataChanged.permission && !dataChanged.user && !dataChanged.policy && !dataChanged.roleGroups && !dataChanged.rolePolicyData) {
            CommonFunction.toastInfo(t("common.no-data-changed"));
            setLoadingSubmitData(false);
            return;
        }

        // submit
        // -----------------------------------------------------
        _role = {
            ..._role,
            productId: _role.productId ? _role.productId : null,
            categoryId: _role.categoryId ? _role.categoryId : null
        }
        // submit role
        // ---------------------------
        if (dataChanged.role) {
            switch (refEditMode.current) {
                case Enumeration.crud.create:
                    roleResponse = await RoleApi.create(_role);
                    break;
                case Enumeration.crud.update:
                    roleResponse = await RoleApi.update(_role);
                    break;
                default:
                    break;
            }
            if (roleResponse) {
                serviceRoleExtendedResponse = await CrmServiceRoleExtendedApi.createUpdate({
                    id: roleResponse.id,
                    productId: _role.productId ? _role.productId : null,
                    categoryId: _role.categoryId ? _role.categoryId : null
                }).catch(() => { })
            }
            success = roleResponse !== null && serviceRoleExtendedResponse !== null;
        } else {
            roleResponse = { id: _role.id, code: _role.code, name: _role.name, policy: _role.policy, roleSet: _role.roleSet }; // fake like we call api
        }

        // grant permission
        // ---------------------------

        if (success && dataChanged.permission) {
            let payload = [];
            for (const key in refGrantedMenuActions.current) {
                if (Object.hasOwnProperty.call(refGrantedMenuActions.current, key)) {
                    const el = refGrantedMenuActions.current[key];
                    payload.push({
                        code: key,
                        menuActions: el
                    })
                }
            }
            let permissionResponse = await RoleApi.grantRoleMenuActions(roleResponse.id, payload);
            success = permissionResponse !== null;
        }

        // grant users
        // ---------------------------

        if (refEditMode.current === Enumeration.crud.create && (!roleUsers || roleUsers.length === 0)) dataChanged.user = false;
        if (success && dataChanged.user) {
            // check changed
            let changed = [];
            if (refEditMode.current === Enumeration.crud.create) {
                changed = roleUsers.map(m => ({ userId: m.id, status: 1 }));
            } else {
                let _roleUsers = roleUsers.map(m => m.id);
                let _rawRoleUsers = refRawData.current.user || [];
                // find new user
                let _newUser = _roleUsers.filter(f => !_rawRoleUsers.includes(f)).map(m => ({ userId: m, groupId: (refObject && refObject.groupId ? refObject.groupId : 0), status: 1 }));
                let _deleteUser = _rawRoleUsers.filter(f => !_roleUsers.includes(f)).map(m => ({ userId: m, groupId: (refObject && refObject.groupId ? refObject.groupId : 0), status: 0 }));
                changed = _newUser.concat(_deleteUser);
            }

            if (changed && changed.length > 0) {
                let userResponse = await RoleApi.grantRoleUsers(roleResponse.id, changed);
                success = userResponse !== null;
            }
        }

        // submit role group
        // ---------------------------

        if (success && dataChanged.roleGroups) {
            let oldScope = refRawRoleGroups.current;
            let newScope = refRoleGroupsChanged.current;

            // detect changed
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

            let roleGroupResponse = await RoleApi.grantRoleGroups(roleResponse.id, changed);
            success = roleGroupResponse !== null;
        }

        // submit role policy data
        // ---------------------------

        if (success && dataChanged.rolePolicyData) {
            let rolePolicyResponse = await RoleApi.grantRoleData(roleResponse.id, rolePolicyData);
            success = rolePolicyResponse !== null;
        }

        // submit policy
        // ---------------------------

        if (success && dataChanged.policy) {
            // submit policy
            let policyResponse = await RoleApi.updateRolePolicy(roleResponse.id, _newPolicy.policy);
            success = policyResponse !== null;
            roleResponse.policy = _newPolicy.policy;
        }

        // submit and grant success
        if (success) {
            let _newRole = { roleId: roleResponse.id, code: roleResponse.code, name: roleResponse.name, policy: roleResponse.policy, roleSet: roleResponse.roleSet || "" };
            switch (refEditMode.current) {
                case Enumeration.crud.create:
                    _roles.unshift(_newRole);
                    break;
                case Enumeration.crud.update:
                    for (let i = 0; i < _roles.length; i++) {
                        if (_roles[i].roleId === _newRole.roleId) {
                            _roles[i] = Object.assign(_roles[i], _newRole);
                            break;
                        }
                    }
                    break;
                default:
                    break;
            }
            _roles = _.sortBy(_roles, ["roleSet", "name"]);
            setRoles(_roles);

            // reload data and edit
            editRole(_newRole);

            if (afterSubmitUser && typeof afterSubmitUser === 'function') {
                afterSubmitUser();
            }

            CommonFunction.toastSuccess(t("common.save-success"));
        }
        setLoadingSubmitData(false);
    }

    /**
     * remove role
     */
    const removeRole = (_role) => {
        CommonFunction.showConfirm(
            t("confirm.delete.message").format(`${_role.code} - ${_role.name}`),
            t("confirm.delete.title"),
            () => {
                let deleteSelected = selectedRole && _role ? selectedRole.roleId === _role.roleId : false;
                RoleApi.delete({ id: _role.roleId }).then(res => {
                    let _roles = roles ? _.cloneDeep(roles) : [];
                    _.remove(_roles, { roleId: _role.roleId });
                    setRoles(_roles);

                    if (deleteSelected) {
                        setRole(null);
                    }
                    CrmServiceRoleExtendedApi.delete(_role.roleId).catch(() => { })
                    CommonFunction.toastSuccess(t("common.delete-success"));
                });
            }
        )
    }

    /**
     * add users to role
     */
    const addUsersToRole = () => {
        refChooseUser.current.choose();
    }

    /**
     * after choose user
     */
    const afterChooseUsers = (selected) => {
        let _roleUsers = _.cloneDeep(roleUsers);
        let _addUsers = _.cloneDeep([]);

        // find duplicated
        let selectedIds = selected.users.map(m => m.id);
        let existed = _roleUsers.map(m => m.id);
        let addIds = selectedIds.filter(x => !existed.includes(x));

        // add not existed user
        for (let i = 0; i < selected.users.length; i++) {
            const u = selected.users[i];
            u.filterKey = u.fullName.toLowerCase();
            if (addIds.indexOf(u.id) > -1) {
                _roleUsers.push(u);
                _addUsers.push(u);
            }
        }
        refDataChanged.current.user = true;
        setRoleUsers(_roleUsers);

        if (onChangeUser && typeof onChangeUser === 'function') {
            onChangeUser(Enumeration.crud.create, _addUsers);
        }
    }

    /**
     * remove role user
     * @param {*} _user
     */
    const removeRoleUser = (_user) => {
        let _roleUsers = _.cloneDeep(roleUsers);
        let _deleteUsers = _.cloneDeep([]);

        _roleUsers = _roleUsers.filter(f => f.id !== _user.id);
        _deleteUsers.push(_user);

        refDataChanged.current.user = true;

        setRoleUsers(_roleUsers);
        if (onChangeUser && typeof onChangeUser === 'function') {
            onChangeUser(Enumeration.crud.delete, _deleteUsers)
        }
    }


    const renderLeftToolbarContent = () => {
        return <Button
            // className="p-button-text"
            label={t('crm-service.group.create')}
            icon="bx bx-plus"
            onClick={createRole}
        />
    }

    return (<>
        <XLayout left="400px" className="px-2">
            <XLayout_Left className="mr-2">
                <XLayout className="pb-2">
                    <XLayout_Top className="mb-1 position-relative">
                        <LoadingBar loading={loadingRoles}></LoadingBar>
                        <XLayout_Title>{t("crm-service.group.left-title")}</XLayout_Title>
                        <XToolbar
                            className="p-0"
                            left={renderLeftToolbarContent}
                        // right={() => (<>
                        //     <Dropdown
                        //         options={applications}
                        //         value={application}
                        //         itemTemplate={(option) => t("role-permission.application." + option)}
                        //         valueTemplate={(option) => `${t("role-permission.role-scope")}: ${t("role-permission.application." + option)}`}
                        //         onChange={(e) => changeApplication(e.value)}
                        //         className={classNames({"display-none": applications.length <= 1})}
                        //     ></Dropdown>
                        // </>)}
                        ></XToolbar>
                    </XLayout_Top>

                    <XLayout_Center>
                        <XLayout_Box className="h-full p-0">
                            {!roles || roles.length === 0 &&
                                <div className="h-full w-full flex align-items-center justify-content-center flex-column">
                                    <i className="bx bx-info-circle fs-30 text-grey"></i>
                                    <span className="my-2">{t("crm-service.group.empty")}</span>
                                    <Button icon="bx bx-plus" label={t("crm-service.group.create")} onClick={createRole}></Button>
                                </div>
                            }
                            {roles && roles.length > 0 &&
                                <DataTable
                                    value={roles}
                                    className="border-none"
                                    showGridlines
                                    scrollable
                                    scrollHeight="flex"
                                    selectionMode="single"
                                    rowGroupMode="subheader"
                                    groupField="roleSet"
                                    rowGroupHeaderTemplate={(data) => (<div>{data.roleSet || t("role.common")}</div>)}
                                    rowGroupFooterTemplate={() => (<></>)}
                                    selection={selectedRole}
                                    onSelectionChange={(e) => editRole(e.value)}
                                    dataKey="roleId"
                                    filterDisplay="row"
                                >
                                    <Column
                                        header={t("crm-service.group.code")}
                                        field="code"
                                        filter
                                        filterMatchMode="contains"
                                        showFilterMenu={false}
                                        showClearButton={false}

                                        bodyClassName="overflow-hidden"
                                        style={{ flex: "0 0 120px" }}

                                    ></Column>
                                    <Column
                                        header={t("crm-service.group.name")}
                                        field="name"
                                        filter
                                        filterMatchMode="contains"
                                        showFilterMenu={false}
                                        showClearButton={false}

                                        style={{ flex: "1 0 120px" }}
                                    ></Column>
                                    <Column
                                        bodyClassName='p-0 flex justify-content-center align-items-center'
                                        body={(m) => (<>
                                            <Button
                                                className="p-button-rounded p-button-text"
                                                icon="bx bx-copy text-grey"
                                                tooltip={t("button.copy")}
                                                onClick={() => editRole(m, true)}
                                            ></Button>
                                            <Button
                                                className="p-button-rounded p-button-text"
                                                icon="bx bx-trash text-grey"
                                                tooltip={t('common.delete')}
                                                onClick={() => removeRole(m)}
                                            ></Button>
                                        </>)}
                                        style={{ flex: "0 0 70px" }}
                                    ></Column>

                                </DataTable>
                            }
                        </XLayout_Box>
                    </XLayout_Center>

                </XLayout>
            </XLayout_Left>

            <XLayout_Center className="pb-2">
                {!role &&
                    <div className="h-full w-full flex align-items-center justify-content-center flex-column">
                        <i className="bx bx-info-circle fs-30 text-grey"></i>
                        <span className="my-2">{t("role-permission.not-selected-role")}</span>
                    </div>
                }
                {role &&
                    <XLayout>
                        <XLayout_Top className="mb-1">
                            <XLayout_Title>{t("crm-service.group.right-title")}</XLayout_Title>
                            <XToolbar left={() => (<>
                                <Button label={t('common.save')} loading={loadingSubmitData} icon="bx bxs-save" onClick={submit} />
                            </>)}></XToolbar>
                        </XLayout_Top>

                        <XLayout_Center>
                            <XLayout className="position-relative">
                                <LoadingBar loading={loadingRole}></LoadingBar>
                                <XLayout_Top>
                                    <div className="p-fluid fluid  formgrid grid p-0">
                                        <div className="col-6">
                                            <span className="p-float-label">
                                                <InputText
                                                    value={role.name}
                                                    onChange={(e) => applyChange('name', e.target.value)}
                                                />
                                                <label className="require">{t("crm-service.group.name")}</label>
                                                {renderErrors("name")}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <span className="p-float-label">
                                                <InputText
                                                    value={role.code}
                                                    onChange={(e) => applyChange('code', e.target.value)}
                                                />
                                                <label className="require">{t("crm-service.group.code")}</label>
                                                {renderErrors("code")}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <span className="p-float-label">
                                                <Dropdown
                                                    value={role.productId}
                                                    options={products}
                                                    onChange={(e) => applyChange('productId', e.target.value)}
                                                    optionLabel="productName"
                                                    optionValue="id"
                                                    filter
                                                    showClear
                                                    filterBy="productName"
                                                ></Dropdown>
                                                <label className="require">{t("crm-service.group.product")}</label>
                                            </span>
                                            {renderErrors("productId")}
                                        </div>
                                        <div className="col-6">
                                            <span className="p-float-label">
                                                <XDropdownTree
                                                    value={role.categoryId}
                                                    options={categories}
                                                    optionLabel="name"
                                                    optionValue="id"
                                                    filter
                                                    showClear
                                                    filterBy="name"
                                                    onChange={(e) => applyChange("categoryId", e.value)}
                                                />
                                                <label>{t("crm-service.group.category")}</label>
                                            </span>
                                        </div>
                                        {/* <div className="col-6">
                                            <span className="p-float-label">
                                                <Dropdown
                                                    value={null}
                                                    options={[]}
                                                    // onChange={(e) => applyChange('productId', e.target.value)}
                                                    editable
                                                    optionLabel="name"
                                                    optionValue="id"
                                                    filter
                                                    showClear
                                                    filterBy="name"
                                                    disabled
                                                ></Dropdown>
                                                <label>{t("crm-service.group.flower")}</label>
                                            </span>
                                        </div> */}
                                        {/* <div className="col-6">
                                            <span className="p-float-label">
                                                <Dropdown
                                                    value={role.roleSet}
                                                    options={roleSets}
                                                    onChange={(e) => applyChange('roleSet', e.target.value)}
                                                    editable
                                                    showClear
                                                ></Dropdown>
                                                <label>{t("role-permission.role-set")}</label>
                                            </span>
                                        </div> */}
                                        {/* <div className="col-6">
                                            <span className="p-float-label">
                                                <InputText
                                                    value={role.description || ""}
                                                    onChange={(e) => applyChange('description', e.target.value)}
                                                />
                                                <label>{t("common.description")}</label>
                                            </span>
                                        </div> */}
                                    </div>
                                </XLayout_Top>
                                <XLayout_Center>



                                    <XLayout>
                                        <XLayout_Top className="mb-2">
                                            <XToolbar left={() => (<>
                                                <Button
                                                    label={t("group-user-role.add-user")}
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
                                                        header={t("role-permission.user")}
                                                        field="filterKey"
                                                        filter
                                                        filterMatchMode="contains"
                                                        showFilterMenu={false}
                                                        showClearButton={false}

                                                        body={(u) => (
                                                            <div className="width-fit-content">
                                                                <UserInfo id={u.id}></UserInfo>
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

                                </XLayout_Center>
                            </XLayout>
                        </XLayout_Center>
                    </XLayout>
                }
            </XLayout_Center>
        </XLayout>
        <ChooseUsers ref={refChooseUser} afterSubmit={afterChooseUsers}></ChooseUsers>
    </>)

}

GroupControlPermission = forwardRef(GroupControlPermission);

export default GroupControlPermission;

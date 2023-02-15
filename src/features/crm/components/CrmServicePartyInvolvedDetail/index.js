import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Checkbox } from "primereact/checkbox";
import _ from "lodash";
import CommonFunction from "@lib/common";
import { Dropdown } from "primereact/dropdown";
import "./styles.scss";

import { UserAutoComplete } from "../UserAutoComplete";
import { MODE } from "features/crm/utils/constants";
import { CrmServicePartyInvolvedApi } from "services/crm/CrmServicePartyInvolvedService";
import CrmFieldEdittingValue from "../CrmFieldEdittingValue";

function CrmServicePartyInvolvedDetail(props, ref) {
  const t = CommonFunction.t;
  const {
    data,
    reload,
    employees,
    partyInvolvedPartnerFunctions,
    setLoading,
    cancel,
    permission,
    className,
    serviceOrderId,
    objectTypeId,
    moduleName,
    reloadInfo,
    moduleLabel,
    userGroups,
  } = props;

  const emptyDetail = {
    id: null,
    employeeId: null,
    // partyInvolvedPartnerFunctionId: null,
    authorizationGroupId: null,
  };

  const emptyValidate = {
    employeeId: null,
    authorizationGroupId: null,
    // partyInvolvedPartnerFunctionId: null,
  };

  const [employeeList, setEmpoyeeList] = useState([]);

  const [groupList, setGroupList] = useState([]);

  const [detail, setDetail] = useState(emptyDetail);

  const [validate, setValidate] = useState(emptyValidate);

  const [mode, setMode] = useState(MODE.CREATE);

  const [readOnly, setReadOnly] = useState(false);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (userGroups) {
      setGroupList(
        userGroups.map((u) => ({
          ...u,
          fullName: u.authorizationGroupName,
        }))
      );
    }
  }, [userGroups]);

  useEffect(() => {
    const _employees = employees.map((o) => {
      return {
        id: o.id,
        fullName: `${o.employeeLastName ? `${o.employeeLastName} ` : ``}${
          o.employeeMiddleName ? `${o.employeeMiddleName} ` : ``
        }${o.employeeFirstName ? o.employeeFirstName : ``}`,
      };
    });
    setEmpoyeeList(_employees);
  }, [employees]);

  useEffect(() => {
    setLoading(false);
    if (data) {
      edit(data);
      setReadOnly(!permission?.update);
    } else {
      create();
      setReadOnly(false);
    }
  }, [data]);

  const create = () => {
    setDetail({
      ...emptyDetail,
    });
    setMode(MODE.CREATE);
    setValidate(emptyValidate);
  };

  const edit = (data) => {
    setMode(MODE.UPDATE);
    setValidate(emptyValidate);
    let _employeeId = null;
    let _authorizationGroupId = null;
    if (data.employeeId) {
      _employeeId = _.find(employees, { id: data.employeeId });
      if (_employeeId) {
        _employeeId.fullName = `${
          _employeeId.employeeLastName ? `${_employeeId.employeeLastName} ` : ``
        }${
          _employeeId.employeeMiddleName
            ? `${_employeeId.employeeMiddleName} `
            : ``
        }${_employeeId.employeeFirstName ? _employeeId.employeeFirstName : ``}`;
      }
    }
    if (data.authorizationGroupId) {
      _authorizationGroupId = _.find(groupList, {
        id: data.authorizationGroupId,
      });
      if (_authorizationGroupId) {
        _authorizationGroupId.fullName =
          _authorizationGroupId.authorizationGroupName;
      }
    }
    setDetail({
      ...data,
      employeeId: _employeeId ? [_employeeId] : null,
      authorizationGroupId: _authorizationGroupId ? [_authorizationGroupId] : null,
    });
  };

  useImperativeHandle(ref, () => ({
    submitProject: () => {
      submitProject();
    },
  }));

  const submitProject = () => {
    let isValid = performValidate([]);
    if (isValid) {
      let _service = { ...detail };
      let _mode = _.cloneDeep(mode);
      if (_mode !== MODE.UPDATE && _service.id && _service.id > 0) {
        _mode = MODE.UPDATE;
        setMode(MODE.UPDATE);
      }

      try {
        switch (_mode) {
          case MODE.CREATE:
            setLoading(true);
            CrmServicePartyInvolvedApi.create({
              ..._service,
              serviceOrderId,
              objectTypeId,
              employeeId: _service.employeeId && _service.employeeId[0].id,
              authorizationGroupId : _service.authorizationGroupId && _service.authorizationGroupId[0].id
            })
              .then((_data) => {
                if (_data) {
                  if (reload) {
                    reload("new");
                    cancel();
                  }

                  if (reloadInfo) {
                    reloadInfo();
                  }

                  CommonFunction.toastSuccess(t("common.save-success"));
                }
                setLoading(false);
              })
              .catch((error) => {
                CommonFunction.toastError(error);
                setLoading(false);
              });

            break;
          case MODE.UPDATE:
            setLoading(true);
            CrmServicePartyInvolvedApi.update(
              {
                employeeId: _service.employeeId[0].id,
              },
              _service.id
            )
              .then((_data) => {
                if (_data) {
                  if (reload) {
                    reload("update");
                    cancel();
                  }
                  if (reloadInfo) {
                    reloadInfo();
                  }

                  CommonFunction.toastSuccess(t("common.save-success"));
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
      } catch (error) {
        console.log({
          error
        });
      }
    }
  };

  const applyServiceChange = (prop, val) => {
    let _detail = _.cloneDeep(detail);
    _detail[prop] = val;

    setDetail(_detail);
    performValidate([prop], _detail);
  };

  const performValidate = (props, _currentDetail) => {
    let result = _.cloneDeep(validate),
      isValid = true;
    let _detail = _currentDetail ? _currentDetail : detail;
    // validate all props
    if (props.length === 0) {
      for (const property in result) {
        props.push(property);
      }
    }

    // validate props
    props.forEach((prop) => {
      switch (prop) {
        case "employeeId":
          result["authorizationGroupId"] = null;
          result[prop] =
            (_detail.employeeId && _detail.employeeId.length > 0) ||
            (detail.authorizationGroupId &&
              detail.authorizationGroupId.length > 0)
              ? null
              : `${t("crm.sale-party-involved.employee")} ${t(
                  "message.cant-be-empty"
                )}`;
          break;
        case "authorizationGroupId":
          result["employeeId"] = null;
          result[prop] =
            (_detail.authorizationGroupId &&
              _detail.authorizationGroupId.length > 0) ||
            (detail.employeeId && detail.employeeId.length > 0)
              ? null
              : `${t("crm.employee.user-group")} ${t("message.cant-be-empty")}`;
          break;
        // case "partyInvolvedPartnerFunctionId":
        //   result[prop] = _detail.partyInvolvedPartnerFunctionId
        //     ? null
        //     : `${t("crm.sale-party-involved.relation-type")} ${t(
        //         "message.cant-be-empty"
        //       )}`;
        //   break;

        default:
          break;
      }
    });

    console.log({result});

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

  const handleChangeRelated = (e) => {
    applyServiceChange("employeeId", e.value);
  };

  const handleChangeGroup = (e) => {
    applyServiceChange("authorizationGroupId", e.value);
  };

//   const handleChangeRelationType = (e) => {
//     applyServiceChange("partyInvolvedPartnerFunctionId", e.value);
//   };

  return (
    <div
      className={`p-fluid fluid formgrid grid px-2 ${
        className ? className : ``
      }`}
    >
      {/* lead */}
      <div className="col-12">
        <CrmFieldEdittingValue
          label={moduleLabel || t("crm-service.service-order.tab.title")}
        >
          <div className="line-height-3">
            <span>{moduleName}</span>
          </div>
        </CrmFieldEdittingValue>
      </div>

      <div className="choose-option-wrapper  p-fluid fluid formgrid grid px-2 pt-2 relative col-12">
        <div className="choose-option absolute flex align-items-center ">
          {t("crm-service.service-order.or")}{" "}
          <span className="text-7xl">[</span>
        </div>
        <div className="col-1"></div>
        {/* employee */}
        <div className="col-11">
          <CrmFieldEdittingValue
            label={t("crm-service-order.sale-party-involved.employee")}
            require={true}
          >
            <div className="field relative account">
              <div className="crm-personel-search">
                <span>
                  <UserAutoComplete
                    id="product-user"
                    users={employeeList}
                    value={detail.employeeId}
                    onChange={handleChangeRelated}
                    placeholder={
                      !detail.employeeId || detail.employeeId.length < 1
                        ? t("crm-service-order.service-party-involved.personnel-search")
                        : ""
                    }
                  
                  />
                </span>
                {(!detail.employeeId || detail.employeeId.length < 1) && (
                  <div className="absolute icon-search">
                    <i className="bx bx-search-alt-2"></i>
                  </div>
                )}
                {validate.employeeId && (
                  <small className="p-invalid">{validate.employeeId}</small>
                )}
              </div>
            </div>
          </CrmFieldEdittingValue>
        </div>
        {/* group */}
        <div className="col-1"></div>
        <div className="col-11">
          <CrmFieldEdittingValue
            label={t("crm-service-order.employee.user-group")}
            require={true}
          >
            <div className="field relative account">
              <div className="crm-personel-search">
                <span>
                  <UserAutoComplete
                    id="product-user"
                    users={groupList}
                    value={detail.authorizationGroupId}
                    onChange={handleChangeGroup}
                    placeholder={
                      !detail.authorizationGroupId ||
                      detail.authorizationGroupId.length < 1
                        ? t("crm-service-order.employee.search.user-group")
                        : ""
                    }
                    disabled={
                      (detail.isMain && mode === MODE.UPDATE) ||
                      (detail.employeeId && detail.employeeId.length > 0)
                    }
                  />
                </span>
                {(!detail.authorizationGroupId ||
                  detail.authorizationGroupId.length < 1) && (
                  <div className="absolute icon-search">
                    <i className="bx bx-search-alt-2"></i>
                  </div>
                )}

                {validate.authorizationGroupId && (
                  <small className="p-invalid">
                    {validate.authorizationGroupId}
                  </small>
                )}
              </div>
            </div>
          </CrmFieldEdittingValue>
        </div>
      </div>

      {/* role */}
      {/* <div className="col-12">
        <CrmFieldEdittingValue
          label={t("crm.sale-party-involved.relation-type")}
        >
          <div className="field">
            <span className="">
              <Dropdown
                options={partyInvolvedPartnerFunctions}
                optionLabel="partyInvolvedPartnerFunctionName"
                optionValue="id"
                filter
                placeholder="--None--"
                filterBy="partyInvolvedPartnerFunctionName"
                value={detail.partyInvolvedPartnerFunctionId}
                onChange={handleChangeRelationType}
              />
            </span>
            {validate.partyInvolvedPartnerFunctionId && (
              <small className="p-invalid">
                {validate.partyInvolvedPartnerFunctionId}
              </small>
            )}
          </div>
        </CrmFieldEdittingValue>
      </div> */}
    </div>
  );
}

CrmServicePartyInvolvedDetail = forwardRef(CrmServicePartyInvolvedDetail);
export default CrmServicePartyInvolvedDetail;

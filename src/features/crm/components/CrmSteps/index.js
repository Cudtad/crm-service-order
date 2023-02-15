import CommonFunction from "@lib/common";
import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";

import { Steps } from "primereact/steps";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import CrmFieldPreviewValue from "../CrmFieldPreviewValue";
import CrmFieldEdittingValue from "../CrmFieldEdittingValue";
import { Dropdown } from "primereact/dropdown";
import CrmCreateDialog from "../CrmCreateDialog"
// import { CrmSaleOpportunityStageReasonApi } from "services/crm/CrmSaleOpportunityStageReasonService";

export default function CrmSteps(props) {
  const t = CommonFunction.t;
  const { reasonId, activeStatusId, info, status, confirmLabel, optionSteps, optionStepId, changeStateApi, reload, permission, objectId, dialogTitle  , getStageReason, labelReason, optionReasonLabel} = props;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const [stepStatus, setStepStatus] = useState([]);

  const [detail, setDetail] = useState({
    stateId : null, 
    reasonId : null
  })

  const defaultError = {
    stateId : null,
    reasonId : null
  }

  const [error, setError] = useState(defaultError);

  const [stagesReason, setStagesReason] = useState([]);

  const refDialog = useRef();

  useEffect(() => {
    if (activeStatusId) {
      setDetail(prev => ({
        ...prev,
        stateId : activeStatusId,
        reasonId : reasonId
      }))
      let _status = _.cloneDeep(status)
      let index = _.findIndex(status, { id: activeStatusId });
      if (index != -1) {
        setActiveIndex(index);
      } else if (optionStepId) {
        index = _.findIndex(status, { id: optionStepId });
        setActiveIndex(index);
      }
      if (optionStepId) {
        const _active = _.find(optionSteps, {id: activeStatusId})
        if (_active) {
          _status[index].label = _active.label
        }
      }
      setStepStatus(_status)
    }
  }, [activeStatusId, status]);

  useEffect(() => {
    if(detail.stateId){
      loadStageReason(detail.stateId);
    }
  }, [detail.stateId])

  const loadStageReason = (id) => {
    try {
      getStageReason(id).then((res) => {
        if (res) {
          setStagesReason(res);
        } else {
          setStagesReason([]);
        }
      }).catch();
    } catch (error) {
      setStagesReason([]);
    }
  };


  const onSelect = (e) => {
    setActiveIndex(e.index);
  };

  const performValidate = (props, _currentDetail) => {
    let result = _.cloneDeep(error),
      isValid = true;
    let _detail = _currentDetail ? _currentDetail : detail;
    if (props.length === 0) {
      for (const property in result) {
        props.push(property);
      }
    }
    props.forEach((prop) => {
      switch (prop) {
        case 'reasonId':
          result['reasonId'] = stagesReason.length > 0 && !_detail.reasonId ? `${labelReason} ${t(
            "message.cant-be-empty"
          )}` : null
          break;
        case 'stateId':
          const _active = _.find(optionSteps, {id: _detail.stateId})
          result['stateId'] = !_active ? `${t("crm.steps.stage")} ${t(
            "message.cant-be-empty"
          )}` : null
          break;
        default:
          break;
      }
    });
    setError(result);
    for (const property in result) {
      if (result[property]) {
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  const onDialogSave = () => {
    const isValid = performValidate([], null)
    if (isValid){
      setError(defaultError)
      save(detail.stateId, detail.reasonId)
    }
  };

  const handleConfirm = () => {
    if (status[activeIndex].id != optionStepId) {
      save(status[activeIndex].id)
    } else {
      refDialog.current.create()
    }
  };

  const save =async(id , reasonId = null) => {
    setLoading(true)
    let res = null
    if(reasonId){
       res = await changeStateApi(objectId, id , reasonId)
    } else 
      res = await changeStateApi(objectId, id)

    if (res) {
      CommonFunction.toastSuccess(t("common.save-success"))
      if (reload) {
        reload()
      }
      if (refDialog?.current) {
        refDialog.current.close()
      }
    }
    setLoading(false)
  }

  const template = (options) => {
    const toggleIcon = options.collapsed
      ? "bx bx-chevron-right"
      : "bx bx-chevron-down";
    const className = `${options.className} py-0 px-2`;
    const titleClassName = `${options.titleClassName} pl-1`;

    return (
      <div className={className}>
        <div className="justify-content-start p-fluid fluid formgrid grid w-full align-items-center">
          <div className="col-fixed py-0">
            <Button
              className="p-button-outlined p-button-primary p-button-sm"
              icon={toggleIcon}
              onClick={options.onTogglerClick}
            />
          </div>

          <div className="justify-content-start p-fluid fluid formgrid grid w-full align-items-center col">
            <div className="col-10 px-0">
              <Steps
                className="py-0 pr-4"
                model={stepStatus}
                activeIndex={activeIndex}
                onSelect={onSelect}
                readOnly={false}
              />
            </div>

            <div className="col-2">
              <div className="col-fixed px-0">
                <Button
                  className="p-button-sm"
                  label={confirmLabel || t("crm.steps.mark-status-complete")}
                  icon="pi pi-check"
                  loading={loading}
                  onClick={handleConfirm}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInfo = (item, index) => {
    return (
      <CrmFieldPreviewValue
        key={index}
        label={item.label}
        value={item.value}
        users={item.users}
      />
    );
  };

  const applyServiceChange = (prop, val) => {
    let _detail = _.cloneDeep(detail);
    _detail[prop] = val;
    setDetail(_detail);
    performValidate([prop], _detail);
  };

  const handleChangeState = (e) => {
    applyServiceChange('stateId', e.value)
  }

  const handleChangeReason = e => {
    applyServiceChange('reasonId', e.value)
  }
  
  return (<>
    <Panel
      className="border-round-md overflow-hidden"
      headerTemplate={template}
      toggleable
      collapsed={true}
    >
      <p className="text-xl mt-0 font-bold">{t("crm.steps.key-fields")}</p>
      {info && info.length ? (
        <div className="w-6">{info.map(renderInfo)}</div>
      ) : null}
    </Panel>
    {optionStepId
      ?
      <CrmCreateDialog
        ref={refDialog}
        title={dialogTitle}
        onSubmit={onDialogSave}
        permission={permission}
      >
        <div
          className={`p-fluid fluid formgrid grid px-2`}
        >
          {/* role */}
          <div className="col-12">
            <CrmFieldEdittingValue
              label={t("crm.steps.stage")}
              require={true}
            >
              <div className="field">
                <span className="">
                  <Dropdown
                    options={optionSteps}
                    optionLabel="label"
                    optionValue="id"
                    filter
                    placeholder="--None--"
                    filterBy="label"
                    value={detail.stateId}
                    onChange={handleChangeState}
                  />
                </span>
                {error && error.stateId && (
                    <small className="p-invalid">
                      {error.stateId}
                    </small>
                  )}
              </div>
            </CrmFieldEdittingValue>
          </div>
         {stagesReason.length > 0 && <div className="col-12 px-3 py-1">
              <CrmFieldEdittingValue
                label={labelReason}
                require={stagesReason.length > 0}
              >
                <div className="field">
                  <span className="">
                    <Dropdown
                      options={stagesReason}
                      optionLabel={optionReasonLabel}
                      optionValue="id"
                      filter
                      filterBy={optionReasonLabel}
                      value={detail.reasonId}
                      onChange={handleChangeReason}
                      disabled={
                        !(stagesReason.length > 0)
                      }
                    />
                  </span>
                  {error && error.reasonId && stagesReason.length > 0 && (
                    <small className="p-invalid">
                      {error.reasonId}
                    </small>
                  )}
                </div>
              </CrmFieldEdittingValue>
            </div>}
        </div>
      </CrmCreateDialog>
      : null
    }
  </>
  );
}

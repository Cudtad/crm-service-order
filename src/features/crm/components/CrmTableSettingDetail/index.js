import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import CommonFunction from "@lib/common";
import "./styles.scss";
import { PickList } from 'primereact/picklist';
import CrmCreateDialog from "../CrmCreateDialog";
import { InputNumber } from "primereact/inputnumber";
import { CrmColumnConfigApi } from "../../../../services/crm/CrmColumnConfigService";

function CrmTableSettingDetail(props, ref) {
  const t = CommonFunction.t;
  const {
    objectTypeId,
    data,
    filterColumns,
    reload
  } = props;

  const [source, setSource] = useState([]);

  const [target, setTarget] = useState([]);

  const [cacheWidth, setCacheWidth] = useState([]);

  const refDialog = useRef();

  useImperativeHandle(ref, () => ({
    open: () => {
      refDialog.current.create();
      initLoad()
    },
  }));

  const initLoad = () => {
    let _cacheWidth = []
    if (data && data.columConfigDetailDTOS?.length) {
      let _filterColumns = _.cloneDeep(filterColumns)
      const _selectedColumns = data.columConfigDetailDTOS.map(o => {
        _.remove(_filterColumns, { columnName: o.columnName })
        _cacheWidth.push({
          columnName: o.columnName,
          columnWidth: o.columnWidth ?? 200
        })
        return {
          ...o,
          field: t(o.columnName),
          header: t(o.columnName),
          columnWidth: o.columnWidth ?? 200
        }
      })
      _filterColumns = _filterColumns.map(o => {
        _cacheWidth.push({
          columnName: o.columnName,
          columnWidth: o.columnWidth ?? 200
        })
        return {
          ...o,
          field: t(o.columnName),
          header: t(o.columnName),
          columnWidth: o.columnWidth ?? 200
        }
      })
      
      setTarget(_selectedColumns)
      setSource(_filterColumns)
      setCacheWidth(_cacheWidth)
    } else {
      const _filterColumns = filterColumns.map(o => {
        _cacheWidth.push({
          columnName: o.columnName,
          columnWidth: o.columnWidth ?? 200
        })
        return {
          ...o,
          field: t(o.columnName),
          header: t(o.columnName),
          columnWidth: o.columnWidth ?? 200
        }
      })
      setTarget(_filterColumns)
      setSource([])
      setCacheWidth(_cacheWidth)
    }
  }

  const onCloseDialog = () => {
    refDialog.current.close();
  };

  const setLoadingSave = (flg) => {
    refDialog.current.setLoading(flg);
  };

  const submitProject = () => {
    setLoadingSave(true)
    const _target = target.map(o => {
      const _column = _.find(cacheWidth, {columnName: o.columnName})
      return {
        ...o,
        columnWidth: _column?.columnWidth ?? 200
      }
    })
    if (!data?.id) {
      CrmColumnConfigApi.create({
        objectTypeId,
        userId: window.app_context.user.id,
        columConfigDetailDTOS: _target
      }).then(res => {
        if (res) {
          CommonFunction.toastSuccess(t("common.save-success"))
          onCloseDialog()
          if (reload) {
            reload(res)
          }
        }
        setLoadingSave(false)
      }).catch((error) => {
        CommonFunction.toastError(error)
        setLoadingSave(false)
      })
    } else {
      CrmColumnConfigApi.update({
        objectTypeId,
        userId: window.app_context.user.id,
        columConfigDetailDTOS: _target
      }, data.id).then(res => {
        if (res) {
          CommonFunction.toastSuccess(t("common.save-success"))
          onCloseDialog()
          if (reload) {
            reload(res)
          }
        }
        setLoadingSave(false)
      }).catch((error) => {
        CommonFunction.toastError(error)
        setLoadingSave(false)
      })
    }
  }

  const onChange = (event) => {
    setSource(event.source);
    setTarget(event.target);
  }

  const handleChangeWidth = (column) => (e) => {
    const index = _.findIndex(cacheWidth, { columnName: column })
    if (index != -1) {
      let _cacheWidth = _.cloneDeep(cacheWidth)
      _cacheWidth[index].columnWidth = e.value
      setCacheWidth(_cacheWidth)
    }
  }

  const itemTemplate = (item) => {
    return (
      <div className="flex justify-content-between align-items-center">
        <span className={`product-badge`}>{item.field}</span>
        <div className="field flex justify-content-between align-items-center">
          <InputNumber
            className="column-with"
            value={item.columnWidth ?? ""}
            onChange={handleChangeWidth(item.columnName)}
            suffix={"px"}
          />
        </div>

      </div>
    );
  }

  return (
    <CrmCreateDialog
      ref={refDialog}
      title={t("crm.table-setting.title")}
      permission={{ create: true }}
      onSubmit={submitProject}
    >
      <div className="formgrid p-fluid fluid  grid border-1 border-200 border-round-md pb-3 pt-3 mb-2 bg-white">
        <div className="col-12">
          <PickList
            source={source}
            target={target}
            itemTemplate={itemTemplate}
            sourceHeader={t("crm.table-setting.available-clolumns")}
            targetHeader={t("crm.table-setting.show-clolumns")}
            sourceStyle={{ height: '342px' }}
            targetStyle={{ height: '342px' }}
            onChange={onChange}
            filterBy="field"
            sourceFilterPlaceholder={t("search")}
            targetFilterPlaceholder={t("search")}
          />
        </div>
      </div>

    </CrmCreateDialog>
  );
}

CrmTableSettingDetail = forwardRef(CrmTableSettingDetail);
export default CrmTableSettingDetail;

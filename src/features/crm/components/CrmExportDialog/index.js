import CommonFunction from "@lib/common";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { exportCSV, exportExcel, exportPdf } from "../../utils/export";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./styles.scss";

function CrmExportDialog(props, ref) {
  const t = CommonFunction.t;

  const { onSubmit, onShow, title, viewOnly, data, moduleName } = props;

  const tableRef = useRef();

  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);

  const [type, setType] = useState(null);

  const cols = Object.keys(data[0] || {}).map((key) => ({
    field: key,
    header: key,
  }));

  const exportColumns = cols.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  useImperativeHandle(ref, () => ({
    open: async () => {
      setShowDetail(true);
    },

    close: () => {
      setShowDetail(false);
    },
    setLoading: (flg) => {
      setLoading(flg);
    },
  }));

  const cancel = () => {
    setShowDetail(false);
    setLoading(false)
  };

  const handleChoose =async () => {
    try {
      setLoading(true)
      switch (type) {
        case "excel":
         await exportExcel(data, moduleName);
          break;
        case "csv":
          await exportCSV(tableRef);
          break;
        case "pdf":
          const table = document.getElementById("table-print");
          await exportPdf(table, moduleName);
          break;
        default:
          break;
      }
      setLoading(false)
      setShowDetail(false);
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
   
  };

  return (
    <>
      <Dialog
        header={() => <div className="text-center text-2xl py-1">{title}</div>}
        visible={showDetail}
        modal
        contentClassName="over"
        className="p-fluid fluid crm-detail"
        footer={
          <>
            <Button
              label={t("common.cancel")}
              className="p-button-text"
              onClick={cancel}
            />
            <Button
              disabled={viewOnly || !type}
              label={t("action.choose")}
              loading={loading}
              icon="bx bxs-file-export"
              className="primary"
              onClick={handleChoose}
            />
          </>
        }
        onHide={cancel}
        onShow={onShow}
      >
        <div className="p-2" >
          <Card>
            <div className="field-radiobutton">
              <RadioButton
                inputId="excel"
                name="type"
                value="excel"
                onChange={(e) => setType(e.value)}
                checked={type === "excel"}
              />
              <label htmlFor="excel">EXCEL</label>
            </div>

            <div className="field-radiobutton">
              <RadioButton
                inputId="csv"
                name="type"
                value="csv"
                onChange={(e) => setType(e.value)}
                checked={type === "csv"}
              />
              <label htmlFor="csv">CSV</label>
            </div>

            {/* <div className="field-radiobutton">
              <RadioButton
                inputId="pdf"
                name="type"
                value="pdf"
                onChange={(e) => setType(e.value)}
                checked={type === "pdf"}
              />
              <label htmlFor="pdf">PDF</label>
            </div> */}
          </Card>
        </div>
      </Dialog>

      <div id="table-print" className=" absolute top-0">
          <DataTable
            ref={tableRef}
            value={data}
            dataKey="id"
            responsiveLayout="scroll"
            selectionMode="multiple"
          >
            {cols.map((col, index) => (
              <Column key={index} field={col.field} header={col.header} />
            ))}
          </DataTable>
        </div>
    </>
  );
}

CrmExportDialog = forwardRef(CrmExportDialog);
export default CrmExportDialog;

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportCSV = (tableRef) => {
  return tableRef.current.exportCSV({ selectionOnly: false });
};

export const exportPdf = (table, fileName = "products") => {
  return html2canvas(table, { scale: 1 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 0, 0);
    // pdf.output('dataurlnewwindow');
    pdf.save(`${fileName}_export_${new Date().getTime()}.pdf`);
  });
};

export const exportExcel = (products, fileName = "products") => {
  return import("xlsx").then((xlsx) => {
    const worksheet = xlsx.utils.json_to_sheet(products);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    return saveAsExcelFile(excelBuffer, fileName);
  });
};

const saveAsExcelFile = (buffer, fileName) => {
  return import("file-saver").then((module) => {
    if (module && module.default) {
      let EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      let EXCEL_EXTENSION = ".xlsx";
      const data = new Blob([buffer], {
        type: EXCEL_TYPE,
      });

      module.default.saveAs(
        data,
        fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
      );
    }
  });
};

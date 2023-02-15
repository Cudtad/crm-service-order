import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {Toolbar} from "primereact/toolbar";
import {InputText} from "primereact/inputtext";
import CommonFunction from '@lib/common';

import _ from "lodash";
import CertificateApi from "services/CertificateService";

function CertificateTable(props, ref) {

    const t = CommonFunction.t;

    const monthNamesShort = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    const [certificates, setCertificates] = useState(props.certificates);
    const [selectedCertificates, setSelectedCertificates] = useState(null);

    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });

    const dt = useRef(null);

    /**
     * load something
     */
    useEffect(() => {
        if (certificates) setSelectedCertificates(certificates.filter(cert => cert.status > 0));
    }, []);

    useImperativeHandle(ref, () => ({}));

    /**
     * on datatable change paging
     * @param {*} event
     */
    const onPage = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        setLazyParams(_lazyParams);
    };

    /**
     * on datatable click sort on header
     * @param {*} event
     */
    const onSort = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        setLazyParams(_lazyParams);
    };

    /**
     * on datatable filter
     * @param {String} val
     */
    const onFilter = (val) => {
        let _lazyParams = {...lazyParams, page: 0, filter: val};
        setLazyParams(_lazyParams);
    };

    const onSelectionChange = (e) => {
        CommonFunction.showConfirm(t("confirm.update") + " " + "" + " ? ", t("certificate.update"), () => {
            let disableCert = _.difference([...certificates], e.value).map(cert => ({
                ...cert,
                active: false
            }));
            let enableCert = e.value.map(cert => ({
                ...cert,
                active: true
            }));
            CertificateApi.state(disableCert.length > 0 ? disableCert : enableCert).then(() => setSelectedCertificates(e.value));
            // props.onChange(disableCert);
        });
    };

    const columnDateTemplate = (dateObject) => {
        const date = new Date(dateObject);

        const day = String(date.getDate()).padStart(2, '0');
        const month = monthNamesShort[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return (
            <>
                {`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`}
            </>
        );
    };

    const columnAgentTemplate = (agentObject) => {
        console.log('agent', agentObject)
        return (
            <>
            </>
        )
    };

    const agentEditor = (props) => {
        return (
            <span key={props.rowIndex} className="p-float-label">
                Agent: {props.rowData.agentId}
            </span>
        );
    }

    const header = (
        <Toolbar
            // left={
            //     <React.Fragment>
            //         <Button label={t('common.create')} icon="bx bx-plus" className="p-button-primary mr-2" onClick={addAgent} />
            //         <Button label={t('common.delete')} icon="bx bx-trash" className="p-button-danger mr-2" onClick={() => deleteAgents(selectedAgents)} disabled={!selectedAgents || !selectedAgents.length} />
            //     </React.Fragment>
            // }
            right={
                <React.Fragment>
                    <span className="p-input-icon-right">
                        <i className="pi pi-search"/>
                        <InputText type="search" style={{width: '300px'}} onInput={(e) => CommonFunction.debounce(null, onFilter, e.target.value)} placeholder={t("common.search")}/>
                    </span>
                </React.Fragment>
            }>
        </Toolbar>
    );

    const headerColumnActive = (
        <span className="mr-3" style={{float: 'right'}}>{t('certificate.validated')}</span>
    )

    return (
        <div className="page-container">
            <DataTable
                ref={dt}
                value={certificates}
                dataKey="id"
                selectionMode="checkbox"
                selection={selectedCertificates}
                onSelectionChange={onSelectionChange}
                className="p-datatable-gridlines"
                emptyMessage="No record found."
                loading={loading}
                // header
                // header={header}

                // scrollable
                // scrollable
                // scrollHeight="calc(100vh - 500px)"

                // paging
                lazy
                // paginator
                first={lazyParams.first}
                rows={lazyParams.rows}
                totalRecords={totalRecords}
                rowsPerPageOptions={[10, 25, 50, 100, 150]}
                onPage={onPage}
                paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink NextPageLink LastPageLink"
                currentPageReportTemplate="{first} - {last} of {totalRecords}"
                // sort
                onSort={onSort}
                sortField={lazyParams.sortField}
                sortOrder={lazyParams.sortOrder}
            >
                <Column selectionMode="multiple"
                        header={headerColumnActive}
                        style={{width: '80px', maxWidth: '80px', textAlign: 'center'}}
                ></Column>
                {props.type === 'user' && <Column body={columnAgentTemplate} editor={(props) => agentEditor(props)} header={t('certificate.agent')} headerStyle={{width: '100px'}}></Column>}
                <Column field="subject" header={t('certificate.subject')} headerStyle={{width: '120px'}}></Column>
                <Column field="notBefore"
                        header={t('certificate.not-before')}
                        style={{width: '100px'}}
                        body={rowData => columnDateTemplate(rowData.notBefore)}
                ></Column>
                <Column field="notAfter"
                        header={t('certificate.not-after')}
                        style={{width: '100px'}}
                        body={rowData => columnDateTemplate(rowData.notAfter)}
                ></Column>
            </DataTable>
        </div>
    );
};

CertificateTable = forwardRef(CertificateTable);

export default CertificateTable;

import { XLayout, XLayout_Box, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';

import TicketDictionaryMenu from '../../components/TicketDictionaryMenu';
import React, { useEffect, useRef, useState } from 'react';
import CommonFunction from '@lib/common';
import _ from "lodash";

import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CrmResourceApi from 'services/CrmResourceApi';
import TicketResourceDetail from '../../components/TicketResourceDetail';
import Badges from '@ui-lib/badges/Badges';
import classNames from 'classnames';
import CrmCreateDialog from '../../components/CrmCreateDialog';
import { getPermistion } from '../../utils';
import "./styles.scss";

const permissionCode = "crm-service-service_category_resource"

export default function ResourceList() {
    const t = CommonFunction.t;

    const [permission, setPermission] = useState()

    const [ticketResources, setTicketResources] = useState([]);

    const [loading, setLoading] = useState(false);

    const [resourceFilter, setResourceFilter] = useState(null);

    const [allTicketResources, setAllTicketResources] = useState([]);

    const [edittingData, setEdittingData] = useState()

    const refDialog = useRef()

    const refDetail = useRef()

    // default phân trang
    const defaultPaging = {
        first: 0,
        size: 999,
        page: 0,
        total: 0
    }
    const [paging, setPaging] = useState({ ...defaultPaging });

    // default tham số để filter
    const refParameters = useRef({
        ...defaultPaging,
        keyword: "",
    })

    /**
     * use effect chỉ chạy 1 lần trên life cycle của form
     */
    useEffect(() => {
        // permission
        setPermission(getPermistion(window.app_context.user, permissionCode))

        loadData()
    }, []);

    /**
     * load data
     */
    const loadData = async () => {

        setLoading(true);

        // load data for data table
        let _params = {
            page: refParameters.current.page,
            size: refParameters.current.size
        };

        CrmResourceApi.list(_params).then(res => {
            if (res) {

                // lưu dữ liệu cho resource detail
                setAllTicketResources(_.cloneDeep(res.content));

                // build tree và gán data cho state
                let _ticketResources = prepareTicketResourceTreeData(res.content);
                setTicketResources(_ticketResources);

                // cập nhật lại phân trang
                setPaging({
                    ...paging,
                    total: res.total,
                    first: refParameters.current.first,
                    page: refParameters.current.page
                });
            }
            setLoading(false);
        });
    };

    /**
     * prepare data for tree
     * @param {*} data 
     */
    const prepareTicketResourceTreeData = (data) => {
        // map to tree table format
        let _prepareData = data.map(m => ({
            key: m.id.toString(),
            data: m,
            parentId: m.parentId === 0 ? null : (m.parentId || null)
        }));
        // convert to list
        let _ticketResources = CommonFunction.listToTree(_prepareData, "key", "parentId", "children");

        // prepare key for tree table
        const buildKey = (parentKey, node) => {
            if (parentKey.length > 0) {
                node.key = `${parentKey}-${node.key}`;
            }
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                node.children.forEach(el => {
                    buildKey(node.key, el);
                });
            }
        }

        _ticketResources.forEach(el => {
            buildKey("", el);
        });

        return _ticketResources;
    }

    // Dialog action start

    const createProduct = () => {
        setEdittingData(null)
        refDialog.current.create()
    }

    const editProduct = (id) => () => {
        CrmResourceApi.get(id).then(res => {
            if (res) {
                setEdittingData(res)
                refDialog.current.edit()
            }
        })
    }

    const onDialogSave = () => {
        refDetail.current.submitProject()
    }

    const onCloseDialog = () => {
        refDialog.current.close()
    }

    const setLoadingSave = (flg) => {
        refDialog.current.setLoading(flg)
    }

    // Dialog end

    const deleteResource = (_resource) => {
        CommonFunction.showConfirm(t("confirm.delete.message").format(_resource.name || t("ticket.resource").toLowerCase()), t("ticket.delete.title"),
            () => {
                // accept delete
                CrmResourceApi.delete(_resource).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.deleted"));
                        loadData()
                    }
                });
            }
        )
    }

    /**
     * filter resource
     */
    const filter = (keyword) => {
        setResourceFilter(keyword);
    }

    const renderCol0 = (rowData) => {
        return (
            <a className="link-button" onClick={editProduct(rowData.data.id)}>
                {rowData.data.name}
            </a>
        )
    }

    const renderCol1 = (rowData) => {
        return (
            <p className="">
                {rowData.data.description}
            </p>
        )
    }

    const renderCol2 = (rowData) => {
        return (
            <>
                <Badges
                    className={classNames({
                        "mr-2": true,
                        "bg-green-7": (rowData.data.status === 1),
                        "text-grey-9 bg-grey-4": !(rowData.data.status === 1)
                    })}
                >
                    <div
                        className="flex align-items-center width-fit-content pl-1 pr-1"
                    >
                        {rowData.data.status ? t('status.active') : t('status.denied')}
                    </div>
                </Badges>
            </>
        )
    }

    const renderColEnd = (rowData) => {
        return (
            <div className="p-text-center">
                <Button
                    className="p-button-rounded p-button-text"
                    title={t('common.delete')}
                    icon="bx bx-trash text-grey"
                    onClick={() => deleteResource(rowData.data)}
                    disabled={!rowData.data.status}
                ></Button>
            </div>
        )
    }

    return (<>
        <XLayout className="p-2">
            <XLayout_Top>
                <TicketDictionaryMenu selected="ticket.resource"></TicketDictionaryMenu>
                <XToolbar
                    className="p-0 mb-2"
                    left={() => (<div className="p-2">
                        <Button label={t("ticket.resource.add")} icon="bx bx-resource create" onClick={createProduct}></Button>
                    </div>)}
                    right={() => (<>
                        <span className="p-input-icon-left">
                            <i className="bx bx-search-alt" />
                            <InputText
                                className="mr-2"
                                style={{ width: '220px' }}
                                onInput={(e) => CommonFunction.debounce(null, filter, e.target.value)}
                                placeholder={t("common.search")} />
                        </span>
                    </>)}
                ></XToolbar>
            </XLayout_Top>
            <XLayout_Center>

                <XLayout_Box className="h-full p-0 position-relative">

                    <LoadingBar loading={loading} top={40}></LoadingBar>
                    <DataTable
                        value={ticketResources}
                        globalFilter={resourceFilter}
                        loading={loading}
                        selectionMode="single"
                        dataKey="id"
                        showGridlines
                        emptyMessage={t('common.no-record-found')}
                        scrollable
                        scrollDirection='both'
                        scrollHeight='flex'
                        className='ticket-resource-list'
                        lazy
                        resizableColumns
                    >
                        <Column
                            header={t('ticket.location.name')}
                            className='col-table-0'
                            body={renderCol0}
                            expander
                        />
                        <Column
                            field="description"
                            header={t('ticket.location.description')}
                            className='col-table-1'
                            body={renderCol1}
                        />
                        <Column
                            field="status"
                            header={t('entry.status')}
                            className='col-table-2'
                            body={renderCol2}
                        />
                        <Column
                            className='col-table-end'
                            body={renderColEnd}
                        />
                    </DataTable>
                </XLayout_Box>
            </XLayout_Center>
        </XLayout>

        <CrmCreateDialog
            ref={refDialog}
            title={edittingData ? t(`ticket.resource.update`) : t(`ticket.resource.add`)}
            permission={permission}
            onSubmit={onDialogSave}
        >
            <TicketResourceDetail
                ref={refDetail}
                data={edittingData}
                categories={allTicketResources}
                permission={permission}
                setLoading={setLoadingSave}
                cancel={onCloseDialog}
                reload={loadData}
            />
        </CrmCreateDialog>
    </>);
}

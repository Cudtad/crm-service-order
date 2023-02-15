import { XLayout, XLayout_Box, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';

import TicketDictionaryMenu from '../../components/TicketDictionaryMenu';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { Dropdown } from "primereact/dropdown";
import CommonFunction from '@lib/common';
import _ from "lodash";
// import "features/task/scss/TaskBaseList.scss";
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import { Column } from 'primereact/column';
import CrmCategoryApi from 'services/CrmCategoryApi';
import { TreeTable } from 'primereact/treetable';
import TicketCategoryDetail from '../../components/TicketCategoryDetail';
import CrmCreateDialog from '../../components/CrmCreateDialog';

import { CrmProductApi } from '../../../../services/CrmProductService';
import { getPermistion } from '../../utils';
import "./styles.scss"
const permissionCode = "crm-service-service_category_category"

export default function TicketCategory(props) {
    const t = CommonFunction.t;

    const [permission, setPermission] = useState()

    const [ticketCategories, setTicketCategories] = useState([]);

    const [loading, setLoading] = useState(false);

    const [allTicketCategories, setAllTicketCategories] = useState([]);

    const [products, setProducts] = useState([]);

    const [edittingData, setEdittingData] = useState()

    const refDialog = useRef()

    const refDetail = useRef()

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        size: 999,
        page: 0,
        total: 0,
        search: '',
        productId: null
    })

    useEffect(() => {
        loadData()
    }, [lazyParams]);

    /**
     * change group search
     * @param {*} val
     */
    const onChangeFilterProduct = (val) => {
        setLazyParams({
            ...lazyParams,
            productId: val || null
        })
    };
    /**
     * use effect chỉ chạy 1 lần trên life cycle của form
     */
    useEffect(() => {
        // permission
        setPermission(getPermistion(window.app_context.user, permissionCode))

        loadProducts()
    }, []);

    /**
     * load data
     */
    const loadData = async (groupid = 0) => {
        setLoading(true);

        CrmCategoryApi.list(lazyParams).then(res => {
            if (res) {

                // lưu dữ liệu cho category detail
                setAllTicketCategories(_.cloneDeep(res.content));

                // build tree và gán data cho state
                let _ticketCategories = prepareTicketCategoryTreeData(res.content);
                setTicketCategories(_ticketCategories);
            }
            setLoading(false);
        });
    };

    const loadProducts = () => {
        CrmProductApi.getAll({
            status: 1,
        }).then((res) => {
            if (res) {
                setProducts(res);
            } else {
                setProducts([]);
            }
        });
    };

    /**
     * prepare data for tree
     * @param {*} data 
     */
    const prepareTicketCategoryTreeData = (data) => {
        // map to tree table format
        let _prepareData = data.map(m => ({
            key: m.id.toString(),
            data: m,
            parentId: m.parentId === 0 ? null : (m.parentId || null)
        }));
        // convert to list
        let _ticketCategories = CommonFunction.listToTree(_prepareData, "key", "parentId", "children");

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

        _ticketCategories.forEach(el => {
            buildKey("", el);
        });

        return _ticketCategories;
    }

    /**
     * delete news
     * @param {*} _category 
     */
    const deleteCategory = (_category) => {
        // refDetail.current.remove(_category);
        CommonFunction.showConfirm(t("confirm.delete.message").format(_category.name || t("ticket.category").toLowerCase()), t("ticket.delete.title"),
            () => {
                // accept delete
                CrmCategoryApi.delete(_category).then(res => {
                    if (res) {
                        CommonFunction.toastSuccess(t("common.deleted"));
                        loadData()
                    }
                });
            }
        )
    }

    /**
     * filter category
     */
    const filter = (keyword) => {
        setLazyParams({
            ...lazyParams,
            search: keyword
        });
    }

    // Dialog action start

    const createProduct = () => {
        setEdittingData(null)
        refDialog.current.create()
    }

    const editProduct = (id) => () => {
        CrmCategoryApi.get(id).then(res => {
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

    const renderColEnd = (rowData) => {
        return (
            <div className="p-text-center">
                <Button
                    className="p-button-rounded p-button-text"
                    title={t('common.delete')}
                    icon="bx bx-trash text-grey"
                    onClick={() => deleteCategory(rowData.data)}
                />
            </div>
        )
    }

    return (<>
        <XLayout className="p-2">
            <XLayout_Top>
                <TicketDictionaryMenu selected="ticket.category"></TicketDictionaryMenu>

                <XToolbar
                    className="p-0 mb-2"
                    left={() => (<div className="p-2">
                        <Button label={t("ticket.category.add")} icon="bx bx-category create" onClick={createProduct}></Button>
                    </div>)}
                    center={() => <Dropdown
                        filter showClear
                        filterBy="productName"
                        value={lazyParams?.productId}
                        options={products}
                        onChange={(e) => onChangeFilterProduct(e.target.value)}
                        optionLabel="productName"
                        optionValue="id"
                        inputId="group-filter-category"
                        placeholder={t("task.owner.task")}
                        className="dropcate"
                    />
                    }
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
                    <TreeTable
                        value={ticketCategories}
                        // globalFilter={categoryFilter}
                        showGridlines
                        scrollable
                        selectionMode="single"
                        className='ticket-category-list'
                    >
                        <Column
                            header={t('ticket.category.name')}
                            className='col-table-0'
                            body={renderCol0}
                            expander
                        />
                        <Column
                            field="description"
                            header={t('ticket.category.description')}
                            className='col-table-1'
                            body={renderCol1}
                        />
                        <Column
                            className='col-table-end'
                            body={renderColEnd}
                        />
                    </TreeTable>
                </XLayout_Box>
            </XLayout_Center>
        </XLayout>

        <CrmCreateDialog
            ref={refDialog}
            title={edittingData ? t(`ticket.category.update`) : t(`ticket.category.add`)}
            permission={permission}
            onSubmit={onDialogSave}
        >
            <TicketCategoryDetail
                ref={refDetail}
                data={edittingData}
                categories={allTicketCategories}
                products={products}
                permission={permission}
                setLoading={setLoadingSave}
                cancel={onCloseDialog}
                reload={loadData}
            />
        </CrmCreateDialog>
    </>);
}

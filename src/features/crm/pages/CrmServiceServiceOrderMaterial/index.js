import CommonFunction from '@lib/common';
import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Button } from 'primereact/button';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toolbar } from 'primereact/toolbar';

import { formatNum, getPermistion, makeRandomId, renderAmountByCurrency } from '../../utils';
import _ from "lodash";
import "./styles.scss"
import { useParams } from 'react-router-dom';
import CrmServiceServiceOderTab from '../../components/CrmServiceServiceOrderTab';
import { CrmUserApi } from '../../../../services/crm/CrmUser';

import { CrmServiceServiceOrderApi } from "services/crm/CrmServiceServiceOrderService";
import { CrmServiceServiceOrderStageApi } from "services/crm/CrmServiceServiceOrderStageService";
import CrmPanel from '../../components/CrmPanel';
import { CrmServiceServiceOrderMaterialApi } from '../../../../services/crm/CrmServiceServiceOrderMaterialService';
import CrmFieldEdittingValue from '../../components/CrmFieldEdittingValue';
import { CrmPriceApi } from '../../../../services/crm/CrmPriceService';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CrmMaterialApi } from '../../../../services/crm/CrmMaterialService';
import { CrmMdCurrencyExchangeRateApi } from '../../../../services/crm/CrmCurrencyExchangeRateService';
import { CrmMdMaterialUnitApi } from '../../../../services/crm/CrmMdMaterialUnitService';
import { CrmMaterialPriceApi } from '../../../../services/crm/CrmMaterialPriceServices';
import { CrmServiceServiceOrderMaterialItemApi } from '../../../../services/crm/CrmServiceServiceOrderMaterialItemService';
import CrmConfirmDialog from '../../components/CrmConfirmDialog';
import CrmFieldPreviewValue from '../../components/CrmFieldPreviewValue';
import { InputTextarea } from 'primereact/inputtextarea';


const permissionParentCode = "crm-service-order_service-order"
const permissionCode = "crm-service-order_service-order_material"

const emptyItem = {
    index: 1,
    rowIndex: "0",
    id: null,
    materialPriceId: null,
    warehouse: "",
    materialStock: "",
    materialQuantity: 0,
    discountPerMaterial: 0,
    vatPerMaterial: 0,
    totalPerMaterial: 0,
    grandTotalPerMaterial: 0,
    materialUnitName: ""
};

const emptyDetail = {
    priceOfMaterialId: null,
    items: [{
        ...emptyItem
    }]
};

const emptyValidate = {
    priceOfMaterialId: null,
    items: {}
};

export default function CrmServiceServiceOrderMaterial(props) {
    const t = CommonFunction.t;
    const { p } = useParams();
    const serviceOrderId = p

    const [permission, setPermission] = useState()

    const [serviceOrder, setServiceOrder] = useState(null)

    const [productsFamily, setProductsFamily] = useState([])

    const [loading, setLoading] = useState(false)

    const refDetail = useRef()

    const [preview, setPreview] = useState(true)

    const [serviceOrderStages, setServiceOderStages] = useState([]);

    const [orderMaterials, setOrderMaterials] = useState([]);

    const [materials, setMaterials] = useState([]);

    const [materialUnit, setMaterialUnit] = useState([]);

    const [prices, setPrices] = useState([]);

    const [detail, setDetail] = useState()

    const [items, setItems] = useState([]);

    const [itemsDeleteLog, setItemsDeleteLog] = useState([]);

    const [validate, setValidate] = useState(emptyValidate);

    const [currencyExchangeRates, setCurrencyExchangeRates] = useState([])

    useEffect(() => {
        // load request
        loadServiceOrder();
        loadServiceOrderStages();
        loadPrices()
        loadMateriaUnit()
    }, [])

    useEffect(() => {
        if (serviceOrder) {
            loadPrice()
            loadItems()
        }
    }, [serviceOrder])

    /**
     * onetime
     */
    useEffect(() => {
        setPermission(getPermistion(window.app_context.user, permissionCode))
        loadCurrencyExchangeRates()
    }, [])

    const reload = () => {
        loadPrice()
        loadItems()
    }

    const loadCurrencyExchangeRates = () => {
        CrmMdCurrencyExchangeRateApi.getAll({
            status: 1
        }).then((res) => {
            if (res) {
                setCurrencyExchangeRates(res)
            } else {
                setCurrencyExchangeRates([])
            }
        })
    }

    const loadPrice = () => {
        CrmServiceServiceOrderMaterialApi.get(serviceOrderId).then(res => {
            if (res) {
                setDetail(res)
                loadMaterialPrice(res.priceOfMaterialId)
            } else {
                setDetail()
            }
        })
    }

    const loadItems = () => {
        CrmServiceServiceOrderMaterialApi.getItems(serviceOrderId).then(res => {
            if (res) {
                setItems(res.map((o, i)=> ({
                    ...o,
                    discountPerMaterial: (o.discountPerMaterial ?? 0) * 100,
                    vatPerMaterial: (o.vatPerMaterial ?? 0) * 100,
                    materialUnitName: o.materialUnitName ?? "",
                    warehouse: o.warehouse ?? "",
                    materialStock: o.materialStock ?? 0,
                    rowIndex: makeRandomId(5),
                    index: i + 1
                })))
            } else {
                setItems([{
                    ...emptyItem,
                    rowIndex: makeRandomId(5)
                }])
            }
        })
    }

    const loadMateriaUnit = () => {
        CrmMdMaterialUnitApi.get().then(res => {
            if (res) {
                setMaterialUnit(res)
            }
        })
    }


    const loadMaterialPrice = (id) => {
        if (id) {
            CrmMaterialPriceApi.getRelatedPrice({}, id).then(res => {
                if (res) {
                    const _materials = _.filter(res, { currencyExchangeRateId: serviceOrder.currencyExchangeRateId })
                    setMaterials(_materials)
                }
            })
        } else {
            setMaterials([])
        }
    }

    const loadPrices = () => {
        CrmPriceApi.getAll({
            status: 1
        }).then(res => {
            if (res) {
                setPrices(res)
            } else {
                setPrices([])
            }
        })
    }

    /**
     * load requests created by user
     */
    const loadServiceOrder = () => {
        setLoading(true)
        CrmServiceServiceOrderApi.getById(serviceOrderId).then(async (res) => {
            if (res) {
                if (res?.createBy) {
                    const user = await CrmUserApi.getById(res?.createBy).catch(() => { })
                    res['createUser'] = user
                }
                if (res?.updateBy) {
                    const user = await CrmUserApi.getById(res?.updateBy).catch(() => { })
                    res['updateUser'] = user
                }
                setServiceOrder(res)
            }
            setLoading(false)
        })
    }

    const loadServiceOrderStages = () => {
        CrmServiceServiceOrderStageApi.get().then((res) => {
            if (res) {
                setServiceOderStages(res);
            } else {
                setServiceOderStages([]);
            }
        });
    };

    const onCancelEditing = () => {
        reload()
        setPreview(true)
    }

    const onSubmitProject = () => {
        const isValid = performValidate([])
        if (isValid) {
            let editingItems = _.filter(items, { isEdit: true })

            editingItems = editingItems.map(o => {
                const _material = _.find(materials, {id: o.materialPriceId})
                return {
                    ...o,
                    materialId: _material?.materialId
                }
            })
            setLoading(true);
            saveDelete(itemsDeleteLog, (resDelete, err) => {
                if (resDelete) {
                    saveUpdate(editingItems, (resUpdate, e) => {
                        if (resUpdate) {
                            setLoading(false);
                            CommonFunction.toastSuccess(
                                t("common.save-success")
                            );
                            reload()
                        } else {
                            setLoading(false);
                            CommonFunction.toastError(err);
                        }
                    })
                } else {
                    setLoading(false);
                    CommonFunction.toastError(err);
                }
            })

            // }
        }
    }

    const saveDelete = async (_items, callBack) => {
        let success = _items.length;
        let _error = null;
        if (_items.length) {
            _items.map(o => {
                CrmServiceServiceOrderMaterialItemApi.delete(o.id).then(res => {
                    success--
                    if (success == 0) {
                        callBack(!_error, _error)
                    }
                }).catch(e => {
                    success--
                    _error = e
                    if (success == 0) {
                        callBack(!_error, _error)
                    }
                })
            })
        } else {
            callBack(true);
        }
    }

    const saveUpdate = (_items, callBack) => {
        CrmServiceServiceOrderMaterialApi.update({
            ...detail,
            items: _items
        }, serviceOrderId)
            .then((res) => {
                callBack(true);
            })
            .catch((e) => {
                callBack(false, e);
            });
    };

    const renderDetailRightContents = () => {
        return <>
            <Button
                label={t("common.cancel")}
                icon="bx bx-x"
                className="p-button-text mr-2"
                loading={loading}
                onClick={onCancelEditing}
                disabled={preview}
            />
            <Button
                label={t("common.save")}
                icon="bx bx-save"
                className="p-button-plain"
                loading={loading}
                onClick={onSubmitProject}
                disabled={!permission?.update || preview}
            />
        </>
    }

    const applyServiceChange = async (prop, val) => {
        let _detail = _.cloneDeep(detail);

        switch (prop) {
            case 'priceOfMaterialId':
                _detail[prop] = val
                const _itemsDeleteLog = _.cloneDeep(itemsDeleteLog)
                items.map(o => {
                    if (o.id) {
                        _itemsDeleteLog.push(o)
                    }
                })
                setItemsDeleteLog(_itemsDeleteLog)
                setItems([{
                    ...emptyItem,
                    rowIndex: makeRandomId(5)
                }])

                break;

            default:
                break;
        }

        _detail[prop] = val;

        setDetail(_detail);
        performValidate([prop], _detail);
    }

    const applyServiceItemsChange = async (rowIndex, name, value) => {
        let _items = _.cloneDeep(items);
        const index = _.findIndex(_items, { rowIndex });
        switch (name) {
            case "materialPriceId":
                if (value) {

                    const _materialPrice = _.find(materials, { id: value })
                    if (_materialPrice) {
                        let _materialDetail = await CrmMaterialApi.getById(_materialPrice.materialId).catch(() => { })
                        const _unit = _.find(materialUnit, { id: _materialDetail?.materialUnitId })
                        _items[index]["materialUnit"] = _unit ? _unit.materialUnitName : ""
                    } else {
                        _items[index]["materialUnit"] = ""
                    }
                    _items[index]["listPrice"] = _materialPrice?.listPrice ?? 0


                } else {
                    _items[index]["materialUnit"] = ""
                    _items[index]["listPrice"] = 0
                }

                break;
            default:
                break;
        }
        _items[index][name] = value;


        _items[index]["totalPerMaterial"] = (_items[index]["listPrice"] ?? 0) * (_items[index]["materialQuantity"] ?? 0)
        _items[index]["grandTotalPerMaterial"] = _items[index]["totalPerMaterial"] * (100 - _items[index]["discountPerMaterial"] ?? 0) * (100 + parseFloat(_items[index]["vatPerMaterial"] ?? 0)) / 10000

        _items[index]["isEdit"] = true;
        setItems(_items)
        performValidate(["items"], detail, _items, rowIndex, name);
    }

    const performValidate = (
        props,
        _currentDetail,
        _currentItems,
        rowIndex,
        name
    ) => {
        let result = _.cloneDeep(validate),
            isValid = true;
        let _detail = _currentDetail ? _currentDetail : detail;
        let _items = _currentItems ? _currentItems : items;
        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }
        // validate props
        props.forEach((prop) => {
            switch (prop) {
                case "priceOfMaterialId":
                    result[prop] = _detail?.priceOfMaterialId ? null : `${t("crm-service-order.service-order-material.currency-exchange-rate")} ${t("message.cant-be-empty")}`
                    break
                case "items":
                    let errorItems = {};
                    if (_items.length) {
                        _items.map((o) => {
                            let _materialPriceId = validate["items"][o.rowIndex]
                                ? validate["items"][o.rowIndex]["materialPriceId"]
                                : null;
                            let _materialQuantity = validate["items"][o.rowIndex]
                                ? validate["items"][o.rowIndex]["materialQuantity"]
                                : null;
                            if (o.rowIndex === rowIndex) {
                                switch (name) {
                                    case "materialPriceId":
                                        _materialPriceId = o.materialPriceId
                                            ? null
                                            : `${t("crm-service-order.service-order-material.product")} ${t("message.cant-be-empty")}`;
                                        break;
                                    case "materialQuantity":
                                        _materialQuantity = o.materialQuantity
                                            ? null
                                            : `${t("crm-service-order.service-order-material.qty")} ${t("message.cant-be-empty")}`;
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                if (!rowIndex) {
                                    _materialPriceId = o.materialPriceId
                                        ? null
                                        : `${t("crm-service-order.service-order-material.product")} ${t("message.cant-be-empty")}`;
                                    _materialQuantity = o.materialQuantity
                                        ? null
                                        : `${t("crm-service-order.service-order-material.qty")} ${t("message.cant-be-empty")}`;

                                }
                            }
                            errorItems[o.rowIndex] = {
                                materialPriceId: _materialPriceId,
                                materialQuantity: _materialQuantity,
                            };
                        });
                    }
                    result[prop] = errorItems;
                    break;
                default:
                    break;
            }
        })

        setValidate(result);
        // // check if object has error
        for (const property in result) {
            if (property === "items" && result[property]) {
                const errorItems = result[property];
                let check = true;
                Object.keys(errorItems).map((key) => {
                    const _data = errorItems[key];
                    if (_data &&
                        (_data?.materialPriceId ||
                            _data?.materialQuantity)
                    ) {
                        check = false;
                    }

                });
                isValid = check;
                if (isValid) break;
            } else if (result[property]) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    const handleAddItem = () => {
        let _items = _.cloneDeep(items);
        _items.push({
            ...emptyItem,
            rowIndex: makeRandomId(5)
        });

        setItems(_items);
    }

    const handleRemoveItem = (rowData) => () => {
        const content = `${t("crm-service-order.service-order-material.remove-confirm").replace(
            `{0}`,
            ""
        )}`.split("?");
        CrmConfirmDialog({
            message: (
                <>
                    <span>{content[0]}?</span>
                    <br />
                    <span>{content[1]}</span>
                </>
            ),
            header: t("crm-service-order.service-order-material.remove"),
            accept: () => {
                if (rowData.id) {
                    CrmServiceServiceOrderMaterialItemApi.delete(rowData.id)
                        .then((data) => {
                            if (data) {
                                reload();
                                CommonFunction.toastSuccess(t("common.save-success"));
                            }
                        })
                        .catch((error) => CommonFunction.toastError(error))
                } else {
                    let _items = _.cloneDeep(items)
                    _.remove(_items, { rowIndex: rowData.rowIndex })
                    setItems(_items)
                    performValidate(["items"], detail, _items)
                }
            }
        })
    }

    const handleChangePriceOfMaterialId = (e) => {
        if (detail?.priceOfMaterialId && e.value != detail?.priceOfMaterialId) {
            const content = `${t("crm-service-order.service-order-material.change-price-confirm").replace(
                `{0}`,
                ""
            )}`.split("?");
            CrmConfirmDialog({
                message: (
                    <>
                        <span>{content[0]}?</span>
                        <br />
                        <span>{content[1]}</span>
                    </>
                ),
                header: t("crm-service-order.service-order-material.change-price"),
                accept: () => {
                    applyServiceChange("priceOfMaterialId", e.value)
                    loadMaterialPrice(e.value)
                }
            })
        } else {
            applyServiceChange("priceOfMaterialId", e.value)
            loadMaterialPrice(e.value)
        }
    }

    const handleChangeDescription = (e) => {
        applyServiceChange("materialNote", e.target.value)
    }

    const renderNumerical = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.index}</span>
            </div>
        );
    }

    const renderColumn0 = (rowData) => {
        // const _material = _.find(materials, {id: rowData["materialPriceId"]})
        return (
            // <div className="p-fluid fluid formgrid grid field-content">
            //     <InputText
            //         // value={`${_material?.materialCode ?? ""}`}
            //         value={rowData.materialCode}
            //         // disabled={true}
            //     />
            // </div>
            <p>{rowData.materialCode}</p>
        );
    }

    const renderColumn13 = (rowData) => {
       
        return (
            // <div className="p-fluid fluid formgrid grid field-content">
            //     <InputText
            //         value={rowData.date}
            //         // disabled={true}
            //     />
            // </div>
            <p>{rowData.date}</p>
        );
    }

    const renderColumn14 = (rowData) => {
        return (
            // <div className="p-fluid fluid formgrid grid field-content">
            //     <InputText
            //         value={rowData.date2}
            //         // disabled={true}
            //     />
            // </div>
            <p>{rowData.date2}</p>
        );
    }

    const renderColumn1 = (rowData) => {
        return (
            // <div className="field-content">
            //     {/* <Dropdown
            //         options={materials}
            //         optionLabel="materialName"
            //         optionValue="id"
            //         filter
            //         filterBy="materialName"
            //         value={rowData["materialPriceId"]}
            //         onChange={(e) => applyServiceItemsChange(rowData.rowIndex, "materialPriceId", e.value)}
            //         disabled={!permission?.update || preview}
            //     />
            //     {validate["items"] && validate["items"][rowData.rowIndex] && validate["items"][rowData.rowIndex]["materialPriceId"] && (
            //         <small className="p-invalid">
            //             {validate["items"][rowData.rowIndex]["materialPriceId"]}
            //         </small>
            //     )} */}
            //     <InputText
            //         value={`${rowData.materialName}`}
            //         // disabled={true}
            //     />
            // </div>
            <p>{rowData.materialName}</p>
        );
    }

    const renderColumnText = (name, isValid, disabled, unit) => (rowData) => {
        // const paied = _.filter(paymentInfo, { paymentScheduleId: rowData.id })
        return (
            // <div className="p-fluid fluid formgrid grid field-content">
            //     <InputText
            //         value={`${rowData[name]}${unit ?? ""}`}
            //         onChange={(e) => applyServiceItemsChange(rowData.rowIndex, name, e.target.value)}
            //         disabled={!permission?.update || disabled || preview}
            //     />
            //     {isValid && validate["items"] &&
            //         validate["items"][rowData.rowIndex] &&
            //         validate["items"][rowData.rowIndex][name] && (
            //             <small className="p-invalid">
            //                 {validate["items"][rowData.rowIndex][name]}
            //             </small>
            //         )}
            // </div>
            <p>{`${rowData[name]}${unit ?? ""}`}</p>
        );
        
    }

    const renderColumnNumber = (name, isValid, disabled) => (rowData) => {
        // const paied = _.filter(paymentInfo, { paymentScheduleId: rowData.id })
        return (
            // <div className="p-fluid fluid formgrid grid field-content">
            //     <InputNumber
            //         value={rowData[name]}
            //         disabled={!permission?.update || disabled || preview}
            //         onChange={(e) => applyServiceItemsChange(rowData.rowIndex, name, e.value)}
            //         min={0}
            //     />
            //     {isValid && validate["items"] &&
            //         validate["items"][rowData.rowIndex] &&
            //         validate["items"][rowData.rowIndex][name] && (
            //             <small className="p-invalid">
            //                 {validate["items"][rowData.rowIndex][name]}
            //             </small>
            //         )}
            // </div>
            <p>{rowData[name]}</p>
        );
    }

    const renderColumnEnd = (rowData) => {
        return (
            <Button
                disabled={!permission?.delete || preview}
                icon="bx bx-trash text-red"
                className="p-button-rounded p-button-text ml-1"
                tooltip={t('common.delete')}
                tooltipOptions={{ position: 'top' }}
                onClick={handleRemoveItem(rowData)}
            />
        );
    };

    const previewCurrencyExchangeRate = useMemo(() => {
        if (serviceOrder?.currencyExchangeRateId) {
            return _.find(currencyExchangeRates, {
                id: serviceOrder?.currencyExchangeRateId,
            });
        } return null
    }, [currencyExchangeRates, serviceOrder?.currencyExchangeRateId])

    const previewCurrencyBase = useMemo(() => {
        return _.find(currencyExchangeRates, {
            isDefault: 1
        });
    }, [currencyExchangeRates])


    const dataDemo = [
        {
            index:1,
            materialCode: "VT001",
            materialName: "Màn hình Iphone 14 Promax 512GB",
            warehouse: "Kho Hai Bà Trưng",
            materialStock: 50,
            materialQuantity: 1,
            materialUnit:"Cái",
            listPrice:3000000,
            totalPerMaterial:0,
            discountPerMaterial:0,
            totalPrice:0,
            vatPerMaterial:0,
            grandTotalPerMaterial:0,
            date:"07/02/2023 - 07/06/2023",
            date2:"Không áp dụng"
        },
        {
            index:2,
            materialCode: "VT002",
            materialName: "Pin tai nghe Airpord 2",
            warehouse: "Kho Hoàng Mai",
            materialStock: 30,
            materialQuantity: 1,
            materialUnit:"Cái",
            listPrice:1000000,
            totalPerMaterial:1000000,
            discountPerMaterial:5,
            totalPrice:950000,
            vatPerMaterial:8,
            grandTotalPerMaterial:1026000,
            date:"Không áp dụng",
            date2:"07/02/2023 - 07/02/2024"
        },
    ]

    return (<>
        <CrmServiceServiceOderTab
            serviceOrderId={serviceOrderId}
            serviceOrder={serviceOrder}
            permissionParentCode={permissionParentCode}
            permissionCode={permissionCode}
            preview={preview}
            setPreview={setPreview}
            disableEdit={!permission?.update}
            loading={loading}
            status={serviceOrderStages}
            serviceOrderStages={serviceOrderStages}
            activeStatusId={serviceOrder?.stageId}
            reload={loadServiceOrder}
        >
            <>
                <div className="mt-3">
                    <div className={`p-fluid fluid formgrid grid`}>
                        <div className="col-12 px-3 py-1 mb-3">
                            <CrmPanel
                                className="mb-2"
                                title={t(
                                    "crm-service-order.service-order-material.material-infomation"
                                )}
                                collapsed={false}
                            >
                                <div className={`px-2 mb-3`}>
                                    <div className={`p-fluid fluid formgrid grid`}>
                                        <div className="col-6 px-3 py-1">
                                            <CrmFieldEdittingValue
                                                label={t("crm-service-order.service-order-material.currency-exchange-rate")}
                                                require={true}
                                            >
                                                <div className="field">
                                                    <Dropdown
                                                        options={prices}
                                                        optionLabel="priceName"
                                                        optionValue="id"
                                                        filter
                                                        filterBy="priceName"
                                                        value={detail?.priceOfMaterialId}
                                                        onChange={handleChangePriceOfMaterialId}
                                                        disabled={!permission?.update || preview}
                                                    />
                                                </div>
                                                {validate.priceOfMaterialId && (
                                                    <small className="p-invalid">
                                                        {
                                                            validate.priceOfMaterialId
                                                        }
                                                    </small>
                                                )}
                                            </CrmFieldEdittingValue>
                                        </div>
                                        <div className="col-6 px-3 py-1"></div>
                                        <div className="col-12 px-3 py-1">
                                            <DataTable
                                                // value={items}
                                                value={dataDemo}
                                                dataKey="rowIndex"
                                                className="p-datatable-gridlines crm-service-service-order-table-material crm-table"
                                                emptyMessage={t("common.no-record-found")}
                                                resizableColumns
                                                columnResizeMode="expand"
                                                showGridlines
                                                responsiveLayout="scroll"
                                                scrollable
                                                scrollDirection="both"
                                                scrollHeight="flex"
                                                lazy
                                            >
                                                <Column
                                                    header={""}
                                                    className="col-table-stt flex justify-content-center align-items-center"
                                                    body={renderNumerical}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.product-code")}
                                                    header={t("crm-service-order.service-order-material.product-code")}
                                                    className="col-table-0"
                                                    body={renderColumn0}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.product")}
                                                    header={(_) => (
                                                        <div>
                                                            {t("crm-service-order.service-order-material.product")}
                                                            <span className="text-red-400 ">
                                                                *
                                                            </span>
                                                        </div>
                                                    )}
                                                    className="col-table-0"
                                                    body={renderColumn1}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.warehouse")}
                                                    header={t("crm-service-order.service-order-material.warehouse")}
                                                    className="col-table-1"
                                                    body={renderColumnText(
                                                        "warehouse",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.stock")}
                                                    header={t("crm-service-order.service-order-material.stock")}
                                                    className="col-table-2"
                                                    body={renderColumnNumber(
                                                        "materialStock",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.qty")}
                                                    header={(_) => (
                                                        <div>
                                                            {t("crm-service-order.service-order-material.qty")}
                                                            <span className="text-red-400 ">
                                                                *
                                                            </span>
                                                        </div>
                                                    )}
                                                    className="col-table-3"
                                                    body={renderColumnNumber(
                                                        "materialQuantity",
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.unit")}
                                                    header={t("crm-service-order.service-order-material.unit")}
                                                    className="col-table-4"
                                                    body={renderColumnText(
                                                        "materialUnit",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.list-price")}
                                                    header={t("crm-service-order.service-order-material.list-price")}
                                                    className="col-table-5"
                                                    body={renderColumnNumber(
                                                        "listPrice",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.total")}
                                                    header={t("crm-service-order.service-order-material.total")}
                                                    className="col-table-6"
                                                    body={renderColumnNumber(
                                                        "totalPerMaterial",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.discount")}
                                                    header={t("crm-service-order.service-order-material.discount")}
                                                    className="col-table-7"
                                                    body={renderColumnNumber(
                                                        "discountPerMaterial",
                                                        true,
                                                        false,
                                                        // "%"
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.total-price")}
                                                    header={t("crm-service-order.service-order-material.total-price")}
                                                    className="col-table-7"
                                                    body={renderColumnNumber(
                                                        "totalPrice",
                                                        true,
                                                        false,
                                                        "%"
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.vat")}
                                                    header={t("crm-service-order.service-order-material.vat")}
                                                    className="col-table-8"
                                                    body={renderColumnNumber(
                                                        "vatPerMaterial",
                                                        true,
                                                        false,
                                                        "%"
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.grand-total")}
                                                    header={t("crm-service-order.service-order-material.grand-total")}
                                                    className="col-table-9"
                                                    body={renderColumnNumber(
                                                        "grandTotalPerMaterial",
                                                        false,
                                                        true
                                                    )}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.company-warranty")}
                                                    header={t("crm-service-order.service-order-material.company-warranty")}
                                                    className="col-table-10"
                                                    body={renderColumn13}
                                                />
                                                <Column
                                                    field={t("crm-service-order.service-order-material.agency-warranty")}
                                                    header={t("crm-service-order.service-order-material.agency-warranty")}
                                                    className="col-table-10"
                                                    body={renderColumn14}
                                                />
                                                <Column
                                                    columnKey="action"
                                                    className="col-table-end"
                                                    frozen
                                                    alignFrozen="right"
                                                    body={renderColumnEnd}
                                                />

                                            </DataTable>
                                            <div className="w-auto mt-2">
                                                <Button
                                                    className="p-button-text text-sm w-auto pl-1"
                                                    icon="bx bx-plus text-green text-lg"
                                                    tooltip={t(
                                                        "crm-service-order.service-order-material.add-product"
                                                    )}
                                                    tooltipOptions={{ position: "bottom" }}
                                                    onClick={handleAddItem}
                                                    label={t(
                                                        "crm-service-order.service-order-material.add-product"
                                                    )}
                                                    disabled={!permission?.update || preview}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CrmPanel>
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldPreviewValue
                                label={t("crm-service-order.service-order-material.all-total")}
                                readOnly={true}
                                // value={formatNum(detail?.totalMaterial ?? 0)}
                                value={formatNum(detail?.totalMaterial ?? 1000000)+ " VND"}
                            />
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldPreviewValue
                                label={t("crm-service-order.service-order-material.all-discount")}
                                readOnly={true}
                                // value={formatNum(detail?.totalDiscountMaterial ?? 0)}
                                value={formatNum(detail?.totalDiscountMaterial ?? 950000)+ " VND"}
                            />
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldPreviewValue
                                label={t("crm-service-order.service-order-material.all-vat")}
                                readOnly={true}
                                // value={formatNum(detail?.totalVatMaterial ?? 0)}
                                value={formatNum(detail?.totalVatMaterial ?? 76000)+ " VND"}
                            />
                        </div>
                        <div className="col-6 px-3 py-1">
                            <CrmFieldPreviewValue
                                label={t("crm-service-order.service-order-material.all-grand-total")}
                                readOnly={true}
                                // value={formatNum(detail?.grandTotalMaterial ?? 0)}
                                value={formatNum(detail?.grandTotalMaterial ?? 1026000) + " VND"}
                            />
                        </div>
                        <div className="col-12 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t("crm-service-order.service-order-material.description")}
                                require={true}
                            >
                                <InputTextarea
                                    id="product-description"
                                    value={detail?.materialNote ?? ""}
                                    rows={3}
                                    onChange={handleChangeDescription}
                                    disabled={!permission?.update || preview}
                                />
                            </CrmFieldEdittingValue>
                        </div>
                    </div>
                </div>
                {preview
                    ? null
                    : <Toolbar right={renderDetailRightContents} />
                }
                
            </>
        </CrmServiceServiceOderTab>
    </>)
}

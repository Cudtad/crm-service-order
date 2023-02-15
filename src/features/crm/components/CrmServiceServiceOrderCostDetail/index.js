import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import _ from "lodash";
import moment from "moment";
import CommonFunction from "@lib/common";

import { InputText } from "primereact/inputtext";
import { MODE } from "../../utils/constants";
import "./styles.scss";
import { Dropdown } from "primereact/dropdown";

import { makeRandomId } from "features/crm/utils";
import CrmPanel from "../CrmPanel";
import CrmFieldEdittingValue from "../CrmFieldEdittingValue";
import CrmFieldPreviewValue from "../CrmFieldPreviewValue";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SplitButton } from "primereact/splitbutton";
import CrmConfirmDialog from "../CrmConfirmDialog";
import { formatNum } from "../../utils";
import { CrmServiceServiceOrderProductApi } from "../../../../services/crm/CrmServiceServiceOrderProduct";
import { CrmProductPriceApi } from "../../../../services/crm/CrmProductPriceService";

function CrmServiceServiceOrderCostDetail(props, ref) {
    const t = CommonFunction.t;
    const {
        data,
        setLoading,
        permission,
        className,
        prices,
        serviceOrderId,
        preview,
        setPreview,
        reload,
        serviceOrderProductItems,
        productFamilies,
        currencyExchangeRates,
    } = props;

    const emptyItem = {
        id: null,
        rowIndex: "0",
        serviceQuantity: 0,
        listPrice: 0,
        totalPerService: 0,
        discountPerService: 0,
        vatPerService: 0,
        grandTotalPerService: 0,
        serviceName: "",
        serviceType: "",
        productId: null,
        productPriceId: null,
    };

    const emptyDetail = {
        id: null,
        priceOfProductId: null,
        paymentScheduleId: 0,
        totalService: 0,
        totalDiscountService: 0,
        totalVatService: 0,
        grandTotalService: 0,
        serviceNote: "",
    };

    const emptyValidate = {
        priceOfProductId: null,
    };

    const [detail, setDetail] = useState(emptyDetail);
    const [validate, setValidate] = useState(emptyValidate);
    const [mode, setMode] = useState(MODE.CREATE);
    const [readOnly, setReadOnly] = useState(false);
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);

    const _currencyBase = _.find(currencyExchangeRates, {
        isDefault: 1,
    });

    useImperativeHandle(ref, () => ({
        submitProject: () => {
            submitProject();
        },
    }));

    useEffect(() => {
        if (data) {
            edit(data);
            setReadOnly(!permission?.update);
        } else {
            create();
        }
    }, [data, preview, serviceOrderProductItems]);

    useEffect(() => {
        if (detail.priceOfProductId && _currencyBase) {
            loadProductByPrice(detail.priceOfProductId);
        }
    }, [detail.priceOfProductId, _currencyBase]);

    const loadProductByPrice = async (priceId) => {
        const res = await CrmProductPriceApi.getRelatedPrice(
            {
                currencyExchangeRateId: _currencyBase.id,
            },
            priceId
        );
        if (res) {
            setProducts(res);
        } else setProducts([]);
    };

    useEffect(() => {
        let totalService = 0;
        let totalDiscountService = 0;
        let totalVatService = 0;
        let grandTotalService = 0;

        totalService = items.reduce((acc, cur) => acc + cur.totalPerService, 0);
        totalDiscountService = items.reduce(
            (acc, cur) =>
                acc + (cur.totalPerService * cur.discountPerService) / 100,
            0
        );
        totalVatService = items.reduce((acc, cur) => {
            const totalAfterDiscount =
                cur.totalPerService * (1 - cur.discountPerService / 100);
            return acc + (totalAfterDiscount * cur.vatPerService) / 100;
        }, 0);
        grandTotalService = items.reduce(
            (acc, cur) => acc + cur.grandTotalPerService,
            0
        );
        setDetail((detail) => ({
            ...detail,
            totalService,
            totalDiscountService,
            totalVatService,
            grandTotalService,
        }));
    }, [items]);

    const create = () => {
        setDetail({
            ...emptyDetail,
        });
        setMode(MODE.CREATE);
        setValidate(emptyValidate);
    };

    const edit = async (data) => {
        if (serviceOrderProductItems) {
            setItems(
                serviceOrderProductItems.map((item, index) => ({
                    ...item,
                    index: index + 1,
                    discountPerService: (item.discountPerService || 0) * 100,
                    vatPerService: (item.vatPerService || 0) * 100,
                    isEdit: !preview,
                    rowIndex: makeRandomId(5),
                }))
            );
        }
        setMode(MODE.UPDATE);
        setValidate(emptyValidate);
        setDetail({
            ...data,
        });
    };

    const submitItems = async (serviceOrderId) => {
        const itemsUpdate = items.filter((i) => i.id);
        const itemsAdd = items.filter((i) => !i.id);
        if (itemsAdd && itemsAdd.length > 0) {
            await CrmServiceServiceOrderProductApi.createItems(
                { items: itemsAdd },
                serviceOrderId
            );
        }
        if (itemsUpdate && itemsUpdate.length > 0) {
            await Promise.all(
                itemsUpdate.map(
                    async (item) =>
                        await CrmServiceServiceOrderProductApi.updateItem(
                            {
                                ...item,
                            },
                            item.id
                        )
                )
            );
        }
    };

    const submitProject = async () => {
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
                        await CrmServiceServiceOrderProductApi.create(
                            {
                                ..._service,
                                items,
                            },
                            serviceOrderId
                        )
                            .then(async (_data) => {
                                if (_data) {
                                    if (reload) {
                                        reload();
                                    }
                                    if (setPreview) {
                                        setPreview(true);
                                    }
                                    CommonFunction.toastSuccess(
                                        t("common.save-success")
                                    );
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
                        await CrmServiceServiceOrderProductApi.update(
                            {
                                ..._service,
                                items,
                            },
                            serviceOrderId
                        )
                            .then(async (_data) => {
                                if (_data) {
                                    await submitItems(serviceOrderId);
                                    if (reload) {
                                        reload();
                                    }
                                    if (setPreview) {
                                        setPreview(true);
                                    }
                                    CommonFunction.toastSuccess(
                                        t("common.save-success")
                                    );
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
                setLoading(false);
            }
        }
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
                case "priceOfProductId":
                    result[prop] = _detail.priceOfProductId
                        ? null
                        : `${t("crm-service.service-order-cost.price")} ${t(
                              "message.cant-be-empty"
                          )}`;
                    break;
                default:
                    break;
            }
        });

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

    const applyServiceChange = (prop, val) => {
        let _detail = _.cloneDeep(detail);
        _detail[prop] = val;
        setDetail(_detail);
        performValidate([prop], _detail);
    };

    // changes general info
    const handleChangePrice = (e) => {
        applyServiceChange("priceOfProductId", e.value);
    };
    const handleChangeNote = (e) => {
        applyServiceChange("serviceNote", e.target.value);
    };

    const renderFooter = () => {
        return (
            <div className={`p-fluid fluid formgrid grid mt-4`}>
                <div className="col-6 px-3 py-1">
                    {detail.createUser ? (
                        <CrmFieldPreviewValue
                            label={t("crm-sale.opportunity.detail.create-by")}
                            users={[
                                {
                                    id: detail.createUser.id,
                                    fullName: detail.createUser.fullName,
                                },
                            ]}
                            subDescription={
                                detail.createDate
                                    ? `, ${moment(detail.createDate).format(
                                          "H:mm DD/MM/YYYY"
                                      )}`
                                    : ``
                            }
                            readOnly={true}
                        />
                    ) : null}
                </div>
                <div className="col-6 px-3 py-1">
                    {detail.updateUser ? (
                        <CrmFieldPreviewValue
                            label={t("crm-sale.opportunity.detail.edit-by")}
                            users={[
                                {
                                    id: detail.updateUser.id,
                                    fullName: detail.updateUser.fullName,
                                },
                            ]}
                            subDescription={
                                detail.modifiedDate
                                    ? `, ${moment(detail.modifiedDate).format(
                                          "H:mm DD/MM/YYYY"
                                      )}`
                                    : ``
                            }
                            readOnly={true}
                        />
                    ) : null}
                </div>
            </div>
        );
    };

    //handle with items
    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                ...emptyItem,
                isEdit: true,
                index: prev.length + 1,
                rowIndex: makeRandomId(5),
                grandTotalPerService: 0,
                totalPerService: 0,
            },
        ]);
    };
    const handleRemoveItem = (rowData) => {
        if (rowData.id) {
            const content = `${t(
                "crm-service.service-order-cost.item.remove-confirm"
            )}`.split("?");
            CrmConfirmDialog({
                message: (
                    <>
                        <span>{content[0]}?</span>
                        <br />
                        <span>{content[1]}</span>
                    </>
                ),
                header: t("crm-service.service-order-cost.item.delete"),
                accept: () =>
                    CrmServiceServiceOrderProductApi.deleteItem(rowData.id)
                        .then((data) => {
                            if (data) {
                                reload();
                                CommonFunction.toastSuccess(
                                    t("common.save-success")
                                );
                            }
                        })
                        .catch((error) => CommonFunction.toastError(error)),
            });
        } else
            setItems((prev) =>
                prev.filter((r) => r.rowIndex !== rowData.rowIndex)
            );
    };

    const handleChangeItem = (rowIndex, name, value) => {
        let _item = _.cloneDeep(items.find((i) => i.rowIndex === rowIndex));
        let grandTotalPerService = _item.grandTotalPerService || 0;
        let totalAfterDiscount =
            _item.totalPerService * (1 - _item.discountPerService / 100);
        switch (name) {
            case "productId":
                const productPrice = products.find(
                    (p) => p.productId === value
                );
                if (productPrice) {
                    _item["productPriceId"] = productPrice.id;
                    _item["listPrice"] = productPrice.listPrice;
                }
                break;
            case "serviceQuantity":
                _item.totalPerService = value * (_item.listPrice || 0);
                totalAfterDiscount =
                    _item.totalPerService *
                    (1 - _item.discountPerService / 100);
                grandTotalPerService =
                    totalAfterDiscount -
                    totalAfterDiscount * (_item.vatPerService / 100);
                break;
            case "discountPerService":
                totalAfterDiscount = _item.totalPerService * (1 - value / 100);
                grandTotalPerService =
                    totalAfterDiscount -
                    totalAfterDiscount * (_item.vatPerService / 100);
                break;
            case "vatPerService":
                grandTotalPerService =
                    totalAfterDiscount - totalAfterDiscount * (value / 100);
                break;
            default:
                break;
        }

        _item["grandTotalPerService"] = grandTotalPerService;
        _item[name] = value;
        setItems((prev) =>
            prev.map((i) => (i.rowIndex === rowIndex ? _item : i))
        );
    };
    const renderItems = () => {
        const renderColEnd = (rowData) => {
            return (
                <Button
                    icon="bx bx-trash"
                    className="p-button-rounded p-button-warning p-button-text"
                    aria-label="Notification"
                    onClick={(_) => handleRemoveItem(rowData)}
                />
            );
        };
        const renderServiceType = (rowData) => {
            // const { productId } = rowData;
            // let data = "";
            // if (productId) {
            //     const product = products.find((p) => p.productId === productId);
            //     const productFamily = productFamilies.find(
            //         (p) => p.id === product?.productFamilyId
            //     );
            //     data = productFamily ? productFamily["productFamilyName"] : "";
            // }
            // if (rowData.isEdit && !preview) {
            //     return (
            //         <div className="p-fluid fluid formgrid grid">
            //             <InputText id={name} value={data} />
            //         </div>
            //     );
            // } else return <p>{data}</p>;
            return <p>{rowData.type}</p>;
        };
        const renderColumnNumber = (name, disabled) => (rowData) => {
            if (rowData.isEdit && !preview) {
                return (
                    <div className="p-fluid fluid formgrid grid">
                        <InputNumber
                            id={name}
                            value={rowData[name]}
                            disabled={disabled}
                            onChange={(e) =>
                                handleChangeItem(
                                    rowData.rowIndex,
                                    name,
                                    e.value
                                )
                            }
                        />
                    </div>
                );
            } else return <p>{formatNum(rowData[name], 2)}</p>;
        };
        const renderProduct = (name) => (rowData) => {
            // if (rowData.isEdit && !preview) {
            //     return (
            //         <div className="p-fluid fluid formgrid grid">
            //             <Dropdown
            //                 options={products}
            //                 optionLabel="productName"
            //                 optionValue="productId"
            //                 filter
            //                 filterBy="productName"
            //                 value={rowData[name]}
            //                 onChange={(e) =>
            //                     handleChangeItem(
            //                         rowData.rowIndex,
            //                         name,
            //                         e.value
            //                     )
            //                 }
            //             ></Dropdown>
            //         </div>
            //     );
            // } else {
            //     const product = products.find(
            //         (p) => p.productId === rowData[name]
            //     );
            //     return <p>{product && product["productName"]}</p>;
            // }
            return <p>{rowData.code}</p>;
        };

        const dataDemo = [
            {
                rowIndex: 1,
                code: "DV001",
                type: "Dịch vụ sửa chữa",
                serviceQuantity: 1,
                listPrice: 300000,
                totalPerService: 0,
                discountPerService: 0,
                totalPrice:0,
                vatPerService:0,
                grandTotalPerService:0
            },
            {
                rowIndex: 2,
                code: "DV002",
                type: "Dịch vụ vận chuyển",
                serviceQuantity: 1,
                listPrice: 30000,
                totalPerService: 30000,
                discountPerService: 0,
                totalPrice:0,
                vatPerService:0,
                grandTotalPerService:30000
            },
        ];

        return (
            <DataTable
                // value={items}
                value={dataDemo}
                dataKey="rowIndex"
                className="p-datatable-gridlines crm-table-invoice-items crm-table"
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
                    body={renderNumericalOrder}
                ></Column>
                <Column
                    field={t("crm-service.service-order-cost.item.name")}
                    header={t("crm-service.service-order-cost.item.name")}
                    className="col-table-0"
                    body={renderProduct("productId")}
                ></Column>
                <Column
                    field={t("crm-service.service-order-cost.item.type")}
                    header={t("crm-service.service-order-cost.item.type")}
                    className="col-table-1"
                    body={renderServiceType}
                ></Column>
                <Column
                    field={t("crm-service.service-order-cost.item.quantity")}
                    header={t("crm-service.service-order-cost.item.quantity")}
                    className="col-table-2"
                    body={renderColumnNumber("serviceQuantity")}
                ></Column>
                <Column
                    field={t("crm-service.service-order-cost.item.unit-price")}
                    header={t("crm-service.service-order-cost.item.unit-price")}
                    className="col-table-3"
                    body={renderColumnNumber("listPrice", true)}
                ></Column>
                <Column
                    field={t("crm-service.service-order-cost.item.total")}
                    header={t("crm-service.service-order-cost.item.total")}
                    className="col-table-4"
                    body={renderColumnNumber("totalPerService", true)}
                ></Column>

                <Column
                    field={t("crm-service.service-order-cost.item.discount")}
                    header={t("crm-service.service-order-cost.item.discount")}
                    className="col-table-5"
                    body={renderColumnNumber("discountPerService")}
                ></Column>

                <Column
                    field={t("crm-service-order.service-order-material.total-price")}
                    header={t("crm-service-order.service-order-material.total-price")}
                    className="col-table-5"
                    body={renderColumnNumber("totalPrice")}
                ></Column>

                <Column
                    field={t("crm-service.service-order-cost.item.vat")}
                    header={t("crm-service.service-order-cost.item.vat")}
                    className="col-table-6"
                    body={renderColumnNumber("vatPerService")}
                ></Column>

                <Column
                    field={t("crm-service.service-order-cost.item.grand-total")}
                    header={t(
                        "crm-service.service-order-cost.item.grand-total"
                    )}
                    className="col-table-7"
                    body={renderColumnNumber("grandTotalPerService", true)}
                ></Column>
                {!preview && (
                    <Column
                        alignFrozen="right"
                        className="col-table-end"
                        bodyClassName="p-0 flex justify-content-center align-items-center border-all frozen-right-first-column"
                        body={renderColEnd}
                    ></Column>
                )}
            </DataTable>
        );
    };
    const renderNumericalOrder = (rowData) => {
        return (
            <div>
                <span className="mr-2">{rowData.index}</span>
            </div>
        );
    };

    return (
        <>
            <div className={`${className ? className : ``} `}>
                <CrmPanel
                    className="mb-2"
                    title={t("menu.crm-service-order_service-order.costs")}
                    collapsed={false}
                >
                    <div className={`p-fluid fluid formgrid grid`}>
                        <div className="col-4 px-3 py-1">
                            <CrmFieldEdittingValue
                                label={t(
                                    "crm-service.service-order-cost.price"
                                )}
                                require={true}
                            >
                                <div className="field">
                                    <Dropdown
                                        options={prices}
                                        optionLabel="priceName"
                                        optionValue="id"
                                        filter
                                        filterBy="priceName"
                                        value={detail.priceOfProductId}
                                        onChange={handleChangePrice}
                                        disabled={readOnly || preview}
                                    ></Dropdown>
                                    {validate.priceOfProductId && (
                                        <small className="p-invalid">
                                            {validate.priceOfProductId}
                                        </small>
                                    )}
                                </div>{" "}
                            </CrmFieldEdittingValue>
                        </div>
                    </div>

                    <div className="col-12 px-0 py-1">
                        {renderItems()}

                        {!preview && (
                            <div className="w-auto">
                                <Button
                                    className="p-button-text text-sm w-auto pl-1"
                                    icon="bx bx-plus text-green text-lg"
                                    tooltip={t(
                                        "crm-service.service-order-cost.item.add"
                                    )}
                                    tooltipOptions={{ position: "bottom" }}
                                    onClick={handleAddItem}
                                    label={t(
                                        "crm-service.service-order-cost.item.add"
                                    )}
                                />
                            </div>
                        )}
                        <div>
                            <div className={`p-fluid fluid formgrid grid`}>
                                <div className="col-6 px-3 py-1">
                                    <CrmFieldPreviewValue
                                        label={t(
                                            "crm-service.service-order-cost.total"
                                        )}
                                        // value={formatNum(
                                        //     detail.totalService,
                                        //     2
                                        // )}
                                        value={formatNum(30000) + " VND"}
                                    />
                                </div>
                                <div className="col-6 px-3 py-1">
                                    <CrmFieldPreviewValue
                                        label={t(
                                            "crm-service.service-order-cost.discount"
                                        )}
                                        // value={formatNum(
                                        //     detail.totalDiscountService,
                                        //     2
                                        // )}
                                        value={formatNum(0)}
                                    />
                                </div>
                                <div className="col-6 px-3 py-1">
                                    <CrmFieldPreviewValue
                                        label={t(
                                            "crm-service.service-order-cost.vat"
                                        )}
                                        // value={formatNum(
                                        //     detail.totalVatService,
                                        //     2
                                        // )}
                                        value={formatNum(0)}
                                    />
                                </div>
                                <div className="col-6 px-3 py-1">
                                    <CrmFieldPreviewValue
                                        label={t(
                                            "crm-service.service-order-cost.grand-total"
                                        )}
                                        // value={formatNum(
                                        //     detail.grandTotalService,
                                        //     2
                                        // )}
                                        value={formatNum(30000)+ " VND"}
                                    />
                                </div>

                                {preview ? (
                                    <div className="col-12 px-3 py-1">
                                        <CrmFieldPreviewValue
                                            label={t(
                                                "crm-service.service-order-cost.note"
                                            )}
                                            value={detail.serviceNote}
                                            readOnly={!permission?.update}
                                        ></CrmFieldPreviewValue>
                                    </div>
                                ) : (
                                    <div className="col-12 px-3 py-1">
                                        <CrmFieldEdittingValue
                                            label={t(
                                                "crm-service.service-order-cost.note"
                                            )}
                                        >
                                            <div className="field">
                                                <InputText
                                                    id="product-code"
                                                    value={detail.serviceNote}
                                                    disabled={readOnly}
                                                    onChange={handleChangeNote}
                                                />
                                            </div>{" "}
                                        </CrmFieldEdittingValue>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CrmPanel>
                {renderFooter()}
            </div>
        </>
    );
}

CrmServiceServiceOrderCostDetail = forwardRef(CrmServiceServiceOrderCostDetail);
export default CrmServiceServiceOrderCostDetail;

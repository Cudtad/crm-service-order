import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef,useState} from "react";

import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import CommonFunction from '@lib/common';
import _ from "lodash";

import { XLayout, XLayout_Center, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import XEditor from '@ui-lib/x-editor/XEditor';
import { Checkbox } from "primereact/checkbox";
import TicketApi from 'services/TicketApi';
import {TicketAutoComplete} from 'components/autocomplete/TicketAutoComplete';

function TicketReferenceDetail(props, ref) {
    const t = CommonFunction.t;
    const {afterSubmitReference } = props;
    const [description, setDescription] = useState("");
    const refDescription = useRef(null);
    const [readOnly, setReadOnly] = useState(false);
    const refType = [
        {
            code: 'child',
            name: t('ticket-ref-child')
        },
        {
            code: 'cancel',
            name: t('ticket-ref-cancel')
        },
        {
            code: 'duplicate',
            name: t('ticket-ref-duplicate')
        }
    ]

    const modeEnum = {
        create: 'create',
        update: 'update',
        copy: 'copy'
    };

    const emptyReference = {
        id: 0,
        refType: "",
        ticketId: 0,
        rootId: 0,
        toId: 0,
        description: "",
        closeTicket: false
    }

    const emptyReferenceValidate = {
        refType: "",
        ticketId: ""
    }

    const [ticketReference, setTicketReference] = useState(emptyReference);
    const { user } = props;
    const [showDetail, setShowDetail] = useState(false);
    const [ticketId, setTicketId] = useState([]);
    const [references, setReferences] = useState([]);
    const [projectId, setProjectId] = useState([]);
    const [referenceValidate, setReferenceValidate] = useState(emptyReferenceValidate);

    useEffect(() => {

    }, [])

    useImperativeHandle(ref, () => ({
        createReference: (_ticket) => {
            setTicketId(_ticket.id);
            setProjectId(_ticket.projectId);
            setShowDetail(true);
        },

        editReference: async (_reference) => {
            setReferenceValidate(emptyReferenceValidate);
        },

    }));

    const hide = () => {
        setTicketReference(emptyReference);
        setReferenceValidate(emptyReferenceValidate);
        setDescription("");
        setShowDetail(false);
    }

    const submit = async (close) => {
        // validate
        let _references = _.cloneDeep(ticketReference)
        let isValid = performValidate([],_references);
        // submit
        if (isValid) {
            // call api
            try {
                // clone object
                let _error = false;
                let _mode = modeEnum.create;
                let _currentObj = {
                    "rootId": _references.ticketId[0].id,
                    "ticketId": ticketId,
                    "refType": _references.refType,
                    "description": description
                }
                switch (_mode) {
                    case modeEnum.create:
//                        create
                        let data = await TicketApi.refticket.create(_currentObj);
                        if (data) {
                            if(ticketReference.closeTicket){
                                TicketApi.changeState(ticketId, "COMPLETED").then(res=>{
                                    if (afterSubmitReference && typeof afterSubmitReference === "function") {
                                        afterSubmitReference(data);
                                    }
                                });
                            }else{
                                if (afterSubmitReference && typeof afterSubmitReference === "function") {
                                    afterSubmitReference(data);
                                }
                            }
                            CommonFunction.toastSuccess(t("common.save-success"));

                        } else {
                            _error =  true
                            CommonFunction.toastError(t("common.save-un-success"));
                        }
                        break;
                    default:
                        break;
                }
                if(close) {
                    hide();
                }
            } catch (error) {
                CommonFunction.toastError(error);
            }
        }
    }


    const performValidate = (props,currentObj) => {
        let result = {...referenceValidate}, isValid = true;
        // validate all props
        if (props.length === 0) {
            for (const property in result) {
                props.push(property);
            }
        }
        // validate props
        props.forEach(prop => {
            switch (prop) {
                case 'refType':
                    result[prop] = currentObj.refType  ? null : `${t('refType.reference')} ${t('message.cant-be-empty')}`;
                    break;
                case 'ticketId':
                    result[prop] = currentObj.ticketId  ? null : `${t('ticket.reference')} ${t('message.cant-be-empty')}`;
                    break;
                case 'rootId':
                    result[prop] = currentObj.rootId  ? null : `${t('ticket.root')} ${t('message.cant-be-empty')}`;
                    break;
                default:
                    break;
            }
        });

        setReferenceValidate(result);

        // check if object has error
        for (const property in result) {
            if (result[property]) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    /**
     * apply change
     * @param {*} index
     * @param {*} prop
     * @param {*} value
     */
    const applyChange = (prop, val) => {
        let _current = _.cloneDeep(ticketReference);
        switch (prop) {
            default:
                break;
        }
        _current[prop] = val;
        setTicketReference(_current);
        performValidate([prop],_current)
    }


    return (
        <Dialog
            header={`${t(`reference.detail`)}`}
            visible={showDetail}
            modal
            style={{ width: '800px' }}
            // className="p-fluid fluid "
            contentClassName="p-0 position-relative"

            footer={
                <>

                </>
            }
            onHide={hide}>
                <XLayout>
                    <XLayout_Top className="task-base-x-toolbar">
                        <XToolbar
                            right={() => (
                                <>
                                    {/* <Button icon="bx bx-x" label={t('common.cancel')} className="p-button-text text-muted" onClick={hide} /> */}
                                    <Button icon="bx bxs-save create" label={t('common.save-close')} onClick={() => submit(true)} />
                                </>
                            )}
                        ></XToolbar>
                    </XLayout_Top>
                    <XLayout_Center>
                        <div className="formgrid grid p-fluid fluid ">
                            <div className="col-3">
                                    <span className="p-float-label">
                                        <Dropdown id="refType" disabled={false}
                                                value={ticketReference.refType}
                                                options={refType}
                                                onChange={(e) => applyChange('refType', e.target.value)}
                                                display="chip"
                                                optionLabel="name"
                                                optionValue="code"
                                                className="p-column-filter"
                                        />
                                        <label htmlFor="refType" className="require">{t('reference.fromType')}</label>
                                    </span>
                                {referenceValidate.refType && <small className="p-invalid">{referenceValidate.refType}</small>}
                            </div>
                            <div className="col-7" >
                                    <span className="p-float-label">
                                        {
                                        <>
                                            <span className="p-float-label">
                                                <TicketAutoComplete
                                                    value={ticketReference.ticketId}
                                                    disabled={readOnly}
                                                    onChange={(e) => applyChange('ticketId', e)}
                                                    projectId={projectId}
                                                    itemDisplay={{name: true,date: true}}
                                                />
                                                <label htmlFor={`ticket.reference`} >{t('ticket.reference')}</label>
                                            </span>
                                        </>
                                        }
                                    </span>
                                {referenceValidate.ticketId && <small className="p-invalid">{referenceValidate.ticketId}</small>}
                            </div>
                            <div className="col-2 flex justify-content-center" >
                                <span className="p-field-checkbox p-0">
                                    <Checkbox inputId="ticket-close" name="status"
                                        checked={ticketReference.closeTicket}
                                        onChange={(e) => applyChange('closeTicket', e.checked)}
                                    />
                                    <label htmlFor="ticket-close">{t("ticket.close")}</label>
                                </span>
                            </div>
                            <div className="col-12">
                                <XEditor
                                    ref={refDescription}
                                    value={description}
                                    onBlur={newContent => setDescription(newContent)}
                                    config={{
                                        placeholder: t("content.causes"),
                                        buttons: [
                                            'bold',
                                            'strikethrough',
                                            'underline',
                                            'italic', '|',
                                            'superscript', 'subscript', '|',
                                            'ul', 'ol', '|',
                                            'indent', 'outdent', '|',
                                            'align', 'font', 'fontsize', 'paragraph', '|',
                                            'image', 'table', 'link', '|',
                                        ],
                                        useSearch: false,
                                        spellcheck: false,
                                        showCharsCounter: false,
                                        showWordsCounter: false,
                                        showXPathInStatusbar: false,
                                        height: 'auto',
                                        minHeight: 100,
                                        language: CommonFunction.getCurrentLanguage(),
                                    }}
                                ></XEditor>
                            </div>
                        </div>

                    </XLayout_Center>
                </XLayout>

        </Dialog>
    )
}

TicketReferenceDetail = forwardRef(TicketReferenceDetail);
export default TicketReferenceDetail;

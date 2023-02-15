import React, { forwardRef,  useEffect, useImperativeHandle, useRef, useState } from 'react';

import CommonFunction from '@lib/common';
import _ from "lodash";
import { XLayout, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import ReactAvatarEditor from "react-avatar-editor";
import XFileUpload from 'components/x-fileupload/XFileUpload';
import { Slider } from 'primereact/slider';
import TaskBaseApi from 'services/TaskBaseApi';

function XAvatarSelector(props, ref) {
    const t = CommonFunction.t;
    const { afterSubmit, borderRadius, allowZoomOut } = props;
    const [show, setShow] = useState(false);
    const refEditor = useRef();
    const [zoomLevel, setZoomLevel] = useState(1);
    const [chooseImage, setChooseImage] = useState(false);
    const refInput = useRef({ application: null, refType: null, refId: null });

    let emptyAvatar = {
        image: null,
        scale: 1,
        preview: null,
        allowZoomOut: allowZoomOut ? true : false,
        position: { x: 0.5, y: 0.5 },
        rotate: 0,
        borderRadius: 0,
        width: 250,
        height: 250
    };
    const [avatar, setAvatar] = useState(emptyAvatar);

    useImperativeHandle(ref, () => ({
        /**
         * create group
         */
        change: (application, refType, refId, avatarId) => {
            refInput.current = {
                application: application,
                refType: refType,
                refId: refId
            };
            setAvatar({ ...emptyAvatar, image: avatarId ? CommonFunction.getImageUrl(avatarId) : null });
            setZoomLevel(1);
            setChooseImage(false);
            setShow(true);
        }
    }))

    /**
     * on selected file
     * @param {*} e
     * @param {*} typeIndex
     * @param {*} attachmentIndex
     */
    const onFileSelect = (e) => {
        if (e.files && e.files.length > 0) {
            if (e.files[0].size > 0) {
                setChooseImage(true);
                setAvatar({ ...avatar, image: e.files[0] });
            } else {
                CommonFunction.toastWarning(t("task-base.attachment.file-empty-content"));
            }
        }
    }

    /**
     * handle scale
     * @param {*} value
     */
    const handleScale = (value) => {
        setZoomLevel(value);
        setAvatar({ ...avatar, scale: parseFloat(value) });
    };

    /**
     * handle position change
     * @param {*} position
     */
    const handlePositionChange = (position) => {
        setAvatar({ ...avatar, position });
    };


    /**
     * create group conversation
     */
    const submit = () => {
        let errMsg = [];

        if (!avatar.image) {
            errMsg.push(t("messenger.change-avatar.avatar.empty"));
        }

        if (errMsg.length === 0) {
            fetch(refEditor.current.getImageScaledToCanvas().toDataURL()).then(async (res) => {
                let file = await res.blob();
                TaskBaseApi.createAttachments(
                    null,
                    file,
                    {
                        application: refInput.current.application,
                        refType: refInput.current.refType,
                        refId: refInput.current.refId
                    }
                ).then(uploadResponse => {
                    if (uploadResponse && uploadResponse.length > 0 && uploadResponse[0].file && uploadResponse[0].file.id) {

                        if (afterSubmit && typeof afterSubmit === "function") {
                            afterSubmit(uploadResponse[0].file.id);
                        }
                        cancel();
                    }
                })
            })
        } else {
            CommonFunction.toastWarning(errMsg);
        }
    }

    /**
     * cancel
     */
    const cancel = () => {
        setShow(false);
    }

    return (
        <Dialog
            header={t("avatar.secletor-title")}
            visible={show}

            modal
            footer={() => (<>
                <Button className="p-button-text" label={t('common.cancel')} onClick={() => cancel()}></Button>
                <Button className="primary" label={t("button.accept")} onClick={() => submit()}></Button>
            </>)}
            onHide={() => cancel()}
        >
            {show && <>
                <XLayout className="px-2 conversation-change-avatar">
                    <XLayout_Center className="flex flex-column align-items-center justify-content-center">
                        <ReactAvatarEditor
                            ref={refEditor}
                            scale={parseFloat(avatar.scale)}
                            width={avatar.width}
                            height={avatar.height}
                            rotate={avatar.rotate}
                            borderRadius={borderRadius !== undefined ? borderRadius : avatar.width}
                            image={avatar.image}
                            border={10}
                            position={avatar.position}
                            onPositionChange={handlePositionChange}
                        />


                        {chooseImage && avatar.image &&
                            <div className="mt-3 w-full">
                                <Slider
                                    value={zoomLevel}
                                    onChange={(e) => handleScale(e.value)}
                                    max={2}
                                    min={avatar.allowZoomOut ? 0.1 : 1}
                                    step={0.01}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        }

                        <XFileUpload
                            type="in-field"
                            className="my-2 file-upload"
                            chooseOptions={{ icon: 'bx bx-cloud-upload', label: t("button.choose-image") }}
                            onSelect={(e) => onFileSelect(e)}
                            accept="image/*"
                        />

                    </XLayout_Center>
                </XLayout>
            </>}
        </Dialog>
    )
}

XAvatarSelector = forwardRef(XAvatarSelector);

export default XAvatarSelector;

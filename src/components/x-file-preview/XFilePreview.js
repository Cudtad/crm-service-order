import CommonFunction from '@lib/common';
import React, { forwardRef, Suspense, useImperativeHandle, useRef, useState } from 'react';
import "./scss/XFilePreview.scss";

import { Dialog } from 'primereact/dialog';
import _ from "lodash";
import { XLayout, XLayout_Box, XLayout_Center, XLayout_Right, XLayout_Row, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import { Button } from 'primereact/button';
import TaskBaseApi from 'services/TaskBaseApi';
import { UserPopover } from 'components/popovers/user-popover/UserPopover';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import XExcel from '@ui-lib/x-office/XExcel';
import LoadingBar from '@ui-lib/loading-bar/LoadingBar';
import XWord from '@ui-lib/x-office/XWord';
/**
 * props
 *      allowHistory: false // show history, default false
 *
 * imperative handle
 *      show([ { refId: null, id: id, name: name } ], index) // preview files with index, refid for view histories
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XFilePreview(props, ref) {
    const t = CommonFunction.t;
    const { allowHistory } = props;
    const [show, setShow] = useState(false);
    const [histories, setHistories] = useState("");
    const refCurrentHistoryId = useRef(null);
    const [currentFile, setCurrentFile] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const refFiles = useRef(null);
    const imageRegex = /\.(jpg|jpeg|png|gif)$/gm;
    const refHistoryPage = useRef(0);
    const [canLoadMoreHistory, setCanLoadMoreHistory] = useState(false);
    const refExcel = useRef();
    const refWord = useRef();

    useImperativeHandle(ref, () => ({
        /**
         * show
         * @param {*} _files
         */
        show: (_files, index) => {
            if (_files && Array.isArray(_files) && _files.length > 0) {
                setShow(true);
                setShowHistory(false);
                refCurrentHistoryId.current = null;
                refFiles.current = _.cloneDeep(_files);
                setTimeout(() => {
                    previewFile(index || 0)
                }, 100);
            }
        }
    }))

    /**
     * preview file
     * @param {*} index
     */
    const previewFile = (index) => {
        let _file = {
            index: index,
            id: refFiles.current[index].id,
            refId: refFiles.current[index].refId || null,
            name: refFiles.current[index].name || "",
            isImage: (refFiles.current[index].name || "").toLowerCase().match(imageRegex),
        };

        _file.fileType = CommonFunction.getFileType(_file.name);

        switch (_file.fileType) {
            case "excel":
                CommonFunction.waitFor(() => refExcel.current).then(() => {
                    refExcel.current.openStorage(_file.id);
                })
                break;
            case "word":
                CommonFunction.waitFor(() => refWord.current).then(() => {
                    refWord.current.openStorage(_file.id);
                })
                break;
            default:
                break;
        }

        setCurrentFile(_file);

    }

    /**
     * preview next file
     */
    const nextFile = () => {
        if (currentFile.index < refFiles.current.length - 1) {
            previewFile(currentFile.index + 1);
        }
    }

    /**
     * preview previous file
     */
    const previousFile = () => {
        if (currentFile.index > 0) {
            previewFile(currentFile.index - 1);
        }
    }

    /**
     * render preview file
     */
    const renderPreviewFile = (file) => {
        let fileType = file.fileType || CommonFunction.getFileType(file.name);
        let previewUrl = `${CommonFunction.filePreviewUrl}${file.id}`;
        renderHistory(file.refId);

        switch (fileType) {
            case "image":
                return (
                    <div className="file-image-preview">
                        <img src={previewUrl} />
                    </div>
                )
            case "video":
                return (
                    <div className="file-image-preview">
                        <video width="100%" height="100%" controls>
                            <source src={`${process.env.REACT_APP_MEDIA}${file.id}`} type="video/mp4" />
                        </video>
                    </div>
                )
            case "pdf":
                return (
                    <object className="file-pdf-preview" data={previewUrl} type="application/pdf">
                        <embed src={previewUrl} type="application/pdf" />
                    </object>
                )
            // case "word":
            // case "excel":
            case "powerpoint":
                return (
                    <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${previewUrl}`}
                        width='100%' height='100%' frameBorder='0' />
                )
            case "excel":
                return (
                    <Suspense fallback={<LoadingBar loading={true}></LoadingBar>}>
                        <XExcel readonly ref={refExcel}></XExcel>
                    </Suspense>
                )
            case "word":
                return (
                    <XWord readonly ref={refWord} ></XWord>
                )
            default:
                return (<div className="file-not-supported">
                    <div className="file-info">
                        <img src={CommonFunction.getFileIcons(file.name)} />
                        <span className="content-space">{file.name}</span>
                    </div>
                    <XLayout_Row>
                        <span>{t("file-preview.not-supported")}.</span>
                        <span className="link-button content-space" onClick={() => CommonFunction.downloadFile(file.id)} >{t("button.download")}</span>
                    </XLayout_Row>
                </div>)
        }
    }

    /**
     * toggle history
     */
    const toggleHistory = () => {
        if (currentFile) {
            setShowHistory(!showHistory);
            renderHistory();
        }
    }

    /**
     * render history
     */
    const renderHistory = (_id) => {
        _id = _id || currentFile.refId;

        if (_id && showHistory && refCurrentHistoryId.current !== _id) {
            refCurrentHistoryId.current = _id;
            TaskBaseApi.getAttachmentHistories(_id).then(res => {
                if (res && res.content) {
                    refHistoryPage.current = res.page;
                    setHistories(res.content);
                    setCanLoadMoreHistory(res.content.length === res.total);
                } else {
                    setHistories(null);
                }
            });
        }
    }

    /**
     * load more history
     */
    const loadMoreHistory = () => {
        TaskBaseApi.getAttachmentHistories(refCurrentHistoryId.current, refHistoryPage.current + 1).then(res => {
            if (res && res.content) {
                let _histories = _.cloneDeep(histories).concat(res.content);
                refHistoryPage.current = res.page;
                setHistories(_histories);
                setCanLoadMoreHistory(_histories.length === res.total);
            } else {
                setCanLoadMoreHistory(false);
            }
        });
    }


    return (
        <Dialog
            visible={show}
            header={currentFile ? currentFile.name : ""}
            maximized
            modal
            onHide={() => { setShow(false) }}
        >
            <XLayout className="px-2">
                {refFiles.current && currentFile && <>
                    <XLayout_Top>
                        <XToolbar
                            left={() => <>
                                <Button
                                    icon="bx bx-chevron-left"
                                    label={t("button.previous")}
                                    disabled={currentFile.index === 0}
                                    onClick={previousFile}
                                ></Button>
                                <Button
                                    icon="bx bx-chevron-right"
                                    label={t("button.next")}
                                    disabled={currentFile.index === refFiles.current.length - 1}
                                    onClick={nextFile}
                                ></Button>
                                <div className="x-toolbar-separator"></div>
                                <Button
                                    icon="bx bx-down-arrow-circle"
                                    label={t("button.download")}
                                    onClick={() => CommonFunction.downloadFile(currentFile.id)}
                                ></Button>
                                {allowHistory &&
                                    <Button
                                        icon="bx bx-history"
                                        label={t("button.history")}
                                        onClick={toggleHistory}
                                    ></Button>
                                }
                            </>}
                        ></XToolbar>
                    </XLayout_Top>
                    <XLayout_Center className="x-preview-file-container">
                        <XLayout_Box className="x-preview-file-box" id={`file_preview_${currentFile.id}`}>
                            {renderPreviewFile(currentFile)}
                        </XLayout_Box>
                    </XLayout_Center>
                    {showHistory &&
                        <XLayout_Right className="x-preview-file-histories">
                            <XLayout_Box>
                                <XLayout_Title className="history-title">{t("button.history")}</XLayout_Title>
                                {histories && histories.length > 0 && histories.map((history, index) => (<>
                                    <UserPopover
                                        user={{
                                            id: history.createBy ? history.createBy.id : "", //user's id,
                                            fullName: history.createBy ? history.createBy.fullName : "", // user's full name
                                        }}
                                        title={() => (<>
                                            <XAvatar
                                                src={history.createBy ? CommonFunction.getImageUrl(history.createBy.avatar, history.createBy.fullName) : ""}
                                                label={() => (<XLayout_Row>
                                                    <span className="bold">{history.createBy ? history.createBy.fullName : ""}</span>
                                                    <span className={`bold history-action-${history.action}`}> · {t(`task-base.attachment.action-${history.action}`)}</span>
                                                    <span className="text-small text-grey">{history.createDate ? " · " + CommonFunction.formatDateTime(history.createDate) : ""}</span>
                                                </XLayout_Row>)}
                                            ></XAvatar>
                                        </>)}
                                    ></UserPopover>
                                    <div className="history-info">
                                        <XLayout_Row>
                                            <span>· {t("task-base.attachment.file.name")}: </span>
                                            <span className="bold">{history.name}</span>
                                        </XLayout_Row>
                                        <XLayout_Row>
                                            <span>· {t("task-base.attachment.file.version")}: </span>
                                            <span className="bold">{history.versionNo}</span>
                                        </XLayout_Row>
                                        {history.file &&
                                            <XLayout_Row className="history-file">
                                                <span>· {t("task-base.attachment.file.file")}: </span>
                                                <img src={CommonFunction.getFileIcons(history.file.name)} />
                                                <div className="link-button" onClick={() => CommonFunction.downloadFile(history.file.id)}>{history.file.name}</div>
                                            </XLayout_Row>
                                        }
                                    </div>
                                    {index < histories.length - 1 && <div className="history-separator"></div>}
                                </>))}
                            </XLayout_Box>
                        </XLayout_Right>
                    }
                </>}
            </XLayout>
        </Dialog >
    )
}

XFilePreview = forwardRef(XFilePreview);

export default XFilePreview;

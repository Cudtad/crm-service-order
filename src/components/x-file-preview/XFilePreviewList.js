import CommonFunction from '@lib/common';
import React, { useRef } from 'react';
import "./scss/XFilePreviewList.scss";

import XFilePreview from './XFilePreview';
import classNames from "classnames";

/**
 * build to do list
 *      files: [ { id: id, name: name } ]
 *      previewSize: {64} // preview image size, default 64px
 *      allowDownload: true
 *      allowPreview: true
 *      removeFn: () => {} // function, allow remove file or not
 *
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XFilePreviewList(props) {
    const t = CommonFunction.t;
    const { files, previewSize, className, removeFn, allowDownload, allowPreview } = props;
    const refFilePreview = useRef(null);

    if (files && Array.isArray(files) && files.length > 0) {
        // check if files contains only 1 image
        const imageRegex = /\.(jpg|jpeg|png|gif)$/gm;
        const videoRegex = /\.(mp4|mkv|m4p|m4v)$/gm;
        const onlyOneImage = files.length === 1 && (files[0].name || "").toLowerCase().match(imageRegex);

        // preview size
        const _previewSize = onlyOneImage ? 128 : (previewSize || 64);
        const _previewSizePixel = `${_previewSize}px`;
        const _previewSizeWidthPixel = `${Math.round(_previewSize * 4 / 3)}px`;

        /**
         * render image
         */
        const renderImage = (file, index) => {
            return (
                <img
                    src={`${CommonFunction.filePreviewUrl}${file.id}-x${_previewSize}`}
                    onClick={(e) => previewFiles(index)}
                ></img>
            )
        }

        /**
         * render image
         */
        const renderVideo = (file, index) => {
            return (<>
                <div className="x-file-preview-play-button"><span className="bx bx-movie-play"></span></div>
                <img
                    src={`${process.env.REACT_APP_MEDIA}thumbs/${file.id}.jpg`}
                    onClick={(e) => previewFiles(index)}
                ></img>
            </>)
        }

        /**
         * remove File
         */
        const removeAttachment = (file, index) => {
            // callback
            if (removeFn && typeof removeFn === 'function') {
                removeFn(file, index);
            }
        }

        /**
         * render file
         */
        const renderFile = (file, index) => {
            return (
                <div
                    className="x-file-not-image"
                    style={{ width: _previewSizeWidthPixel, height: _previewSizePixel }}
                    onClick={(e) => previewFiles(index)}
                >
                    {/* {CommonFunction.getFileFontIcons(file.name, "fs-26")} */}
                    <img src={CommonFunction.getFileIcons(file.name)} style={{ maxHeight: "26px" }} />
                    <div className="file-name">{file.name}</div>
                </div>
            )
        }

        /**
         * preview files
         * @param {*} index
         */
        const previewFiles = (index) => {
            if (allowPreview !== false) {
                refFilePreview.current.show(files, index);
            }
        }

        /**
         * render attachment
         */
        const renderAttachment = (file, index) => {
            if (file.name) {
                if (file.name.toLowerCase().match(imageRegex)) {
                    // render image
                    return renderImage(file, index);
                } else if (file.name.toLowerCase().match(videoRegex)) {
                    // render video
                    return renderVideo(file, index);
                }
            }

            return renderFile(file, index);
        }

        return (<>
            <div className={`x-file-preview-list ${className || ""}`}>
                {files.filter(f => f.id).map((file, index) => (
                    <div
                        key={index}
                        className={classNames({
                            "x-file-item": true,
                            "pointer": allowPreview !== false
                        })}
                        style={{ height: _previewSizePixel }}
                        title={file.name}
                    >
                        {removeFn && typeof removeFn === "function" &&
                            <div className="x-comments-attachments-item" key={index}>
                                <div className="x-comments-attachments-remove pointer" onClick={() => removeAttachment(file, index)}>
                                    <i className="bx bx-x fs-16 text-red-3"></i>
                                </div>
                            </div>
                        }

                        {renderAttachment(file, index)}

                        {allowDownload !== false &&
                            <div
                                className="download-overlay"
                                title={t("common.download-file").format(file.name)}
                                onClick={(e) => CommonFunction.downloadFile(file.id)}
                            >
                                <i className="bx bxs-download fs-20"></i>
                            </div>
                        }
                    </div>
                ))}
            </div>
            <XFilePreview ref={refFilePreview}></XFilePreview>
        </>)
    } else {
        return <></>
    }


}


export default XFilePreviewList;

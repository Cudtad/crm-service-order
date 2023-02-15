import JoditEditor from 'jodit-react';
import CommonFunction from '@lib/common';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * config everythings like jodit
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XEditor(props, ref) {
    const { config, onAfterUploadFile, addNewLine } = props;
    const refJoditEditor = useRef(null);
    const joditUploaderConfig = CommonFunction.getJoditUploaderConfig();

    useImperativeHandle(ref, () => ({
        /**
         * create
         * @param {*} application
         * @param {*} refType
         * @param {*} refId
         */
         insertHTML: (content) => {
            refJoditEditor.current.selection.insertHTML(content);
        }

    }))

    /**
     * prepare config
     * @returns
     */
    const prepareJoditConfig = () => {
        let _events = config.events || {};

        // override after init event
        _events.afterInit = (instance) => {
            refJoditEditor.current = instance;
            if (config.events && config.events.afterInit && typeof config.events.afterInit === "function") {
                config.events.afterInit(instance);
            }
        }

        let _config = {
            toolbarButtonSize: 'small',
            ...props.config,
            uploader: {
                ...joditUploaderConfig,

                defaultHandlerSuccess: function (data) {
                    let listFilePath = [];
                    data.forEach(f => {
                        if (f.contentType && f.contentType.startsWith('video')) {
                            let video = refJoditEditor.current.createInside.element('video');
                            video.setAttribute('src', f.path);
                            video.setAttribute('controls', 'true')
                            refJoditEditor.current.selection.insertNode(video);
                            // refJoditEditor.current.setEditorValue(); // for synchronize value between source textarea and editor
                        } else {
                            refJoditEditor.current.selection.insertImage(f.path);
                            listFilePath.push(f.path);
                        }
                    });
                    if (onAfterUploadFile && typeof onAfterUploadFile === 'function') {
                        onAfterUploadFile(listFilePath);
                    }
                },
            },
            events: _events
        }

        return _config;
    }
    const [joditConfig, setJoditConfig] = useState(prepareJoditConfig());

    /**
     * interval to reload token
     */
    useEffect(() => {
        const interval = setInterval(() => {
            try {
                let _bearer = `Bearer ${window.app_context.keycloak.token}`;
                if (_bearer !== refJoditEditor.current.uploader.options.headers.Authorization) {
                    refJoditEditor.current.uploader.options.headers.Authorization = _bearer;
                }
            } catch (error) {
                console.log("x-editor interval error", error)
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <JoditEditor
            ref={refJoditEditor}
            {...props}
            addNewLine={addNewLine ? addNewLine : false}
            config={joditConfig}
        />
    )
}

XEditor = forwardRef(XEditor);

export default XEditor;

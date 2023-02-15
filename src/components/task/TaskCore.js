import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import _ from "lodash";

import CommonFunction from '@lib/common';
import "./scss/TaskCore.scss"
import XToolbar from '@ui-lib/x-toolbar/XToolbar';
import {usePrevious} from "lib/hooks/hooks";
import XComments from "components/x-comments/XComments";

function TaskCore(props, ref) {

    //#region declaration

    const t = CommonFunction.t;

    const {
        className, // apply class for root div
        onChange, // function call back when data or state change
        top, // config for top panel
        right, // config for right panel
        bottom, // config for bottom panel
        left, // config for left panel
        center // config for center panel
    } = props;

    // validate
    const defaultValidateObject = {
        name: "",
        userId: "",
        requestedBy: "",
        requestedByUser: "",
        requestedByUsers: ""
    }

    const modeEnum = {
        create: "create",
        update: "update",
        view: "view"
    }

    const [task, setTask] = useState(null);
    const previousTask = usePrevious(task);
    const refMode = useRef(null);
    const [validateObject, setValidateObject] = useState(defaultValidateObject);
    const taskCoreId = `task-core-${CommonFunction.getIdNumber()}`;

    /**
     * build in plug in and demo config
     */
    const buildInPlugins = {
        "toolbar": true,
        "comments": true
    }

    /**
     * layout
     * @returns
     */
    const calculateGridLayout = () => {
        let _top = (top && top.hidden !== true) ? (top.height || "auto") : "0px";
        let _right = (right && right.hidden !== true) ? (right.width || "auto") : "0px";
        let _bottom = (bottom && bottom.hidden !== true) ? (bottom.height || "auto") : "0px";
        let _left = (left && left.hidden !== true) ? (left.width || "auto") : "0px";

        let style = {
            gridTemplateRows: `${_top} 1fr ${_bottom}`,
            gridTemplateColumns: `${_left} 1fr ${_right}`
        }

        return style;
    }

    const gridLayout = calculateGridLayout();

    //#endregion

    //#region effects
    useEffect(() => {
        if (onChange && typeof onChange === "function") {
            onChange(
                _.cloneDeep(task),
                "state",
                _.cloneDeep(task),
                previousTask ? _.cloneDeep(previousTask) : null
            );
        }
    }, [task])
    //#endregion

    //#region  imperative handle

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: async (_task) => {
            performCreate(_task);
        },

        /**
         * edit
         */
        edit: (_task) => {
            performEdit(_task);
        },

        view: () => {
            performView();
        },

        /**
         * copy
         */
        copy: () => {
            performCopy();
        },

        /**
         * get current task
         * @returns task
         */
        get: () => {
            return _.cloneDeep(task);
        },

        /**
         * set current task
         * @param {*} _task
         */
        set: (_task) => {
            setTask(_.cloneDeep(_task));
        },

        /**
         * validate
         * @param {*} array array of properties need to validate
         */
        validate: (properties) => {
            performValidate(properties || []);
        }
    }))

    //#endregion

    // effects
    useEffect(() => { }, [])

    //#region sub/func

    /**
     * create
     */
    const performCreate = (_task) => {
        // set mode
        refMode.current = modeEnum.create;
        setTask(_task);
    }

    /**
     * edit
     */
    const performEdit = (_task) => {
        refMode.current = modeEnum.update;
    }

    /**
     * view
     */
    const performView = (_task) => {
        refMode.current = modeEnum.view;
    }

    /**
     * copy
     */
    const performCopy = (_task) => {
        refMode.current = modeEnum.create;
    }

    /**
     * validate task
     * @param {*} properties propoties for validate, null is validate all
     * @param {*} _task if
     * @param {*} warning
     * @returns
     */
    const performValidate = (properties, _task = null, warning = false) => {
        var result = { ...validateObject },
            isValid = true;

        _task = _task || _.cloneDeep(task);

        // validate all props
        if (properties.length === 0) {
            for (const key in result) {
                properties.push(key);
            }
        }

        // validate props
        properties.forEach(prop => {
            switch (prop) {
                case "name":
                    result[prop] = _task.name.length > 0 ? null : t("name-can-not-be-empty");
                    break;
                default:
                    break;
            }
        });

        // set state
        setValidateObject(result);

        // check if object has error
        let err = [];
        for (const key in result) {
            if (result[key]) {
                isValid = false;
                err.push(result[key]);
            }
        }

        if (warning && err.length > 0) {
            CommonFunction.toastWarning(err.join("<br/>"));
        }

        return isValid;
    };

    /**
     * scroll to
     * @param {*} elm
     */
    const scrollTo = (elm) => {
        let container = document.querySelector("#tdcpn-detail"),
            element = document.querySelector(`#${elm}`);

        CommonFunction.scrollTo(container, element);
    }

    /**
     * render plugins
     */
    const renderPlugins = (position, cfg) => {
        if (cfg && Array.isArray(cfg.plugins) && cfg.plugins.length > 0) {
            return (<>
                {cfg.plugins.filter(f => f.hidden !== true).map((plugin, pluginIndex) => (
                    <React.Fragment key={pluginIndex}>
                        {/* header - string */}
                        {plugin.header && typeof plugin.header === "string" &&
                            <div className="tdcpn-content-title">
                                {plugin.header}
                            </div>
                        }

                        {/* header - function */}
                        {plugin.header && typeof plugin.header === "function" && plugin.header()}

                        {/* body - dynamic */}
                        {!buildInPlugins.hasOwnProperty(plugin.code) && plugin.body && typeof plugin.body === "function" && <>
                            {plugin.outlined ? <div className="tdcpn-content-box">{plugin.body()}</div> : plugin.body()}
                        </>}

                        {/* body - toolbar */}
                        {plugin.code === "toolbar" && renderPlugins_Toolbar(position, plugin)}

                        {/* body - comments */}
                        {plugin.code === "comments" && renderPlugins_Comments(position, plugin)}

                        {/* footer - null */}
                        {!plugin.footer && <div className="tdcpn-content-footer"></div>}

                        {/* footer - string */}
                        {plugin.footer && typeof plugin.footer === "string" && <div className="tdcpn-content-footer">
                            {plugin.footer}
                        </div>}

                        {/* footer - function */}
                        {plugin.footer && typeof plugin.footer === "function" && plugin.footer()}
                    </React.Fragment>
                ))}
            </>)
        } else {
            return <></>
        }
    }

    /**
     * redner plugins: toolbar
     *      left: function
     *      center: function
     *      right: function
     * @param {*} position
     * @param {*} cfg
     * @returns
     */
    const renderPlugins_Toolbar = (position, cfg) => {
        return <XToolbar className={cfg.className || ""} left={cfg.left} center={cfg.center} right={cfg.right} />
    }

    const renderPlugins_Comments = (position, cfg) => {

        // find container id
        let commentsContainerId;
        if (!cfg.containerId) {
            commentsContainerId = taskCoreId;

            console.log(taskCoreId, document.getElementById(taskCoreId));
        } else {
            commentsContainerId = cfg.containerId
        }

        // find closet windows, if exist, set

        return (
            <XComments
                containerId={commentsContainerId}
                sender={cfg.sender}
                allowFileTypes={cfg.allowFileTypes}
                mentionTypes={cfg.mentionTypes}
            // submit={submitCommentAsync}
            />
        )
    }

    //#endregion

    //#region return

    return (
        <div className={`tdcpn-container ${className || ""}`} style={gridLayout} id={taskCoreId}>
            {task && <>

                {/* TOP SIDE */}
                <div className={`tdcpn-top ${top && top.className ? top.className : ""}`} id="tdcpn-top-detail">
                    {top && top.hidden !== true && renderPlugins("top", top)}
                </div>

                {/* RIGHT SIDE */}
                <div className={`tdcpn-right ${right && right.className ? right.className : ""}`} id="tdcpn-right-detail">
                    {right && right.hidden !== true && renderPlugins("right", right)}
                </div>

                {/* BOTTOM SIDE */}
                <div className={`tdcpn-bottom ${bottom && bottom.className ? bottom.className : ""}`} id="tdcpn-bottom-detail">
                    {bottom && bottom.hidden !== true && renderPlugins("bottom", bottom)}
                </div>

                {/* LEFT SIDE */}
                <div className={`tdcpn-left ${left && left.className ? left.className : ""}`} id="tdcpn-left-detail">
                    {left && left.hidden !== true && renderPlugins("left", left)}
                </div>

                {/* CENTER */}
                <div className={`tdcpn-center ${center && center.className ? center.className : ""}`} id="tdcpn-center-detail">
                    {center && center.hidden !== true && renderPlugins("center", center)}
                </div>

            </>}
        </div>
    )

    //#endregion
}

TaskCore = forwardRef(TaskCore);

export default TaskCore;

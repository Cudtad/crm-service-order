import React, {forwardRef} from "react";
import "./scss/TaskCore.scss"

function Layout(props, ref) {

    //#region declaration

    const {
        className, // apply class for root div
        top, // config for top panel
        right, // config for right panel
        bottom, // config for bottom panel
        left, // config for left panel
        center // config for center panel
    } = props;

    /**
     * layout
     * @returns
     */
    const calculateGridLayout = () => {
        let _top = "0px";
        let _right = "0px";
        let _bottom = "0px";
        let _left = "0px";

        _top = top ? (top.height || "auto") : "0px";
        _right = right ? (right.width || "auto") : "0px";
        _bottom = bottom ? (bottom.height || "auto") : "0px";
        _left = left ? (left.width || "auto") : "0px";

        let style = {
            gridTemplateRows: `${_top} 1fr ${_bottom}`,
            gridTemplateColumns: `${_left} 1fr ${_right}`
        }

        return style;
    }

    const gridLayout = calculateGridLayout();

    //#endregion

    //#region return

    return (
        <div className={`tdcpn-container ${className || ""}`} style={gridLayout}>

            {/* TOP SIDE */}
            <div className={`tdcpn-top ${top && top.className ? top.className : ""}`} id="tdcpn-top-detail">
                {top && top}
            </div>

            {/* RIGHT SIDE */}
            <div className={`tdcpn-right ${right && right.className ? right.className : ""}`} id="tdcpn-right-detail">
                {right && right}
            </div>

            {/* BOTTOM SIDE */}
            <div className={`tdcpn-bottom ${bottom && bottom.className ? bottom.className : ""}`} id="tdcpn-bottom-detail">
                {bottom && bottom}
            </div>

            {/* LEFT SIDE */}
            <div className={`tdcpn-left ${left && left.className ? left.className : ""}`} id="tdcpn-left-detail">
                {left && left}
            </div>

            {/* CENTER */}
            <div className={`tdcpn-center ${center && center.className ? center.className : ""}`} id="tdcpn-center-detail">
                {center && center}
            </div>

        </div>
    )

    //#endregion
}

Layout = forwardRef(Layout);

export default Layout;

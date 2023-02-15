import _ from "lodash";
import CommonFunction from '@lib/common';
import React, { useEffect, useRef, useState } from 'react';
import './scss/XHorizontalMenu.scss';
import classNames from "classnames";

/**
 * base on https://codepen.io/jreaux62/pen/yluoA
 * @param {*} props
 * @returns
 */
function XHorizontalMenu(props) {
    const { menu, selected, className } = props;
    const [preparedMenu, setPreparedMenu] = useState(null);
    const refTopMenuActiveCode = useRef("");
    const refTopMenuActiveLabel = useRef([""])
    const refCalculatedMenuPosition = useRef({});

    useEffect(() => { prepareMenu() }, [selected])

    /**
     * prepare menu
     */
    const prepareMenu = (_menu) => {
        if (menu) {
            /**
             * build menu path
             * @param {*} parentPath
             * @param {*} parentPathLabel
             * @param {*} item
             */
            const buildPath = (parentPath, parentPathLabel, item, topLevel) => {
                // build path
                item.code = item.code || `menu_${CommonFunction.getIdNumber()}`;
                item.path = [...parentPath, item.code];
                item.pathLabel = [...parentPathLabel, item.label];
                item.renderId = `menu_${CommonFunction.getIdNumber()}`;
                item.topLevel = topLevel;

                // mark active
                if (!CommonFunction.isEmpty(selected) && item.code === selected) {
                    refTopMenuActiveCode.current = item.path[0];
                    refTopMenuActiveLabel.current = [...item.pathLabel];
                    item.active = true;
                }

                // build child path
                if (item.items && Array.isArray(item.items) && item.items.length > 0) {
                    item.items.forEach(el => {
                        buildPath(item.path, item.pathLabel, el, false);
                    })
                }
            }

            // build menu path
            let _menu = _.cloneDeep(menu);
            _menu.forEach(m => {
                buildPath([], [], m, true)
            });

            setPreparedMenu(_menu);
        }
    }

    /**
     * top level mouse enter
     */
    const topLevelMouseEnter = (e, _menu) => {
        let subMenu = document.querySelector(`#${_menu.renderId} ul`);
        if (subMenu) {
            // calculate position
            let rec = e.target.getBoundingClientRect();
            subMenu.style.position = "fixed";
            subMenu.style.top = `${rec.top + rec.height - 0.5}px`;
            subMenu.style.left = `${rec.left}px`;
            subMenu.style.minWidth = `${rec.width}px`;
        }
    }

    /**
     * render menu label
     */
    const renderMenuLabel = (_menu) => {
        if (_menu.topLevel && _menu.code === refTopMenuActiveCode.current) {
            // render active menu
            return (
                <div className="x-horizontal-menu-top-level x-horizontal-menu-top-level-active">
                    {refTopMenuActiveLabel.current.map((label, index) => (<React.Fragment key={index}>
                        {index > 0 && <span className="bx bx-chevron-right"></span>}
                        <span>{label}</span>
                    </React.Fragment>))}
                </div>
            )
        } else {
            // sub menu, render only label
            return (<div className="x-horizontal-menu-top-level">{_menu.label}</div>);
        }
    }

    /**
     * render menu
     * @param {*} _menu
     * @param {*} index
     * @returns
     */
    const renderMenu = (_menu, index) => {

        return (
            <li
                id={_menu.renderId}
                onMouseEnter={(e) => topLevelMouseEnter(e, _menu)}
                className={classNames({
                    "x-horizontal-menu-item menu-link": true,
                    "menu-active": _menu.active || _menu.code === refTopMenuActiveCode.current
                })}
            >
                {_menu.to
                    ? <a href={_menu.to}>{renderMenuLabel(_menu)}</a>
                    : <div>{renderMenuLabel(_menu)}</div>
                }

                {_menu.items && Array.isArray(_menu.items) && _menu.items.length > 0 && <>
                    {!_menu.topLevel &&
                        <span className="x-horizontal-menu-expand bx bx-chevron-right"></span>
                    }
                    <ul>
                        {_menu.items.map((subMenu, subMenuIndex) => (
                            <React.Fragment key={subMenuIndex}>
                                {renderMenu(subMenu, subMenuIndex)}
                            </React.Fragment>
                        ))}
                    </ul>
                </>}
            </li>
        )
    }

    if (preparedMenu) {
        return (
            <div className={`x-horizontal-menu ${className}`}>
                <ul>
                    {preparedMenu.map((m, index) => (
                        <React.Fragment key={index}>
                            {renderMenu(m, index)}
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        );
    } else {
        return <></>
    }
}

export default XHorizontalMenu;

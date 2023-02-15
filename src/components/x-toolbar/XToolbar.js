import React from 'react';
import './scss/XToolbar.scss';

function XToolbar(props) {

    const { left, center, right, className } = props;

    return (
        <div className={`x-toolbar ${className || ""}`}>
            {/* left */}
            <div className="x-toolbar-left">
                {left && typeof left === "function" && left()}
            </div>
            {/* center */}
            {center && typeof center === "function" &&
                <div className="x-toolbar-center">
                    {center()}
                </div>
            }
            {/* right */}
            <div className="x-toolbar-right">
                {right && typeof right === "function" && right()}
            </div>
        </div>
    );
}

export default XToolbar;

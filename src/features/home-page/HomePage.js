import React, { useState } from "react";
import './scss/HomePage.scss';
import openingImage from 'assets/images/opening.svg'; //https://www.freepik.com/author/pch-vector
import CommonFunction from "@lib/common";

function HomePage() {
    const t = CommonFunction.t;
    const [menu] = useState((() => {
        let _menu = [];
        // prepare menu
        if (window.app_context.user.menu && window.app_context.user.menu["crm-service-service"] && window.app_context.user.menu["crm-service-service"].length > 0 && window.app_context.user.menu["crm-service-service"][0].children) {
            _menu = [...window.app_context.user.menu["crm-service-service"][0].children];
        }
        return _menu;
    })());
    return (
        <div className="crm-service-home-page">
            <img src={openingImage} className="greeting-image"></img>
            <span className="greeting">
                {t('hello').format(window.app_context.user.fullName)}
            </span>
            <span className="greeting-sentence">
                {t('welcome.application')}
            </span>

            <div className="menu-container">
                {menu.map((m, i) => {
                    if (m.data) {
                        if (!m.children) {
                            return (
                                <div className="menu menu-no-child">
                                    <div className="menu-header">
                                        <a href={m.data.to}>
                                            <span className={`${m.data.icon} mr-2`}></span>
                                            <span>{t(m.data.label)}</span>
                                        </a>
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div className="menu menu-has-child flex flex-column">
                                    <div className="menu-header">
                                        <span className={`${m.data.icon} mr-2`}></span>
                                        <span>{t(m.data.label)}</span>
                                    </div>
                                    {m.children.map((c, ic) => {

                                        return (
                                            <a className="menu-child" href={c.data.to}>
                                                <span className={`${c.data.icon} mr-2`}></span>
                                                <span>{t(c.data.label)}</span>
                                            </a>
                                        )
                                    })}
                                </div>)
                        }
                    }
                })}
            </div>

        </div>
    )
}

export default HomePage;
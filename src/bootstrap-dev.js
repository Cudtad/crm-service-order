import Keycloak from 'keycloak-js';
import appSettings from '../appSettings.json';
import AppDev from "./AppDev";
import CommonFunction from "../lib/common";

const keycloak = new Keycloak(appSettings.keycloak);
keycloak.init({
    onLoad: 'login-required'
}).then(authenticated => {
    if (authenticated) {

        // render app into root
        CommonFunction.loadMicroFrontEnd(
            appSettings.container.url,
            appSettings.container.scope,
            appSettings.container.component
        ).then(factory => {
            if (factory && factory.mount && typeof factory.mount === "function") {
                factory.mount({
                    keycloak: keycloak,
                    module: "crm",
                    appSettings: appSettings,
                    hash: 'crm-service-order',
                    app: AppDev,
                    locale: async (lang) => await require(`../locales/${lang}.json`)
                });
            }
        })

        // Token Refresh
        setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
                if (refreshed) {
                    // console.log(Date.now(), 'Token refreshed' + refreshed);
                } else {
                    // console.log('Token not refreshed, valid for ' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
                }
            }).catch(() => {
                console.log('Failed to refresh token');
            });
        }, 60000)
    }
});
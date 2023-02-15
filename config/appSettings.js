import localAppSettings from '../appSettings.json';

const appSettings = localAppSettings;
export default appSettings;

function applyAppSettings(baseAppSettings) {
    [
        baseAppSettings?.mfeShareSettings,
        baseAppSettings?.mfeCustomizeSettings?.ui_crm_service_order
    ].forEach(cfg => {
        if (cfg) {
            for (let prop in cfg) {
                appSettings[prop] = cfg[prop]
            }
        }
    })
    return appSettings;
}
export { applyAppSettings } 

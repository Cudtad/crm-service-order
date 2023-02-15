import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { applyAppSettings } from 'appSettings';

const App = lazy(() => import('./App'));
var __root = null;

// Mount function to start up the app
const mount = async (el, props) => {
    if (!__root) {
        __root = createRoot(el);
    }

    const localeJson = await require(`../locales/${window.app_context && window.app_context.lang ? window.app_context.lang : 'vi'}.json`);
    window.app_context.CommonFunction.registLocale(localeJson);

    // apply app settings
    if (props.appSettings) {
        applyAppSettings(props.appSettings);
    }

    __root.render(
        <Suspense>
            <App {...props}></App>
        </Suspense>
    );
}

// we are running through container and we should export the mount function
export { mount };

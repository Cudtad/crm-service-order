import React, {lazy,Suspense} from 'react';
const App = lazy(() => import('./App'));

export default function AppDev(props) {
    return (
    <Suspense fallback={null}>
      <App {...props} />
    </Suspense>)
}

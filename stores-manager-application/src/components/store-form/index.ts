import { lazy } from 'react';

const StoreForm = lazy(
  () => import('./store-form' /* webpackChunkName: "store-form" */)
);

export default StoreForm;

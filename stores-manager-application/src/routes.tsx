import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import StoreList from './components/store-list';

const ApplicationRoutes = () => {
  const match = useRouteMatch();

  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route path={match.path}>
          <StoreList />
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;

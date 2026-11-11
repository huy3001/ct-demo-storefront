import { useMemo, useState } from 'react';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useShowApiErrorNotification,
  useShowNotification,
  type TApiErrorNotificationOptions,
} from '@commercetools-frontend/actions-global';
import { ConfirmationDialog } from '@commercetools-frontend/application-components';
import {
  ApplicationPageTitle,
  SuspendedRoute,
} from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import { usePaginationState } from '@commercetools-uikit/hooks';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { PERMISSIONS } from '../../constants';
import { getErrorMessage, getStoreName } from '../../helpers';
import {
  useStoreChannelDeleter,
  useStoreChannelsFetcher,
} from '../../hooks/use-store-gql';
import type { TStore } from '../../types';
import StoreForm from '../store-form';

const columns = [
  { key: 'name', label: 'Store Name' },
  { key: 'key', label: 'Store Code' },
  { key: 'roles', label: 'Roles' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'actions', label: 'Actions' },
];

const formatRole = (role: string) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

const StoreList = () => {
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const [searchTerm, setSearchTerm] = useState('');
  const [storeToDelete, setStoreToDelete] = useState<TStore | null>(null);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const { stores, error, loading } = useStoreChannelsFetcher();
  const deleter = useStoreChannelDeleter();

  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter(
      (store) =>
        store.key.toLowerCase().includes(term) ||
        Object.values(store.name).some((name) =>
          name.toLowerCase().includes(term)
        )
    );
  }, [stores, searchTerm]);

  const rows = useMemo(
    () =>
      filteredStores.slice(
        (page.value - 1) * perPage.value,
        page.value * perPage.value
      ),
    [filteredStores, page.value, perPage.value]
  );

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    try {
      await deleter.execute(storeToDelete);
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: 'Store deleted',
      });
    } catch (deleteError) {
      showApiErrorNotification({
        errors: (Array.isArray(deleteError)
          ? deleteError
          : [deleteError]) as TApiErrorNotificationOptions['errors'],
      });
    } finally {
      setStoreToDelete(null);
    }
  };

  return (
    <>
      <ApplicationPageTitle additionalParts={['Stores']} />
      <Spacings.Stack scale="xl">
        <Spacings.Inline alignItems="center" justifyContent="space-between">
          <Spacings.Stack scale="xs">
            <Text.Headline as="h1">Stores Management</Text.Headline>
            <Text.Body>
              Manage physical stores backed by inventory supply channels.
            </Text.Body>
          </Spacings.Stack>
          {canManage && (
            <PrimaryButton
              label="Add New Store"
              onClick={() => push(`${match.url}/new`)}
            />
          )}
        </Spacings.Inline>

        <Constraints.Horizontal max={9}>
          <SearchTextInput
            value={searchTerm}
            placeholder="Filter by store name or key"
            onSubmit={(value) => {
              setSearchTerm(value);
              page.onChange(1);
            }}
            onReset={() => {
              setSearchTerm('');
              page.onChange(1);
            }}
          />
        </Constraints.Horizontal>

        {error && (
          <ContentNotification type="error">
            <Text.Body>{getErrorMessage(error)}</Text.Body>
          </ContentNotification>
        )}
        {loading && stores.length === 0 && <LoadingSpinner />}

        {!error && !(loading && stores.length === 0) && (
          <Spacings.Stack scale="l">
            {filteredStores.length === 0 ? (
              <Text.Body>No stores found.</Text.Body>
            ) : (
              <>
                <DataTable<TStore>
                  isCondensed
                  columns={columns}
                  rows={rows}
                  verticalCellAlignment="center"
                  itemRenderer={(store, column) => {
                    switch (column.key) {
                      case 'name':
                        return (
                          getStoreName(
                            store.name,
                            dataLocale,
                            projectLanguages
                          ) || NO_VALUE_FALLBACK
                        );
                      case 'key':
                        return store.key;
                      case 'roles':
                        return store.roles.map(formatRole).join(', ');
                      case 'phoneNumber':
                        return store.phoneNumber || NO_VALUE_FALLBACK;
                      case 'actions':
                        return (
                          <Spacings.Inline scale="s">
                            <SecondaryButton
                              size="20"
                              label="Edit"
                              onClick={() => push(`${match.url}/${store.id}`)}
                            />
                            <SecondaryButton
                              size="20"
                              label="Delete"
                              isDisabled={!canManage}
                              onClick={() => setStoreToDelete(store)}
                            />
                          </Spacings.Inline>
                        );
                      default:
                        return null;
                    }
                  }}
                />
                <Pagination
                  page={page.value}
                  onPageChange={page.onChange}
                  perPage={perPage.value}
                  onPerPageChange={perPage.onChange}
                  totalItems={filteredStores.length}
                  perPageRange="s"
                />
              </>
            )}
          </Spacings.Stack>
        )}

        <Switch>
          <SuspendedRoute path={`${match.url}/new`}>
            <StoreForm onClose={() => push(match.url)} />
          </SuspendedRoute>
          <SuspendedRoute path={`${match.url}/:id`}>
            <StoreForm onClose={() => push(match.url)} />
          </SuspendedRoute>
        </Switch>
      </Spacings.Stack>

      <ConfirmationDialog
        title="Delete store"
        isOpen={storeToDelete !== null}
        onClose={() => setStoreToDelete(null)}
        onCancel={() => setStoreToDelete(null)}
        onConfirm={confirmDelete}
        labelPrimary="Delete"
        labelSecondary="Cancel"
        isPrimaryButtonDisabled={deleter.loading}
      >
        <Text.Body>
          {`Delete store "${
            storeToDelete?.key ?? ''
          }" permanently? This cannot be undone.`}
        </Text.Body>
      </ConfirmationDialog>
    </>
  );
};
StoreList.displayName = 'StoreList';

export default StoreList;

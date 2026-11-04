/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import { useMemo } from 'react';
import type { ApolloError } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  buildCreateDraft,
  buildUpdateActions,
  channelToStore,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import type {
  TCreateStoreChannelMutation,
  TCreateStoreChannelMutationVariables,
  TDeleteStoreChannelMutation,
  TDeleteStoreChannelMutationVariables,
  TFetchStoreChannelQuery,
  TFetchStoreChannelQueryVariables,
  TFetchStoreChannelsQuery,
  TFetchStoreChannelsQueryVariables,
  TStore,
  TStoreFormValues,
  TUpdateStoreChannelMutation,
  TUpdateStoreChannelMutationVariables,
} from '../../types';
import CreateStoreChannelMutation from './create-store-channel.ctp.graphql';
import DeleteStoreChannelMutation from './delete-store-channel.ctp.graphql';
import FetchStoreChannelQuery from './fetch-store-channel.ctp.graphql';
import FetchStoreChannelsQuery from './fetch-store-channels.ctp.graphql';
import UpdateStoreChannelMutation from './update-store-channel.ctp.graphql';

const context = { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM };

// The Platform API returns at most 500 results per request
const MAX_STORES = 500;

const REFETCH_QUERIES = ['FetchStoreChannels', 'FetchStoreChannel'];

export const useStoreChannelsFetcher = () => {
  const { data, error, loading } = useMcQuery<
    TFetchStoreChannelsQuery,
    TFetchStoreChannelsQueryVariables
  >(FetchStoreChannelsQuery, {
    variables: { limit: MAX_STORES, offset: 0, sort: ['key asc'] },
    context,
    fetchPolicy: 'cache-and-network',
  });

  const stores = useMemo<TStore[]>(
    () => (data?.channels.results ?? []).map(channelToStore),
    [data]
  );

  return {
    stores,
    total: data?.channels.total ?? 0,
    error: error as ApolloError | undefined,
    loading,
  };
};

export const useStoreChannelFetcher = (id?: string) => {
  const { data, error, loading } = useMcQuery<
    TFetchStoreChannelQuery,
    TFetchStoreChannelQueryVariables
  >(FetchStoreChannelQuery, {
    variables: { id: id ?? '' },
    context,
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const store = useMemo<TStore | null | undefined>(
    () => (data?.channel ? channelToStore(data.channel) : data?.channel),
    [data]
  );

  return { store, error: error as ApolloError | undefined, loading };
};

export const useStoreChannelCreator = () => {
  const [createChannel, { loading }] = useMcMutation<
    TCreateStoreChannelMutation,
    TCreateStoreChannelMutationVariables
  >(CreateStoreChannelMutation);

  const execute = async (values: TStoreFormValues) => {
    try {
      return await createChannel({
        context,
        variables: { draft: buildCreateDraft(values) },
        refetchQueries: REFETCH_QUERIES,
        awaitRefetchQueries: true,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { execute, loading };
};

export const useStoreChannelUpdater = () => {
  const [updateChannel, { loading }] = useMcMutation<
    TUpdateStoreChannelMutation,
    TUpdateStoreChannelMutationVariables
  >(UpdateStoreChannelMutation);

  const execute = async ({
    store,
    values,
    originalValues,
  }: {
    store: TStore;
    values: TStoreFormValues;
    originalValues: TStoreFormValues;
  }) => {
    const actions = buildUpdateActions(store, values, originalValues);
    if (actions.length === 0) return undefined;
    try {
      return await updateChannel({
        context,
        variables: { id: store.id, version: store.version, actions },
        refetchQueries: REFETCH_QUERIES,
        awaitRefetchQueries: true,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { execute, loading };
};

export const useStoreChannelDeleter = () => {
  const [deleteChannel, { loading }] = useMcMutation<
    TDeleteStoreChannelMutation,
    TDeleteStoreChannelMutationVariables
  >(DeleteStoreChannelMutation);

  const execute = async (store: TStore) => {
    try {
      return await deleteChannel({
        context,
        variables: { id: store.id, version: store.version },
        refetchQueries: REFETCH_QUERIES,
        awaitRefetchQueries: true,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { execute, loading };
};

import { gql } from 'graphql-tag';
import { GraphQLClient } from 'graphql-request';

import { getOneOption } from '@commons/options';

import type { DeepNonNullable, DeepRequired } from '../typeUtils';
import { pontoonGraphQL } from '../apiEndpoints';
import type {
  GetProjectsInfoQuery,
  GetTeamsInfoQuery,
} from '../../generated/pontoon.graphql';
import { getSdk } from '../../generated/pontoon.graphql';

const _getTeamsInfoQuery = gql`
  query getTeamsInfo {
    locales {
      code
      name
      approvedStrings
      pretranslatedStrings
      stringsWithWarnings
      stringsWithErrors
      missingStrings
      unreviewedStrings
      totalStrings
    }
  }
`;

interface GetTeamsInfoResponse {
  locales: DeepRequired<DeepNonNullable<GetTeamsInfoQuery['locales']>>;
}

const _getProjectsInfoQuery = gql`
  query getProjectsInfo {
    projects {
      slug
      name
    }
  }
`;

export interface GetProjectsInfoResponse {
  projects: DeepRequired<DeepNonNullable<GetProjectsInfoQuery['projects']>>;
}

function getGraphQLClient(pontoonBaseUrl: string) {
  return getSdk(
    new GraphQLClient(pontoonGraphQL(pontoonBaseUrl), {
      method: 'GET',
    }),
  );
}

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}

export const pontoonGraphqlClient = {
  getTeamsInfo: async (): Promise<GetTeamsInfoResponse> => {
    const client = getGraphQLClient(await getPontoonBaseUrl());
    return (await client.getTeamsInfo()) as GetTeamsInfoResponse;
  },
  getProjectsInfo: async (): Promise<GetProjectsInfoResponse> => {
    const client = getGraphQLClient(await getPontoonBaseUrl());
    return (await client.getProjectsInfo()) as GetProjectsInfoResponse;
  },
};

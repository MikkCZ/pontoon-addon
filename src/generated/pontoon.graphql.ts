import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type DjangoDebug = {
  __typename?: 'DjangoDebug';
  sql?: Maybe<Array<Maybe<DjangoDebugSql>>>;
};

export type DjangoDebugSql = {
  __typename?: 'DjangoDebugSQL';
  alias: Scalars['String']['output'];
  duration: Scalars['Float']['output'];
  encoding?: Maybe<Scalars['String']['output']>;
  isSelect: Scalars['Boolean']['output'];
  isSlow: Scalars['Boolean']['output'];
  isoLevel?: Maybe<Scalars['String']['output']>;
  params: Scalars['String']['output'];
  rawSql: Scalars['String']['output'];
  sql?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['Float']['output'];
  stopTime: Scalars['Float']['output'];
  transId?: Maybe<Scalars['String']['output']>;
  transStatus?: Maybe<Scalars['String']['output']>;
  vendor: Scalars['String']['output'];
};

export type Locale = {
  __typename?: 'Locale';
  approvedStrings: Scalars['Int']['output'];
  cldrPlurals: Scalars['String']['output'];
  code: Scalars['String']['output'];
  complete?: Maybe<Scalars['Boolean']['output']>;
  direction: LocaleDirection;
  googleTranslateCode: Scalars['String']['output'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']['output']>;
  msTerminologyCode: Scalars['String']['output'];
  msTranslatorCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  pluralRule: Scalars['String']['output'];
  population: Scalars['Int']['output'];
  pretranslatedStrings: Scalars['Int']['output'];
  script: Scalars['String']['output'];
  stringsWithErrors: Scalars['Int']['output'];
  stringsWithWarnings: Scalars['Int']['output'];
  systranTranslateCode: Scalars['String']['output'];
  totalStrings: Scalars['Int']['output'];
  unreviewedStrings: Scalars['Int']['output'];
};


export type LocaleLocalizationsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  includeSystem?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum LocaleDirection {
  Ltr = 'LTR',
  Rtl = 'RTL'
}

export type Project = {
  __typename?: 'Project';
  approvedStrings: Scalars['Int']['output'];
  complete?: Maybe<Scalars['Boolean']['output']>;
  deadline?: Maybe<Scalars['Date']['output']>;
  disabled: Scalars['Boolean']['output'];
  info: Scalars['String']['output'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  pretranslatedStrings: Scalars['Int']['output'];
  pretranslationEnabled: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  stringsWithErrors: Scalars['Int']['output'];
  stringsWithWarnings: Scalars['Int']['output'];
  syncDisabled: Scalars['Boolean']['output'];
  systemProject: Scalars['Boolean']['output'];
  tags?: Maybe<Array<Maybe<Tag>>>;
  totalStrings: Scalars['Int']['output'];
  unreviewedStrings: Scalars['Int']['output'];
  visibility: Scalars['String']['output'];
};

export type ProjectLocale = {
  __typename?: 'ProjectLocale';
  approvedStrings: Scalars['Int']['output'];
  complete?: Maybe<Scalars['Boolean']['output']>;
  locale: Locale;
  missingStrings?: Maybe<Scalars['Int']['output']>;
  pretranslatedStrings: Scalars['Int']['output'];
  project: Project;
  stringsWithErrors: Scalars['Int']['output'];
  stringsWithWarnings: Scalars['Int']['output'];
  totalStrings: Scalars['Int']['output'];
  unreviewedStrings: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  locale?: Maybe<Locale>;
  locales?: Maybe<Array<Maybe<Locale>>>;
  project?: Maybe<Project>;
  projects?: Maybe<Array<Maybe<Project>>>;
};


export type QueryLocaleArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  includeSystem?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Tag = {
  __typename?: 'Tag';
  name: Scalars['String']['output'];
  priority?: Maybe<Scalars['Int']['output']>;
  slug: Scalars['String']['output'];
};

export type GetTeamsInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsInfoQuery = { __typename?: 'Query', locales?: Array<{ __typename?: 'Locale', code: string, name: string, approvedStrings: number, pretranslatedStrings: number, stringsWithWarnings: number, stringsWithErrors: number, missingStrings?: number | null, unreviewedStrings: number, totalStrings: number } | null> | null };

export type GetProjectsInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsInfoQuery = { __typename?: 'Query', projects?: Array<{ __typename?: 'Project', slug: string, name: string } | null> | null };


export const GetTeamsInfoDocument = gql`
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
export const GetProjectsInfoDocument = gql`
    query getProjectsInfo {
  projects {
    slug
    name
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getTeamsInfo(variables?: GetTeamsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetTeamsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTeamsInfoQuery>(GetTeamsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTeamsInfo', 'query');
    },
    getProjectsInfo(variables?: GetProjectsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetProjectsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProjectsInfoQuery>(GetProjectsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProjectsInfo', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
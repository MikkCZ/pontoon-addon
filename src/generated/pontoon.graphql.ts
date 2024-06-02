import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: any; output: any; }
};

/** An enumeration. */
export enum BaseLocaleDirectionChoices {
  /** left-to-right */
  Ltr = 'LTR',
  /** right-to-left */
  Rtl = 'RTL'
}

/** Debugging information for the current query. */
export type DjangoDebug = {
  __typename?: 'DjangoDebug';
  /** Raise exceptions for this API query. */
  exceptions?: Maybe<Array<Maybe<DjangoDebugException>>>;
  /** Executed SQL queries for this API query. */
  sql?: Maybe<Array<Maybe<DjangoDebugSql>>>;
};

/** Represents a single exception raised. */
export type DjangoDebugException = {
  __typename?: 'DjangoDebugException';
  /** The class of the exception */
  excType: Scalars['String']['output'];
  /** The message of the exception */
  message: Scalars['String']['output'];
  /** The stack trace */
  stack: Scalars['String']['output'];
};

/** Represents a single database query made to a Django managed DB. */
export type DjangoDebugSql = {
  __typename?: 'DjangoDebugSQL';
  /** The Django database alias (e.g. 'default'). */
  alias: Scalars['String']['output'];
  /** Duration of this database query in seconds. */
  duration: Scalars['Float']['output'];
  /** Postgres connection encoding if available. */
  encoding?: Maybe<Scalars['String']['output']>;
  /** Whether this database query was a SELECT. */
  isSelect: Scalars['Boolean']['output'];
  /** Whether this database query took more than 10 seconds. */
  isSlow: Scalars['Boolean']['output'];
  /** Postgres isolation level if available. */
  isoLevel?: Maybe<Scalars['String']['output']>;
  /** JSON encoded database query parameters. */
  params: Scalars['String']['output'];
  /** The raw SQL of this query, without params. */
  rawSql: Scalars['String']['output'];
  /** The actual SQL sent to this database. */
  sql?: Maybe<Scalars['String']['output']>;
  /** Start time of this database query. */
  startTime: Scalars['Float']['output'];
  /** Stop time of this database query. */
  stopTime: Scalars['Float']['output'];
  /** Postgres transaction ID if available. */
  transId?: Maybe<Scalars['String']['output']>;
  /** Postgres transaction status if available. */
  transStatus?: Maybe<Scalars['String']['output']>;
  /** The type of database being used (e.g. postrgesql, mysql, sqlite). */
  vendor: Scalars['String']['output'];
};

export type Locale = {
  __typename?: 'Locale';
  approvedStrings: Scalars['Int']['output'];
  /**
   *
   *         A comma separated list of
   *         <a href="http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html">
   *         CLDR plural categories</a>, where 0 represents zero, 1 one, 2 two, 3 few, 4 many, and 5 other.
   *         E.g. 1,5
   *
   */
  cldrPlurals: Scalars['String']['output'];
  code: Scalars['String']['output'];
  complete?: Maybe<Scalars['Boolean']['output']>;
  /**
   *
   *         Writing direction of the script. Set to "right-to-left" if "rtl" value
   *         for the locale script is set to "YES" in
   *         <a href="https://github.com/unicode-cldr/cldr-core/blob/master/scriptMetadata.json">
   *         CLDR scriptMetadata.json</a>.
   *
   */
  direction: BaseLocaleDirectionChoices;
  /**
   *
   *         Google Translate maintains its own list of
   *         <a href="https://translate.google.com/intl/en/about/languages/">
   *         supported locales</a>. Choose a matching locale from the list or leave blank to disable
   *         support for Google Cloud Translation machine translation service.
   *
   */
  googleTranslateCode: Scalars['String']['output'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']['output']>;
  /**
   *
   *         Microsoft Terminology uses language codes that include both the language and
   *         the country/region. Choose a matching locale from the list or leave blank to disable support
   *         for Microsoft terminology:
   *
   *         af-za, am-et, ar-dz, ar-eg, ar-sa, as-in, az-latn-az, be-by, bg-bg, bn-bd, bn-in,
   *         bs-cyrl-ba, bs-latn-ba, ca-es, ca-es-valencia, chr-cher-us, cs-cz, cy-gb, da-dk, de-at,
   *         de-ch, de-de, el-gr, en-au, en-ca, en-gb, en-hk, en-ie, en-in, en-my, en-ng, en-nz, en-ph,
   *         en-pk, en-sg, en-tt, en-us, en-za, es-ar, es-bo, es-cl, es-co, es-cr, es-do, es-ec, es-es,
   *         es-gt, es-hn, es-mx, es-ni, es-pa, es-pe, es-pr, es-py, es-sv, es-us, es-uy, es-ve, et-ee,
   *         eu-es, fa-ir, fi-fi, fil-ph, fo-fo, fr-be, fr-ca, fr-ch, fr-dz, fr-fr, fr-ma, fr-tn,
   *         fuc-latn-sn, ga-ie, gd-gb, gl-es, gu-in, guc-ve, ha-latn-ng, he-il, hi-in, hr-hr, hu-hu,
   *         hy-am, id-id, ig-ng, is-is, it-ch, it-it, iu-latn-ca, ja-jp, ka-ge, kk-kz, km-kh, kn-in,
   *         ko-kr, kok-in, ku-arab-iq, ky-kg, lb-lu, lo-la, lt-lt, lv-lv, mi-nz, mk-mk, ml-in, mn-mn,
   *         mr-in, ms-bn, ms-my, mt-mt, my-mm, nb-no, ne-np, nl-be, nl-nl, nn-no, nso-za, or-in,
   *         pa-arab-pk, pa-in, pl-pl, prs-af, ps-af, pt-br, pt-pt, quc-latn-gt, quz-pe, ro-md, ro-ro,
   *         ru-kz, ru-ru, rw-rw, sd-arab-pk, si-lk, sk-sk, sl-si, sp-xl, sq-al, sr-cyrl-ba, sr-cyrl-rs,
   *         sr-latn-me, sr-latn-rs, sv-se, sw-ke, ta-in, te-in, tg-cyrl-tj, th-th, ti-et, tk-tm, tl-ph,
   *         tn-za, tr-tr, tt-ru, ug-cn, uk-ua, ur-pk, uz-cyrl-uz, uz-latn-uz, vi-vn, wo-sn, xh-za,
   *         yo-ng, zh-cn, zh-hk, zh-sg, zh-tw, zu-za
   *
   */
  msTerminologyCode: Scalars['String']['output'];
  /**
   *
   *         Microsoft Translator maintains its own list of
   *         <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/translator/languages">
   *         supported locales</a>. Choose a matching locale from the list or leave blank to disable
   *         support for Microsoft Translator machine translation service.
   *
   */
  msTranslatorCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /**
   *
   *         Plural rule is part of the plurals header in
   *         <a href="https://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms">
   *         Gettext PO files
   *         </a>,
   *         that follows the <i>plural=</i> string, without the trailing semicolon.
   *         E.g. (n != 1)
   *
   */
  pluralRule: Scalars['String']['output'];
  /**
   *
   *         Number of native speakers. Find locale code in
   *         <a href="https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/territoryInfo.json">CLDR territoryInfo.json</a>
   *         and multiply its "_populationPercent" with the territory "_population".
   *         Repeat if multiple occurrences of locale code exist and sum products.
   *
   */
  population: Scalars['Int']['output'];
  pretranslatedStrings: Scalars['Int']['output'];
  /**
   *
   *         The script used by this locale. Find it in
   *         <a
   *         href="http://www.unicode.org/cldr/charts/latest/supplemental/languages_and_scripts.html">
   *         CLDR Languages and Scripts</a>.
   *
   */
  script: Scalars['String']['output'];
  stringsWithErrors: Scalars['Int']['output'];
  stringsWithWarnings: Scalars['Int']['output'];
  /**
   *
   *         SYSTRAN maintains its own list of
   *         <a href="https://platform.systran.net/index">supported locales</a>.
   *         Choose a matching locale from the list or leave blank to disable
   *         support for SYSTRAN machine translation service.
   *
   */
  systranTranslateCode: Scalars['String']['output'];
  teamDescription: Scalars['String']['output'];
  totalStrings: Scalars['Int']['output'];
  unreviewedStrings: Scalars['Int']['output'];
};


export type LocaleLocalizationsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  includeSystem?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Project = {
  __typename?: 'Project';
  approvedStrings: Scalars['Int']['output'];
  complete?: Maybe<Scalars['Boolean']['output']>;
  deadline?: Maybe<Scalars['Date']['output']>;
  /**
   *
   *         Hide project from the UI and only keep it accessible from the admin.
   *         Disable the project instead of deleting it to keep translation memory
   *         and attributions. Also prevents project from syncing with VCS.
   *
   */
  disabled: Scalars['Boolean']['output'];
  info: Scalars['String']['output'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  pretranslatedStrings: Scalars['Int']['output'];
  /**
   *
   *         Pretranslate project strings using automated sources
   *         like translation memory and machine translation.
   *
   */
  pretranslationEnabled: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  stringsWithErrors: Scalars['Int']['output'];
  stringsWithWarnings: Scalars['Int']['output'];
  /**
   *
   *         Prevent project from syncing with VCS.
   *
   */
  syncDisabled: Scalars['Boolean']['output'];
  /**
   *
   *         System projects are built into Pontoon. They are accessible from the
   *         translate view, but hidden from dashboards.
   *
   */
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
  _debug?: Maybe<DjangoDebug>;
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getTeamsInfo(variables?: GetTeamsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetTeamsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTeamsInfoQuery>(GetTeamsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTeamsInfo', 'query', variables);
    },
    getProjectsInfo(variables?: GetProjectsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetProjectsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProjectsInfoQuery>(GetProjectsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProjectsInfo', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
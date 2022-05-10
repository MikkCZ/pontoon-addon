export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type DjangoDebug = {
  __typename?: 'DjangoDebug';
  sql?: Maybe<Array<Maybe<DjangoDebugSql>>>;
};

export type DjangoDebugSql = {
  __typename?: 'DjangoDebugSQL';
  alias: Scalars['String'];
  duration: Scalars['Float'];
  encoding?: Maybe<Scalars['String']>;
  isSelect: Scalars['Boolean'];
  isSlow: Scalars['Boolean'];
  isoLevel?: Maybe<Scalars['String']>;
  params: Scalars['String'];
  rawSql: Scalars['String'];
  sql?: Maybe<Scalars['String']>;
  startTime: Scalars['Float'];
  stopTime: Scalars['Float'];
  transId?: Maybe<Scalars['String']>;
  transStatus?: Maybe<Scalars['String']>;
  vendor: Scalars['String'];
};

export type Locale = {
  __typename?: 'Locale';
  approvedStrings: Scalars['Int'];
  cldrPlurals: Scalars['String'];
  code: Scalars['String'];
  complete?: Maybe<Scalars['Boolean']>;
  direction: LocaleDirection;
  googleTranslateCode: Scalars['String'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']>;
  msTerminologyCode: Scalars['String'];
  msTranslatorCode: Scalars['String'];
  name: Scalars['String'];
  pluralRule: Scalars['String'];
  population: Scalars['Int'];
  pretranslatedStrings: Scalars['Int'];
  script: Scalars['String'];
  stringsWithErrors: Scalars['Int'];
  stringsWithWarnings: Scalars['Int'];
  systranTranslateCode: Scalars['String'];
  totalStrings: Scalars['Int'];
  unreviewedStrings: Scalars['Int'];
};


export type LocaleLocalizationsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
  includeSystem?: InputMaybe<Scalars['Boolean']>;
};

export enum LocaleDirection {
  Ltr = 'LTR',
  Rtl = 'RTL'
}

export type Project = {
  __typename?: 'Project';
  approvedStrings: Scalars['Int'];
  complete?: Maybe<Scalars['Boolean']>;
  deadline?: Maybe<Scalars['Date']>;
  disabled: Scalars['Boolean'];
  info: Scalars['String'];
  localizations?: Maybe<Array<Maybe<ProjectLocale>>>;
  missingStrings?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  pretranslatedStrings: Scalars['Int'];
  pretranslationEnabled: Scalars['Boolean'];
  priority: Scalars['Int'];
  slug: Scalars['String'];
  stringsWithErrors: Scalars['Int'];
  stringsWithWarnings: Scalars['Int'];
  syncDisabled: Scalars['Boolean'];
  systemProject: Scalars['Boolean'];
  tags?: Maybe<Array<Maybe<Tag>>>;
  totalStrings: Scalars['Int'];
  unreviewedStrings: Scalars['Int'];
  visibility: Scalars['String'];
};

export type ProjectLocale = {
  __typename?: 'ProjectLocale';
  approvedStrings: Scalars['Int'];
  complete?: Maybe<Scalars['Boolean']>;
  locale: Locale;
  missingStrings?: Maybe<Scalars['Int']>;
  pretranslatedStrings: Scalars['Int'];
  project: Project;
  stringsWithErrors: Scalars['Int'];
  stringsWithWarnings: Scalars['Int'];
  totalStrings: Scalars['Int'];
  unreviewedStrings: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  locale?: Maybe<Locale>;
  locales?: Maybe<Array<Maybe<Locale>>>;
  project?: Maybe<Project>;
  projects?: Maybe<Array<Maybe<Project>>>;
};


export type QueryLocaleArgs = {
  code?: InputMaybe<Scalars['String']>;
};


export type QueryProjectArgs = {
  slug?: InputMaybe<Scalars['String']>;
};


export type QueryProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
  includeSystem?: InputMaybe<Scalars['Boolean']>;
};

export type Tag = {
  __typename?: 'Tag';
  name: Scalars['String'];
  priority?: Maybe<Scalars['Int']>;
  slug: Scalars['String'];
};

export interface CloudWorklogAttributes {
  workAttributeId: number;
  value: string;
  type: string;
  key: string;
  name: string;
}

export type CloudWorklogType = {
  self: string;
  tempoWorklogId: number;
  jiraWorklogId: number;
  issue: {
    self: string;
    key: string;
    id: number;
  };
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  startTime: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: {
    self: string;
    accountId: string;
    displayName: string;
  };
  attributes: {
    self: string;
    values: CloudWorklogAttributes[];
  };
};

export enum ServerWorklogTpeEnum {
  'ACCOUNT',
  'BILLABLE_SECONDS',
  'CHECKBOX',
  'DYNAMIC_DROPDOWN',
  'INPUT_FIELD',
  'INPUT_NUMERIC',
  'STATIC_LIST',
}

export type WorklogAttributeType = {
  id: number;
  key: string;
  name: string;
  type: {
    name: string;
    value: ServerWorklogTpeEnum;
    systemType: boolean;
  }[];
  externalUrl: string;
  required: boolean;
  sequence: number;
  staticListValues: {
    id: number;
    name: string;
    value: string;
    removed: boolean;
    sequence: number;
    workAttributeId: number;
  }[];
};
export type ServerWorklogType = {
  self: string;
  timeSpent: string;
  tempoWorklogId: number;
  jiraWorklogId: number;
  issue: {
    [s: string]: any;
    accountKey: string;
    key: string;
    id: number;
  };
  timeSpentSeconds: number;
  billableSeconds: number;
  started: string;
  comment: string;
  dateCreated: string;
  dateUpdated: string;
  originTaskId: number;
  updater: string;
  worker: string;
  originId: number;
  attributes: {
    [s: string]: any;
  };
};

export type Account = {
  id: number | string;
  key: string;
  name: string;
  lead: JiraServerUser;
  leadAvatar: string;
  contact?: JiraServerUser;
  contactAvatar?: string;
  status: string;
  category?: {
    id: number | string;
    key: string;
    name: string;
    categorytype: {
      id: number | string;
      name: string;
      color: string;
    };
  };
  customer?: {
    id: number | string;
    key: string;
    name: string;
  };
  global: boolean;
  monthlybudget?: number | string;
};

export type JiraServerUser = {
  key: string;
  username: string;
  name: string;
  active: boolean;
  emailAddress: string;
  displayName: string;
  avatarUrls?: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  titleI18nKey: string;
  [s: string]: any;
  attributes?: {
    [s: string]: any;
  };
};

export type CloudAccount = {
  self?: string;
  key: string;
  id: number | string;
  name: string;
  status: string;
  global: boolean;
  monthlyBudget?: number | string;
  lead?: {
    self: string;
    accountId: string;
    displayName: string;
    [s: string]: any;
  };
  contact?: {
    self: string;
    accountId: string;
    displayName: string;
    type: string;
    [s: string]: any;
  };
  category?: {
    self: string;
    key: string;
    id: number | string;
    name: string;
    type: {
      name: string;
    };
    [s: string]: any;
  };
  customer?: {
    self: string;
    key: string;
    id: number | string;
    name: string;
  };
  links?: {
    self: string;
    [s: string]: any;
  };
  [s: string]: any;
};

export type CloudAccountUpdateBody = {
  key: string;
  name: string;
  status: string;
  leadAccountId: string;
  contactAccountId?: string;
  externalContactName?: string;
  categoryKey?: string;
  customerKey?: string;
  monthlybudget?: number | string;
  global?: boolean;
};

export type Category = {
  self?: string;
  key: string;
  id: number | string;
  name: string;
  type?: {
    name: string;
  };
  categorytype?: {
    id?: number | string;
    name?: string;
    color?: string;
  };
};

export type CloudCategoryCreateBody = {
  key: string;
  name: string;
  typeName?: string;
};

export type Customers = {
  key: string;
  name: string;
  self?: string;
  id?: number | string;
};

export type Role = {
  self?: string;
  id: number | string;
  name: string;
  default: boolean;
};

export type Program = {
  id: number | string;
  name: string;
  self?: string;
  manager?: {
    name?: string;
    key?: string;
    self?: string;
    avatar?: {
      '48x48': string;
      '24x24': string;
      '16x16': string;
      '32x32': string;
    };
    jiraUser?: boolean;
    accountId?: string;
    displayname: string;
  };
  teams?: [
    {
      self?: string;
      id?: number | string;
      name?: string;
      summary?: string;
      lead?: string;
      program?: string;
      isPublic?: boolean;
      values?: [
        {
          self?: string;
          id: number | string;
          name: string;
        }
      ];
    }
  ];
};

export type TeamServer = {
  id: number | string;
  name: string;
  mission?: string;
  summary?: string;
  lead?: string;
  program?: string;
  teamProgram?: {
    id: number | string;
    name: string;
    manager: {
      key: string;
      displayName: string;
      avatar: {
        property1: string;
        property2: string;
      };
      active: boolean;
    };
  };
  leadUser?: {
    key: string;
    displayName: string;
    avatar: {
      property1: string;
      property2: string;
    };
    active: boolean;
  };
  isPublic: boolean;
};

export type TeamCloud = {
  self?: string;
  id: number | string;
  name: string;
  summary?: string;
  lead?: {
    self: string;
    accountId: string;
    displayName: string;
  };
  program: {
    self: string;
    id: number | string;
    name: string;
  };
  links?: {
    self: string;
  };
  members?: {
    self: string;
  };
  permissions: {
    self?: string;
  };
};

export type CreateCloudTeam = {
  name: string;
  summary?: string;
  leadAccountId?: string;
  programId?: number | string;
};

export type CreateCloudTeamMembers = {
  teamId: number | string;
  accountId: string;
  roleId?: number | string;
  commitmentPercent?: number | string;
  from?: string;
  to?: string;
};

export type ServerTeamMember = {
  id: number | string;
  member?: TeamMemberUserInfo;
  memberBean?: TeamMemberUserInfo;
  membership?: TeamMemberDateInfo;
  membershipBean?: TeamMemberDateInfo;
  showDeactivate: boolean;
};

export type TeamMemberUserInfo = {
  teamMemberId: number | string;
  name: string;
  type?: string;
  avatar?: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  activeInJira: boolean;
  key: string;
  displayname: string;
};

export type TeamMemberDateInfo = {
  id: number | string;
  role?: {
    id: number | string;
    name: string;
    default: boolean;
  };
  dateFrom?: string;
  dateTo?: string;
  dateFromANSI?: string;
  dateToANSI?: string;
  availability?: string;
  teamMemberId: number | string;
  teamId: number | string;
  status?: string;
};

export type ServerTeamLink = {
  id: number | string;
  type: string;
  scopeType: string;
  scope: number | string;
  teamId: number | string;
  teamName: string;
};

export type CloudTeamLink = {
  self: string;
  id: number | string;
  scope: {
    self: string;
    id: number | string;
    type: string;
  };
  team: {
    self: string;
  };
};

export type ServerBoard = {
  id: number | string;
  self: string;
  name: string;
  type: string;
};

export type CloudBoard = {
  id: number | string;
  self?: string;
  name: string;
  type?: string;
  location: {
    projectId: number | string;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI?: string;
    name: string;
  };
};

export type CreateCloudTeamLink = {
  teamId: number | string;
  scopeType: string;
  scopeId: number | string;
};

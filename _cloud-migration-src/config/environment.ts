export interface Environment {
  cloud?: {
    url: string;
    user: string;
    password: string;
  };
  server?: {
    url: string;
    version?: string;
    user: string;
    password: string;
  };
}

export const environment: Environment = {
  server: {
    url: 'http://jira.teamsinspace.com:8080/',
    user: 'admin',
    password: 'Charlie!',
  },
};

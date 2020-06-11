export default `
    type Client {
      id: String
      key: String
      secret: String
      atlassianHost: String
      email: String
      enabled: Boolean
      activeBackups: [String]
      updatedAt: Date
      createdAt: Date
    }
`;

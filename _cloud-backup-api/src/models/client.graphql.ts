export default `
    type Client {
      id: String
      clientKey: String
      publicKey: String
      sharedSecret: String
      atlassianHost: String
      email: String
      enabled: Boolean
      activeBackups: [String]
      updatedAt: Date
      createdAt: Date
    }
`;

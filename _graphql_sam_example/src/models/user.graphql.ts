const user = `
    type User {
        id: String!
        userName: String
        userIcon: String
        email: String
        phone: Float
        orders: [Order]
        createdAt: Date
        updatedAt: Date
    }
    input UserInput {
        id: String!
        userName: String
        userIcon: String
        phone: Float
    }
`;
export default user;

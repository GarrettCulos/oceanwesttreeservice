/**
 * Typescript Type and this type are intentionally different
 * This file has differences
 *  - userId
 */
export default `
    enum OrderChangeEnum {
      add
      update
      remove
    }

    input CreateOrderInput {
        storeId: String!
        items: [OrderItemChangeInput]!
        pickupTime: Date
        comments: [String]
    }

    input OrderItemChangeInput {
        changeType: OrderChangeEnum!
        item: OrderItemInput!
    }

    input OrderItemInput {
        inventoryId: String!
        quantity: Int!
        name: String!
        brand: String
        units: String
    }

    input UpdateOrderInput {
        id: String
        userId: String
        storeId: String
        pickupTime: Date
        items: [OrderItemChangeInput]
        newComments: [String]
    }

    type OrderItem { 
        id: String
        inventoryId: String
        quantity: Int
        name: String
        brand: String
        units: String
        createdAt: Date
        updatedAt: Date
    }

    enum OrderStateEnum {
        open
        submitted
        received
        completed
        closed
    }

    type OrderSearch {
        id: String
        userId: String
        storeId: String
        state: OrderStateEnum
        pickupTime: Date
        createdAt: Date
        updatedAt: Date
        comments: [String]
    }

    type Order {
        id: String
        user: User!
        userId: String
        storeId: String
        store: Store
        items: [OrderItem]!
        pickupTime: Date
        state: OrderStateEnum
        createdAt: Date
        updatedAt: Date
        comments: [String]
    }
`;

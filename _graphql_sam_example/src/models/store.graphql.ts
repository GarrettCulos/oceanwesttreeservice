const StoreProps = `
    id: String
    lat: Int
    long: Int
    geoHash: String
    name: String
    summary: String
    activeState: String
    type: String
    owner: String
    phone: Float
    email: String
    delivery: Boolean
    website: String
    hours: StoreHours
    createdAt: Date
    updatedAt: Date
  `;

const store = `
    type StoreHours { 
      monday: [Int]
      tuesday: [Int]
      wednesday: [Int]
      thursday: [Int]
      friday: [Int]
      saturday: [Int]
      sunday: [Int]
    }

    input StoreHoursInput {
      monday: [Int]!
      tuesday: [Int]!
      wednesday: [Int]!
      thursday: [Int]!
      friday: [Int]!
      saturday: [Int]!
      sunday: [Int]!
    }

    input StoreHoursUpdate {
      monday: [Int]
      tuesday: [Int]
      wednesday: [Int]
      thursday: [Int]
      friday: [Int]
      saturday: [Int]
      sunday: [Int]
    }

    type Store {
      ${StoreProps}
    }

    type StoreWithInventory {
      ${StoreProps}
      inventory: [InventoryItem]
    }

    input StoreInput {
      lat: Int!
      long: Int!
      geoHash: String!
      name: String!
      summary: String!
      type: String!
      owner: String
      phone: Float!
      email: String!
      website: String
      delivery: Boolean
      hours: StoreHoursInput!
    }

    enum StockStatus {
      low
      med
      high
      onOrder
      removed
    }

    type InventoryItem {
      id: String
      name: String
      price: Float
      currency: String
      storeId: String
      description: String
      stockStatus: StockStatus
      isPublic: Boolean
      productSkew: String
      images: [String]
      lowImage: String
      productUrl: String
      createdAt: Date
      updatedAt: Date
    }
    
    input InventoryItemChange {
      id: String
      name: String
      price: Float
      currency: String
      storeId: String
      description: String
      stockStatus: StockStatus
      isPublic: Boolean
      productSkew: String
      images: [String]
      lowImage: String
      productUrl: String
    }

    enum ChangeEnum {
      add
      update
      remove
    }

    input InventoryChange {
      change: ChangeEnum,
      item: InventoryItemChange
    }

    input StoreUpdate {
      lat: Int
      long: Int
      geoHash: String
      name: String
      summary: String
      type: String
      owner: String
      phone: Float
      email: String
      website: String
      delivery: Boolean
      hours: StoreHoursUpdate
      inventory: [InventoryChange]
    }
`;
export default store;

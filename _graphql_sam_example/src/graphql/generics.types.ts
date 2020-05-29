import OrderSchema from '../models/user.order.graphql';
import UserSchema from '../models/user.graphql';
import StoreSchema from '../models/store.graphql';

export default `
    scalar Date

    scalar JSON
    
    ${StoreSchema}
    
    ${OrderSchema}
    
    ${UserSchema}
    
`;

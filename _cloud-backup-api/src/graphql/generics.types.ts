import ClientSchema from '../models/client.graphql';

export default `
    scalar Date

    scalar JSON
    
    ${ClientSchema}
    
`;

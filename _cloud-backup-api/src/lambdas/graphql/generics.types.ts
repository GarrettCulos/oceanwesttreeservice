import BackupSchema from '../../models/backup.graphql';
import ClientSchema from '../../models/client.graphql';

export default `
    scalar Date

    scalar JSON
    
    ${ClientSchema}

    ${BackupSchema}
    
`;

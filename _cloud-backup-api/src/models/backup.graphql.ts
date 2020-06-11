export default `    
    enum BackupStateEnum {
      Pending
      Completed
      Errored
    }

    type Backup {
      id: String
      clientId: String
      backupDate: Date
      state: BackupStateEnum
      withAttachments: Boolean
      s3Location: String
      updatedAt: Date
      createdAt: Date
    }
`;

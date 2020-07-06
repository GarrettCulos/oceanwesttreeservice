## Install Instructions

- Install SAM cli
- - brew tap aws/tap
- - brew install aws-sam-cli
- Install AWS cli
- - `curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"`
- - `sudo installer -pkg AWSCLIV2.pkg -target /`
- - https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html#cliv2-mac-install-cmd
- `nvm use 13` Use the latest node package
- `npm install`
- `docker-compose up`

In a new window (if its the first time starting the dynamodb container) seed it with this command

- `npm run cra.seed.dynamodb`

The graphql endpoint will be available at `localhost:9001/graphql` Changes to the code will cause a rebuild within the node container.

You may want to change the polling setting in the console to make the api logging easier to read.

### deving add-on with api (local)

Developing an add-on locally requires you run a tunnel exposing your api instance (api and file server) to the internet; which is done using ngrok.

The Docker Compose file build and servers the addon from `cloud-backup-add-on/build`. Continuing from the first installation instructions.

- `node _cloud-backup-api/scripts/ngrok-docker`
- Go into the `_cloud-backup-add-on/build` and edit the atlassian-connect.json file so the baseUrl references use the ngrok tunnel url (found in the output of the previouse step).
- Install the add-on using the updated atlassian-connect.json file.
- Once initial installation is done, you can rebuild the add-on to see the corresponding chnages within the atlassian instance (after refresh)

TODO: Adding a watch build to /build to automatically rebuild when a change happens would save alot of time.

# testing deployment

`brew tap aws/tap`
`brew install aws-sam-cli`

then `npm run build.serverless && npm run aws.sam.pack`

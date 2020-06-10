## Install Instructions

- `nvm use 13` Use the latest node package
- `npm install`
- `docker-compose up`

In a new window (if its the first time starting the dynamodb container) seed it with this command

- `npm run seed.dynamodb`

The graphql endpoint will be available at `localhost:8080/graphql` Changes to the code will cause a rebuild within the node container.

You may want to change the polling setting in the console to make the api logging easier to read.

# testing deployment

`brew tap aws/tap`
`brew install aws-sam-cli`

then `npm run build.serverless && npm run aws.sam.pack`

## Theme colors

https://codepen.io/pen/?&editable=true=https%3A%2F%2Fmaterial.io%2Fresources%2Fcolor%2F

# React TS Starter - for cloud Add-ons

This seed project provides a basic React TS environment leveraging storybook, prettier, jest, and eslint to enhance the development experience.

Commands for packaging and deploying addons can be found within the `package.json` file.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Setup

Run the following

```
   npm install -g create-react-app
   npm install
   npm run start
```

# Cloud Addon Overview and Limitations

This is NOT a PWA. There a certain criteria around SEO we should not follow for JIRA Cloud Add-ons.

Notes/Gotchas:

- Within the atlassian-connect.json, the scopes property cannot have `project_admin` or `space_admin`. It causes the AP.request to break (https://community.developer.atlassian.com/t/500-internal-server-error-confluence-cloud-rest-api-call/7693/9).

---

---

# Scripts

#### `npm run start`

> This command will run the app in developer mode at [http://localhost:3000](http://localhost:3000), or if that port isn't available, the next one. When changes are made to the code, the browser will reload.

#### `npm run test`

> This will run the test suite and generate the coverage report

#### `npm run test.watch`

> This will run the test suite in watch mode (coverage will not be generated)

#### `npm run storybook`

> This will run the storybook program. Letting you develop and view the components registered at the port specified.

#### `npm run local.serve [port]`

> This command will run a local server out of the [port], setup ngrok tunnel, and create the specific atlassian-connect.json for that ngrok url (from the atlassian-connect.json in the root)
> The atlassian-connect.json in the root must have <% BASE_URL %> wherever the ngrok url wants to be placed.
> You can now user the exposed url to install the locally running application. (not working in dev mode, you will have to rebuild the app to update atlassian page)

---

---

# Recommended Readings

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To read a story about StoryBook, check [Docs here](https://storybook.js.org/docs/basics/introduction/).

Testing is super important, see [Jest Docs](https://jestjs.io/docs/en/getting-started) and [Enzyme Docs](https://airbnb.io/enzyme/docs/guides/jest.html)

Read about the latest fashion with [StyledComponents](https://www.styled-components.com/docs) (Thats a `sass`y joke)

[JIRA CLOUD DOCS !!!](https://developer.atlassian.com/cloud/jira/platform/integrating-with-jira-cloud/)

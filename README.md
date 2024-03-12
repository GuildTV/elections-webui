# Guild Elections Graphics WebUI

This is the controller for the Guild Elections graphics package https://github.com/GuildTV/elections-gfx

## Installation

### Configuration

You can change various elements of the website from the config.js file.

```javascript
export const webui_port = 8080;
```

### Setup

#### Webui

-   `cd webui`
-   `yarn install`
-   `yarn dist` or `yarn dev` to run in dev mode

#### Server

-   run mysql server
-   copy `sequelize.json.example` to `sequelize.json` and setup details for mysql access

-   `yarn install`
-   if using a fresh db, setup the database tables (TODO: how?)
-   `yarn start` or `yarn dev` to run in dev mode

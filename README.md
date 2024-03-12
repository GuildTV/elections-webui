# Guild Elections Graphics WebUI

This is the controller for the Guild Elections graphics package https://github.com/GuildTV/elections-gfx

## Installation

### Configuration

You can configure the application by copying `.env.example` to `.env` and modifying the contents

### Setup

-   `yarn install`

-   run mysql server
-   copy `sequelize.json.example` to `sequelize.json` and setup details for mysql access
-   `yarn migrate` to run migrations to setup the database

To build for production:

-   `yarn dist`
-   `yarn start` to launch it

To run in dev mode

-   `yarn dev` for backend
-   `yarn dev:webui` for webui

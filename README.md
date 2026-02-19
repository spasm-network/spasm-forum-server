# Spasm Forum server

spasm-forum-server is a backend for a [Spasm-powered](https://github.com/spasm-network/spasm.js) forum.

spasm-forum-web repository can be found [here](https://github.com/spasm-network/spasm-forum-web).

## Server setup

If you don't have any experience at setting up a server, then there is a beginner-friendly guide with scripts for an automated [initial server setup](https://github.com/spasm-network/spasm-forum-scripts).


## Postgres database

### Setup

By default, user `postgres` doesn't have a password on Ubuntu, so the backend will fail to connect due to a wrong password and it's generally not a good idea to use a default `postgres` user with superuser privileges for the app. The solution is to create a new user with a password, but without privileges, e.g.:

```
sudo su - postgres
psql
CREATE USER dbuser WITH PASSWORD 'dbuser';
CREATE DATABASE spasm_database WITH OWNER = dbuser;
CREATE DATABASE spasm_database_test WITH OWNER = dbuser;
exit
exit
```

Note: make sure to use a strong password and add it to `.env`.

```
nano .env
```

Example:

```
POSTGRES_PASSWORD=dbuser
POSTGRES_USER=dbuser
```

To create all tables in a new database, execute the code from `database.sql`.

Note: skip lines `CREATE DATABASE spasm_database;` and `CREATE DATABASE spasm_database_test;` because we've already created databases in the step above.

```
sudo su - postgres
psql -h localhost -d spasm_database -U dbuser -p 5432
DO $$
BEGIN
    -- V1
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'posts'
    ) THEN
        CREATE TABLE posts (
...
```

Note: table `posts` is not necessary if you disable web2 posts. However, it's suggested to create table `posts` to avoid any errors.

Alternatively, you can use scripts `npm run initialize-db` or `npm run migrate`, which will attempt to create new main and test databases, as well as all the necessary tables and indices.

However, these scripts require a database user to have a privilege to create a new database. If your database user doesn't have that privilege, then you can grant it by executing the following SQL command from a superuser:

```
ALTER USER your_username CREATEDB;
```

Once your database user has a privilege to create new databases, you can run scripts `npm run initialize-db` or `npm run migrate` again.

### Tables

##### Tables V2

Table `spasm_events` contains all signed user-generated events and unsigned web2 posts (RSS).

##### Tables V1

Table `posts` contains web2 posts (not signed with any private key), usually fetched from RSS sources.

Table `actions` contains all web3 actions that are signed with a private key.

Table `actions_count` contains the number of reactions received by the target action from other actions on this server.

## Install

*Note: nvm and npm should already be installed if you've used scripts for an automated [initial server setup](https://github.com/spasm-network/spasm-forum-scripts).*

```
# update npm
npm install -g npm

# install nvm to manage node versions
# https://github.com/nvm-sh/nvm

# install node v20
nvm install 20

# set node v20 as default
nvm alias default 20

# switch to node v20
nvm use 20

# update npm
npm install -g npm

# install packages
npm ci
```

---

## Download the app

Download the app from the Github into the `backend/` folder.

*Note: the app should already be downloaded if you've used scripts for an automated [initial server setup](https://github.com/spasm-network/spasm-forum-scripts).*

```
git clone https://github.com/spasm-network/spasm-forum-server.git backend/
cd backend/
```

---

## Environment

Create default `.env` file, see example `.env.example`.

```
cp .env.example .env
```

#### Admin panel

Some settings (social media links, lists of moderators, short URLs,
different whitelists) can be changed via a web page without
restarting a server.

An admin panel can be accessed through [spasm-forum-web](https://github.com/spasm-network/spasm-forum-web).
Usually, at `https://example.com/admin`
or by clicking on an 'admin' button at the bottom menu bar after
connecting an admin public key (address).

Make sure that an admin panel and app config changes are enabled
and admin addresses are listed in `.env` files in **both** frontend
(spasm-forum-web) and backend (spasm-forum-server).

```
ENABLE_APP_CONFIG_CHANGES=true
ENABLE_APP_CONFIG_CHANGES_BY_ADMIN=true
# Separate admin addresses with comma
ENABLE_ADMIN=true
ADMINS=""
```


## Test locally

*Note: this is an optional step intended for developers.
You can skip this step if you want to run a Spasm forum.*

Install npm packages in the backend folder.

```
npm ci
```

Start the app.

```
npm run dev
```

Open a browser and test API at `localhost:5000/api/events`.

*Note: You should get `null` or empty array `[]` if your database is empty*

## Run production

Run with pm2

```
# Install pm2
npm i pm2 -g

# To make sure app starts after reboot
pm2 startup

# Run the app
npm run prod

# Freeze a process list on reboot
pm2 save

# Check processes
pm2 list
```

## Troubleshooting

#### Database permission denied

If you get `permission denied` errors accessing your database like:

```
error: permission denied for table app_configs
error: permission denied for table spasm_events
insertSpasmEventV2 failed error: permission denied for sequence spasm_events_db_key_seq
```

Then execute the following commands:

```
sudo su - postgres
psql
```

```
-- First, grant permissions on all existing sequences
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dbuser;
-- Then, set default permissions for future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dbuser;
-- Grant privileges on all sequences in the schema
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO dbuser;
```

## API Documentation

- **Human docs**: See [docs/api.md](./docs/api.md) for detailed endpoint descriptions and examples.
- **AI guidance**: See [AGENTS.md](./AGENTS.md) for machine-readable instructions and conventions.

## Contact

Send a message to `degenrocket` on [Session](https://getsession.org) if you need any help.


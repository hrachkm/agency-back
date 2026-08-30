## Project setup

```bash
$ yarn install
```

## Database

```bash
# run container
$ docker compose up -d

# credentials
'See docker-compose.yml file and get the database credentials, use table plus instead of pgAdmin'

```

## Migrations

```bash
# run migrations
$ yarn migration:run

# generate migrations
$ yarn migration:generate src/database/migrations/{migration name}

# revert last migration
$ yarn migration:revert
```

## Go to API docs

```bash
# url
$ http://localhost:3100/api/docs
```

## Create sample data

```bash
# url
$ http://localhost:3100/seed
```

## Compile and run the project

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Project setup

```bash
$ yarn install
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

## Compile and run the project

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Run tests

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

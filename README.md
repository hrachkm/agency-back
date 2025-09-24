## Project setup

```bash
$ yarn install
```

## Create Https and ssl certifications
```bash
#Create a folder named cert
mkdir cert
cd cert

#Generate private key (in develop)
openssl genrsa -out key.pem 2048

#Generate autosigned certificate (in develop)
openssl req -new -x509 -key key.pem -out cert.pem -days 365
    #You can use this data as example
    - Country Name: AR
    - State or Province Name: Buenos Aires
    - Locality Name: La Plata
    - Organization Name: CodeForge Labs
    - Organizational Unit Name: Backend Team
    - Common Name: dev.codeforge.local
    - Email Address: soporte@codeforge.com

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

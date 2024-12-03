# opendatahub-analytics-v2

Time series analytics web app for Open Data Hub

## Development prerequisites
- Docker installed
- yarn and nodejs installed

## How to run development environment
To start develop copy and paste the `.env.example` to `.env`

### Docker based
To start the development environmnet you just need to run `docker compose up` in the repository folder.  
To clear all when finished you can run `docker compose down -v --rmi local`.

### Localhost based
Run the following: 
- `yarn install` to install the dependencies
- `yarn dev` to start development server
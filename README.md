# User Feedback Deployment

## Requirements

* docker
* docker-compose

## Usage instructions:

- Build && start `docker-compose up -d --build`
- Open demo page: http://localhost:58001/
- Connect to database via psql: `PGPASSWORD=devpass psql -U postgres -h 127.0.0.1 -d core -p5433`

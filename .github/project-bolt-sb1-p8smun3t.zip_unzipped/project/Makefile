.PHONY: up build down logs shell

build:
	docker-compose build

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f backend

shell:
	docker-compose exec backend /bin/bash

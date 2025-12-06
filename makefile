.PHONY: build build-no-cache down run

build:
	docker-compose build

build-no-cache:
	docker-compose build --no-cache

down:
	docker-compose down

run:
	docker-compose up -d
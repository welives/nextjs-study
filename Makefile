.PHONY: start-database
start-database: ## Build the development docker image.
	docker compose -f docker/database.yml --env-file .env.database up --build -d

.PHONY: stop-database
stop-database: ## Build the development docker image.
	docker compose -f docker/database.yml --env-file .env.database down

.PHONY: build-development
build-development: ## Build the development docker image.
	docker compose -f docker/development/compose.yml build

.PHONY: start-development
start-development: ## Start the development docker container.
	docker compose -f docker/development/compose.yml up -d

.PHONY: stop-development
stop-development: ## Stop the development docker container.
	docker compose -f docker/development/compose.yml down

.PHONY: build-production
build-production: ## Build the production docker image.
	docker compose -f docker/production/compose.yml build

.PHONY: start-production
start-production: ## Start the production docker container.
	docker compose -f docker/production/compose.yml up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	docker compose -f docker/production/compose.yml down

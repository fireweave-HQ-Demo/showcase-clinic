COMPOSE_FILE = infra/compose.yml
DEV_COMPOSE = -f infra/compose.yml -f infra/compose.dev.yml
PROFILES = --profile core --profile app --profile agents
PROD = docker compose --env-file .env -f infra/compose.prod.yml

define compose
docker compose --env-file .env --env-file infra/env/$(1).env -f $(COMPOSE_FILE) $(PROFILES)
endef

define compose_dev
docker compose --env-file .env --env-file infra/env/dev.env $(DEV_COMPOSE) $(PROFILES)
endef

.PHONY: up dev seed test e2e down reset observe stage stage-seed stage-down prod prod-seed prod-sim-down prod-up prod-down

# Dev mounts host source and runs tsx watch / next dev so edits sync without rebuild.
up dev:
	$(compose_dev) build api sandbox-ehr browser-runner agent-worker
	$(compose_dev) up -d

seed:
	$(compose_dev) exec -T api pnpm --filter @clinic/api exec tsx src/seed.ts

stage:
	$(call compose,stage) up -d

stage-seed:
	$(call compose,stage) exec -T api pnpm --filter @clinic/api exec tsx src/seed.ts

stage-down:
	$(call compose,stage) down

# Laptop prod simulation (infra/env/prod.env). The EC2 stack is prod-up.
prod:
	$(call compose,prod) up -d

prod-seed:
	$(call compose,prod) exec -T api pnpm --filter @clinic/api exec tsx src/seed.ts

prod-sim-down:
	$(call compose,prod) down

test:
	pnpm test

e2e:
	pnpm exec playwright test

down:
	$(compose_dev) down

reset:
	$(compose_dev) down -v

observe:
	@echo "Dev OpenObserve  http://127.0.0.1:15080  admin@example.com"
	@echo "Stage OpenObserve http://127.0.0.1:25080  admin@example.com"
	@echo "Prod OpenObserve http://127.0.0.1:35080  admin@example.com"
	@echo "Hosted OpenObserve https://cloud.openobserve.ai"
	@echo "Dev live-reloads host edits under apps/ and packages/ (make up)."

prod-up:
	$(PROD) up -d

prod-down:
	$(PROD) down

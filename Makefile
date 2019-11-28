help: ## list make targets
	@awk 'BEGIN { FS = ":.*?## " } /^[a-zA-Z_-]+:.*?## / { sub("\\\\n", sprintf("\n%22c", " "), $$2); printf " %-20s  %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

install: ## install node.js dependencies
	npm install --production

clean: ## remove node.js extraneous dependencies
	npm prune --production

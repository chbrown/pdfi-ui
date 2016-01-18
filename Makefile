BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)

all: $(TYPESCRIPT:%.ts=%.js) build/bundle.js .gitignore

$(BIN)/tsc $(BIN)/webpack:
	npm install

.gitignore: tsconfig.json
	echo $(TYPESCRIPT:%.ts=%.js) | tr ' ' '\n' > $@

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

build/bundle.js: webpack.config.js app.jsx .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	node webpack-dev-server.js

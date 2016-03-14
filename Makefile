BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)

all: $(TYPESCRIPT:%.ts=%.js) build/bundle.js .gitignore

$(BIN)/tsc $(BIN)/webpack:
	npm install

.gitignore: tsconfig.json
	echo $(TYPESCRIPT:%.ts=%.js) | tr ' ' '\n' > $@

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

compile:
	$(BIN)/tsc

build/bundle.js: webpack.config.js app.jsx $(TYPESCRIPT:%.ts=%.js) .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	(\
   NODE_ENV=production $(BIN)/webpack --watch --config webpack.config.js & \
   $(BIN)/tsc --watch & \
   wait)

dev-server:
	(\
   node webpack-dev-server.js & \
   $(BIN)/tsc --watch & \
   wait)

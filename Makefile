BIN := node_modules/.bin

all: graphics.js models.js store.js build/bundle.js

$(BIN)/tsc $(BIN)/webpack:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

build/bundle.js: webpack.config.js app.jsx .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	PORT=7334 node webpack-dev-server.js

BIN := node_modules/.bin

all: build/bundle.js

$(BIN)/tsc $(BIN)/webpack:
	npm install

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

build/bundle.js: webpack.config.js app.jsx .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	PORT=7334 node webpack-dev-server.js

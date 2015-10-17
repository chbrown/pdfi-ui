BIN := node_modules/.bin
DTS := lodash/lodash react/react react/react-addons react-router/react-router react-dom/react-dom redux/redux react-redux/react-redux

all: build/bundle.js
type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)

$(BIN)/watsh $(BIN)/tsc $(BIN)/webpack:
	npm install

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

build/bundle.js: webpack.config.js app.jsx .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	npm run dev

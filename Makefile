# jquery is required for angularjs/angular
DTS := lodash/lodash node/node yargs/yargs virtual-dom/virtual-dom \
	jquery/jquery angularjs/angular angularjs/angular-resource

all: site.css img/favicon.ico app.js bundle.js

%.css: %.less
	lessc $< | cleancss --keep-line-breaks --skip-advanced -o $@

%.js: %.ts type_declarations | node_modules/.bin/tsc
	node_modules/.bin/tsc -m commonjs -t ES5 $<

img/acrobat-%.png: img/acrobat.png
	convert $^ -resize $*x$* $@.tmp
	pngcrush -q $@.tmp $@
	rm $@.tmp

img/favicon.ico: img/acrobat-16.png img/acrobat-32.png
	convert $^ $@

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/chbrown/DefinitelyTyped/master/$* > $@

type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)

bundle.js: app.js | node_modules/.bin/browserify
	node_modules/.bin/browserify app.js -o bundle.js -v

node_modules/.bin/browserify node_modules/.bin/watchify node_modules/.bin/tsc:
	npm install

dev: | node_modules/.bin/browserify node_modules/.bin/watchify
	(node_modules/.bin/tsc -m commonjs -t ES5 -w *.ts & \
   node_modules/.bin/watchify app.js -o build/bundle.js -v & \
   wait)

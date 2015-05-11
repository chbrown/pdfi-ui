# jquery is required for angularjs/angular
DTS := lodash/lodash node/node yargs/yargs virtual-dom/virtual-dom \
	jquery/jquery angularjs/angular angularjs/angular-resource

.PHONY: all type_declarations
all: site.css img/favicon.ico

%.css: %.less
	lessc $< | cleancss --keep-line-breaks --skip-advanced -o $@

%.js: %.ts type_declarations
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

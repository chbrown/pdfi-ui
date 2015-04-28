all: site.css img/favicon.ico
.PHONY: type_declarations

%.css: %.less
	lessc $< | cleancss --keep-line-breaks --skip-advanced -o $@

%.js: %.ts
	node_modules/.bin/tsc -m commonjs -t ES5 $<

img/acrobat-%.png: img/acrobat.png
	convert $^ -resize $*x$* $@.tmp
	pngcrush -q $@.tmp $@
	rm $@.tmp

img/favicon.ico: img/acrobat-16.png img/acrobat-32.png
	convert $^ $@

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

# jquery is required for angularjs/angular.d.ts
D_TS := lodash/lodash.d.ts node/node.d.ts yargs/yargs.d.ts \
	jquery/jquery.d.ts angularjs/angular.d.ts angularjs/angular-resource.d.ts
type_declarations: $(D_TS:%=type_declarations/DefinitelyTyped/%)

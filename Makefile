all: static/lib.min.js static/lib.max.js static/site.css static/components.js

%.css: %.less
	lessc $+ | cleancss --keep-line-breaks --skip-advanced -o $@

%.js: %.jsx
	node_modules/.bin/jsx <$< >$@

%.js: %.ts
	node_modules/.bin/tsc -m commonjs -t ES5 $<

static/lib/%.min.js: | static/lib/%.js
	ng-annotate -a $| | closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET > $@

ANGULAR = angular angular-resource ngStorage angular-ui-router
SCRIPTS = $(ANGULAR)
static/lib.min.js: $(SCRIPTS:%=static/lib/%.min.js)
	closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET --js $+ > $@
static/lib.max.js: $(SCRIPTS:%=static/lib/%.js)
	cat $+ > $@

all: static/lib.min.js static/lib.max.js static/site.css

%.css: %.less
	lessc $+ | cleancss --keep-line-breaks --skip-advanced -o $@

%.js: %.jsx
	jsx <$< >$@

%.js: %.ts
	tsc -m commonjs -t ES5 $<

static/lib/%.min.js: | static/lib/%.js
	ng-annotate -a $| | closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET > $@

SCRIPTS = lodash angular angular-resource ngStorage angular-plugins
static/lib.min.js: $(SCRIPTS:%=static/lib/%.min.js)
	closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET --js $+ > $@
static/lib.max.js: $(SCRIPTS:%=static/lib/%.js)
	cat $+ > $@

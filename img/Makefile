all: favicon.ico

acrobat-%.png: acrobat.png
	convert $^ -resize $*x$* $@.tmp
	pngcrush -q $@.tmp $@
	rm $@.tmp

favicon.ico: acrobat-16.png acrobat-32.png
	convert $^ $@

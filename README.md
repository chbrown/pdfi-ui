# pdfi-ui

User interface for visualizing PDF structure


## Development

    trap 'kill $(jobs -p)' EXIT
    tsc -m commonjs -t ES5 -w *.ts &
    watchify app.js -o bundle.js -v &


## License

Copyright 2015 Christopher Brown. [MIT Licensed](http://opensource.org/licenses/MIT).

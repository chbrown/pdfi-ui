// interfaces
// util / helpers
function px(length, fractionDigits) {
    if (fractionDigits === void 0) { fractionDigits = 3; }
    return length.toFixed(fractionDigits) + 'px';
}
exports.px = px;
function makeBoundsStyle(rectangle) {
    if (rectangle === undefined)
        return undefined;
    return {
        left: px(rectangle.minX, 3),
        top: px(rectangle.minY, 3),
        width: px(rectangle.maxX - rectangle.minX, 3),
        height: px(rectangle.maxY - rectangle.minY, 3),
    };
}
exports.makeBoundsStyle = makeBoundsStyle;
function makeBoundsString(rectangle) {
    if (rectangle === undefined)
        return undefined;
    var dX = rectangle.maxX - rectangle.minX;
    var dY = rectangle.maxY - rectangle.minY;
    return "(" + rectangle.minX.toFixed(3) + "," + rectangle.minY.toFixed(3) + ") (" + dX.toFixed(3) + "x" + dY.toFixed(3) + ")";
}
exports.makeBoundsString = makeBoundsString;

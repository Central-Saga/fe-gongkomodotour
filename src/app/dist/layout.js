"use strict";
exports.__esModule = true;
exports.metadata = void 0;
var google_1 = require("next/font/google");
require("./globals.css");
var inter = google_1.Inter({ subsets: ['latin'] });
exports.metadata = {
    title: 'Gong Komodo Tour & Travel',
    description: 'Jelajahi keindahan Pulau Komodo dan sekitarnya bersama kami'
};
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "id" },
        React.createElement("body", { className: inter.className }, children)));
}
exports["default"] = RootLayout;

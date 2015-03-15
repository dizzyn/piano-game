;
"use strict"; // jshint ;_;

var generateTones = function (arr) {
    var tones = ["a", "a-sharp", "b", "c", "c-sharp", "d", "d-sharp", "e", "f", "f-sharp", "g", "g-sharp"]
    var newArr = [tones[Math.floor(Math.random() * tones.length)]];
    return arr.concat(newArr);
};

var keyRefs = [
    {
        id: -9,
        name: "c",
        color: "white"
    },
    {
        id: -8,
        name: "c-sharp",
        color: "black"
    },
    {
        id: -7,
        name: "d",
        color: "white"
    },
    {
        id: -6,
        name: "d-sharp",
        color: "black"
    },
    {
        id: -5,
        name: "e",
        color: "white"
    },
    {
        id: -4,
        name: "f",
        color: "white"
    },
    {
        id: -3,
        name: "f-sharp",
        color: "black"
    },
    {
        id: -2,
        name: "g",
        color: "white"
    },
    {
        id: -1,
        name: "g-sharp",
        color: "black"
    },
    {
        id: 0,
        name: "a",
        color: "white"
    },
    {
        id: 1,
        name: "a-sharp",
        color: "black"
    },
    {
        id: 2,
        name: "b",
        color: "white"
    }
];
$(function () {

    var AppRouter = Backbone.Router.extend({
        routes: {
            "*actions": "memoryRoute"
        }
    });

    // Initiate the router
    var app_router = new AppRouter;
    app_router.on('route:memoryRoute', function (actions) {
        var gameView = new GameView({el: $("#app-container")});
    });



    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
});


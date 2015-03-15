;
"use strict"; // jshint ;_;

$(function () {

    var AppRouter = Backbone.Router.extend({
        routes: {
            "*actions": "gameRoute"
        }
    });

    // Initiate the router
    var app_router = new AppRouter;
    app_router.on('route:gameRoute', function (actions) {
        var supergameView = new SupergameView({
            el: $("#app-container")
        });
    });

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
});

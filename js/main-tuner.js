;
"use strict"; // jshint ;_;

$(function () {

    var AppRouter = Backbone.Router.extend({
        routes: {
            "*actions": "tunerRoute"
        }
    });

    // Initiate the router
    var app_router = new AppRouter;
    app_router.on('route:tunerRoute', function (actions) {
        var tunerView = new TunerView({
            el: $("#app-container"),
            model: new PitchDetectModel()
        });
    });

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
});


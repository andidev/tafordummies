ko.bindingHandlers.visibleSlideRight = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var $element = $(element);

        if (value)
            $element.show();
        else
            $element.hide();
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var $element = $(element);

        var allBindings = allBindingsAccessor();

        // Grab data from binding property
        var duration = allBindings.duration || "fast";
        var isCurrentlyVisible = !(element.style.display == "none");

        if (value && !isCurrentlyVisible) {
             $element.toggle("slide", {direction: 'left'}, "fast");
        } else if ((!value) && isCurrentlyVisible) {
             $element.toggle("slide", {direction: 'left'}, "fast");
        }
    }
};

ko.bindingHandlers.visibleSlideDown = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var $element = $(element);

        if (value)
            $element.show();
        else
            $element.hide();
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var $element = $(element);

        var allBindings = allBindingsAccessor();

        // Grab data from binding property
        var duration = allBindings.duration || "fast";
        var isCurrentlyVisible = !(element.style.display == "none");

        if (value && !isCurrentlyVisible)
            $element.slideDown(duration);
        else if ((!value) && isCurrentlyVisible)
            $element.slideUp(duration);
    }
};
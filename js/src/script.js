$(document).ready(function () {
    $('body').addClass("loaded");
    var elements = document.querySelectorAll('.scrollwatch');
    var config = {
        threshold: 0.01
    };
    var observer;
    function onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {

                handleScrolledIntoView(entry.target);
            }
        });
    }

    if (!('IntersectionObserver' in window)) {
        Array.from(elements).forEach(el => handleScrolledIntoView(el));
    } else {
        observer = new IntersectionObserver(onIntersection, config);
        elements.forEach(el => {
            observer.observe(el);
        });
    }
    function handleScrolledIntoView(target) {
        target.classList.add('scrolled');

    }
    $('a').on("click", function () {
        if ($(this).attr("href").charAt(0) === '#') {
            $("html,body").animate({ scrollTop: $($(this).attr("href")).offset().top - 100 }, 750);
        }
    });
});

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


function handleDataTable(url) {
    var $repeater = $('#table-repeater');
    $.get(url, function (data) {
        data.forEach(function (element, index) {
            var $new_row = $repeater.clone();
            $new_row.attr("id", "");
            $new_row.removeClass('data-table__row--template');
            var columns = $new_row.find('.data-table__column');
            columns.each(function () {
                var name = $(this).attr("data-column");
                if (typeof element[name] !== "undefined") {
                    if (typeof element[name] == "number") {
                        $(this).html(element[name].toLocaleString());
                    } else {
                        if (element[name] === "NA") {
                            $(this).html("No data");
                        } else {
                            if ($(this).hasClass('data-table__column--datetime')) {
                                var date = new Date(element[name]);
                                $(this).html(date.toLocaleString());
                            } else {
                                $(this).html((element[name] ? element[name] : "No data"));
                            }
                        }
                    }
                } else {
                    if (name === "url") {
                        $(this).html('<a class="button" href="/country/' + element["country"].toLowerCase().replace(" ", "-") + '">View more</a>')
                    }
                }
            });
            $repeater.before($new_row);
        });
        $("#root").tablesorter();
    });
}

function handleCountryData(main_url) {
    var current_country = window.location.pathname.split("/")[2];
    $.get(main_url, function (data) {
        data.forEach(function (element, index) {
            if (element["country"].toLowerCase().replace(" ", "-") === current_country) {
                var details_url = element["moreData"];
                $('.data-dashboard__title span').html(element["country"]);
                var date = new Date(element["lastUpdatedApify"]);
                $('.data-dashboard__time span').html(date.toLocaleString());
                $('.data-dashboard__source span').html(element["sourceUrl"]);
                $.get(details_url, function (data) {
                    var ignore_columns = ["lastUpdatedAtApify", "readMe", "sourceUrl", "country", "lastUpdatedAtSource", "historyData"];
                    for (var prop in data) {
                        if (Object.prototype.hasOwnProperty.call(data, prop) && ignore_columns.indexOf(prop) == -1) {
                            var $panel = $('#data_block_repeater').clone();
                            $panel.attr("id", "");
                            $panel.removeClass('data-block--template');
                            var result = prop.replace(/([A-Z])/g, " $1");
                            var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                            $panel.find('.data-block__title').html(finalResult)
                            var value = data[prop];
                            if (typeof value === "number") {
                                $panel.find('.data-block__value').html(value.toLocaleString());
                            } else {
                                $panel.find('.data-block__value').html(value);
                            }
                            $('#data_block_repeater').after($panel);
                        }
                    }
                });
            }
        });
    });
}
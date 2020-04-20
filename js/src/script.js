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
    $('.data-dashboard').addClass('loading');
    $.get(main_url, function (data) {
        data.forEach(function (element, index) {
            if (element["country"].toLowerCase().replace(" ", "-") === current_country) {
                var details_url = element["moreData"];
                $('.data-dashboard__title span').html(element["country"]);
                var date = new Date(element["lastUpdatedApify"]);
                $('.data-dashboard__time span').html(date.toLocaleString());
                $('.data-dashboard__source span').html(element["sourceUrl"]);
                $('.data-dashboard__button').attr("href", window.location.pathname + "-history");
                $.get(details_url, function (data) {
                    var ignore_columns = ["lastUpdatedAtApify", "readMe", "sourceUrl", "country", "lastUpdatedAtSource", "historyData"];
                    for (var prop in data) {
                        if (Object.prototype.hasOwnProperty.call(data, prop) && ignore_columns.indexOf(prop) == -1) {
                            var $panel = $('#data_block_repeater').clone();
                            $panel.attr("id", "");
                            $panel.removeClass('data-block--template');
                            var finalResult = camelCaseToSentenceCase(prop);
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
                    $('.data-dashboard').removeClass('loading');
                });
            }
        });
    });
}

function camelCaseToSentenceCase(text) {
    var a = text.replace(/([A-Z])/g, " $1")
    return a.charAt(0).toUpperCase() + a.slice(1);
}

function handleCountryHistoryData(main_url) {
    var current_country = window.location.pathname.split("/")[2].replace("-history", "");
    $('.data-dashboard').addClass('loading');
    $.get(main_url, function (data) {
        data.forEach(function (element, index) {
            if (element["country"].toLowerCase().replace(" ", "-") === current_country) {
                var details_url = element["historyData"];
                $('.data-dashboard__title span').html(element["country"]);
                var date = new Date(element["lastUpdatedApify"]);
                $('.data-dashboard__time span').html(date.toLocaleString());
                $('.data-dashboard__source span').html(element["sourceUrl"]);
                var datasets = [];
                $.get(details_url, function (data) {
                    var ignore_columns = ["lastUpdatedAtApify", "readMe", "sourceUrl", "country", "lastUpdatedAtSource", "historyData", "test"];
                    for (var row in data) {
                        var date = new Date(data[row]["lastUpdatedAtApify"]);
                        var date_id = date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate();
                        for (var prop in data[row]) {
                            //Manual corrections to property name. Not ideal, but necessary to consolidate field names which have changed over time
                            var corrected_prop = prop.replace("scottland", "scotland");
                            corrected_prop = corrected_prop.replace("Confirmed", "")
                            if (corrected_prop === "ireland") {
                                corrected_prop = "northernIreland";
                            }
                            //End of property corrections
                            if (Object.prototype.hasOwnProperty.call(data[row], corrected_prop) && ignore_columns.indexOf(corrected_prop) == -1) {
                                var value = data[row][corrected_prop];
                                if (typeof value != "number") {
                                    value = 0;
                                }
                                if (typeof datasets[corrected_prop] !== "undefined") {
                                    if (typeof datasets[corrected_prop][date_id] !== "undefined") {
                                        if (value > datasets[corrected_prop][date_id]) {
                                            datasets[corrected_prop][date_id] = value;
                                        }
                                    } else {
                                        datasets[corrected_prop][date_id] = value;
                                    }
                                } else {
                                    datasets[corrected_prop] = [];
                                    datasets[corrected_prop][date_id] = value;
                                }
                            }
                        }
                    }
                    for (var dataset in datasets) {
                        var $template = $('#data_chart_repeater');
                        var $chart = $template.clone();
                        $chart.removeClass('data-chart--template')
                        var id = "data_chart_" + dataset;
                        $chart.attr("id", "");
                        var $canvas = $chart.find("canvas");
                        $canvas.attr("id", id);
                        $template.before($chart);
                        var ctx = $canvas;
                        var formatted_data = [];
                        for (var data_row in datasets[dataset]) {
                            var date = new Date(data_row);
                            formatted_data.push({ x: date, y: parseInt(datasets[dataset][data_row]) });
                        }
                        var chart = new Chart(ctx, {
                            type: 'line',
                            data: formatted_data,
                            options: {
                                title: {
                                    display: true,
                                    text: camelCaseToSentenceCase(dataset)
                                },
                                scales: {
                                    xAxes: [{
                                        type: 'time',
                                        distribution: 'series',
                                    }]
                                }
                            }
                        });

                    }
                    $('.data-dashboard').removeClass('loading');
                });

            }
        });
    });
}
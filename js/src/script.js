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
        $('.data-table__global-item').each(function () {
            var value = data["Global"][$(this).attr("data-column")];
            $(this).find("span").html(value.toLocaleString());
        });
        data["Countries"].forEach(function (element, index) {
            if ($('.data-table__time span').html() === "") {
                var date = new Date(element['Date']);
                $('.data-table__time span').html(date.toLocaleString())
            }
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
                            $(this).html((element[name] ? element[name] : "No data"));
                        }
                    }
                } else {
                    if (name === "url") {
                        $(this).html('<a class="button" href="/country/' + element["Slug"] + '">View more</a>')
                    }
                }
            });
            $repeater.before($new_row);
        });
        $("#root").tablesorter();
    });
}

function handleCountryData(slug, title) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var url = "https://api.covid19api.com/live/country/" + slug + "/status/confirmed/date/" + date.toISOString();
    $('.data-dashboard').addClass('loading');
    $('.data-dashboard__time span').html(date.toLocaleString());
    $('.data-dashboard__button').attr("href", "/country/" + slug + "-history");
    var root = $('#data_block_group_repeater');
    var totals = [];
    $.get(url, function (data) {
        var $repeater = $('#table-repeater');
        if (data.length > 1) {
            data.forEach(function (element) {
                var $group = root.clone();
                $group.attr("id", "");
                $group.removeClass('data-dashboard__group--template');
                $group.find('.data-dashboard__group-title').html((element["Province"] ? element["Province"] : element["City"]));
                var $new_row = $repeater.clone();
                $new_row.attr("id", "");
                $new_row.removeClass('data-table__row--template');
                var columns = $new_row.find('.data-table__column');
                columns.each(function () {
                    var name = $(this).attr("data-column");
                    if (typeof element[name] !== "undefined") {
                        if (typeof totals[$(this).attr("data-column")] === "undefined") {
                            totals[$(this).attr("data-column")] = parseInt(element[name]);
                        } else {
                            totals[$(this).attr("data-column")] += parseInt(element[name]);
                        }
                        if (typeof element[name] == "number") {
                            $(this).html(element[name].toLocaleString());
                        } else {
                            if (element[name] === "NA") {
                                $(this).html("No data");
                            } else {
                                $(this).html((element[name] ? element[name] : "No data"));
                            }
                        }
                    } else {
                        if (name === "Province/City") {
                            var title;
                            if (element["Province"]) {
                                title = element["Province"];
                            } else if (element["City"]) {
                                title = element["City"];
                            } else {
                                title= element["Country"]
                            }
                            $(this).html(title)
                        }
                    }
                });
                $repeater.before($new_row);
            });
            $('.data-dashboard__group--total .data-block').each(function () {
                var value = totals[$(this).attr("data-column")];
                $(this).find('.data-block__value').html(value.toLocaleString());
            });
        } else {
            $('.data-table').hide();
            $('.data-dashboard__group--total .data-block').each(function () {
                var value = data[0][$(this).attr("data-column")];
                $(this).find('.data-block__value').html(value.toLocaleString());
            });
        }

        $('.data-dashboard').removeClass('loading');
    });
}

function camelCaseToSentenceCase(text) {
    var a = text.replace(/([A-Z])/g, " $1")
    return a.charAt(0).toUpperCase() + a.slice(1);
}

function handleCountryHistoryData(main_url) {
    // var current_country = window.location.pathname.split("/")[2].replace("-history", "");
    // $('.data-dashboard').addClass('loading');
    // $.get(main_url, function (data) {
    //     data.forEach(function (element, index) {
    //         if (element["country"].toLowerCase().replace(" ", "-") === current_country) {
    //             var details_url = element["historyData"];
    //             $('.data-dashboard__title span').html(element["country"]);
    //             var date = new Date(element["lastUpdatedApify"]);
    //             $('.data-dashboard__time span').html(date.toLocaleString());
    //             $('.data-dashboard__source span').html(element["sourceUrl"]);
    //             var datasets = [];
    //             $.get(details_url, function (data) {
    //                 var ignore_columns = ["lastUpdatedAtApify", "readMe", "sourceUrl", "country", "lastUpdatedAtSource", "historyData", "test"];
    //                 for (var row in data) {
    //                     var date = new Date(data[row]["lastUpdatedAtApify"]);
    //                     var date_id = date.getFullYear() + "-" + pad(parseInt(date.getMonth() + 1), 2) + "-" + pad(date.getDate(), 2);
    //                     for (var prop in data[row]) {
    //                         //Manual corrections to property name. Not ideal, but necessary to consolidate field names which have changed over time
    //                         var corrected_prop = prop.replace("scottland", "scotland");
    //                         corrected_prop = corrected_prop.replace("Confirmed", "");
    //                         if (corrected_prop === "infected") {
    //                             corrected_prop = "totalInfected";
    //                         }
    //                         if (corrected_prop === "ireland") {
    //                             corrected_prop = "northernIreland";
    //                         }
    //                         //End of property corrections
    //                         if (Object.prototype.hasOwnProperty.call(data[row], corrected_prop) && ignore_columns.indexOf(corrected_prop) == -1) {
    //                             var value = data[row][corrected_prop];
    //                             if (typeof value != "number") {
    //                                 value = 0;
    //                             }
    //                             if (typeof datasets[corrected_prop] !== "undefined") {
    //                                 if (typeof datasets[corrected_prop][date_id] !== "undefined") {
    //                                     if (value > datasets[corrected_prop][date_id]) {
    //                                         datasets[corrected_prop][date_id] = value;
    //                                     }
    //                                 } else {
    //                                     datasets[corrected_prop][date_id] = value;
    //                                 }
    //                             } else {
    //                                 datasets[corrected_prop] = [];
    //                                 datasets[corrected_prop][date_id] = value;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 for (var dataset in datasets) {
    //                     var $template = $('#data_chart_repeater');
    //                     var $chart = $template.clone();
    //                     $chart.removeClass('data-chart--template')
    //                     var id = "data_chart_" + dataset;
    //                     $chart.attr("id", "");
    //                     $template.before($chart);
    //                     var data = new google.visualization.DataTable();

    //                     data.addColumn('date', "Date");
    //                     data.addColumn('number', camelCaseToSentenceCase(dataset));
    //                     var total = 0;
    //                     for (var data_row in datasets[dataset]) {
    //                         total += parseInt(datasets[dataset][data_row]);
    //                         data.addRows([
    //                             [new Date(data_row), parseInt(datasets[dataset][data_row])]
    //                         ]);
    //                     }
    //                     var materialOptions = {
    //                         backgroundColor: '#1D1D1D',
    //                         colors: ['#1e88e5'],
    //                         fontName: 'objektiv-mk2, sans-serif',
    //                         height: 500,
    //                         vAxis: {
    //                             textStyle: {
    //                                 color: '#fff'
    //                             }
    //                         },
    //                         hAxis: {
    //                             textStyle: {
    //                                 color: '#fff'
    //                             }
    //                         },
    //                         legend: {
    //                             textStyle: {
    //                                 color: '#fff'
    //                             }
    //                         },
    //                         titleTextStyle: {
    //                             fontSize: 20,
    //                             color: '#fff',
    //                             bold: true,
    //                         },
    //                         chart: {
    //                             title: camelCaseToSentenceCase(dataset)
    //                         },
    //                     };
    //                     if (total > 0) {

    //                     }
    //                     var chart = new google.charts.Line($chart[0]);
    //                     chart.draw(data, google.charts.Line.convertOptions(materialOptions));
    //                 }
    //                 $('.data-dashboard').removeClass('loading');
    //             });

    //         }
    //     });
    // });
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
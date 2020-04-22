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

    $(window).scroll(function (e) {
        var $el = $('.data-table');
        var isFixed = ($el.hasClass('is-fixed'));
        if ($(this).scrollTop() > $el.offset().top && !isFixed) {
            $el.addClass('is-fixed')
        }
        if ($(this).scrollTop() < $el.offset().top && isFixed) {
            $el.removeClass('is-fixed')
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
                                title = element["Country"]
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
        $("#root").tablesorter();
    });
}

function camelCaseToSentenceCase(text) {
    var a = text.replace(/([A-Z])/g, " $1")
    return a.charAt(0).toUpperCase() + a.slice(1);
}

function handleCountryHistoryData(slug, title) {
    var url = "https://api.covid19api.com/total/dayone/country/" + slug;
    $('.data-dashboard').addClass('loading');
    var materialOptions = {
        backgroundColor: '#fff',
        colors: ['#1e88e5', '#f44336', '#fbc02d'],
        fontName: 'source-sans-pro, sans-serif',
        height: 500,
        vAxis: {
            title: 'Count',
            textStyle: {
                fontSize: 15,
                color: '#212020'
            },
            titleTextStyle: {
                fontSize: 18
            }
        },
        hAxis: {
            textStyle: {
                fontSize: 15,
                color: '#212020'
            },
            titleTextStyle: {
                fontSize: 18
            }
        },
        legend: {
            position: 'bottom',
            textStyle: {
                color: '#212020'
            }
        },
        titleTextStyle: {
            fontSize: 20,
            color: '#212020',
            bold: true,
        },
        chart: {
            title: 'Coronavirus data for ' + title
        },
    };
    $.get(url, function (element) {
        $('.data-chart').each(function () {
            var data;
            data = new google.visualization.DataTable();
            data.addColumn('date', "Date");
            switch ($(this).attr("id")) {
                case "data_chart_all": {
                    data.addColumn('number', "Confirmed cases");
                    data.addColumn('number', "Deaths");
                    data.addColumn('number', "Recovered");
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        $('.data-dashboard__time span').html(date.toLocaleString());
                        data.addRows([
                            [new Date(item["Date"]), item["Confirmed"], item["Deaths"], item["Recovered"]]
                        ]);
                    })
                    var chart = new google.charts.Line($('#data_chart_all')[0]);
                    chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    break;
                }
                case "data_chart_cases": {
                    data.addColumn('number', "Confirmed cases");
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        data.addRows([
                            [new Date(item["Date"]), item["Confirmed"]]
                        ]);
                    })
                    var chart = new google.charts.Line($('#data_chart_cases')[0]);
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Cases"
                    materialOptions.colors = ['#1e88e5'];
                    chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    break;
                }
                case "data_chart_deaths": {
                    data.addColumn('number', "Deaths");
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        data.addRows([
                            [new Date(item["Date"]), item["Deaths"]]
                        ]);
                    })
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Deaths"
                    materialOptions.colors = ['#f44336'];
                    var chart = new google.charts.Line($('#data_chart_deaths')[0]);
                    chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    break;
                }
                case "data_chart_recovered": {
                    data.addColumn('number', "Recovered");
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        data.addRows([
                            [new Date(item["Date"]), item["Recovered"]]
                        ]);
                    })
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Recoveries"
                    materialOptions.colors = ['#fbc02d'];
                    var chart = new google.charts.Line($('#data_chart_recovered')[0]);
                    chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    break;
                }
            }


        });
        $('.data-dashboard').removeClass('loading');
    });
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
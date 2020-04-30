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
    window.map_items = {};
    $.get("/data/countries.json", function (data) {
        data.forEach(function (element) {
            window.map_items[element["title"]] = element;
        });
    }).done(function () {
        var $repeater = $('#table-repeater');
        $.get(url, function (data) {
            $('.data-table__global-item').each(function () {
                var value = data["Global"][$(this).attr("data-column")];
                $(this).find("span").html(value.toLocaleString());
            });
            data["Countries"].forEach(function (element, index) {
                $.ajax({
                    url: 'https://restcountries.eu/rest/v2/alpha/' + element["CountryCode"].toLowerCase() + '?fields=population',
                    type: 'get',
                    success: function (response) {
                        var population = response["population"];
                        var cases = element["TotalConfirmed"];
                        var cpm = cases / (population / 1000000);
                        var value = cpm.toFixed(2).toLocaleString();
                        if (value === "NaN") {
                            value = 0.00;
                        }
                        $('#' + element["Slug"]).find('td[data-column="cpm"]').html(value);
                        $("#root").trigger("updateAll");
                    },
                    error: function () {
                        return false;
                    }
                })

                if ($('.data-table__time span').html() === "") {
                    var date = new Date(element['Date']);
                    $('.data-table__time span').html(date.toLocaleString())
                }
                var $new_row = $repeater.clone();
                $new_row.attr("id", element["Slug"]);
                $new_row.removeClass('data-table__row--template');
                var columns = $new_row.find('.data-table__column');
                columns.each(function () {
                    var name = $(this).attr("data-column");
                    if (typeof element[name] !== "undefined") {
                        if (typeof element[name] == "number") {
                            if (typeof window.map_items[element["Country"]] != "undefined") {
                                window.map_items[element["Country"]][name] = element[name].toLocaleString();
                            }
                            $(this).html(element[name].toLocaleString());
                        } else {
                            if (element[name] === "NA") {
                                if (typeof window.map_items[element["Country"]] != "undefined") {
                                    window.map_items[element["Country"]][name] = "No data";
                                }
                                $(this).html("No data");
                            } else {
                                if (typeof window.map_items[element["Country"]] != "undefined") {
                                    window.map_items[element["Country"]][name] = (element[name] ? element[name] : "No data");
                                }
                                $(this).html((element[name] ? element[name] : "No data"));
                            }
                        }
                    } else {
                        if (name === "url") {
                            if (typeof window.map_items[element["Country"]] != "undefined") {
                                window.map_items[element["Country"]][name] = '/country/' + element["Slug"];
                            }
                            $(this).html('<a class="button" href="/country/' + element["Slug"] + '">View more</a>')
                        }
                    }
                });
                $repeater.before($new_row);
            });

            $("#root").tablesorter();
            handleMapData();
        });
    });
}

function handleCountryData(slug, title, offset) {
    if (typeof offset === "undefined") {
        offset = 1;
    }
    var date = new Date();
    date.setTime(date.getTime() - (86400000 * offset));
    var url = "https://api.covid19api.com/live/country/" + slug + "/status/confirmed/date/" + date.toISOString();
    $('.data-dashboard').addClass('loading');
    $('.data-dashboard__time span').html(date.toLocaleString());
    $('.data-dashboard__button').attr("href", "/country/" + slug + "-history");
    var root = $('#data_block_group_repeater');
    var totals = [];

    $.get(url, function (data) {
        var $repeater = $('#table-repeater');
        if (data.length > 1) {
            $.get('https://restcountries.eu/rest/v2/alpha/' + data[0]["CountryCode"].toLowerCase() + '?fields=languages;alpha2Code', function (response) {
                var lang_code = response["languages"][0]["iso639_1"];
                var alpha2_code = response["alpha2Code"];
                handleNewsPanel(lang_code, alpha2_code);
            });
            window.map_items = {};
            data.forEach(function (element) {
                var title = (element["Province"] ? element["Province"] : element["City"]);
                window.map_items[title] = element;
                window.map_items[title]["title"] = title;
                var $group = root.clone();
                $group.attr("id", "");
                $group.removeClass('data-dashboard__group--template');
                $group.find('.data-dashboard__group-title').html(title);
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
                var value = parseInt(totals[$(this).attr("data-column")]);
                $(this).find('.data-block__value').html(value.toLocaleString());
            });
            $('.data-dashboard').removeClass('loading');
            handleMapData();
            $("#root").tablesorter();
        } else {
            if (data.length > 0) {
                $('.data-table, .data-map').hide();
                $('.data-dashboard__group--total .data-block').each(function () {
                    var value = parseInt(data[0][$(this).attr("data-column")]);
                    $(this).find('.data-block__value').html(value.toLocaleString());
                });
                $('.data-dashboard').removeClass('loading');
                handleMapData();
                $("#root").tablesorter();
            } else {
                handleCountryData(slug, title, offset + 1);
            }
        }


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
                    var total = 0;
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        $('.data-dashboard__time span').html(date.toLocaleString());
                        total += (item["Confirmed"] + item["Deaths"] + item["Recovered"]);
                        data.addRows([
                            [new Date(item["Date"]), item["Confirmed"], item["Deaths"], item["Recovered"]]
                        ]);
                    })
                    if (total > 0) {
                        var chart = new google.charts.Line($('#data_chart_all')[0]);
                        chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    } else {
                        $('#data_chart_all').addClass('hidden');
                    }
                    break;
                }
                case "data_chart_cases": {
                    data.addColumn('number', "Confirmed cases");
                    var total = 0;
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        total += item["Confirmed"];
                        data.addRows([
                            [new Date(item["Date"]), item["Confirmed"]]
                        ]);
                    })
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Cases"
                    materialOptions.colors = ['#1e88e5'];
                    if (total > 0) {
                        var chart = new google.charts.Line($('#data_chart_cases')[0]);
                        chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    } else {
                        $('#data_chart_cases').addClass('hidden');
                    }
                    break;
                }
                case "data_chart_deaths": {
                    data.addColumn('number', "Deaths");
                    var total = 0;
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        total += item["Deaths"];
                        data.addRows([
                            [new Date(item["Date"]), item["Deaths"]]
                        ]);
                    })
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Deaths"
                    materialOptions.colors = ['#f44336'];
                    if (total > 0) {
                        var chart = new google.charts.Line($('#data_chart_deaths')[0]);
                        chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    } else {
                        $('#data_chart_deaths').addClass('hidden');
                    }
                    break;
                }
                case "data_chart_recovered": {
                    data.addColumn('number', "Recovered");
                    var total = 0;
                    element.forEach(function (item) {
                        var date = new Date(item["Date"]);
                        total += item["Recovered"];
                        data.addRows([
                            [new Date(item["Date"]), item["Recovered"]]
                        ]);
                    })
                    materialOptions.chart.title = 'Coronavirus data for ' + title + " - Recoveries"
                    materialOptions.colors = ['#fbc02d'];
                    if (total > 0) {
                        var chart = new google.charts.Line($('#data_chart_recovered')[0]);
                        chart.draw(data, google.charts.Line.convertOptions(materialOptions));
                    } else {
                        $('#data_chart_recovered').addClass('hidden');
                    }
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

function handleMapData() {
    var platform = new H.service.Platform({
        'apikey': 'tOTHW976fXmXtqazsg-9tNhPxAk4BJjr9QkmEoxrrLo'
    });
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.vector.normal.map,
        {
            center: { lat: 0, lng: 0 },
            zoom: 2.5,
            padding: { top: 50, left: 50, bottom: 50, right: 50 }
        });
    window.addEventListener('resize', () => map.getViewPort().resize());
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    addInfoBubble(map);
    /**
     * Creates a new marker and adds it to a group
     * @param {H.map.Group} group       The group holding the new marker
     * @param {H.geo.Point} coordinate  The location of the marker
     * @param {String} html             Data associated with the marker
     */
    function addMarkerToGroup(group, coordinate, html) {
        var svgMarkup = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" stroke="#212020" stroke-width="1" fill="#1e88e5" /></svg>';
        var icon = new H.map.Icon(svgMarkup);
        var marker = new H.map.Marker(coordinate, { icon: icon });
        // add custom data to the marker
        marker.setData(html);
        group.addObject(marker);
    }

    /**
     * Clicking on a marker opens an infobubble which holds HTML content related to the marker.
     * @param  {H.Map} map      A HERE Map instance within the application
     */
    function addInfoBubble(map) {
        var group = new H.map.Group();
        map.addObject(group);
        // add 'tap' event listener, that opens info bubble, to the group
        group.addEventListener('tap', function (evt) {
            // event target is the marker itself, group is a parent event target
            // for all objects that it contains
            var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
                // read custom data
                content: evt.target.getData(),
            });
            bubble.addClass('map-bubble');
            // show info bubble
            ui.addBubble(bubble);
        }, false);

        $.each(window.map_items, function (index) {
            var item = window.map_items[index];
            var html = '';
            var lat, lng;
            if (typeof item["Confirmed"] != "undefined") {
                html += '<p>' + item["title"] + '</p>';
                html += '<p><strong>Total cases: </strong>' + item["Confirmed"].toLocaleString() + '</p>';
                lat = item["Lat"];
                lng = item["Lon"];
            } else if (typeof item["TotalConfirmed"] != "undefined") {
                html += '<p><strong>Country: </strong>' + item["Country"] + '</p>';
                html += '<p><strong>Total cases: </strong>' + item["TotalConfirmed"].toLocaleString() + '</p>';
                html += '<p><a href="' + item["url"] + '" class="button">View more</a>';
                lat = item["lat"];
                lng = item["lng"];
            }
            addMarkerToGroup(group, { lat: lat, lng: lng }, html)
        });
        if (group.getObjects().length < 20 && group.getBoundingBox() !== null) {
            map.getViewModel().setLookAtData({
                bounds: group.getBoundingBox()
            });
        }
    }
}

function handleNewsPanel(langCode, countryCode) {
    var url = "https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNREZqY0hsNUVnSmxiaWdBUAE?hl=" + langCode + "-" + countryCode + "&gl=" + countryCode;
    $('.news-block__wrapper').rss(url, {
        limit: 10,
        support: false,
        ssl: true,
        layoutTemplate: "<div class='news-block__list'>{entries}</div>",
        entryTemplate: '<div class="news-block__item"><a href="{url}" target="_blank" rel="noopener external" class="news-block__item-link"><span class="news-block__item-date">{date}</span><h3 class="news-block__item-title">{title}</h3></a></div>',
        dateFormatFunction: function (date) {
            var date_obj = new Date(date);
            return date_obj.toLocaleString()
        },
    });
}
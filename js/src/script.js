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

    var bodystrips = document.querySelectorAll('.bodyscroll');
    bodystripsobserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                if (typeof entry.target.attributes['data-scroll-alt'] != 'undefined') {
                    if (entry.target.attributes['data-scroll-alt'].value == "true") {
                        $('body').addClass('alt-colour');
                    } else {
                        $('body').removeClass('alt-colour');
                    }
                }
            }
        });
    });

    bodystrips.forEach(strip => {
        bodystripsobserver.observe(strip);
    });

    $('a').on("click", function () {
        if ($(this).attr("href").charAt(0) === '#') {
            $("html,body").animate({ scrollTop: $($(this).attr("href")).offset().top - 100 }, 750);
        }
    });
    $('#signup_form .form__button').on("click", function (e) {
        e.preventDefault();
        $('.form__message').remove();
        var parent_form = $('#signup_form');
        parent_form.parsley().whenValidate({
            force: true
        }).done(function () {
            var formData = parent_form.serializeObject();
            formData.lp_campaign_id = '5e30378c0b5a5';
            formData.lp_campaign_key = 'nNXfVJ7d4Gzcwby2Zp6P';
            $.ajax({
                async: true,
                url: 'https://savvy.leadspediatrack.com/post.do',
                data: formData,
                type: 'POST',
                dataType: "xml",
                success: function (data) {
                    var response = data.all;
                    var nodes = [];
                    for (i = 0; i < response.length; i++) {
                        nodes[data.all[i].nodeName] = i;
                    }
                    var result_index = nodes["result"];
                    var error_index = nodes["error"];
                    var success = true;
                    var msg = 'You have successfully subscribed. Check your inbox for your £15 off code';
                    if (response[result_index].innerHTML === 'failed') {
                        success = false;
                        if (response[error_index].innerHTML === 'Invalid Email') {
                            msg = 'Please check your email address and try again';
                        } else {
                            msg = 'This email address is already subscribed';
                        }
                    }
                    if (success) {
                        gtag('event', 'Successful subscription', { 'event_category': 'Subscription', 'event_label': 'Subscribed from signup.afinehour.com' });
                    }
                    parent_form.append('<p class="form__message ' + (success ? 'form__message--success' : 'form__message--error') + '">' + msg + '</p>');
                },
                error: function (e) {
                    parent_form.append('<p class="form__message form__message--error">Something went wrong, please try again.</p>');
                }
            });
        });
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
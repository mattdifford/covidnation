$(document).ready(function () {
    $('.form__submit').on('click', function (e) {
        e.preventDefault();
        var parent_fieldset = $(this).parents('fieldset');
        var group_name = parent_fieldset.attr('data-fieldset-name');
        var parent_form = $(this).parents('form');
        parent_form.parsley().whenValidate({
            group: group_name,
            force: true
        }).done(function () {
            var email = parent_form.find('#email_address_input').val();
            $.ajax({
                type: "POST",
                url: 'https://prod-06.uksouth.logic.azure.com:443/workflows/5b7c279bab8d4547a5d56c9c26544946/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_6R3ed3kSh5QL4eGa3ZmcKYHbVjr8prLKjhMxbOmQHI',
                async: true,
                contentType: "application/json",
                data: '{"email_address": "' + email + '"}',
                success: function (response) {
                    window.location.href = 'thankyou';
                },
                error: function (response) {
                    window.location.href = 'thankyou'
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
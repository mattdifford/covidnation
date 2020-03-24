$(document).ready(function () {
    $('.form__submit-button').on('click', function (e) {
        e.preventDefault();
        var parent_fieldset = $(this).parents('fieldset');
        var group_name = parent_fieldset.attr('data-fieldset-name');
        var parent_form = $(this).parents('form');
        parent_form.parsley().whenValidate({
            group: group_name,
            force: true
        }).done(function () {
            
        });
    });
});
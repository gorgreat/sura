/**
 * Mobile panel
 */
const mp = new MobilePanel({
    'navbar': '.nav-main'
});

/**
 * Модальные окна
 */
const modals = new Modals();

$('.js-auth__login').on('click', function(){
    modals.open('.modal_auth');
})

$('.js-auth__register').on('click', function () {
    modals.open('.modal_reg');
})

$('.js-forgot-pwd').on('click', function () {
    modals.open('.modal_forgot');
})


/**
 * Сворачивание секций фильтра в каталоге
 */
$('.js-filter-as__toggle-section').on('click', function() {
    const parent = $(this).parent();
    parent.find('.filter-as__list').slideToggle( function () {
        parent.toggleClass('opened');
    });
    
})


/**
 * Товар: галерея
 */
$('.product__img-thumb').on('click', function() {
    const src = $(this).attr('src');
    const foto = $(this).parents('.product__gallery').find('.product__img');
    foto.attr('src', src);
    $('.product__img-thumb').parent().removeClass('active');
    $(this).parent().addClass('active');
})

/*
 *  Кол-во товара в корщину
 */

(function ($) {

    $(document).on("input change", ".quantity input", function (e) {
        let val = $(this).val();

        if (/^\d+$/.test(val) == false) {
            $(this).val(0)
        }
        $(this).val(parseInt($(this).val()));
    });

    $(document).on("click", ".quantity button", function (e) {
        const btn = $(this);
        const input = btn.parents('.quantity').find('input');

        btn.closest('.quantity').find('button').prop("disabled", false);

        if (btn.hasClass('quantity__plus')) {
            if (input.attr('max') == undefined || parseInt(input.val()) < parseInt(input.attr('max'))) {
                input.val(parseInt(input.val()) + 1);
            } else {
                btn.prop("disabled", true);
            }
        } else {
            if (input.attr('min') == undefined || parseInt(input.val()) > parseInt(input.attr('min'))) {
                input.val(parseInt(input.val()) - 1);
            } else {
                btn.prop("disabled", true);
            }
        }
    });
})(jQuery)

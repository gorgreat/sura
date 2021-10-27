/**
 * Mobile panel
 */
const mp = new MobilePanel({
    'navbar': '.nav-main'
});

/**
 * Сворачивание секций фильтра в каталоге
 */
$('.js-filter-as__toggle-section').on('click', function() {
    const parent = $(this).parent();
    parent.toggleClass('opened');
    parent.find('.filter-as__list').slideToggle();
    
})


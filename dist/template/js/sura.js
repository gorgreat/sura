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

$('.nav-main__icon').on('click', function(){
    const menuItem = $(this).parent();
    menuItem.toggleClass('opened');
})


/**
 * common form sender
 */

/* protect */
$('.form__protect').val('19X84-lider');

$('.js-form-submit').on('submit', function () {
    const form = $(this);
    const error = $(this).parent().find('.form__error');
    const success = $(this).parent().find('.form__success');
    const url = $(this).attr('action');
    const submit = $('.form__submit', this);
    const formType = form.find("input[name='form']");


    error.hide();
    success.hide();
    submit.prop('disable', true);

    $.ajax({
        url: url,
        type: form.attr('method') || 'post',
        data: $(this).serialize(),
        dataType: 'json',
        success: function (response) {
            if (response.status == 'success') {
                error.hide();
                submit.prop('disable', false);
                form.slideUp(300, function () {
                    success.slideDown();
                    success.get(0).scrollIntoView();
                });
                // Авторизация и релоад страницы
                if (formType && formType.val() === "auth") {
                    setTimeout(function () {
                        window.location.reload();
                    }, 3000);
                }

                // Заказ
                if (formType && formType.val() === "cart") {
                    if (response.message) {
                        success.html(response.message)
                    }
                }

                

            } else {
                error.show();
                if (response.message) {
                    error.find('div').html(response.message)
                }

                // Заказ
                if (formType && formType.val() === "cart") {
                    if (response.message) {
                        error.html(response.message)
                    }
                }

                error.get(0).scrollIntoView({ block: "start", behavior: "smooth" });
            }

        }
    }).fail(function (response) {
        error.show();
        console.log(response);
    });

    return false;
});
 /*вкладки в лк */
;(function() {
    'use strict';
    var tabsmenu = document.querySelectorAll('.tabs-lk');
    if (!tabsmenu) return;
    [].forEach.call(tabsmenu, function(menu) {
        menu.addEventListener('click', function(e) {
            // if (e.target.tagName != 'LI') return;
            var currIndex = switchTab(menu, e.target);
            switchBlock(menu, currIndex);
        })
    });

    function switchTab(menu, tab) {
        var items = menu.querySelectorAll('.tab-nav-item-link'),
            currIndex;

        [].forEach.call(items, function(item, index) {
            item.classList.remove('tab-nav-item-link-active');
            if (item === tab) {
                item.classList.add('tab-nav-item-link-active');
                currIndex = index;
            }
        });
        return currIndex;
    }

    function switchBlock(menu, currIndex) {
        var content	= menu.nextElementSibling,
            blocks = content.querySelectorAll('.tab-content-item');

        [].forEach.call(blocks, function(block, index) {
            block.classList.remove('tab-content-item-active');
            if (index == currIndex) block.classList.add('tab-content-item-active');
        });
    }}
)();
 
/** 
 *  Контрол + -
 */
class Quantity{
        constructor() {
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
            input.trigger('change');
        });
    }
}

new Quantity();

/*
 * Класс добавления товара в избранное
 */
class Favorite {

    constructor() {
        this.COOKIE_NAME = 'favorite';

        this.items = this.getItems();
        this.save(); // В данном случае продлеваем куки
        this.buttonListener();
        this.setButtonsState();
    }


    /*
     * Получить данные из хранилища
     */
    getItems() {
        let items = [];
        if (Cookies.get(this.COOKIE_NAME) != undefined && Cookies.get(this.COOKIE_NAME).length) {
            items = JSON.parse(Cookies.get(this.COOKIE_NAME));
        } else {
            this.clearAll();
        }
        return items;
    }


    /*
     * Обработчик кнопок "В избранное"
     */
    buttonListener() {
        $('body').on('click', '.js-to-favorite', (e) => {

            const id = $(this).attr('data-id');
            const $buttons = $('.js-to-favorite[data-id="' + id + '"]');

            if ($buttons) {
                [...$buttons].forEach(item => {
                    item.toggleAttribute('data-isfavorite');
                })
            }

            this.toggleItem(id);
            $('body').trigger('tofavorite');
        });

    }

    /*
     * Добавляет элемент, если его нет, удаляет, если есть
     */
    toggleItem(id) {
        if (!id) {
            return
        }
        
        const i = this.items.findIndex(item => item.id == id);
        if (i === -1) {
            this.items.push({
                id: id,
                count: 1
            });
        } else {
            this.items.splice(i, 1);
        }

        this.save();
    }

    /*
    * Устанавливает кол-во товара в избранном.
    * @param {Number} id - id товара
    * @param {Number} count - кол-во товара. Если 0, то товар удалаяется
    */
    setItem(id, count) {
        if (!id) {
            return
        }

        const i = this.items.findIndex(item => item.id == id);
        if (i === -1) {
            this.items.push({
                id: id,
                count: +count
            });
        } else {
            if (count) {
                this.items[i].count = count
            } else {
                this.deleteItem(id)
            }
        }


        this.save();
    }

    /*
     * Удаляет элемент
     */
    deleteItem(id) {
        const i = this.items.findIndex(item => item.id == id);

        if (i !== -1) {
            this.items.splice(i, 1);
            this.save();
            return true
        } else {
            return false
        }
    }

    clearAll() {
        this.items = [];
        this.save();
    }

    /*
     * Сохраняет элементы в куки
     */
    save() {
        Cookies.set(
            this.COOKIE_NAME,
            JSON.stringify(this.items), {
            expires: 7,
            path: '/'
        }
        );
        this.setTextCount();
    }

    /*
     * Устанавливает значение счетчика элементов
     */
    setTextCount() {
        if (this.items.length) {
            $('.js-favorite-count').text(this.items.length);
        } else {
            $('.js-favorite-count').text('');
        }
    }

    /*
     * Устанавливает состояние кнопок при инициализации страницы
     */
    setButtonsState() {
        $('.js-to-favorite').each( () => {
            let id = $(this).attr('data-id');

            if (this.items.findIndex(item => item.id == id) !== -1) {
                $(this).attr('data-isfavorite', true);
            } else {
                $(this).removeAttr('data-isfavorite', false);
            }
        });

    }

}

const favorite = new Favorite();



/*
 * Класс добавления товара в корзину
 */
class ToCart {

    constructor() {
        this.COOKIE_NAME = 'basket';

        this.items = this.getItems();
        this.save(); // В данном случае продлеваем куки
        this.buttonListener();
        this.setButtonsState();
    }


    /*
     * Получить данные из хранилища
     */
    getItems() {
        let items = [];
        if (Cookies.get(this.COOKIE_NAME) != undefined && Cookies.get(this.COOKIE_NAME).length) {
            items = JSON.parse(Cookies.get(this.COOKIE_NAME));
        } else {
            this.clearAll();
        }
        return items;
    }


    /*
     * Обработчик кнопок "В корзину"
     */
    buttonListener() {
        const _this = this;
        $('body').on('click', '.js-to-cart', function (e) {

            const parent = $(this).parents('.product-to-cart');
            const id = parent.attr('data-id') || 1;
            const count = parseInt(parent.find('.quantity__input').val());
          
            const button = $(this);
            
            _this.addItem(id, count);

            button.attr('data-in-art', true);
            button.text('В корзине');

            $('body').trigger('tocart');
        });

    }

    /*
     * Добавляет элемент, если его нет, увеличивает счетчик, если есть
     * @param {Number} id - id товара
     * @param {Number} count - кол-во товара
     */
    addItem(id, count) {
        if (!id) {
            return
        }

        const i = this.items.findIndex(item => item.id == id);
        if (i === -1) {
            this.items.push({
                id: id,
                count: +count
            });
        } else {
            this.items[i].count = +this.items[i].count + count
        }

        this.save();
    }

    /*
    * Устанавливает кол-во товара в корзине.
    * @param {Number} id - id товара
    * @param {Number} count - кол-во товара. Если 0, то товар удалаяется
    */
    setItem(id, count) {
        if (!id) {
            return
        }

        const i = this.items.findIndex(item => item.id == id);
        if (i === -1) {
            this.items.push({
                id: id,
                count: +count
            });
        } else {
            if (count) {
                this.items[i].count = count
            } else {
                this.deleteItem(id)
            }
        }


        this.save();
    }

    /*
     * Удаляет элемент
     */
    deleteItem(id) {
        const i = this.items.findIndex(item => item.id == id);

        if (i !== -1) {
            this.items.splice(i, 1);
            this.save();
            return true
        } else {
            return false
        }
    }

    clearAll() {
        this.items = [];
        this.save();
    }

    /*
     * Сохраняет элементы в куки
     */
    save() {
        Cookies.set(
            this.COOKIE_NAME,
            JSON.stringify(this.items), {
            expires: 7,
            path: '/'
        }
        );
        this.setTextCount();
    }

    /*
     * Устанавливает значение счетчика элементов
     */
    setTextCount() {
        if (this.items.length) {
            $('.js-shop-cart-info').text(this.items.length);
        } else {
            $('.js-shop-cart-info').text('');
        }
    }

    /*
     * Устанавливает состояние кнопок при инициализации страницы
     */
    setButtonsState() {
        const _this = this;
        $('.js-to-cart').each(function ()  {
        
            const parent = $(this).parents('.product-to-cart');
            const id = parent.attr('data-id') || 1;

            if (_this.items.findIndex(item => item.id == id) !== -1) {
                $(this).attr('data-in-art', true);
                $(this).text('В корзине');
            } else {
                $(this).text('В корзину');
            }
        });

    }

}

const toCart = new ToCart();



/**
 * Класс обслуживающий корзину/избранное:
 * 1) При изменении кол-ва товаров:
 *     а) пересчет цен товара,
 *     б) обновление харнилища (Cookie)
 *     в) пересчет общей стоимости
 * 2) Удаление Товара из корзины / хранилища (Cookie)
 *     а), б), в) из п. 1
 * 3) Отправляет заказ
 * @param {String} storage - хранилище данных (basket | favorite)
 */
class Cart {
    constructor(storage = null) {
        if (storage !== 'basket' && storage !== 'favorite') {
            return
        }
        this.storage = storage;
        this.events();
    }
    events() {
    
        const _this = this;
        // Изменение кол-ва товара
        $('.cart-item__footer-col-2 .quantity__input').on('change', () => {
            this.calculate();
        })

        // Кнопка удалить
        $('.js-cart-item-delete').on('click', function() {
            const id = $(this).attr('data-id') || 0;
            const product = $(this).parents('.cart-item');
            product.slideUp(300, function() {
                $(this).remove()

                _this.calculate();

                if (_this.storage == 'basket') {
                    toCart.deleteItem(id);
                    if (!toCart.getItems().length) {
                        _this.hideCart()
                    }
                } else {
                    favorite.deleteItem(id);
                    if (!favorite.getItems().length) {
                        _this.hideCart()
                    }
                }

            })

           
        })

        // Добавить грузополучателя
        $('.order__receivers').on('click', '.js-reciver-add', () => this.addReciver())

        // Удалить грузополучателя
        $('.order__receivers').on('click', '.js-reciver-del', function () {
            $(this).parents('.order-receiver').remove();
        })
        // Открыть форму
        $('.js-order-toggle').on('click', function () {
            $('.order').removeClass('d-none');
            $('.order').get(0).scrollIntoView({ block: "start", behavior: "smooth" });
        })

    }
    // Пересчет цен
    calculate() {
        let total = 0;
        let totalOld = 0;
        const _this = this;

        $('.cart-item').each(function() {
            let sum = 0;
            let sumOld = 0;

            const id = $(this).attr('data-id');
            
            let count = $(this).find('.quantity__input').val();
            count = +(count.trim()) || 1;
            
            let price = $(this).find('.cart-item__price .price__current .price__value').text() || '';
            price = +(price.trim()) || 0;

            let priceOld = $(this).find('.cart-item__price .price__old .price__value').text() || '';
            
            priceOld = +(priceOld.trim()) || 0;

            
            sum = price * count;
            sumOld = priceOld * count;

            $(this).find('.cart-item__total-value').text(sum);

            total = total + sum;
            totalOld = totalOld + sumOld;

            if (_this.storage === 'basket') {
                toCart.setItem(id, count);
            }
            if (_this.storage === 'favorite') {
                favorite.setItem(id, count);
            }
        })

        $('.cart-footer__price .price__current .price__value').text(total);
        $('.cart-footer__price .price__old .price__value').text(totalOld);
    }
    /**
     * Скрывает корзину, показывает сообщение о пустой корзине/избранном
     */
    hideCart() {
        $('.cart').slideUp();
        $('.cart-empty').removeClass('d-none');
    }

    /**
     * Добавляет грузополучателя
     */
    addReciver() {
        const reciverBlock = $(`
        <div class="order-receiver">
            <div class="order-receiver__field">
            </div>
            <button class="order-receiver__btn js-reciver-del"  type="button">Удалить</button>
        </div>
        `);

        const reciverSelect = $('.order__receivers .order-receiver').eq(0).find('select').clone();

        reciverBlock.find('.order-receiver__field').append(reciverSelect);

        $('.order__receivers').append(reciverBlock);
    }
}



let cart;
if (typeof cartStorage !== 'undefined') {
    cart = new Cart(cartStorage);
}














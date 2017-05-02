(() => {
    var currentPage = window.location.href;
    setInterval(function() {
        if (currentPage != window.location.href) {
            currentPage = window.location.href;
            onPageChange(currentPage);
        }
    }, 50);
    onPageChange(currentPage);
})();


function processLinks() {
    let hrefs = $('body a');
    for (let href of hrefs) {
        $(href).on('click', function() {
            window.location.href = this.href;
        });
    }
}

function onPageChange(location) {
    processLinks();
    getStores(['preferences', 'sizings', 'billing']).then((stores) => {
        if (!stores[0].autocheckout) return;
        if (isProductPage()) {
            processProduct(stores[0]);
        } else if (isCart()) {
            processCart(stores[0]);
        } else if (isCheckout()) {
            processCheckout(stores[0], stores[2]);
        }
    });
}

function processCart(preferencesStore) {
    const delay = preferencesStore['delay_go_checkout'] || 100;
    setTimeout(() => {
        document.location.href = '/checkout';
    }, delay);
}

function processCheckout(preferencesStore, billingStore) {
    const checkoutDelay = preferencesStore['delay_checkout'] || 1500;
    for (let key of Object.keys(billingStore)) {
        const value = billingStore[key];
        $('#' + key).val(value);
        $("input[name='order[terms]']").val(1);
    }
    setTimeout(() => {
        $('#checkout_form').submit();
    }, checkoutDelay);
}

function processProduct(preferencesStore) {
    getStore('sizings')
        .then((store) => {
            if (!isSoldOut()) {
                let submitBtn = $('input[name=commit]');
                let productCategory = getProductCategory();
                let sizesOptions = getSizesOptions();
                let categorySize = store[productCategory];
                let targetOption = sizesOptions.filter(x => x.text === categorySize)[0];
                if (!targetOption) {
                    targetOption = sizesOptions[0];
                }
                let atcDelay = preferencesStore['delay_atc'] || 500;
                if (targetOption !== undefined) {
                    targetOption.selected = true;
                }
                submitBtn.click();
                setTimeout(() => {
                    window.location.href = '/shop/cart/';
                }, atcDelay);
            }
        });
}

function isProductPage() {
    let path = location.pathname.substring(1).split('/');
    return path.length === 4 && path[0] === 'shop';
}

function isCart() {
    let path = location.pathname.substring(1).split('/');
    return path[1] === 'cart';
}

function isCheckout() {
    let path = location.pathname.substring(1).split('/');
    return path[0] === 'checkout';
}

function getProductCategory() {
    return location.pathname.substring(1).split('/')[1];
}


function isSoldOut() {
    return $('input[name=commit]').length === 0;
}

function getSizesOptions() {
    const sizes = document.getElementById('size');
    if (!sizes || !sizes.options)
        return [];
    return [...sizes.options];
}
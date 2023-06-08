toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
let bookList = [], basketList = [];

const basketIcon = document.querySelector(".basket-icon");
const biX = document.querySelector(".bi-x");

const toggleModal = () => {
    const basketModalElem = document.querySelector(".basket-modal");
    basketModalElem.classList.toggle("active");
};


basketIcon.addEventListener("click", () =>toggleModal());
biX.addEventListener("click", () =>toggleModal());

const createBookStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (Math.round(starRate) >= i)
            starRateHtml += `<i class="bi bi-star-fill active"></i>`;
        else
            starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
    return starRateHtml;
};

/* BOOKS */
const createBookItemsHtml = (bookList) => {
    const storeBooksElem = document.querySelector(".store-books");
    let storeBooksHtml = "";

    bookList.forEach((book, index) => {
        storeBooksHtml += 
        `<div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
                <div class="row book-card">
                    <div class="col-6">
                        <img class="img-fluid shadow" src="${book.imgSource}" alt="${book.name} - ${book.author}">
                    </div>
                    <div class="col-6 d-flex flex-column justify-content-between">
                        <div class="book-card-info">
                            <span class="text-start book-card-info-author fs-5">${book.author}</span>
                            <span class="text-start book-card-info-name fs-4 fw-bold">${book.name}</span>
                            <span class="text-start book-card-info-stars">
                                ${createBookStars(book.starRate)}
                                <span class="book-card-info-reviews">${book.reviewCount} reviews</span>
                            </span>
                        </div>
                        <p class="text-start book-card-description">${book.description}</p>
                        <div class="text-start">
                            <span class="price fw-bold fs-5">${book.price} ₺</span>
                            ${book.oldPrice ? `<span class="price-before-discount fw-bold fs-5 me-2">${book.oldPrice} ₺</span>` : ""}
                        </div>
                        <button class="btn-purple" onclick="addItemToBasket(${book.id})">ADD TO BASKET</button>
                    </div>
                </div>
            </div>`;
    });

    storeBooksElem.innerHTML = storeBooksHtml;
};

const getBooks = (bookType) => {
    fetch("./products.json")
    .then(response => response.json())
    .then((books) => {
        bookList = books;

        if (bookType != "ALL")
            bookList = bookList.filter((book) => book.type == bookType);

        createBookItemsHtml(bookList);
        if (bookType == "ALL")
            createBookTypesHtml(bookList);
    });
};

/* BOOK TYPES */
const BOOK_TYPES = {
    ALL: "Tümü",
    NOVEL: "Roman",
    CHILDREN: "Çocuk",
    SELFIMPROVEMENT: "Kişisel Gelişim",
    HISTORY: "Tarih",
    FINANCE: "Finans",
    SCIENCE: "Bilim"
};

const createBookTypesHtml = (books) => {
    const storeFilterListElem = document.querySelector(".store-filter-list");
    let filterHtml = "";
    let filterTypes = ["ALL"];

    books.forEach(book => {
        if (filterTypes.findIndex(filter => filter == book.type) < 0)
            filterTypes.push(book.type);
    });

    
    filterTypes.forEach((type, index) => {
        filterHtml += `<li class=${((filterTypes.length > 2 && index == 0) || (filterTypes.length == 2 && index == 1)) ? "active": null} onclick="filterBooks(this)" data-type="${type}">${BOOK_TYPES[type] || type}</li>`;
    });

    storeFilterListElem.innerHTML = filterHtml;
};

const filterBooks = (storeFilterListItemElem) => {
    document.querySelector(".store-filter-list .active").classList.remove("active");
    storeFilterListItemElem.classList.add("active");

    let bookType = storeFilterListItemElem.dataset.type;
    
    getBooks(bookType);
    

    //createBookTypesHtml(bookList);
    //createBookItemsHtml(bookList);
};

const listBasketItems = () => {
    localStorage.setItem("basketList", JSON.stringify(basketList));

    const basketModalContentListElem = document.querySelector(".basket-modal-content-list");
    const basketItemCountElem = document.querySelector(".basket-icon-count");
    const totalPriceElem = document.querySelector(".basket-modal-content-total-price");

    let basketListHtml = "";
    let totalPrice = 0;
    basketList.forEach(item => {
        totalPrice += item.product.price * item.quantity;
        basketListHtml += 
        `<li class="basket-modal-content-list-item my-4">
            <img src="${item.product.imgSource}" width="100" height="100" alt="${item.product.name}">
            <div class="basket-item-info">
                <h3 class="book-name">${item.product.name}</h3>
                <span class="book-price">${item.product.price} ₺</span><br>
                <span class="book-remove" onclick="removeItemFromBasket(${item.product.id})">remove</span>
            </div>
            <div class="book-count">
                <span class="decrease" onclick="decreaseItem(${item.product.id})">-</span>
                <span class="mx-2">${item.quantity}</span>
                <span class="increase" onclick="inreaseItem(${item.product.id})">+</span>
            </div>
        </li>`;
    });

    if (basketListHtml == "")
        basketListHtml = `<li class="basket-modal-content-list-item my-4 text-center">Your basket is empty.</li>`;

    basketModalContentListElem.innerHTML = basketListHtml;
    basketItemCountElem.innerHTML = (basketList.length > 0 ? basketList.length : null);
    totalPriceElem.innerHTML = (totalPrice > 0 ? `Total: ${totalPrice.toFixed(2)} ₺` : null);
    
};

const addItemToBasket = (bookId) => {
    const foundBook = bookList.find((book) => book.id == bookId);
    if (foundBook) {
        const basketIndex = basketList.findIndex((basket) => basket.product.id == bookId);
        
        if (basketIndex < 0) { // sepette yoksa yeni ekle
            let item = {
                quantity: 1,
                product: foundBook
            };
            basketList.push(item);
            toastr.success("Book is added to basket successfully!");
        } else { // sepette varsa adeti +1 arttir
            if (basketList[basketIndex].quantity < basketList[basketIndex].product.stock) {
                basketList[basketIndex].quantity += 1;
                toastr.success("Book is added to basket successfully!");
            } else
                toastr.error("Sorry, we don't have enough stock!");
        }
        
        listBasketItems();
    }
   
};

const removeItemFromBasket = (bookId) => {
    const foundItemIndex = basketList.findIndex(item => item.product.id == bookId);
    if (foundItemIndex >= 0) {
        basketList.splice(foundItemIndex, 1);
        listBasketItems();
    }
};

const decreaseItem = (bookId) => {
    const foundItemIndex = basketList.findIndex(item => item.product.id == bookId);
    if (foundItemIndex >= 0) {
        if (basketList[foundItemIndex].quantity > 1) {
            basketList[foundItemIndex].quantity -= 1;
            listBasketItems();
        } else
            removeItemFromBasket(bookId);
    }
}

const inreaseItem = (bookId) => {
    const foundItemIndex = basketList.findIndex(item => item.product.id == bookId);
    if (foundItemIndex >= 0) {
        if (basketList[foundItemIndex].quantity < basketList[foundItemIndex].product.stock)
            basketList[foundItemIndex].quantity += 1;
        else
            toastr.error("Sorry, we don't have enough stock!");
        listBasketItems();
    }
}

getBooks("ALL");

if (localStorage.getItem("basketList")) {
    basketList = JSON.parse(localStorage.getItem("basketList"));
    listBasketItems();
}

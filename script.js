let product = document.querySelectorAll(".items-cart img");

let popup = document.querySelector(".popup");
let minus = document.querySelector(".quantity button:first-child");
let plus = document.querySelector(".quantity button:last-child");
let cartMessage = document.querySelector(".cart-message");
let addCart = document.querySelector(".add-cart");
let quantityText = document.querySelector(".quantity span");
let myCart = document.querySelector(".cart");
let cartPopup = document.querySelector(".cart-popup");
let cartItems = document.querySelector(".cart-items");
let cart = [];
let currentProduct = null;
let popupImage = document.querySelector(".popup-image");
let closeCart = document.querySelector(".close-cart");
let closeProduct = document.querySelector(".close-product");
let notice = document.querySelector(".new-notice");
let popupPrice = document.querySelector(".popup-price");
let grandTotal = document.querySelector(".grand-total");
let payButton = document.querySelector(".pay-button");
let orderStatus = document.querySelector(".order-status");

console.log(product);

product.forEach(function (item) {
    item.addEventListener("click", function () {
        currentProduct = item;

        popupImage.src = item.src;
        popupPrice.textContent = "₹" + item.dataset.price;
        quantityText.textContent = 1;
        popup.style.display = "block";

        console.log("CURRENT PRODUCT:", currentProduct);
    });
});

plus.addEventListener("click", function () {
    quantityText.textContent = Number(quantityText.textContent) + 1;
});

minus.addEventListener("click", function () {
    let current = Number(quantityText.textContent);
    if (current > 1) {
        quantityText.textContent = current - 1;
    }
});

addCart.addEventListener("click", function () {
    if (!currentProduct) {
        alert("Pehle koi product select karo.");
        return;
    }

    let selectedProduct = {
        image: currentProduct.src,
        price: Number(currentProduct.dataset.price),
        quantity: Number(quantityText.textContent)
    };

    if (cart.length >= 3) {
        alert("You can add maximum 3 different products.");
        return;
    }

    cart.push(selectedProduct);
    console.log(cart);

    popup.style.display = "none";
    cartMessage.style.display = "block";

    setTimeout(function () {
        cartMessage.style.display = "none";
    }, 4000);
});

console.log("SEARCH CODE REACHED");

let search = document.querySelector(".text1");
let searchMessage = document.querySelector(".search-message");

search.addEventListener("input", function () {
    console.log("TYPING");
    console.log(search.value);

    if (search.value.length > 0) {
        searchMessage.style.display = "block";
    } else {
        searchMessage.style.display = "none";
    }
});

function showCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(function (item) {
        let itemTotal = item.price * item.quantity;
        total = total + itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" width="80">
                <p>Price: ₹${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Total: ₹${itemTotal}</p>
            </div>
        `;
    });

    grandTotal.textContent = "Total: ₹" + total;
}

myCart.addEventListener("click", function () {
    cartPopup.style.display = "block";
    showCart();
});

closeCart.addEventListener("click", function () {
    cartPopup.style.display = "none";
});

closeProduct.addEventListener("click", function () {
    popup.style.display = "none";
});

function showNotice() {
    notice.style.display = "block";
    setTimeout(function () {
        notice.style.display = "none";
    }, 1500);
}

showNotice();
setInterval(function () {
    showNotice();
}, 20000);

// ---------------- PAYMENT SECTION ----------------

payButton.addEventListener("click", async function () {

    if (cart.length === 0) {
        alert("Cart khaali hai, pehle product add karo.");
        return;
    }

    let total = 0;
    cart.forEach(function (item) {
        total = total + (item.price * item.quantity);
    });

    console.log("TOTAL:", total);

    let order;

    // Step 1: create order on backend — wrapped in try/catch
    try {
        let response = await fetch("http://localhost:3000/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: total * 100
            })
        });

        if (!response.ok) {
            throw new Error("Server responded with status " + response.status);
        }

        order = await response.json();
        console.log("RAZORPAY ORDER:", order);

    } catch (err) {
        console.error("ORDER CREATE FAILED:", err);
        alert("Order create karne mein problem aayi. Backend server check karo (localhost:3000 chal raha hai kya?).");
        return; // stop here, don't try to open Razorpay with no order
    }

    // Step 2: open Razorpay checkout
    let options = {
        key: "rzp_live_T1Vfuq5Lfef4Nx",
        amount: order.amount,
        currency: "INR",
        name: "AMBUJ STORE",
        description: "Shopping Payment",
        order_id: order.id,

        handler: function (response) {
            console.log("🔥 HANDLER REACHED");
            console.log("PAYMENT SUCCESS 🎉");
            console.log("Payment ID:", response.razorpay_payment_id);
            console.log("Order ID:", response.razorpay_order_id);
            console.log("Signature:", response.razorpay_signature);

            orderStatus.style.display = "block";
cartPopup.style.display = "none";   // agar cart popup khula ho to band kar do
cart = [];
        },

        modal: {
            ondismiss: function () {
                console.log("❌ MODAL DISMISSED — payment complete hone se pehle band hua ya cancel hua");
            }
        }
    };

    let razorpayPayment = new Razorpay(options);

    razorpayPayment.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED");
        console.log("CODE:", response.error.code);
        console.log("DESCRIPTION:", response.error.description);
        console.log("SOURCE:", response.error.source);
        console.log("STEP:", response.error.step);
        console.log("REASON:", response.error.reason);

        alert("Payment fail ho gaya: " + response.error.description);
    });

    razorpayPayment.open();
});
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar) {
    bar.addEventListener("click", () => {
        nav.classList.add("active");
    });
}

if (close) {
    close.addEventListener("click", () => {
        nav.classList.remove("active");
    });
}

const databaseURL = "https://avalia3-default-rtdb.firebaseio.com/"; 


async function createAccount() {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-pass").value;
    const confirmPassword = document.querySelector("input[placeholder='Confirme sua senha:']").value;

    // confirmando a senha
    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    if (!name || !email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const userData = {
        name: name,
        email: email,
        password: password
    };


    try {
        const response = await fetch(`${databaseURL}/users.json`, {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            alert("Conta criada com sucesso!");
        } else {
            const errorData = await response.json();
            alert("Erro ao criar conta: " + errorData.error);
        }
    } catch (error) {
        alert("Erro ao criar conta: " + error.message);
    }
}

async function addToCart(name, price, image) {
    const response = await fetch(`${databaseURL}/cart.json`);
    const cart = (await response.json()) || {};

    const existingItemKey = Object.keys(cart).find(key => cart[key].name === name);

    if (existingItemKey) {
        cart[existingItemKey].quantity += 1;
        await fetch(`${databaseURL}/cart/${existingItemKey}.json`, {
            method: "PUT",
            body: JSON.stringify(cart[existingItemKey]),
            headers: {
                "Content-Type": "application/json",
            },
        });
    } else {
        const newItem = {
            name,
            price,
            image,
            quantity: 1,
        };
        await fetch(`${databaseURL}/cart.json`, {
            method: "POST",
            body: JSON.stringify(newItem),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    alert(`${name} foi adicionado ao carrinho!`);
    displayCart();
}

async function displayCart() {
    const cartContainer = document.getElementById("cart-container");
    const response = await fetch(`${databaseURL}/cart.json`, {
        method: 'GET',
    });
    const cart = (await response.json()) || {};

    cartContainer.innerHTML = "";

    if (Object.keys(cart).length === 0) {
        cartContainer.innerHTML = "<p>O carrinho está vazio.</p>";
        document.querySelector('.order-summary span:last-child').innerText = '0 itens';
        document.querySelector('tfoot th:last-child span').innerText = 'R$0,00';
    } else {
        let totalItems = 0;
        let totalPrice = 0;

        Object.entries(cart).forEach(([id, item]) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="fr-pannel">
                    <div class="inner-pannel">
                        <div class="panel-contents">
                            <div class="product-card-list">
                                <div class="image-section">
                                    <div class="product-img">
                                        <div><img src="${item.image}" alt="${item.name}" /></div>
                                    </div>
                                </div>
                                <div class="product-container">
                                    <div class="content-wrapper">
                                        <div class="info">
                                            <dl class="list-inline-info">Item: ${item.name}</dl>
                                            <dl class="list-inline-info">Quantidade: ${item.quantity}</dl>
                                            <div class="product-price">Preço Unitário: R$${item.price.toFixed(2)}</div>
                                            <div class="product-price">Subtotal: R$${(item.price * item.quantity).toFixed(2)}</div>
                                            <div class="remove-button"><button onclick="removeFromCart('${id}')">Remover</button></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            cartContainer.appendChild(listItem);
        });

        document.querySelector('.order-summary span:last-child').innerText = `${totalItems} itens`;
        document.querySelector('tfoot th:last-child span').innerText = ` R$${totalPrice.toFixed(2)}`;
    }
}

async function removeFromCart(id) {
    await fetch(`${databaseURL}/cart/${id}.json`, {
        method: "DELETE",
    });

    alert("Item removido do carrinho!");
    displayCart();
}

async function clearCart() {
    if (confirm("Tem certeza de que deseja finalizar a compra?")) {
        await fetch(`${databaseURL}/cart.json`, {
            method: "DELETE",
        });

        alert("Compra finalizada com sucesso! O carrinho foi limpo.");
        displayCart();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    const checkoutButton = document.querySelector(".checkout-card button:nth-child(2)");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", clearCart);
    }

    const createAccountButton = document.getElementById("Create-btn");
    if (createAccountButton) {
        createAccountButton.addEventListener("click", createAccount);
    }
});

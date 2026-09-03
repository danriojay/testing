let customerNameInput;
let productCountInput;
let productsContainer;
let deliveryOptionSelect;
let calculateBtn;
let validationMessage;
let orderSummary;

function calculateItemAmount(price, quantity) {
  return price * quantity;
}

function calculateDiscount(subtotal) {
  if (subtotal >= 5000) {
    return roundMoney(subtotal * 0.10);
  } else if (subtotal >= 3000) {
    return roundMoney(subtotal * 0.07);
  } else if (subtotal >= 1000) {
    return roundMoney(subtotal * 0.05);
  } else {
    return 0;
  }
}

function getDeliveryFee(option) {
  switch (String(option)) {
    case "1":
      return 0;
    case "2":
      return 80;
    case "3":
      return 150;
    default:
      return 0;
  }
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

function getDiscountRate(subtotal) {
  if (subtotal >= 5000) {
    return 10;
  } else if (subtotal >= 3000) {
    return 7;
  } else if (subtotal >= 1000) {
    return 5;
  } else {
    return 0;
  }
}

function getDeliveryType(option) {
  switch (String(option)) {
    case "1":
      return "Store Pickup";
    case "2":
      return "Standard Delivery";
    case "3":
      return "Express Delivery";
    default:
      return "Store Pickup";
  }
}

function formatCurrency(amount) {
  return `₱${amount.toFixed(2)}`;
}

function getPositiveWholeNumber(value) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function getPositiveNumber(value) {
  const numberValue = parseFloat(value);

  if (Number.isNaN(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function renderProductInputs() {
  const productCount = getPositiveWholeNumber(productCountInput.value);
  const currentValues = [];

  for (let index = 0; index < productsContainer.children.length; index++) {
    const nameInput = document.getElementById(`productName-${index}`);
    const priceInput = document.getElementById(`productPrice-${index}`);
    const quantityInput = document.getElementById(`productQuantity-${index}`);

    currentValues.push({
      name: nameInput ? nameInput.value : "",
      price: priceInput ? priceInput.value : "",
      quantity: quantityInput ? quantityInput.value : ""
    });
  }

  productsContainer.innerHTML = "";

  if (productCount === null) {
    return;
  }

  for (let index = 0; index < productCount; index++) {
    const savedValue = currentValues[index] || { name: "", price: "", quantity: "" };
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <h3>Product ${index + 1}</h3>
      <div class="product-grid">
        <div class="product-field">
          <label for="productName-${index}">Product Name</label>
          <input type="text" id="productName-${index}" value="${escapeAttribute(savedValue.name)}" placeholder="Product Name">
        </div>
        <div class="product-field">
          <label for="productPrice-${index}">Price</label>
          <input type="number" id="productPrice-${index}" min="0.01" step="0.01" value="${escapeAttribute(savedValue.price)}" placeholder="Price">
        </div>
        <div class="product-field">
          <label for="productQuantity-${index}">Quantity</label>
          <input type="number" id="productQuantity-${index}" min="0.01" step="0.01" value="${escapeAttribute(savedValue.quantity)}" placeholder="Quantity">
        </div>
      </div>
    `;

    productsContainer.appendChild(productCard);
  }
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setValidationMessage(message, isSuccess = false) {
  validationMessage.textContent = message;
  validationMessage.classList.toggle("success", isSuccess);
}

function validateOrderInputs(productCount) {
  const customerName = customerNameInput.value.trim();

  if (customerName === "") {
    return "Customer Name is required.";
  }

  if (productCount === null) {
    return "Number of Products must be a valid positive whole number.";
  }

  for (let index = 0; index < productCount; index++) {
    const productName = document.getElementById(`productName-${index}`);
    const productPrice = document.getElementById(`productPrice-${index}`);
    const productQuantity = document.getElementById(`productQuantity-${index}`);
    const price = productPrice ? getPositiveNumber(productPrice.value) : null;
    const quantity = productQuantity ? getPositiveNumber(productQuantity.value) : null;

    if (!productName || productName.value.trim() === "") {
      return `Product Name is required for product ${index + 1}.`;
    }

    if (price === null) {
      return `Price must be a valid positive number for product ${index + 1}.`;
    }

    if (quantity === null) {
      return `Quantity must be a valid positive number for product ${index + 1}.`;
    }
  }

  return "";
}

function calculateOrder() {
  const productCount = getPositiveWholeNumber(productCountInput.value);

  if (productCount !== null && productsContainer.children.length !== productCount) {
    renderProductInputs();
  }

  const validationError = validateOrderInputs(productCount);

  if (validationError !== "") {
    setValidationMessage(validationError);
    orderSummary.innerHTML = `<p class="empty-summary">Please correct the order details, then calculate again.</p>`;
    return;
  }

  const customerName = customerNameInput.value.trim();
  const deliveryOption = deliveryOptionSelect.value;
  const products = [];
  let subtotal = 0;

  for (let index = 0; index < productCount; index++) {
    const productName = document.getElementById(`productName-${index}`).value.trim();
    const price = getPositiveNumber(document.getElementById(`productPrice-${index}`).value);
    const quantity = getPositiveNumber(document.getElementById(`productQuantity-${index}`).value);
    const amount = calculateItemAmount(price, quantity);

    subtotal += amount;
    products.push({
      productName,
      price,
      quantity,
      amount
    });
  }

  const discountAmount = calculateDiscount(subtotal);
  const discountRate = getDiscountRate(subtotal);
  const deliveryFee = getDeliveryFee(deliveryOption);
  const deliveryType = getDeliveryType(deliveryOption);
  const finalAmount = subtotal - discountAmount + deliveryFee;

  showOrderSummary(customerName, products, subtotal, discountRate, discountAmount, deliveryType, deliveryFee, finalAmount);
  setValidationMessage("Order calculated successfully.", true);
}

function showOrderSummary(customerName, products, subtotal, discountRate, discountAmount, deliveryType, deliveryFee, finalAmount) {
  let productDetails = "";

  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    productDetails += `
      <li>
        <strong>${escapeHtml(product.productName)}</strong><br>
        Price: ${formatCurrency(product.price)}<br>
        Quantity: ${product.quantity}<br>
        Amount: ${formatCurrency(product.amount)}
      </li>
    `;
  }

  orderSummary.innerHTML = `
    <h2>MINI STORE CHECKOUT SYSTEM</h2>
    <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
    <ol>${productDetails}</ol>
    <h3>ORDER SUMMARY</h3>
    <div class="summary-lines">
      <div class="summary-row"><span>Subtotal:</span><strong>${formatCurrency(subtotal)}</strong></div>
      <div class="summary-row"><span>Discount Rate:</span><strong>${discountRate}%</strong></div>
      <div class="summary-row"><span>Discount Amount:</span><strong>${formatCurrency(discountAmount)}</strong></div>
      <div class="summary-row"><span>Delivery Type:</span><strong>${deliveryType}</strong></div>
      <div class="summary-row"><span>Delivery Fee:</span><strong>${formatCurrency(deliveryFee)}</strong></div>
      <div class="summary-row"><span>Final Amount:</span><strong>${formatCurrency(finalAmount)}</strong></div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initializeCheckoutApp() {
  customerNameInput = document.getElementById("customerName");
  productCountInput = document.getElementById("productCount");
  productsContainer = document.getElementById("productsContainer");
  deliveryOptionSelect = document.getElementById("deliveryOption");
  calculateBtn = document.getElementById("calculateBtn");
  validationMessage = document.getElementById("validationMessage");
  orderSummary = document.getElementById("orderSummary");

  if (!customerNameInput || !productCountInput || !productsContainer || !deliveryOptionSelect || !calculateBtn || !validationMessage || !orderSummary) {
    return;
  }

  productCountInput.addEventListener("input", renderProductInputs);
  productCountInput.addEventListener("change", renderProductInputs);
  calculateBtn.addEventListener("click", calculateOrder);

  renderProductInputs();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCheckoutApp);
  } else {
    initializeCheckoutApp();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateItemAmount,
    calculateDiscount,
    getDeliveryFee
  };
}

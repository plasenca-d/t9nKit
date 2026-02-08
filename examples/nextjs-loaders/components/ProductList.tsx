"use client";

import { useState } from "react";
import { useNextTranslation } from "t9nkit/nextjs/client";

interface Product {
  id: number;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Laptop", price: 999.99 },
  { id: 2, name: "Mouse", price: 29.99 },
  { id: 3, name: "Keyboard", price: 79.99 },
];

export default function ProductList() {
  const { t, tc } = useNextTranslation();
  const [cart, setCart] = useState<number[]>([]);

  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  return (
    <div className="product-list">
      <h3>{t("nav.products")}</h3>

      <div className="products-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <h4>{product.name}</h4>
            <p className="price">
              {t("product.price", { price: tc(product.price, "USD") })}
            </p>
            <button onClick={() => addToCart(product.id)}>
              {t("product.addToCart")}
            </button>
          </div>
        ))}
      </div>

      {/* Pluralization from JSON loader */}
      <div className="cart-summary">
        <p>{t("product.cartItems", { count: cart.length })}</p>
      </div>
    </div>
  );
}

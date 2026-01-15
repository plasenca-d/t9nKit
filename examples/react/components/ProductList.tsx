/**
 * ProductList Component
 * 
 * Shows:
 * - Interpolation
 * - Number/Currency formatting
 * - Conditional rendering based on translations
 */

import { useState } from 'react';
import { useTranslation } from '../../../src/react';

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Pro', price: 999.99, inStock: true },
  { id: 2, name: 'Wireless Mouse', price: 29.99, inStock: true },
  { id: 3, name: 'Mechanical Keyboard', price: 149.99, inStock: false },
  { id: 4, name: 'USB-C Hub', price: 59.99, inStock: true },
];

export default function ProductList() {
  const { t, tc } = useTranslation();
  const [cart, setCart] = useState<number[]>([]);

  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  return (
    <section className="products">
      <div className="container">
        <h2>{t('nav.products')}</h2>
        
        <div className="product-grid">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              
              {/* Price with currency formatting */}
              <p className="product-price">
                {t('product.price', { price: tc(product.price, 'USD') })}
              </p>
              
              {/* Stock status */}
              <p className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? t('product.inStock') : t('product.outOfStock')}
              </p>
              
              {/* Add to cart button */}
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="btn-add-to-cart"
              >
                {t('product.addToCart')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

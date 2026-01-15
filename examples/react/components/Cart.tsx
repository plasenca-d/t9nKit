/**
 * Cart Component
 * 
 * Shows:
 * - Pluralization
 * - Conditional rendering
 * - Multiple translation helpers
 */

import { useState } from 'react';
import { useTranslation } from '../../../src/react';

export default function Cart() {
  const { t, tc } = useTranslation();
  const [items, setItems] = useState<number[]>([99.99, 29.99, 59.99]);

  const total = items.reduce((sum, price) => sum + price, 0);
  const itemCount = items.length;

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <section className="cart">
      <div className="container">
        <h2>{t('cart.title')}</h2>
        
        {/* Show empty state if no items */}
        {itemCount === 0 ? (
          <p className="cart-empty">{t('cart.empty')}</p>
        ) : (
          <>
            {/* Pluralization: "0 items", "1 item", "5 items" */}
            <p className="cart-count">
              {t('cart.items', { count: itemCount })}
            </p>
            
            {/* Cart items */}
            <div className="cart-items">
              {items.map((price, index) => (
                <div key={index} className="cart-item">
                  <span>Item #{index + 1}</span>
                  <span>{tc(price, 'USD')}</span>
                  <button onClick={() => removeItem(index)}>
                    {t('common.cancel')}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Cart total */}
            <div className="cart-total">
              <strong>{t('cart.total')}:</strong>
              <strong>{tc(total, 'USD')}</strong>
            </div>
            
            {/* Checkout button */}
            <button className="btn-checkout">
              {t('cart.checkout')}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * React Island Component for Astro
 * 
 * This shows how to use t9nKit in a React component
 * that's used as an Astro island (client:load, client:visible, etc.)
 * 
 * Usage in Astro:
 * ```astro
 * ---
 * import ProductCard from '~/components/ProductCard';
 * ---
 * <ProductCard client:load lang="es" />
 * ```
 */

import { useState } from 'react';
import { createReactTranslator } from '../../../src/react';
import { i18nConfig, type AppLanguage } from '../i18n-config';

interface Props {
  lang: AppLanguage;
  productId?: number;
}

export default function ProductCard({ lang, productId = 1 }: Props) {
  // Use createReactTranslator for Astro islands
  // This doesn't require a Provider since each island is independent
  const { t, tc } = createReactTranslator(i18nConfig, lang);
  
  const [quantity, setQuantity] = useState(1);
  const price = 99.99;

  return (
    <div className="product-card-island">
      <h3>{t('product.name')} #{productId}</h3>
      
      <p className="price">
        {t('product.price', { price: tc(price, 'USD') })}
      </p>
      
      <div className="quantity-selector">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
          -
        </button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>
          +
        </button>
      </div>
      
      <p className="total">
        Total: {tc(price * quantity, 'USD')}
      </p>
      
      <button className="add-to-cart">
        {t('product.addToCart')}
      </button>
    </div>
  );
}

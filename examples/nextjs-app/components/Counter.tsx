/**
 * Counter Component - Client Component
 * components/Counter.tsx
 * 
 * Example of interactive Client Component with translations
 */

'use client';

import { useState } from 'react';
import { useNextTranslation } from 't9nkit/nextjs';

export default function Counter() {
  const { t } = useNextTranslation();
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h3>Interactive Counter (Client Component)</h3>
      
      {/* Pluralization example */}
      <p>
        {count === 0 && 'No clicks yet'}
        {count === 1 && '1 click'}
        {count > 1 && `${count} clicks`}
      </p>
      
      <div className="counter-buttons">
        <button onClick={() => setCount(count - 1)}>
          -
        </button>
        <span>{count}</span>
        <button onClick={() => setCount(count + 1)}>
          +
        </button>
      </div>
      
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

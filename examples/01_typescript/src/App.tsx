import React from 'react';

import { proxy } from 'valtio/vanilla';
import { useValtio } from 'use-valtio';

const countState = proxy({ nested: { count: 0 } });
const Counter = () => {
  // FIXME how can we avoid type assertion?
  const count = useValtio(countState, ['nested', 'count'] as [
    'nested',
    'count',
  ]);
  return (
    <div>
      {count}{' '}
      <button type="button" onClick={() => ++countState.nested.count}>
        +1
      </button>
    </div>
  );
};
const App = () => (
  <div>
    <Counter />
  </div>
);

export default App;

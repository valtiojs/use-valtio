import { proxy } from 'valtio/vanilla';
import { useValtio } from 'use-valtio';

const countState = proxy({ nested: { count: 0 } });
const Counter = () => {
  const snap = useValtio(countState);
  return (
    <div>
      {snap.nested.count}{' '}
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

import React, { JSX } from 'react';

type NgForProps<T> = {
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
};

function NgFor<T>({ items, render }: NgForProps<T>): JSX.Element {
  return <>{items.map((item, index) => render(item, index))}</>;
}

export default NgFor;

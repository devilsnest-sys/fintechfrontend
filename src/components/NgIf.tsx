import React from 'react';

type NgIfProps = {
  condition: boolean;
  children: React.ReactNode;
};

const NgIf: React.FC<NgIfProps> = ({ condition, children }) => {
  return condition ? <>{children}</> : null;
};

export default NgIf;

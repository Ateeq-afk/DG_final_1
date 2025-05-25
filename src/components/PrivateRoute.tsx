import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  return <>{children}</>;
}
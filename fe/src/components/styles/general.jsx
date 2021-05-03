import React from 'react';
import { Link as GLink } from 'gatsby';
import styled from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin:auto;
`
// export const Container = ({ children, ...args }) => (
//   <div className="container" {...args}>
//     {children}
//   </div>
// );

const SectionComponent = styled.section`
  background: ${({ background }) => background}
`

export const Link = styled(GLink)`
  color: var(--color-blue);
  &:hover {
    color: var(--color-blue);
  }
`;

export const Section = ({ children, ...args }) => { 
  return <SectionComponent className="section" {...args}>
    {children}
  </SectionComponent>
};

export const MatIconLink = ({ ...args }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
      />
    </svg>
  );
};

import React from 'react';
import styled from 'styled-components';
import { Link as YLink } from './general';

const Nav = styled.nav`
  background-color: #24292e;
  color: var(--color-white);
  /* min-height: 50vh; */
  width: 100%;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.5rem;
`;

const Link = styled(YLink)`
  color: rgba(255,255,255,0.8);
  text-transform: lowercase;
  font-size: 15px;
  margin: 8px;
  &:hover {
    color: rgba(255,255,255,0.9);
    background-color: transparent;
  }
`;

const Title = styled.div`
  color: var(-color-white);
  text-transform: lowercase;
  font-size: 16px;
  margin: 8px;
`

const Sticky = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  padding: 10px 0;
  background-color: #24292e;
  color: var(--color-white);
`;

const Navbar = ({ children }) => (
  <Nav role="navigation" aria-label="main-navigation">
    {children}
  </Nav>
);
Navbar.Sticky = ({ children, ...args }) => <Sticky {...args}>{children} </Sticky>;
Navbar.Link = ({ children, ...args }) => <Link {...args}>{children}</Link>;
Navbar.Title = Title
export { Navbar };

import React from 'react';

import { Navbar as NB } from './styles/navbar';
import { Container } from './styles/general';

class Navbar extends React.Component {
  render() {
    return (
      <NB>
        <NB.Sticky>
          <Container style={{display: 'flex', flexDirection: 'row'}}>
            <NB.Title>Ocean West tree service</NB.Title>
            <div style={{flex: 1}}></div>
            <NB.Link to="#services">services</NB.Link>
            <NB.Link to="#about">about</NB.Link>
            <NB.Link to="#certifications">certifications</NB.Link>
            <NB.Link to="#contact">contact us</NB.Link>
          </Container>
        </NB.Sticky>
      </NB>
    );
  }
}

export default Navbar;
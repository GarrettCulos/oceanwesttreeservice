import React from 'react';
import styled from 'styled-components';
import { StaticQuery, graphql } from 'gatsby';

import { Container } from './styles/general';

const FooterItem = styled.div`
  padding: 1rem;
  font-size: 14px;
`
class Navbar extends React.Component {
  render() {
    return <StaticQuery
      query={graphql`
        query FooterQuery {
          site {
            siteMetadata {
              email
              title
              phone
              facebookLink
            }
          }
        }
      `}
      render={data => (
        <footer className="footer">
          <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row' }}>
              <FooterItem>@2021 {data.site.siteMetadata.title}</FooterItem>
              <FooterItem>{data.site.siteMetadata.email}</FooterItem>
              <FooterItem>{data.site.siteMetadata.phone}</FooterItem>
              <FooterItem><a href={data.site.siteMetadata.facebookLink}>Facebook</a></FooterItem>
            </div>
          </Container>
          <Container className="lvl2" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row' }}>
              <FooterItem>a <a href="https://www.yetilabs.ca" target="_blank">yetilabs</a> project</FooterItem>
            </div>
          </Container>
        </footer>
      )}
    />;
  }
}

export default Navbar;
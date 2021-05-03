import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

import Navbar from './navbar';
import Footer from './footer';
import '../all.scss';

const TemplateWrapper = ({ children }) => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        site {
          siteMetadata {
            title
            description
            url
            image
            themeColor
          }
        }
      }
    `}
    render={data => (
      <>
        <Helmet>
          <html lang="en" />
          <title>{data.site.siteMetadata.title}</title>
          <meta name="description" content={data.site.siteMetadata.description} />

          <link rel="apple-touch-icon" sizes="52x52" href="/img/favicon-52x52.png" />
          <link rel="icon" type="image/png" href="/img/favicon-13x13.png" sizes="13x13" />
          <link rel="icon" type="image/png" href="/img/favicon-32x32.png" sizes="32x32" />
          <link rel="icon" type="image/png" href="/img/favicon-52x52.png" sizes="52x52" />

          <link rel="mask-icon" href="/img/yeti-logo.svg" color="#ff4400" />
          <meta name="theme-color" content={data.site.siteMetadata.themeColor} />

          <meta property="og:type" content={data.site.siteMetadata.type} />
          <meta property="og:title" content={data.site.siteMetadata.title} />
          <meta property="og:url" content={data.site.siteMetadata.url} />
          <meta property="og:image" content={data.site.siteMetadata.image} />
        </Helmet>
        <Navbar />
        <div>{children}</div>
        <Footer />
      </>
    )}
  />
);

export default TemplateWrapper;

import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import ContactForm from '../components/contactForm'
import { Section, Container } from '../components/styles/general';
import { ServicePreviewTemplate } from '../templates/services-page';

export default class IndexPage extends React.Component {
  render() {
    const { data } = this.props;
    const { edges: services } = data.allMarkdownRemark;
    console.log(services);
    return (
      <Layout>
        <Section style={{padding: 0}}>
          <div style={{width: '100%', height: '400px', backgroundColor: 'grey'}}>
            Video Banner
          </div>          
        </Section>
        <Section id="services">
        <Container style={{display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {services.map(({ node: project }) => (
              <div style={{display: "flex", maxWidth: "300px", flex: 1}}>
                  <ServicePreviewTemplate
                    key={project.id}
                    service={project.frontmatter.service}
                    tags={project.frontmatter.tags}
                    description={project.excerpt}
                    logoUrl={project.frontmatter.icon}/>
                </div>
              ))}
          </Container>
        </Section>
        <Section background={'rgba(193,171,16,0.22)'} id="certifications">
          <Container>
            <h3>Certifications</h3>
            images of cets here
          </Container>
        </Section>
        <Section id="contact">
          <Container>
            <h3 style={{marginBottom: '16px'}}>Contact Us</h3>
            <ContactForm />
          </Container>
        </Section>
        <Section background={'rgba(0,0,0,0.1)'} id="about">
          <Container>
            <h3>About Us</h3>
          </Container>
        </Section>        
      </Layout>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      edges: PropTypes.array
    })
  })
};

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___title] }
      filter: { frontmatter: { templateKey: { eq: "services-page" } } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 400)
          id
          fields {
            slug
          }
          frontmatter {
            templateKey
            service
            icon
            tags
          }
        }
      }
    }
  }
`;

module.exports = {
  siteMetadata: {
    title: 'Ocean West Tree Service',
    description: 'Trees be gone!',
    url: 'www.oceanwesttreeservice.com',
    image: '/img/whale.jpg',
    themeColor: '#24292e',
    email: 'oceanwesttreeservice@gmail.com',
    phone: 1234567890,
    facebookLink: 'https://www.facebook.com/pages/category/Agricultural-Service/Ocean-West-Tree-Service-120124329392092/'
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Ocean West Tree Service`,
        short_name: `Ocean West`,
        start_url: `/`,
        background_color: `#fff`,
        description: 'The empty vessel for my mind.',
        theme_color: `#24292e`,
        display: `standalone`,
        icon: `static/img/favicon-52x52.png`, // This path is relative to the root of the site.
        icons: [
          {
            src: `/static/img/logo-192x192.png`,
            sizes: `192x192`,
            type: `image/png`
          },
          {
            src: `/static/img/logo-512x512.png`,
            sizes: `512x512`,
            type: `image/png`
          }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'YOUR_GOOGLE_ANALYTICS_TRACKING_ID',
        // Puts tracking script in the head instead of the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: ['/preview/**', '/do-not-track/me/too/'],
        // Enables Google Optimize using your container Id
        optimizeId: 'YOUR_GOOGLE_OPTIMIZE_TRACKING_ID',
        // Any additional create only fields (optional)
        sampleRate: 5,
        siteSpeedSampleRate: 10,
        cookieDomain: 'yetilabs.ca'
      }
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
    {
      // keep as first gatsby-source-filesystem plugin for gatsby image support
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/static/img`,
        name: 'uploads'
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages'
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/img`,
        name: 'images'
      }
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-relative-images',
            options: {
              name: 'uploads'
            }
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 2048
            }
          },
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              destinationDir: 'static'
            }
          }
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-netlify-cms',
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`
      }
    },
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
          ssr: true,
          minify: true
      },
    },
    'gatsby-plugin-purgecss', // must be after other CSS plugins
    `gatsby-plugin-offline`,
    'gatsby-plugin-netlify', // make sure to keep it last in the array
    // {
    //   resolve: `gatsby-plugin-offline`,
    //   options: {
    //     precachePages: [],
    //     appendScript: require.resolve(`./src/sw.js`)
    //   }
    // },
  ]
};

import { linkReferenceOne } from './mockCommonData';

// const footerLinkOne = {
//   name: 'Careers',
//   reference: linkReferenceOne,
// };

// const footerLinkTwo = {
//   name: 'About us',
//   reference: linkReferenceOne,
// };

// const footerLinksOne = new Array(4).fill(footerLinkOne);
// const footerLinksTwo = new Array(4).fill(footerLinkTwo);

// const footerSocialMedia = {
//   logo: {
//     media: {
//       file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1663076081/twdj7ucrddbfgahsuh89.png',
//       height: 24,
//       mediaId: 'twdj7ucrddbfgahsuh89',
//       name: 'Social Media Logo',
//       width: 24,
//     },
//   },
//   reference: linkReferenceOne,
// };

export const footerColumns = [
  {
    header: 'About us',
    links: [
      {
        name: 'Our Company',
        reference: linkReferenceOne,
      },
      {
        name: 'Careers',
        reference: linkReferenceOne,
      },
      {
        name: 'Sustainability',
        reference: linkReferenceOne,
      },
    ],
  },
  {
    header: 'Terms & conditions',
    links: [
      {
        name: 'General',
        reference: linkReferenceOne,
      },
      {
        name: 'GDPR',
        reference: linkReferenceOne,
      },
      {
        name: 'Cookies',
        reference: linkReferenceOne,
      },
    ],
  },
  {
    header: 'Customer service',
    links: [
      {
        name: 'Order history',
        reference: linkReferenceOne,
      },
      {
        name: 'Customer support',
        reference: linkReferenceOne,
      },
      {
        name: 'My Account',
        reference: linkReferenceOne,
      },
    ],
  },
  {
    header: 'Work with us',
    links: [
      {
        name: 'Contact us',
        reference: linkReferenceOne,
      },
      {
        name: 'Returns',
        reference: linkReferenceOne,
      },
      {
        name: 'FAQs',
        reference: linkReferenceOne,
      },
    ],
  },
];

export const footerLogo = {
  media: {
    file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1676462532/mx6h9pe3i5qskpxvy17z.png',
    mediaId: 'mx6h9pe3i5qskpxvy17z',
    name: 'Logo',
    width: 4975,
    height: 481,
  },
};

export const footerSocialMediaLinks = [
  {
    logo: {
      media: {
        file: 'https://images.us-east-2.aws.commercetools.com/1a6aae69-17a8-469c-992e-fb6a71954696/instagram-icon-nl9hcfFZ.png',
        mediaId: '1a6aae69-17a8-469c-992e-fb6a71954696-in',
        name: 'instagram',
        width: 512,
        height: 512,
      },
    },
    reference: linkReferenceOne,
  },
  {
    logo: {
      media: {
        file: 'https://images.us-east-2.aws.commercetools.com/1a6aae69-17a8-469c-992e-fb6a71954696/facebook-icon-Xninv6fI.png',
        mediaId: '1a6aae69-17a8-469c-992e-fb6a71954696-fb',
        name: 'facebook',
        width: 512,
        height: 512,
      },
    },
    reference: linkReferenceOne,
  },
  {
    logo: {
      media: {
        file: 'https://images.us-east-2.aws.commercetools.com/1a6aae69-17a8-469c-992e-fb6a71954696/youtube-icon-5I2GtHoc.png',
        mediaId: '1a6aae69-17a8-469c-992e-fb6a71954696-yt',
        name: 'youtube',
        width: 512,
        height: 512,
      },
    },
    reference: linkReferenceOne,
  },
];

'use client';

import {
  footerColumns,
  footerLogo,
  footerSocialMediaLinks,
} from '@/helpers/mocks/mockFooterData';
import Footer from '@/components/ui/organisms/footer';

export default function FooterContainer({ locale }: { locale: string }) {
  return (
    <Footer
      columns={footerColumns}
      logo={footerLogo}
      socialMedia={footerSocialMediaLinks}
      locale={locale}
    />
  );
}

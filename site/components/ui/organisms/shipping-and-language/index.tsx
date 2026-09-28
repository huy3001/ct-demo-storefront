import { ShipAndLanguageProps } from './types';
import ShipAndLanguageSectionDesktop from './ship-and-language-desktop';

const ShippingAndLanguageSection = ({ desktopDirection }: ShipAndLanguageProps) => {
  return (
    <div className="hidden lg:block">
      <ShipAndLanguageSectionDesktop direction={desktopDirection ?? 'left'} />
    </div>
  );
};

export default ShippingAndLanguageSection;

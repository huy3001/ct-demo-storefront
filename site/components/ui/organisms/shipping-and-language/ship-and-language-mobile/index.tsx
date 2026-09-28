import { useRef } from 'react';
import Select from '@/components/ui/atoms/dropdown/option-dropdown';
import { useTranslations } from 'use-intl';
import { useShipAndLanguage } from '@/providers/ship-and-language';
import ShippingSelect from './shipping-select';

const ShippingAndLanguageSectionMobile = () => {
  const { selectedLocation, selectedLanguage, onLanguageSelect } =
    useShipAndLanguage();
  const translate = useTranslations();
  const languageButtonRef = useRef<HTMLDivElement>(null);

  return (
    <div className="block border-t py-4 lg:hidden">
      <ShippingSelect />

      <div
        className="pt-5"
        ref={languageButtonRef}
      >
        <p className="text-sm font-semibold text-gray-800 mb-2">
          {translate('common.language')}
        </p>
        <Select
          value={selectedLanguage}
          options={selectedLocation?.languages ?? []}
          onChange={(option) => {
            onLanguageSelect(
              selectedLocation?.languages?.find(
                (lang) => lang.value === option?.value,
              )?.value ?? '',
            );
          }}
        />
      </div>
    </div>
  );
};

export default ShippingAndLanguageSectionMobile;

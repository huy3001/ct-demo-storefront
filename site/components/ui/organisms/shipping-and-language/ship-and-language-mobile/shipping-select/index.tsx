import { useCallback, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import FlagIcons from '@/components/icons/flag-icons';
import { useTranslations } from 'use-intl';
import Dropdown from '@/components/ui/atoms/dropdown';
import { useShipAndLanguage } from '@/providers/ship-and-language';
import { Location } from '../../types';

const ShippingSelect = () => {
  const { locations, selectedLocation, onLocationSelect } =
    useShipAndLanguage();
  const translate = useTranslations();
  const locationButtonRef = useRef<HTMLDivElement>(null);

  const getOptionDisplay = useCallback(
    (location?: Location, showIcon?: boolean) => {
      return (
        <div className="flex w-full cursor-pointer items-center justify-between">
          <div
            className="flex h-6 items-center gap-x-2"
            onClick={() => onLocationSelect(location?.value ?? '')}
          >
            <FlagIcons
              name={location?.flagName ?? ''}
              className="size-4"
            />
            <p className="text-sm text-gray-800">{location?.name}</p>
          </div>
          {showIcon && <ChevronDownIcon className="size-5 text-gray-600" />}
        </div>
      );
    },
    [onLocationSelect],
  );

  return (
    <div
      className="pt-2"
      ref={locationButtonRef}
    >
      <p className="text-sm font-semibold text-gray-800">
        {translate('common.country')}
      </p>
      <div className="relative z-150 pt-2">
        <Dropdown
          customButtonElement={getOptionDisplay(selectedLocation, true)}
        >
          {locations.map((location) => (
            <div
              key={location.label}
              className="px-4 py-2"
            >
              {getOptionDisplay(location)}
            </div>
          ))}
        </Dropdown>
      </div>
    </div>
  );
};

export default ShippingSelect;

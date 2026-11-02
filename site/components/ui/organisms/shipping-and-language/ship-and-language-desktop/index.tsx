import React from 'react';
import FlagIconsSquare from '@/components/icons/flag-icons-square';
import Radio from '@/components/ui/atoms/radio';
import Popover from '@/components/ui/molecules/popover';
import { useTranslations } from 'use-intl';
import useDisclosure from '@/hooks/useDisclosure';
import { useShipAndLanguage } from '@/providers/ship-and-language';
import useListKeyboardNavigation from '@/hooks/useListKeyboardNavigation';
import { classnames } from '@/helpers/utils/classnames';
import { deskTopProps } from '../types';
import FlagButton from './flag-button';

const ShipAndLanguageSectionDesktop = ({ direction = 'right' }: deskTopProps) => {
  const translate = useTranslations();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { locations, selectedLocation, selectedLanguage, onLocationSelect, onLanguageSelect } = useShipAndLanguage();

  const { ref: locationsListRef, activeIndex: locationsActiveIndex } = useListKeyboardNavigation({
    length: locations.length,
    onSelect: (index: number) => onLocationSelect(locations[index].value),
    allow: (ref: React.RefObject<HTMLOListElement | HTMLUListElement | null>) =>
      ref.current === document.activeElement,
  });

  const { ref: languagesListRef, activeIndex: languagesActiveIndex } = useListKeyboardNavigation({
    length: selectedLocation?.languages?.length ?? 0,
    onSelect: (index: number) =>
      selectedLocation?.languages[index] && onLanguageSelect(selectedLocation?.languages[index].value),
    allow: (ref: React.RefObject<HTMLOListElement | HTMLUListElement | null>) =>
      ref.current === document.activeElement,
  });

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      direction={direction}
      buttonElement={() => (
        <FlagButton
          onOpen={onOpen}
          selectedLanguage={selectedLanguage}
          selectedShip={selectedLocation}
        />
      )}
    >
      <div className="w-67.5 p-4">
        <p className="text-14 font-semibold text-gray-800">
          {translate('common.country')}
        </p>
        <ul
          className="flex flex-col gap-y-5 pt-5"
          ref={locationsListRef}
          tabIndex={0}
        >
          {locations.map((location, index) => (
            <div
              key={location.value}
              className={classnames({
                outline: locationsActiveIndex === index,
              })}
            >
              <Radio
                checked={selectedLocation?.value === location.value}
                onSelected={() => onLocationSelect(location.value)}
                tabIndex={-1}
                label={
                  <div className="flex items-center justify-start gap-2">
                    <FlagIconsSquare name={location.flagName} />
                    <p className="text-sm">{location.label}</p>
                  </div>
                }
              />
            </div>
          ))}
        </ul>

        {selectedLocation?.languages &&
          selectedLocation.languages.length > 0 && (
            <div className="pt-5">
              <p className="text-14 font-semibold text-gray-800">
                {translate('common.language')}
              </p>
              <ul
                className="flex flex-col gap-y-5 pt-5"
                ref={languagesListRef}
                tabIndex={0}
              >
                {selectedLocation?.languages.map((language, index) => (
                  <div
                    key={language.value}
                    className={classnames({
                      outline: languagesActiveIndex === index,
                    })}
                  >
                    <Radio
                      checked={
                        language.value ===
                        (selectedLanguage?.value ??
                          selectedLocation?.defaultLanguage)
                      }
                      onSelected={() => onLanguageSelect(language.value)}
                      tabIndex={-1}
                      label={language.name}
                    />
                  </div>
                ))}
              </ul>
            </div>
          )}
      </div>
    </Popover>
  );
};

export default ShipAndLanguageSectionDesktop;

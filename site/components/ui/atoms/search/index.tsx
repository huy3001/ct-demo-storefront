import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon as SearchIcon,
  XMarkIcon as CloseIcon,
} from '@heroicons/react/24/solid';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { useTranslations } from 'use-intl';
import useScrollBlock from '@/hooks/useScrollBlock';
import { useRouter } from '@/i18n/routing';
import SearchItem from './search-item';
import Overlay from '../overlay';
import Button from '../button';
import type { SearchSuggestions } from '@/lib/ct/search-suggestions';

type UserInput = {
  search: string;
};

const EMPTY_SUGGESTIONS: SearchSuggestions = {
  categories: [],
  brands: [],
  products: [],
};

const Search = () => {
  const router = useRouter();
  const { locale } = useParams();
  const { register, handleSubmit, reset, control } = useForm<UserInput>({
    defaultValues: { search: '' },
  });
  const searchValue = useWatch({ control, name: 'search' });
  const translate = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] =
    useState<SearchSuggestions>(EMPTY_SUGGESTIONS);

  const onFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsOpen(false);
  }, []);

  const { blockScroll } = useScrollBlock();

  useEffect(() => {
    blockScroll(isOpen);
  }, [blockScroll, isOpen]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: trimmedQuery, locale });
        const response = await fetch(`/api/search/suggestions?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Unable to load suggestions');
        setSuggestions(await response.json());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions(EMPTY_SUGGESTIONS);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [locale, query]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    if (nextQuery.trim().length < 3) {
      setSuggestions(EMPTY_SUGGESTIONS);
      setIsLoading(false);
    }
    setIsOpen(true);
  }, []);

  const cleanUp = useCallback(() => {
    reset();
  }, [reset]);

  const onSubmit: SubmitHandler<UserInput> = useCallback(
    ({ search }) => {
      if (!search) return;
      router.push(`/search?q=${search}`);
      setIsOpen(false);
    },
    [router],
  );

  function goToSearchResults() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
  }

  const hasSuggestions =
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.products.length > 0;

  return (
    <>
      {isOpen && <Overlay zIndex={49} />}

      <div
        className="relative z-350 xl:px-5"
        ref={containerRef}
      >
        <div
          className={`relative z-50 border-neutral-400 bg-white overflow-hidden lg:rounded-sm lg:border ${
            isOpen ? 'border-b' : 'border'
          }`}
        >
          <form
            className="quick-search relative flex w-full items-stretch"
            ref={form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              title={translate('common.type-search-term')}
              aria-label={translate('common.type-search-term')}
              className="box-content grow border-none p-0 px-3 py-2.5 transition placeholder:text-sm placeholder:text-gray-600 focus:outline-none"
              onFocus={onFocus}
              placeholder={`${translate('common.search-placeholder')}...`}
              {...register('search', {
                onChange,
                onBlur,
              })}
            />
            <button
              data-testid="submit-button"
              type="submit"
              title={translate('common.click-to-search')}
              aria-label={translate('common.click-to-search')}
              className={`shrink-0 border-l border-neutral-400 px-4 py-2.5 transition ${
                isOpen ? 'bg-charcoal' : 'bg-white'
              }`}
            >
              <SearchIcon
                className={`size-6 stroke-0 ${isOpen ? 'fill-white' : 'fill-charcoal'}`}
              />
            </button>
            {searchValue && (
              <button
                data-testid="reset-button"
                type="reset"
                className="absolute right-17.5 top-1/2 block -translate-y-1/2"
                onClick={cleanUp}
                onMouseDown={(e) => e.preventDefault()}
              >
                <CloseIcon className="w-6 fill-charcoal" />
              </button>
            )}
          </form>
        </div>

        <Transition
          as="div"
          show={isOpen}
          className="absolute bottom-0 left-0 max-h-[60vh] w-full translate-y-full overflow-auto bg-white p-5 shadow-sm xl:max-h-[unset] xl:translate-y-[calc(100%-56px)] xl:rounded-md xl:pt-21"
          enter="transition duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            data-testid="search-panel"
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {isLoading && !hasSuggestions ? (
              <p className="text-sm text-charcoal-light">Searching…</p>
            ) : hasSuggestions ? (
              <>
                <SearchItem
                  suggestions={suggestions}
                  setIsOpen={setIsOpen}
                  setQuery={setQuery}
                />
                <div className="col-span-full border-t border-border pt-5 text-center">
                  <Button
                    variant="ghost"
                    onClick={goToSearchResults}
                    className="py-0! text-terra hover:text-charcoal"
                  >
                    <span>View all results for</span>
                    <span className="font-bold ml-1">“{query.trim()}”</span>
                  </Button>
                </div>
              </>
            ) : !isLoading ? (
              <p className="text-sm text-charcoal-light">
                No matching results.
              </p>
            ) : null}
          </div>
        </Transition>
      </div>
    </>
  );
};

export default Search;

'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLocalization } from './api/tenant/useLocalization';

export const useTranslateSearch = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data: languages } = useLocalization({
        with_pagination: false
    });

    const getParam = (key) => searchParams.get(key) || '';

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            // Make sure we're only storing primitive values in URL parameters
            const paramValue = typeof value === 'object' ? value.code : value;
            params.set(key, paramValue);
        } else {
            params.delete(key);
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const getLanguageByCode = (code) =>
        languages?.find(lang => lang.code === code);

    const module = getParam('module');
    const languageCode = getParam('language');
    const comparedToCode = getParam('comparedTo');

    // Look up the full language objects based on codes
    const language = languageCode ? getLanguageByCode(languageCode) : null;
    const comparedTo = comparedToCode ? getLanguageByCode(comparedToCode) : null;

    return {
        module,
        language,
        comparedTo,

        setModule: (value) => updateParam('module', value),
        setLanguage: (value) => updateParam('language', value),  // This will handle both objects and strings
        setComparedTo: (value) => updateParam('comparedTo', value),
    };
};

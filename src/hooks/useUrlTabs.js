'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * A custom hook that manages tab state synchronized with URL parameters
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.defaultTab - The default tab value if none is provided in URL
 * @param {string} options.paramName - The URL parameter name to use (defaults to 'tab')
 * @param {string[]} [options.validTabs] - Optional array of valid tabs for validation
 * @param {boolean} options.preserveScroll - Whether to preserve scroll position (defaults to true)
 * @returns {Object} Tab management utilities
 */
export const useUrlTabs = ({
    defaultTab,
    paramName = 'tab',
    validTabs,
    preserveScroll = true
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getValidTab = () => {
        const urlTab = searchParams.get(paramName);
        if (!urlTab) return defaultTab;
        if (validTabs && !validTabs.includes(urlTab)) return defaultTab;
        return urlTab;
    };

    const [activeTab, setActiveTab] = useState(getValidTab);

    // Keep state in sync with URL param
    useEffect(() => {
        const currentTab = getValidTab();
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const handleTabChange = (_, newTab) => {
        if (newTab === activeTab) return;
        if (validTabs && !validTabs.includes(newTab)) return;

        setActiveTab(newTab);

        const newSearchParams = new URLSearchParams(searchParams.toString());

        if (newTab === defaultTab) {
            newSearchParams.delete(paramName);
        } else {
            newSearchParams.set(paramName, newTab);
        }

        const queryString = newSearchParams.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(newUrl, { scroll: !preserveScroll });
    };

    return {
        activeTab,
        handleTabChange,
        setActiveTab
    };
};

export default useUrlTabs;

import { useSettings } from '@/@core/contexts/settingsContext';
import { axiosInstance } from '@/lib/axios';
import { settingsMerger } from '@/utils/settingsMerger';
import centralChecker from '@/utils/workers/centralChecker';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

export const useConfig = (type) => {
    const { updateSettings } = useSettings();
    const [isCentralChecked, setIsCentralChecked] = useState(false);
    const [isCentral, setIsCentral] = useState(false);
    const initialSettingsApplied = useRef(false);

    // Handle central check
    useEffect(() => {
        const checkCentral = async () => {
            try {
                const result = await centralChecker();
                setIsCentral(result);
                setIsCentralChecked(true);
            } catch (error) {
                console.error('Central check failed:', error);
                setIsCentralChecked(true);
            }
        };

        checkCentral();
    }, []);

    const { data, isLoading, error, ...rest } = useQuery({
        queryKey: ['config', { isCentral, type }],
        queryFn: async () => {
            try {
                const url = isCentral
                    ? '/api/getters/central-settings'
                    : `/tenant/helpers/v1/settings${type ? `?type=${type}` : ''}`;

                const { data } = await axiosInstance.get(url);

                if (!data) {
                    throw new Error('No data received from settings endpoint');
                }

                const mergedSettings = settingsMerger(data?.data);
                return mergedSettings;
            } catch (error) {
                throw new Error(`Failed to fetch config: ${error.message}`);
            }
        },
        enabled: isCentralChecked,
        retry: 2,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // Only update settings once we have the final data
    useEffect(() => {
        if (data && !initialSettingsApplied.current) {
            updateSettings(data);
            initialSettingsApplied.current = true;
        }
    }, [data, updateSettings]);

    return {
        data,
        isLoading: !isCentralChecked || isLoading,
        error,
        isCentral,
        ...rest
    };
};


export const getConfig = async (isCentral, type) => {
    console.log({ isCentral, type });

    const url = isCentral ? '/api/getters/central-settings' : `/tenant/helpers/v1/settings${type ? `?type=${type}` : ''}`;
    const { data } = await axiosInstance.get(url);

    if (!data) {
        throw new Error('No data received from settings endpoint');
    }
    const mergedSettings = settingsMerger(data?.data);
    console.log({ mergedSettings });

    return mergedSettings;
}
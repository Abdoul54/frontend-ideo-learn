import { axiosInstance } from "@/lib/axios"

export const getCentralDomains = async () => {
    const response = await axiosInstance.get('/api/getters/central-domains');

    return { ...response.data };
}
'use client';

import { useAuthSSO, usePing } from "@/hooks/api/useAuth";
import SSO from "@/views/auth/SSO";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SSOProvider({ children }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get parameters
    const login_user = searchParams.get('login_user');
    const token = searchParams.get('token');
    const time = searchParams.get('time');
    const api_key = searchParams.get('api_key');
    const external_user_id = searchParams.get('external_user_id');
    const first_name = searchParams.get('first_name');
    const last_name = searchParams.get('last_name');
    const branch_code = searchParams.get('branch_code');
    const issue_refresh_token = searchParams.get('issue_refresh_token');

    const [success, setSuccess] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [validationComplete, setValidationComplete] = useState(false);
    const ping = usePing();
    const { signIn, isLoading, error: authError } = useAuthSSO();

    // Check if all required parameters are present
    const isToSSOAuth = login_user && token && time && api_key && external_user_id;

    const provisionFieldsChecker = (fields) => {
        // check if the required fields are present and not null based on the fields array field key
        if (!fields) return false;
        return fields.every(field => {
            return field.required ? searchParams.has(field.field) && searchParams.get(field.field) !== null : true;
        });
    }

    // First effect handles validation only
    useEffect(() => {
        if (!api_key || !isToSSOAuth) {
            setValidationComplete(true);
            return;
        }

        ping.mutateAsync({ api_key }).then(data => {
            if (data?.enable_user_provisioning && !provisionFieldsChecker(data?.provisioning_fields)) {
                setLocalError('Required fields are missing');
            }

            // Mark validation as complete regardless of result
            setValidationComplete(true);
        }).catch((error) => {
            setLocalError(error.message || 'Failed to ping');
            setValidationComplete(true);
        });
    }, [api_key, isToSSOAuth]);

    // Second effect handles sign-in only after validation is complete
    useEffect(() => {
        if (!validationComplete || !isToSSOAuth || localError || authError) {
            return;
        }

        const attemptSignIn = async () => {
            try {
                const result = await signIn({
                    login_user,
                    token,
                    time,
                    api_key,
                    external_user_id,
                    first_name,
                    last_name,
                    branch_code,
                    issue_refresh_token
                });

                // Handle successful sign-in
                if (result?.ok) {
                    setSuccess(true);
                    setTimeout(() => {
                        // Redirect to home or another protected page after 3s
                        router.push(pathname || '/home');
                    }, 3000);
                }
            } catch (error) {
                // The error is already handled in the hook
                setLocalError(error.message);
                console.error('Sign-in failed:', error);
            }
        };

        attemptSignIn();
    }, [
        validationComplete,
        localError,
        authError,
        isToSSOAuth,
        login_user,
        token,
        time,
        api_key,
        external_user_id,
        first_name,
        last_name,
        branch_code,
        issue_refresh_token,
        pathname
    ]);

    return (
        <div>
            {!isToSSOAuth && children}
            {isToSSOAuth && <SSO isLoading={isLoading} error={localError || authError?.message} success={success} />}
        </div>
    );
}
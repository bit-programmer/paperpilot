import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";
import { authClient } from "../lib/auth-client";
import { DEFAULT_SIGNIN_ERROR, DEFAULT_SIGNUP_ERROR } from "../utils/constants";
import { passwordSchema } from "../validations/password-validator";

export interface SignUpCreds {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
    callbackURL: string;
    callbackURLAfterVerification: string;
}

export type SignUpResult =
  | { success: true }
  | { success: false };

export const useSignup = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const signUp = useCallback(async (signUpCreds: SignUpCreds) : Promise<SignUpResult> => {
        const { name, email, password, confirmPassword, callbackURL, callbackURLAfterVerification } = signUpCreds;
        setLoading(true);
        setError(null);

        if(!email || !password || !confirmPassword || !name) {
            const msg = "All fields should be non empty";
            toast.error(msg, { position: "top-right" });
            setError(msg);
            setLoading(false);
            return {success: false};
        }


        // Add a password validator
        const result = passwordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            const msg = result.error.issues[0]?.message ?? "Validation failed";

            toast.error(msg, { position: "top-right" });
            setError(msg);
            setLoading(false);

            return { success: false };
        }

        // Attempt to signup
        try {
            const { error } = await authClient.signUp.email({
                name, email, password, callbackURL: callbackURLAfterVerification
            });
            if(error) {
                const msg = error.message ?? DEFAULT_SIGNUP_ERROR;
                setError(msg);
                toast.error(msg);
                return { success: false };
            }
            router.push(callbackURL);
            return { success: true };
        } catch(e) {
            const msg = e instanceof Error ? e.message : DEFAULT_SIGNIN_ERROR;
            logger.error(msg);
            setError(msg);
            toast.error(msg);
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [router]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
         signUp, loading, error, clearError
    };

};
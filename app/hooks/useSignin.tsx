import { useCallback, useState } from "react"
import { authClient } from "../lib/auth-client";
import { logger } from "../lib/logger.client";
import { useRouter } from "next/navigation";
import { DEFAULT_SIGNIN_ERROR } from "../utils/constants";
import { toast } from "sonner";

export interface SignInCreds {
    email: string;
    password: string;
    callbackURL: string;
}

export type SignInResult =
  | { success: true }
  | { success: false };

export const useSignin = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const signIn = useCallback(async (signInCreds: SignInCreds) : Promise<SignInResult> => {
        const { email, password, callbackURL } = signInCreds;
        // Resetting the state
        setLoading(true);
        setError(null);

        if(!email || !password) {
            const msg = "Email or password cannot be empty";
            toast.error(msg, { position: "top-right" });
            setError(msg);
            setLoading(false);
            return {success: false};
        }

        // Attempt to signin
        try {
            const { error } = await authClient.signIn.email({
                email, password, callbackURL
            });
            if(error) {
                const msg = error.message ?? DEFAULT_SIGNIN_ERROR;
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
         signIn, loading, error, clearError
    };

}
import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { organizationService } from "../services/organization.service";

export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start
        .replace(/-+$/, ""); // Trim - from end
};

export const useCheckSlugAvailability = (name: string) => {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const debouncedName = useDebounce(name, 500);

    const slug = slugify(name);

    useEffect(() => {
        const checkSlug = async () => {
            const trimmed = debouncedName.trim();
            if (!trimmed) {
                setIsAvailable(null);
                return;
            }
            setIsChecking(true);
            try {
                const checkSlugValue = slugify(trimmed);
                if (!checkSlugValue) {
                    setIsAvailable(null);
                    return;
                }
                const { data, error } = await organizationService.checkSlug(checkSlugValue);
                if (error) {
                    setIsAvailable(false);
                    return;
                }
                setIsAvailable(data?.status === true);
            } catch (err) {
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkSlug();
    }, [debouncedName]);

    return {
        isChecking,
        isAvailable,
        slug
    };
};

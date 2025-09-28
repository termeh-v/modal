import { isNumber, isObject } from "@termeh-v/utils";
import { computed, useAttrs } from "vue";
import { type ModalAnimations, type ModalProps } from "./internal/types";

/**
 * Extracts and normalizes modal-related attributes from `$attrs`.
 *
 * Supports both `kebab-case` and `camelCase` keys. Provides typed
 * computed properties for modal state, animations, options, and
 * non-modal attributes.
 *
 * @returns An object with reactive properties: `index`, `count`, `animations`, `options`, and `attrs`.
 */
export function useAttributes() {
    const attributes = useAttrs();

    /**
     * Safely casts a value to a number.
     * Returns undefined if the value is not a valid number.
     */
    function numSafe(v: unknown): number | undefined {
        return v && isNumber(v) ? v : undefined;
    }

    /**
     * Safely casts a value to an object of type T.
     * Returns undefined if the value is not a valid object.
     */
    function objectSafe<T extends object>(v: unknown): T | undefined {
        return v && isObject<T>(v) ? v : undefined;
    }

    /** Current index of the modal in its container, defaulting to 0. */
    const index = computed<number>(
        () =>
            numSafe(attributes["vm-index"]) ??
            numSafe(attributes["vmIndex"]) ??
            0
    );

    /** Total number of modals in the container, defaulting to 0. */
    const count = computed(
        () =>
            numSafe(attributes["vm-count"]) ??
            numSafe(attributes["vmCount"]) ??
            0
    );

    /** Modal animation configuration if provided. */
    const animations = computed(
        () =>
            objectSafe<ModalAnimations>(attributes["vm-animations"]) ??
            objectSafe<ModalAnimations>(attributes["vmAnimations"]) ??
            undefined
    );

    /** Modal options object with identifiers and callbacks if provided. */
    const options = computed(
        () =>
            objectSafe<ModalProps>(attributes["vm-options"]) ??
            objectSafe<ModalProps>(attributes["vmOptions"]) ??
            undefined
    );

    /** All attributes that are not reserved for the modal system. */
    const attrs = computed(() => {
        const reservedKeys = new Set([
            "vm-index",
            "vmIndex",
            "vm-count",
            "vmCount",
            "vm-animations",
            "vmAnimations",
            "vm-options",
            "vmOptions",
        ]);

        return Object.fromEntries(
            Object.entries(attributes || {}).filter(
                ([k]) => !reservedKeys.has(k)
            )
        );
    });

    return {
        index,
        count,
        animations,
        options,
        attrs,
    };
}

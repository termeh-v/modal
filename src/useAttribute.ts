import { isNumber, isObject } from "@termeh-v/utils";
import type { Emitter } from "mitt";
import { computed, useAttrs } from "vue";
import {
    type EmitterEvent,
    type ModalAnimations,
    type ModalProps,
} from "./internal/types";

/**
 * Normalizes and extracts modal-related attributes passed via Vue's `$attrs`.
 *
 * It supports both `kebab-case` and `camelCase` keys (e.g., `vm-index` or `vmIndex`)
 * and returns typed, computed properties for core modal data.
 *
 * @returns An object containing computed refs for modal state, configs, and non-reserved attributes.
 */
export function useAttributes() {
    const attributes = useAttrs();

    /**
     * Safely casts a value to `number` if valid, otherwise returns `undefined`.
     * @param v - The value to check.
     * @returns The number or `undefined`.
     */
    function numSafe(v: unknown): number | undefined {
        return v && isNumber(v) ? v : undefined;
    }

    /**
     * Safely casts a value to a specified object type `T` if valid, otherwise returns `undefined`.
     * @template T The expected object type.
     * @param v - The value to check.
     * @returns The typed object or `undefined`.
     */
    function objectSafe<T extends object>(v: unknown): T | undefined {
        return v && isObject<T>(v) ? v : undefined;
    }

    /** Computed ref for the current index of the modal in its container stack (defaults to 0). */
    const index = computed<number>(
        () =>
            numSafe(attributes["vm-index"]) ??
            numSafe(attributes["vmIndex"]) ??
            0
    );

    /** Computed ref for the total number of modals in the container (defaults to 0). */
    const count = computed(
        () =>
            numSafe(attributes["vm-count"]) ??
            numSafe(attributes["vmCount"]) ??
            0
    );

    /** Computed ref for the event emitter instance provided by the container. */
    const emitter = computed(
        () =>
            objectSafe<Emitter<EmitterEvent>>(attributes["vm-emitter"]) ??
            objectSafe<Emitter<EmitterEvent>>(attributes["vmEmitter"]) ??
            undefined
    );

    /** Computed ref for the explicit animation configuration. */
    const animations = computed(
        () =>
            objectSafe<ModalAnimations>(attributes["vm-animations"]) ??
            objectSafe<ModalAnimations>(attributes["vmAnimations"]) ??
            undefined
    );

    /** Computed ref for the modal's core options, including identifiers and handlers. */
    const options = computed(
        () =>
            objectSafe<ModalProps>(attributes["vm-options"]) ??
            objectSafe<ModalProps>(attributes["vmOptions"]) ??
            undefined
    );

    /** Computed ref containing only the attributes not reserved by the modal system. */
    const attrs = computed(() => {
        const reservedKeys = new Set([
            "vm-index",
            "vmIndex",
            "vm-count",
            "vmCount",
            "vm-emitter",
            "vmEmitter",
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
        emitter,
        animations,
        options,
        attrs,
    };
}

import { isNumber, isObject } from "@termeh-v/utils";
import type { Emitter } from "mitt";
import { computed, useAttrs } from "vue";
import {
    type EmitterEvent,
    type ModalAnimations,
    type ModalProps,
} from "./internal/types";

/**
 * Extract and normalize modal-related attributes from the component `$attrs`.
 *
 * Supports both kebab-case and camelCase variations of expected keys and
 * returns computed refs for commonly used values.
 *
 * @returns An object with computed refs: `index`, `count`, `emitter`, `animations`, `options`, and `attrs`.
 */
export function useAttributes() {
    const attributes = useAttrs();

    /**
     * Convert a value to a number if valid.
     *
     * @param v - Value to coerce.
     * @returns A number if `v` is numeric, otherwise `undefined`.
     */
    function numSafe(v: unknown): number | undefined {
        return isNumber(v) ? v : undefined;
    }

    /**
     * Convert a value to an object of a specific shape if valid.
     *
     * @template T - Expected object type.
     * @param v - Value to coerce.
     * @returns The typed object or `undefined`.
     */
    function objectSafe<T extends object>(v: unknown): T | undefined {
        return isObject<T>(v) ? v : undefined;
    }

    /** Computed index of this modal inside its container (0-based). */
    const index = computed<number>(
        () =>
            numSafe(attributes["vm-index"]) ??
            numSafe(attributes["vmIndex"]) ??
            0
    );

    /** Computed total number of modals in the container. */
    const count = computed(
        () =>
            numSafe(attributes["vm-count"]) ??
            numSafe(attributes["vmCount"]) ??
            0
    );

    /** Computed event emitter provided by the container (if any). */
    const emitter = computed(
        () =>
            objectSafe<Emitter<EmitterEvent>>(attributes["vm-emitter"]) ??
            objectSafe<Emitter<EmitterEvent>>(attributes["vmEmitter"]) ??
            undefined
    );

    /** Computed animation configuration provided via attributes (optional). */
    const animations = computed(
        () =>
            objectSafe<ModalAnimations>(attributes["vm-animations"]) ??
            objectSafe<ModalAnimations>(attributes["vmAnimations"]) ??
            undefined
    );

    /** Computed modal props/options forwarded via attributes (optional). */
    const options = computed(
        () =>
            objectSafe<ModalProps>(attributes["vm-options"]) ??
            objectSafe<ModalProps>(attributes["vmOptions"]) ??
            undefined
    );

    /** Computed: all non-reserved attributes that should be forwarded to inner components. */
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

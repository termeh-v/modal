import { isNumber, isObject } from "@termeh-v/utils";
import type { Emitter } from "mitt";
import { computed, useAttrs } from "vue";
import {
    type EmitterEvent,
    type ModalAnimations,
    type ModalProps,
} from "./internal/types";

/**
 * Extracts and normalizes modal-related attributes provided through `$attrs`.
 *
 * The composable supports both kebab-case and camelCase keys (e.g. `vm-index` or `vmIndex`).
 * It returns computed refs for index, count, emitter, animations, options and the
 * remaining (non-reserved) attributes.
 */
export function useAttributes() {
    const attributes = useAttrs();

    /** Convert a value to number if valid, otherwise undefined. */
    function numSafe(v: unknown): number | undefined {
        return v && isNumber(v) ? v : undefined;
    }

    /** Cast a value to an object T if valid, otherwise undefined. */
    function objectSafe<T extends object>(v: unknown): T | undefined {
        return v && isObject<T>(v) ? v : undefined;
    }

    /** Computed: index of this modal in its container stack. */
    const index = computed<number>(
        () =>
            numSafe(attributes["vm-index"]) ??
            numSafe(attributes["vmIndex"]) ??
            0
    );

    /** Computed: total modals count in the container. */
    const count = computed(
        () =>
            numSafe(attributes["vm-count"]) ??
            numSafe(attributes["vmCount"]) ??
            0
    );

    /** Computed: event emitter instance passed from the container (if any). */
    const emitter = computed(
        () =>
            objectSafe<Emitter<EmitterEvent>>(attributes["vm-emitter"]) ??
            objectSafe<Emitter<EmitterEvent>>(attributes["vmEmitter"]) ??
            undefined
    );

    /** Computed: explicit animation configuration (if provided). */
    const animations = computed(
        () =>
            objectSafe<ModalAnimations>(attributes["vm-animations"]) ??
            objectSafe<ModalAnimations>(attributes["vmAnimations"]) ??
            undefined
    );

    /** Computed: modal props/options passed via attributes. */
    const options = computed(
        () =>
            objectSafe<ModalProps>(attributes["vm-options"]) ??
            objectSafe<ModalProps>(attributes["vmOptions"]) ??
            undefined
    );

    /** Computed: all non-reserved attributes forwarded to the inner component. */
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

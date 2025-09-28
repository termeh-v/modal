import { mergeConfig, type DeepPartial } from "@termeh-v/utils";
import type { ContainerOption } from "./types";

/** Default configuration for modal containers. */
let defaultOptions: ContainerOption = {
    closable: true,
    animations: {
        enter: {
            params: { opacity: [0, 1], translateY: ["25%", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        refuse: {
            params: { scaleX: 1.1, scaleY: 1.15, rotate: -2 },
            options: { duration: 0.15, ease: "easeInOut" },
        },
        leave: {
            params: { opacity: [1, 0], translateY: [0, "25%"] },
            options: { duration: 0.1, ease: "easeOut" },
        },
    },
};

/**
 * Updates the global default modal options.
 *
 * Deeply merges the provided partial options with the current defaults.
 * Nested animation keys are fully replaced rather than merged.
 *
 * @param option - Partial options to merge with defaults.
 */
export function setDefaultOptions(option: DeepPartial<ContainerOption>) {
    defaultOptions = mergeConfig(defaultOptions, option, {
        "animations.enter.params": "replace",
        "animations.enter.options": "replace",
        "animations.refuse.params": "replace",
        "animations.refuse.options": "replace",
        "animations.leave.params": "replace",
        "animations.leave.options": "replace",
    });
}

/**
 * Returns the current global default modal options.
 *
 * @returns The active default container configuration.
 */
export function getDefaultOptions(): ContainerOption {
    return defaultOptions;
}

import { mergeConfig, type DeepPartial } from "@termeh-v/utils";
import type { ContainerOption } from "./types";

/**
 * Default container options used when no per-container options are supplied.
 *
 * This value can be mutated via `setDefaultOptions`.
 */
let defaultOptions: ContainerOption = {
    closable: true,
    animations: {
        enter: {
            params: { opacity: [0.85, 1], translateY: ["3rem", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        refuse: {
            params: { scaleX: 1.1, scaleY: 1.15, rotate: -2 },
            options: { duration: 0.15, ease: "easeInOut" },
        },
        leave: {
            params: { opacity: [1, 0], translateY: [0, "3rem"] },
            options: { duration: 0.1, ease: "easeOut" },
        },
        mobileEnter: {
            params: { opacity: [0, 1], translateY: ["10%", 0] },
            options: { duration: 0.1, type: "spring", stiffness: 150 },
        },
        mobileRefuse: {
            params: { scaleY: 1.1 },
            options: { duration: 0.1, ease: "easeInOut" },
        },
        mobileLeave: {
            params: { opacity: [1, 0], translateY: [0, "30%"] },
            options: { duration: 0.1, ease: "easeOut" },
        },
        activate: {
            params: { top: 0, bottom: 0, scale: 1, opacity: 1 },
            options: { duration: 0.2, ease: "easeOut" },
        },
        secondary: {
            params: { top: -8, bottom: "3rem", scale: 0.9, opacity: 0.9 },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        tertiary: {
            params: { top: -16, bottom: "3rem", scale: 0.8, opacity: 0.8 },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        hide: {
            params: { top: 0, bottom: "3rem", scale: 0.7, opacity: 0 },
            options: { duration: 0.2, ease: "easeOut" },
        },
    },
};

/**
 * Update the global default container options by deep-merging the provided partial.
 *
 * Certain animation subpaths are configured to be replaced instead of merged to
 * simplify overriding full animation definitions.
 *
 * @param option - Partial container option overrides.
 */
export function setDefaultOptions(option: DeepPartial<ContainerOption>) {
    defaultOptions = mergeConfig(defaultOptions, option, {
        "animations.enter.params": "replace",
        "animations.enter.options": "replace",
        "animations.refuse.params": "replace",
        "animations.refuse.options": "replace",
        "animations.leave.params": "replace",
        "animations.leave.options": "replace",
        "animations.mobileEnter.params": "replace",
        "animations.mobileEnter.options": "replace",
        "animations.mobileRefuse.params": "replace",
        "animations.mobileRefuse.options": "replace",
        "animations.mobileLeave.params": "replace",
        "animations.mobileLeave.options": "replace",
        "animations.activate.params": "replace",
        "animations.activate.options": "replace",
        "animations.secondary.params": "replace",
        "animations.secondary.options": "replace",
        "animations.tertiary.params": "replace",
        "animations.tertiary.options": "replace",
        "animations.hide.params": "replace",
        "animations.hide.options": "replace",
    });
}

/**
 * Return the currently configured default container options.
 *
 * @returns The effective ContainerOption used as the base configuration.
 */
export function getDefaultOptions(): ContainerOption {
    return defaultOptions;
}

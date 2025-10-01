import { useConfig } from "@termeh-v/composables";
import mitt from "mitt";
import { computed, toValue, watch, type MaybeRefOrGetter } from "vue";
import { getDefaultOptions } from "./internal/options";
import { type ContainerOption, type EmitterEvent } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable for managing a single modal container's runtime state and configuration.
 *
 * It provides reactive state for the modals inside the container, manages its
 * configuration against global defaults, and controls the document body class.
 *
 * @param name - The unique string identifier for this modal container.
 * @param options - Reactive or static custom configuration for this container.
 * @returns An object with container state, configuration, and event emitter.
 */
export function useContainer(
    name: string,
    options: MaybeRefOrGetter<Partial<ContainerOption> | undefined>
) {
    const core = injectCore();
    const emitter = mitt<EmitterEvent>();
    const { config, set: setConfig } = useConfig<ContainerOption>(
        getDefaultOptions()
    );

    /** Reactive array of all modals currently in this container stack. */
    const modals = core.getContainerModals(name);

    /** Computed ref: The total number of modals in the container. */
    const count = computed(() => modals.value.length);

    /** Computed ref: Returns `true` if the container stack is empty. */
    const isEmpty = computed(() => modals.value.length === 0);

    /** Computed ref: The unique key of the topmost (active) modal, or `undefined` if empty. */
    const activeId = computed(() =>
        modals.value.length
            ? modals.value[modals.value.length - 1]?.key
            : undefined
    );

    /**
     * Watches the `options` prop and synchronizes configuration with the global core service
     * and the local `config` ref.
     */
    watch(
        () => toValue(options),
        (v) => {
            core.setOptions(name, v);
            setConfig(v || {});
        },
        { immediate: true }
    );

    /**
     * Watches the modal `count` and toggles the `bodyClass` on the document `<body>` element.
     */
    watch(count, (v) => {
        if (!config.bodyClass) return;
        if (v > 0) {
            document.body.classList.add(config.bodyClass);
        } else {
            document.body.classList.remove(config.bodyClass);
        }
    });

    return {
        config,
        emitter,
        modals,
        count,
        isEmpty,
        activeId,
    };
}

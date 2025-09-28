import { useConfig } from "@termeh-v/composables";
import { computed, toValue, watch, type MaybeRefOrGetter } from "vue";
import { getDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Manages a modal container's state and options.
 *
 * Provides reactive state for modals in a container, including
 * count, active modal ID, and body class toggling. Options are
 * kept in sync with the global core.
 *
 * @param name - Unique identifier of the modal container.
 * @param options - Reactive default or custom container options.
 * @returns An object containing reactive properties: `modals`, `count`, `isEmpty`, and `activeId`.
 */
export function useContainer(
    name: string,
    options: MaybeRefOrGetter<Partial<ContainerOption> | undefined>
) {
    const core = injectCore();
    const { config, set: setConfig } = useConfig<ContainerOption>(
        getDefaultOptions()
    );

    /** Reactive array of modals in this container. */
    const modals = core.getContainerModals(name);

    /** Number of modals in the container. */
    const count = computed(() => modals.value.length);

    /** True if the container has no modals. */
    const isEmpty = computed(() => modals.value.length === 0);

    /** Key of the last (active) modal, or undefined if empty. */
    const activeId = computed(() =>
        modals.value.length
            ? modals.value[modals.value.length - 1]?.key
            : undefined
    );

    /**
     * Watches container options and updates both the core and local configuration.
     * Runs immediately on initialization.
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
     * Watches the modal count to toggle the body class.
     * Adds the configured class when there are modals, removes it when empty.
     */
    watch(count, (v) => {
        if (!config.bodyClass) return;
        if (v && v > 0) {
            document.body.classList.add(config.bodyClass);
        } else {
            document.body.classList.remove(config.bodyClass);
        }
    });

    return {
        modals,
        count,
        isEmpty,
        activeId,
    };
}

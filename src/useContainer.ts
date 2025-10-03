import { useConfig } from "@termeh-v/composables";
import mitt from "mitt";
import { computed, toValue, watch, type MaybeRefOrGetter } from "vue";
import { getDefaultOptions } from "./internal/options";
import { type ContainerOption, type EmitterEvent } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable to manage a single named modal container's runtime state.
 *
 * Provides reactive state for modal instances inside the container, a local
 * event emitter, and keeps the container's configuration synchronized with
 * global defaults.
 *
 * @param name - Unique container identifier.
 * @param options - Reactive or static custom options for the container.
 * @returns The container's config, emitter and reactive helpers.
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

    /** Reactive list of modals for this container. */
    const modals = core.getContainerModals(name);

    /** Computed: number of modals in this container. */
    const count = computed(() => modals.value.length);

    /** Computed: the key of the top-most (active) modal, or undefined. */
    const activeId = computed(() =>
        modals.value.length
            ? modals.value[modals.value.length - 1]?.key
            : undefined
    );

    /** Computed: whether the container has no modals. */
    const isEmpty = computed(() => modals.value.length === 0);

    // Sync provided options with core and local config
    watch(
        () => toValue(options),
        (v) => {
            core.setOptions(name, v);
            setConfig(v || {});
        },
        { immediate: true }
    );

    // Toggle bodyClass based on presence of modals
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

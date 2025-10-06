import { useConfig } from "@termeh-v/composables";
import mitt, { type Emitter } from "mitt";
import { computed, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";
import { getDefaultOptions } from "./internal/options";
import {
    type ContainerOption,
    type EmitterEvent,
    type Modal,
} from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Manage the runtime state for a named modal container.
 *
 * This composable exposes the container's reactive configuration, a local
 * event emitter used to communicate modal state changes, and helpers such as
 * the reactive list of modals and the active modal id.
 *
 * @param name - Unique identifier for the container.
 * @param options - MaybeRefOrGetter providing per-container partial options.
 * @returns An object with `config`, `emitter`, `modals`, `count`, `isEmpty`, and `activeId`.
 */
export function useContainer(
    name: string,
    options: MaybeRefOrGetter<Partial<ContainerOption> | undefined>
): {
    config: ContainerOption;
    emitter: Emitter<EmitterEvent>;
    modals: Ref<Modal[]>;
    count: Ref<number>;
    activeId: Ref<string | undefined>;
    isEmpty: Ref<boolean>;
} {
    const core = injectCore();
    const emitter = mitt<EmitterEvent>();
    const { config, set: setConfig } = useConfig<ContainerOption>(
        getDefaultOptions()
    );

    /** Reactive list of modals currently registered in the container. */
    const modals = core.getContainerModals(name);

    /** Computed number of modals in the container. */
    const count = computed(() => modals.value.length);

    /** Computed key of the top-most (active) modal, or undefined when none. */
    const activeId = computed(() =>
        modals.value.length
            ? modals.value[modals.value.length - 1]?.key
            : undefined
    );

    /** Computed boolean indicating whether the container is empty. */
    const isEmpty = computed(() => modals.value.length === 0);

    // Sync provided options with the core manager and local config store.
    watch(
        () => toValue(options),
        (v) => {
            core.setOptions(name, v);
            setConfig(v || {});
        },
        { immediate: true }
    );

    // Toggle a global body class when any modals are present in this container.
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
        activeId,
        isEmpty,
    };
}

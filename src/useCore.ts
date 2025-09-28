import { isObject } from "@termeh-v/utils";
import { computed, inject, ref, type Ref } from "vue";
import { type ContainerOption, type Modal } from "./internal/types";

/**
 * Injects the global modal core from the Vue app context.
 *
 * Must be called inside `setup()`. Throws if `ModalPlugin` is not installed.
 *
 * @returns The modal core instance.
 * @throws {Error} If `ModalPlugin` has not been registered.
 */
export function injectCore() {
    const core = inject<ReturnType<typeof useCore>>("$$modal_plugin");
    if (core) return core;
    throw new Error("ModalPlugin is not installed!");
}

/**
 * Core composable for managing all modal containers globally.
 *
 * Provides reactive storage for container options and modals,
 * along with methods to manipulate them.
 */
export function useCore() {
    /** Reactive map of container options keyed by container ID. */
    const options = ref(new Map<string, Partial<ContainerOption>>());

    /** Reactive map of modals keyed by container ID and modal identifier. */
    const modals = ref(new Map<string, Map<string, Modal>>());

    /**
     * Sets or updates the options for a container.
     *
     * @param container - Container ID.
     * @param option - Options to set, defaults to an empty object.
     */
    function setOptions(
        container: string,
        option: Partial<ContainerOption> = {}
    ) {
        if (container && isObject(option)) {
            options.value.set(container, option);
        } else {
            options.value.delete(container);
        }
    }

    /**
     * Retrieves the options for a container.
     *
     * @param container - Container ID.
     * @returns Options for the container or an empty object if not found.
     */
    function getOptions(container: string): Partial<ContainerOption> {
        return options.value.get(container) ?? {};
    }

    /**
     * Adds a modal to a container.
     *
     * @param container - Container ID.
     * @param modal - Modal instance to add.
     */
    function addModal(container: string, modal: Modal) {
        let containerModals = modals.value.get(container);
        if (!containerModals) {
            containerModals = new Map();
            modals.value.set(container, containerModals);
        }
        containerModals.set(modal.identifier, modal);
    }

    /**
     * Removes a modal from a container.
     *
     * @param container - Container ID.
     * @param modalId - Modal identifier.
     */
    function removeModal(container: string, modalId: string) {
        const containerModals = modals.value.get(container);
        containerModals?.delete(modalId);
    }

    /**
     * Returns a reactive list of modals for a container.
     *
     * @param container - Container ID.
     * @returns Computed ref with the modals in the container.
     */
    function getContainerModals(container: string): Ref<Modal[]> {
        return computed(() => {
            const containerModals = modals.value.get(container);
            return containerModals ? Array.from(containerModals.values()) : [];
        });
    }

    return {
        setOptions,
        getOptions,
        modals,
        addModal,
        removeModal,
        getContainerModals,
    };
}

import { isObject } from "@termeh-v/utils";
import { computed, inject, ref, type Ref } from "vue";
import { type ContainerOption, type Modal } from "./internal/types";

/**
 * Retrieve the core modal manager instance that the plugin provides via Vue injection.
 *
 * @returns The core modal manager produced by `useCore`.
 * @throws Error when the plugin has not been installed on the current app.
 */
export function injectCore() {
    const core = inject<ReturnType<typeof useCore>>("$$modal_plugin");
    if (core) return core;
    throw new Error("ModalPlugin is not installed!");
}

/**
 * Core modal manager factory.
 *
 * Provides a lightweight global registry for container options and modal
 * instances and exposes functions to mutate and read that state.
 *
 * @returns Public API: `setOptions`, `getOptions`, `modals`, `addModal`, `removeModal`, `getContainerModals`.
 */
export function useCore() {
    const options = ref(new Map<string, Partial<ContainerOption>>());
    const modals = ref(new Map<string, Map<string, Modal>>());

    /**
     * Set or clear options for a named container.
     *
     * @param container - Container identifier.
     * @param option - Partial options to store for the container; passing a non-object clears the entry.
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
     * Retrieve options set for a specific container.
     *
     * @param container - Container identifier.
     * @returns Stored partial options or an empty object when none are set.
     */
    function getOptions(container: string): Partial<ContainerOption> {
        return options.value.get(container) ?? {};
    }

    /**
     * Add a modal instance to the registry for a specific container.
     *
     * @param container - Container identifier.
     * @param modal - Modal descriptor to register.
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
     * Remove a modal from the registry for a container.
     *
     * @param container - Container identifier.
     * @param modalId - Identifier of the modal to remove.
     */
    function removeModal(container: string, modalId: string) {
        const containerModals = modals.value.get(container);
        containerModals?.delete(modalId);
    }

    /**
     * Return a reactive array of modal instances for a given container.
     *
     * @param container - Container identifier.
     * @returns A `Ref` wrapping an array of `Modal` instances.
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

import { isObject } from "@termeh-v/utils";
import { computed, inject, ref, type Ref } from "vue";
import { type ContainerOption, type Modal } from "./internal/types";

/**
 * Helper to retrieve the core modal manager provided by the plugin.
 * @returns Core modal manager instance.
 * @throws When the plugin is not installed.
 */
export function injectCore() {
    const core = inject<ReturnType<typeof useCore>>("$$modal_plugin");
    if (core) return core;
    throw new Error("ModalPlugin is not installed!");
}

/**
 * Core modal manager: tracks container options and modal instances globally.
 *
 * Returns methods to set/get container options, add/remove modals and read
 * reactive container modal arrays.
 */
export function useCore() {
    const options = ref(new Map<string, Partial<ContainerOption>>());
    const modals = ref(new Map<string, Map<string, Modal>>());

    /**
     * Set or clear options for a named container.
     * @param container - Container ID
     * @param option - Partial options to set (cleared when invalid)
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
     * Get options previously set for a container.
     * @param container - Container ID
     */
    function getOptions(container: string): Partial<ContainerOption> {
        return options.value.get(container) ?? {};
    }

    /** Add a modal instance into a container's map. */
    function addModal(container: string, modal: Modal) {
        let containerModals = modals.value.get(container);
        if (!containerModals) {
            containerModals = new Map();
            modals.value.set(container, containerModals);
        }
        containerModals.set(modal.identifier, modal);
    }

    /** Remove a modal from a container. */
    function removeModal(container: string, modalId: string) {
        const containerModals = modals.value.get(container);
        containerModals?.delete(modalId);
    }

    /**
     * Return a reactive array (computed) of modals for a container.
     * @param container - Container ID
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

import { isObject } from "@termeh-v/utils";
import { computed, inject, ref, type Ref } from "vue";
import { type ContainerOption, type Modal } from "./internal/types";

/**
 * Injects the global modal core instance from the Vue app context.
 *
 * **Must** be called inside `setup()` or a setup-like function.
 *
 * @returns The global modal core instance.
 * @throws {Error} If the `ModalPlugin` has not been installed and provided the core.
 */
export function injectCore() {
    const core = inject<ReturnType<typeof useCore>>("$$modal_plugin");
    if (core) return core;
    throw new Error("ModalPlugin is not installed!");
}

/**
 * Core composable for **globally managing all modal containers and their content**.
 *
 * It uses reactive Maps to store container options and modal instances.
 */
export function useCore() {
    /** Reactive map storing container options, keyed by container ID. */
    const options = ref(new Map<string, Partial<ContainerOption>>());

    /** Reactive map storing modals, keyed by container ID, then modal identifier. */
    const modals = ref(new Map<string, Map<string, Modal>>());

    /**
     * Sets or updates the configuration options for a specific container.
     *
     * @param container - The unique container ID.
     * @param option - Partial options to apply. Passing an invalid object removes the options.
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
     * Retrieves the custom options set for a container.
     *
     * @param container - The container ID.
     * @returns The container's custom options, or an empty object if none are found.
     */
    function getOptions(container: string): Partial<ContainerOption> {
        return options.value.get(container) ?? {};
    }

    /**
     * Adds a new modal instance to the specified container stack.
     *
     * @param container - The target container ID.
     * @param modal - The modal instance object to add.
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
     * Removes a modal instance from its container.
     *
     * @param container - The container ID where the modal resides.
     * @param modalId - The unique identifier of the modal to remove.
     */
    function removeModal(container: string, modalId: string) {
        const containerModals = modals.value.get(container);
        containerModals?.delete(modalId);
    }

    /**
     * Returns a **reactive array** of all modals currently in a specific container,
     * ordered by insertion.
     *
     * @param container - The container ID.
     * @returns A computed ref containing an array of modal objects.
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

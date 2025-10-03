/**
 * Public entrypoint for the modal package.
 *
 * Re-exports components and composables provided by the library.
 */

/** Base modal component. */
export { default as BaseModal } from "./components/BaseModal.vue";

/** Global modal container component. */
export { default as ModalContainer } from "./components/Container.vue";

/** Plugin exports (ModalPlugin, ModalResolver). */
export * from "./plugin";

/** Composables for creating and managing modals programmatically. */
export * from "./useCreate";
export * from "./useModal";


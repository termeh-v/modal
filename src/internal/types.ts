import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component } from "vue";

/**
 * The area clicked within a modal.
 * 'modal': Content area
 * 'overlay': Background overlay
 */
export type ClickArea = "modal" | "overlay";

/**
 * The method by which a modal was closed.
 * 'manual' for user-triggered close,
 * 'click' for content clicks,
 * 'overlay' for overlay clicks,
 * 'action' for programmatic action.
 */
export type CloseMode = "manual" | "click" | "overlay" | "action";

/** Callback invoked when a modal is opened. */
export type OpenHandler = () => void;

/**
 * Callback invoked when a modal is closed.
 *
 * @param mode - How the modal was closed.
 */
export type CloseHandler = (mode: CloseMode) => void;

/**
 * Callback invoked when the modal body or overlay is clicked.
 *
 * @param mode - Clicked area.
 * @returns True to close the modal, false to keep it open.
 */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/**
 * Callback invoked when a modal action is triggered.
 *
 * @template T - Type of optional action data.
 * @param key - Action key.
 * @param data - Optional data associated with the action.
 * @returns True to close the modal, false to keep it open.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/** Single animation configuration for motion. */
export interface Animation {
    /** Keyframes or property definitions. */
    params?: DOMKeyframesDefinition;
    /** Animation timing options. */
    options?: AnimationOptions;
}

/** Animations used in modal layouts. */
export interface ModalAnimations {
    /** Animation for modal entry. */
    enter: Animation;
    /** Animation for refusal/denial animation. */
    refuse: Animation;
    /** Animation for modal exit. */
    leave: Animation;
}

/** Global configuration for a modal container. */
export interface ContainerOption {
    /** Whether the modal can be closed by clicking on the overlay or modal body. */
    closable: boolean;
    /** CSS class added to `<body>` while a modal is open. */
    bodyClass?: string;
    /** Animations applied to modals in this container. */
    animations: ModalAnimations;
}

/** Configuration options for an individual modal. */
export interface ModalOption {
    /** The container ID this modal belongs to. */
    container: string;
    /** Whether this modal can be manually closed. */
    closable: boolean;
    /** Optional callback invoked when the modal opens. */
    onOpen?: OpenHandler;
    /** Optional callback invoked when the modal closes. */
    onClose?: CloseHandler;
    /** Optional callback invoked on body/overlay click. */
    onClick?: ClickHandler;
    /** Optional callback invoked when a modal action occurs. */
    onAction?: ActionHandler;
}

/**
 * Props passed to a modal component.
 * Extends `ModalOption` with unique identifiers.
 */
export interface ModalProps extends ModalOption {
    /** Unique modal key. */
    key: string;
    /** Internal instance identifier. */
    identifier: string;
}

/**
 * Full modal instance in the system.
 * Contains config, identifiers, and the Vue component.
 */
export interface Modal extends ModalOption {
    /** Unique modal key. */
    key: string;
    /** Internal instance identifier. */
    identifier: string;
    /** The Vue component for this modal. */
    component: Component;
}

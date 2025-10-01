import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component, Raw } from "vue";

/**
 * Defines where a click occurred.
 * - 'modal': Click was **inside** the modal content.
 * - 'overlay': Click was on the **background overlay**.
 */
export type ClickArea = "modal" | "overlay";

/**
 * Defines the **mode** used to close the modal.
 * - 'manual': Closed by **function call**.
 * - 'click': Closed by **clicking inside** the modal content.
 * - 'overlay': Closed by **clicking the overlay**.
 * - 'action': Closed due to a **specific user action** (e.g., form submit).
 */
export type CloseMode = "manual" | "click" | "overlay" | "action";

/**
 * Handler function for the modal **opening** event.
 */
export type OpenHandler = () => void;

/**
 * Handler function for the modal **closing** event.
 * @param mode The mode in which the modal was closed.
 */
export type CloseHandler = (mode: CloseMode) => void;

/**
 * Handler for click events on the modal or overlay.
 * @param mode The area clicked.
 * @returns Promise<boolean> **True** if the click should proceed (e.g., close the modal).
 */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/**
 * Handler for specific actions **inside** the modal (e.g., button press).
 * @template T Optional data type for the action.
 * @param key Unique identifier for the action.
 * @param data Optional data payload.
 * @returns Promise<boolean> **True** if the action was successful and closing is allowed.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

// --- Animation Definitions ---

/**
 * Defines the parameters for a **single animation**.
 */
export interface Animation {
    /** CSS keyframes for the animation. */
    params?: DOMKeyframesDefinition;
    /** Animation options (duration, easing, etc.). */
    options?: AnimationOptions;
}

/**
 * Defines animations for different modal states.
 */
export interface ModalAnimations {
    /** Animation for modal **entering**. */
    enter: Animation;
    /** Animation when an action is **refused**. */
    refuse: Animation;
    /** Animation for modal **leaving**. */
    leave: Animation;
    /** Optional animation to switch to a **activate** state. */
    activate?: Animation;
    /** Optional animation for a **secondary** view layer. */
    secondary?: Animation;
    /** Optional animation for a **tertiary** view layer. */
    tertiary?: Animation;
    /** Optional animation for **hiding** the modal (pushing to stack). */
    hide?: Animation;
}

/**
 * Options for the overall modal **container/overlay**.
 */
export interface ContainerOption {
    /** Whether the modal can be **closed by user interaction** (e.g., overlay click). */
    closable: boolean;
    /** Optional CSS class to apply to the document `<body>` tag. */
    bodyClass?: string;
    /** Collection of all modal animations. */
    animations: ModalAnimations;
}

// --- Modal Instance Definitions ---

/**
 * Base configuration options for a **single modal**.
 */
export interface ModalOption {
    /** The HTML element ID of the container where the modal is mounted. */
    container: string;
    /** Overrides container setting: determines if the modal is **user-closable**. */
    closable: boolean;
    /** Optional handler when the modal **opens**. */
    onOpen?: OpenHandler;
    /** Optional handler when the modal **closes**. */
    onClose?: CloseHandler;
    /** Optional handler for **click** events. */
    onClick?: ClickHandler;
    /** Optional handler for **action** events. */
    onAction?: ActionHandler;
}

/**
 * `ModalOption` plus keys for internal stack management.
 */
export interface ModalProps extends ModalOption {
    /** Unique key for the modal **component type**. */
    key: string;
    /** Unique identifier for this **specific instance**. */
    identifier: string;
}

/**
 * The **complete definition** of a modal managed by the system.
 */
export interface Modal extends ModalOption {
    /** Unique key for the modal **component type**. */
    key: string;
    /** Unique identifier for this **specific instance**. */
    identifier: string;
    /** The **Vue component** to render. */
    component: Raw<Component>;
    /** Props passed to the component. */
    props: Record<string, unknown>;
}

// --- Event Definitions ---

/**
 * Defines internal events emitted by the modal system.
 * The value of each property is the modal's identifier.
 */
export type EmitterEvent = {
    /** Modal was **added** to the stack. */
    added?: string;
    /** Modal is about to be **removed**. */
    beforeRemove?: string;
    /** Activate the modal's **secondary** state. */
    activate?: string;
    /** Transition **back** to the primary/main view. */
    hide?: string;
    /** Transition from **primary to secondary** view. */
    goSecondary?: string;
    /** Transition from **secondary to tertiary** view. */
    goTertiary?: string;
};

/**
 * Union of all valid event names in `EmitterEvent`.
 */
export type ModalCoreEvent = keyof EmitterEvent;

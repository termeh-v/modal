import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component, Raw } from "vue";

/** Where a click occurred: inside modal content or on overlay. */
export type ClickArea = "modal" | "overlay";

/** Mode in which a modal was closed. */
export type CloseMode = "manual" | "click" | "overlay" | "action";

/** Handler called when a modal opens. */
export type OpenHandler = () => void;

/** Handler called when a modal closes. */
export type CloseHandler = (mode: CloseMode) => void;

/** Handler for clicks on modal or overlay. Returns true to proceed (close). */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/** Handler for named actions inside a modal. */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/** Single animation definition (keyframes + options). */
export interface Animation {
    /** CSS keyframes or DOM keyframes definition used by the animation. */
    params?: DOMKeyframesDefinition;
    /** Animation options (duration, easing, etc.). */
    options?: AnimationOptions;
}

/** Collection of animations for various modal states. */
export interface ModalAnimations {
    /** Animation used when a modal enters. */
    enter: Animation;
    /** Animation used when an action is refused. */
    refuse: Animation;
    /** Animation used when a modal leaves. */
    leave: Animation;
    /** Mobile-specific enter animation. */
    mobileEnter: Animation;
    /** Mobile-specific refuse animation. */
    mobileRefuse: Animation;
    /** Mobile-specific leave animation. */
    mobileLeave: Animation;
    /** Optional activate animation (restore to top). */
    activate?: Animation;
    /** Optional secondary-layer animation. */
    secondary?: Animation;
    /** Optional tertiary-layer animation. */
    tertiary?: Animation;
    /** Optional hide animation (push back). */
    hide?: Animation;
}

/** Options for a modal container (overlay). */
export interface ContainerOption {
    /** Whether modals in this container can be closed by user interaction. */
    closable: boolean;
    /** Optional CSS class to add to document body when container has modals. */
    bodyClass?: string;
    /** Animations collection for container modals. */
    animations: ModalAnimations;
}

/** Base options for a single modal instance. */
export interface ModalOption {
    /** Target container ID where the modal will mount. */
    container: string;
    /** Whether this modal instance is closable by user interaction. */
    closable: boolean;
    /** Optional callback executed when the modal opens. */
    onOpen?: OpenHandler;
    /** Optional callback executed when the modal closes. */
    onClose?: CloseHandler;
    /** Optional handler for clicks (modal/overlay). */
    onClick?: ClickHandler;
    /** Optional handler for named actions inside the modal. */
    onAction?: ActionHandler;
}

/** Modal props passed into modal component (internal). */
export interface ModalProps extends ModalOption {
    /** Component key used to identify the modal type. */
    key: string;
    /** Unique instance identifier for this specific modal. */
    identifier: string;
}

/** Complete modal definition managed by the core. */
export interface Modal extends ModalOption {
    /** Component key used to identify the modal type. */
    key: string;
    /** Unique instance identifier for this specific modal. */
    identifier: string;
    /** Vue component to render for the modal. */
    component: Raw<Component>;
    /** Props passed to the modal component. */
    props: Record<string, unknown>;
}

/** Events emitted by the modal system. Values are modal identifiers. */
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

/** Union of event names supported by the core emitter. */
export type ModalCoreEvent = keyof EmitterEvent;

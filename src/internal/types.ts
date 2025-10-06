import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component, Raw } from "vue";

/** Area clicked: either the modal content or the overlay/dimmer. */
export type ClickArea = "modal" | "overlay";

/** Mode describing why a modal was closed. */
export type CloseMode = "manual" | "click" | "overlay" | "action";

/**
 * Representation of modal visual state transitions. Additional custom
 * state strings are allowed.
 */
export type ModalState =
    | "activate"
    | "secondary"
    | "tertiary"
    | "hide"
    | string;

/** Handler called when a modal opens. */
export type OpenHandler = () => void;

/** Handler called when a modal closes; receives the close mode. */
export type CloseHandler = (mode: CloseMode) => void;

/** Click handler that should return a Promise resolving to whether the modal should close. */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/** Action handler invoked by named actions inside modals. */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/**
 * Animation definition pairing keyframes (`params`) with `motion` options.
 */
export interface Animation {
    params?: DOMKeyframesDefinition;
    options?: AnimationOptions;
}

/** Full set of animations used by the modal system. */
export interface ModalAnimations {
    enter: Animation;
    refuse: Animation;
    leave: Animation;
    mobileEnter: Animation;
    mobileRefuse: Animation;
    mobileLeave: Animation;
    activate: Animation;
    secondary: Animation;
    tertiary: Animation;
    hide: Animation;
}

/** Container-level options controlling behavior and animations. */
export interface ContainerOption {
    closable: boolean;
    bodyClass?: string;
    animations: ModalAnimations;
}

/** Base modal option callbacks and flags. */
export interface ModalOption {
    container: string;
    closable: boolean;
    onOpen?: OpenHandler;
    onClose?: CloseHandler;
    onClick?: ClickHandler;
    onAction?: ActionHandler;
}

/** Runtime props forwarded into a modal component instance. */
export interface ModalProps extends ModalOption {
    key: string;
    identifier: string;
}

/**
 * Internal modal descriptor stored in the core registry. Contains the
 * component to render and the props given to it.
 */
export interface Modal extends ModalOption {
    key: string;
    identifier: string;
    component: Raw<Component>;
    props: Record<string, unknown>;
}

/** Events emitted by the container emitter and their payload types. */
export type EmitterEvent = {
    added: string;
    removing: string;
    [key: string]: ModalState;
};

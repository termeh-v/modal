import { animate } from "motion";
import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    toValue,
    type MaybeRefOrGetter,
    type TemplateRef,
} from "vue";
import {
    type ClickArea,
    type CloseMode,
    type ModalAnimations,
} from "./internal/types";
import { useAttributes } from "./useAttribute";
import { injectCore } from "./useCore";

/**
 * Composable to manage a single modal instance's lifecycle and interactions.
 *
 * It integrates with the global core, handles state (active/hidden, closing/loading),
 * animations, and manages user interactions (clicks, actions, close events).
 *
 * @param rootEl - The Vue `TemplateRef` bound to the modal's root DOM element.
 * @returns Reactive state and control methods for managing the modal.
 */
export function useCreate(rootEl: TemplateRef) {
    const closing = ref(false);
    const loading = ref(false);
    const core = injectCore();
    const { index, count, emitter, animations, options, attrs } =
        useAttributes();
    const animator = useAnimation(
        rootEl,
        computed(() => index.value < count.value - 3),
        closing,
        loading,
        animations
    );

    /** Computed ref: `true` if this modal is the top-most (currently visible and interactive). */
    const isActive = computed(() => index.value === count.value - 1);
    /** Computed ref: `true` if this modal is second from the top. */
    const isSecondary = computed(() => index.value === count.value - 2);
    /** Computed ref: `true` if this modal is third from the top. */
    const isTertiary = computed(() => index.value === count.value - 3);
    /** Computed ref: `true` if this modal is hidden behind many others (index < count - 3). */
    const isHidden = computed(() => index.value < count.value - 3);

    /**
     * Executes the close animation and removes the modal from the core system.
     *
     * @param mode - The reason/mode of closing.
     */
    function _close(mode: CloseMode) {
        if (emitter.value && options.value?.key) {
            emitter.value.emit("beforeRemove", options.value.key);
        }

        animator
            .leave(() => (closing.value = true))
            ?.then(() => {
                options.value?.onClose?.(mode);
                core?.removeModal(
                    options.value?.container || "",
                    options.value?.identifier || ""
                );
            });
    }

    /** Event handler: Triggers the `activate` animation if this modal is the target. */
    function _onActivate(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.activate();
    }

    /** Event handler: Triggers the `secondary` animation for stack transition. */
    function _onGoSecondary(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.secondary();
    }

    /** Event handler: Triggers the `tertiary` animation for stack transition. */
    function _onGoTertiary(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.tertiary();
    }

    /** Event handler: Triggers the `hide` animation for stack transition. */
    function _onHide(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.hide();
    }

    /**
     * Handles click events, determining if closing or refusing should occur.
     *
     * @param target - The area clicked: 'modal' or 'overlay'.
     */
    function _onClick(target: ClickArea) {
        if (loading.value) return;
        const mode = target === "modal" ? "click" : "overlay";

        if (typeof options.value?.onClick === "function") {
            loading.value = true;
            options.value
                .onClick(target)
                .then((res) => {
                    loading.value = false;
                    if (res) {
                        _close(mode);
                    } else if (mode === "overlay") {
                        animator.refuse();
                    }
                })
                .catch(() => (loading.value = false));
        } else if (options.value?.closable === true) {
            _close(mode);
        } else if (mode === "overlay") {
            animator.refuse();
        }
    }

    /**
     * Global document click handler to detect if the click occurred on the modal or overlay.
     *
     * @param e - The MouseEvent object.
     */
    function _handleClick(e: MouseEvent) {
        const el = toValue(rootEl) as HTMLElement;
        const dimmer = document.getElementById(
            `modal-dimmer-${options.value?.container || "-"}`
        );

        const target = e.target as HTMLElement;
        if (!el) return;

        if (el.contains(target)) {
            _onClick("modal");
        } else if (isActive.value && dimmer?.contains(target)) {
            _onClick("overlay");
        }
    }

    /** Programmatically closes the modal using the 'manual' mode. */
    function close() {
        if (loading.value) return;
        _close("manual");
    }

    /**
     * Executes a user-defined action handler and conditionally closes the modal.
     *
     * @param key - Identifier for the action.
     * @param data - Optional data payload for the action handler.
     */
    function action(key: string, data?: unknown) {
        if (!options.value?.onAction || loading.value) return;
        loading.value = true;
        options.value
            .onAction(key, data)
            .then((res) => {
                loading.value = false;
                if (res) _close("action");
            })
            .catch(() => (loading.value = false));
    }

    onMounted(() => {
        if (emitter.value && options.value?.key) {
            emitter.value.emit("added", options.value.key);
        }

        // Run enter animation and execute onOpen callback
        animator
            .enter()
            ?.then((k) => k !== "error" && options.value?.onOpen?.());

        // Setup global listeners
        document.addEventListener("click", _handleClick);
        emitter.value?.on("activate", _onActivate);
        emitter.value?.on("hide", _onHide);
        emitter.value?.on("goSecondary", _onGoSecondary);
        emitter.value?.on("goTertiary", _onGoTertiary);
    });

    onUnmounted(() => {
        // Cleanup global listeners
        document.removeEventListener("click", _handleClick);
        emitter.value?.off("activate", _onActivate);
        emitter.value?.off("hide", _onHide);
        emitter.value?.off("goSecondary", _onGoSecondary);
        emitter.value?.off("goTertiary", _onGoTertiary);
    });

    return {
        attrs,
        options,
        loading,
        close,
        action,
        isActive,
        isSecondary,
        isTertiary,
        isHidden,
        index,
        count,
    };
}

/**
 * Composable dedicated to running all modal transition animations using the `motion` library.
 *
 * @param element - The `TemplateRef` for the DOM element to animate.
 * @param hidden - A ref/getter indicating if the modal is deep in the stack (and should skip simple animations).
 * @param closing - A ref/getter indicating if the modal is currently being closed.
 * @param loading - A ref/getter indicating if the modal is busy/loading.
 * @param animations - A ref/getter for the animation definitions.
 * @returns An object with methods for all defined modal animations.
 */
function useAnimation(
    element: TemplateRef,
    hidden: MaybeRefOrGetter<boolean>,
    closing: MaybeRefOrGetter<boolean>,
    loading: MaybeRefOrGetter<boolean>,
    animations: MaybeRefOrGetter<ModalAnimations | undefined>
) {
    const unrefEl = () => toValue(element) as HTMLElement;
    const isHidden = () => toValue(hidden) === true;
    const isClosing = () => toValue(closing) === true;
    const isLoading = () => toValue(loading) === true;
    const unrefAnim = () => toValue(animations);

    /** Runs the **enter** animation when the modal is mounted. */
    function enter() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.enter?.params || { opacity: [0, 1] };
        const options = anim?.enter?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || isHidden()) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **refuse** (shake/bounce) animation, typically on an invalid overlay click. */
    function refuse() {
        if (isHidden() || isClosing() || isLoading()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.refuse?.params || { scale: [1, 1.2] };
        const options = anim?.refuse?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, {
                    ...options,
                    repeat: 1,
                    repeatType: "reverse",
                })
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **leave** animation before the modal is unmounted. */
    function leave(before?: () => void) {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.leave?.params || { opacity: [1, 0] };
        const options = anim?.leave?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || isHidden()) {
                resolve("ignored");
            } else {
                before?.();
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **activate** animation, restoring a modal to the active (top) state. */
    function activate() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.activate?.params || {
            top: 0,
            bottom: 0,
            scale: 1,
            opacity: 1,
        };
        const options = anim?.activate?.options || {
            duration: 0.2,
            ease: "easeOut",
        };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **secondary** animation, moving the modal back one layer. */
    function secondary() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.secondary?.params || {
            top: -8,
            bottom: "3rem",
            scale: 0.9,
            opacity: 0.9,
        };
        const options = anim?.secondary?.options || {
            duration: 0.2,
            type: "spring",
            stiffness: 150,
        };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **tertiary** animation, moving the modal back two layers. */
    function tertiary() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.tertiary?.params || {
            top: -16,
            bottom: "3rem",
            scale: 0.8,
            opacity: 0.8,
        };
        const options = anim?.tertiary?.options || {
            duration: 0.2,
            type: "spring",
            stiffness: 150,
        };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Runs the **hide** animation, pushing the modal far back or hiding it. */
    function hide() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.tertiary?.params || {
            top: 0,
            bottom: "3rem",
            scale: 0.7,
            opacity: 0,
        };
        const options = anim?.tertiary?.options || {
            duration: 0.2,
            ease: "easeOut",
        };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    return {
        enter,
        refuse,
        leave,
        activate,
        secondary,
        tertiary,
        hide,
    };
}

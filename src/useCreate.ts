import { useMediaQueries } from "@termeh-v/composables";
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
    type ModalState,
} from "./internal/types";
import { useAttributes } from "./useAttributes";
import { injectCore } from "./useCore";

/**
 * Manage a single modal instance: lifecycle, interactions and exposes control helpers.
 *
 * The returned API is intended to be used by a modal component to implement
 * user interactions and lifecycle hooks.
 *
 * @param rootEl - TemplateRef that points to the modal root DOM element.
 * @returns An object with modal state refs and control methods.
 */
export function useCreate(rootEl: TemplateRef) {
    const closing = ref(false);
    const loading = ref(false);
    const core = injectCore();
    const { index, count, emitter, animations, options, attrs } =
        useAttributes();
    const animator = useAnimator(
        rootEl,
        closing,
        loading,
        computed(() => index.value < count.value - 3),
        animations
    );

    const isActive = computed(() => index.value === count.value - 1);
    const isSecondary = computed(() => index.value === count.value - 2);
    const isTertiary = computed(() => index.value === count.value - 3);
    const isHidden = computed(() => index.value < count.value - 3);

    /**
     * Close the modal using the specified `CloseMode`.
     *
     * Emits a `removing` event, runs the leave animation and calls the
     * configured `onClose` callback before removing the modal from the core.
     *
     * @param mode - Reason for closing the modal.
     */
    function _close(mode: CloseMode) {
        if (emitter.value && options.value?.key) {
            emitter.value.emit("removing", options.value.key);
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

    /**
     * Handle a click event targeted at the modal or its overlay and close if needed.
     *
     * @param target - The click area: `'modal'` or `'overlay'`.
     */
    function _onClick(target: ClickArea) {
        if (loading.value || closing.value) return;
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
        } else if (mode === "overlay") {
            if (options.value?.closable === true) {
                _close(mode);
            } else {
                animator.refuse();
            }
        }
    }

    /**
     * React to external modal state change events and trigger appropriate animations.
     *
     * @param state - New modal state (activate|secondary|tertiary|hide|...).
     */
    function _onStateChange(state: ModalState) {
        if (state === "activate") {
            animator.activate();
        } else if (state === "secondary") {
            animator.secondary();
        } else if (state === "tertiary") {
            animator.tertiary();
        } else if (state === "hide") {
            animator.hide();
        }
    }

    /**
     * Global click handler that routes clicks to either the modal or the dimmer.
     *
     * @param e - Native mouse event from the document listener.
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

    /**
     * Programmatically close the modal (manual close mode).
     */
    function close() {
        if (loading.value || closing.value) return;
        _close("manual");
    }

    /**
         * Execute an action handler defined in modal options and optionally close on success.
         *
         * @param key - Action key.
         * @param data - Optional payload passed to the action handler.
+     */
    function action(key: string, data?: unknown) {
        if (
            loading.value ||
            closing.value ||
            typeof options.value?.onAction !== "function"
        ) {
            return;
        }

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
        if (options.value?.identifier) {
            emitter.value?.on(options.value?.identifier, _onStateChange);
        }
    });

    onUnmounted(() => {
        // Cleanup global listeners
        document.removeEventListener("click", _handleClick);
        if (options.value?.identifier) {
            emitter.value?.off(options.value?.identifier, _onStateChange);
        }
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
     * Animation helper that runs `motion`-based transitions for a modal element.
     *
     * The helper returns an object with methods to run enter/refuse/leave and state
+ * transitions (activate/secondary/tertiary/hide). Each method returns a Promise
+ * that resolves with a status string or returns early when animation shouldn't run.
+ */
function useAnimator(
    element: TemplateRef,
    isClosing: MaybeRefOrGetter<boolean>,
    isLoading: MaybeRefOrGetter<boolean>,
    isHidden: MaybeRefOrGetter<boolean>,
    animations: MaybeRefOrGetter<ModalAnimations | undefined>
) {
    const { isMobile } = useMediaQueries();
    const unrefEl = () => toValue(element) as HTMLElement;
    const unrefAnim = () => toValue(animations);

    /**
     * Run the enter animation when the modal mounts.
     * @returns Promise resolving to 'ignored'|'done'|'error' or undefined when skipped.
     */
    function enter() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile.value
            ? anim?.mobileEnter?.params
            : anim?.enter?.params) || { opacity: [0, 1] };
        const options = (isMobile.value
            ? anim?.mobileEnter?.options
            : anim?.enter?.options) || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || toValue(isHidden)) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Run the refuse animation (shake/bounce).
     * @returns Promise resolving to 'ignored'|'done'|'error' or undefined when skipped.
     */
    function refuse() {
        if (toValue(isHidden) || toValue(isClosing) || toValue(isLoading))
            return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile.value
            ? anim?.mobileRefuse?.params
            : anim?.refuse?.params) || { scale: 1.1 };
        const options = (isMobile.value
            ? anim?.mobileRefuse?.options
            : anim?.refuse?.options) || { duration: 0.2 };

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

    /**
     * Run the leave animation before the modal is removed.
     * @param before - Optional callback executed immediately prior to animating.
     * @returns Promise resolving to 'ignored'|'done'|'error' or undefined when skipped.
     */
    function leave(before?: () => void) {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile.value
            ? anim?.mobileLeave?.params
            : anim?.leave?.params) || { opacity: 0 };
        const options = (isMobile.value
            ? anim?.mobileLeave?.options
            : anim?.leave?.options) || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || toValue(isHidden)) {
                before?.();
                resolve("ignored");
            } else {
                before?.();
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /** Run the activate animation to restore modal to the active/top state. */
    function activate() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.activate?.params || { scale: 1, opacity: [0, 1] };
        const options = anim?.activate?.options || { duration: 0.2 };

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

    /** Run the secondary animation to move the modal back one layer. */
    function secondary() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.secondary?.params || { scale: 0.9 };
        const options = anim?.secondary?.options || { duration: 0.2 };

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

    /** Run the tertiary animation to move the modal back two layers. */
    function tertiary() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.tertiary?.params || { scale: 0.8 };
        const options = anim?.tertiary?.options || { duration: 0.2 };

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

    /** Run the hide animation to push the modal far back or make it invisible. */
    function hide() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = anim?.hide?.params || { opacity: 0 };
        const options = anim?.hide?.options || { duration: 0.2 };

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

    return { enter, refuse, leave, activate, secondary, tertiary, hide };
}

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
} from "./internal/types";
import { useAttributes } from "./useAttributes";
import { injectCore } from "./useCore";

/**
 * Composable to manage a single modal instance lifecycle and interactions.
 *
 * Returns reactive state and control functions used by the modal component.
 *
 * @param rootEl - TemplateRef to the modal's root DOM element.
 */
export function useCreate(rootEl: TemplateRef) {
    const closing = ref(false);
    const loading = ref(false);
    const core = injectCore();
    const { isMobile } = useMediaQueries();
    const { index, count, emitter, animations, options, attrs } =
        useAttributes();
    const animator = useAnimation(
        rootEl,
        isMobile,
        computed(() => index.value < count.value - 3),
        closing,
        loading,
        animations
    );

    const isActive = computed(() => index.value === count.value - 1);
    const isSecondary = computed(() => index.value === count.value - 2);
    const isTertiary = computed(() => index.value === count.value - 3);
    const isHidden = computed(() => index.value < count.value - 3);

    /** Close the modal using the specified close mode. */
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

    /** Trigger activate animation when the event key matches. */
    function _onActivate(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.activate();
    }

    /** Trigger secondary animation when the event key matches. */
    function _onGoSecondary(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.secondary();
    }

    /** Trigger tertiary animation when the event key matches. */
    function _onGoTertiary(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.tertiary();
    }

    /** Trigger hide animation when the event key matches. */
    function _onHide(k?: string) {
        if (!k || k !== options.value?.key) return;
        animator.hide();
    }

    /**
     * Handle click targeting the modal or overlay and possibly close it.
     * @param target - area that was clicked ('modal'|'overlay')
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
        } else if (mode === "overlay") {
            if (options.value?.closable === true) {
                _close(mode);
            } else {
                animator.refuse();
            }
        }
    }

    /** Global click listener used to detect clicks on root element or dimmer. */
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

    /** Programmatically close modal (manual mode). */
    function close() {
        if (loading.value) return;
        _close("manual");
    }

    /** Execute an action handler and optionally close on success. */
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
 * Animation helper that runs motion-based transitions for a modal element.
 *
 * Exposes methods: enter, refuse, leave, activate, secondary, tertiary, hide.
 */
function useAnimation(
    element: TemplateRef,
    mobile: MaybeRefOrGetter<boolean>,
    hidden: MaybeRefOrGetter<boolean>,
    closing: MaybeRefOrGetter<boolean>,
    loading: MaybeRefOrGetter<boolean>,
    animations: MaybeRefOrGetter<ModalAnimations | undefined>
) {
    const unrefEl = () => toValue(element) as HTMLElement;
    const isMobile = () => toValue(mobile) === true;
    const isHidden = () => toValue(hidden) === true;
    const isClosing = () => toValue(closing) === true;
    const isLoading = () => toValue(loading) === true;
    const unrefAnim = () => toValue(animations);

    /** Run the enter animation when the modal mounts. Resolves with status. */
    function enter() {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile()
            ? anim?.mobileEnter?.params
            : anim?.enter?.params) || { opacity: [0, 1] };
        const options = (isMobile()
            ? anim?.mobileEnter?.options
            : anim?.enter?.options) || { duration: 0.2 };

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

    /** Run the refuse animation (shake/bounce) and resolve with status. */
    function refuse() {
        if (isHidden() || isClosing() || isLoading()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile()
            ? anim?.mobileRefuse?.params
            : anim?.refuse?.params) || { opacity: [0, 1] };
        const options = (isMobile()
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

    /** Run the leave animation before the modal is removed. Calls `before` prior to animating. */
    function leave(before?: () => void) {
        if (isClosing()) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (isMobile()
            ? anim?.mobileLeave?.params
            : anim?.leave?.params) || { opacity: [0, 1] };
        const options = (isMobile()
            ? anim?.mobileLeave?.options
            : anim?.leave?.options) || { duration: 0.2 };

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

    /** Run the activate animation to restore modal to active/top state. */
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

    /** Run the secondary animation to move the modal back one layer. */
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

    /** Run the tertiary animation to move the modal back two layers. */
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

    /** Run the hide animation to push the modal far back or make it invisible. */
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

    return { enter, refuse, leave, activate, secondary, tertiary, hide };
}

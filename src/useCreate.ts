import { animate } from "motion";
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    toValue,
    watch,
    type TemplateRef,
} from "vue";
import { type ClickArea, type CloseMode } from "./internal/types";
import { useAttributes } from "./useAttribute";
import { injectCore } from "./useCore";

/**
 * Composable to manage a single modal instance.
 *
 * Handles animations (enter, refuse, leave), click interactions,
 * and integration with the global modal core.
 *
 * @param rootEl - Root DOM element of the modal.
 * @returns Reactive state and control methods for the modal.
 */
export function useCreate(rootEl: TemplateRef) {
    const loaded = ref(false);
    const loading = ref(false);
    const closing = ref(false);
    const core = injectCore();
    const { index, count, options, animations, attrs } = useAttributes();

    /** True if this modal is the top-most active modal */
    const isActive = computed(() => index.value === count.value - 1);
    /** True if this modal is hidden behind other modals */
    const isHidden = computed(() => index.value < count.value - 1);

    /**
     * Plays the enter animation for the modal.
     *
     * @param done - Optional callback after animation completes.
     */
    function _playEnter(done?: () => void) {
        const el = toValue(rootEl) as HTMLElement;
        const def = { opacity: [0, 1] };
        const params = animations.value?.enter?.params || def;
        const options = animations.value?.enter?.options;

        const onDone = () => {
            loaded.value = true;
            done?.();
        };

        if (closing.value) {
            return;
        } else if (!el || isHidden.value) {
            onDone();
            return;
        }

        animate(el, params, options)
            .then(() => onDone())
            .catch(() => onDone());
    }

    /**
     * Plays the refuse animation when a click outside is denied.
     *
     * @param done - Optional callback after animation completes.
     */
    function _playRefuse(done?: () => void) {
        const el = toValue(rootEl) as HTMLElement;
        const def = { scale: [1, 1.2] };
        const params = animations.value?.refuse?.params || def;
        const options = animations.value?.refuse?.options;

        if (closing.value || loading.value) {
            return;
        } else if (!el || isHidden.value) {
            done?.();
            return;
        }

        animate(el, params, { ...options, repeat: 1, repeatType: "reverse" })
            .then(() => done?.())
            .catch(() => done?.());
    }

    /**
     * Plays the leave animation and marks the modal as closing.
     *
     * @param done - Optional callback after animation completes.
     */
    function _playLeave(done?: () => void) {
        const el = toValue(rootEl) as HTMLElement;
        const def = { opacity: [1, 0] };
        const params = animations.value?.leave?.params || def;
        const options = animations.value?.leave?.options;

        if (closing.value) {
            return;
        } else if (!el || isHidden.value) {
            done?.();
            return;
        }

        const onDone = () => {
            count.value > 1 ? setTimeout(() => done?.(), 100) : done?.();
        };

        closing.value = true;
        animate(el, params, options)
            .then(() => onDone())
            .catch(() => onDone());
    }

    /**
     * Closes the modal and removes it from the core.
     *
     * @param mode - How the modal is closed.
     */
    function _close(mode: CloseMode) {
        _playLeave(() => {
            options.value?.onClose?.(mode);
            core?.removeModal(
                options.value?.container || "",
                options.value?.identifier || ""
            );
        });
    }

    /**
     * Handles click events inside the modal or overlay.
     *
     * @param target - 'modal' or 'overlay' click area.
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
                        _playRefuse();
                    }
                })
                .catch(() => (loading.value = false));
        } else if (options.value?.closable === true) {
            _close(mode);
        } else if (mode === "overlay") {
            _playRefuse();
        }
    }

    /**
     * Document click handler for detecting clicks on modal or overlay.
     *
     * @param e - Mouse event.
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
        } else if (dimmer?.contains(target) && isActive.value) {
            _onClick("overlay");
        }
    }

    /** Programmatically close the modal. */
    function close() {
        if (loading.value) return;
        _close("manual");
    }

    /**
     * Trigger a modal action.
     *
     * @param key - Action key.
     * @param data - Optional data payload.
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
        _playEnter(() => options.value?.onOpen?.());
        document.addEventListener("click", _handleClick);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", _handleClick);
    });

    /** Re-run enter animation if modal becomes active */
    watch(isActive, (v) => {
        if (v) _playEnter();
    });

    return {
        /** All non-modal-specific attributes */
        attrs,
        /** True if modal is performing an action */
        loading,
        /** Close modal programmatically */
        close,
        /** Trigger modal action */
        action,
        /** Modal options object */
        options,
        /** True if top-most active modal */
        isActive,
        /** True if hidden behind other modals */
        isHidden,
        /** Index of this modal in its container */
        modalIndex: index,
        /** Total number of modals in container */
        modalCount: count,
    };
}

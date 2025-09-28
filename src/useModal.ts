import { mergeConfig } from "@termeh-v/utils";
import { customAlphabet } from "nanoid";
import { h, type Component } from "vue";
import Simple from "./components/Simple.vue";
import { getDefaultOptions } from "./internal/options";
import { type ModalOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable for creating and managing individual modals.
 *
 * Handles generating unique modal IDs, merging default, container-specific,
 * and user-provided options, and registering modals with the global core.
 *
 * @returns An object with methods to create modals: `create` and `simple`.
 */
export function useModal() {
    const core = injectCore();
    const generator = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );

    /**
     * Creates and registers a new modal instance.
     *
     * @template Props - Props type for the modal component.
     * @param component - Vue component to render inside the modal.
     * @param props - Props to pass to the component.
     * @param options - Optional configuration, including container and callbacks.
     */
    function create<Props extends Record<string, unknown>>(
        component: Component,
        props: Props,
        options: Partial<ModalOption> = {}
    ) {
        const container = options?.container || "main";
        const identifier = generator(10);
        const key = `${container}-${identifier}`;

        const config = mergeConfig(
            getDefaultOptions(),
            core.getOptions(container)
        );

        const params = {
            key,
            identifier,
            container,
            closable: options?.closable ?? config.closable,
            onOpen: options?.onOpen,
            onClose: options?.onClose,
            onClick: options?.onClick,
            onAction: options?.onAction,
        };

        core.addModal(container, {
            ...params,
            component: h(component, {
                ...props,
                vmAnimations: config.animations,
                vmOptions: params,
            }),
        });
    }

    /**
     * Creates a simple text-based modal with optional title, actions, and icon.
     *
     * @param message - Main message to display in the modal.
     * @param options - Optional modal configuration and additional props.
     */
    function simple(
        message: string,
        options: Partial<
            ModalOption & {
                title?: string;
                primaryAction?: string;
                secondaryAction?: string;
                [key: string]: any;
            }
        > = {}
    ) {
        const {
            title,
            primaryAction: primary,
            secondaryAction: secondary,
            ...otherProps
        } = options;

        create(
            Simple,
            {
                message,
                title,
                primary,
                secondary,
                ...otherProps,
            },
            options
        );
    }

    return { create, simple };
}

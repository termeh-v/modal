import { mergeConfig } from "@termeh-v/utils";
import { customAlphabet } from "nanoid";
import { markRaw, type Component } from "vue";
import Simple from "./components/Simple.vue";
import { getDefaultOptions } from "./internal/options";
import { type ModalOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable for **creating and registering new modal instances** with the core system.
 *
 * Handles ID generation, option merging (global defaults + container options + user options),
 * and adding the modal to the relevant container stack.
 *
 * @returns An object with methods: `create` (for custom components) and `simple` (for basic text alerts).
 */
export function useModal() {
    const core = injectCore();
    const generator = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );

    /**
     * Creates and registers a new modal instance with a custom Vue component.
     *
     * @template Props - Props type for the modal component.
     * @param component - The Vue component to render inside the modal.
     * @param props - Props to pass to the component.
     * @param options - Optional configuration for the modal instance.
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
            component: markRaw(component),
            props: {
                ...props,
                vmOptions: params,
            },
        });
    }

    /**
     * Creates a simple, text-based modal using the built-in `Simple` component.
     *
     * @param message - The main message content to display.
     * @param options - Modal configuration, plus optional title and action button labels.
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

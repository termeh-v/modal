import Simple from "./components/Simple.vue";

import { mergeConfig } from "@termeh-v/utils";
import { customAlphabet } from "nanoid";
import { markRaw, type Component } from "vue";
import { getDefaultOptions } from "./internal/options";
import { type ModalOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Helpers to create modal instances programmatically.
 *
 * Provides `create` for custom components and `simple` for a basic message modal.
 */
export function useModal() {
    const core = injectCore();
    const generator = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );

    /**
     * Create and register a modal instance rendering a provided component.
     *
     * @template Props - Props shape forwarded to the rendered component.
     * @param component - Vue component to render inside the modal.
     * @param props - Props to pass to the component.
     * @param options - Partial modal options (container, callbacks, etc.).
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
     * Create a simple message modal using the built-in `Simple` component.
     *
     * @param message - Main content message for the modal.
     * @param options - Optional modal options and label overrides.
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
            { message, title, primary, secondary, ...otherProps },
            options
        );
    }

    return { create, simple };
}

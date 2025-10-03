import { mergeConfig } from "@termeh-v/utils";
import { customAlphabet } from "nanoid";
import { markRaw, type Component } from "vue";
import Simple from "./components/Simple.vue";
import { getDefaultOptions } from "./internal/options";
import { type ModalOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable that provides helpers to create modal instances programmatically.
 *
 * Methods:
 *  - create: create a modal from a custom component
 *  - simple: create a simple text modal using the bundled `Simple` component
 */
export function useModal() {
    const core = injectCore();
    const generator = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );

    /**
     * Create & register a new modal instance with a custom component.
     * @template Props - props type passed to the component
     * @param component - Vue component to render inside the modal
     * @param props - Props for the component
     * @param options - Partial modal options
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
     * Create a simple text modal using the built-in `Simple` component.
     * @param message - main message text
     * @param options - optional modal options and labels
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

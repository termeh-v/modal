import Container from "./components/Container.vue";

import type { ComponentResolverFunction } from "unplugin-vue-components";
import type { App } from "vue";
import { setDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { useCore } from "./useCore";

/**
 * Creates the Vue plugin for the global modal system.
 *
 * It sets default options, provides the modal core instance, and optionally
 * registers the global `<ModalContainer>` component.
 *
 * @param options - Partial container options and an optional flag/name for the container component.
 */
export function ModalPlugin(
    options: Partial<ContainerOption> & { container?: string | false } = {}
) {
    return {
        /**
         * Installs the plugin into a Vue application instance.
         *
         * @param app - Vue application instance.
         */
        install(app: App) {
            // Provide the core modal management instance
            app.provide("$$modal_plugin", useCore());

            // Optionally register the global container component
            if (options.container !== false) {
                const name =
                    typeof options.container === "string"
                        ? options.container
                        : "ModalContainer";
                app.component(name, Container);
            }

            // Set global default options
            const { container, ...rest } = options;
            setDefaultOptions(rest);
        },
    };
}

/**
 * Component resolver for `unplugin-vue-components`.
 *
 * Enables auto-importing core modal components like `BaseModal` and `ModalContainer`
 * from the `@termeh-v/modal` package.
 *
 * @returns A function compatible with the `unplugin-vue-components` resolver type.
 */
export function ModalResolver(): ComponentResolverFunction {
    const components = ["BaseModal", "ModalContainer"];

    return (name: string) => {
        if (components.includes(name)) {
            return {
                name,
                from: "@termeh-v/modal",
            };
        }
    };
}

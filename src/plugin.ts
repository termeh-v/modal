import Container from "./components/Container.vue";

import type { ComponentResolverFunction } from "unplugin-vue-components";
import type { App } from "vue";
import { setDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { useCore } from "./useCore";

/**
 * Creates the Vue plugin for the global modal system.
 *
 * @param options - Partial container options and an optional container component name or `false`.
 * @returns Vue plugin object with an `install` method.
 */
export function ModalPlugin(
    options: Partial<ContainerOption> & { container?: string | false } = {}
) {
    return {
        /**
         * Install hook used by Vue when the plugin is applied to an app.
         * @param app - Vue application instance.
         */
        install(app: App) {
            // Provide the core modal management instance
            app.provide("$$modal_plugin", useCore());

            // Optionally register the global container component
            if (options.container) {
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
 * Maps requested component names to exports from this package.
 * @returns resolver function compatible with the plugin API.
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

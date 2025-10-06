import Container from "./components/Container.vue";

import type { ComponentResolverFunction } from "unplugin-vue-components";
import type { App } from "vue";
import { setDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { useCore } from "./useCore";

/**
 * Create a Vue plugin that installs the modal core and optionally registers
 * a global container component.
 *
 * @param options - Partial container options and an optional `container` name or `false` to disable auto-registration.
 * @returns A Vue plugin object exposing an `install` method.
 */
export function ModalPlugin(
    options: Partial<ContainerOption> & { container?: string | false } = {}
) {
    return {
        /**
         * Vue install hook called when the plugin is registered with an app.
         *
         * @param app - Vue application instance where the plugin will be installed.
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

            // Apply passed defaults to the global default options
            const { container, ...rest } = options;
            setDefaultOptions(rest);
        },
    };
}

/**
 * Create a resolver for `unplugin-vue-components` that maps component names
 * to this package so tools can auto-import `BaseModal` and `ModalContainer`.
 *
 * @returns A component resolver function usable by the plugin.
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

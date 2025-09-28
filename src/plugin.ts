import Container from "./components/Container.vue";

import type { ComponentResolverFunction } from "unplugin-vue-components";
import type { App } from "vue";
import { setDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { useCore } from "./useCore";

/**
 * Creates a Vue plugin for a global modal system.
 *
 * Handles default options, provides the modal core composable,
 * and optionally registers the global container component.
 *
 * @param options - Optional configuration:
 *   - `container: string` to customize component name.
 *   - `container: false` to skip global registration.
 *   - Other `ContainerOption` fields to set default modal options.
 * @returns A Vue plugin object with an `install` method.
 */
export function ModalPlugin(
    options: Partial<ContainerOption> & { container?: string | false } = {}
) {
    return {
        /**
         * Installs the modal plugin into a Vue application.
         *
         * @param app - The Vue application instance.
         */
        install(app: App) {
            // Provide the core composable for managing modals globally.
            app.provide("$$modal_plugin", useCore());

            // Register the main modal container component globally if enabled.
            if (options.container !== false) {
                const name =
                    typeof options.container === "string"
                        ? options.container
                        : "ModalContainer";
                app.component(name, Container);
            }

            // Apply user-defined default options (excluding container key).
            const { container, ...rest } = options;
            setDefaultOptions(rest);
        },
    };
}

/**
 * Provides a resolver for `unplugin-vue-components`.
 *
 * Enables automatic import of `ModalContainer` from `@termeh-v/modal`
 * when used in templates. If you customize the container name,
 * import it manually instead.
 *
 * @returns A component resolver object for `unplugin-vue-components`.
 */
export function ModalResolver(): ComponentResolverFunction {
    return (name: string) => {
        if (name === "ModalContainer") {
            return {
                name,
                from: "@termeh-v/modal",
            };
        }
    };
}

import { createApp } from "vue";
import { ModalPlugin } from "../src";
import App from "./App.vue";

createApp(App)
    .use(ModalPlugin({ bodyClass: "has-modal" }))
    .mount("#app");

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useCreate } from "../useCreate";
import ClearIcon from "./CloseIcon.vue";

defineOptions({
    inheritAttrs: false,
});

defineProps<{
    message: string;
    title?: string;
    primary?: string;
    secondary?: string;
}>();

const rootEl = useTemplateRef("modal");
const { attrs, options, loading, close, action } = useCreate(rootEl);
</script>
<template>
    <div
        ref="modal"
        class="modal"
        :class="{ 'is-loading': loading }"
        v-bind="attrs"
    >
        <div class="modal-header" v-if="title">
            <h6>{{ title }}</h6>
            <ClearIcon
                class="is-medium is-action"
                @click.stop="close"
                v-if="options?.closable"
            />
        </div>
        <div class="modal-content">
            <p v-html="message"></p>
        </div>
        <div class="modal-actions" v-if="primary || secondary">
            <button
                class="modal-action is-secondary"
                @click.prevent.stop="action('secondary')"
                v-if="secondary"
            >
                {{ secondary }}
            </button>
            <button
                class="modal-action"
                @click.prevent.stop="action('primary')"
                v-if="primary"
            >
                {{ primary }}
            </button>
        </div>
    </div>
</template>

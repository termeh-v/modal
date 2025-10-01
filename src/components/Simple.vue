<script setup lang="ts">
import BaseModal from "./BaseModal.vue";
import ClearIcon from "./CloseIcon.vue";

defineProps<{
    message: string;
    title?: string;
    primary?: string;
    secondary?: string;
}>();
</script>
<template>
    <BaseModal>
        <template #header="props">
            <h6 v-if="title">{{ title }}</h6>
            <ClearIcon
                class="is-medium"
                @click.stop="props?.close()"
                v-if="title && props?.options?.closable"
            />
        </template>
        <template #actions="props">
            <button
                class="modal-action is-secondary"
                @click.prevent.stop="props?.action('secondary')"
                v-if="secondary"
            >
                {{ secondary }}
            </button>
            <button
                class="modal-action"
                @click.prevent.stop="props?.action('primary')"
                v-if="primary"
            >
                {{ primary }}
            </button>
        </template>
        <p v-html="message"></p>
    </BaseModal>
</template>

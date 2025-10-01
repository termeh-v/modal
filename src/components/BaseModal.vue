<script setup lang="ts">
import { useEmptySlot } from "@termeh-v/composables";
import { useTemplateRef } from "vue";
import { useCreate } from "../useCreate";

defineOptions({
    inheritAttrs: false,
});

const rootEl = useTemplateRef("modal");
const { hasErrorOrEmpty: emptyHeader } = useEmptySlot("header");
const { hasErrorOrEmpty: emptyActions } = useEmptySlot("actions");
const { attrs, options, loading, close, action, isActive, index, count } =
    useCreate(rootEl);
</script>
<template>
    <div
        ref="modal"
        class="modal"
        :class="{ 'is-loading': loading }"
        v-bind="attrs"
    >
        <div class="modal-header" :class="{ 'is-empty': emptyHeader }">
            <slot
                name="header"
                v-bind="{
                    index,
                    count,
                    options,
                    loading,
                    isActive,
                    close,
                    action,
                }"
            ></slot>
            <div class="scroll-fade is-top"></div>
        </div>

        <div class="modal-content">
            <slot>Put content in default slot</slot>
        </div>
        <div class="modal-actions" :class="{ 'is-empty': emptyActions }">
            <div class="scroll-fade is-bottom"></div>
            <slot
                name="actions"
                v-bind="{
                    index,
                    count,
                    options,
                    loading,
                    isActive,
                    close,
                    action,
                }"
            ></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useEmptySlot } from "@termeh-v/composables";
import { usePointerSwipe } from "@vueuse/core";
import { animate, motionValue } from "motion";
import { computed, shallowRef, useTemplateRef } from "vue";
import { useCreate } from "../useCreate";

defineOptions({
    inheritAttrs: false,
});

const top = shallowRef("0px");
const opacity = shallowRef(1);
const rootEl = useTemplateRef("modal");
const handleEl = useTemplateRef("handle");
const swipeThreshold = computed(() =>
    Math.min(300, (rootEl.value?.offsetHeight || 600) * 0.4)
);

const { hasErrorOrEmpty: emptyHeader } = useEmptySlot("header");
const { hasErrorOrEmpty: emptyActions } = useEmptySlot("actions");
const { attrs, options, loading, close, action, isActive, index, count } =
    useCreate(rootEl);
const { distanceY } = usePointerSwipe(handleEl, {
    onSwipe() {
        if (options.value?.closable === true && distanceY.value < 0) {
            const distance = Math.abs(distanceY.value);
            top.value = `${distance}px`;
            opacity.value = Math.max(
                1.4 - distance / swipeThreshold.value,
                0.1
            );
        } else {
            top.value = "0";
            opacity.value = 1;
        }
    },
    onSwipeEnd() {
        if (
            options.value?.closable === true &&
            distanceY.value < 0 &&
            Math.abs(distanceY.value) > swipeThreshold.value
        ) {
            close();
        } else {
            animate(motionValue(top.value), "0px", {
                duration: 0.1,
                type: "spring",
                stiffness: 100,
                onUpdate(v) {
                    top.value = v;
                },
            });
            animate(motionValue(opacity.value), 1, {
                duration: 0.1,
                onUpdate(v) {
                    opacity.value = v;
                },
            });
        }
    },
});
</script>
<template>
    <div
        ref="modal"
        class="modal"
        :class="{ 'is-loading': loading }"
        :style="{ top, opacity }"
        v-bind="attrs"
    >
        <div class="modal-header" :class="{ 'is-empty': emptyHeader }">
            <div
                ref="handle"
                class="modal-handle"
                v-if="options?.closable === true"
            >
                <div></div>
            </div>
            <div class="scroll-fade"></div>
            <div class="modal-header-content">
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
            </div>
        </div>

        <div class="modal-content">
            <slot>Put content in default slot</slot>
        </div>

        <div class="modal-actions" :class="{ 'is-empty': emptyActions }">
            <div class="scroll-fade"></div>
            <div class="modal-actions-content">
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
    </div>
</template>

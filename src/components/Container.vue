<script setup lang="ts">
import { useScroll } from "@termeh-v/composables";
import { computed, onMounted, onUnmounted, useTemplateRef } from "vue";
import { type ContainerOption } from "../internal/types";
import { useContainer } from "../useContainer";

const props = withDefaults(
    defineProps<{
        name?: string;
        options?: Partial<ContainerOption>;
    }>(),
    { name: "main" }
);

const container = useTemplateRef("container");
const { hasScrollTop, hasScrollBottom } = useScroll(container, {
    threshold: 30,
});
const { emitter, config, modals, count, isEmpty, activeId } = useContainer(
    props.name,
    computed(() => props.options)
);

function onAdd(k?: string) {
    if (!k) return;

    container.value?.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    if (modals.value.length > 1) {
        const modal = modals.value[modals.value.length - 2];
        if (modal && modal.key) {
            emitter.emit("goSecondary", modal.key);
        }
    }

    if (modals.value.length > 2) {
        const modal = modals.value[modals.value.length - 3];
        if (modal && modal.key) {
            emitter.emit("goTertiary", modal.key);
        }
    }

    if (modals.value.length > 3) {
        const modal = modals.value[modals.value.length - 4];
        if (modal && modal.key) {
            emitter.emit("hide", modal.key);
        }
    }
}

function onRemove(k?: string) {
    if (!k) return;

    container.value?.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    if (modals.value.length > 1) {
        const modal = modals.value[modals.value.length - 2];
        if (modal && modal.key) {
            emitter.emit("activate", modal.key);
        }
    }

    if (modals.value.length > 2) {
        const modal = modals.value[modals.value.length - 3];
        if (modal && modal.key) {
            emitter.emit("goSecondary", modal.key);
        }
    }

    if (modals.value.length > 3) {
        const modal = modals.value[modals.value.length - 4];
        if (modal && modal.key) {
            emitter.emit("goTertiary", modal.key);
        }
    }
}

onMounted(() => {
    emitter.on("added", onAdd);
    emitter.on("beforeRemove", onRemove);
});

onUnmounted(() => {
    emitter.off("added", onAdd);
    emitter.off("beforeRemove", onRemove);
});
</script>
<template>
    <div
        ref="container"
        :id="`modal-dimmer-${name}`"
        class="modal-dimmer"
        :class="{
            'is-top-scrolled': hasScrollTop,
            'is-bottom-scrolled': hasScrollBottom,
        }"
        v-show="!isEmpty"
    >
        <div class="modal-container">
            <div
                v-for="(modal, index) in modals"
                :key="modal.key"
                class="modal-item"
                :class="{
                    'is-active': modal.key === activeId,
                    'is-hidden': modal.key !== activeId,
                }"
            >
                <component
                    :is="modal?.component"
                    v-bind="modal.props"
                    :vm-index="index"
                    :vm-count="count"
                    :vm-emitter="emitter"
                    :vm-animations="config.animations"
                />
            </div>
        </div>
    </div>
</template>

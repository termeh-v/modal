<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { type ContainerOption } from "../internal/types";
import { useContainer } from "../useContainer";

const props = withDefaults(
    defineProps<{
        name?: string;
        options?: Partial<ContainerOption>;
    }>(),
    { name: "main" }
);

const threshold = 10;
const isAtTop = ref(true);
const isAtBottom = ref(true);
const isScrollable = ref(false);
const container = useTemplateRef("container");
let resizeObserver: ResizeObserver | null = null;

const options = computed(() => props.options);
const { modals, count, isEmpty, activeId } = useContainer(props.name, options);

function updateScrollState() {
    if (!container.value) return;

    const { scrollTop, scrollHeight, clientHeight } = container.value;

    isAtTop.value = scrollTop <= threshold;
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - threshold;
    isScrollable.value = scrollHeight > clientHeight;
}

onMounted(() => {
    if (!container.value) return;

    container.value.addEventListener("scroll", updateScrollState);

    window.addEventListener("resize", updateScrollState, { passive: true });

    resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container.value);

    updateScrollState();
});

onUnmounted(() => {
    if (!container.value) return;

    container.value?.removeEventListener("scroll", updateScrollState);

    window.removeEventListener("resize", updateScrollState);

    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
});
</script>
<template>
    <div
        ref="container"
        :id="`modal-dimmer-${name}`"
        class="modal-container"
        :class="{
            'is-at-top': isAtTop,
            'is-at-bottom': isAtBottom,
            'is-scrollable': isScrollable,
        }"
        v-show="!isEmpty"
    >
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
                :vm-index="index"
                :vm-count="count"
                :class="{ 'is-top-one': count === 2, 'is-top-two': count > 2 }"
            />
        </div>
    </div>
</template>

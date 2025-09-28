<script setup lang="ts">
import { computed } from "vue";
import { type ContainerOption } from "../internal/types";
import { useContainer } from "../useContainer";

const props = withDefaults(
    defineProps<{
        name?: string;
        options?: Partial<ContainerOption>;
    }>(),
    { name: "main" }
);

const options = computed(() => props.options);
const { modals, count, isEmpty, activeId } = useContainer(props.name, options);
</script>
<template>
    <div class="modal-container" :id="`modal-dimmer-${name}`" v-if="!isEmpty">
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

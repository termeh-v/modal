<script setup lang="ts">
import { useMediaQueries } from "@termeh-v/composables";
import { Inliner } from "@termeh-v/utils";
import { useModal } from "../src";

const { simple } = useModal();
const { isMobile } = useMediaQueries();

let counter = 0;
const content = () =>
    Inliner.create()
        .span(
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint nequedeserunt ut debitis veritatis esse, hic illum corrupti quas quaerat"
        )
        .space()
        .u(`for ${counter}`)
        .space()
        .text("with")
        .space()
        .strong("Strong")
        .space()
        .span(
            "dolorem aliquid consectetur mollitia necessitatibus est culpa sequiaspernatur itaque."
        )
        .toString();

function newSimple() {
    simple(content(), {
        title: "Hello From Simple Modal",
        onClose: (mode) => {
            console.log("closed by:", mode);
        },
    });
    counter++;
}

function newLongNoAction() {
    simple(
        content() +
            "<br/>" +
            content() +
            "<br/>" +
            content() +
            "<br/>" +
            content() +
            "<br/>" +
            content(),
        {
            class: "is-large",
        }
    );
    counter++;
}

function newLong() {
    simple(
        content() +
            "<br/>" +
            content() +
            "<br/>" +
            content() +
            "<br/>" +
            content() +
            "<br/>" +
            content(),
        {
            primaryAction: "Proccess",
            secondaryAction: "Forget",
            class: "is-large",
            closable: false,
            onClick: () => Promise.resolve(false),
            onAction: (k) =>
                k == "secondary"
                    ? Promise.resolve(true)
                    : new Promise((resolve) => {
                          newLongNoAction(), resolve(false);
                      }),
        }
    );
    counter++;
}

function newAction() {
    simple(content(), {
        primaryAction: "Proccess",
        secondaryAction: "Forget",
        class: "is-large",
        onClick: () => Promise.resolve(false),
        onClose: (mode) => {
            console.log("closed by:", mode);
        },
        onAction: (k) =>
            k == "secondary"
                ? Promise.resolve(true)
                : new Promise<boolean>((resolve) => {
                      setTimeout(() => {
                          resolve(true);
                      }, 5000);
                  }),
    });
    counter++;
}

function newErrorAction() {
    simple(`Modal with action ${counter}`, {
        title: `Error Modal ${counter}`,
        primaryAction: "Proccess",
        secondaryAction: "Forget",
        class: "is-error is-large",
        onClick: () => Promise.resolve(false),
        onClose: (mode) => {
            console.log("closed by:", mode);
        },
        onAction: (k) =>
            k == "secondary"
                ? Promise.resolve(true)
                : new Promise<boolean>((resolve) => {
                      setTimeout(() => {
                          resolve(true);
                      }, 5000);
                  }),
    });
    counter++;
}
</script>

<template>
    <div class="container">
        <div class="example">
            <div class="actions">
                <button class="button" @click="newSimple">Simple</button>
                <button class="button" @click="newLong">Long</button>
                <button class="button" @click="newLongNoAction">
                    Simple Long
                </button>
                <button class="button is-primary" @click="newAction">
                    With Action
                </button>
                <button class="button" @click="newErrorAction">
                    With Error Full
                </button>
            </div>

            <div class="placeholder" v-if="!isMobile">
                <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Ipsa delectus quos nam odio nulla tenetur ratione. Nam,
                    eaque ipsa eveniet facilis illum voluptas nihil magni ipsum
                    sit molestias quisquam fugiat!
                </p>
                <ModalContainer class="is-sub" />
            </div>
        </div>
    </div>
    <ModalContainer v-if="isMobile" />
</template>

<style lang="scss">
@use "termeh";
@use "../src/style.scss";

@import url("https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&display=swap");

@include termeh.define("font", "size", 14px);
@include termeh.define("font", "family", ("Google Sans Code", monospace));
@include termeh.define-palette("primary", #0e8185);

@include termeh.define("modal", "overlay-background", #090e23);
@include termeh.define("modal", "overlay-opacity", 0.45);
@include termeh.define("modal", "overlay-filter", blur(2px));

@include termeh.define("bottom-sheet", "radius", 1rem);
@include termeh.define(
    "bottom-sheet",
    "shadow",
    (0 -3px 10px -7px rgba(0, 0, 0, 0.2))
);

@include termeh.use-generic();
@include termeh.use-container();
@include termeh.use-icon();
@include termeh.use-wrapper();
@include termeh.use-button();
@include style.use-modal(
    null,
    (
        "small": 10rem,
        "medium": 20rem,
        "large": 30rem,
    )
);

html,
body {
    min-width: 100vw;
    min-height: 100vh;
}

#app {
    display: block;
    width: 100%;
    height: 100%;
}

.example {
    display: block;
}
.example .actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
}

.example .actions > * {
    flex: 1 0 auto;
}

.example .placeholder {
    height: 45rem;
    padding: 2rem;
    position: relative;
    border-radius: 2px;
    background: #eeeef5;
}
</style>

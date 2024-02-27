<template>
    <h1>Placeholder audit details</h1>
    <button class="btn btn-secondary" @click="navigateToMainMenu()">Zurück zum Hauptmenü</button>
</template>

<script>
    export default {
        data () {
            return {}
        },
        methods: {
            navigateToMainMenu() {
                this.$router.push("/");
            }
        }
    }
</script>
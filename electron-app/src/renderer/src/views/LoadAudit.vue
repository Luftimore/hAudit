<template>
    <textarea v-if="jsonData" rows="8" cols="40">
      {{ jsonData }}
    </textarea>
    <button class="btn btn-secondary" @click="navigateToMainMenu()">Zurück zum Hauptmenü</button>
    <button class="btn btn-primary" @click="showAsPDF()">Als PDF anzeigen</button>
</template>
  
<script>
  
  export default {
    data() {
      return {
        jsonData: null
      };
    },
    methods: {
        navigateToMainMenu() {
            this.$router.push('/');
        },
        showAsPDF() {
            window.electron.ipcRenderer.send('openAsPDF', this.jsonData);
        }
    },
    mounted() {
      window.electron.ipcRenderer.on('file-opened', (event, data) => {
        this.jsonData = JSON.stringify(JSON.parse(data), null, 2);
      });
    }
  }
</script>
  
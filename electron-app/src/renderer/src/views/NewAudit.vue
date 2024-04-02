<template>
    <div>
        <h1>Neues Audit</h1>
        <h2>Normen und Normpunkte</h2>
        <CreateAuditReport></CreateAuditReport>
        <!-- <div v-for="(norm, normIndex) in norms" :key="normIndex">
            <input type="text" v-model="norm.name" placeholder="Norm eingeben">
            <select v-model="norm.selectedValue">
              <option v-for="option in selectionOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <button class="btn btn-primary button-item" @click="addNormPoint(normIndex)">Normpunkt hinzufügen</button>
            <ul>
                <li v-for="(point, pointIndex) in norm.points" :key="pointIndex">
                <input type="text" v-model="point.name" placeholder="Normpunkt eingeben">
                <select v-model="point.value">
                  <option v-for="option in selectionOptions" :key="option" :value="option">{{ option }}</option>
                </select>
                <button class="btn btn-secondary button-item" @click="removeNormPoint(normIndex, pointIndex)">Entfernen</button>
                </li>
            </ul>
            <button class="btn btn-secondary button-item" @click="removeNorm(normIndex)">Norm entfernen</button>
        </div>
        <div>
            <button class="btn btn-primary button-item" @click="addNorm">Norm hinzufügen</button>
        </div> -->
        <button class="btn btn-secondary button-item" @click="navigateToMainMenu()">Zurück zum Hauptmenü</button>
        <!-- <button class="btn btn-primary button-item" @click="saveNormsToFile()">Normen in Datei speichern</button>
        <button class="btn btn-secondary button-item" @click="exportNormsAsPDF()">Normen als PDF exportieren</button> -->
    </div>
</template>
  
  
<script>
  // import { ipcRenderer } from 'electron';
  import CreateAuditReport from '../components/CreateAuditReport.vue'

  export default {
    data() {
      return {
        norms: JSON.parse(localStorage.getItem('norms')) || [],
        selectionOptions: ['+', '-', '~', '/']
      };
    },
    watch: {
      norms: {
        handler(newValue) {
          localStorage.setItem('norms', JSON.stringify(newValue));
        }
      }
    },
    methods: {
      addNorm() {
        this.norms.push({ name: '', selectedValue: '', points: [] });
      },
      removeNorm(normIndex) {
        this.norms.splice(normIndex, 1);
      },
      addNormPoint(normIndex) {
        this.norms[normIndex].points.push({ name: '', selectedValue: ''});
      },
      removeNormPoint(normIndex, pointIndex) {
        this.norms[normIndex].points.splice(pointIndex, 1);
      },
      navigateToMainMenu() {
        this.$router.push("/");
      },
      saveNormsToFile() {
        // const savePath = window.dialog.openDialog('showSaveDialog', {title: "Speicherort auswählen", buttonLabel: "Speichern", properties: ['createDirectory']})
        // .then(result => {
        //   console.log(result);
        // });
        
        window.electron.ipcRenderer.send('saveNewAudit', JSON.stringify(this.norms, null, 2));
      },
      exportNormsAsPDF() {
        window.electron.ipcRenderer.send('exportAsPDF', JSON.stringify(this.norms));
      }
    }
  };
</script>

<style>
  .button-item {
    width: 200px; /* Adjust the width as needed */
    margin-bottom: 5px; /* Optional: Add margin between buttons */
  }
</style>
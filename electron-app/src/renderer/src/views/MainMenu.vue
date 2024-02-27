<template>
    <div class="button-container">
        <div v-for="(button, index) in buttons" :key="index" @click="openWindow(button)">
            <button type="button" class="btn btn-primary button-item">
                {{ button.text }}
            </button>
            {{ button.description }}
        </div>
    </div>
</template>
  
  <script>
  export default {
    data() {
      return {
        buttons: [
          { text: 'Neues Audit', description: 'Neuen Auditbericht erstellen', action: 'openNewAuditWindow' },
          { text: 'Audit öffnen', description: 'Gespeicherten Auditbericht öffnen', action: 'openSavedAuditWindow' },
          { text: 'Bericht teilen', description: 'Auditbericht zum Teilen öffnen', action: 'openShareAuditWindow' },
          { text: 'Geteilte Berichte', description: 'Geteilte Berichte anzeigen', action: 'openSharedAuditsWindow' },
          { text: 'Kontakte', description: 'Kontakte verwalten', action: 'openContactsWindow' }
        ]
      };
    },
    methods: {
        openWindow(button) {
        switch (button.action) {
            case "openNewAuditWindow":
                this.$router.push('/new_audit');
                break;
            case "openSavedAuditWindow":
                window.electron.ipcRenderer.send('loadAudit');
                this.$router.push('/load_audit');
                break;
            case "openShareAuditWindow":
                this.$router.push('/share_audit');
                break;
            case "openSharedAuditsWindow":
                this.$router.push('/shared_audits');
                break;
            case "openContactsWindow":
                this.$router.push('/contacts');
                break;
            default:
                break;
        }
      }
    }
  };
  </script>
  
<style scoped>
    .button-container {
        display: flex;
        flex-direction: column;
    }
    .button-item {
        width: 200px; /* Adjust the width as needed */
        margin-bottom: 5px; /* Optional: Add margin between buttons */
    }
</style>
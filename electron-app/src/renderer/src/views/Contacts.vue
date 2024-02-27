<template>
    <h1>Kontakte</h1>

    <div v-if="contacts.length === 0">Noch keine Kontakte gespeichert.</div>

    <ul v-if="contacts.length > 0">
        <li v-for="(contact, index) in contacts" :key="index">
        <span>{{ contact.name }} - {{ contact.publicKey }}</span>
        <button class="btn btn-primary" @click="editContact(index)">Bearbeiten</button>
        <button class="btn btn-secondary" @click="removeContact(index)">Entfernen</button>
        </li>
    </ul>

    <button class="btn btn-primary" @click="showAddForm = true">Kontakt hinzufügen</button>

    <div v-if="showAddForm">
        <h2>Kontakt hinzufügen</h2>
        <form @submit.prevent="addContact">
            <input type="text" v-model="newContact.name" placeholder="Name" required><br>
            <input type="text" v-model="newContact.publicKey" placeholder="Public Key" required><br>
            <button class="btn btn-primary" type="submit">Speichern</button>
        </form>
    </div>

    <div v-if="showEditForm">
        <h2>Kontakt bearbeiten</h2>
        <form @submit.prevent="updateContact">
            <input type="text" v-model="editedContact.name" required><br>
            <input type="text" v-model="editedContact.publicKey" required><br>
            <button class="btn btn-primary" type="submit">Speichern</button>
        </form>
    </div>

    <button class="btn btn-secondary" @click="navigateToMainMenu()">Zurück zum Hauptmenü</button>
</template>

<script>
export default {
    data() {
        return {
            contacts: [],
            newContact: {
                name: '',
                publicKey: ''
            },
            editedContact: {
                index: null,
                name: '',
                publicKey: ''
            },
            showAddForm: false,
            showEditForm: false
        };
    },
    methods: {
        addContact() {
            this.contacts.push({...this.newContact});
            this.newContact = { name: '', publicKey: '' };
            this.showAddForm = false;
        },
        editContact(index) {
            this.editedContact.index = index;
            this.editedContact.name = this.contacts[index].name;
            this.editedContact.publicKey = this.contacts[index].publicKey;
            this.showEditForm = true;
        },
        updateContact() {
            this.contacts[this.editedContact.index].name = this.editedContact.name;
            this.contacts[this.editedContact.index].publicKey = this.editedContact.publicKey;
            this.editedContact = { index: null, name: '', email: '', publicKey: '' };
            this.showEditForm = false;
        },
        removeContact(index) {
            this.contacts.splice(index, 1);
        },
        navigateToMainMenu() {
            this.$router.push("/");
        }
    }
  };
</script>
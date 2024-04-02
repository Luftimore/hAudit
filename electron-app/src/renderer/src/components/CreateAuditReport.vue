<template>
    <mwc-snackbar ref="create-error"></mwc-snackbar>
  
    <div style="display: flex; flex-direction: column">
      <span style="font-size: 18px">Create Post</span>
    
      <div style="margin-bottom: 16px">
        <mwc-textfield outlined label="Title" :value="title" @input="title = $event.target.value" required></mwc-textfield>
      </div>
  
      <div style="margin-bottom: 16px">
        <mwc-textarea outlined label="Content" :value="content" @input="content = $event.target.value" required></mwc-textarea>
      </div>
  
    
      <mwc-button 
        raised
        label="Create Post"
        :disabled="!isPostValid"
        @click="createPost"
      ></mwc-button>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, inject, ComputedRef } from 'vue';
  import { AppAgentClient, Record, AgentPubKey, EntryHash, ActionHash, DnaHash } from '@holochain/client';
  import { Post } from './types';
  import '@material/mwc-button';
  import '@material/mwc-icon-button';
  import '@material/mwc-snackbar';

  import QuestionService from '../QuestionService.ts'
//   import { Snackbar } from '@material/mwc-snackbar';
  
  import '@material/mwc-textarea';
  import '@material/mwc-textfield';
  export default defineComponent({
    data(): {
      title: string;
      content: string;
    } {
      return { 
        title: '',
        content: '',
      }
    },
    computed: {
      isPostValid() {
      return true && this.title !== '' && this.content !== '';
      },
    },
    mounted() {
    },
    methods: {
      async createPost() {
        const post: Post = { 
          title: this.title!,
  
          content: this.content!,
        };
  
        try {
          const record: Record = await this.client.callZome({
            cap_secret: null,
            role_name: 'forum',
            zome_name: 'posts',
            fn_name: 'create_post',
            payload: post,
          });
          this.$emit('report-created', record.signed_action.hashed.hash);
        } catch (e: any) {
        //   const errorSnackbar = this.$refs['create-error'] as Snackbar;
        //   errorSnackbar.labelText = `Error creating the post: ${e.data}`;
        //   errorSnackbar.show();
        console.log("Error creating the post: " + e.data);
        }
      },
    },
    emits: ['report-created'],
    setup() {
      const client = (inject('client') as ComputedRef<AppAgentClient>).value;
      return {
        client,
      };
    },
  })
  </script>
  
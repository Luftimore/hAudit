<template>
  <mwc-snackbar ref="create-error"></mwc-snackbar>

  <div style="display: flex; flex-direction: column">
    <span style="font-size: 18px">Create Comment</span>
  
    <div style="margin-bottom: 16px">
      <mwc-textarea outlined label="Comment Content" :value="commentContent" @input="commentContent = $event.target.value" required></mwc-textarea>
    </div>

  
    <mwc-button 
      raised
      label="Create Comment"
      :disabled="!isCommentValid"
      @click="createComment"
    ></mwc-button>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { AppAgentClient, Record, AgentPubKey, EntryHash, ActionHash, DnaHash } from '@holochain/client';
import { Comment } from './types';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

import '@material/mwc-textarea';
export default defineComponent({
  data(): {
    commentContent: string;
  } {
    return { 
      commentContent: '',
    }
  },
  props: {
    postHash: {
      type: null,
      required: true
    },
  },
  computed: {
    isCommentValid() {
    return true && this.commentContent !== '';
    },
  },
  mounted() {
    if (this.postHash === undefined) {
      throw new Error(`The postHash input is required for the CreateComment element`);
    }
  },
  methods: {
    async createComment() {
      const comment: Comment = { 
        comment_content: this.commentContent!,

        post_hash: this.postHash!,
      };

      try {
        const record: Record = await this.client.callZome({
          cap_secret: null,
          role_name: 'forum',
          zome_name: 'posts',
          fn_name: 'create_comment',
          payload: comment,
        });
        this.$emit('comment-created', record.signed_action.hashed.hash);
      } catch (e: any) {
        const errorSnackbar = this.$refs['create-error'] as Snackbar;
        errorSnackbar.labelText = `Error creating the comment: ${e.data}`;
        errorSnackbar.show();
      }
    },
  },
  emits: ['comment-created'],
  setup() {
    const client = (inject('client') as ComputedRef<AppAgentClient>).value;
    return {
      client,
    };
  },
})
</script>

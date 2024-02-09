<template>
  <div v-if="!loading">
    <div v-if="record" style="display: flex; flex-direction: column">
      <div style="display: flex; flex-direction: row">
        <span style="flex: 1"></span>
      
        <mwc-icon-button style="margin-left: 8px" icon="delete" @click="deleteComment()"></mwc-icon-button>
      </div>

      <div style="display: flex; flex-direction: row; margin-bottom: 16px;">
	<span style="margin-right: 4px"><strong>Comment Content: </strong></span>
 	<span style="white-space: pre-line">{{  comment?.comment_content }} </span>
      </div>

    </div>
    
    <span v-else>The requested comment was not found.</span>
  </div>

  <div v-else style="display: flex; flex: 1; align-items: center; justify-content: center">
    <mwc-circular-progress indeterminate></mwc-circular-progress>
  </div>

  <mwc-snackbar ref="delete-error" leading>
  </mwc-snackbar>
</template>

<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { AppAgentClient, Record, AgentPubKey, EntryHash, ActionHash, DnaHash } from '@holochain/client';
import { Comment } from './types';
import '@material/mwc-circular-progress';
import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

export default defineComponent({
  props: {
    commentHash: {
      type: Object,
      required: true
    }
  },
  data(): { record: Record | undefined; loading: boolean;  } {
    return {
      record: undefined,
      loading: true,
    }
  },
  computed: {
    comment() {
      if (!this.record) return undefined;
      return decode((this.record.entry as any).Present.entry) as Comment;
    }
  },
  async mounted() {
    if (this.commentHash === undefined) {
      throw new Error(`The commentHash input is required for the CommentDetail element`);
    }

    await this.fetchComment();
  },
  methods: {
    async fetchComment() {
      this.loading = true;
      this.record = undefined;

      this.record = await this.client.callZome({
        cap_secret: null,
        role_name: 'forum',
        zome_name: 'posts',
        fn_name: 'get_comment',
        payload: this.commentHash,
      });

      this.loading = false;
    },
    async deleteComment() {
      try {
        await this.client.callZome({
          cap_secret: null,
          role_name: 'forum',
          zome_name: 'posts',
          fn_name: 'delete_comment',
          payload: this.commentHash,
        });
        this.$emit('comment-deleted', this.commentHash);
      } catch (e: any) {
        const errorSnackbar = this.$refs['delete-error'] as Snackbar;
        errorSnackbar.labelText = `Error deleting the comment: ${e.data}`;
        errorSnackbar.show();
      }
    }
  },
  emits: ['comment-deleted'],
  setup() {
    const client = (inject('client') as ComputedRef<AppAgentClient>).value;
    return {
      client
    };
  },
})
</script>

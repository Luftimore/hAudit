
<template>
  <div v-if="loading" style="display: flex; flex: 1; align-items: center; justify-content: center">
    <mwc-circular-progress indeterminate></mwc-circular-progress>
  </div>
  
  <div v-else style="display: flex; flex-direction: column">
    <span v-if="error">Error fetching the comments: {{error}}.</span>
    <div v-else-if="links && links.length > 0" style="margin-bottom: 8px">
      <CommentDetail 
        v-for="link in links" 
        :comment-hash="link.target" 
      >
      </CommentDetail>
    </div>
    <span v-else>No comments found for this post.</span>
  </div>

</template>

<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { AppAgentClient, Record, Link, AgentPubKey } from '@holochain/client';
import '@material/mwc-circular-progress';
import CommentDetail from './CommentDetail.vue';

export default defineComponent({
  components: {
    CommentDetail
  },
  props: {
    postHash: {
      type: Object,
      required: true
    }
  },
  data(): { links: Array<Link> | undefined; loading: boolean; error: any } {
    return {
      links: undefined,
      loading: true,
      error: undefined
    }
  },
  async mounted() {
    if (this.postHash === undefined) {
      throw new Error(`The postHashHash input is required for the CommentsForPost element`);
    }

    try {
      this.links = await this.client.callZome({
        cap_secret: null,
        role_name: 'forum',
        zome_name: 'posts',
        fn_name: 'get_comments_for_post',
        payload: this.postHash,
      });
    } catch (e) {
      this.error = e;
    }
    this.loading = false;
  },
  setup() {
    const client = (inject('client') as ComputedRef<AppAgentClient>).value;
    return {
      client,
    };
  },
})
</script>

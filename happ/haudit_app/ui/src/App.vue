<template>
  <div>
    <div v-if="loading">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else>
      <div id="content" style="display: flex; flex-direction: column; flex: 1;">
        Create Post:
        <CreatePost></CreatePost>
        All posts:
        <AllPosts></AllPosts>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { AppAgentClient, AppAgentWebsocket } from '@holochain/client';
import '@material/mwc-circular-progress';
import '@material/mwc-button';
import CreatePost from './forum/posts/CreatePost.vue';
import AllPosts from './forum/posts/AllPosts.vue';

export default defineComponent({
  components: {
    CreatePost,
    AllPosts
},
  data(): {
    client: AppAgentClient | undefined;
    loading: boolean;
  } {
    return {
      client: undefined,
      loading: true,
    };
  },
  async mounted() {
    // We pass an unused string as the url because it will dynamically be replaced in launcher environments
    this.client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), 'haudit_app');
    this.loading = false;
  },
  provide() {
    return {
      client: computed(() => this.client),
    };
  },
});
</script>

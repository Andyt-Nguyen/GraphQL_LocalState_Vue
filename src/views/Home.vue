<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <ApolloComponent msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import ApolloComponent from "@/components/ApolloComponent.vue";

export default {
  name: "Home",
  components: {
    ApolloComponent
  }
};
</script>

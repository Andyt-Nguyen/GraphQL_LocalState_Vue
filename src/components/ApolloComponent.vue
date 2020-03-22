<template>
  <div>
    <h1>Apollo Components</h1>
    <ApolloMutation
      :mutation="require('../graphql/AddTodo.js').default"
      :variables="{ title }"
      @done="title=''"
    >
      <template v-slot="{mutate, loading, error}">
        <div v-if="error">There was an error</div>
        <form v-if="!loading" @submit.prevent="mutate">
          <input type="text" class="inputStyle" v-model="title" placeholder="Type here..." />

          <button type="submit">Submit</button>
        </form>
      </template>
    </ApolloMutation>

    <ApolloQuery :query="require('../graphql/GetTodos.js').default">
      <template v-slot="{result: { data, loading, error}}">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">There was an error</div>
        <div v-else>
          <div class="grid">
            <div class="box" :key="todo.id" v-for="todo in data.todos">
              <h3>{{ todo.title }}</h3>
              <ApolloMutation
                :mutation="require('../graphql/DeleteTodo.js').default"
                :variables="{
                  id: todo.id
                }"
              >
                <template v-slot="{mutate:deleteTodo, loading:loadingDel, error:errorDel}">
                  <button @click="deleteTodo">
                    <span v-if="loadingDel">Loading</span>
                    <span v-else-if="errorDel">Loading</span>
                    <span v-else>Delete</span>
                  </button>

                  <button v-if="!isEdit" @click="isEdit=true">Edit</button>
                </template>
              </ApolloMutation>
              <ApolloMutation
                v-if="isEdit"
                :mutation="require('../graphql/UpdateTodo.js').default"
                :variables="{
                  id: todo.id,
                  title: updateTitle,
                  completed: false
                }"
                @done="done"
              >
                <template v-slot="{mutate:updateTodo, loading:loadingTodo, error:errorUpdate}">
                  <input type="text" v-model="updateTitle" />
                  <button @click="updateTodo">
                    <span v-if="loadingTodo">Loading</span>
                    <span v-else-if="errorUpdate">Loading</span>
                    <span v-else>Submit</span>
                  </button>
                </template>
              </ApolloMutation>
            </div>
          </div>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
export default {
  name: "ApolloComponent",
  data: () => ({
    title: "",
    updateTitle: "",
    isEdit: ""
  }),
  methods: {
    done() {
      this.updateTitle = "";
      this.isEdit = false;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
}

.box {
  border-radius: 5px;
  border: 2px solid grey;
}
.red {
  background: red;
}

.blue {
  background: dodgerblue;
}

.green {
  background: lime;
}

.inputStyle {
  width: 50%;
  margin: auto;
  height: 40px;
  font-size: 30px;
  margin-bottom: 20px;
}
</style>

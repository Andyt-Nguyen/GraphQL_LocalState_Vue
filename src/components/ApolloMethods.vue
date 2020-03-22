<template>
  <div>
    <form @submit.prevent="addTodo">
      <input type="text" v-model="title" placeholder="Type here..." class="inputStyle" />
      <button type="submit">Submit</button>
    </form>

    <div v-if="$apollo.queries.todos.loading">Loading todos</div>
    <div v-if="$apollo.queries.todos.error">There was an error loading todos</div>
    <div class="grid">
      <div class="box" :key="todo.id" v-for="todo in todos">
        <h3>{{ todo.title }}</h3>
        <button @click="deleteTodo(todo.id)">Delete</button>
        <button v-if="!isEdit" @click="isEdit=true">Edit</button>

        <div v-if="isEdit">
          <input type="text" v-model="updateText" />
          <button @click="updateTodo(todo.id)">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GetTodos from "../graphql/GetTodos";
import AddTodo from "../graphql/AddTodo";
import DeleteTodo from "../graphql/DeleteTodo";
import UpdateTodo from "../graphql/UpdateTodo";

export default {
  name: "ApolloMethods",
  data: () => ({
    title: "",
    todos: [], // This data property will be over written by the apollo object
    isEdit: false,
    updateText: ""
  }),

  apollo: {
    todos: GetTodos
  },

  methods: {
    addTodo() {
      this.$apollo.mutate({
        mutation: AddTodo,
        variables: { title: this.title }
      });
    },

    deleteTodo(id) {
      console.log(this.$apollo);
      this.$apollo.mutate({
        mutation: DeleteTodo,
        variables: {
          id
        }
      });
    },

    async updateTodo(id) {
      await this.$apollo.mutate({
        mutation: UpdateTodo,
        variables: {
          id,
          title: this.updateText,
          completed: false
        }
      });

      this.updateText = "";
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

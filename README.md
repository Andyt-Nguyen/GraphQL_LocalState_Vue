# Graphql Localstate w/ Vue

## Objective

Discover, learn, and compare the different approaches on how to query/mutate GraphQL's local state.

## Installation

```
$ npm i
or
$ yarn
```

## Setting up Local State

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { createProvider } from './vue-apollo';
import RandomId from 'random-id';
import GetTodos from './graphql/GetTodos';
Vue.config.productionTip = false;

const localState = {
	clientState: {
		defaults: {
			todos: [] // Set up out local state properties that will passing around to other components
		},
		resolvers: {
			Mutation: {
				// Mutations for our local state

				addTodo(
					_,
					{ title /* incoming data */ },
					{ cache /* access to the cache */ }
				) {
					// Read the query and access all of the data in "todos"
					const { todos } = cache.readQuery({ query: GetTodos });
					const todo = {
						id: RandomId(10),
						completed: false,
						title,
						__typename: 'Todo'
					};
					cache.writeData({
						data: {
							todos: [...todos, todo] // Over write the data in todos with the new data
						}
					});
				},

				deleteTodo(_, { id }, { cache }) {
					const { todos } = cache.readQuery({ query: GetTodos });
					const filteredTodos = todos.filter(({ id: todoId }) => todoId !== id);
					cache.writeData({
						data: {
							todos: filteredTodos
						}
					});
				}
			}
		}
	}
};

new Vue({
	router,
	apolloProvider: createProvider(localState),
	render: (h) => h(App)
}).$mount('#app');
```

```javascript
/* 
	./graphql/AddTodo.js
	Specify the @client directive to let graphql know this is the client
	state you want to manipulate
*/
import gql from 'graphql-tag';

export default gql`
	mutation addTodo($title: String!) {
		addTodo(title: $title) @client
	}
`;
```

```javascript
/* 
	./graphql/GetTodos.js
	Specify the @client directive to let graphql know this is the client
	state you want to manipulate
*/
import gql from 'graphql-tag';

export default gql`
	{
		todos @client {
			id
			title
			completed
		}
	}
`;
```

# Approaches

- Components
- \$apollo

## Approach #1: Components

```javacript
<ApolloQuery>...</ApolloQuery>
<ApolloMutate>...</ApolloMutate>
```

### ApolloQuery

```html
<ApolloQuery require="gql query" :variables="{}">
	<template v-slot="{ result: { loading, error, data}}">
		<div v-if="loading">Loading</div>
		<div v-else-if="error">There was an error</div>
		<div v-else>
			<div v-for="d in data">{{ d }}</div>
		</div>
	</template>
</ApolloQuery>
```

### ApolloMutation

```html
<ApolloMutation mutation="gql mutation query" :variables="{}">
	<template v-slot="{mutation," loading, error}">
		<button @click="mutation">Add todo</button>
	</template>
</ApolloMutation>
```

As you can see implementing these components is super easy! It provides extra functionality that is commonly used in every application when making some kind of request such as the error and loading. However there are some downsides using components and it's READABILITY! I quickly came across this when I wanted to add other mutations to my todo list like editing and deleting.

Here's an example of when using components go bad:

```html
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
						<template
							v-slot="{mutate:deleteTodo, loading:loadingDel, error:errorDel}"
						>
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
						<template
							v-slot="{mutate:updateTodo, loading:loadingTodo, error:errorUpdate}"
						>
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
```

Programming this wasn't too bad if your adding just too mutations but i'm sure if we kept adding features this will turn into one giant mess. This is where using \$apollo can help us with readabilty

## Approach #2: \$apollo event

```html
<template>
	<div>
		<form @submit.prevent="addTodo">
			<input
				type="text"
				v-model="title"
				placeholder="Type here..."
				class="inputStyle"
			/>
			<button type="submit">Submit</button>
		</form>

		<div v-if="$apollo.queries.todos.loading">Loading todos</div>
		<div v-if="$apollo.queries.todos.error">
			There was an error loading todos
		</div>
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
```

```javascript
import GetTodos from '../graphql/GetTodos';
import AddTodo from '../graphql/AddTodo';
import DeleteTodo from '../graphql/DeleteTodo';
import UpdateTodo from '../graphql/UpdateTodo';

export default {
	name: 'ApolloMethods',
	data: () => ({
		title: '',
		todos: [], // This data property will be over written by the apollo object
		isEdit: false,
		updateText: ''
	}),

	apollo: {
		todos: GetTodos // gql query fetching the users
	},

	methods: {
		addTodo() {
			this.$apollo.mutate({
				mutation: AddTodo,
				variables: { title: this.title }
			});
		},

		deleteTodo(id) {
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

			this.updateText = '';
			this.isEdit = false;
		}
	}
};
```

Much better we have a smaller vue file and we can see what functions are being used to get the data and what functions are edititing and deleteing.

# Conclusion

Testing GraphQL's local state was somewhat of a challenge. There are a lot of new things to learn. Setting up the local state, and understanding how mutations work when handling local state. The approaches as seen the "Components" approach can get pretty big if we're planning on nesting more features from Apollo. I think this approach is good if we're just solely just rendering data. The other approach "$apollo" is fantastic! The files looks a lot more smaller and if we need to add aditional functionality it's all there within the function. I like both approches but if i were to prefer one over the other I'd choose the "$apollo" approach.

# Tech

- Vue.js
- GraphQL
- Apollo

# Authors

## [Andrew Ty Nguyen](https://github.com/Andyt-Nguyen)

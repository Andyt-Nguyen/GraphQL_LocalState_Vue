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
			todos: []
		},
		resolvers: {
			Mutation: {
				addTodo(_, { title }, { cache }) {
					const { todos } = cache.readQuery({ query: GetTodos });
					const todo = {
						id: RandomId(10),
						completed: false,
						title,
						__typename: 'Todo'
					};
					cache.writeData({
						data: {
							todos: [...todos, todo]
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

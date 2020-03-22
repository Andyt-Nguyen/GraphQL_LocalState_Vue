import gql from 'graphql-tag';

export default gql`
	mutation updateTodo($id: String!, $title: String!, $completed: Boolean!) {
		updateTodo(id: $id, title: $title, completed: $completed) @client
	}
`;

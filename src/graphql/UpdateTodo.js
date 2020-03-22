import gql from 'graphql-tag';

export default gql`
	mutation updateTodo($id: String!, $title: String!) {
		updateTodo(id: $id, title: $title) @client
	}
`;

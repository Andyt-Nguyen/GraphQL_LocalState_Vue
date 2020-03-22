import gql from 'graphql-tag';

export default gql`
	mutation deleteTodo($id: String!) {
		deleteTodo(id: $id) @client
	}
`;

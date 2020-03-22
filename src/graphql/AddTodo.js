import gql from 'graphql-tag';

export default gql`
	mutation addTodo($title: String!) {
		addTodo(title: $title) @client
	}
`;

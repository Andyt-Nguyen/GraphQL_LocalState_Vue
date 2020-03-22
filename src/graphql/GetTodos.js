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

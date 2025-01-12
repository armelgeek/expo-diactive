const mapping = {
	title: 'title',
	author: 'author',
	published: 'year',
	days: {
		points: 'points',
		steps: 'steps'
	}
};
const targetObjects = books.map(book => Object.keys(mapping).reduce((acc, key) => {
	acc[key] = book[mapping[key]];
	return acc;
}, {}));

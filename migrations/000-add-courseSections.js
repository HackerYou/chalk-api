const models = require("../api/models");
const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/notes');

// Created August 7th 2017
// Migration adds to the users courseSections field, this allows admins to control what a user sees
function saveUser(user) {
	return new Promise((resolve,reject) => {
		const courseSections = user.courses
			.map(course => ({
				courseId: course._id,
				sections: course.sections
			}));
		user.courseSections = courseSections;
		user.save((err,doc) => {
			if(err !== null) {
				console.error(err);
				reject();
			}
			resolve();
		});
	});
}
console.time("Migration");
models.user.find({}, (err,docs) => {

	if(err !== null) {
		console.error(err);
	}
	//For each document
	//Loop through and add to it the 
	const updateUsers = docs.map(saveUser);
	Promise.all(updateUsers)
		.then(() => {
			console.log("All done");
			console.timeEnd("Migration");
			mongoose.disconnect();
		});
})
.populate('courses');


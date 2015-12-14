'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let api = require('./api/index.js');
let jwt = require('jsonwebtoken');
let config = require('./config.js');

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-length, Accept, x-access-token');
  	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
}); 

app.use(bodyParser.json());

app.use((req,res,next) => {
	console.log(`${req.method}: ${req.url}`);
	next();
});

function routeAuth(req,res,next) {
	let token = req.headers['x-access-token'];
	if(token) {
		jwt.verify(token,config.secret,(err,decodedRes) => {
			if(err) {
				res.send({
					error: err
				});
			}
			else {
				req.decodedUser = decodedRes;
				next();
			}
		});
	}
	else {
		res.send({
			error: 'Must send token with your request'
		});
	}	
}
 
app.get('/', (req,res) => {
	res.send('Notes Api');
});

//Topics
app.get('/v1/topic',routeAuth,api.topic.getTopics);
app.post('/v1/topic',routeAuth,api.topic.createTopic);
app.get('/v1/topic/:topicId',routeAuth,api.topic.getTopic);
app.put('/v1/topic/:topicId',routeAuth,api.topic.updateTopic);
app.delete('/v1/topic/:topicId',routeAuth,api.topic.removeTopic);
app.put('/v1/topic/:topicId/exercise/:exerciseId',routeAuth,api.topic.addExercise);
app.delete('/v1/topic/:topicId/exercise/:exerciseId',routeAuth,api.topic.removeExercise);

//Exercises
app.get('/v1/exercise',routeAuth,api.exercise.getExercises);
app.post('/v1/exercise',routeAuth,api.exercise.createExercise);
app.get('/v1/exercise/:exerciseId',routeAuth,api.exercise.getExercise);
app.put('/v1/exercise/:exerciseId',routeAuth,api.exercise.updateExercise);
app.delete('/v1/exercise/:exerciseId',routeAuth,api.exercise.removeExercise);

//Lessons
app.get('/v1/lesson',routeAuth,api.lesson.getLessons);
app.post('/v1/lesson',routeAuth,api.lesson.createLesson);
app.get('/v1/lesson/:lessonId',routeAuth,api.lesson.getLesson);
app.put('/v1/lesson/:lessonId',routeAuth,api.lesson.updateLesson);
app.delete('/v1/lesson/:lessonId',routeAuth,api.lesson.removeLesson);
app.put('/v1/lesson/:lessonId/topic/:topicId',routeAuth,api.lesson.addTopic);
app.delete('/v1/lesson/:lessonId/topic/:topicId',routeAuth,api.lesson.removeTopic);

//Courses 
app.post('/v1/course/template',routeAuth,api.course.createTemplate);
app.get('/v1/course/template',routeAuth,api.course.getTemplates);
app.get('/v1/course/template/:id',routeAuth,api.course.getTemplate);
app.put('/v1/course/template/:id',routeAuth,api.course.updateTemplate);
app.delete('/v1/course/template/:id',routeAuth,api.course.removeCourse);
app.get('/v1/course',routeAuth,api.course.getCourses);
app.post('/v1/course',routeAuth,api.course.createCourse);
app.get('/v1/course/:id',routeAuth,api.course.getCourse);
app.put('/v1/course/:id',routeAuth,api.course.updateCourse);
app.delete('/v1/course/:id',routeAuth,api.course.removeCourse);
app.post('/v1/course/:courseId/section/',routeAuth,api.course.addSection);
app.delete('/v1/course/:courseId/section/:sectionId',routeAuth,api.course.removeSection);
app.put('/v1/course/section/:sectionId/lesson/:lessonId',routeAuth,api.course.addLesson);
app.delete('/v1/course/section/:sectionId/lesson/:lessonId',routeAuth,api.course.removeLesson);
app.post('/v1/course/:courseId/user',routeAuth,api.course.addUser);
app.delete('/v1/course/:courseId/user/:userId',routeAuth,api.course.removeUser);

//Announcements
app.post('/v1/announcement',routeAuth,api.announcement.createAnnouncement);
app.get('/v1/announcement',routeAuth,api.announcement.getAnnouncements);
app.get('/v1/announcement/:id',routeAuth,api.announcement.getAnnouncement);
app.put('/v1/announcement/:id',routeAuth,api.announcement.updateAnnouncement);
app.delete('/v1/announcement/:id',routeAuth,api.announcement.removeAnnouncement);

//Users
app.get('/v1/user/authenticate',api.user.authenticate);
app.post('/v1/user',routeAuth,api.user.addUser);
app.get('/v1/user',routeAuth,api.user.getUsers)
app.get('/v1/user/:id',routeAuth,api.user.getUser);
app.put('/v1/user/:id',routeAuth,api.user.updateUser);
app.delete('/v1/user/:id',routeAuth,api.user.removeUser);
app.put('/v1/user/reset/:email',api.user.resetPassword);

//Media
app.get('/v1/media',routeAuth,api.media.getFiles);
app.post('/v1/media',routeAuth,api.media.uploadFile);
app.delete('/v1/media/:key',routeAuth,api.media.removeFile);

app.listen('3200');
console.log('App listening on port 3200');




'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let api = require('./api/index.js');
let jwt = require('jsonwebtoken');
let config = require('./config.js');
let helmet = require('helmet');

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-length, Accept, x-access-token');
  	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
}); 

app.use(helmet());

app.use(bodyParser.json());

app.use((err, req,res,next) => {
	if(err) {
		console.error(`${err} on ${new Date()}`)
	}
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

function adminRoute(req,res,next) {
	if(!req.decodedUser.admin) {
		res.send({
			message: 'You must be an admin user to access this route'
		});
	}
	else {
		next();
	}
};

function instructorRoute(req,res,next) {
	if(req.decodedUser.admin || req.decodedUser.instructor) {
		next();
	}
	else {
		res.send({
			message: 'You must be an admin or instructor user to access this route'
		});
	}
}
 
app.get('/', (req,res) => {
	res.send('Notes Api');
});

//Topics
app.get('/v1/topic',routeAuth,api.topic.getTopics);
app.post('/v1/topic',routeAuth,adminRoute,api.topic.createTopic);
app.get('/v1/topic/search',routeAuth,adminRoute,api.topic.searchTopics);
app.get('/v1/topic/:topicId',routeAuth,api.topic.getTopic);
app.put('/v1/topic/:topicId',routeAuth,adminRoute,api.topic.updateTopic);
app.delete('/v1/topic/:topicId',routeAuth,adminRoute,api.topic.removeTopic);
app.put('/v1/topic/:topicId/exercise/:exerciseId',routeAuth,adminRoute,api.topic.addExercise);
app.delete('/v1/topic/:topicId/exercise/:exerciseId',routeAuth,adminRoute,api.topic.removeExercise);

//Exercises
app.get('/v1/exercise',routeAuth,api.exercise.getExercises);
app.post('/v1/exercise',routeAuth,adminRoute,api.exercise.createExercise);
app.get('/v1/exercise/:exerciseId',routeAuth,api.exercise.getExercise);
app.put('/v1/exercise/:exerciseId',routeAuth,adminRoute,api.exercise.updateExercise);
app.delete('/v1/exercise/:exerciseId',routeAuth,adminRoute,api.exercise.removeExercise);

//Lessons
app.get('/v1/lesson',routeAuth,api.lesson.getLessons);
app.post('/v1/lesson',routeAuth,adminRoute,api.lesson.createLesson);
app.get('/v1/lesson/:lessonId',routeAuth,api.lesson.getLesson);
app.put('/v1/lesson/:lessonId',routeAuth,adminRoute,api.lesson.updateLesson);
app.delete('/v1/lesson/:lessonId',routeAuth,adminRoute,api.lesson.removeLesson);
app.put('/v1/lesson/:lessonId/topic/:topicId',routeAuth,adminRoute,api.lesson.addTopic);
app.delete('/v1/lesson/:lessonId/topic/:topicId',routeAuth,adminRoute,api.lesson.removeTopic);

//Courses 
app.post('/v1/course/template',routeAuth, adminRoute ,api.course.createTemplate);
app.get('/v1/course/template',routeAuth, adminRoute ,api.course.getTemplates);
app.get('/v1/course/template/:id',routeAuth, adminRoute ,api.course.getTemplate);
app.put('/v1/course/template/:id',routeAuth, adminRoute ,api.course.updateTemplate);
app.delete('/v1/course/template/:id',routeAuth, adminRoute ,api.course.removeCourse);
app.get('/v1/course',routeAuth, adminRoute ,api.course.getCourses);
app.post('/v1/course',routeAuth, adminRoute ,api.course.createCourse);
app.get('/v1/course/:id',routeAuth, api.course.getCourse);
app.put('/v1/course/:id',routeAuth, adminRoute ,api.course.updateCourse);
app.delete('/v1/course/:id',routeAuth, adminRoute ,api.course.removeCourse);
app.get('/v1/course/:sectionId',routeAuth, adminRoute, api.course.getSection);
app.put('/v1/course/:sectionId',routeAuth,adminRoute,api.course.updateSection);
app.post('/v1/course/:courseId/section/',routeAuth, adminRoute ,api.course.addSection);
app.delete('/v1/course/:courseId/section/:sectionId',routeAuth, adminRoute ,api.course.removeSection);
app.put('/v1/course/section/:sectionId/lesson/:lessonId',routeAuth, adminRoute ,api.course.addLesson);
app.delete('/v1/course/section/:sectionId/lesson/:lessonId',routeAuth, adminRoute ,api.course.removeLesson);
app.post('/v1/course/:courseId/user',routeAuth, instructorRoute ,api.course.addUser);
app.delete('/v1/course/:courseId/user/:userId',routeAuth, instructorRoute ,api.course.removeUser);

//Announcements
app.post('/v1/announcement',routeAuth, adminRoute ,api.announcement.createAnnouncement);
app.get('/v1/announcement',routeAuth, adminRoute ,api.announcement.getAnnouncements);
app.get('/v1/announcement/:id',routeAuth, adminRoute ,api.announcement.getAnnouncement);
app.put('/v1/announcement/:id',routeAuth, adminRoute ,api.announcement.updateAnnouncement);
app.delete('/v1/announcement/:id',routeAuth, adminRoute ,api.announcement.removeAnnouncement);

//Users
app.get('/v1/user/authenticate',api.user.authenticate);
app.post('/v1/user',routeAuth, adminRoute ,api.user.addUser);
app.get('/v1/user',routeAuth, instructorRoute ,api.user.getUsers)
app.get('/v1/user/:id',routeAuth ,api.user.getUser);
app.put('/v1/user/:id',routeAuth ,api.user.updateUser);
app.delete('/v1/user/:id',routeAuth, adminRoute ,api.user.removeUser);
app.put('/v1/user/reset/:email',api.user.resetPassword);
app.post('/v1/user/course/:courseId/lesson/:lessonId/favorite',routeAuth,api.user.favoriteLesson);
app.delete('/v1/user/course/:courseId/lesson/:lessonId/favorite',routeAuth,api.user.removeFavoriteLesson);


//Media
app.get('/v1/media',routeAuth, adminRoute ,api.media.getFiles);
app.post('/v1/media',routeAuth, adminRoute ,api.media.uploadFile);
app.delete('/v1/media/:key',routeAuth, adminRoute ,api.media.removeFile);

app.listen('3200');
console.log('App listening on port 3200');




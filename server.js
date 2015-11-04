'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let api = require('./api/index.js');

app.use(bodyParser.json());

app.get('/', (req,res) => {
	res.send('Hi');
});

//Topics
app.get('/v1/topic',api.topic.getTopics);
app.post('/v1/topic',api.topic.createTopic);

//Exercises
app.get('/v1/exercise',api.exercise.getExercises);
app.post('/v1/exercise',api.exercise.createExercise);

//Lessons
app.get('/v1/lesson',api.lesson.getLessons);
app.post('/v1/lesson',api.lesson.createLesson);
app.get('/v1/lesson/:lessonId',api.lesson.getLesson);
app.put('/v1/lesson/:lessonId',api.lesson.updateLesson);
app.delete('/v1/lesson/:lessonId',api.lesson.removeLesson);
app.put('/v1/lesson/:lessonId/topic/:topicId',api.lesson.addTopic);
app.delete('/v1/lesson/:lessonId/topic/:topicId',api.lesson.removeTopic);

//Courses 
app.get('/v1/course',api.course.getCourses);
app.post('/v1/course',api.course.createCourse);
app.get('/v1/course/:id',api.course.getCourse);
app.put('/v1/course/:id',api.course.updateCourse);
app.delete('/v1/course/:courseId',api.course.removeCourse);
app.put('/v1/course/:courseId/lesson/:lessonId',api.course.addLesson);
app.delete('/v1/course/:courseId/lesson/:lessonId',api.course.removeLesson);

app.listen('3200');
console.log('App listening on port 3200');
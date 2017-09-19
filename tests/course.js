'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let course = require('../api/course.js');
let lesson = require('../api/lesson.js');
let mongoose = require('mongoose');
let request = require('supertest')('http://localhost:3200');

mongoose.Promise = Promise;

function addThreeSections(mockCourse,cb) {
	for(let i = 0; i < 3; i++) {
		course.addSection({
			params: {
				courseId: mockCourse._id
			},
			body: {
				title: `New section ${i}`
			}
		}, {
			send(data) {
				if(i == 2) {
					cb();
				}
			}
		});
	}
}

function addLesson(cb) {
	lesson.createLesson({
		body: {
			title: `Course add lesson 1`
		}
	}, {
		send(data) {
			cb(data);
		}
	});
}

function removeCourse(id) {
	return new Promise((resolve,reject) => {
		course.removeCourse({
			params: {
				id: id
			}
		},
		{		
			send() {
				resolve();
			}
		});
	});
}

function removeUser(email) {
	return new Promise((resolve,reject) => {
		models.user.findOneAndRemove({email},(err) => {
			if(err !== null) {
				reject();
			}
			resolve();
		})
	});
}

function getStudent(id) {
	return new Promise((resolve,reject) => {
		models.user.findOne({_id:id}, (err,doc) => {
			resolve(doc);
		});
	});
}

describe('Courses', function() {

	let mockCourse;
	let doubleId;
	let lessonId;
	let template;
	let templateId;
	let sectionId;
	let user;
	let instructor;


	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		lesson.createLesson({
			body: {
				title: "Course add lesson"
			}
		}, {
			send(data) {
				lessonId = data.lesson._id;
				models.user.findOne({},(err,mockUser) => {
					user = mockUser;
					models.user.findOne({instructor: true}, (err,instructorUser) => {
						instructor = instructorUser;
					});
					done();				
				});
			}
		});
	});
	after((done) => {
		Promise.all([
			removeCourse(doubleId),
			removeUser('ryan@hackeryouDoubleTest.com'),
			removeUser('ryan.doubleadd@hackeryou.com')])
			.then(() => {
				mongoose.disconnect();
				done();
			});
	});


	it('should create a template', (done) => {
		course.createTemplate({
			body: {
				"title": "New Template"
			}
		}, {
			send(data) {
				templateId = data.course._id;
				expect(data).to.be.an('object');
				expect(data.course.template).to.be(true);
				done();
			}
		});
	});

	it('should get all templates', (done) => {
		course.getTemplates({}, 
		{
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course[0].template).to.be.eql(true);
				done();
			} 
		})
	});

	it('should get a template', (done) => {
		course.getTemplate({
			params: {
				id: templateId
			}
		}, {
			send(data) {
				template = data.course;
				expect(data).to.be.an('object');
				expect(data.course.template).to.be.eql(true);
				done();
			}
		})
	});

	it('should update a template', (done) => {
		template.title = 'Updated Template';
		course.updateTemplate({
			params: {
				id: templateId
			},
			body: template
		}, {
			send(data) {
				done();
			}
		});
	});

	it('should create a course with 1 user: the instructor', (done) => {

		let courseFromTemplate = Object.assign({},template.toJSON(), {
			'term': 'Summer 2015',
			'description': 'Test description',
			'instructor': instructor._id
		});
		course.createCourse({
			body: courseFromTemplate
		},{
			send(data) {
				mockCourse = data.course;
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				expect(data.course.students).to.contain(instructor._id.toString());
				expect(data.course.sections).to.be.an('array');
				expect(data.course.students).to.be.an('array');
				expect(data.course.template).to.be.eql(false);
				done();
			}
		});
	});

	it('should return all courses', (done) => {
		course.getCourses({},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				expect(data.course.length).to.be.above(0);
				expect(data.course).to.be.an('array');
				done();
			}
		});
	});
	
	it('should get a specific course', (done) => {
		course.getCourse({params: { id: mockCourse._id } }, {
			send(data) {
				expect(data).to.be.an('object');
				done();
			}
		});
	});
	
	it('should update the courses', (done) => {
		mockCourse.title = 'updated';
		course.updateCourse({
			params: {id:mockCourse._id},
			body: mockCourse.toJSON()
		},{
			send(data) {
				expect(data.course.title).to.be.eql('updated');
				expect(data.course.updated_at).to.be.a('number');
				done();
			}
		});
	});

	it('should add the first student (second user) to a course', (done) => {
		course.addUser({
			params: {
				courseId: mockCourse._id,
			},
			body: {
				emails: 'ryan@hackeryoudoubletest.com'
			}
		}, {
			send(data) {
				const student = data.course.students.find((student) => student.email === 'ryan@hackeryoudoubletest.com');
				expect(data).to.be.an('object');
				expect(data.course.students).to.have.length(2)
				expect(student).to.not.have.key('password');
				expect(student.courseSections).to.be.an('array');
				expect(student.courseSections[0].courseId).to.be(mockCourse._id.toString());
				done();
			}
		})
	});

	it('should not add the same user to a course', (done) => {
		course.addUser({
			params: {
				courseId: mockCourse._id,
			},
			body: {
				emails: 'ryan@hackeryoudoubletest.com'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course.students).to.have.length(2)
				expect(data.course.students[0]).to.not.have.key('password');
				done();
			}
		})
	});

	it('should add a user to the course but not create a new user for an existing user', (done) => {
		//Add a new user to the mock course
		course.addUser({
			params: {
				courseId: mockCourse._id
			},
			body: {
				emails: 'ryan.doubleadd@hackeryou.com'
			}
		}, {
			send(userData) {
				expect(userData).to.be.an('object');
				expect(userData.course.students).to.have.length(3);
				//Then make new course
				course.createCourse({
					body: {
						title: 'Double Test',
						instructor: instructor._id
					}
				}, {
					send(data) {
						//And try to add the same user to that.
						doubleId = data.course._id;
						course.addUser({
							params: {
								courseId: data.course._id
							},
							body: {
								//This time with spaces
								emails: 'ryan.doubleadd@hackeryou.com  '
							}
						}, {
							send(data) {	
								expect(data).to.be.an('object');
								expect(data.course.students).to.have.length(2);
								// Make sure there is no new user created
								models.user.find({email: 'ryan.doubleadd@hackeryou.com'}, (err,docs) => {
									expect(docs).to.have.length(1);
									done();
								});
							}
						})
					}
				});
			}
		})
	});

	it('should remove a user from a course', (done) => {
		models.course.findOne({_id: mockCourse._id}, (err,doc) => {
			let student = doc.students[0];
			getStudent(student)
				.then((studentModel) => {
					course.removeUser({
						params: {
							userId: student,
							courseId: mockCourse._id
						},
						body: {}
					}, {
						send(data) {
							expect(data).to.be.an('object');
							expect(data.course.students).to.be.an('array');
							expect(data.course.students).to.have.length(2); 
							models.user.findOne({_id: student}, (err,doc) => {
								expect(doc).to.be.an('object');
								expect(doc.courses).to.have.length(studentModel.courses.length > 0 ? studentModel.courses.length - 1 : 0);
								done();
							});
						}
					});
				});
		});
	});

	it('should add a section', (done) => {
		course.addSection({
			params: {
				courseId: mockCourse._id
			},
			body: {
				title: 'New section'	
			}
		}, {
			send(data) {
				sectionId = data.course.sections[0];
				expect(data.course.sections).to.have.length(1);
				course.getCourse({
					params: {
						id: mockCourse._id
					},
					body: {}
				}, {
					send(data) {
						expect(data.course.sections).to.be.an('array');
						expect(data.course.sections[0]).to.be.an('object');
						done();
					}
				});
			}
		});
	});

	it('should add three sections', (done) => {
		addThreeSections(mockCourse,() => {
			course.getCourse({
				params: {
					id: mockCourse._id
				},
				body: {}
			}, {
				send(data) {
					expect(data.course.sections).to.be.an('array');
					expect(data.course.sections).to.have.length(4);
					done();
				}
			})
		});
	});

	it('should reorder the sections', (done) => {
		course.getCourse({
			params: {
				id: mockCourse._id
			}, 
			body: {}
		},
			{	
				send(data) {
					//Move a section around
					let sections = data.course.sections;
					let secondSection = data.course.sections.splice(1,1);
					let sectionTitle = secondSection[0].title;
					sections.push(secondSection[0]);

					data.course.sections = sections;
					course.updateCourse({
						params: {id: mockCourse._id },
						body: data.course
					}, {
						send(updatedCourse) {
							course.getCourse({
								params: {
									id: mockCourse._id
								},
								body: {}
							}, {
								send(data) {
									expect(data.course.sections).to.be.an('array');
									expect(data.course.sections).to.have.length(4);
									expect(data.course.sections[3].title).to.be.eql(sectionTitle);
									done();
								}
							});
						}
					});
			}
		});
			
	});

	it('should add a lesson to a section', (done) => {
		course.addLesson({
			params: {
				lessonId: lessonId,
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('section');
				expect(data.section.lessons).to.have.length(1);
				expect(data.section.lessons[0]).to.be.an('object');
				course.getCourse({params: { id: mockCourse._id } }, {
					send(data) {
						expect(data.course.sections).to.be.an('array');
						expect(data.course.sections[0].lessons).to.be.an('array');
						expect(data.course.sections[0].lessons[0]).to.be.an('object');
						done();
					}
				});
			}
		});
	});

	it('should get a section', (done) => {
		course.getSection({
			params: {
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data.section).to.be.an('object');
				done();
			}
		})
	});

	it('should add extra lesson to a section', (done) => {
		addLesson((data) => {
			course.addLesson({
				params: {
					lessonId: data.lesson._id,
					sectionId: sectionId
				}
			}, {
				send(sectionWithLessons) {
					expect(sectionWithLessons.section.lessons).to.have.length(2);
					done();
				}
			});
		});
	});

	it('should reorder the lessons in a section', (done) => {
		course.getSection({
			params: {
				sectionId: sectionId
			}
		}, {
			send(data) {
				let lastLesson = data.section.lessons.splice(1,1)[0];
				let lessonTitle = lastLesson.title;
				data.section.lessons.unshift(lastLesson);

				course.updateSection({
					params: {
						sectionId: sectionId
					},
					body: data.section
				},{
					send(updatedSection) {
						expect(updatedSection.section.lessons[0].title).to.be.eql(lessonTitle);
						done();
					}
				})

			}
		});
	});

	it('should remove a lesson from a section', (done) => {
		course.removeLesson({
			params: {
				lessonId: lessonId,
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.section.lessons).to.have.length(1);
				done();
			}
		});
	});

	it('should remove a section', (done) => {
		course.removeSection({
			params: {
				courseId: mockCourse._id,
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course.sections).to.be.an('array');
				expect(data.course.sections).to.have.length(3);
				done();
			}
		});
	});

	it('should remove a course', (done) => {
		course.removeCourse({
			params: {
				id: mockCourse._id
			}
		}, {
			send(data) {
				expect(data.course).to.be.empty();
				done();
			}
		});
	});

	it('should remove a template', (done) => {
		expect(template.template).to.be.eql(true);
		course.removeCourse({
			params: {
				id: templateId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course).to.be.an('array');
				expect(data.course).to.have.length(0);
				done();
			}
		})
	});

}); //End of describe







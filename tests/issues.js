'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let mongoose = require('mongoose');
let request = require('supertest')('http://localhost:3200');
const user = require('../api/user.js');
let bcrypt = require('bcryptjs');

describe("Issues", () => {
	let token;
	let userId;
	let mockIssue;
	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		let userPassword = bcrypt.hashSync('test',10);
		let userModel = {
			firstName: 'Ryan',
			lastName: 'Christiani',
			email: 'ryan@chalktesttests.js.com',
			password: userPassword,
			admin: true,
			first_sign_up: true,
			instructor: true
		};
		new models.user(userModel).save((err,doc) => {
			userId = doc._id.toString();
			if(err) {
				throw err;
			}
			user.authenticate({
				query: {
					email: 'ryan@chalktesttests.js.com',
					password: 'test'
				},
				params:{},
				body: {}
			} , {
				send(data) {
					token = data.token;
					done();
				}
			});
		});
	});
	after((done) => {
		mongoose.disconnect();
		done();
	});
	it("should add an issue", (done) => {
		request
			.post('/v2/flaggedIssues')
			.set('x-access-token', token)
			.send({
				title: "Test Topic",
				body: "Lorem ipsum",
				topic_id: "666"
			})
			.end((err,res) => {
				const issue = res.body.issue
				mockIssue = issue;
				expect(err).to.be(null);
				expect(issue).to.be.an('object');
				expect(issue.created_at).to.be.a('number');
				done();
			});
	});
	it("should get issues", (done) => {
		request
			.get('/v2/flaggedIssues')
			.set('x-access-token', token)
			.end((err, res) => {
				const issues = res.body.issues;
				expect(err).to.be(null);
				expect(issues).to.be.an('array');
				expect(issues.length).to.greaterThan(0);
				done();
			});
	});
	it("should get issue by id", (done) => {
		request
			.get(`/v2/flaggedIssues/${mockIssue._id}`)
			.set('x-access-token', token)
			.end((err, res) => {
				const issue = res.body.issue;
				expect(err).to.be(null);
				expect(issue).to.be.an('object');
				done();
			});
	});
	it("should update specific issue by id", (done) => {
		mockIssue.title = "An updated Title";
		mockIssue.archived = true;
		mockIssue.archived_by = userId;
		request
			.put(`/v2/flaggedIssues/${mockIssue._id}`)
			.set('x-access-token', token)
			.send(mockIssue)
			.end((err,res) => {
				const issue = res.body.issue;
				expect(err).to.be(null);
				expect(issue.title).to.be('An updated Title');
				expect(issue.archived).to.be.ok();
				expect(issue.archived_by).to.be(userId);
				done();
			});
	});
	it("should delete specific issue by id", (done) => {
		request
			.delete(`/v2/flaggedIssues/${mockIssue._id}`)
			.set('x-access-token', token)
			.end((err, res) => {
				const issues = res.body.issues;
				expect(err).to.be(null);
				expect(issues).to.be.an('array');
				done();
			});

	});
});

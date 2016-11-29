'use strict';

let a = require('../api/announcement.js');
let expect = require('expect.js');
let mongoose = require('mongoose');
let request = require('supertest')('http://localhost:3200');


xdescribe('Announcements', () => {
	let aId;
	let mockAnnouncement;
	before((done) => {	
		mongoose.connect('mongodb://localhost/notes');
		done();
	});
	after((done) => {
		mongoose.disconnect();
		done();
	});
	
	it('should create an announcement', (done) => {
		a.createAnnouncement({
			body: {
				title: 'A new announcement',
				body: 'The message body',
				audience: 'Summer 2015'
			}	
		}, {
			send(data) {
				aId = data.announcement._id;
				mockAnnouncement = data.announcement;
				expect(data).to.be.an('object');
				expect(data).to.have.key('announcement');
				expect(data.announcement.title).to.be.eql('A new announcement');
				expect(data.announcement.created_at).to.be.a('number');
				expect(data.announcement.body).to.be.a('string');
				expect(data.announcement.body).to.be.eql('The message body');
				expect(data.announcement.audience).to.be.eql('Summer 2015');
				done();
			}
		});
	});
	
	it('should get all announcements', (done) => {
		a.getAnnouncements({
			params: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.announcement).to.be.an('array');
				done();
			}
		})
	});
	
	it('should get a specific announcement', (done) => {
		a.getAnnouncement({
			params: {
				id: aId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.announcement._id).to.be.eql(aId);
				done();
			}
		});
	});

	it('should update a specific announcement', (done) => {
		mockAnnouncement.title = 'Updated Announcement';
		a.updateAnnouncement({
			params: {
				id: aId
			},
			body: mockAnnouncement
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.announcement.title).to.be.eql('Updated Announcement');
				expect(data.announcement.updated_at).to.be.a('number');
				done();
			}
		})
	});

	it('should get all announcements by term', (done) => {
		a.getAnnouncements({
			params: {
				audience: 'Summer 2015'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.announcement).to.be.an('array');
				expect(data.announcement).to.have.length(1);
				expect(data.announcement[0].audience).to.be.eql('Summer 2015');
				done();
			}
		});
	});

	it('should delete an announcement', (done) => {
		a.removeAnnouncement({
			params: {
				id: aId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.announcement).to.be.an('array');
				expect(data.announcement).to.have.length(0);
				done();
			}	
		})
	});
});







const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
// Create an issue with every field: POST request to /api/issues/{project}
// Create an issue with only required fields: POST request to /api/issues/{project}
// Create an issue with missing required fields: POST request to /api/issues/{project}
  suite('POST request tests', function() {
    test('Create an issue with every field', function(done){
      chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'chai test 1',
        issue_text: 'chai test 1',
        created_by: 'chai test 1',
        assigned_to: 'tester',
        status_text: 'open'
      })
      .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'chai test 1');
          assert.equal(res.body.issue_text,'chai test 1');
          assert.equal(res.body.created_by,'chai test 1');
          assert.equal(res.body.assigned_to,'tester');
          assert.equal(res.body.status_text,'open');
          done();
      })
    });

    test('Create an issue with only required fields', function(done){
      chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'chai test 1',
        issue_text: 'chai test 1',
        created_by: 'chai test 1'
      })
      .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'chai test 1');
          assert.equal(res.body.issue_text,'chai test 1');
          assert.equal(res.body.created_by,'chai test 1');
          assert.equal(res.body.assigned_to,'');
          assert.equal(res.body.status_text,'');
          done();
      })
    });
    
    test('Create an issue with missing required fields', function(done){
      chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'chai test 1'
      })
      .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error,'required field(s) missing');
          done();
      })
    });
  });

// View issues on a project: GET request to /api/issues/{project}
// View issues on a project with one filter: GET request to /api/issues/{project}
// View issues on a project with multiple filters: GET request to /api/issues/{project}
  suite('GET request tests', function() {
    test('View issues on a project', function(done){
      chai.request(server)
      .get('/api/issues/apitest')
      .query({})
      .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          done();
      })
    });
    test('View issues on a project with one filter', function(done){
        chai.request(server)
        .get('/api/issues/apitest')
        .query({
          issue_text: "Get Issues Test"
        })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((result) => {
              assert.equal(result.created_by,'fCC')
            })
            done();
        })
    });
    test('View issues on a project with multiple filters', function(done){
        chai.request(server)
        .get('/api/issues/apitest')
        .query({
          assigned_to: "Bob",
          issue_text: "Filter Issues Test"
        })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((result) => {
              assert.equal(result.issue_title,'To be Filtered')
            })
            done();
        })
    });
  });
// Update one field on an issue: PUT request to /api/issues/{project}
// Update multiple fields on an issue: PUT request to /api/issues/{project}
// Update an issue with missing _id: PUT request to /api/issues/{project}
// Update an issue with no fields to update: PUT request to /api/issues/{project}
// Update an issue with an invalid _id: PUT request to /api/issues/{project}
  suite('PUT request tests', function() {
    test('Update one field on an issue', function(done){
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "60c2e5a0a1158f0dc14c2930",
        issue_title: 'chai test 2'
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result,'successfully updated');
          done();
      })     
    });
    test('Update multiple fields on an issue', function(done){
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "60c2e5a0a1158f0dc14c2930",
        issue_title: 'chai test 2',
        issue_text: 'chai test 2',
        created_by: 'chai test 2'
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result,'successfully updated');
          done();
      })     
    });
    test('Update an issue with missing _id', function(done){
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: '',
        issue_title: 'chai test 3',
        issue_text: 'chai test 3',
        created_by: 'chai test 3'
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error,'missing _id');
          done();
      })   
    });
    test('Update an issue with no fields to update', function(done){
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "60c2e5a0a1158f0dc14c2930"
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error,'no update field(s) sent');
          assert.equal(res.body._id, "60c2e5a0a1158f0dc14c2930");
          done();
      })   
    });
    test('Update an issue with an invalid _id', function(done){
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "ACBADGDAUBGADK",
        issue_title: 'chai test 2',
        issue_text: 'chai test 2',
        created_by: 'chai test 2'
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error,'could not update');
          assert.equal(res.body._id, "ACBADGDAUBGADK");
          done();
      })   
    });
  });
// Delete an issue: DELETE request to /api/issues/{project}
// Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
// Delete an issue with missing _id: DELETE request to /api/issues/{project}
  suite('DELETE request tests', function() {
    test('Delete an issue', function(done){
      chai.request(server)      
      .delete('/api/issues/apitest')
      .send({
        _id: '60c2e5a0a1158f0dc14c2930'
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result,"successfully deleted");
          assert.equal(res.body._id, '60c2e5a0a1158f0dc14c2930');
          done();
      })   
    });

    test('Delete an issue with an invalid _id', function(done){
      chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: "ACBADGDAUBGADK"
      })
       .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error,"could not delete");
          assert.equal(res.body._id,"ACBADGDAUBGADK");
          done();
      })  
    });

    test('Delete an issue with missing _id', function(done){
      chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: ""
      })
       .end(function(err, res) {
          assert.equal(res.body.error,"missing _id");
          done();
      })  
    });
  });
  
});

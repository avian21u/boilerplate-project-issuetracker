'use strict';
const bodyParser = require("body-parser");
//Require mongoose for DB; set up database
  let mongoose;
  try {
    mongoose = require("mongoose");
  } catch (e) {
    console.log(e);
  };

module.exports = function (app) {
  
  //Require body-parser for parsing through form data
  app.use(bodyParser.urlencoded({ extended: "false" }));
  app.use(bodyParser.json());
  
  //Create schema
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
  const {Schema} = mongoose;
  const issueSchema = new Schema(
    {
      issue_title: {type: String, required: true},
      issue_text: {type: String, required: true},
      created_on: {type: String, default: Date, required: true},
      updated_on: {type: String, default: Date, required: true},
      created_by: {type: String, required: true},
      assigned_to: {type: String, default: ""},
      open: {type: Boolean, default: true},
      status_text: {type: String, default: ""}
    });
  let Issue = mongoose.model("Issue", issueSchema);
  
  app.route('/api/issues/:project')
    
    // View issues on a project: GET request to /api/issues/{project}
    // View issues on a project with one filter: GET request to /api/issues/{project}
    // View issues on a project with multiple filters: GET request to /api/issues/{project}
    .get(function (req, res){
      let query = Object.keys(req.query).length >= 1 ? req.query : {};
      let project = req.params.project;
      const filter = query;
      Issue.find(filter, (err, data) => {
        if (err) return err;
        res.send(data);
      });
    })
    
    // Create an issue with every field: POST request to /api/issues/{project}
    // Create an issue with only required fields: POST request to /api/issues/{project}
    // Create an issue with missing required fields: POST request to /api/issues/{project}
    .post(function (req, res){
      let project = req.params.project;
      // If you send a POST request to /api/issues/{projectname} without the required fields, 
      // returned will be the error { error: 'required field(s) missing' }
      if ( (!req.body.issue_title || req.body.issue_title.trim() === "") && (!req.body.issue_text|| req.body.issue_text.trim() === "") 
          && (!req.body.created_by || req.body.created_by.trim() === "") && (!req.body.assigned_to || req.body.assigned_to.trim() === "") 
          && (!req.body.status_text || req.body.status_text.trim() === "")) 
      {
        res.send({ 
          error: 'required field(s) missing'
        });
        return;
      }
        
      //Create New Issue
      const newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text
      });
      
      if(!req.body.issue_text )
    
      newIssue.save((err, data) => {
        if (err) {
          res.send("error: 'required field(s) missing");
          return err;
        }
        res.send(data);
        return;
      });
    })
  
    // WORKS: Update one field on an issue: PUT request to /api/issues/{project}
    // WORKS: Update multiple fields on an issue: PUT request to /api/issues/{project}
    // Update an issue with missing _id: PUT request to /api/issues/{project}
    // Update an issue with no fields to update: PUT request to /api/issues/{project}
    // Update an issue with an invalid _id: PUT request to /api/issues/{project}
    .put(function (req, res){
      let project = req.params.project;
      let issueID = req.body._id;
      
      Issue.findById(issueID, (err, data) => {
        if (err) {
          res.send({
            error: 'missing _id'
          });
          return err;
        };
        
        // When the PUT request sent to /api/issues/{projectname} does not include update fields, 
        // the return value is { error: 'no update field(s) sent', '_id': _id }.
        if ( (!req.body.issue_title || req.body.issue_title.trim() === "") && (!req.body.issue_text|| req.body.issue_text.trim() === "") 
            && (!req.body.created_by || req.body.created_by.trim() === "") && (!req.body.assigned_to || req.body.assigned_to.trim() === "") 
            && (!req.body.status_text || req.body.status_text.trim() === "") && (!req.body.open)) 
        {
          res.send({ 
            error: 'no update field(s) sent', '_id': issueID
          });
          return;
        }
        
        //Deals with other fields
        if(req.body.issue_title){
          data.issue_title = req.body.issue_title;  
        };
        if(req.body.issue_text){
          data.issue_text = req.body.issue_text
        };
        if(req.body.created_by){
          data.created_by = req.body.created_by
        };
        if(req.body.assigned_to){
          data.assigned_to = req.body.assigned_to
        };
        if(req.body.status_text){
          data.status_text = req.body.status_text 
        };
        //Closes issue if checkbox is chosen - THIS IS NOT WORKING (5/10/21)
        if(req.body.open){
          data.open = req.body.open;
        };
        //Updates the last updated date
        data.updated_on = new Date();
        //Saves to database
        data.save((err, result) => {
          if (err) {
            res.send({
              error: 'could not update', '_id': issueID
            });
            return err
          };
          res.send({
            result: 'successfully updated', 
            '_id': issueID
          });
        });
      });
    })
    
    // Delete an issue: DELETE request to /api/issues/{project}
    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    .delete(function (req, res){
      let project = req.params.project;
      let issueID = req.body._id;
      
      Issue.findByIdAndDelete(issueID, (err, data) => {
        if (!issueID || issueID.trim() === "") {
          res.send({
            error: 'missing _id'
          })
          return;
        }
        if (err) {
          res.send({
            error: 'could not delete', 
          '_id': issueID
          })
          return err;
        }
        res.send({
          result: 'successfully deleted', 
          '_id': issueID
        })
        return;
      });
    });
    
};

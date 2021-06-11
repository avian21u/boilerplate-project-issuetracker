'use strict';
const bodyParser = require("body-parser");
//Require mongoose for DB; set up database
let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
};

module.exports = function(app) {

  //Require body-parser for parsing through form data
  app.use(bodyParser.urlencoded({ extended: "false" }));
  app.use(bodyParser.json());

  //Create schema
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
  const { Schema } = mongoose;
  const issueSchema = new Schema(
    {
      issue_title: { type: String, required: true },
      issue_text: { type: String, required: true },
      created_on: { type: String, default: Date, required: true },
      updated_on: { type: String, default: Date, required: true },
      created_by: { type: String, required: true },
      assigned_to: { type: String, default: "" },
      open: { type: Boolean, default: true },
      status_text: { type: String, default: "" },
      project: { type: String }
    });
  let Issue = mongoose.model("Issue", issueSchema);

  app.route('/api/issues/:project')

    // View issues on a project: GET request to /api/issues/{project}
    // View issues on a project with one filter: GET request to /api/issues/{project}
    // View issues on a project with multiple filters: GET request to /api/issues/{project}
    .get(function(req, res) {
      // Clear plate for tests
      let filter = Object.keys(req.query).length >= 1 ? Object.assign(req.query) : {};
      filter.project = req.params.project;
      Issue.find(filter, (err, data) => {
        if (err) return err;
        return res.json(data);
      });
    })

    // Create an issue with every field: POST request to /api/issues/{project}
    // Create an issue with only required fields: POST request to /api/issues/{project}
    // Create an issue with missing required fields: POST request to /api/issues/{project}
    .post(function(req, res) {
      let missing_title = !req.body.issue_title || req.body.issue_title.trim() === "";
      let missing_issue = !req.body.issue_text || req.body.issue_text.trim() === "";
      let missing_creator = !req.body.created_by || req.body.created_by.trim() === "";

      // If you send a POST request to /api/issues/{projectname} without the required fields, 
      // returned will be the error { error: 'required field(s) missing' }
      if (missing_title == true || missing_issue == true || missing_creator == true) {
        return res.json({
          error: 'required field(s) missing'
        });
      }
      else {
        //Create New Issue
        const newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          project: req.params.project
        });

        newIssue.save((err, data) => {
          if (err) {
            return res.json({
              error: 'required field(s) missing'
            });
          }
          return res.json(data);
        });
      }
    })

    // WORKS: Update one field on an issue: PUT request to /api/issues/{project}
    // WORKS: Update multiple fields on an issue: PUT request to /api/issues/{project}
    // Update an issue with missing _id: PUT request to /api/issues/{project}
    // Update an issue with no fields to update: PUT request to /api/issues/{project}
    // Update an issue with an invalid _id: PUT request to /api/issues/{project}
    .put(function(req, res) {
      let issueID = req.body._id;

      // Check if there is an ID provided
      if (!issueID || issueID.trim() === "") {
        return res.json({
          error: 'missing _id'
        });
      }

      // Initiate update object
      let update = {};
      Object.keys(req.body).forEach((key) => {
        if(req.body[key] && req.body[key].trim() !== "") {
          update[key] = req.body[key];
        }
      });
      // 2, because you need ID and one field
      if (Object.keys(update).length < 2) {
        return res.json({
          error: 'no update field(s) sent', 
          _id: issueID
        });        
      };
      // Updates the last updated date
      update.updated_on = new Date();      

      // Update database
      Issue.findByIdAndUpdate(issueID, update, {new: true}, (err, output) => {
        // If there is no error
        if (!err && output) {
          return res.json({
            result: 'successfully updated',
            _id: issueID
          });
        }
        // Otherwise let user know about the error
        else if (!output) {
          return res.json({
            error: 'could not update', 
            _id: issueID
          });
        }
      })
    })

    // Delete an issue: DELETE request to /api/issues/{project}
    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    .delete(function(req, res) {
      let issueID = req.body._id;
      if (!issueID || issueID.trim() === "") {
        return res.json({
          error: 'missing _id'
        })
      }
      else if (Object.keys(req.body).length > 1) {
          return res.json({
              error: 'could not delete',
              _id: issueID
          })  
      }
      else {
        Issue.findByIdAndDelete(issueID, (err, data) => {
          if (err) {
            return res.json({
              error: 'could not delete',
              _id: issueID
            })
            // return err;
          }
          else {
            return res.json({
              result: 'successfully deleted',
              _id: issueID
            })
          }
        });
      }
    });
};

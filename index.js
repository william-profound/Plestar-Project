const express = require('express');
const mysql = require('mysql');
const http = require('http');
const app = express();
const { select, insert, update, remove } = require('./db');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const httpServer = http.createServer(app);
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
httpServer.listen(3500, () => {
    console.log('HTTP server is running on port 3500');
});
app.post('/signup',(req, res) => { 
    const {fullname, employeeid, mobileno } = req.body;
    if(fullname && employeeid && mobileno){
        select("employees", ['*'], '`employeeid` = ? or mobileno=?', [employeeid, mobileno], '', '', (checkErr, checkResult) => {
            if (checkErr) {
                console.error(checkErr);
                res.status(200).json({response : 'error', data : [], message : "Error, try again"});
            } else {
                if (checkResult.length > 0) {
                  res.status(200).json({response : 'error', data : [checkResult], message : "Employee with same mobile number is already exists"}); 
                } else {
                    insert('employees', ['fullname', 'employeeid', 'mobileno'], [fullname, employeeid, mobileno], (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error(insertErr);
                            res.status(200).json({response : 'error', data : [], message : "Error in inserting employee details"});
                        } else {
                            res.status(200).json({response : 'success', data : {'id':insertResult.insertId,'employeeid':employeeid}, message : "Employee has been inserted successfully"});
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).json({response : 'error', data : [], message : "Give values can't be empty"});
    }
});
app.post('/set_password', (req, res) => {
    const {password, id, employeeid} = req.body;
    if(password && id && employeeid){
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) {
                console.error('Error generating salt:', err);
                res.status(200).json({response : 'error', data : [], message : "Error in updating password, Try again."});
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    console.error('Error hashing password:', err);
                    res.status(200).json({response : 'error', data : [], message : "Error in updating password, Try again."});
                }     
                update('employees', {'password': hash}, 'employeeid = ?', [employeeid],  (updateErr, updateResult) => {
                     if (updateErr) {
                           console.error(updateErr);
                           res.status(200).json({response : 'error', data : [], message : "Error in updating password, Try again."});
                    }else if(updateResult.affectedRows){
                           console.log('Password has been updated successfully');
                           res.status(200).json({response : 'success', data : {'id':id,'employeeid':employeeid}, message : "Password has been updated successfully"});
                    }else{
                        console.log(updateResult);
                          res.status(200).json({response : 'error', data : [], message : "Employee id is incorrect."});
                    }
               });
            });
        });
    }else{
        res.status(200).json({response : 'error', data : [], message : "Give values can't be empty"});
    }
});
app.post('/login', (req, res) => {
    const {employeeid,password}=req.body;
    if(employeeid && password){
        var value=[employeeid];
        select('employees', ['*'], 'employeeid=?', value, (checkEmployeeErr, checkEmployeeResult) => {
            if (checkEmployeeErr) {
                console.error('Error checking employee details:', checkEmployeeErr); 
                res.status(200).json({response : 'error', data : [], message : "Error in checking employee details, Try again."});
            }
            if (checkEmployeeResult.length > 0) {
               bcrypt.compare( password, checkEmployeeResult[0].password, function(err, result) {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(200).json({response : 'error', data : [], message : "Error in checking employee details, Try again."});
                    }
                    if (result) {
                        console.log('Password matched!');
                        res.status(200).json({response : 'success', data : {'id':checkEmployeeResult[0].id,'employeeid':employeeid}, message : "Employee details are correct."});
                    } else {
                        console.log('Password incorrect!');
                        res.status(200).json({response : 'error', data : [], message : "Password is incorrect."});
                    }
                });
            }else{
                res.status(200).json({response : 'error', data : [], message : "Employee id is incorrect."});
            }
        }); 
    }else{
        res.status(200).json({response : 'error', data : [], message : "Give values can't be empty"});
    }
});

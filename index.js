var AWS = require('aws-sdk');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var config = require('./config.json');
var smtpConfig = {
    host: config.smtphost,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: config.smtpuser,
        pass: config.smtppassword
    }
};
var pool  = mysql.createPool({
    host     : config.dbhost,
    user     : config.dbuser,
    password : config.dbpassword,
    database : config.dbname
  });

exports.handler = function(event, context, callback) {
    
    
var paxAccount = String(event.accountNumber);
var msgSubject = String(event.commentType);
var message = String(event.message);    

context.callbackWaitsForEmptyEventLoop = false;
  pool.getConnection(function(err, connection) {
    // Use the connection
    
    var sql = 'SELECT bc.contactEmail FROM clientList cl JOIN baseContacts bc ON rtrim(bc.base) = (cl.base) WHERE cl.accountNumber = ?';
    

    
    connection.query(sql,paxAccount, function (error, results, fields) {
      // And done with the connection.
	  var email = (results[0].contactEmail);
      connection.release();
      // Handle error after the release.
      if (error) callback(error);
      else (null,results);

      
      var transporter =     
        nodemailer.createTransport(smtpConfig);
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Jet Linx Notifications" <notifications@jetlinx.com>', // sender address
            to: email, // list of receivers
            subject: msgSubject, // Subject line
            text: message, // plaintext body
            html: '<b>Hello world ?</b>' // html body
        };
        
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
});
      
      
      
      
      
    });
  });



};
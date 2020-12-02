// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'REGION'});


exports.sns_publishing = (req,res) => {

    // Create publish parameters
    var params = {
    Message: 'MESSAGE_TEXT', /* required */
    TopicArn: 'TOPIC_ARN'
  };

  
}

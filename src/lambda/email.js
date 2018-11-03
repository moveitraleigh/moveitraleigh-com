const nodemailer = require('nodemailer');

exports.handler = function(event, context, callback) {
    const fromEmail = process.env[`${BRANCH_ENV}_GMAIL_LOGIN`];
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: fromEmail,
            serviceClient: process.env[`${BRANCH_ENV}_GMAIL_CLIENT_ID`],
            privateKey: process.env[`${BRANCH_ENV}_GMAIL_PRIVATE_KEY`]
        }
    });
    console.log(event.body);

    transporter.sendMail({
        from: fromEmail,
        to: process.env.MAIL_TO,
        subject: process.env.SUBJECT + new Date().toLocaleString(),
        text: event.body
    }, function(error, info) {
    	if (error) {
    		callback(error);
    	} else {
    		callback(null, {
			    statusCode: 200,
			    body: "Ok"
	    	});
    	}
    });
}
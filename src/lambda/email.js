import nodemailer from 'nodemailer';

const userEmail = 'sysadmin@moveitraleigh.com';
const serviceClient = process.env[`${BRANCH_ENV}_GMAIL_CLIENT_ID`];
const privateKey = process.env[`${BRANCH_ENV}_GMAIL_PRIVATE_KEY`].replace(/\\n/g, "\n");

exports.handler = async function(event, context) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        logger: true,
        auth: {
            type: 'OAuth2',
            user: userEmail,
            serviceClient,
            privateKey
        }
    });

    transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
    
    return transporter.sendMail({
        from: userEmail,
        to: 'brett.lewis@gmail.com',
        subject: 'My subject',
        text: 'the text of the body'
    }).then(data => ({statusCode: 200, body: JSON.stringify(data)}));
}
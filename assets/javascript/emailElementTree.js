function sendEmail() {
  let service_id = 'yahoo';
  let template_id = 'template_ZHevUYdN';
  let emailBody = getElementTreeText();
  let email = $('#email').val();
  let emailSubject = $('#emailSubject').val();
  let template_params = {
    subject: emailSubject,
    name: 'Code-Dictator',
    reply_email: email,
    message: emailBody
  };
  let respond = emailjs.send(service_id,template_id,template_params);
  console.log(respond);
  console.log(template_params.subject);
  console.log(emailBody);
}
/*=================================================================================================================
SEND EMAIL:
* The purpose of this function is to email the contents of the Code Mirror IDE window to the specified email
  address with the assistance of the emailJS API
__________________________________________________________________________________________________________________*/
const sendEmail = () => {
  let service_id = 'yahoo'
    , template_id = 'template_ZHevUYdN'
    , template_params = {
    subject: $('#emailSubject').val(),
    name: 'Code-Dictator',
    reply_email: $('#email').val(),
    message: getElementTreeText()
  }
    , respond = emailjs.send(service_id, template_id, template_params);
  console.log('Email request sent!', respond);
};
/*================================================================================================================*/
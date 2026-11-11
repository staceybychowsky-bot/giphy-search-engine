'use strict';

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

if (contactForm && formStatus) {
  const fields = [
    { input: document.querySelector('#full-name'), error: document.querySelector('#name-error'), label: 'Full Name' },
    { input: document.querySelector('#email-address'), error: document.querySelector('#email-error'), label: 'Email Address' },
    { input: document.querySelector('#message'), error: document.querySelector('#message-error'), label: 'Message' },
  ];

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(field, message) {
    field.error.textContent = message;
    if (message) field.input.setAttribute('aria-invalid', 'true');
    else field.input.removeAttribute('aria-invalid');
  }

  fields.forEach((field) => {
    field.input.addEventListener('input', () => {
      setFieldError(field, '');
      formStatus.textContent = '';
      formStatus.classList.remove('is-error', 'is-success');
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent = '';
    formStatus.classList.remove('is-error', 'is-success');

    const [nameField, emailField, messageField] = fields;
    const name = nameField.input.value.trim();
    const email = emailField.input.value.trim();
    const message = messageField.input.value.trim();
    const errors = [];

    setFieldError(nameField, name ? '' : 'Please enter your name.');
    setFieldError(emailField, emailPattern.test(email) ? '' : 'Please enter a valid email address.');
    setFieldError(messageField, message ? '' : 'Please enter a message.');

    fields.forEach((field) => {
      if (field.error.textContent) errors.push(`${field.label}: ${field.error.textContent}`);
    });

    if (errors.length) {
      formStatus.textContent = errors.join(' ');
      formStatus.classList.add('is-error');
      const firstInvalid = fields.find((field) => field.error.textContent);
      firstInvalid?.input.focus();
      return;
    }

    formStatus.textContent = 'Thanks for reaching out! **This is a demo form and does not send actual emails**';
    formStatus.classList.add('is-success');
    contactForm.reset();
  });
}

# Contact Page

## Overview

The Contact page provides multiple ways for visitors to get in touch with Themistoklis Baltzakis, including a contact form with reCAPTCHA protection, direct contact information, and quick action links.

## Features

### Header Section

- **Page Title**: "Contact Me" with animated styling
- **Description**: Invitation to discuss cloud, cybersecurity, or digital transformation projects

### Contact Form

- **Form Fields**: Name, Email, Subject, Message (all required)
- **reCAPTCHA Integration**: Google reCAPTCHA v3 for spam protection
- **Form Validation**: Client-side validation with required fields
- **Submission States**: Loading spinner, success/error messages
- **API Integration**: POST to `/api/contact` endpoint

### Contact Information Cards

- **Location**: Koropi/Athens, Greece
- **Mobile**: +30 697 777 7838
- **Email**: baltzakis.themis@gmail.com ([mailto link](mailto:baltzakis.themis@gmail.com))
- **LinkedIn**: [https://linkedin.com/in/baltzakis-themis](https://linkedin.com/in/baltzakis-themis) (external link)
- **Portfolio**: [https://baltzakisthemis.com](https://baltzakisthemis.com) (external link)

### Quick Actions

- **Send Project Inquiry**: Pre-filled email subject
- **Connect on LinkedIn**: Direct LinkedIn profile link
- **View Portfolio**: Link to personal website

### Professional Summary

- **Statistics**: 15+ years experience, 100+ projects, 5+ certifications
- **Value Proposition**: Specialization in cloud architecture, cybersecurity, digital transformation

### Call to Action

- **Learn More About Me**: Link to About page
- **Back to Home**: Return to main page

## Technical Implementation

### Form Handling

- **React State**: Controlled form inputs with useState
- **Event Handlers**: Input change and form submission
- **reCAPTCHA**: useGoogleReCaptcha hook integration
- **API Communication**: Fetch API with JSON payload

### State Management

- **Form Data**: name, email, subject, message
- **Submission State**: idle, success, error
- **Loading State**: Button disabled during submission

### Error Handling

- **reCAPTCHA Failure**: Console error logging
- **API Errors**: Response status checking
- **Network Errors**: Try-catch blocks
- **User Feedback**: Toast-style status messages

## Components Used

- **Navigation**: Site navigation component
- **AnimatedSection**: Staggered animations
- **CircuitBackground**: Animated background
- **HoverButton/HoverCard**: Interactive elements
- **Icons**: Send, MapPin, Phone, Mail, Linkedin, Globe (Lucide React)

## Security Features

- **reCAPTCHA v3**: Automated spam protection
- **Input Sanitization**: Basic form validation
- **HTTPS**: Secure API communication
- **CORS**: Proper cross-origin handling

## Accessibility

- **Form Labels**: Associated labels for all inputs
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML structure
- **Focus Management**: Logical tab order
- **Error Messages**: Clear status announcements

## User Experience

### Form Interaction

- **Real-time Validation**: Immediate field validation
- **Loading Feedback**: Spinner and disabled state
- **Success/Error States**: Clear visual feedback
- **Form Reset**: Clear fields on successful submission

### Contact Methods

- **Multiple Options**: Form, email, social media
- **Direct Links**: Clickable contact information
- **External Links**: Proper target="\_blank" with security

## Performance Considerations

- **Lazy Loading**: Component-based loading
- **Minimal Re-renders**: Optimized state updates
- **API Efficiency**: Single endpoint call
- **Bundle Optimization**: Tree-shakeable imports

## Future Enhancements

- **Form Persistence**: Save draft functionality
- **File Attachments**: Resume/project file uploads
- **Meeting Scheduling**: Calendar integration
- **Multi-language**: Internationalization support
- **Analytics**: Form conversion tracking
  l
- **Bundle Optimization**: Tree-shakeable imports

## Future Enhancements

- **Form Persistence**: Save draft functionality
- **File Attachments**: Resume/project file uploads
- **Meeting Scheduling**: Calendar integration
- **Multi-language**: Internationalization support
- **Analytics**: Form conversion tracking

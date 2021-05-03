import React from 'react';
import { Formik, Form } from 'Formik';
import styled from 'styled-components'
import * as yup from 'Yup';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const emailSchema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().required().email(),
    message: yup.string().required()
})

const FormComponent = styled(Form)`
    max-width: 800px;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 24px;
    & > * {
        width: 100%;
        margin-top: 16px;
        margin-bottom: 16px;
    }
`

const ContactForm = ({ props }) => {
    return <Formik
        initialValues={{ 
            name: '',
            email: '',
            message: '',
        }}
        validationSchema={emailSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={(values, actions) => {
            setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                actions.setSubmitting(false);
            }, 1000);
        }}
        >
        {props => (
            <FormComponent onSubmit={props.handleSubmit}>
                {/* The `form-name` hidden field is required to support form submissions without JavaScript */}
                <input type="hidden" name="form-name" value="contact" />
                <div hidden>
                  <label>
                    Don’t fill this out: 
                    <input name="bot-field" 
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                     />
                  </label>
                </div>
                <TextField 
                    id="name" 
                    name='name' 
                    label="name" 
                    onBlur={props.onBlur}
                    onChange={props.onChange}
                    value={props.values.name}
                    variant="outlined"
                />
                <TextField 
                    id="email" 
                    name='email' 
                    label="email" 
                    onBlur={props.onBlur}
                    onChange={props.onChange}
                    value={props.values.email}
                    variant="outlined"
                />
                <TextField 
                    id="message" 
                    name='message' 
                    label="message" 
                    multiline
                    rows={4}
                    onBlur={props.onBlur}
                    onChange={props.onChange}
                    value={props.values.message}
                    variant="outlined"
                    />
                <Button variant="outlined"> Send</Button>
            </FormComponent >
        )}
        </Formik>
}

export default ContactForm
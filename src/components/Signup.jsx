import React, {useRef, useState} from 'react';
import {Button, Card, Form, NavLink, Alert, Container} from "react-bootstrap";
import {useAuth} from "../contexts/AuthContext";
import {useHistory} from "react-router-dom";


export default function Signup()
{
    const emailRef = useRef();
    const passwordRef = useRef();
    const repeatPasswordRef = useRef();

    const { signup } = useAuth();
    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    const history = useHistory();

    async function handleSubmitSignup(event)
    {
        event.preventDefault();

        if (passwordRef.current?.value !== repeatPasswordRef.current?.value) return setMessage(getMessage('Passwords don\'t match', 'danger'));

        try
        {
            setMessage(getMessage(''));
            setLoading(true);

            await signup(emailRef.current?.value, passwordRef.current?.value);

            setMessage(getMessage("Account successfully created!", 'success'))
        }
        catch (e)
        {
            setMessage(getMessage(e + '', 'danger'));
        }

        setLoading(false);
    }

    function getMessage(text, variant = 'primary')
    {
        return { text: text, variant: variant };
    }

    const SignupLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>Sign up</h2>
                    {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                    <Form onSubmit={handleSubmitSignup}>
                        <Form.Group controlId={"email"}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control ref={emailRef} type={"email"} required/>
                        </Form.Group>
                        <Form.Group controlId={"password"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passwordRef} type={"password"} required/>
                        </Form.Group>
                        <Form.Group controlId={"repeat-password"}>
                            <Form.Label>Repeat Password</Form.Label>
                            <Form.Control ref={repeatPasswordRef} type={"password"} required/>
                        </Form.Group>
                        <Button className={"mt-5 w-100"} type={"Submit"} disabled={loading}>Sign up</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/login"}>Already have an account? Log In</NavLink>
                <Button variant={"secondary"} onClick={() => history.push('/')}>Back to App</Button>
            </div>
        </>
    );

    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ minHeight: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <SignupLayout/>
            </div>
        </Container>
    );
}
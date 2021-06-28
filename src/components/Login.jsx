import React, {useRef, useState} from 'react';
import {Button, Card, Form, NavLink, Alert, Container} from "react-bootstrap";
import {useAuth} from "../contexts/AuthContext";
import {useHistory} from "react-router-dom";

export default function Login()
{
    const emailRef = useRef();
    const passwordRef = useRef();

    const { login } = useAuth();
    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    const history = useHistory();

    async function handleSubmitLogin(event)
    {
        event.preventDefault();

        try
        {
            setMessage(getMessage(''));
            setLoading(true);
            await login(emailRef.current?.value, passwordRef.current?.value);
            setMessage(getMessage('Logged in sucessfully!', 'success'));
            history.push('/');
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

    const LoginLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>Log In</h2>
                    {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                    <Form onSubmit={handleSubmitLogin}>
                        <Form.Group controlId={"email"}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control ref={emailRef} type={"email"} required/>
                        </Form.Group>
                        <Form.Group controlId={"password"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passwordRef} type={"password"} required/>
                        </Form.Group>
                        <Button className={"mt-5 w-100"} type={"Submit"} disabled={loading}>Log in</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/signup"}>Need an account? Sign Up</NavLink>
                <Button variant={"secondary"} onClick={() => history.push('/')}>Back to App</Button>
            </div>
        </>
    );

    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ minHeight: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <LoginLayout/>
            </div>
        </Container>
    );
}
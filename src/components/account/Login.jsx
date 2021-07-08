import React, {useRef, useState} from 'react';
import {Button, Card, Form, NavLink, Alert, Container} from "react-bootstrap";
import {useAuth} from "../../contexts/AuthContext";
import {useHistory} from "react-router-dom";
import {BackToAppButton} from "./config/Profile";

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
            setMessage(createMessage(''));
            setLoading(true);
            await login(emailRef.current?.value, passwordRef.current?.value);
            setMessage(createMessage('Logged in successfully!', 'success'));
            history.push('/');
        }
        catch (e)
        {
            setMessage(createMessage(e + '', 'danger'));
        }

        setLoading(false);
    }

    const createMessage = (text, variant = 'primary') => ({ text: text, variant: variant });

    const LoginLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>Log In</h2>
                    {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                    <Form onSubmit={handleSubmitLogin}>
                        <Form.Group controlId={"email"}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control ref={emailRef} type={"email"} placeholder={"user@example.com"} defaultValue={emailRef.current?.value} required/>
                        </Form.Group>
                        <Form.Group controlId={"password"} className={"mt-2"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passwordRef} type={"password"} placeholder={"Password example..."} defaultValue={passwordRef.current?.value} required/>
                        </Form.Group>
                        <Button className={"mt-5 w-100"} type={"Submit"} disabled={loading}>Log in</Button>
                    </Form>
                    <NavLink className={"text-center bg-dark d-block"} href={"/forgot"}>Forgot password?</NavLink>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/signup"}>Need an account? Sign Up</NavLink>
                <BackToAppButton/>
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
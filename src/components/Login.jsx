import React, {useRef, useState} from 'react';
import {Button, Card, Form, NavLink, Alert, Container} from "react-bootstrap";


export default function Login()
{
    const emailRef = useRef();
    const passwordRef = useRef();

    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    async function handleSubmitLogin(event)
    {
        event.preventDefault();
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
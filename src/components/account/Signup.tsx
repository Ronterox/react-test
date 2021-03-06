import React, { useRef, useState } from 'react';
import { Button, Card, Form, NavLink, Alert, Container } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { Redirect } from "react-router-dom";
import { BackToAppButton } from "./config/Profile";


export default function Signup()
{
    const emailRef = useRef<any>();
    const passwordRef = useRef<any>();
    const repeatPasswordRef = useRef<any>();

    const { signup, login } = useAuth();
    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    const [redirect, setRedirect] = useState(false);

    async function handleSubmitSignup(event)
    {
        event.preventDefault();

        if (passwordRef.current?.value !== repeatPasswordRef.current?.value) return setMessage(createMessage('Passwords don\'t match', 'danger'));

        try
        {
            setMessage(createMessage(''));
            setLoading(true);

            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;

            if (!email || !password) return;

            if (signup)
            {
                await signup(email, password);
                setMessage(createMessage("Account successfully created!", 'success'))
            }

            if (login) await login(email, password);

            setRedirect(true);
        }
        catch (e)
        {
            setMessage(createMessage(e + '', 'danger'));
        }

        setLoading(false);
    }

    const createMessage = (text, variant = 'primary') => ({ text: text, variant: variant });

    const SignupLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>Sign up</h2>
                    {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                    <Form onSubmit={handleSubmitSignup}>
                        <Form.Group controlId={"email"}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control ref={emailRef} type={"email"} placeholder={"user@example.com"} defaultValue={emailRef.current?.value} required/>
                        </Form.Group>
                        <Form.Group controlId={"password"} className={"mt-2"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passwordRef} type={"password"} placeholder={"Password example..."} defaultValue={passwordRef.current?.value} required/>
                        </Form.Group>
                        <Form.Group controlId={"repeat-password"} className={"mt-2"}>
                            <Form.Label>Repeat Password</Form.Label>
                            <Form.Control ref={repeatPasswordRef} type={"password"} placeholder={"Repeated password example..."} defaultValue={repeatPasswordRef.current?.value} required/>
                        </Form.Group>
                        <Button className={"mt-5 w-100"} type={"Submit"} disabled={loading}>Sign up</Button>
                        {redirect && <Redirect to={"/"}/>}
                    </Form>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/login"}>Already have an account? Log In</NavLink>
                <BackToAppButton/>
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
import React, {useRef, useState} from 'react';
import {Button, Card, Form, NavLink, Alert, Container} from "react-bootstrap";
import {useAuth} from "../../contexts/AuthContext";
import {Redirect} from "react-router-dom";


export default function Signup()
{
    const emailRef = useRef();
    const passwordRef = useRef();
    const repeatPasswordRef = useRef();

    const { signup, login} = useAuth();
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

            await signup(email, password);

            setMessage(createMessage("Account successfully created!", 'success'))

            await login(email, password);

            setRedirect(true);
        }
        catch (e)
        {
            setMessage(createMessage(e + '', 'danger'));
        }

        setLoading(false);
    }

    function createMessage(text, variant = 'primary')
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
                            <Form.Control ref={emailRef} type={"email"} placeholder={"user@example.com"} required/>
                        </Form.Group>
                        <Form.Group controlId={"password"} className={"mt-2"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passwordRef} type={"password"} placeholder={"Password example..."} required/>
                        </Form.Group>
                        <Form.Group controlId={"repeat-password"} className={"mt-2"}>
                            <Form.Label>Repeat Password</Form.Label>
                            <Form.Control ref={repeatPasswordRef} type={"password"} placeholder={"Repeated password example..."} required/>
                        </Form.Group>
                        <Button className={"mt-5 w-100"} type={"Submit"} disabled={loading}>Sign up</Button>
                        {redirect && <Redirect to={"/"}/>}
                    </Form>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/login"}>Already have an account? Log In</NavLink>
                <NavLink href={"/"} className={"btn-secondary text-white rounded m-auto"} style={{ width: "120px" }}>Back to App</NavLink>
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
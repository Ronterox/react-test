import React, {useRef} from 'react';
import {Button, Card, Form, NavLink} from "react-bootstrap";

export default function Signup()
{
    const emailRef = useRef();
    const passwordRef = useRef();
    const repeatPasswordRef = useRef();

    return (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>Sign up</h2>
                    <Form>
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
                    </Form>
                </Card.Body>
                <Button className={"mt-5"} type={"Submit"}>Sign up</Button>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"#"}>Already have an account? Log In</NavLink>
            </div>
        </>
    );
}
import React from 'react';
import {Card, Container, NavLink} from "react-bootstrap";

function PasswordForm()
{
    const PasswordFormLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/profile"}>Cancel</NavLink>
                <NavLink href={"/"} className={"btn-secondary text-white rounded m-auto"} style={{ width: "120px" }}>Back to App</NavLink>
            </div>
        </>
    );
    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ height: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <PasswordFormLayout/>
            </div>
        </Container>
    );
}

export default PasswordForm;
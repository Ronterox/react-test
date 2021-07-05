import React from 'react';
import {Card, Container, Image, NavLink} from "react-bootstrap";
import {useAuth} from "../../../contexts/AuthContext";
import images from "../../../media/images";

function Profile()
{
    const { currentUser } = useAuth();

    const ProfileLayout = () => (
        <>
            <Card className={"p-1"}>
                <Card.Body>
                    <h1 className={"text-center"}>Profile</h1>
                    <Image className={"d-block m-auto profile-pic"} src={images.defaultProfile} style={{ height: "125px", width: "125px" }} roundedCircle/>
                    <hr/>
                    <strong>Email: </strong>
                    <span>{currentUser.email}</span>
                    <br/>
                    <strong>Password: </strong>
                    <span>********</span>
                    <NavLink className={"btn btn-primary text-white mt-2"} href={"/password-reset"}>Update Profile</NavLink>
                </Card.Body>
            </Card>
            <div className={"w-100 text-center mt-2"}>
                <NavLink href={"/"} className={"btn-secondary text-white rounded m-auto"} style={{ width: "120px" }}>Back to App</NavLink>
            </div>
        </>
    );
    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ height: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <ProfileLayout/>
            </div>
        </Container>
    );
}

export default Profile;
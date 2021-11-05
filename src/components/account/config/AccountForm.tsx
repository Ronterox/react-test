import React, { useRef, useState } from 'react';
import { Alert, Button, Card, Container, Form, Image, NavLink } from "react-bootstrap";
import { useAuth } from "../../../contexts/AuthContext";
import { storage } from "../../../firebase";
import { BackToAppButton } from "./Profile";
import { resizeImage } from "../../utils/Compressor";
import { useHistory } from "react-router-dom";

function AccountForm()
{
    const emailRef = useRef<any>();
    const passwordRef = useRef<any>();
    const repeatPasswordRef = useRef<any>();

    const [selectedFile, setSelectedFile] = useState();
    const [progress, setProgress] = useState(0);

    const { currentUser, userImage } = useAuth();
    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    const history = useHistory();

    async function handleSubmitUpdate(event)
    {
        event.preventDefault();

        if (passwordRef.current?.value !== repeatPasswordRef.current?.value) return setMessage(createMessage('Passwords don\'t match', 'danger'));

        setLoading(true);
        setMessage(createMessage(''));

        const newEmail = emailRef.current?.value;
        const newPassword = passwordRef.current?.value;

        const promises: any[] = [];

        if (currentUser)
        {
            if (newEmail) promises.push(currentUser.updateEmail(newEmail));
            if (newPassword) promises.push(currentUser.updatePassword(newPassword));

            if (selectedFile)
            {
                const task = storage.child(currentUser.uid).put(await resizeImage(selectedFile));

                promises.push(task);

                task.on('state_changed', uploadData =>
                {
                    const percentage = uploadData.bytesTransferred / uploadData.totalBytes * 100;
                    setProgress(percentage);
                });
            }
        }

        Promise.all(promises).then(() =>
        {
            setMessage(createMessage("Account successfully updated!", 'success'))

            //Go to profile and reload the page
            history.push("/profile");
            window.location.reload();

        }).catch(e => setMessage(createMessage(e + '', 'danger')));

        setLoading(false);
    }

    function handleFileChange(event)
    {
        const file = event.target.files[0];
        if (file) setSelectedFile(file);
    }

    const createMessage = (text, variant = 'primary') => ({ text: text, variant: variant });

    const AccountFormLayout = () =>
    {
        const INPUT_PLACEHOLDER = "Leave blank to keep the same!";

        const imgSource = selectedFile ? URL.createObjectURL(selectedFile) : userImage;
        const userEmail = currentUser?.email || '';

        return (
            <>
                <Card className={"p-2"}>
                    <Card.Body>
                        <h2 className={"text-center mb-4"}>Update Account</h2>
                        {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                        <Form onSubmit={handleSubmitUpdate}>
                            <Form.Group controlId={"picture"}>
                                <div className={"d-flex justify-content-around m-auto"}>
                                    <div className={"w-50"}>
                                        <Form.Label>New Profile Picture</Form.Label>
                                        <Form.File accept={'image/*'} onChange={handleFileChange}/>
                                        <progress value={progress} max={100}/>
                                    </div>
                                    <Image src={imgSource} style={{ width: "100px", height: "100px" }}/>
                                </div>
                            </Form.Group>
                            <hr/>
                            <Form.Group controlId={"email"}>
                                <Form.Label>New Email</Form.Label>
                                <Form.Control ref={emailRef} type={"email"} placeholder={userEmail} defaultValue={userEmail} required/>
                            </Form.Group>
                            <hr/>
                            <Form.Group controlId={"password"} className={"mt-2"}>
                                <Form.Label>New Password</Form.Label>
                                <Form.Control ref={passwordRef} type={"password"} placeholder={INPUT_PLACEHOLDER}/>
                            </Form.Group>
                            <Form.Group controlId={"repeat-password"} className={"mt-2"}>
                                <Form.Label>Repeat New Password</Form.Label>
                                <Form.Control ref={repeatPasswordRef} type={"password"} placeholder={INPUT_PLACEHOLDER}/>
                            </Form.Group>
                            <Button className={"mt-4 w-100"} type={"Submit"} disabled={loading}>Update</Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className={"w-100 text-center mt-2"}>
                    <NavLink href={"/profile"}>Cancel</NavLink>
                    <BackToAppButton/>
                </div>
            </>
        );
    }

    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ height: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <AccountFormLayout/>
            </div>
        </Container>
    );
}

export default AccountForm;
import React, {useState} from 'react';
import {Alert, Button, Card, Container, NavLink} from "react-bootstrap";
import {useAuth} from "../../../contexts/AuthContext";
import {useHistory} from "react-router-dom";
import {database} from "../../../firebase";

function DeleteAccount()
{
    const [message, setMessage] = useState({ text: '', variant: 'primary' });
    const [loading, setLoading] = useState(false);

    const { currentUser } = useAuth();
    const history = useHistory();

    async function handleDeleteUser()
    {
        try
        {
            setMessage(createMessage(''));
            setLoading(true);

            const userId = currentUser.uid;

            await currentUser.delete();
            await database.child(userId).set(null);

            history.push("/");
        }
        catch (e)
        {
            setMessage(createMessage(e + '', 'danger'))
        }

        setLoading(false);
    }

    function createMessage(text, variant = 'primary')
    {
        return { text: text, variant: variant };
    }

    const DeleteAccountLayout = () => (
        <>
            <Card className={"p-1"}>
                <Card.Body>
                    {message.text && <Alert variant={message.variant}>{message.text}</Alert>}
                    <h2>Do you want to delete your account?</h2>
                    <h3 className={"text-danger"}><small>You will lose every task!</small></h3>
                    <hr/>
                    <div className={"d-flex mt-2"}>
                        <Button variant={"danger"} onClick={handleDeleteUser} className={"text-white m-auto"} disabled={loading}>Delete My Account</Button>
                        <NavLink href={"/"} className={"btn-secondary text-white rounded m-auto"}>Back to App</NavLink>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
    return (
        <Container className={"d-flex align-items-center justify-content-center"} style={{ height: "100vh" }}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <DeleteAccountLayout/>
            </div>
        </Container>
    );
}

export default DeleteAccount;
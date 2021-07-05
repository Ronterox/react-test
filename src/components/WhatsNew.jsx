import React, {Component} from 'react';
import {Button, Card, Container} from "react-bootstrap";
import {useHistory} from "react-router-dom";

class PatchNote extends Component
{
    constructor(props)
    {
        super(props);
        this.version = props.version;
        this.updates = props.updates;
        this.bugs = props.bugs;
    }

    render()
    {
        return (
            <>
                <strong>v{this.version}:</strong>
                <ul>
                    {this.updates?.map(text => <li>{text}</li>)}
                    {this.bugs?.length > 0 &&
                    (
                        <>
                            <strong>Bugs:</strong>
                            <ul>
                                {this.bugs.map(text => <li>{text}</li>)}
                            </ul>
                        </>
                    )}
                </ul>
                <br/>
            </>
        );
    }

}

export default function WhatsNew()
{
    const
        history = useHistory();

    const
        versions = [
            new PatchNote({ version: "Old", updates: ["Add products", "Delete Products", "Mark as done", "Filter show/not done", "Save in memory"] }),
            new PatchNote({ version: "1.0", updates: ["Redesign", "Tooltips", "Profile Creation"] }),
            new PatchNote({ version: "1.1", updates: ["Online Database"] }),
            new PatchNote({ version: "1.2" }),
            new PatchNote({ version: "1.3" }),
            new PatchNote({
                version: "1.4", updates: ["Offline and Online working", "Performance Improvement", "Default Profile Pic"],
                bugs: ["Fixed functional network"]
            }),
            new PatchNote({
                version: "1.5", updates: ["Update of multiple devices at the same time", "Added \"Go back to app button\" to the sign up screen"],
                bugs: ["Fixed offline", "Fixed logout", "Fixed first open of app", "Fixed list size and profile distance"]
            }),
            new PatchNote({
                version: "1.6", updates: ["App and web logo added", "Added page updates"],
                bugs: ["Fixed deleting on multiple devices"]
            }),
        ];

    const
        WhatsNewLayout = () => (
            <>
                <Card className={"p-4"}>
                    <Card.Body>
                        <h2 className={"text-center mb-4"}>What's New?</h2>
                        {
                            versions.map(patchNote => <PatchNote
                                version={patchNote.version}
                                updates={patchNote.updates}
                                bugs={patchNote.bugs}
                            />)
                        }
                    </Card.Body>
                </Card>
                <div className={"w-100 text-center mt-2"}>
                    <Button variant={"secondary"} onClick={() => history.push('/')}>Back to App</Button>
                </div>
            </>
        );

    return (

        <Container className={"d-flex align-items-center justify-content-center"}

        >
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <WhatsNewLayout/>
            </div>
        </Container>
    )
        ;
}
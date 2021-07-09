import React, {Component, useEffect, useState} from 'react';
import {Card, Container} from "react-bootstrap";
import {databasePatchNotes} from "../firebase";
import {BackToAppButton} from "./account/config/Profile";

class PatchNote extends Component
{
    constructor({ version, updates = [], bugs = [] })
    {
        super({ version, updates, bugs });
        this.version = version;
        this.updates = updates;
        this.bugs = bugs;
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
    const [versions, setVersions] = useState([]);

    useEffect(() =>
    {
        const downloadVersions = () =>
        {
            databasePatchNotes.once("value").then(downloadedVersions =>
            {
                const updates = Object.values(downloadedVersions.val()).reverse();
                setVersions(updates);
            });
        };

        downloadVersions();
        /*
        const uploadPatchNote = patchNote =>
        {
            const { version, updates, bugs } = patchNote;

            databasePatchNotes.once("value").then(downloadedVersions =>
            {
                const values = Object.values(downloadedVersions.val());
                values.forEach((patchNote, index) =>
                {
                    const splittedVersion = patchNote.version.split(' ');
                    if (splittedVersion.length > 1) values[index].version = splittedVersion[0];
                });

                databasePatchNotes.set(values).then(() => databasePatchNotes.child(patchNote.version).set({ version, updates, bugs }));
            });
        }

        uploadPatchNote(new PatchNote({ version: "2,0 - Current Version", updates: ["Redesign App Palette", "Removed limit of group tasks"], bugs: ["Fixed missing groups data after app reset", "Fixed what's new page recursion"] }))
         */
    }, [])


    const WhatsNewLayout = () => (
        <>
            <Card className={"p-4"}>
                <Card.Body>
                    <h2 className={"text-center mb-4"}>What's New?</h2>
                    {
                        versions.map(patchNote => <PatchNote version={patchNote.version}
                                                             updates={patchNote.updates}
                                                             bugs={patchNote.bugs}
                        />)
                    }
                </Card.Body>
            </Card>
            <div className={"text-center mt-2"}>
                <BackToAppButton/>
            </div>
        </>
    );

    return (
        <Container className={"d-flex align-items-center justify-content-center"}>
            <div className={"w-100"} style={{ maxWidth: "400px" }}>
                <WhatsNewLayout/>
            </div>
        </Container>
    );
}
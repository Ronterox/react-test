import React, {useEffect, useState} from 'react';
import {Card, Container} from "react-bootstrap";
import {databasePatchNotes} from "../firebase";
import {BackToAppButton} from "./account/config/Profile";

type PatchData =
    {
        version: string,
        updates: string[],
        bugs: string[]
    }

const PatchNote = (data: PatchData) => (
    <>
        <strong>v{data.version}:</strong>
        <ul>
            {data.updates?.map(text => <li>{text}</li>)}
            {data.bugs?.length > 0 &&
            (
                <>
                    <strong>Bugs:</strong>
                    <ul>
                        {data.bugs.map(text => <li>{text}</li>)}
                    </ul>
                </>
            )}
        </ul>
        <br/>
    </>
);

export default function WhatsNew()
{
    const [versions, setVersions] = useState<PatchData[]>([]);

    useEffect(() =>
    {
        const downloadVersions = () =>
        {
            databasePatchNotes.once("value").then(downloadedVersions =>
            {
                const updates: any = Object.values(downloadedVersions.val()).reverse();
                setVersions(updates);
            });
        };

        downloadVersions();

        /*
        const uploadPatchNote = (patch: PatchData) =>
        {
            const {version, updates, bugs} = patch;

            databasePatchNotes.once("value").then(downloadedVersions =>
            {
                const values: any = Object.values(downloadedVersions.val());
                values.forEach((patchNote: PatchData, index) =>
                {
                    const splitVersion = patchNote.version.split(' ');
                    if (splitVersion.length > 1) values[index].version = splitVersion[0];
                });

                databasePatchNotes.set(values).then(() => databasePatchNotes.child(version).set({version, updates, bugs}));
            });
        }

        uploadPatchNote({version: "2,0 - Current Version", updates: ["Redesign App Palette", "Removed limit of group tasks"], bugs: ["Fixed missing groups data after app reset", "Fixed what's new page recursion"]});
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
            <div className={"w-100"} style={{maxWidth: "400px"}}>
                <WhatsNewLayout/>
            </div>
        </Container>
    );
}
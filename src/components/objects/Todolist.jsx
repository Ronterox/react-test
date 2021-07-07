import Task from "./Task";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import React, {useRef, useState} from "react";
import {Button, FormControl, OverlayTrigger} from "react-bootstrap";
import {getToolTip} from "../../App";

export const DEFAULT_LIST_NAME = "Default List";

export default function TodoList({
                                     todos = [],
                                     removeGroup,
                                     editGroup,
                                     listName = DEFAULT_LIST_NAME,
                                     //METHODS OF CHILDREN TASK ITEMS
                                     toggleTodo,
                                     deleteTask,
                                     toggleEdition,
                                     changeGroup
                                 })
{
    const [seeTasks, setSeeTasks] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef();

    const handleDropdownToggle = () => setSeeTasks(prevState => !prevState);
    const handleEditToggle = () =>
    {
        setIsEditing(prevState =>
        {
            const wasEditing = prevState;
            if (wasEditing)
            {
                const newName = inputRef.current?.value;
                if (newName) editGroup(newName);
            }
            return !wasEditing;
        });
    }

    const isDefaultList = listName === DEFAULT_LIST_NAME;

    return (
        <div className={"text-left border border-white bg-dark my-5 text-white"}>
            <div className={"m-4"}>
                {
                    !isDefaultList &&
                    <OverlayTrigger placement={"top"} overlay={getToolTip("Delete Group")}>
                        <Button className={"bg-danger"} variant={"danger"} onClick={removeGroup}>❌</Button>
                    </OverlayTrigger>
                }
                {
                    isEditing ? <FormControl defaultValue={listName} ref={inputRef}/> : <DropdownToggle onClick={handleDropdownToggle}>{listName}</DropdownToggle>
                }
                {
                    !isDefaultList &&
                    <OverlayTrigger placement={"top"} overlay={getToolTip("Edit Group Name")}>
                        <Button className={"bg-success"} onClick={handleEditToggle} variant={"success"}>✏️</Button>
                    </OverlayTrigger>
                }
            </div>
            <ul className={"list-unstyled"} style={{ minHeight: "150px" }}>
                {
                    seeTasks &&
                    todos.map((item, index) => <Task key={index}
                                                     todo={item}
                                                     toggleTodo={toggleTodo}
                                                     deleteTask={deleteTask}
                                                     toggleEdition={toggleEdition}
                                                     changeGroup={changeGroup}/>
                    )
                }
            </ul>
        </div>
    );
};
import Task from "./Task";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import React, { useRef, useState } from "react";
import { Button, FormControl, OverlayTrigger } from "react-bootstrap";
import { getToolTip, TaskData } from "../../App";

export const DEFAULT_LIST_NAME = "Default List";

interface TodolistProps
{
    todos: TaskData[],
    removeGroup?: () => void,
    editGroup?: (newName: string) => void
    listName: string,
    //METHODS OF CHILDREN TASK ITEMS
    toggleTodo: (id: string) => void,
    deleteTask: (id: string) => void,
    toggleEdition: (id: string, newValue: string) => void,
    changeGroup: (id: string) => void

}

export default function TodoList(props: TodolistProps)
{
    const [seeTasks, setSeeTasks] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDropdownToggle = () => setSeeTasks(prevState => !prevState);
    const handleEditToggle = () =>
    {
        setIsEditing(prevState =>
        {
            const wasEditing = prevState;
            if (wasEditing)
            {
                const newName = inputRef.current?.value;
                if (newName && props.editGroup) props.editGroup(newName);
            }
            return !wasEditing;
        });
    }

    const isDefaultList = props.listName === DEFAULT_LIST_NAME;

    return (
        <div className={"text-left border border-white bg-dark my-5 text-primary"}>
            <div className={"m-4"}>
                {
                    !isDefaultList &&
                    <OverlayTrigger placement={"top"} overlay={getToolTip("Delete Group")}>
                        <Button className={"bg-danger"} variant={"danger"} onClick={props.removeGroup}>❌</Button>
                    </OverlayTrigger>
                }
                {
                    isEditing ? <FormControl defaultValue={props.listName} ref={inputRef}/> : <DropdownToggle onClick={handleDropdownToggle}>{props.listName}</DropdownToggle>
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
                    props.todos.map((item, index) => <Task key={index}
                                                     todo={item}
                                                     toggleTodo={props.toggleTodo}
                                                     deleteTask={props.deleteTask}
                                                     toggleEdition={props.toggleEdition}
                                                     changeGroup={props.changeGroup}/>
                    )
                }
            </ul>
        </div>
    );
};
import Task from "./Task";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import React, {useState} from "react";
import {Button, FormControl, OverlayTrigger} from "react-bootstrap";
import {getToolTip} from "../../App";

export default function TodoList({ todos = [], toggleTodo, deleteTask, toggleEdition, listName })
{
    const [seeTasks, setSeeTasks] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const handleDropdownToggle = () => setSeeTasks(prevState => !prevState);
    const handleEditToggle = () => setIsEditing(prevState => !prevState);

    return (
        <div className={"text-left border border-white bg-dark my-5 text-white"}>
            <div className={"m-4"}>
                {
                    isEditing ?  <FormControl defaultValue={listName}/> : <DropdownToggle onClick={handleDropdownToggle}>{listName}</DropdownToggle>
                }
                <OverlayTrigger placement={"top"} overlay={getToolTip("Edit Name")}>
                    <Button className={"bg-success"} onClick={handleEditToggle} variant={"success"}>✏️</Button>
                </OverlayTrigger>
            </div>
            <ul className={"list-unstyled"} style={{ minHeight: "150px" }}>
                {
                    seeTasks &&
                    todos.map((item, index) =>
                    {
                        return <Task key={index}
                                     todo={item}
                                     toggleTodo={toggleTodo}
                                     deleteTask={deleteTask}
                                     toggleEdition={toggleEdition}
                        />;
                    })
                }
            </ul>
        </div>
    );
};
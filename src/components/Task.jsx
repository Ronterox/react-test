import React, {useRef} from 'react';
import {Button, Form, FormControl, OverlayTrigger} from "react-bootstrap";
import { getToolTip } from '../App'

export default function Task({ todo, toggleTodo, deleteTask, toggleEdition })
{
    const checkBoxTodo = (
        <>
            <Form.Check className={"checkbox"} checked={todo.isCompleted}
                        onChange={() => toggleTodo(todo.taskId)}/>
            {
                todo.isCompleted ? <s>{todo.taskText}</s> : <span>{todo.taskText}</span>
            }
            &nbsp;
        </>
    );

    const inputRef = useRef('');

    const inputBoxTodo = (
        <>
            <FormControl className={"h-50"} ref={inputRef} placeholder={todo.taskText} defaultValue={todo.taskText}/>&nbsp;
        </>
    );

    return (
        <li style={{margin: "10% auto", width: "80%"}}>
            <div className={"d-flex justify-content-between text-white"}>
                {
                    todo.isEditing ? inputBoxTodo : checkBoxTodo
                }
                {
                    todo.isCompleted ? null : (
                        <div>

                            <OverlayTrigger placement={"top"} overlay={getToolTip("Change task")}>
                                <Button className={"bg-success"} variant={"success"} size={"sm"} onClick={() => toggleEdition(todo.taskId, inputRef.current?.value)}>✏️</Button>
                            </OverlayTrigger>

                            <OverlayTrigger placement={"top"} overlay={getToolTip("Delete task")}>
                                <Button className={"bg-danger"} variant={"danger"} size={"sm"} onClick={() => deleteTask(todo.taskId)}>🗑️</Button>
                            </OverlayTrigger>
                        </div>
                    )
                }
            </div>
        </li>
    );
}
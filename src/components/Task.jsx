import React, {useRef} from 'react';
import {Button, Form, FormControl, OverlayTrigger} from "react-bootstrap";
import { GetToolTip } from '../App'

export default function Task({ todo, toggleTodo, deleteTask, toggleEdition })
{
    const checkBoxTodo = (
        <>
            <Form.Check className={"checkbox"} checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}/>
            {
                todo.completed ? <s>{todo.text}</s> : <span>{todo.text}</span>
            }
            &nbsp;
        </>
    );

    const inputRef = useRef('');

    const inputBoxTodo = (
        <>
            <FormControl className={"h-50"} ref={inputRef} placeholder={todo.text} defaultValue={todo.text}/>&nbsp;
        </>
    );

    return (
        <li>
            <div className={"d-flex justify-content-between"}>
                {
                    todo.editing ? inputBoxTodo : checkBoxTodo
                }
                {
                    todo.completed ? null : (
                        <div>

                            <OverlayTrigger placement={"top"} overlay={GetToolTip("Change task")}>
                                <Button className={"bg-success"} variant={"success"} size={"sm"} onClick={() => toggleEdition(todo.id, inputRef.current?.value)}>✏️</Button>
                            </OverlayTrigger>

                            <OverlayTrigger placement={"top"} overlay={GetToolTip("Delete task")}>
                                <Button className={"bg-danger"} variant={"danger"} size={"sm"} onClick={() => deleteTask(todo.id)}>🗑️</Button>
                            </OverlayTrigger>
                        </div>
                    )
                }
            </div>
        </li>
    );
}
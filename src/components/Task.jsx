import React, {useRef} from 'react';
import {Button, Form, FormControl} from "react-bootstrap";

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
                            <Button className={"bg-green"} variant={"secondary"} size={"sm"}
                                    onClick={() => toggleEdition(todo.id, inputRef.current?.value)}>✏️</Button>
                            <Button className={"bg-danger"} variant={"secondary"} size={"sm"}
                                    onClick={() => deleteTask(todo.id)}>🗑️</Button>
                        </div>
                    )
                }
            </div>
        </li>
    );
}
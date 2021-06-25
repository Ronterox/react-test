import React, {useRef} from 'react';
import {Button} from "react-bootstrap";

export default function Task({ todo, toggleTodo, deleteTask, toggleEdition })
{
    const checkBoxTodo = (
        <>
            <input className={"checkbox"} type={"checkbox"} checked={todo.completed}
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
            <input type={"text"} ref={inputRef} placeholder={todo.text} defaultValue={todo.text}/>&nbsp;
        </>
    );

    return (
        <li>
            {
                todo.editing ? inputBoxTodo : checkBoxTodo
            }
            {
                todo.completed ? null : (
                    <>
                        <Button className={"bg-success"} variant={"secondary"} size={"sm"}
                                onClick={() => toggleEdition(todo.id, inputRef.current?.value)}>✏️</Button>
                        <Button className={"bg-danger"} variant={"secondary"} size={"sm"}
                                onClick={() => deleteTask(todo.id)}>🗑️</Button>
                    </>
                )
            }
        </li>
    );
}
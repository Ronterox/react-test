import './css/App.css'
import {useEffect, useRef, useState} from 'react';
import {v4} from 'uuid';
import TodoList from "./components/Todolist";
import AddToHomeScreen from '@ideasio/add-to-homescreen-react';
import {Button, Card, Container, FormControl, InputGroup, OverlayTrigger, Tooltip} from "react-bootstrap";
import Signup from "./components/Signup";

const TODO_KEY = "ricardo.todolist"
const SHOW_DONE_KEY = "ricardo.todolist.showDone"

export function GetToolTip(text)
{
    return <Tooltip id="tooltip-show-button">{text}️</Tooltip>;
}

export default function App()
{
    const inputRef = useRef();
    const [myTodos, setTodos] = useState([]);
    const [showDoneTasks, setShowDoneTasks] = useState(true);

    //On start app
    useEffect(() =>
    {
        const savedData = localStorage.getItem(TODO_KEY);
        const wasShowingDone = localStorage.getItem(SHOW_DONE_KEY);

        if (savedData !== undefined) setTodos(JSON.parse(savedData))
        setShowDoneTasks(JSON.parse(wasShowingDone));

    }, []);

    useEffect(() => localStorage.setItem(TODO_KEY, JSON.stringify(myTodos)), [myTodos]);
    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks])

    function AddTask()
    {
        const value = inputRef.current?.value;

        if (value === '') return;

        setTodos(prevState => [...prevState, { id: v4(), text: value, completed: false, editing: false }]);
        inputRef.current.value = '';
    }

    function RemoveTasks()
    {
        setTodos(myTodos.filter(element => !element.completed));
    }

    function RemoveTask(id)
    {
        setTodos(myTodos.filter(element => element.id !== id));
    }

    function ToggleTodo(id)
    {
        setTodos(prevState =>
        {
            const copyTodos = [...prevState]

            const element = copyTodos.find(element => element.id === id);
            element.completed = !element.completed;

            return copyTodos;
        });
    }

    function ToggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.id === id);

        if (element.editing && newValue !== '') element.text = newValue;
        element.editing = !element.editing;

        console.log(JSON.stringify(newValue));

        setTodos(copyTodos);
    }

    const tasksLeft = myTodos.filter(element => !element.completed).length;

    function FilterDoneTasks()
    {
        setShowDoneTasks(!showDoneTasks);
    }

    const application =
        <Container className={"d-flex justify-content-center align-items-center text-center p-5"} style={{ minHeight: "100vh" }}>
            <Card className={"w-100 bg-success"} style={{ maxWidth: "500px" }}>
                <Card.Body>
                    <AddToHomeScreen/>

                    <h2>My List ☑️</h2>
                    <small>v0.9</small>

                    <TodoList todos={showDoneTasks ? myTodos : myTodos.filter(element => !element.completed)} toggleTodo={ToggleTodo} deleteTask={RemoveTask} toggleEdition={ToggleEdition}/>

                    <span>You have {tasksLeft} {tasksLeft === 1 ? 'task' : 'tasks'} left!</span>
                    <InputGroup size={"sm"}>
                        <FormControl style={{ maxWidth: '400px' }} type={"text"} ref={inputRef} placeholder={"Write your task here..."}/>

                        <OverlayTrigger placement={"top"} overlay={GetToolTip("Add a task")}>
                            <Button className={"icon-button-md"} variant={"primary"} size={"lg"} onClick={AddTask}>+</Button>
                        </OverlayTrigger>

                        <OverlayTrigger placement={"top"} overlay={GetToolTip("Remove done tasks")}>
                            <Button className={"icon-button-md bg-danger"} variant={"danger"} size={"lg"} onClick={RemoveTasks} disabled={myTodos.length === 0 || myTodos.length === tasksLeft}>🗑️</Button>
                        </OverlayTrigger>
                    </InputGroup>

                    <br/>
                    <OverlayTrigger placement={"top"} overlay={GetToolTip(showDoneTasks ? 'Hide done tasks' : 'Show done tasks')}>
                        <Button className={"icon-button-md bg-white"} variant={"light"} onClick={FilterDoneTasks}>{showDoneTasks ? <>👁️‍🗨️</> : <>🚫</>}️</Button>
                    </OverlayTrigger>
                </Card.Body>
            </Card>
        </Container>;

    const signup = <Container className={"d-flex align-items-center justify-content-center"} style={{ minHeight: "100vh" }}>
        <div className={"w-100"} style={{ maxWidth: "400px" }}>
            <Signup/>
        </div>
    </Container>;

    return (
        application
    );
}
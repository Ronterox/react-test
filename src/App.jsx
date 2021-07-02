import './css/App.css'
import {useCallback, useEffect, useRef, useState} from 'react';
import {v4} from 'uuid';
import TodoList from "./components/Todolist";
import {Button, Card, Container, FormControl, InputGroup, NavLink, OverlayTrigger, Tooltip} from "react-bootstrap";
import Signup from "./components/Signup";
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import {BrowserRouter, Switch, Route, useHistory} from "react-router-dom";
import Login from "./components/Login";
import {database} from "./firebase";

const DEFAULT_KEY = "default.todolist";
const SHOW_DONE_KEY = "default.todolist.showDone";

export function getToolTip(text) { return <Tooltip id="tooltip-show-button">{text}️</Tooltip>; }

function getTime() { return Date.now(); }

class TaskData
{
    constructor(taskText)
    {
        this.id = v4();
        this.taskText = taskText;
        this.completed = false;
        this.editing = false;
        this.lastModfication = getTime();
    }

    setTask(task)
    {
        this.taskText = task.taskText;
        this.completed = task.completed;
        this.editing = task.editing;
        this.lastModfication = task.lastModfication;
    }

    updateTaskParameter(props)
    {
        if (props.taskText !== undefined) this.taskText = props.taskText;
        else if (props.completed !== undefined) this.completed = props.completed;
        else if (props.editing !== undefined) this.editing = props.editing;
        else return;

        this.lastModfication = getTime();
    }

    updateTask(props)
    {
        if (props.taskText !== undefined) this.taskText = props.taskText;
        if (props.completed !== undefined) this.completed = props.completed;
        if (props.editing !== undefined) this.editing = props.editing;

        this.lastModfication = getTime();
    }
}

export default function App()
{
    const inputRef = useRef();
    const [myTodos, setTodos] = useState([]);
    const [showDoneTasks, setShowDoneTasks] = useState(true);

    const [connectedUser, setConnectedUser] = useState();

    //On start app
    useEffect(() =>
    {
        const savedData = localStorage.getItem(DEFAULT_KEY);
        const wasShowingDone = localStorage.getItem(SHOW_DONE_KEY);

        if (savedData) setTodos(JSON.parse(savedData))
        setShowDoneTasks(JSON.parse(wasShowingDone));

        /*
        fetch('https://www.google.com/').then(() =>
        {
            console.log("Online");
        }).catch(() =>
        {
            console.log("Offline");
        });
        */

    }, []);

    const uploadConnectedUserValues = useCallback(todos =>
    {
        if (connectedUser) database.child(connectedUser.uid).child("todolist").set(todos).then();
    }, [connectedUser]);

    const downloadConnectedUserValues = useCallback(connectedUser =>
    {
        if (!connectedUser) return;

        database.child(`/${connectedUser.uid}/todolist`).once("value").then(snapshot =>
        {
            const userUploadTodos = snapshot.val();
            if (userUploadTodos && myTodos !== userUploadTodos)
            {
                myTodos.forEach(task =>
                {
                    const element = userUploadTodos.find(element => element.id === task.id);

                    if (element && element.lastModfication < task.lastModfication) element.setTask(task);
                    else userUploadTodos.push(task);
                });
                setTodos(userUploadTodos);
            }
        });
    }, [myTodos]);

    useEffect(() =>
    {
        localStorage.setItem(DEFAULT_KEY, JSON.stringify(myTodos));
        uploadConnectedUserValues(myTodos);
    }, [myTodos, uploadConnectedUserValues]);

    useEffect(() => downloadConnectedUserValues(), [connectedUser, downloadConnectedUserValues]);

    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks]);

    function addTask()
    {
        const value = inputRef.current?.value;

        if (!value) return;

        setTodos(prevState => [...prevState, new TaskData(value)]);
        inputRef.current.value = '';
    }

    function removeTasks() { setTodos(myTodos.filter(element => !element.completed)); }

    function removeTask(id) { setTodos(myTodos.filter(element => element.id !== id)); }

    function toggleTodo(id)
    {
        setTodos(prevState =>
        {
            const copyTodos = [...prevState]

            const element = copyTodos.find(element => element.id === id);
            if (element) element.updateTaskParameter({ completed: !element.completed });

            return copyTodos;
        });
    }

    function toggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.id === id);

        if (!element) return;

        if (element.editing && newValue && newValue !== element.taskText) element.updateTask({ editing: !element.editing, taskText: newValue });
        else element.updateTaskParameter({ editing: !element.editing });

        setTodos(copyTodos);
    }

    const tasksLeft = myTodos.filter(element => !element.completed).length;

    function filterDoneTasks() { setShowDoneTasks(!showDoneTasks);}

    function AppLayout()
    {
        const { currentUser, logout } = useAuth();
        const [loading, setLoading] = useState(false);

        const history = useHistory();
        setConnectedUser(currentUser);

        async function handleLogout()
        {
            try
            {
                setLoading(true)
                await localStorage.delete(DEFAULT_KEY && SHOW_DONE_KEY) && logout();
                history.push('/login');
            }
            catch (e)
            {
                console.log(e + '');
            }
            setLoading(false)
        }

        return (
            <>
                {
                    (currentUser &&
                        <div className={"text-white m-2"}>
                            <h3>@{currentUser.email.split('@')[0]}</h3>
                            <Button onClick={handleLogout} disabled={loading}>Log out</Button>
                        </div>)
                    || <NavLink href={"/login"}>Log in</NavLink>
                }
                <Container className={"d-flex justify-content-center align-items-center text-center p-5"} style={{ minHeight: "100vh" }}>
                    <Card className={"w-100 bg-success"} style={{ maxWidth: "500px" }}>
                        <Card.Body>
                            <h2>My List ☑️</h2>
                            <small>v1.4</small>

                            <TodoList todos={showDoneTasks ? myTodos : myTodos.filter(element => !element.completed)} toggleTodo={toggleTodo} deleteTask={removeTask} toggleEdition={toggleEdition}/>

                            <span>You have {tasksLeft} {tasksLeft === 1 ? 'task' : 'tasks'} left!</span>
                            <InputGroup size={"sm"}>
                                <FormControl style={{ maxWidth: '400px' }} type={"text"} ref={inputRef} placeholder={"Write your task here..."}/>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Add a task")}>
                                    <Button className={"icon-button-md"} variant={"primary"} size={"lg"} onClick={addTask}>+</Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Remove done tasks")}>
                                    <Button className={"icon-button-md bg-danger"} variant={"danger"} size={"lg"} onClick={removeTasks} disabled={myTodos.length === 0 || myTodos.length === tasksLeft}>🗑️</Button>
                                </OverlayTrigger>
                            </InputGroup>

                            <br/>
                            <OverlayTrigger placement={"top"} overlay={getToolTip(showDoneTasks ? 'Hide done tasks' : 'Show done tasks')}>
                                <Button className={"icon-button-md bg-white"} variant={"light"} onClick={filterDoneTasks}>{showDoneTasks ? <>👁️‍🗨️</> : <>🚫</>}️</Button>
                            </OverlayTrigger>
                        </Card.Body>
                    </Card>
                </Container>
            </>
        );
    }

    return (
        <BrowserRouter>
            <AuthProvider>
                <Switch>
                    <Route exact path={"/"} component={AppLayout}/>
                    <Route path={"/signup"} component={Signup}/>
                    <Route path={"/login"} component={Login}/>
                </Switch>
            </AuthProvider>
        </BrowserRouter>
    );
}
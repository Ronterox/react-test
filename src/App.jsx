import './css/App.css'
import {Button, Card, Container, FormControl, Image, InputGroup, NavLink, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BrowserRouter, Switch, Route, useHistory} from "react-router-dom";
import {useCallback, useEffect, useRef, useState} from 'react';
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import TodoList from "./components/Todolist";
import Signup from "./components/Signup";
import Login from "./components/Login";
import {database} from "./firebase";
import {v4} from 'uuid';
import images from "./media/images";

const DEFAULT_KEY = "default.todolist";
const SHOW_DONE_KEY = "default.todolist.showDone";

export function getToolTip(text) { return <Tooltip id="tooltip-show-button">{text}️</Tooltip>; }

function getTime() { return Date.now(); }

class TaskData
{
    constructor(taskText)
    {
        this.taskId = v4();
        this.taskText = taskText;
        this.isCompleted = false;
        this.isEditing = false;
        this.lastModfication = getTime();
    }

    setTask(task)
    {
        this.taskText = task.taskText;
        this.isCompleted = task.isCompleted;
        this.isEditing = task.isEditing;
        this.lastModfication = task.lastModfication;
    }

    updateTaskParameter(props)
    {
        if (props.taskText) this.taskText = props.taskText;
        else if (props.isCompleted !== undefined) this.isCompleted = props.isCompleted;
        else if (props.isEditing !== undefined) this.isEditing = props.isEditing;
        else return;

        this.lastModfication = getTime();
    }

    updateTask(props)
    {
        if (props.taskText) this.taskText = props.taskText;
        if (props.isCompleted !== undefined) this.isCompleted = props.isCompleted;
        if (props.isEditing !== undefined) this.isEditing = props.isEditing;

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
        }).catch(e =>
        {
            console.log("Offline" + e);
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
                    const element = userUploadTodos.find(element => element.taskId === task.taskId);

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

    function removeTasks() { setTodos(myTodos.filter(element => !element.isCompleted)); }

    function removeTask(id) { setTodos(myTodos.filter(element => element.taskId !== id)); }

    function toggleTodo(id)
    {
        setTodos(prevState =>
        {
            const copyTodos = [...prevState]

            const element = copyTodos.find(element => element.taskId === id);
            console.log("Type is " + typeof element + " and " + element instanceof TaskData);

            if (element) element.updateTaskParameter({ isCompleted: !element.isCompleted });

            return copyTodos;
        });
    }

    function toggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.taskId === id);

        if (!element) return;

        if (element.isEditing && newValue && newValue !== element.taskText) element.updateTask({ isEditing: !element.isEditing, taskText: newValue });
        else element.updateTaskParameter({ isEditing: !element.isEditing });

        setTodos(copyTodos);
    }

    const tasksLeft = myTodos.filter(element => !element.isCompleted).length;

    function filterDoneTasks() { setShowDoneTasks(!showDoneTasks);}

    function AppLayout()
    {
        const { currentUser, logout } = useAuth();
        const [loading, setLoading] = useState(false);

        const history = useHistory();

        useEffect(() => setConnectedUser(currentUser), [currentUser]);

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
                console.log(`Controlled error: ${e}`);
            }
            setLoading(false)
        }

        return (
            <>
                {
                    (currentUser &&
                        <div className={"m-2"}>
                            <div>
                                <Image src={images.defaultProfile} roundedCircle className={"profile-pic"}/>
                                <h3 className={"text-danger"}>@{currentUser.email.split('@')[0]}</h3>
                            </div>
                            <Button onClick={handleLogout} disabled={loading}>Log out</Button>
                        </div>)
                    || <NavLink href={"/login"}>Log in</NavLink>
                }
                <Container className={"d-flex justify-content-center align-items-center text-center p-5"} style={{ minHeight: "100vh" }}>
                    <Card className={"w-100 bg-success"} style={{ maxWidth: "500px" }}>
                        <Card.Body>
                            <h2>My List ☑️</h2>
                            <small>v1.4</small>

                            <TodoList todos={showDoneTasks ? myTodos : myTodos.filter(element => !element.isCompleted)} toggleTodo={toggleTodo} deleteTask={removeTask} toggleEdition={toggleEdition}/>

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
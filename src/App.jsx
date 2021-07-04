import './css/App.css'
import {Button, Card, Container, FormControl, Image, InputGroup, NavLink, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BrowserRouter, Switch, Route, useHistory} from "react-router-dom";
import {useEffect, useRef, useState} from 'react';
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import TodoList from "./components/Todolist";
import Signup from "./components/Signup";
import Login from "./components/Login";
import {database} from "./firebase";
import {v4} from 'uuid';
import images from "./media/images";

const DEFAULT_KEY = "default.todolist";
const SHOW_DONE_KEY = "default.todolist.showDone";
const DEVICE_KEY = "default.todolist.deviceId";

const CHILD_DEVICE_TAG = "lastDeviceId";
const CHILD_TODOLIST_TAG = "todolist";
const CHILD_DELETED_TAG = "deletedTodos";

const DELETED_TASKS_LENGHT_LIMIT = 10;

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
        this.taskId = task.taskId;
        this.setTaskValues(task);
    }

    setTaskValues(task)
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

    const lastUserId = useRef();
    const thisDeviceId = useRef();

    const isUserRefresh = useRef(false);

    function updateTaskList(todos, isUser = true)
    {
        isUserRefresh.current = isUser;
        setTodos(todos);
    }

    function obtainDeletedList()
    {
        const deletedDatabaseRef = database.child(`/${connectedUser.uid}/${CHILD_DELETED_TAG}`);
        return deletedDatabaseRef.once('value');
    }

    //On start app
    useEffect(() =>
    {
        const savedData = localStorage.getItem(DEFAULT_KEY);
        const wasShowingDone = localStorage.getItem(SHOW_DONE_KEY);

        let localDevice = localStorage.getItem(DEVICE_KEY);
        if (localDevice === 'undefined') localDevice = false;

        thisDeviceId.current = localDevice || v4();

        if (savedData)
        {
            const todos = [];

            JSON.parse(savedData).forEach(todo =>
            {
                const taskData = new TaskData();
                taskData.setTask(todo);

                todos.push(taskData);
            });

            updateTaskList(todos, false);
        }

        setShowDoneTasks(JSON.parse(wasShowingDone));
    }, []);

    useEffect(() =>
    {
        const lastId = lastUserId.current;
        if (lastId) database.child(`/${lastId}/${CHILD_DEVICE_TAG}`).off();

        if (!connectedUser) return;

        const setDownloadUserValues = snapshot =>
        {
            const userUploadTodos = [];

            snapshot.val()?.forEach(data =>
            {
                const taskData = new TaskData();
                taskData.setTask(data);

                userUploadTodos.push(taskData);
            });

            if (userUploadTodos && myTodos !== userUploadTodos)
            {
                myTodos.forEach(task =>
                {
                    const element = userUploadTodos.find(element => element.taskId === task.taskId);

                    if (element && element.lastModfication < task.lastModfication) element.setTaskValues(task);
                    else if (!element)
                    {
                        obtainDeletedList().then(deletedListSnapshot =>
                        {
                            const deletedElement = deletedListSnapshot.val().find(deleted => deleted.id === task.id)
                            if (!deletedElement) userUploadTodos.push(task);
                        });
                    }
                });
                updateTaskList(userUploadTodos, false);
            }
        };

        database.child(`/${lastUserId.current = connectedUser.uid}/${CHILD_TODOLIST_TAG}`).on("value", todolistSnapshot =>
        {
            database.child(`/${connectedUser.uid}/${CHILD_DEVICE_TAG}`).once("value").then(deviceIdSnapshot =>
                {
                    const lastDevice = deviceIdSnapshot.val();
                    if (lastDevice && lastDevice !== thisDeviceId.current) setDownloadUserValues(todolistSnapshot);
                }
            );
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectedUser]);

    useEffect(() =>
    {
        localStorage.setItem(DEFAULT_KEY, JSON.stringify(myTodos));
        localStorage.setItem(DEVICE_KEY, thisDeviceId.current);

        if (!connectedUser) return;

        const uploadConnectedUserValues = () =>
        {
            const userUrl = database.child(connectedUser.uid);
            userUrl.child(CHILD_TODOLIST_TAG).set(myTodos).then(() => console.log("Uploaded values to database: " + JSON.stringify(myTodos)));
            if (isUserRefresh.current) userUrl.child(CHILD_DEVICE_TAG).set(thisDeviceId.current).then(() => console.log("Setted device: " + thisDeviceId.current));
        }

        uploadConnectedUserValues();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTodos])

    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks]);

    function addTask()
    {
        const value = inputRef.current?.value;

        if (!value) return;

        updateTaskList([...myTodos, new TaskData(value)]);
        inputRef.current.value = '';
    }

    function updateRemovedList(values)
    {
        if (connectedUser)
        {
            obtainDeletedList().then(deletedListSnapshot =>
            {
                const deletedList = deletedListSnapshot.val();
                const newDeletedList = [...deletedList || [], ...values];

                if (newDeletedList.length > DELETED_TASKS_LENGHT_LIMIT) newDeletedList.splice(0, newDeletedList.length - DELETED_TASKS_LENGHT_LIMIT);

                const deletedDatabaseRef = database.child(`/${connectedUser.uid}/${CHILD_DELETED_TAG}`);
                deletedDatabaseRef.set(newDeletedList).then(() => console.log("Added deleted list data: " + JSON.stringify(newDeletedList)));
            });
        }
    }

    function removeTasks()
    {
        const completedTodos = myTodos.filter(element => element.isCompleted);

        updateRemovedList(completedTodos);

        updateTaskList(myTodos.filter(element => !element.isCompleted));
    }

    function removeTask(id)
    {
        const deletedElement = myTodos.find(element => element.taskId === id);

        updateRemovedList([deletedElement]);

        updateTaskList(myTodos.filter(element => element.taskId !== id));
    }

    function toggleTodo(id)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.taskId === id);
        if (element) element.updateTaskParameter({ isCompleted: !element.isCompleted });

        updateTaskList(copyTodos);
    }

    function toggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = copyTodos.find(element => element.taskId === id);

        if (!element) return;

        if (element.isEditing && newValue && newValue !== element.taskText) element.updateTask({ isEditing: !element.isEditing, taskText: newValue });
        else element.updateTaskParameter({ isEditing: !element.isEditing });

        updateTaskList(copyTodos);
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

                localStorage.removeItem(DEFAULT_KEY && SHOW_DONE_KEY);
                await logout();

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
                        <div className={"m-3"}>
                            <div>
                                <Image src={images.defaultProfile} roundedCircle className={"profile-pic"}/>
                                <h3 className={"text-danger"}>@{currentUser.email.split('@')[0]}</h3>
                            </div>
                            <Button onClick={handleLogout} disabled={loading}>Log out</Button>
                        </div>)
                    || <NavLink href={"/login"}>Log in</NavLink>
                }
                <Container className={"d-flex justify-content-center align-items-center text-center"}>
                    <Card className={"w-100 bg-success"} style={{ maxWidth: "500px" }}>
                        <Card.Body>
                            <h2>My List ☑️</h2>
                            <small>v1.6</small>

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
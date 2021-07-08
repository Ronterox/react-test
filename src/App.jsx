import './css/App.css'
import {Button, Card, Container, FormControl, Image, InputGroup, NavLink, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BrowserRouter, Switch, Route, useHistory} from "react-router-dom";
import {useEffect, useRef, useState} from 'react';
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import TodoList, {DEFAULT_LIST_NAME} from "./components/objects/Todolist";
import Signup from "./components/account/Signup";
import Login from "./components/account/Login";
import {database} from "./firebase";
import {v4} from 'uuid';
import WhatsNew from "./components/WhatsNew";
import AccountForm from "./components/account/config/AccountForm";
import Profile from "./components/account/config/Profile";
import {PrivateRoute, PublicRoute} from "./components/utils/MyRoutes";
import DeleteAccount from "./components/account/config/DeleteAccount";

const UNNECESSARY_TEXT = "default.todolist.";

const DEFAULT_KEY = UNNECESSARY_TEXT + "lists";
const SHOW_DONE_KEY = UNNECESSARY_TEXT + "showDone";
const DEVICE_KEY = UNNECESSARY_TEXT + "deviceId";

const CHILD_DEVICE_TAG = "lastDeviceId";
const CHILD_TODOLIST_TAG = "todolist";
const CHILD_DELETED_TAG = "deletedTodos";

const DELETED_TASKS_LENGTH_LIMIT = 10;

export const getToolTip = text => <Tooltip id="tooltip-show-button">{text}️</Tooltip>;

const getTime = () => Date.now();

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

    static createTask(task)
    {
        const taskData = new TaskData();
        taskData.setTask(task);

        return taskData;
    }
}

export default function App()
{
    const [myTodos, setTodos] = useState([]);
    const [showDoneTasks, setShowDoneTasks] = useState(true);
    const inputRef = useRef();

    const [connectedUser, setConnectedUser] = useState();

    const lastUserId = useRef();
    const thisDeviceId = useRef();

    const isUserRefresh = useRef(false);

    //TODO: Context Database

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
                if (todo.tasks)
                {
                    const todolist = [];
                    todo.tasks.forEach(task => todolist.push(TaskData.createTask(task)));
                    todos.push({ listName: todo.listName, tasks: todolist });
                }
                else if (todo.taskId) todos.push(TaskData.createTask(todo));
                else todos.push(todo);
            });

            updateTaskList(todos, false);
        }

        setShowDoneTasks(JSON.parse(wasShowingDone));
    }, []);

    useEffect(() =>
    {
        const lastId = lastUserId.current;
        if (lastId) database.child(`/${lastId}/${CHILD_TODOLIST_TAG}`).off();

        if (!connectedUser) return;

        const setDownloadUserValues = snapshot =>
        {
            const userUploadTodos = [];

            const allLists = snapshot.val();
            allLists?.forEach(element =>
            {
                if (element)
                {
                    if (element.tasks)
                    {
                        const todoList = [];

                        element.tasks.forEach(task => todoList.push(TaskData.createTask(task)));

                        userUploadTodos.push(todoList);
                    }
                    else if (element.taskId) userUploadTodos.push(TaskData.createTask(element));
                }
            });

            if (userUploadTodos && myTodos !== userUploadTodos)
            {
                myTodos.forEach((todoList, index) =>
                {
                    if (userUploadTodos[index])
                    {
                        if (userUploadTodos[index].tasks)
                        {
                            todoList.forEach(task =>
                            {
                                const element = userUploadTodos[index].tasks.find(element => element.taskId === task.taskId);

                                if (element && element.lastModfication < task.lastModfication) element.setTaskValues(task);
                                else if (!element)
                                {
                                    obtainDeletedList().then(deletedListSnapshot =>
                                    {
                                        const deletedElement = deletedListSnapshot.val().find(deleted => deleted.id === task.id)
                                        if (!deletedElement) userUploadTodos[index].push(task);
                                    });
                                }
                            });
                        }
                        else if (userUploadTodos[index].taskId)
                        {
                            const element = userUploadTodos[index];

                            if (element.lastModfication < todoList.lastModfication) element.setTaskValues(todoList);
                            else if (!element)
                            {
                                obtainDeletedList().then(deletedListSnapshot =>
                                {
                                    const deletedElement = deletedListSnapshot.val().find(deleted => deleted.id === todoList.id)
                                    if (!deletedElement) userUploadTodos[index].push(todoList);
                                });
                            }
                        }
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
            if (isUserRefresh.current) userUrl.child(CHILD_DEVICE_TAG).set(thisDeviceId.current).then(() => console.log("Set device: " + thisDeviceId.current));
        }

        uploadConnectedUserValues();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTodos])

    useEffect(() => localStorage.setItem(SHOW_DONE_KEY, JSON.stringify(showDoneTasks)), [showDoneTasks]);

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

    function getUserInput(action)
    {
        const value = inputRef.current?.value;
        inputRef.current.value = '';
        if (value) action(value);
    }

    const addTask = () => getUserInput(value => updateTaskList([...myTodos, new TaskData(value)]));

    const addTaskGroup = () => getUserInput(value => updateTaskList([...myTodos, { listName: value, tasks: [] }]));

    function updateRemovedList(values)
    {
        if (connectedUser)
        {
            obtainDeletedList().then(deletedListSnapshot =>
            {
                const deletedList = deletedListSnapshot.val();
                const newDeletedList = [...deletedList || [], ...values];

                if (newDeletedList.length > DELETED_TASKS_LENGTH_LIMIT) newDeletedList.splice(0, newDeletedList.length - DELETED_TASKS_LENGTH_LIMIT);

                const deletedDatabaseRef = database.child(`/${connectedUser.uid}/${CHILD_DELETED_TAG}`);
                deletedDatabaseRef.set(newDeletedList).then(() => console.log("Added deleted list data: " + JSON.stringify(newDeletedList)));
            });
        }
    }

    function removeTasks()
    {
        const completedTodos = filterTodos(myTodos, element => element.taskId ? element.isCompleted : true);
        const notCompletedTodos = filterTodos(myTodos, element => element.taskId ? !element.isCompleted : true);

        updateRemovedList(completedTodos);
        updateTaskList(notCompletedTodos);
    }

    const findElement = (id, copyTodos) =>
    {
        let result = null;
        copyTodos.forEach(element =>
        {
            if (element.tasks)
            {
                const e = element.tasks.find(e => e.taskId === id);
                if (e) return result = e;
            }
            else if (element?.taskId === id) return result = element;
        });
        return result;
    }

    const filterTodos = (copyTodos, condition) =>
    {
        const indexesToFilter = [];
        const filteredCopy = copyTodos.filter(condition);

        filteredCopy.forEach((todo, index) =>
        {
            if (todo.tasks) indexesToFilter.push(index);
        });

        indexesToFilter.forEach(index => filteredCopy[index].tasks = filteredCopy[index].tasks.filter(condition));

        return filteredCopy;
    };

    function removeTask(id)
    {
        const deletedElement = findElement(id, myTodos);
        const todosWithoutDeletedOne = filterTodos(myTodos, element => element.taskId ? element.taskId !== id : true);

        if (!deletedElement) return;

        updateRemovedList([deletedElement]);
        updateTaskList(todosWithoutDeletedOne);
    }

    function toggleTodo(id)
    {
        const copyTodos = [...myTodos]
        const element = findElement(id, copyTodos);

        if (!element) return;

        element.updateTaskParameter({ isCompleted: !element.isCompleted });
        updateTaskList(copyTodos);
    }

    function toggleEdition(id, newValue)
    {
        const copyTodos = [...myTodos]

        const element = findElement(id, copyTodos);

        if (!element) return;

        if (element.isEditing && newValue && newValue !== element.taskText) element.updateTask({ isEditing: !element.isEditing, taskText: newValue });
        else element.updateTaskParameter({ isEditing: !element.isEditing });

        updateTaskList(copyTodos);
    }

    const getTaskLeft = () =>
    {
        let total = 0;

        myTodos.forEach(element =>
        {
            if (element)
            {
                if (element.tasks) total += element.tasks.filter(e => !e.isCompleted).length;
                else if (element.taskId && !element.isCompleted) total++;
            }
        });

        return total;
    };

    const tasksLeft = getTaskLeft();

    const handleDoneTaskToggle = () => setShowDoneTasks(!showDoneTasks);

    const filterList = list => showDoneTasks ? list : list?.filter(element => !element.isCompleted);

    const DefaultTodolist = () =>
    {
        const defaultList = [];

        myTodos.forEach(element =>
        {
            if (element && !element.tasks && element.taskId) defaultList.push(element);
        });

        return <TodoList todos={filterList(defaultList)}
                         toggleTodo={toggleTodo}
                         deleteTask={removeTask}
                         toggleEdition={toggleEdition}
                         changeGroup={id =>
                         {
                             const copyTodos = [...myTodos];

                             const otherList = copyTodos.find(list => list?.listName && list.listName !== DEFAULT_LIST_NAME);

                             if (otherList)
                             {
                                 const element = copyTodos.find(element => element.taskId === id);
                                 if (element)
                                 {
                                     const elementPosition = copyTodos.indexOf(element);
                                     copyTodos.splice(elementPosition, 1);
                                     otherList.tasks.push(element);
                                 }

                                 updateTaskList(copyTodos);
                             }
                         }}
        />
    };

    function AppLayout()
    {
        const { currentUser, logout, userImage } = useAuth();
        const [loading, setLoading] = useState(false);

        const history = useHistory();

        useEffect(() => setConnectedUser(currentUser), [currentUser]);

        async function handleLogout()
        {
            try
            {
                setLoading(true)

                localStorage.clear();

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
                        <div className={"m-3 text-center"} style={{ width: "120px" }}>
                            <div>
                                <Image src={userImage} roundedCircle className={"profile-pic"}/>
                                <h3 className={"text-primary"}>@{currentUser.email.split('@')[0]}</h3>
                                <NavLink className={"btn btn-success text-dark"} href={"/profile"}>See Profile</NavLink>
                            </div>
                            <Button className={"w-100"} onClick={handleLogout} variant={"danger"} disabled={loading}>Log out</Button>
                        </div>
                    )
                    || <NavLink href={"/login"}>Log in</NavLink>
                }
                <NavLink className={"top-right"} href={"/whatsnew"}>What's new?</NavLink>
                <Container className={"d-flex justify-content-center align-items-center text-center"}>
                    <Card className={"w-100"} style={{ maxWidth: "500px" }}>
                        <Card.Body>
                            <h2>My List ☑️</h2>
                            <small>v1.9</small>
                            {
                                myTodos.map((todolist, index) => todolist && (
                                        todolist.tasks || !todolist.taskId ?
                                            <TodoList todos={filterList(todolist.tasks)}
                                                      toggleTodo={toggleTodo}
                                                      deleteTask={removeTask}
                                                      toggleEdition={toggleEdition}

                                                      removeGroup={() =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          copyTodos.splice(index, 1);
                                                          updateTaskList(copyTodos);
                                                      }}
                                                      editGroup={newName =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          copyTodos[index].listName = newName;
                                                          updateTaskList(copyTodos);
                                                      }}
                                                      changeGroup={id =>
                                                      {
                                                          const copyTodos = [...myTodos];
                                                          const oldGroup = copyTodos[index];

                                                          const taskGroup = oldGroup.tasks;
                                                          const oldGroupName = oldGroup.listName;

                                                          const otherList = copyTodos.find(list => list?.listName && list.listName !== oldGroupName);

                                                          if (otherList)
                                                          {
                                                              const element = taskGroup.find(element => element.taskId === id);
                                                              if (element)
                                                              {
                                                                  const elementPosition = taskGroup.indexOf(element);
                                                                  taskGroup.splice(elementPosition, 1);
                                                                  otherList.tasks.push(element);
                                                              }

                                                              updateTaskList(copyTodos);
                                                          }
                                                      }}
                                                      listName={todolist.listName}/> : null
                                    )
                                )
                            }
                            <DefaultTodolist/>
                            <span>You have {tasksLeft} {tasksLeft === 1 ? 'task' : 'tasks'} left!</span>
                            <InputGroup size={"sm"}>
                                <FormControl className={"bg-dark text-primary"} style={{ maxWidth: '400px' }} type={"text"} ref={inputRef} placeholder={"Write your task here..."}/>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Add a task")}>
                                    <Button className={"icon-button-md"} variant={"primary"} size={"lg"} onClick={addTask}>+</Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Add task group")}>
                                    <Button className={"icon-button-md"} variant={"dark"} size={"lg"} onClick={addTaskGroup}>✅+✅</Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement={"top"} overlay={getToolTip("Remove done tasks")}>
                                    <Button className={"icon-button-md"} variant={"danger"} size={"lg"} onClick={removeTasks} disabled={myTodos.length === 0 || myTodos.length === tasksLeft}>🗑️</Button>
                                </OverlayTrigger>
                            </InputGroup>

                            <br/>
                            <OverlayTrigger placement={"top"} overlay={getToolTip(showDoneTasks ? 'Hide done tasks' : 'Show done tasks')}>
                                <Button variant={"dark"} onClick={handleDoneTaskToggle}>{showDoneTasks ? <span className={"text-danger"}>Hide</span> : <span className={"text-primary"}>Show</span>}️</Button>
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
                    <Route path={"/whatsnew"} component={WhatsNew}/>
                    <PublicRoute path={"/signup"} component={Signup}/>
                    <PublicRoute path={"/login"} component={Login}/>
                    <PrivateRoute path={"/profile"} component={Profile}/>
                    <PrivateRoute path={"/password-reset"} component={AccountForm}/>
                    <PrivateRoute path={"/delete"} component={DeleteAccount}/>
                </Switch>
            </AuthProvider>
        </BrowserRouter>
    );
}
import React, { Component } from 'react';
import Mousetrap from 'mousetrap';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import NoteCard from '../NoteCard';

import Styles from './styles';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const { app, dialog } = electron.remote;

const todoListSaveLocation = `${app.getAppPath()}/todo`;

class App extends Component {
    constructor() {
        super();

        this.state = {
            todoList: {},
            todoListRead: false,
            nextId: 0,
            drawerOpen: false,
            deleteAllDialogOpen: false,
            firstLoad: true,
            snackbarOpen: false,
            snackbarMessage: 'Your notes have been saved'
        };

        this.getNextId = this.getNextId.bind(this);
        this.updateTree = this.updateTree.bind(this);
    }

    componentDidMount() {
        this.setupKeyboardShortcuts();
        this.readTodoList();
    }

    componentDidUpdate() {
        if (this.state.firstLoad)
            this.setState({ firstLoad: false });
    }

    setupKeyboardShortcuts() {
        Mousetrap.bind('ctrl+s', () => this.saveChanges(todoListSaveLocation));
    }

    readTodoList(filepath = todoListSaveLocation) {
        fs.readFile(filepath, (error, data) => {
            const listElements = data.toString('utf-8').split('\n').filter(line => line.trim().length > 0);

            const parsedList = [];
            let key = 1;
            let parentIds = [0];
            let currentLevel = 0;

            listElements.forEach(element => {
                let level = 0;
                while (element.charAt(level) === ' ')
                    level++;

                level = level / 4 + 1;

                if (level > currentLevel) {
                    parsedList.push({
                        id: key,
                        parentId: parentIds[parentIds.length - 1],
                        value: element,
                        children: []
                    });

                    currentLevel++;
                    parentIds.push(key);
                } else if (level === currentLevel) {
                    parentIds.pop();
                    parsedList.push({
                        id: key,
                        parentId: parentIds[parentIds.length - 1],
                        value: element,
                        children: []
                    });

                    parentIds.push(key);
                } else {
                    while (currentLevel > level) {
                        currentLevel--;
                        parentIds.pop();
                    }

                    parentIds.pop();
                    parsedList.push({
                        id: key,
                        parentId: parentIds[parentIds.length - 1],
                        value: element,
                        children: []
                    });

                    parentIds.push(key);
                }

                key++;
            });

            const getTree = (list, parentId) => {
                const tree = [];

                for (let element in list) {
                    if (list[element].parentId === parentId) {
                        const children = getTree(list, list[element].id);

                        if (children.length)
                            list[element].children = children;

                        tree.push(list[element]);
                    }
                }

                return tree;
            };

            const treeifiedList = getTree(parsedList, 0);

            this.setState({
                todoList: treeifiedList,
                todoListRead: true,
                nextId: key
            });
        });
    }

    getNextId() {
        const { nextId } = this.state;

        this.setState({ nextId: nextId + 1 });

        return nextId;
    }

    updateTree(updatedCard) {
        const { todoList } = this.state;

        if (typeof updatedCard === 'object') {
            const nodeToUpdate = updatedCard.id;

            const updatedTodoList = todoList.map(node => {
                return node.id === nodeToUpdate ? updatedCard : node;
            });

            this.setState({ todoList: updatedTodoList });
        } else {
            const updatedTodoList = todoList.filter(node => {
                return node.id !== updatedCard;
            });

            this.setState({ todoList: updatedTodoList });
        }
    }

    displayCards() {
        const { todoList, firstLoad } = this.state;

        return todoList.map(card => {
            return (
                <NoteCard
                    card={card}
                    getNextId={this.getNextId}
                    updateTree={this.updateTree}
                    firstLoad={firstLoad}
                    key={card.id}
                />
            );
        });
    }

    addCard() {
        const { todoList } = this.state;

        const newCard = {
            id: this.getNextId(),
            parentId: 0,
            value: ': ',
            children: []
        };

        const newTodoList = [...todoList, newCard];

        this.setState({ todoList: newTodoList });
    }

    toggleDrawer() {
        this.setState({ drawerOpen: !this.state.drawerOpen });
    }

    toggleDeleteAllDialog() {
        this.setState({ deleteAllDialogOpen: !this.state.deleteAllDialogOpen });
    }

    deleteAllNotes() {
        this.setState({ todoList: [] });
    }

    getDeleteAllDialogActions() {
        return [
            <FlatButton
                label='Cancel'
                onClick={() => { this.toggleDeleteAllDialog(); this.toggleDrawer(); }}
            />,
            <FlatButton
                label='Delete'
                onClick={() => { this.deleteAllNotes(); this.toggleDeleteAllDialog(); this.toggleDrawer() }}
            />
        ]
    }

    saveChanges(filepath) {
        const { todoList, drawerOpen } = this.state;

        const whitespacePerLevel = '    ';

        const flattenTree = (tree, level) => {
            if (!tree.children.length) {
                let levelSpacing = '';

                for (let i = 0; i < level; i++) {
                    levelSpacing = `${levelSpacing}${whitespacePerLevel}`;
                }

                return [`${levelSpacing}${tree.value.trim()}`];
            } else {
                let levelSpacing = '';

                for (let i = 0; i < level; i++) {
                    levelSpacing = `${levelSpacing}${whitespacePerLevel}`;
                }

                const flattenedTree = [`${levelSpacing}${tree.value.trim()}`];
                tree.children.forEach(child => flattenedTree.push(...flattenTree(child, level + 1)));

                return flattenedTree;
            }
        }

        const flattenedTodoList = [];
        todoList.forEach(node => flattenedTodoList.push(...flattenTree(node, 0)));

        const stringifiedTodoList = `${flattenedTodoList.join('\n')}\n`;

        fs.writeFile(filepath, stringifiedTodoList, error => {
            if (error)
                console.error(error.message);
            else {
                if (filepath === todoListSaveLocation)
                    this.toggleSnackbar('Your notes have been saved');
                else
                    this.toggleSnackbar(`Your notes have been exported to ${filepath}`);
            }
        });

        if (drawerOpen)
            this.toggleDrawer();
    }

    toggleSnackbar(message = '') {
        this.setState({
            snackbarOpen: !this.state.snackbarOpen,
            snackbarMessage: message
        });
    }

    importNotes() {
        dialog.showOpenDialog(fileNames => {
            if (!fileNames) {
                console.warn('No files selected');
                return;
            }

            this.setState({
                firstLoad: true,
                todoListRead: false,
                todoList: []
            });

            this.readTodoList(fileNames[0]);
            this.toggleDrawer();
            this.toggleSnackbar(`Your notes have been imported from ${fileNames[0]}`);
        });
    }

    exportNotes() {
        dialog.showSaveDialog(filepath => {
            if (!filepath) {
                console.warn('File not saved');
                return;
            }

            this.saveChanges(filepath);
        });
    }

    render() {
        if (!this.state.todoListRead)
            return (
                <MuiThemeProvider>
                    <div style={Styles.loaderContainer}>
                        <CircularProgress size={160} thickness={7}/>
                    </div>
                </MuiThemeProvider>
            );

        return (
            <MuiThemeProvider>
                <div style={Styles.appContainer}>
                    <div style={Styles.drawerFabContainer}>
                        <FloatingActionButton
                            backgroundColor={Styles.drawerFab.backgroundColor}
                            onClick={() => this.toggleDrawer()}
                        >
                            <NavigationMenu/>
                        </FloatingActionButton>
                    </div>
                    <Drawer open={this.state.drawerOpen} style={Styles.drawer}>
                        <div style={Styles.drawerCloseButtonContainer}>
                            <IconButton onClick={() => this.toggleDrawer()}>
                                <NavigationClose/>
                            </IconButton>
                        </div>
                        <MenuItem onClick={() => this.saveChanges(todoListSaveLocation)}>Save Changes</MenuItem>
                        <MenuItem onClick={() => this.importNotes()}>Import Notes</MenuItem>
                        <MenuItem onClick={() => this.exportNotes()}>Export to File</MenuItem>
                        <MenuItem onClick={() => this.toggleDeleteAllDialog()}>Delete All</MenuItem>
                    </Drawer>
                    {this.displayCards()}
                    <RaisedButton label='Add New Card' style={Styles.addCard} onClick={() => this.addCard()}/>
                    <Dialog
                        actions={this.getDeleteAllDialogActions()}
                        modal={false}
                        open={this.state.deleteAllDialogOpen}
                        onRequestClose={() => { this.toggleDrawer(); this.toggleDeleteAllDialog(); }}
                    >
                        Are you sure you want to delete all of your notes?
                    </Dialog>
                    <Snackbar
                        open={this.state.snackbarOpen}
                        message={this.state.snackbarMessage}
                        autoHideDuration={2500}
                        onRequestClose={() => this.toggleSnackbar()}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

export default App;

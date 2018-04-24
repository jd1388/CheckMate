import React, { Component } from 'react';

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

import NoteCard from '../NoteCard';

import Styles from './styles';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const app = electron.remote.app;

class App extends Component {
    constructor() {
        super();

        this.state = {
            todoList: {},
            todoListRead: false,
            nextId: 0,
            drawerOpen: false,
            deleteAllDialogOpen: false
        };

        this.getNextId = this.getNextId.bind(this);
        this.updateTree = this.updateTree.bind(this);
    }

    componentDidMount() {
        this.readTodoList();
    }

    readTodoList() {
        fs.readFile(`${app.getAppPath()}/todo`, (error, data) => {
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
        const { todoList } = this.state;

        return todoList.map(card => {
            return (
                <NoteCard card={card} getNextId={this.getNextId} updateTree={this.updateTree} key={card.id}/>
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
                        <MenuItem>Save Changes</MenuItem>
                        <MenuItem>Import Notes</MenuItem>
                        <MenuItem>Export to File</MenuItem>
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
                </div>
            </MuiThemeProvider>
        );
    }
}

export default App;

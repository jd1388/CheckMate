import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import NoteCard from '../NoteCard';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const app = electron.remote.app;

class App extends Component {
    constructor() {
        super();

        this.state = {
            todoList: {},
            todoListRead: false,
            nextId: 0
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

    render() {
        if (!this.state.todoListRead)
            return <div>Working on it</div>

        return (
            <MuiThemeProvider>
                <div>
                    {this.displayCards()}
                </div>
            </MuiThemeProvider>
        );
    }
}

export default App;

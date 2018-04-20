import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import TextareaAutosize from 'react-autosize-textarea';

import Note from '../Note';

import Styles from './styles';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const app = electron.remote.app;

class App extends Component {
    constructor() {
        super();

        this.state = {
            todoList: {},
            todoListRead: false
        };
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
                todoListRead: true
            });
        });
    }

    displayTodoList() {
        const { todoList } = this.state;

        return todoList.map(category => {
            return (
                <Card key={category.id} style={Styles.card}>
                    <CardTitle style={Styles.cardTitle}>
                        <TextareaAutosize style={Styles.cardTitleValue} defaultValue={category.value.trim()}/>
                        <div style={Styles.buttonContainer}>
                            <IconButton tooltip='More...' tooltipPosition='top-center'>
                                <HardwareKeyboardArrowDown/>
                            </IconButton>
                            <IconButton tooltip='Add' tooltipPosition='top-center'>
                                <ContentAdd/>
                            </IconButton>
                            <IconButton tooltip='Delete' tooltipPosition='top-center'>
                                <NavigationClose/>
                            </IconButton>
                        </div>
                    </CardTitle>
                    <CardText style={Styles.cardText}>
                        {category.children &&
                            <Note notes={category.children} parent={category.parentId} id={category.id}/>
                        }
                    </CardText>
                </Card>
            )
        });
    }

    render() {
        if (!this.state.todoListRead)
            return <div>Working on it</div>

        return (
            <MuiThemeProvider>
                <div>
                    {this.displayTodoList()}
                </div>
            </MuiThemeProvider>
        );
    }
}

export default App;

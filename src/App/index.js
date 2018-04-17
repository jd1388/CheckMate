import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardTitle, CardText } from 'material-ui/Card';

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

            // for (let i = 0; i < listElements.length; i++) {
            //     const currentLine = listElements[i];

            //     if (currentLine.charAt(0) === ':') {
            //         parsedList.push({ title: currentLine, elements: [] });
            //         key++;
            //     } else
            //         parsedList[key - 1].elements.push(currentLine);
            // }

            let parentIds = [0];
            let currentLevel = 0;

            listElements.forEach(element => {
                let level = 0;
                while (element.charAt(level) == ' ')
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
            console.log(treeifiedList);

            this.setState({
                todoList: treeifiedList,
                todoListRead: true
            });
        });
    }

    displayTodoList() {
        const { todoList } = this.state;

        const list = [];

        todoList.forEach((category, index) => {
            list.push(
                <Card key={index} style={Styles.card}>
                    <CardTitle style={Styles.cardTitle}>{category.title.substring(2)}</CardTitle>
                    <CardText style={Styles.cardText}>
                        { this.displayCategoryElements(category.elements, index) }
                    </CardText>
                </Card>
            );
        });

        return list;
    }

    displayCategoryElements(elements, categoryIndex) {
        return elements.map((element, elementIndex) => {
            const elementType = element.trim().charAt(0);
            const elementToDisplay = element.trim();

            let indentLevel = 0;

            while (element.charAt(indentLevel) === ' ')
                indentLevel++;

            const indentationMargin = { marginLeft: `${48 * (indentLevel / 4 - 1)}px` }

            switch(elementType) {
                case '*':
                    return <p key={`${element}-${categoryIndex}`} style={Object.assign({}, Styles.commentElement, indentationMargin)}>{elementToDisplay}</p>
                case '?':
                    return <p key={`${element}-${categoryIndex}`} style={Object.assign({}, Styles.questionElement, indentationMargin)}>{elementToDisplay}</p>
                case '!':
                    return <p key={`${element}-${categoryIndex}`} style={Object.assign({}, Styles.excitedElement, indentationMargin)}>{elementToDisplay}</p>
                default:
                    return <p key={`${element}-${categoryIndex}`} style={Object.assign({}, Styles.regularElement, indentationMargin)}>{elementToDisplay}</p>
            }
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

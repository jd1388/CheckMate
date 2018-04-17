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

            let parsedList = [];
            let key = 0;

            for (let i = 0; i < listElements.length; i++) {
                const currentLine = listElements[i];

                if (currentLine.charAt(0) === ':') {
                    parsedList.push({ title: currentLine, elements: [] });
                    key++;
                } else
                    parsedList[key - 1].elements.push(currentLine);
            }

            this.setState({
                todoList: parsedList,
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
            const elementToDisplay = element.replace(/ /g, '\u00a0');

            switch(elementType) {
                case '*':
                    return <p key={`${element}-${categoryIndex}`} style={Styles.commentElement}>{elementToDisplay}</p>
                case '?':
                    return <p key={`${element}-${categoryIndex}`} style={Styles.questionElement}>{elementToDisplay}</p>
                case '!':
                    return <p key={`${element}-${categoryIndex}`} style={Styles.excitedElement}>{elementToDisplay}</p>
                default:
                    return <p key={`${element}-${categoryIndex}`} style={Styles.regularElement}>{elementToDisplay}</p>
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

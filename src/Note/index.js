import React, { Component } from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import TextareaAutosize from 'react-autosize-textarea';

import Styles from './styles';

export default class NoteCard extends Component {
    constructor(props) {
        super(props);

        const { notes, parent, id } = props;

        this.state = {
            notes,
            parent,
            id
        };
    }

    displayCategoryElements(elements) {
        return elements.map(element => {
            const elementType = element.value.trim().charAt(0);
            const elementToDisplay = element.value.trim();

            let indentLevel = 0;

            while (element.value.charAt(indentLevel) === ' ')
                indentLevel++;

            const indentationMargin = { marginLeft: `${indentLevel / 4 - 1 ? '48px' : 0}` }

            switch (elementType) {
                case '*':
                    return (
                        <Paper key={element.id} style={Object.assign({}, Styles.commentElement, indentationMargin)}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
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
                            </div>
                            {element.children && this.displayCategoryElements(element.children)}
                        </Paper>
                    );
                case '?':
                    return (
                        <Paper key={element.id} style={Object.assign({}, Styles.questionElement, indentationMargin)}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
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
                            </div>
                            {element.children && this.displayCategoryElements(element.children)}
                        </Paper>
                    );
                case '!':
                    return (
                        <Paper key={element.id} style={Object.assign({}, Styles.excitedElement, indentationMargin)}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
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
                            </div>
                            {element.children && this.displayCategoryElements(element.children)}
                        </Paper>
                    );
                default:
                    return (
                        <Paper key={element.id} style={Object.assign({}, Styles.regularElement, indentationMargin)}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
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
                            </div>
                            {element.children && this.displayCategoryElements(element.children)}
                        </Paper>
                    );
            }
        });
    }

    render() {
        console.log(this.state.notes);

        return (
            <div>
                {this.displayCategoryElements(this.state.notes)}
            </div>
        );
    }
}

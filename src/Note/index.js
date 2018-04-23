import React, { Component } from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import TextareaAutosize from 'react-autosize-textarea';

import Styles from './styles';

export default class Note extends Component {
    constructor(props) {
        super(props);

        const { notes } = props;

        this.state = {
            notes
        };
    }

    addNote() {
        const { updateNextId, id, parent } = this.props;
        const { notes } = this.state;

        const noteToAddTo = notes.find(note => note.parentId === id);
        const subnote = {
            parentId: noteToAddTo.id,
            id: updateNextId(),
            value: '',
            children: []
        };

        noteToAddTo.children.push(subnote);

        this.setState({ notes });
    }

    displayCategoryElements(elements) {
        const { updateNextId } = this.props;

        return elements.map(element => {
            const elementType = element.value.trim().charAt(0);
            const elementToDisplay = element.value.trim();

            switch (elementType) {
                case '*':
                    return (
                        <Paper key={element.id} style={Styles.commentElement}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
                                <div style={Styles.buttonContainer}>
                                    <IconButton tooltip='More...' tooltipPosition='top-center'>
                                        <HardwareKeyboardArrowDown/>
                                    </IconButton>
                                    <IconButton tooltip='Add' tooltipPosition='top-center' onClick={() => this.addNote()}>
                                        <ContentAdd/>
                                    </IconButton>
                                    <IconButton tooltip='Delete' tooltipPosition='top-center'>
                                        <NavigationClose/>
                                    </IconButton>
                                </div>
                            </div>
                            {element.children &&
                                <Note
                                    notes={element.children}
                                    parent={element.parentId}
                                    id={element.id}
                                    updateNextId={updateNextId}
                                />
                            }
                        </Paper>
                    );
                case '?':
                    return (
                        <Paper key={element.id} style={Styles.questionElement}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
                                <div style={Styles.buttonContainer}>
                                    <IconButton tooltip='More...' tooltipPosition='top-center'>
                                        <HardwareKeyboardArrowDown/>
                                    </IconButton>
                                    <IconButton tooltip='Add' tooltipPosition='top-center' onClick={() => this.addNote()}>
                                        <ContentAdd/>
                                    </IconButton>
                                    <IconButton tooltip='Delete' tooltipPosition='top-center'>
                                        <NavigationClose/>
                                    </IconButton>
                                </div>
                            </div>
                            {element.children &&
                                <Note
                                    notes={element.children}
                                    parent={element.parentId}
                                    id={element.id}
                                    updateNextId={updateNextId}
                                />
                            }
                        </Paper>
                    );
                case '!':
                    return (
                        <Paper key={element.id} style={Styles.excitedElement}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
                                <div style={Styles.buttonContainer}>
                                    <IconButton tooltip='More...' tooltipPosition='top-center'>
                                        <HardwareKeyboardArrowDown/>
                                    </IconButton>
                                    <IconButton tooltip='Add' tooltipPosition='top-center' onClick={() => this.addNote()}>
                                        <ContentAdd/>
                                    </IconButton>
                                    <IconButton tooltip='Delete' tooltipPosition='top-center'>
                                        <NavigationClose/>
                                    </IconButton>
                                </div>
                            </div>
                            {element.children &&
                                <Note
                                    notes={element.children}
                                    parent={element.parentId}
                                    id={element.id}
                                    updateNextId={updateNextId}
                                />
                            }
                        </Paper>
                    );
                default:
                    return (
                        <Paper key={element.id} style={Styles.regularElement}>
                            <div style={Styles.cardTextContainer}>
                                <TextareaAutosize style={Styles.elementValue} defaultValue={elementToDisplay}/>
                                <div style={Styles.buttonContainer}>
                                    <IconButton tooltip='More...' tooltipPosition='top-center'>
                                        <HardwareKeyboardArrowDown/>
                                    </IconButton>
                                    <IconButton tooltip='Add' tooltipPosition='top-center' onClick={() => this.addNote()}>
                                        <ContentAdd/>
                                    </IconButton>
                                    <IconButton tooltip='Delete' tooltipPosition='top-center'>
                                        <NavigationClose/>
                                    </IconButton>
                                </div>
                            </div>
                            {element.children &&
                                <Note
                                    notes={element.children}
                                    parent={element.parentId}
                                    id={element.id}
                                    updateNextId={updateNextId}
                                />
                            }
                        </Paper>
                    );
            }
        });
    }

    render() {
        return (
            <div>
                {this.displayCategoryElements(this.state.notes)}
            </div>
        );
    }
}

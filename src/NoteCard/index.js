import React, { Component } from 'react';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import TextareaAutosize from 'react-autosize-textarea';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import Note from '../Note';

import Styles from './styles';

export default class NoteCard extends Component {
    constructor() {
        super();

        this.updateTree = this.updateTree.bind(this);
    }

    updateTree(updatedNote) {
        const { card, updateTree } = this.props;

        const childToUpdate = updatedNote.id;

        const updatedTree = Object.assign({}, card, {
            children: card.children.map(note => {
                return note.id === childToUpdate ? updatedNote : note;
            })
        });

        updateTree(updatedTree);
    }

    addNote() {
        const {
            card,
            getNextId,
            updateTree
        } = this.props;

        const newNote = {
            id: getNextId(),
            parentId: card.id,
            value: '',
            children: []
        };

        const newCardData = Object.assign({}, card, {
            children: [...card.children, newNote]
        });

        updateTree(newCardData);
    }

    displayNotes() {
        const { card, getNextId } = this.props;

        return card.children.map(note => {
            return (
                <Note note={note} getNextId={getNextId} updateTree={this.updateTree} key={note.id}/>
            );
        });
    }

    render() {
        const {
            value,
            id
        } = this.props.card;

        return (
            <Card style={Styles.notecard} key={id}>
                <CardTitle style={Styles.notecardTitle}>
                    <TextareaAutosize style={Styles.notecardTitleValue} defaultValue={value.trim()}/>
                    <div style={Styles.notecardTitleMenu}>
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
                </CardTitle>
                <CardText>
                    {this.displayNotes()}
                </CardText>
            </Card>
        );
    }
}
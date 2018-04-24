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

        this.updateTree = this.updateTree.bind(this);
    }

    updateTree(updatedNote) {
        const { note, updateTree } = this.props;

        if (typeof updatedNote === 'object') {
            const childToUpdate = updatedNote.id;

            const updatedTree = Object.assign({}, note, {
                children: note.children.map(subnote => {
                    return subnote.id === childToUpdate ? updatedNote : subnote;
                })
            });

            updateTree(updatedTree);
        } else {
            const updatedTree = Object.assign({}, note, {
                children: note.children.filter(subnote => {
                    return subnote.id !== updatedNote;
                })
            });

            updateTree(updatedTree);
        }
    }

    addNote() {
        const {
            note,
            getNextId,
            updateTree
        } = this.props;

        const newNote = {
            id: getNextId(),
            parentId: note.id,
            value: '',
            children: []
        };

        const newNoteData = Object.assign({}, note, {
            children: [...note.children, newNote]
        });

        updateTree(newNoteData);
    }

    deleteNote() {
        const { note, updateTree } = this.props;

        updateTree(note.id);
    }

    displaySubnotes() {
        const { note, getNextId } = this.props;

        return note.children.map(subnote => {
            return (
                <Note note={subnote} getNextId={getNextId} updateTree={this.updateTree} key={subnote.id}/>
            );
        });
    }

    render() {
        const {
            value,
            id
        } = this.props.note;

        return (
            <Paper key={id} style={Styles.regularElement}>
                <div style={Styles.cardTextContainer}>
                    <TextareaAutosize style={Styles.elementValue} defaultValue={value.trim()}/>
                    <div style={Styles.buttonContainer}>
                        <IconButton tooltip='More...' tooltipPosition='top-center'>
                            <HardwareKeyboardArrowDown/>
                        </IconButton>
                        <IconButton tooltip='Add' tooltipPosition='top-center' onClick={() => this.addNote()}>
                            <ContentAdd/>
                        </IconButton>
                        <IconButton tooltip='Delete' tooltipPosition='top-center' onClick={() => this.deleteNote()}>
                            <NavigationClose/>
                        </IconButton>
                    </div>
                </div>
                {this.displaySubnotes()}
            </Paper>
        );
    }
}

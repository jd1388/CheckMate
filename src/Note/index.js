import React, { Component } from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextareaAutosize from 'react-autosize-textarea';

import Styles from './styles';

export default class Note extends Component {
    constructor() {
        super();

        this.state = {
            valueChanged: false
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

    addNote(type) {
        const {
            note,
            getNextId,
            updateTree
        } = this.props;

        const newNote = {
            id: getNextId(),
            parentId: note.id,
            value: type,
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
        const { note, getNextId, firstLoad } = this.props;

        return note.children.map(subnote => {
            return (
                <Note
                    note={subnote}
                    getNextId={getNextId}
                    updateTree={this.updateTree}
                    firstLoad={firstLoad}
                    key={subnote.id}
                />
            );
        });
    }

    styleNote(type) {
        switch (type) {
            case '*':
                return Styles.commentElement;
            case '?':
                return Styles.questionElement;
            case '!':
                return Styles.excitedElement;
            default:
                return Styles.regularElement;
        }
    }

    updateValue() {
        const { valueChanged } = this.state;
        const { note, updateTree } = this.props;

        if (valueChanged) {
            const updatedNote = Object.assign({}, note, {
                value: this.textarea.value
            });

            updateTree(updatedNote);

            this.setState({ valueChanged: false });
        }
    }

    setValueAsChanged() {
        const { valueChanged } = this.state;

        if (!valueChanged)
            this.setState({ valueChanged: true });
    }

    componentDidMount() {
        const { firstLoad } = this.props;

        if (!firstLoad)
            setTimeout(() => this.textarea.focus(), 0);
    }

    render() {
        const {
            value,
            id
        } = this.props.note;

        return (
            <Paper key={id} style={this.styleNote(value.trim().charAt(0))}>
                <div style={Styles.cardTextContainer}>
                    <TextareaAutosize
                        style={Styles.elementValue}
                        defaultValue={value.trim().length === 1 ? `${value.trim()} ` : value.trim()}
                        innerRef={textarea => this.textarea = textarea}
                        onChange={() => this.setValueAsChanged()}
                        onBlur={() => this.updateValue()}
                    />
                    <div style={Styles.buttonContainer}>
                        <DropDownMenu
                            style={Styles.noteAdd}
                            iconStyle={Styles.noteDropdownIcon}
                            underlineStyle={Styles.noteDropdownUnderline}
                            iconButton={<ContentAdd/>}
                        >
                            <MenuItem onClick={() => this.addNote('- ')}>Regular</MenuItem>
                            <MenuItem onClick={() => this.addNote('* ')}>Comment</MenuItem>
                            <MenuItem onClick={() => this.addNote('? ')}>Question</MenuItem>
                            <MenuItem onClick={() => this.addNote('! ')}>Excited</MenuItem>
                        </DropDownMenu>
                        <IconButton onClick={() => this.deleteNote()}>
                            <NavigationClose/>
                        </IconButton>
                    </div>
                </div>
                {this.displaySubnotes()}
            </Paper>
        );
    }
}

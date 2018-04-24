import React, { Component } from 'react';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import TextareaAutosize from 'react-autosize-textarea';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import Note from '../Note';

import Styles from './styles';

export default class NoteCard extends Component {
    constructor() {
        super();

        this.updateTree = this.updateTree.bind(this);
    }

    updateTree(updatedNote) {
        const { card, updateTree } = this.props;

        if (typeof updatedNote === 'object') {
            const childToUpdate = updatedNote.id;

            const updatedTree = Object.assign({}, card, {
                children: card.children.map(note => {
                    return note.id === childToUpdate ? updatedNote : note;
                })
            });

            updateTree(updatedTree);
        } else {
            const updatedTree = Object.assign({}, card, {
                children: card.children.filter(note => {
                    return note.id !== updatedNote;
                })
            });

            updateTree(updatedTree);
        }
    }

    addNote(type) {
        const {
            card,
            getNextId,
            updateTree
        } = this.props;

        const newNote = {
            id: getNextId(),
            parentId: card.id,
            value: type,
            children: []
        };

        const newCardData = Object.assign({}, card, {
            children: [...card.children, newNote]
        });

        updateTree(newCardData);
    }

    deleteCard() {
        const { card, updateTree } = this.props;

        updateTree(card.id);
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
                    <TextareaAutosize
                        style={Styles.notecardTitleValue}
                        defaultValue={value.trim().length === 1 ? `${value.trim()} ` : value.trim()}
                    />
                    <div style={Styles.notecardTitleMenu}>
                        <DropDownMenu
                            style={Styles.notecardExtraOptions}
                            iconStyle={Styles.notecardDropdownIcon}
                            underlineStyle={Styles.notecardDropdownUnderline}
                            iconButton={<HardwareKeyboardArrowDown/>}
                        />
                        <DropDownMenu
                            style={Styles.notecardAdd}
                            iconStyle={Styles.notecardDropdownIcon}
                            underlineStyle={Styles.notecardDropdownUnderline}
                            iconButton={<ContentAdd/>}
                        >
                            <MenuItem onClick={() => this.addNote('- ')}>Regular</MenuItem>
                            <MenuItem onClick={() => this.addNote('* ')}>Comment</MenuItem>
                            <MenuItem onClick={() => this.addNote('? ')}>Question</MenuItem>
                            <MenuItem onClick={() => this.addNote('! ')}>Excited</MenuItem>
                        </DropDownMenu>
                        <IconButton onClick={() => this.deleteCard()}>
                            <NavigationClose/>
                        </IconButton>
                     </div>
                </CardTitle>
                <CardText style={Styles.notecardText}>
                    {this.displayNotes()}
                </CardText>
            </Card>
        );
    }
}
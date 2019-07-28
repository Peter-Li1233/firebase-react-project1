import React, {Component } from "react"; 

import { AuthUserContext, withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from "../Firebase";

const HomePage = () => (
    <div>
        <h1>
            Home Page
        </h1>
        <p>The Home Page  is accessible by every signed in User </p>

        <Messages />
    </div>
);

class MessagesBase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            loading: false,
            messages: [],
            limit: 5
        }
    }

    onChangeText = e => {
        this.setState({ text: e.target.value })
    }

    onCreateMessage = (e, authUser) => {
        this.props.firebase.messages().push({
            text: this.state.text,
            userId: authUser.uid,
            createdAt: this.props.firebase.serverValue.TIMESTAMP
        });

        this.setState({ text: '' });

        e.preventDefault();
    };

    onRemoveMessage = (uid) => {
        this.props.firebase.message(uid).remove();
    };

    onEditMessage = (message, text) => {
        const {uid, ...messageSnapshot} = message;

        this.props.firebase.message(message.uid).set({
            ...messageSnapshot,
            text,
            editedAt: this.props.firebase.serverValue.TIMESTAMP
        })
    };

    onNextPage = () => {
        this.setState(
            state => ({ limit: state.limit + 5 }),
            this.onListenForMessages
        );
    };

    componentDidMount() {
        this.onListenForMessages();
    }

    onListenForMessages() {
        this.setState({ loading: true });

        this.props.firebase.messages()
            .orderByChild('createdAt')
            .limitToLast(this.state.limit)
            .on('value', snapshot => {
                const messageObject = snapshot.val();

                if (messageObject) {
                //convert messages list from snapshot
                const messageList = Object.keys(messageObject).map(key => ({
                    ...messageObject[key],
                    uid: key
                }));

                this.setState({
                    messages: messageList, 
                    loading: false 
                    });
                } else {
                    this.setState({ messages: null, loading: false });
                }
        });
    }

    componentWillUnmount() {
        this.props.firebase.messages().off();
    }

    render() {
        const { text, messages, loading } = this.state;

        return (
            <AuthUserContext.Consumer>
                { authUser => (
                    <div>
                        {loading && <div>Loading...</div> }

                        {!loading && messages && (
                            <button type="button" onClick={this.onNextPage}>
                                More
                            </button>
                        )}

                        { messages 
                            ? (<MessageList 
                                    authUser={authUser}
                                    messages={messages}
                                    onRemoveMessage={this.onRemoveMessage}
                                    onEditMessage={this.onEditMessage}
                                />
                                )
                            : (<div>There are no messages...</div>)
                        }

                        <form onSubmit={e => this.onCreateMessage(e, authUser)}>
                            <input
                                type="text"
                                value={text}
                                onChange={this.onChangeText}
                            />
                            <button className="btn btn-primary" type="submit">Send</button>
                        </form>
                    </div>
                )}
            </AuthUserContext.Consumer>
        )
    }

}

const MessageList = ({ 
        authUser,
        messages, 
        onRemoveMessage,
        onEditMessage 
    }) => (
    <ul>
        {messages.map(message => (
            <MessageItem
                authUser={authUser} 
                key={message.uid} 
                message={message}
                onEditMessage={onEditMessage}
                onRemoveMessage={onRemoveMessage} 
            />
        ))}
    </ul>
)

class MessageItem extends Component { 
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            editText: this.props.message.text
        }
    }

    onToggleEditMode = () => {
        this.setState(state => ({
            editMode: !state.editMode,
            editText: this.props.message.text
        }));
    }

    onChangeEditText = e => {
        this.setState({ editText: e.target.value });
    }

    onSaveEditText = () => {
        this.props.onEditMessage(this.props.message, this.state.editText);

        this.setState({ editMode: false });
    }

    render() {
        const { authUser, message, onRemoveMessage } = this.props;
        const { editMode, editText } = this.state;

        return (
            <li>
                {editMode
                    ? (
                        <input
                            type="text"
                            value={editText}
                            onChange={this.onChangeEditText}
                        />
                       )
                    :  (
                        <span>
                             <strong>{message.userId}</strong> {message.text}
                             {message.editedAt && <span>(Edited)</span>}
                        </span>
                       )
                }
                {authUser.uid === message.userId && (
                    <span>
                        {editMode
                            ? (
                                <span>
                                    <button onClick={this.onSaveEditText}>Save</button>
                                    <button onClick={this.onToggleEditMode}>Reset</button>
                                </span>
                            )
                            : (
                                <button onClick={this.onToggleEditMode}>Edit</button>
                            )   
                        }

                        { !editMode && (
                            <button
                                type="button"
                                onClick={ () => onRemoveMessage(message.uid) }
                            >
                                Delete
                            </button>
                        )}
                    </span>
                )}
                      
            </li>
        )
    }

}

const Messages = withFirebase(MessagesBase);

const condition = authUser => authUser != null;

// export default withEmailVerification(withAuthorization(condition)(HomePage));
export default withAuthorization(condition)(HomePage);
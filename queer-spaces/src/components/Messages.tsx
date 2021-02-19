import React, { Component, useState, useEffect, useRef } from 'react'
import { firebase, usernameRef, usersRef } from './'
import { AuthContext } from './firebase/AuthContext'
import { User } from '../interfaces/User'
import { Button, Modal, IconButton } from '@material-ui/core'
import moment from 'moment'

import styles from '../css/messages.module.css'
import BlankProfile from '../res/bp.png'
import SendIcon from '@material-ui/icons/Send'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

interface MessagesState {
    messages: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[];
    selectedMessage: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> | null
}

export default class Messages extends Component<{}, MessagesState> {
    static contextType = AuthContext;
    constructor(props: {}){
        super(props);
        this.state = {
            messages: [],
            selectedMessage: null
        }
    }

    fetchMessages = async () => {
        console.log("i was called");
        if(this.context){
            const user = this.context.user as firebase.User | null;
        if(user){
        var messageRef = firebase.firestore().collection("Messages");
        messageRef.where('user1', '==', user.uid).onSnapshot(async (snapshot) => {
            if(!snapshot.empty)
                await this.setState({messages: snapshot.docs});
            await messageRef.where('user2', '==', user.uid).onSnapshot(async (snapshot) => {
                if(!snapshot.empty)
                    this.setState({messages: [...this.state.messages, ...snapshot.docs]})
            })
        })
        }
    }
    }
    componentDidMount(){
        this.fetchMessages();
    }

    render() {
        const refreshFunction = this.fetchMessages.bind(this);
        const handleMessageCardClick = ((data: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>)=>(event:  React.MouseEvent<HTMLButtonElement, MouseEvent> | void) => {
            if(event)
                event.preventDefault();
            this.setState({selectedMessage: data})
        }).bind(this);
        return (
            <div className={styles.messageArea}>
                <h1>Messages{!!this.state.selectedMessage&&<IconButton onClick={_=>this.setState({selectedMessage: null})} style={{float:'right'}}><ArrowBackIosIcon/></IconButton>}</h1>
                <div className={!this.state.selectedMessage?styles.messages:''}>
                {!this.state.selectedMessage? this.state.messages.map(data => {
                    return (<MessageCard key={data.id} {...({...data.data() as MessageData, user:this.context.user as firebase.User | null, doc:data, refresh:refreshFunction, onClick:handleMessageCardClick(data)})as MessageProps}/>)
                }) : <MessageContainer {...({...this.state.selectedMessage.data() as MessageData, user:this.context.user as firebase.User | null, doc:this.state.selectedMessage, refresh:refreshFunction})as MessageProps}/>}
                </div>
            </div>
        )
    }
}

interface MessageData{
    user1: string;
    user2: string;
    created: firebase.firestore.Timestamp;
}
interface MessageProps extends MessageData {
    doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>;
    user: firebase.User | null;
    refresh: Function;
    onClick?: (event:  React.MouseEvent<HTMLButtonElement, MouseEvent> | void) => void;
}

const MessageCard = (props: MessageProps) => {
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [otherId, setOtherId] = useState<string>('');
    const [otherUsername, setOtherUsername] = useState<string>('');
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    useEffect(()=>{
        var id = props.user1===props.user?.uid?props.user2:props.user1;
        usersRef.doc(id).onSnapshot((snapshot) => {
            if(snapshot.exists){
                setOtherUser(snapshot.data() as User);
                setOtherId(snapshot.id);
            }
        })
    },[]);
    
    useEffect(()=>{
     if(otherUser && otherId)
       usernameRef.where('uid', '==', otherId).onSnapshot((snapshot) => {
           if(!snapshot.empty){

                setOtherUsername(snapshot.docs[0].id);
            }
       })
    }, [otherUser, otherId]);

    const handleDelete = () => {
        props.doc.ref.delete().then(_=>props.refresh()).then(_=>setDeleteModal(false)).catch(err=>console.log(err));
    }

    return (<div className={styles.messageCard}>
        {otherUser&&<>
            <div className={styles.messageCardInfo}>
                <img src={otherUser.photo || BlankProfile} className={styles.messageCardImage}/>
                <h1>{otherUser.name || 'No display name'}</h1>
                {otherUsername&&<p>{`@${otherUsername}`}</p>}
            </div>
            <Modal
                open={deleteModal}
                onClose={_=>setDeleteModal(false)}
                aria-labelled-by="delete-title">
                    <div className={styles.modal}>
                        <h1 id="delete-title">Are you sure you want to delete this chat?</h1>
                        <p>Warning: this action cannot be undone, all messages will be lost</p>
                        <Button onClick={handleDelete} style={{backgroundColor:'#A42197', marginTop:'1rem',color: 'white'}}>Delete</Button>
                    </div>
                </Modal>
            <div className={styles.messageCardButtons}>
                <Button style={{backgroundColor:'#A42197', marginTop:'1rem',color: 'white'}} onClick={props.onClick}>Open Chat</Button>
                <Button style={{backgroundColor:'#A42197', marginTop:'1rem',marginLeft:'1rem',color: 'white'}} onClick={_=>setDeleteModal(true)}>Delete Chat</Button>
            </div>
        </>}
    </div>)
}

interface Message {
    message: string;
    sent: firebase.firestore.Timestamp;
    user_id: string;
}
const MessageContainer = (props: MessageProps) => {
   const [message,setMessage] = useState<string>('');
   const [messages, setMessages] = useState<Message[]>([]);
   const messagesRef = useRef<HTMLDivElement>(null);

   useEffect(()=>{
    props.doc.ref.collection("messages").orderBy('sent').onSnapshot((snapshot) =>{
        setMessages([...snapshot.docs.map(e => e.data() as Message)]);
    })
   },[]);
   
   useEffect(()=>{
       scrollToBottom();
   },[messages]);


   const scrollToBottom = () => {
       console.log(messagesRef);
        messagesRef.current?.scrollBy({top: 9999,
        behavior:'smooth'
        });
   }

   const handleSendMessage = ()=>{
       if(props.user)
            props.doc.ref.collection("messages").add({
                message,
                sent: firebase.firestore.Timestamp.now(),
                user_id: props.user.uid
            } as Message).then(_ => setMessage(''));
   }

   return (<>
            <div ref={messagesRef} style={{width:'100%', display:'flex', flexDirection:"column", height:"60vh", overflowY:'auto'}}>
            {messages.map((data,idx)=>{
                return (<ChatMessage {...data} user={props.user}/>)
            })}
            </div>
            <div className={styles.messageBox}>
            <div style={{display: 'flex'}}>
                <textarea style={{color: 'black'}}
                        className={styles.content}
                        id="comment"
                        value={message}
                        maxLength={250}
                        placeholder="Enter your message here..."
                        onChange={(event)=>setMessage(event.currentTarget.value)}
                        />
                <IconButton onClick={handleSendMessage} style={{justifySelf:'flex-end', alignSelf:'flex-end', color:'#A42197'}}>
                    <SendIcon />
                </IconButton>
            </div>
            <div className={`${styles.characterCount} ${(message.length > 200)?styles.danger:(message.length > 100)?styles.warning:''}`}>{message.length}/250 characters</div>
            </div>
    </>)
}

interface ChatProps extends Message{
    user: firebase.User | null
}
const ChatMessage = (props: ChatProps )=>{
    return (<div className={props.user?.uid===props.user_id?styles.ownMessage:styles.theirMessage}>
        <p>{props.message}</p>
        <p style={{fontStyle:'italic'}}>{moment(props.sent.toDate()).format('llll')}</p>
    </div>)
}
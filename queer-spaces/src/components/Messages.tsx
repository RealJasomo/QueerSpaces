import React, { Component, useState, useEffect } from 'react'
import { firebase, usernameRef, usersRef } from './'
import { AuthContext } from './firebase/AuthContext'
import { User } from '../interfaces/User'
import { Button, Modal } from '@material-ui/core'

import styles from '../css/messages.module.css'
import BlankProfile from '../res/bp.png'


interface MessagesState {
    messages: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]
}

export default class Messages extends Component<{}, MessagesState> {
    static contextType = AuthContext;
    constructor(props: {}){
        super(props);
        this.state = {
            messages: []
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
        return (
            <div className={styles.messageArea}>
                <h1>Messages</h1>
                <div className={styles.messages}>
                {this.state.messages.map(data => {
                    return (<MessageCard key={data.id} {...({...data.data() as MessageData, user:this.context.user as firebase.User | null, doc:data, refresh:refreshFunction}) as MessageProps}/>)
                })}
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
    refresh: Function
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
                <Button style={{backgroundColor:'#A42197', marginTop:'1rem',color: 'white'}}>Open Chat</Button>
                <Button style={{backgroundColor:'#A42197', marginTop:'1rem',marginLeft:'1rem',color: 'white'}} onClick={_=>setDeleteModal(true)}>Delete Chat</Button>
            </div>
        </>}
    </div>)
}
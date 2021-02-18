import React, { Component } from 'react'
import { firebase, Post } from './'
import { RouteComponentProps } from 'react-router-dom'
import { IconButton } from '@material-ui/core'

import styles from '../css/comment.module.css'
import SendIcon from '@material-ui/icons/Send'

interface MatchParams {
    id: string;
}
interface CommentState {
    comment: string,
    comments: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[],
    post: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> | null
}


export default class Comments extends Component<RouteComponentProps<MatchParams>, CommentState> {
    
    constructor(props: RouteComponentProps<MatchParams>){
        super(props);
        this.state = {
            comment: '',
            comments: [],
            post: null
        }
        this.fetchPost();
    }

    fetchPost = async () => {
        firebase.firestore().collection('Posts').doc(this.props.match.params.id).get().then((snapshot)=>{
            if(snapshot.exists)
                this.setState({post: snapshot as firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>})
        }).then(this.fetchComments);
    }


    fetchComments = async () => {
        this.state.post?.ref.collection('comments').onSnapshot((snapshot)=>{
            if(!snapshot.empty)
                this.setState({comments: snapshot.docs})
        })
    }

    handleSendComment = () => {
        var user = firebase.auth().currentUser;
        if(user)
        this.state.post?.ref.collection('comments').add({
            user_id: user.uid,
            comment: this.state.comment 
        }).then(this.fetchComments).then(()=>this.setState({comment: ''}));
    }

    render() {
        return (
            <div>
                {this.state.post&&<Post doc={this.state.post} commentActive category={this.state.post.get('category')} text_content={this.state.post.get('text_content')} poll_question={this.state.post.get('poll_question')} poll_options={this.state.post.ref.collection('pollOptions')} image_url={this.state.post.get('image_url')} user_id={this.state.post.get('user_id')} created={this.state.post.get('created')} key={this.state.post.id} />}
                {this.state.comments.map((data,idx) => {
                    return (<Post doc={data} key={idx} text_content={data.get('comment')} user_id={data.get('user_id')} disableComment/>)
                })}
            <div className={styles.commentBox}>
            <div style={{display: 'flex'}}>
                <textarea style={{color: 'black'}}
                        className={styles.content}
                        id="comment"
                        value={this.state.comment}
                        maxLength={250}
                        placeholder="Enter your reply here..."
                        onChange={(event)=>this.setState({comment: event.target.value})}
                        />
                <IconButton style={{justifySelf:'flex-end', alignSelf:'flex-end', color:'#A42197'}} onClick={this.handleSendComment}>
                    <SendIcon />
                </IconButton>
            </div>
            <div className={`${styles.characterCount} ${(this.state.comment.length > 200)?styles.danger:(this.state.comment.length > 100)?styles.warning:''}`}>{this.state.comment.length}/250 characters</div>
            </div>
            </div>
        )
    }
}

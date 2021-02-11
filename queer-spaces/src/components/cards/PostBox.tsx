import React, { Component } from 'react'
import {IconButton, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'
import {firebase} from '../';
import {categories} from '../../util/Constants'

interface PostBoxProps {

}

interface PostBoxState {
    categories: Array<String>,
    category: String | null,
    content: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user: firebase.User | null,
    ref: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
}

export default class PostBox extends Component<PostBoxProps, PostBoxState>{
    
    constructor(props: PostBoxProps){
        super(props);
        this.state = {
            categories: categories,
            category: '',
            content: '',
            user: null,
            ref: firebase.firestore().collection('Posts')
        }

        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if(user)
                this.setState({user: user});
        })
    }
    handleAddNewPost = () =>{
        if(this.state.content?.length === 0 && !(this.state.content||this.state.image_url||this.state.poll_question))
            return;
        var payload = { 
            category: this.state.category,
            text_content: this.state.content,
            poll_question: this.state.poll_question,
            poll_options: this.state.poll_options,
            image_url: this.state.image_url,
            user_id: this.state.user?.uid,
            created: firebase.firestore.Timestamp.now()
        }
        Object.keys(payload).forEach(key => {if(payload[key as keyof typeof payload] === null || payload[key as keyof typeof payload] === undefined) delete payload[key as keyof typeof payload]});
    }
    render(){ 
        return(
        <>
            <div className={styles.card}>
                <div className={styles.upper}>
                    <div id="profile">
                        <img src={this.state.user?.photoURL || BlankProfile} className = {styles.profileImage} alt="profile"/> 
                    </div> 
                    <div id="content" className={styles.contentContainer}>
                        <textarea
                        className={styles.content}
                        id="text-content"
                        maxLength={250}
                        placeholder="Enter content"
                        onChange={(event)=>this.setState({content: event.target.value})}
                        />
                        <div className={`${styles.characterCount} ${(this.state.content && this.state.content?.length > 200)?styles.danger:(this.state.content && this.state.content?.length > 100)?styles.warning:''}`}>{this.state.content?.length}/250 characters</div>
                    </div>
                </div>
                <div id="selectors" className={styles.selectors}>
                <Autocomplete
                id="category-selector"
                className={styles.category}
                options={this.state.categories}
                renderInput={(params) => <TextField {...params} label="Category" />}
                onChange={(_, val)=>this.setState({category: val})}
                />
                <IconButton aria-label="Insert Chart">
                    <InsertChartIcon/>
                </IconButton>
                <IconButton aria-label="Attach image">
                    <ImageIcon/>
                </IconButton>
                <span className={styles.gap}></span>
                <IconButton aria-label="send" onClick={this.handleAddNewPost}>
                    <SendIcon className={styles.send}/>
                </IconButton>
                </div>
          </div>
        </>
    )}
}

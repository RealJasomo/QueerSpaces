import React, { Component } from 'react'
import {IconButton, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'
import {firebase} from '../';

interface PostBoxProps {

}
interface PostBoxState {
    categories: Array<String>,
    category: String | null,
    content: String ,
    user: firebase.User | null
}
export default class PostBox extends Component<PostBoxProps, PostBoxState>{
    constructor(props: PostBoxProps){
        super(props);
        this.state = {
            categories: ['Gender Identity', 'Sexuality', 'Questions'],
            category: '',
            content: '',
            user: null
        }
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if(user)
                this.setState({user: user});
        })
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
                        maxLength={200}
                        placeholder="Enter content"
                        onChange={(event)=>this.setState({content: event.target.value})}
                        />
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
                <IconButton aria-label="send">
                    <SendIcon className={styles.send}/>
                </IconButton>
                </div>
          </div>
        </>
    )}
}
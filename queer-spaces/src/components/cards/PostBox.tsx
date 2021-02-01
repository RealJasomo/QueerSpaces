import React, { Component } from 'react'
import { Typography, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'

interface PostBoxProps {

}
interface PostBoxState {
    categories: Array<String>,
    category: String | null,
    content: String 
}
export default class PostBox extends Component<PostBoxProps, PostBoxState>{
    constructor(props: PostBoxProps){
        super(props);
        this.state = {
            categories: ['Gender Identity', 'Sexuality', 'Questions'],
            category: '',
            content: ''
        }
    }
    render(){ 
        return(
        <>
            <div className={styles.card}>
                <div id="profile">
                    <img src={BlankProfile} className = {styles.profileImage} alt="profile image"/> 
                </div> 
                <div id="content">
                    <TextField 
                    className={styles.content}
                    id="text-content" 
                    multiline
                    rows={4}
                    placeholder="Enter content"
                    onChange={(event)=>this.setState({content: event.target.value})}
                    />
                </div>
                <div id="selectors" className={styles.selectors}>
                <Autocomplete
                id="category-selector"
                className={styles.category}
                options={this.state.categories}
                renderInput={(params) => <TextField {...params} label="Category" />}
                onChange={(_, val)=>this.setState({category: val})}
                />
                <InsertChartIcon className={styles.icon}/>
                <ImageIcon className={styles.icon}/>
                <SendIcon className={`${styles.icon} ${styles.send}`}/>
                </div>
          </div>
        </>
    )}
}

import React, { Component } from 'react'
import {IconButton, TextField , Button, Modal} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'
import {firebase, storageRef} from '../';
import {categories} from '../../util/Constants'
import {v4 as uuid} from 'uuid'

interface PostBoxProps {

}

interface PostBoxState {
    openImageModal: boolean,
    categories: Array<String>,
    category: String | null,
    content: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user: firebase.User | null,
    ref: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    profileImage: string | null
}

export default class PostBox extends Component<PostBoxProps, PostBoxState>{
    fileUpload: HTMLInputElement | null
    constructor(props: PostBoxProps){
        super(props);
        this.state = {
            openImageModal: false,
            categories: categories,
            category: '',
            content: '',
            user: null,
            ref: firebase.firestore().collection('Posts'),
            profileImage: null
        }
        this.fileUpload = null;
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if(user){
                this.setState({user: user});
                firebase.firestore().collection('Users').doc(user.uid).get().then((snapshot) =>{
                    if(snapshot.exists)
                        this.setState({profileImage: snapshot.get('photo')});
                })
            }
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
        this.state.ref.add(payload);
    }
    handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) =>{
        var files = event.target.files;
        if(files){
            var file = files[0];
            var storage = storageRef.child(`post-images/${uuid()}-${file.name}`);
            storage.put(file).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
                snapshot.ref.getDownloadURL().then((downloadURL) => {
                    this.setState({image_url: downloadURL as string});
                }).then(this.handleSubmitImage);
            });
        }
    }
    handleUploadButton = () => {
        this.fileUpload?.click();
    }
    handleSubmitImage = (event: React.FormEvent<HTMLFormElement> | void) => {
        if(event)
            event.preventDefault();
       this.setState({openImageModal: false})
    }

    render(){ 
        return(
        <>
           <Modal aria-labelledby="modal-title"
                open={this.state.openImageModal}
                onClose={()=>this.setState({openImageModal: false})}>
                    <div className={styles.modal}>
                        <h1 id="modal-title">Upload Image</h1>
                        <input ref={input => this.fileUpload = input} type="file" style={{display: 'none'}} onChange={this.handleFileUpload} accept="image/*"/>
                        <Button className={styles.button} onClick={this.handleUploadButton}>upload</Button>
                        <hr className={styles.hr} data-content="or"/>
                        <form onSubmit={this.handleSubmitImage}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="image-url"
                            label="Image URL"
                            name="imageURL"
                            autoComplete="imageURL"
                            autoFocus
                            onChange={e=>this.setState({image_url: e.currentTarget.value})}
                             /> 
                        </form>
                    </div>
            </Modal>
            <div className={styles.card}>
                <div className={styles.upper}>
                    <div id="profile">
                        <img src={this.state.profileImage || BlankProfile} className = {styles.profileImage} alt="profile"/> 
                    </div> 
                    <div id="content" className={styles.contentContainer}>
                        <textarea
                        className={styles.content}
                        id="text-content"
                        maxLength={250}
                        placeholder="Enter content"
                        onChange={(event)=>this.setState({content: event.target.value})}
                        />
                        {(!this.state.openImageModal&&this.state.image_url)&&<img className={styles.postboxImage} src={this.state.image_url} alt="user uploaded content"/>}
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
                <IconButton aria-label="Attach image" onClick={()=> this.setState({openImageModal: true})}>
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

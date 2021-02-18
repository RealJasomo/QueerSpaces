import React, { Component } from 'react'
import {IconButton, TextField , Button, Modal, InputAdornment, OutlinedInput, Menu, MenuItem} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'
import AddBoxIcon from '@material-ui/icons/AddBox'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import {firebase, storageRef} from '../';
import {categories} from '../../util/Constants'
import {v4 as uuid} from 'uuid'

interface PostBoxProps {

}

interface PostBoxState {
    openImageModal: boolean,
    openPollCreator: boolean,
    categories: Array<String>,
    category: String | null,
    content: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user: firebase.User | null,
    ref: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    profileImage: string | null,
    hasPoll: boolean,
    isAnonymous: boolean,
    anonymousMenu: HTMLImageElement | null
}

export default class PostBox extends Component<PostBoxProps, PostBoxState>{
    fileUpload: HTMLInputElement | null
    constructor(props: PostBoxProps){
        super(props);
        this.state = {
            openImageModal: false,
            openPollCreator: false,
            categories: categories,
            category: '',
            content: '',
            user: null,
            ref: firebase.firestore().collection('Posts'),
            profileImage: null,
            hasPoll: false,
            isAnonymous: false,
            anonymousMenu: null
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
            image_url: this.state.image_url,
            user_id: this.state.user?.uid,
            created: firebase.firestore.Timestamp.now()
        }
        Object.keys(payload).forEach(key => {if(payload[key as keyof typeof payload] === null || payload[key as keyof typeof payload] === undefined) delete payload[key as keyof typeof payload]});
        if(this.state.isAnonymous)
            delete payload.user_id;
        this.state.ref.add(payload)
        .then((doc)=>{
            if(this.state.hasPoll){
                var pollCollection = doc.collection('pollOptions');
                this.state.poll_options?.forEach(v => {
                    pollCollection.add({
                        option_text:v 
                    })
                })
            }
        }).then(()=>{this.setState({hasPoll: false, poll_options:[], poll_question: ''})});
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
    handlePollState = (i: number) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        var arr = [];
        if(this.state.poll_options){
            arr = [...this.state.poll_options];
            console.log(`${arr} and ${i}`)
            if(i < arr.length)
                arr[i] = event.currentTarget.value;
            else
                arr.push(event.currentTarget.value);
            }else{
            arr.push(event.currentTarget.value);
         }
         this.setState({poll_options: arr});
         console.log(this.state.poll_options)
    }

    handleNewPollOption = () => {
        if(this.state.poll_options && (this.state.poll_options.length > 4))
            return;
        var arr: string[] = [];
        if(this.state.poll_options)
            arr = [...this.state.poll_options];
        arr.push('');
        this.setState({poll_options: arr});
    }

    handleRemoveOption = (i: number) => () => {
        if(this.state.poll_options){
            var arr = [...this.state.poll_options]
            arr.splice(i,1);
            this.setState({poll_options: arr});
        }
    }

    handleAnonymousToggle = () => {
        this.setState({isAnonymous: !this.state.isAnonymous, anonymousMenu: null});
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
            <Menu
             id="anonymous-menu"
             style={{top: '60px'}}
             anchorEl={this.state.anonymousMenu}
             keepMounted
             open={!!this.state.anonymousMenu}
             onClose={()=> this.setState({anonymousMenu: null})}>
                 {this.state.isAnonymous?<MenuItem onClick={this.handleAnonymousToggle}>Post as yourself</MenuItem>:<MenuItem onClick={this.handleAnonymousToggle}>Post anonymously</MenuItem>}
             </Menu>
            <Modal aria-labelledby="poll-title"
                open={this.state.openPollCreator}
                onClose={()=>this.setState({openPollCreator: false})}>
                <div className={styles.modal}>
                    <h1 id="pool-title">Create a Poll</h1>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="poll-question"
                        label="Poll Question"
                        name="pollQuestion"
                        autoComplete="pollQuestion"
                        autoFocus
                        value={this.state.poll_question}
                        onChange={e=>this.setState({poll_question: e.currentTarget.value})} />
                    <h3 style={{textAlign:'left', margin:'15px', width:'100%'}}>Poll Options:</h3>
                    {this.state.poll_options?.map((_, idx) => {
                        return (<>
                        <h6 style={{textAlign:'left', marginLeft:'15px', textDecoration:'italics'}}>Option {idx+1}</h6>
                        <OutlinedInput
                            key={idx}
                            id={`poll-option-${idx+1}`}
                            autoComplete="pollOption"
                            fullWidth
                            value={this.state.poll_options?this.state.poll_options[idx]:''}
                            onChange={this.handlePollState(idx)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="remove poll option"
                                    edge="end"
                                    onClick={this.handleRemoveOption(idx)}
                                    >
                                    <RemoveCircleIcon/>
                                    </IconButton>
                                </InputAdornment>
                                }
                        /></>)
                    })}
                    <div style={{display:'flex', justifyContent:"center"}}>
                        <IconButton onClick={this.handleNewPollOption}>
                                <AddBoxIcon style={{color: "#A42197", width:'2rem'}}/>
                        </IconButton>
                        <IconButton onClick={()=>{this.setState({openPollCreator: false, hasPoll: true})}}>
                            <SaveIcon/>
                        </IconButton>
                        <IconButton onClick={()=>{this.setState({poll_question:null,poll_options:[],hasPoll:false, openPollCreator: false})}}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </div>
            </Modal>
            <div className={styles.card}>
                <div className={styles.upper}>
                    <div id="profile">
                        <img src={this.state.profileImage || BlankProfile} className = {styles.profileImage} alt="profile" onClick={(e)=>this.setState({anonymousMenu: e.currentTarget})}/> 
                        {this.state.isAnonymous&&<p style={{fontFamily:"Roboto", textAlign:"center"}}>Posting anonymously</p>}
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
                <IconButton aria-label="Insert Chart" onClick={()=>this.setState({openPollCreator: true})}>
                    <InsertChartIcon style={{color:(this.state.hasPoll)?'#A42197':'inherit'}}/>
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

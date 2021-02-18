import React, { Component} from 'react'
import { firebase, usersRef, usernameRef } from '../'
import { Button, IconButton, Menu, MenuItem, Modal, RadioGroup, Radio, FormControlLabel } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-regular-svg-icons'
import PollIcon from '@material-ui/icons/Poll'
import SendIcon from '@material-ui/icons/Send'
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import { User } from '../../interfaces/User'
import { generate, AnonymousInfo } from '../../util/AnonymousGenerator'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

interface PostProp {
    category?: string,
    text_content?: string | null,
    poll_question?: string | null,
    poll_options?: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null,
    image_url?: string | null,
    user_id?: string | null,
    created?: firebase.firestore.Timestamp,
    userInfo?: Partial<User>,
    doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
    commentActive?: boolean,
    disableComment?: boolean
}

interface PostPropState{
    likes: number,
    dislikes: number,
    userInfo?: Partial<User>,
    menuOpen: HTMLButtonElement | null,
    liked: boolean,
    disliked: boolean,
    anonymous?: AnonymousInfo,
    delete: boolean
}
export default class Post extends Component<PostProp, PostPropState> {
    constructor(props: PostProp){
        super(props);
        this.state = {
            likes: this.props.doc.get('like_count') || 0,
            dislikes: this.props.doc.get('dislike_count') || 0,
            menuOpen: null,
            liked: false,
            disliked: false,
            anonymous: (this.props.user_id)?undefined:generate(),
            delete: false
        }
        this.updateUserInfo();
        this.updateRating();
    }
    updateUserInfo = () => {
        if(this.props.user_id){
            usersRef.doc(this.props.user_id).onSnapshot((snapshot) => {
                if(snapshot.exists)
                    this.setState({userInfo: snapshot.data()})
            })
            this.grabUserName();
        }
    }

    updateRating = async () => {
        var user = firebase.auth().currentUser;
        var liked = false, disliked = false;
        if(user != null){
            var ref = this.props.doc.ref;
            await ref.collection('likes').doc(user.uid).get().then(snapshot => {
                if(snapshot.exists){
                    liked = true;
                }
            })
            await ref.collection('dislikes').doc(user.uid).get().then(snapshot => {
                if(snapshot.exists){
                    disliked = true;
                }
            })
            this.setState({
                liked: liked,
                disliked: disliked
            })
        }
    }

    grabUserName = () => {
        usernameRef.where('uid','==', this.props.user_id).get()
        .then((snap) => {
            if(snap.size > 0)
                snap.forEach((doc) => {
                    this.setState({
                        userInfo: {
                            ...this.state.userInfo,
                            username: `@${doc.id}`
                        }
                    })
                })
        })
    }
    handleLike = async () => {
        if(this.state.disliked)
            this.handleDislike();
        var updateLikes = () =>  this.setState({
            likes: this.props.doc.get('like_count')
        });
        var user = firebase.auth().currentUser;
        if(user != null){
            var ref = this.props.doc.ref;
            var doc_ref = ref.collection('likes').doc(user.uid);
            doc_ref.get().then(snapshot => {
                if(snapshot.exists){
                    doc_ref.delete();
                    ref.update({
                        like_count: firebase.firestore.FieldValue.increment(-1)
                    }).then(updateLikes).then(this.updateRating);
                }else{
                    doc_ref.set({ liked: true})
                    ref.update({
                        like_count: firebase.firestore.FieldValue.increment(1)
                    }).then(updateLikes).then(this.updateRating);
                }
            })
        }
    }
    
    handleDeleteClose = ()=>{this.setState({delete: false, menuOpen: null})};

    handleDelete = () => {
        this.props.doc.ref.delete().then(this.handleDeleteClose);
    }

    handleDislike = () => {
        if(this.state.liked)
            this.handleLike();
        var updateDislikes = () =>  this.setState({
            dislikes: this.props.doc.get('dislike_count')
        });
        var user = firebase.auth().currentUser;
        if(user != null){
            var ref = this.props.doc.ref;
            var doc_ref = ref.collection('dislikes').doc(user.uid);
            doc_ref.get().then(snapshot => {
                if(snapshot.exists){
                    doc_ref.delete();
                    ref.update({
                        dislike_count: firebase.firestore.FieldValue.increment(-1)
                    }).then(updateDislikes).then(this.updateRating);
                }else{
                    doc_ref.set({ disliked: true})
                    ref.update({
                        dislike_count: firebase.firestore.FieldValue.increment(1)
                    }).then(updateDislikes).then(this.updateRating);
                }
            })
        }
    }
    render() {
        return (<>
                <Modal
                open={this.state.delete}
                onClose={this.handleDeleteClose}
                aria-labelledby="modal-title"
                >
                    <div className={styles.paper}>
                        <h1 id="modal-title">Are you sure you want to delete this post?</h1>
                        <p style={{margin: '1.5rem'}}>Warning: this action cannot be undone</p>
                        <div className={styles.modalButtons}>
                            <Button variant="contained" color="secondary" className={styles.marginRight} onClick={this.handleDeleteClose}>close</Button>
                            <Button variant="contained" color="primary" onClick={this.handleDelete}>confirm</Button>
                        </div>
                    </div>
                </Modal>
                <Menu
                    id="post-menu"
                    style={{top: '40px'}}
                    anchorEl={this.state.menuOpen}
                    keepMounted
                    open={!!this.state.menuOpen}
                    onClose={() => this.setState({menuOpen: null})}>
                    <MenuItem>Edit</MenuItem>
                    <MenuItem onClick={()=>{this.setState({delete: true})}}>Delete</MenuItem>
                </Menu>
                <div className={styles.card}>
                    <div id="profile" className={styles.profile}>
                        <img style={{backgroundColor: this.state.anonymous?.color, cursor:(this.props.user_id?'pointer':'default')}} src={this.state.userInfo?.photo || this.state.anonymous?.image || BlankProfile} className = {styles.profileImage} alt="profile" onClick={()=>{if (this.props.user_id) window.location.href=`/profile/${this.props.user_id}`}}/> 
                        <div className={styles.profileInfo}>
                            <h2 style={{fontFamily:'roboto', color: '#5A5353'}}>{this.state.userInfo?.name || this.state.anonymous?.name || 'No name'}</h2>
                            <p style={{fontFamily:'roboto', color: '#D8D8D8'}}>{this.state.userInfo?.username || this.state.userInfo?.email || this.state.anonymous?.username}</p>
                        </div>
                        <div style={{marginLeft:'auto', marginRight:'15px'}}>{firebase.auth().currentUser?.uid === this.props.user_id ?<IconButton onClick={(event) => this.setState({menuOpen: event.currentTarget})}><MoreHorizIcon className={styles.iconBlack}/></IconButton>:<></>}</div>
                    </div> 
                    <div className={styles.postText}>
                        {this.props.text_content}
                        {this.props.poll_question&&this.props.poll_options&&<Polls poll_options={this.props.poll_options} poll_question={this.props.poll_question} post={this.props.doc}/>}
                        {this.props.image_url?<img className={styles.postImage} src={this.props.image_url} alt="post content"/>:<></>}
                    </div>
                    <div className={styles.buttons}>
                    {!this.props.disableComment && (this.props.commentActive?
                    <IconButton>
                        <FontAwesomeIcon icon={faCommentDots}  className={styles.send}/>
                    </IconButton>
                    :<Link to={`/comments/${this.props.doc.id}`}>
                    <IconButton>
                        <FontAwesomeIcon icon={faCommentDots}  className={styles.iconBlack}/>
                    </IconButton>
                    </Link>)}
                    <div className={styles.likes}>
                        <p className={styles.likeNumber}>{this.state.likes}</p>
                        <IconButton onClick={this.handleLike}>
                        {this.state.liked?<ThumbUpIcon className={styles.send}/>:<ThumbUpOutlinedIcon className={styles.iconBlack}/>}
                        </IconButton>
                    </div>
                    <div className={styles.likes}>
                        <p className={styles.likeNumber}>{this.state.dislikes}</p>
                        <IconButton onClick={this.handleDislike}>
                        {this.state.disliked?<ThumbDownIcon className={styles.send}/>:<ThumbDownOutlinedIcon className={styles.iconBlack}/>}
                        </IconButton>
                    </div>
                    </div>
                </div>
            </>)
    }
}

interface PollProps{
    poll_question: string,
    poll_options: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    post: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> 
}
interface PollState{
    options: PollOption[],
    selectedOption: string,
    submitted: boolean,
    counts: number[]
}

interface PollOption {
    id: string,
    content: string
}
class Polls extends Component<PollProps,PollState>{
    constructor(props: PollProps){
        super(props);
        this.state = {
            options: [],
            selectedOption: '',
            submitted: false,
            counts: []
        }
        this.fetchSelectedOption();
        this.fetchCounts();
        this.fetchOptions();
    }
    fetchSelectedOption = () =>{
        const user = firebase.auth().currentUser;
        if(user){
            this.props.poll_options.get().then((snapshot) => {
                if(!snapshot.empty){
                    snapshot.docs.forEach(doc => {
                        doc.ref.collection('responses').doc(user.uid).get()
                        .then((snapshot)=>{
                            console.log(doc)
                            if(snapshot.exists){
                                this.setState({selectedOption: doc.id, submitted: true});
                                console.log(doc.id);
                        }
                    })
                    })
                }
            })
        }
    }
    
    fetchCounts = async () => {
            await this.setState({counts: []});
            this.props.poll_options.get().then((snapshot) => {
                if(!snapshot.empty){
                    for(const data of snapshot.docs){
                        data.ref.collection('responses').get().then((snapshot) => {
                            var count = this.state.counts;
                            count.push(snapshot.docs.length);
                            this.setState({counts: count});
                        });
                    }
                }
            })
    }
    submitPoll = async () => {
        const user = firebase.auth().currentUser;
       this.props.poll_options.get().then((snapshot) => {
            if(!snapshot.empty)
                snapshot.docs.forEach(data => {
                    if(data.exists && user){
                        data.ref.collection('responses').doc(user.uid).delete();
                    }
                })
        }).then(()=>{
            if(user)
                this.props.poll_options.doc(this.state.selectedOption).collection('responses').doc(user.uid).set({response: true});
        }).then(()=>{this.setState({submitted: true}); this.fetchCounts()}).catch((err) => {
            console.log(err);
        })

    }

    fetchOptions = () => {
        this.props.poll_options.onSnapshot(snapshot => {
            if(!snapshot.empty){
                this.setState({options: snapshot.docs.map(d => ({
                    id: d.id,
                    content: d.get('option_text')
                }) as PollOption)})
            } 
         });
    }

    render(){
        return (<>
            <div className={styles.pollHeader}>
                <h1 style={{flexGrow:1}}><PollIcon/>{this.props.poll_question}</h1>
                {(this.state.selectedOption&&!this.state.submitted)?<IconButton onClick={this.submitPoll} className={styles.pollSubmit}>
                    <SendIcon/>
                </IconButton>
                :<IconButton onClick={()=>this.setState({submitted: false})}>
                    <ArrowBackIosIcon />
                </IconButton>}
            </div>
            <div className={this.state.submitted?styles.pollCompleted:styles.pollOptions}>
            {this.state.submitted?
                <div>
                    {this.state.counts.reduce((p,c)=>p+c,0)>0&&this.state.options.map((data, idx) => (
                        <div key={idx} style={{display:'flex'}}>
                            <p className={this.state.selectedOption===data.id?styles.selectedOption:styles.pollOptionCompleted} style={this.state.counts[idx]===0?{backgroundColor:'white'}:{width:`${(this.state.counts[idx]/this.state.counts.reduce((p,c)=>p+c,0) * 100).toFixed(2)}%`}}>{data.content}</p><p style={{marginLeft:"1rem"}}>{`${(this.state.counts[idx]/this.state.counts.reduce((p,c)=>p+c,0) * 100).toFixed(2)}%`}</p>
                        </div>
                    ))}
                    <p style={{marginTop:'1rem'}}>{this.state.counts.reduce((p,c)=>p+c,0)} responses</p>
                </div>
                :<RadioGroup aria-label="poll" name="userpoll" value={this.state.selectedOption} onChange={e=>this.setState({selectedOption:e.currentTarget.value})}>
            {this.state.options.map((data, idx) => (
                <div key={idx} className={styles.pollOption}>
                   <FormControlLabel value={data.id} control={<Radio color="default" />} label={data.content} />
                </div>))}
            </RadioGroup>}
            </div>
        </>)
    }
}

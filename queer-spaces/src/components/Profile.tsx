import React, { Component } from 'react'
import { firebase , usersRef, usernameRef, storageRef, PostContext} from './'
import { RouteComponentProps } from 'react-router'
import { IconButton, Modal, Button, TextField } from '@material-ui/core'
import { v4 as uuid} from 'uuid'

import styles from '../css/profile.module.css'
import BlankProfile from '../res/bp.png'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import ChatIcon from '@material-ui/icons/Chat'

interface MatchParams {
    id: string;
}
interface ProfileProps extends RouteComponentProps<MatchParams> {

}

interface ProfileState {
    user: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData> | null,
    username: string,
    data: Array<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>>,
    openEditBanner: boolean,
    openProfileEdit: boolean,
    bannerURL: string,
    bannerError: string,
    bioText: string,
    displayName: string,
    profileURL: string,
    followers: number,
    following: number,
    isFollowing: boolean
}

export default class Profile extends Component<ProfileProps, ProfileState>{
    fileUpload: HTMLInputElement | null;
    profileUpload: HTMLInputElement | null;

    constructor(props: ProfileProps){
        super(props);
        this.state = {
            user: null,
            username: 'No username',
            data: [],
            openEditBanner: false,
            openProfileEdit: false,
            bannerURL: '',
            bannerError: '',
            bioText: '',
            displayName: '',
            profileURL: '',
            followers: 0,
            following: 0,
            isFollowing: false
        }
        this.fetchUser().then(this.fetchPosts);
        this.fileUpload = null;
        this.profileUpload = null;
    }

    fetchUser = async () => {
        //grab user info
     const user = firebase.auth().currentUser;
        usersRef.doc(this.props.match.params.id).get().then(async (snapshot) => {
            if(snapshot.exists){
                this.setState({user:snapshot, displayName: snapshot.get('name'), bioText: snapshot.get('bio')||'',followers: await snapshot.ref.collection('followers').get().then((snapshot) => snapshot.docs.length), following: await snapshot.ref.collection('following').get().then((snapshot) => snapshot.docs.length)});
                if(user)
                snapshot.ref.collection('followers').doc(user.uid).onSnapshot((snap) => {
                    this.setState({isFollowing: snap.exists});
                })
            }
    });
    
        //grab user name

        usernameRef.where('uid', '==', this.props.match.params.id).get().then((snapshot) => {
            if(!snapshot.empty){
                snapshot.forEach((doc) => {
                    this.setState({username: `@${doc.id}`});
                })
            }
        });
    }
    fetchPosts = async () => {
        firebase.firestore().collection('Posts').where('user_id', '==',this.props.match.params.id).onSnapshot((snapshot) =>{
                this.setState({data: snapshot.docs});
        })
    }
    handleBannerURL = (event: React.FormEvent<HTMLFormElement> | void) => {
        if(event)
            event.preventDefault();
        usersRef.doc(this.props.match.params.id).set({
            banner: this.state.bannerURL
        }, {merge: true}).then(()=>this.setState({bannerError: '', openEditBanner: false})).then(this.fetchUser).catch((err: firebase.firestore.FirestoreError) => this.setState({bannerError: err.message}))
    }

    handleUploadButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        this.fileUpload?.click();
    }

    handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        var files = event.target.files;
        if(files){
            var file = files[0];
            var storage = storageRef.child(`banner-images/${uuid()}-${file.name}`);
            storage.put(file).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
                snapshot.ref.getDownloadURL().then((downloadURL) => {
                    this.setState({bannerURL: downloadURL as string});
                }).then(this.handleBannerURL);
            });
        }
        
    }
    handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) =>{
        this.setState({profileURL:'loading...'});
        var files = event.target.files;
        if(files){
            var file = files[0];
            var storage = storageRef.child(`profile-images/${uuid()}-${file.name}`);
            storage.put(file).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
                snapshot.ref.getDownloadURL().then((downloadURL) => {
                    this.setState({profileURL: downloadURL as string});
                });
            });
        }
    }

    handleProfileButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        event.preventDefault();
        this.profileUpload?.click();
    }
    
    handleUpdateProfile = () => {
        usersRef.doc(this.props.match.params.id).set({
            name: this.state.displayName,
            bio: this.state.bioText,
            photo: this.state.profileURL || this.state.user?.get('photo')
        }, {merge: true}).then(this.fetchUser).then(()=>this.setState({openProfileEdit: false})).catch((err)=>{console.log(err)})
    }

    handleFollowUser = () => {
        const user = firebase.auth().currentUser;
        if(user)
        firebase.firestore().runTransaction( async (transaction) => {
         var PromiseFollowing = usersRef.doc(user.uid).collection('following').doc(this.state.user?.id).get().then((snap) => {
                //unfollow
                if(snap.exists){
                    transaction.delete(snap.ref);
                }
                //follow
                else{
                    transaction.set(snap.ref, {
                        following: true
                    })
                }

            }).then(()=>usersRef.doc(this.state.user?.id).collection('followers').doc(user.uid).get().then((snapshot) => {
                    //unfollow
                    if(snapshot.exists)
                        transaction.delete(snapshot.ref);
                    //follow
                    else{
                        console.log("following")
                        transaction.set(snapshot.ref, {follower: true});
                    }
                }));
              return PromiseFollowing;
            }).then(this.fetchUser).catch(err=>console.log(err));
    }

    handleChat = () => {
        const user = firebase.auth().currentUser;
        if(user){
            var messageRef = firebase.firestore().collection('Messages');
            messageRef.where('user1', '==', user.uid ).where('user2', '==', this.state.user?.id).onSnapshot(async (snapshot) => {
                if(snapshot.empty){
                    await messageRef.where('user1', '==', this.state.user?.id).where('user2', '==', user.uid).onSnapshot((snap) =>{
                        if(!snap.empty)
                            console.log(snap.docs);
                        console.log(messageRef.add({
                            created: firebase.firestore.Timestamp.now(),
                            user1: user.uid,
                            user2: this.state.user?.id
                        }));
                    })
                }else
                    console.log(snapshot.docs);

            })
    }
}

    render() {
        return (
            <>
            <Modal aria-labelledby="modal-title"
                open={this.state.openEditBanner}
                onClose={()=>this.setState({openEditBanner: false})}>
                    <div className={styles.modal}>
                        <h1 id="modal-title">Upload New Banner</h1>
                        {this.state.bannerError}
                        <input ref={input => this.fileUpload = input} type="file" style={{display: 'none'}} onChange={this.handleFileUpload} accept="image/*"/>
                        <Button className={styles.button} onClick={this.handleUploadButton}>upload</Button>
                        <hr className={styles.hr} data-content="or"/>
                        <form onSubmit={this.handleBannerURL}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="banner-url"
                            label="Image url for banner"
                            name="bannerURL"
                            autoComplete="bannerURL"
                            autoFocus
                            onChange={e=>this.setState({bannerURL: e.currentTarget.value})}
                             /> 
                        </form>
                    </div>
            </Modal>
            <Modal aria-labelledby="title"
                open={this.state.openProfileEdit}
                onClose={()=>this.setState({openProfileEdit: false})}>
                    <div className={styles.modal}>
                        <h1 id="title">Edit your Profile</h1>
                        <div style={{textAlign:'left', marginLeft:'3rem'}}>
                            <h3>Display Name:</h3>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    id="display-name"
                                    name="displayName"
                                    autoComplete="displayName"
                                    defaultValue={this.state.user?.get('name')}
                                    onChange={e=>this.setState({displayName: e.currentTarget.value})} />
                            <h3>Bio:</h3>
                            <TextField
                                    variant="outlined"
                                    margin="normal"
                                    id="bio-update"
                                    name="bio"
                                    autoComplete="bio"
                                    multiline
                                    fullWidth
                                    rows={4}
                                    rowsMax={4}
                                    inputProps={{ maxLength: 250 }}
                                    defaultValue={this.state.user?.get('bio')||''}
                                    onChange={e=>this.setState({bioText: e.currentTarget.value})} />
                            <div className={`${styles.characterCount} ${(this.state.bioText.length > 200)?styles.danger:(this.state.bioText.length > 100)?styles.warning:''}`}>{this.state.bioText.length}/250 characters</div>
                            {firebase.auth().currentUser?.providerData[0]?.providerId ==='password'&&<div>
                                <input ref={input => this.profileUpload = input} type="file" style={{display: 'none'}} onChange={this.handleProfileImageUpload} accept="image/*"/>
                                <h3 style={{marginTop:'15px'}}>Profile Image</h3>
                                <Button style={{marginLeft:'25%'}} className={styles.button} onClick={this.handleProfileButton}>upload</Button>
                                <hr className={styles.hr} data-content="or"/>
                                <TextField
                                variant="outlined"
                                margin="normal"
                                id="profile-url"
                                label="Profile Image URL"
                                name="profileURL"
                                autoComplete="profileURL"
                                value={this.state.profileURL}
                                onChange={e=>this.setState({profileURL: e.currentTarget.value})}
                                style={{display:'flex',marginLeft:'25%',width:"50%"}} /> 
                            </div>}
                            <Button style={{width:'25%', float:'left'}} className={styles.button} onClick={this.handleUpdateProfile}>Save Changes</Button>
                        </div>
                    </div>
                </Modal>
            <div className={styles.profileCard}>
                <div className={styles.header} style={{backgroundColor:'#F8E4F6', backgroundImage:(this.state.user?.get('banner')&&`url(${this.state.user?.get('banner')})`),backgroundSize:'cover', backgroundPosition:'center'}}>
                    {this.state.user?.id===firebase.auth().currentUser?.uid&&
                        <IconButton className={styles.editBanner} onClick={()=>this.setState({openEditBanner: true})}>
                            <MoreVertIcon />
                        </IconButton>}
                    <img className={styles.profilePicture} src={this.state.user?.get('photo') || BlankProfile} alt="profile"/>
                </div>
                <div className={styles.profileInformation}>
                    <h2 style={{color: '#5A5353'}}>{this.state.user?.get('name')  || 'No name'} {this.state.user?.id===firebase.auth().currentUser?.uid&&<IconButton onClick={()=>this.setState({openProfileEdit: true})}><EditIcon/></IconButton>}</h2>
                    <p style={{color: '#D8D8D8', marginBottom:'15px'}}>{this.state.username|| this.state.user?.get('email')|| "No username for this user"}</p>
                    <p>{this.state.user?.get('bio') || 'No bio for this user'}</p>
                </div>
                <div className={styles.followSection}>
                    {this.state.user?.id!==firebase.auth().currentUser?.uid&&<><IconButton onClick={this.handleChat}><ChatIcon/></IconButton><Button className={styles.followButton} onClick={this.handleFollowUser}>{this.state.isFollowing?'Unfollow':'Follow'}</Button></>}
                    <p>{this.state.followers} followers</p>
                    <p>following {this.state.following}</p>
                </div>
            </div>
            {this.state.data.length > 0 ?<PostContext data={this.state.data} />: <p style={{fontFamily:'Roboto', color:'black', textAlign:'center', marginTop:'3rem'}}>No posts from this user</p>}
            </>
        )
    }
}

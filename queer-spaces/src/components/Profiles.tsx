import React, { Component, useEffect, useState } from 'react'
import { OutlinedInput, InputAdornment, Button } from '@material-ui/core'
import { firebase, usersRef, usernameRef } from './'
import { User } from '../interfaces/User'
import { Link } from 'react-router-dom'

import styles from '../css/profiles.module.css'
import SearchIcon from '@material-ui/icons/Search'
import BlankProfile from '../res/bp.png'

interface ProfilesState {
    searchQuery: string,
    documentSnapshots: Array<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>>,
    filteredSnapshots: Array<ProfileCardProps>
}
export default class Profiles extends Component<{}, ProfilesState> {
    constructor(props: {}){
        super(props);
        this.state = {
            searchQuery: '',
            documentSnapshots: [],
            filteredSnapshots: [],
        }
        this.populateProfiles();
    }
    populateProfiles = () => {
        usersRef.onSnapshot( async (snapshot) => {
            if(!snapshot.empty){
                await this.setState({documentSnapshots:snapshot.docs});
                this.handleSearch();
            }
        })

    }
    handleSearch = async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | void) => {
        if(event)
            await this.setState({searchQuery: event.currentTarget.value});
        this.setState({filteredSnapshots: this.state.documentSnapshots.map((data) => {
            return ({
                id: data.id,
                ...data.data()
            } as ProfileCardProps)
        }).filter((doc: ProfileCardProps) =>{
            if(this.state.searchQuery){
               return  (Object.values(doc) as string[]).map(e => e&&e.toLowerCase().includes(this.state.searchQuery.toLowerCase())).reduceRight((p,c)=>p||c);
            }else
                return true;
        })})
    }
    render() {
        return (
            <div className={styles.profilesArea}>
                <h1>Search Users</h1>
                <OutlinedInput
                    id="user-search"
                    style={{width:'50%'}}
                    value={this.state.searchQuery}
                    onChange={this.handleSearch}
                    startAdornment={
                    <InputAdornment position="start">
                        <SearchIcon/>
                    </InputAdornment>
                    }/>
                <div style={{display:'flex', flexWrap:'wrap'}}>
                {this.state.filteredSnapshots.map((data, idx) => {
                    return (<ProfileCard key={idx} {...data} />)
                })}
                </div>
            </div>
        )
    }
}

interface ProfileCardProps extends Partial<User>{
    id: string
}
const ProfileCard = (props: ProfileCardProps) => {
    const [username, setUsername] = useState<string>('');
    const [isFollowing, setFollowing] = useState<boolean>(false);
    const [followedBy, setFollowedBy] = useState<boolean>(false);

    useEffect(() => {
        fetchUsername(props.id);
        fetchFollow(props.id);
    },[props.id]);

    const fetchUsername = (id: string) => {
        if(id)
        usernameRef.where('uid', '==', id).onSnapshot((snapshot) => {
            if(!snapshot.empty)
                setUsername(snapshot.docs[0].id)
        })
    }
    const fetchFollow = (id: string) =>{
        const user = firebase.auth().currentUser;
        if(id&&user){
            usersRef.doc(user.uid).get().then((snapshot) => {
                if(snapshot.exists){
                    snapshot.ref.collection('following').doc(id).get().then(snap => {console.log(snap);setFollowing(snap.exists)}).then(() => {
                        snapshot.ref.collection('followers').doc(id).get().then((snap) =>{
                            setFollowedBy(snap.exists);
                        })
                    })
                }
            })
        }
    }

    return (<>
        <div className={styles.card}>
            <div>
                <img src={props.photo || BlankProfile} className={styles.profileImage} alt="user profile"/>
                <h1>{props.name ||  "No display name"}</h1>
                {username&&<p>@{username}</p>}
                {props.bio&&<p style={{margin:'15px'}}>Bio:{props.bio}</p>}
                <div style={{margin:'15px', backgroundColor:'rgba(196, 196, 196, 0.5)', textAlign:'center'}}>{(isFollowing&&followedBy)?'Friends'
                    :<>
                        {isFollowing&&'Following'}
                        {followedBy&&'Follows you'}
                    </>}</div>
            </div>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            <Link to={`/profile/${props.id}`} className={styles.link}>
                <Button className={styles.profileButton}>View profile</Button>
            </Link>
            </div>
        </div>
    </>)
}
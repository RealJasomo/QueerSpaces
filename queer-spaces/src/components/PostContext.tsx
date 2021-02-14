import React, { Component } from 'react'
import {Post, firebase} from './'
import { TextField } from '@material-ui/core'
import { categories } from '../util/Constants'
import Autocomplete from '@material-ui/lab/Autocomplete'
import styles from '../css/postcontext.module.css'
interface PostContextState {
    ref: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    documentSnapshot: Array<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>>,
    category: string | null,
}
interface PostContextProps{
    data?: Array<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>>
}
 class PostContext extends Component<PostContextProps, PostContextState> {
    
    constructor(props: PostContextProps){
        super(props);
        this.state = {
            documentSnapshot:[],
            ref:firebase.firestore().collection('Posts'),
            category: ''
        }
    }
    componentDidMount(){
        this.state.ref
        .orderBy('created', 'desc').onSnapshot((snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) =>{
            this.setState({documentSnapshot: snapshot.docs});
        });
    }
    render() {
        var docsToUse = this.props.data || this.state.documentSnapshot;
        return (
            <div>
                 <Autocomplete
                id="category-selector"
                className={styles.category}
                options={categories}
                renderInput={(params) => <TextField {...params} label="Category" />}
                onChange={(_, val: string | null)=>this.setState({category: val})}
                />
                {docsToUse.filter(doc => this.state.category?(this.state.category === doc.get('category')):true).map((doc) => {
                     return <Post doc={doc} category={doc.get('category')} text_content={doc.get('text_content')} poll_question={doc.get('poll_question')} poll_options={doc.get('poll_options')} image_url={doc.get('image_url')} user_id={doc.get('user_id')} created={doc.get('created')} key={doc.id} />
                })}
            </div>
        )
    }
}

export default React.memo(PostContext)